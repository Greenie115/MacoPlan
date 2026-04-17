import { anthropicService } from './anthropic'
import { BATCH_PREP_SYSTEM_PROMPT, buildUserPrompt } from './batch-prep-prompts'
import { parseBatchPrepPlan } from './batch-prep-parser'
import { checkMacroAccuracy } from './batch-prep-accuracy'
import { logUsage } from './anthropic-usage-log'
import {
  BatchPrepValidationError,
  type BatchPrepPlan,
  type TrainingProfile,
  type DietaryPreferences,
} from '@/lib/types/batch-prep'

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 8000

const DEBUG = process.env.BATCH_PREP_DEBUG === '1'

type AnthropicResponse = {
  content: Array<{ type: string; text?: string }>
  usage?: { input_tokens: number; output_tokens: number }
  stop_reason?: string
}

function extractTextContent(response: AnthropicResponse): string {
  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock?.text) {
    throw new BatchPrepValidationError('No text content in Claude response')
  }
  return textBlock.text
}

function logRaw(
  label: string,
  text: string,
  usage: { input_tokens: number; output_tokens: number },
  stopReason: string | undefined
) {
  if (!DEBUG) return
  // Full raw body — dev-only. Prefix each line so it's greppable.
  const header = `[batch-prep:${label}] usage=${usage.input_tokens}/${usage.output_tokens} stop=${stopReason ?? 'unknown'} bytes=${text.length}`
  console.log(header)
  console.log(`[batch-prep:${label}:raw-start]`)
  console.log(text)
  console.log(`[batch-prep:${label}:raw-end]`)
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

  const response = (await anthropicService.generate({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: BATCH_PREP_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })) as unknown as AnthropicResponse

  const usage = response.usage ?? { input_tokens: 0, output_tokens: 0 }
  const stopReason = response.stop_reason

  const text = extractTextContent(response)
  logRaw(correctionHint ? 'retry' : 'first', text, usage, stopReason)

  let plan: BatchPrepPlan
  try {
    plan = parseBatchPrepPlan(text)
  } catch (err) {
    // Always log the raw response on parse failure so we can diagnose.
    console.error(
      `[batch-prep] parse failed: ${(err as Error).message}\n` +
        `[batch-prep] stop_reason=${stopReason} usage=${usage.input_tokens}/${usage.output_tokens}\n` +
        `[batch-prep] raw response (${text.length} bytes):\n${text}`
    )
    await logUsage(userId, 'batch-prep-generate', usage, 'validation_fail', (err as Error).message)
    throw err instanceof BatchPrepValidationError
      ? err
      : new BatchPrepValidationError(`Parser error: ${(err as Error).message}`, err)
  }

  const accuracy = checkMacroAccuracy(plan, profile)
  return { plan, accuracy }
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

  // Retry once with correction hint
  await logUsage(userId, 'batch-prep-generate', { input_tokens: 0, output_tokens: 0 }, 'retry', firstAttempt.accuracy.reason)
  const retryAttempt = await callAndValidate(
    userId,
    profile,
    preferences,
    firstAttempt.accuracy.reason || 'macros were off target'
  )

  // Return the better of the two attempts — never hard-fail on macro accuracy.
  // LLMs cannot reliably hit exact macro targets, so we pick whichever attempt
  // was closer and let the user see the actual macros in the UI.
  if (retryAttempt.accuracy.passed) {
    await logUsage(userId, 'batch-prep-generate', { input_tokens: 0, output_tokens: 0 }, 'success')
    return retryAttempt.plan
  }

  // Both missed — return the attempt with fewer failures
  const firstFailCount = firstAttempt.accuracy.reason?.split(';').length ?? 0
  const retryFailCount = retryAttempt.accuracy.reason?.split(';').length ?? 0
  const best = retryFailCount <= firstFailCount ? retryAttempt : firstAttempt
  await logUsage(userId, 'batch-prep-generate', { input_tokens: 0, output_tokens: 0 }, 'success', `approx: ${best.accuracy.reason}`)
  return best.plan
}
