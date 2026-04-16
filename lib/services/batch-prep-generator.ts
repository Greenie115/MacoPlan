import { anthropicService } from './anthropic'
import { BATCH_PREP_SYSTEM_PROMPT, buildUserPrompt } from './batch-prep-prompts'
import { checkMacroAccuracy } from './batch-prep-accuracy'
import { logUsage } from './anthropic-usage-log'
import {
  BatchPrepPlanSchema,
  BatchPrepValidationError,
  type BatchPrepPlan,
  type TrainingProfile,
  type DietaryPreferences,
} from '@/lib/types/batch-prep'

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 16000

function extractTextContent(response: { content: Array<{ type: string; text?: string }> }): string {
  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock?.text) {
    throw new BatchPrepValidationError('No text content in Claude response')
  }
  return textBlock.text
}

function extractJsonBlock(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    throw new BatchPrepValidationError(
      `Failed to parse JSON from Claude response: ${(err as Error).message}`,
      err
    )
  }
}

async function callAndValidate(
  userId: string | null,
  profile: TrainingProfile,
  preferences: DietaryPreferences,
  correctionHint: string | null
): Promise<{ plan: BatchPrepPlan; accuracy: ReturnType<typeof checkMacroAccuracy> }> {
  const userPrompt = correctionHint
    ? buildUserPrompt(profile, preferences) +
      `\n\nIMPORTANT: Your previous attempt had this problem: ${correctionHint}. Regenerate with the macros strictly within 5% of the targets.`
    : buildUserPrompt(profile, preferences)

  const response = await anthropicService.generate({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: 'adaptive' },
    system: BATCH_PREP_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  } as Parameters<typeof anthropicService.generate>[0])

  const usage = (response as any).usage ?? { input_tokens: 0, output_tokens: 0 }

  const text = extractTextContent(response as any)
  const json = extractJsonBlock(text)

  let validated: BatchPrepPlan
  try {
    validated = BatchPrepPlanSchema.parse(json)
  } catch (err) {
    await logUsage(userId, 'batch-prep-generate', usage, 'validation_fail', (err as Error).message)
    throw new BatchPrepValidationError(
      `Claude response failed Zod validation: ${(err as Error).message}`,
      err
    )
  }

  const accuracy = checkMacroAccuracy(validated, profile)
  return { plan: validated, accuracy }
}

export async function generateBatchPrepPlan(
  userId: string | null,
  profile: TrainingProfile,
  preferences: DietaryPreferences
): Promise<BatchPrepPlan> {
  // First attempt
  const firstAttempt = await callAndValidate(userId, profile, preferences, null)
  if (firstAttempt.accuracy.passed) {
    await logUsage(userId, 'batch-prep-generate', { input_tokens: 0, output_tokens: 0 }, 'success')
    return firstAttempt.plan
  }

  // Retry once with correction
  await logUsage(userId, 'batch-prep-generate', { input_tokens: 0, output_tokens: 0 }, 'retry', firstAttempt.accuracy.reason)
  const retryAttempt = await callAndValidate(
    userId,
    profile,
    preferences,
    firstAttempt.accuracy.reason || 'macros were off target'
  )
  if (!retryAttempt.accuracy.passed) {
    await logUsage(userId, 'batch-prep-generate', { input_tokens: 0, output_tokens: 0 }, 'error', retryAttempt.accuracy.reason)
    throw new BatchPrepValidationError(
      `Macro accuracy check failed after retry: ${retryAttempt.accuracy.reason}`
    )
  }

  await logUsage(userId, 'batch-prep-generate', { input_tokens: 0, output_tokens: 0 }, 'success')
  return retryAttempt.plan
}
