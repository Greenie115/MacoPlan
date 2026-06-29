import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import type { BatchPrepPlan, TrainingProfile, DietaryPreferences } from '@/lib/types/batch-prep'
import validPlanFixture from './fixtures/valid-plan.json'

// Mock the OpenRouter client BEFORE importing the generator
vi.mock('@/lib/services/openrouter', () => ({
  chatCompletion: vi.fn(),
  extractContent: (r: { choices?: Array<{ message?: { content?: string } }> }) =>
    r.choices?.[0]?.message?.content ?? '',
}))

// Mock usage log (no-op)
vi.mock('@/lib/services/anthropic-usage-log', () => ({
  logUsage: vi.fn().mockResolvedValue(undefined),
}))

import { chatCompletion } from '@/lib/services/openrouter'
import { generateBatchPrepPlan } from '@/lib/services/batch-prep-generator'

const profile: TrainingProfile = {
  training_days_per_week: 5,
  training_day_macros: { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
  rest_day_macros: { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 },
  prep_day: 'sunday',
  containers_per_week: 10,
  max_prep_time_mins: 120,
}

const prefs: DietaryPreferences = { exclusions: [] }

function planToTags(plan: BatchPrepPlan): string {
  const dayTag = (type: 'training' | 'rest') => {
    const d = type === 'training' ? plan.training_day : plan.rest_day
    const t = d.daily_totals
    const meals = d.meals
      .map((m) => {
        const ings = m.ingredients
          .map(
            (i) =>
              `<ing name="${i.name}" g="${i.quantity_g}" cal="${i.macros.calories}" p="${i.macros.protein_g}" c="${i.macros.carbs_g}" f="${i.macros.fat_g}"/>`
          )
          .join('\n')
        const instrs = m.cooking_instructions.map((s) => `<instr>${s}</instr>`).join('\n')
        const tm = m.total_macros
        return `<meal slot="${m.meal_slot}" equipment="${m.equipment}" servings="${m.servings_to_prep}" storage_days="${m.storage_days}" cal="${tm.calories}" p="${tm.protein_g}" c="${tm.carbs_g}" f="${tm.fat_g}">
<name>${m.name}</name>
${ings}
${instrs}
</meal>`
      })
      .join('\n')
    return `<day type="${type}" cal="${t.calories}" p="${t.protein_g}" c="${t.carbs_g}" f="${t.fat_g}">
${meals}
</day>`
  }

  const steps = plan.prep_timeline
    .map(
      (s) =>
        `<step n="${s.step}" time="${s.time}" duration="${s.duration_mins}" equipment="${s.equipment}">${s.action}</step>`
    )
    .join('\n')

  const shops = plan.shopping_list
    .map(
      (s) => `<shop g="${s.quantity_g}" category="${s.category ?? 'other'}">${s.ingredient}</shop>`
    )
    .join('\n')

  const containers = plan.container_assignments
    .map(
      (c) =>
        `<container n="${c.container_num}" day="${c.day_type}" slot="${c.meal_slot}">${c.recipe_name}</container>`
    )
    .join('\n')

  return `<plan total_containers="${plan.total_containers}" prep_time_mins="${plan.estimated_prep_time_mins}">
${dayTag('training')}
${dayTag('rest')}
${steps}
${shops}
${containers}
</plan>`
}

const generateMock = chatCompletion as unknown as Mock

function llmResponse(text: string) {
  return {
    choices: [{ message: { content: text }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 1500, completion_tokens: 3000 },
  }
}

function mockLLMResponse(text: string) {
  generateMock.mockResolvedValue(llmResponse(text))
}

describe('generateBatchPrepPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns validated plan when Claude returns valid tag output with accurate macros', async () => {
    mockLLMResponse(planToTags(validPlanFixture as BatchPrepPlan))
    const plan = await generateBatchPrepPlan(null, profile, prefs)
    expect(plan.total_containers).toBe(10)
    expect(plan.training_day.meals).toHaveLength(2)
  })

  it('ignores surrounding prose and extracts the plan', async () => {
    const tags = planToTags(validPlanFixture as BatchPrepPlan)
    mockLLMResponse(`Here is your plan:\n\n${tags}\n\nEnjoy!`)
    const plan = await generateBatchPrepPlan(null, profile, prefs)
    expect(plan.total_containers).toBe(10)
  })

  it('throws BatchPrepValidationError when no <day> tags are present', async () => {
    mockLLMResponse('not valid tags at all')
    await expect(generateBatchPrepPlan(null, profile, prefs)).rejects.toThrow()
  })

  it('throws BatchPrepValidationError when required structure is missing', async () => {
    mockLLMResponse('<plan><day type="training" cal="0" p="0" c="0" f="0"></day></plan>')
    await expect(generateBatchPrepPlan(null, profile, prefs)).rejects.toThrow()
  })
})

describe('generateBatchPrepPlan retry behaviour', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retries once when macros are off, succeeds on retry', async () => {
    const offPlan: BatchPrepPlan = {
      ...(validPlanFixture as BatchPrepPlan),
      training_day: {
        ...(validPlanFixture as BatchPrepPlan).training_day,
        daily_totals: { calories: 3500, protein_g: 200, carbs_g: 280, fat_g: 70 },
      },
    }

    generateMock
      .mockResolvedValueOnce(llmResponse(planToTags(offPlan)))
      .mockResolvedValueOnce(llmResponse(planToTags(validPlanFixture as BatchPrepPlan)))

    const plan = await generateBatchPrepPlan(null, profile, prefs)
    expect(plan.training_day.daily_totals.calories).toBe(2600)
    expect(chatCompletion).toHaveBeenCalledTimes(2)
  })

  it('returns best attempt when both retries miss accuracy target', async () => {
    const offPlan: BatchPrepPlan = {
      ...(validPlanFixture as BatchPrepPlan),
      training_day: {
        ...(validPlanFixture as BatchPrepPlan).training_day,
        daily_totals: { calories: 3500, protein_g: 200, carbs_g: 280, fat_g: 70 },
      },
    }

    generateMock.mockResolvedValue(llmResponse(planToTags(offPlan)))

    const plan = await generateBatchPrepPlan(null, profile, prefs)
    expect(plan.training_day.daily_totals.calories).toBe(3500)
    expect(chatCompletion).toHaveBeenCalledTimes(2)
  })
})
