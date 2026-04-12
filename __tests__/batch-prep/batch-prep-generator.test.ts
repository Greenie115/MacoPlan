import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TrainingProfile, DietaryPreferences } from '@/lib/types/batch-prep'
import validPlanFixture from './fixtures/valid-plan.json'

// Mock the anthropic service BEFORE importing the generator
vi.mock('@/lib/services/anthropic', () => ({
  anthropicService: {
    generate: vi.fn(),
  },
}))

// Mock usage log (no-op)
vi.mock('@/lib/services/anthropic-usage-log', () => ({
  logUsage: vi.fn().mockResolvedValue(undefined),
}))

import { anthropicService } from '@/lib/services/anthropic'
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

function mockClaudeResponse(jsonString: string) {
  ;(anthropicService.generate as any).mockResolvedValue({
    content: [{ type: 'text', text: jsonString }],
    usage: { input_tokens: 1500, output_tokens: 3000 },
  })
}

describe('generateBatchPrepPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns validated plan when Claude returns valid JSON with accurate macros', async () => {
    mockClaudeResponse(JSON.stringify(validPlanFixture))
    const plan = await generateBatchPrepPlan(null, profile, prefs)
    expect(plan.total_containers).toBe(10)
    expect(plan.training_day.meals).toHaveLength(2)
  })

  it('strips markdown code fences if Claude wraps the JSON', async () => {
    mockClaudeResponse('```json\n' + JSON.stringify(validPlanFixture) + '\n```')
    const plan = await generateBatchPrepPlan(null, profile, prefs)
    expect(plan.total_containers).toBe(10)
  })

  it('throws BatchPrepValidationError on malformed JSON', async () => {
    mockClaudeResponse('not valid json at all')
    await expect(generateBatchPrepPlan(null, profile, prefs)).rejects.toThrow()
  })

  it('throws BatchPrepValidationError on schema mismatch', async () => {
    mockClaudeResponse(JSON.stringify({ training_day: 'wrong shape' }))
    await expect(generateBatchPrepPlan(null, profile, prefs)).rejects.toThrow()
  })
})

describe('generateBatchPrepPlan retry behaviour', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retries once when macros are off, succeeds on retry', async () => {
    const offPlan = {
      ...validPlanFixture,
      training_day: {
        ...validPlanFixture.training_day,
        daily_totals: { calories: 3200, protein_g: 200, carbs_g: 280, fat_g: 70 },
      },
    }

    ;(anthropicService.generate as any)
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(offPlan) }],
        usage: { input_tokens: 1500, output_tokens: 3000 },
      })
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(validPlanFixture) }],
        usage: { input_tokens: 1700, output_tokens: 3000 },
      })

    const plan = await generateBatchPrepPlan(null, profile, prefs)
    expect(plan.training_day.daily_totals.calories).toBe(2600)
    expect(anthropicService.generate).toHaveBeenCalledTimes(2)
  })

  it('throws after retry still fails', async () => {
    const offPlan = {
      ...validPlanFixture,
      training_day: {
        ...validPlanFixture.training_day,
        daily_totals: { calories: 3200, protein_g: 200, carbs_g: 280, fat_g: 70 },
      },
    }

    ;(anthropicService.generate as any)
      .mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(offPlan) }],
        usage: { input_tokens: 1500, output_tokens: 3000 },
      })

    await expect(generateBatchPrepPlan(null, profile, prefs)).rejects.toThrow('Macro accuracy')
    expect(anthropicService.generate).toHaveBeenCalledTimes(2)
  })
})
