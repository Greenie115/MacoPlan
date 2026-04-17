// @vitest-environment node
/**
 * Live API integration test for batch-prep.
 *
 * Skipped by default. Runs when:
 *   1. ANTHROPIC_API_KEY is set in .env.local (main repo) with a real sk-ant-... key
 *   2. RUN_LIVE_BATCH_PREP=1 is passed when invoking vitest
 *
 * Run with:
 *   RUN_LIVE_BATCH_PREP=1 npx vitest run __tests__/batch-prep/live-api.test.ts --reporter=verbose
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Load real .env.local from the main repo BEFORE importing the generator,
// so the vitest.setup.ts fake key is overwritten with the real one.
function loadRealEnv(): { loaded: boolean; source?: string } {
  const candidates = [
    resolve(__dirname, '../../.env.local'),
    resolve(__dirname, '../../../../../../.env.local'),
    'C:\\Users\\danie\\Documents\\01 Projects\\MacoPlan\\maco-plan\\.env.local',
  ]
  for (const path of candidates) {
    try {
      const content = readFileSync(path, 'utf8')
      const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m)
      if (match && match[1].startsWith('sk-ant-')) {
        process.env.ANTHROPIC_API_KEY = match[1].trim()
        return { loaded: true, source: path }
      }
    } catch {
      // file not readable — try next
    }
  }
  return { loaded: false }
}

const envResult = loadRealEnv()
const shouldRun =
  process.env.RUN_LIVE_BATCH_PREP === '1' &&
  envResult.loaded &&
  (process.env.ANTHROPIC_API_KEY ?? '').startsWith('sk-ant-')

// Enable raw-response debug logging for this test run
process.env.BATCH_PREP_DEBUG = '1'

describe.skipIf(!shouldRun)('batch-prep live API', () => {
  it('generates a plan from Claude with tag-format output', async () => {
    console.log(`[live-test] loaded env from: ${envResult.source}`)

    // Import AFTER env is set so the singleton picks up the real key
    const { generateBatchPrepPlan } = await import('@/lib/services/batch-prep-generator')

    const profile = {
      training_days_per_week: 5 as const,
      training_day_macros: { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
      rest_day_macros: { calories: 2300, protein_g: 180, carbs_g: 220, fat_g: 70 },
      prep_day: 'sunday' as const,
      containers_per_week: 10,
      max_prep_time_mins: 120,
    }

    const preferences = { exclusions: [] }

    const started = Date.now()
    const plan = await generateBatchPrepPlan(null, profile, preferences)
    const elapsed = Date.now() - started

    console.log(`[live-test] generation took ${elapsed}ms`)
    console.log('[live-test] training_day totals:', plan.training_day.daily_totals)
    console.log('[live-test] rest_day totals:', plan.rest_day.daily_totals)
    console.log(
      '[live-test] meals:',
      plan.training_day.meals.map((m) => `${m.meal_slot}: ${m.name}`)
    )
    console.log('[live-test] total_containers:', plan.total_containers)
    console.log('[live-test] prep_timeline steps:', plan.prep_timeline.length)
    console.log('[live-test] shopping_list items:', plan.shopping_list.length)

    // Macro accuracy report (informational — generator already picks best attempt)
    const td = plan.training_day.daily_totals
    const tTarget = profile.training_day_macros
    const deviation = (a: number, t: number) => ((a - t) / t) * 100
    console.log(
      '[live-test] training deviation: ' +
        `cal=${deviation(td.calories, tTarget.calories).toFixed(1)}% ` +
        `p=${deviation(td.protein_g, tTarget.protein_g).toFixed(1)}% ` +
        `c=${deviation(td.carbs_g, tTarget.carbs_g).toFixed(1)}% ` +
        `f=${deviation(td.fat_g, tTarget.fat_g).toFixed(1)}%`
    )

    expect(plan.training_day.meals.length).toBeGreaterThanOrEqual(2)
    expect(plan.rest_day.meals.length).toBeGreaterThanOrEqual(2)
    expect(plan.prep_timeline.length).toBeGreaterThanOrEqual(3)
    expect(plan.shopping_list.length).toBeGreaterThanOrEqual(3)
    expect(plan.total_containers).toBeGreaterThan(0)
  }, 120_000) // up to 2 min — Claude can be slow
})

if (!shouldRun) {
  const reason = !envResult.loaded
    ? 'no real ANTHROPIC_API_KEY found in .env.local'
    : process.env.RUN_LIVE_BATCH_PREP !== '1'
      ? 'RUN_LIVE_BATCH_PREP=1 not set'
      : 'key does not look valid'
  console.log(`[live-test] SKIPPED: ${reason}`)
}
