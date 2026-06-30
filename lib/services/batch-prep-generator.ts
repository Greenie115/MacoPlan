import { chatCompletion, extractContent } from './openrouter'
import {
  BATCH_PREP_SYSTEM_PROMPT,
  buildUserPrompt,
  pickCuisines,
  type VarietyOptions,
} from './batch-prep-prompts'
import { parseBatchPrepPlan } from './batch-prep-parser'
import { checkMacroAccuracy } from './batch-prep-accuracy'
import { logUsage } from './anthropic-usage-log'
import {
  BatchPrepValidationError,
  type BatchPrepPlan,
  type TrainingProfile,
  type DietaryPreferences,
} from '@/lib/types/batch-prep'

// Cheap GLM via OpenRouter instead of Claude Sonnet. Not Flash — assembling a
// macro-verified plan in the strict XML format needs real capability.
const MODEL = process.env.BATCH_PREP_MODEL || 'z-ai/glm-4.7'
// GLM 4.7 is a reasoning model; even with reasoning disabled it can spend tokens
// thinking before emitting the plan. 8000 (the old Claude budget) truncated the
// XML mid-output, which the parser can't recover from. Give it real headroom.
const MAX_TOKENS = 16000

const DEBUG = process.env.BATCH_PREP_DEBUG === '1'

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
  variety: VarietyOptions,
  correctionHint: string | null
): Promise<{
  plan: BatchPrepPlan
  accuracy: ReturnType<typeof checkMacroAccuracy>
  usage: { input_tokens: number; output_tokens: number }
}> {
  const userPrompt = correctionHint
    ? buildUserPrompt(profile, preferences, variety) +
      `\n\nIMPORTANT: Your previous attempt had this problem: ${correctionHint}. Regenerate with the macros strictly within 5% of the targets.`
    : buildUserPrompt(profile, preferences, variety)

  const response = await chatCompletion(
    [
      { role: 'system', content: BATCH_PREP_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    { model: MODEL, maxTokens: MAX_TOKENS, temperature: 0.7, reasoning: { enabled: false } }
  )

  const u = response.usage ?? { prompt_tokens: 0, completion_tokens: 0 }
  const usage = { input_tokens: u.prompt_tokens, output_tokens: u.completion_tokens }
  const stopReason = response.choices[0]?.finish_reason

  const text = extractContent(response)
  logRaw(correctionHint ? 'retry' : 'first', text, usage, stopReason)

  if (!text) {
    await logUsage(userId, 'batch-prep-generate', usage, 'validation_fail', 'empty model content')
    throw new BatchPrepValidationError(
      stopReason === 'length'
        ? 'Model returned no plan content before hitting the token limit (likely consumed by reasoning).'
        : 'No text content in model response'
    )
  }
  // A length-stopped response is a truncated plan — the XML will be missing its
  // closing tags, so surface it as a clear, retryable error rather than letting
  // the parser fail with a confusing Zod message.
  if (stopReason === 'length') {
    await logUsage(userId, 'batch-prep-generate', usage, 'validation_fail', 'output truncated (max_tokens)')
    throw new BatchPrepValidationError('Model output was truncated before the plan was complete (hit max_tokens).')
  }

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
  return { plan, accuracy, usage }
}

// Call the model and, if the output can't be parsed/validated (a truncated or
// malformed plan — the most common transient failure when an LLM slips the
// strict tag format), try once more with a hint to re-emit the full plan.
// Macro inaccuracy is NOT a parse failure and is handled separately by the
// caller's best-of-two logic.
async function callWithParseRetry(
  userId: string | null,
  profile: TrainingProfile,
  preferences: DietaryPreferences,
  variety: VarietyOptions,
  correctionHint: string | null
): Promise<Awaited<ReturnType<typeof callAndValidate>>> {
  try {
    return await callAndValidate(userId, profile, preferences, variety, correctionHint)
  } catch (err) {
    if (!(err instanceof BatchPrepValidationError)) throw err
    const hint =
      (correctionHint ? `${correctionHint} ` : '') +
      'Your previous output was incomplete or not in the required format. Output the COMPLETE plan using ONLY the <plan>...</plan> tag format described above — no prose, no markdown, no truncation.'
    return await callAndValidate(userId, profile, preferences, variety, hint)
  }
}

export async function generateBatchPrepPlan(
  userId: string | null,
  profile: TrainingProfile,
  preferences: DietaryPreferences,
  recentRecipeNames: string[] = []
): Promise<BatchPrepPlan> {
  // Sampled once per generation so the macro-correction retry doesn't
  // change flavor direction mid-flight, but successive generations differ.
  const variety: VarietyOptions = {
    cuisines: pickCuisines(3),
    avoidRecipes: recentRecipeNames,
  }

  // First attempt (retries once on its own if the output is unparseable)
  const firstAttempt = await callWithParseRetry(userId, profile, preferences, variety, null)
  if (firstAttempt.accuracy.passed) {
    await logUsage(userId, 'batch-prep-generate', firstAttempt.usage, 'success')
    return firstAttempt.plan
  }

  // Retry once with correction hint. If the correction attempt itself comes
  // back unparseable, don't fail the whole generation — ship the first attempt,
  // which is already a structurally valid plan (just off on macros).
  await logUsage(userId, 'batch-prep-generate', firstAttempt.usage, 'retry', firstAttempt.accuracy.reason)
  let retryAttempt: Awaited<ReturnType<typeof callAndValidate>>
  try {
    retryAttempt = await callWithParseRetry(
      userId,
      profile,
      preferences,
      variety,
      firstAttempt.accuracy.reason || 'macros were off target'
    )
  } catch (err) {
    if (!(err instanceof BatchPrepValidationError)) throw err
    await logUsage(
      userId,
      'batch-prep-generate',
      firstAttempt.usage,
      'success',
      `approx (correction unparseable): ${firstAttempt.accuracy.reason}`
    )
    return firstAttempt.plan
  }

  // Return the better of the two attempts — never hard-fail on macro accuracy.
  // LLMs cannot reliably hit exact macro targets, so we pick whichever attempt
  // was closer and let the user see the actual macros in the UI.
  if (retryAttempt.accuracy.passed) {
    await logUsage(userId, 'batch-prep-generate', retryAttempt.usage, 'success')
    return retryAttempt.plan
  }

  // Both missed — return the attempt with fewer failures
  const firstFailCount = firstAttempt.accuracy.reason?.split(';').length ?? 0
  const retryFailCount = retryAttempt.accuracy.reason?.split(';').length ?? 0
  const best = retryFailCount <= firstFailCount ? retryAttempt : firstAttempt
  await logUsage(userId, 'batch-prep-generate', retryAttempt.usage, 'success', `approx: ${best.accuracy.reason}`)
  return best.plan
}
