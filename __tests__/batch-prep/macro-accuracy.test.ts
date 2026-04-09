import { describe, it, expect } from 'vitest'
import { checkMacroAccuracy } from '@/lib/services/batch-prep-accuracy'
import type { BatchPrepPlan, TrainingProfile } from '@/lib/types/batch-prep'

const baseProfile: TrainingProfile = {
  training_days_per_week: 5,
  training_day_macros: { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
  rest_day_macros: { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 },
  prep_day: 'sunday',
  containers_per_week: 10,
  max_prep_time_mins: 120,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makePlan(trainingTotals: any, restTotals: any): BatchPrepPlan {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    training_day: { meals: [] as any, daily_totals: trainingTotals },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rest_day: { meals: [] as any, daily_totals: restTotals },
    prep_timeline: [],
    shopping_list: [],
    container_assignments: [],
    total_containers: 10,
    estimated_prep_time_mins: 90,
  } as BatchPrepPlan
}

describe('checkMacroAccuracy', () => {
  it('passes when totals are within 10% of targets', () => {
    const plan = makePlan(
      { calories: 2650, protein_g: 205, carbs_g: 275, fat_g: 68 },
      { calories: 2310, protein_g: 198, carbs_g: 202, fat_g: 71 }
    )
    const result = checkMacroAccuracy(plan, baseProfile)
    expect(result.passed).toBe(true)
    expect(result.deviations.training_day.calories).toBeLessThan(0.1)
  })

  it('fails when calories are off by more than 10%', () => {
    const plan = makePlan(
      { calories: 3200, protein_g: 200, carbs_g: 280, fat_g: 70 },
      { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 }
    )
    const result = checkMacroAccuracy(plan, baseProfile)
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('training_day')
  })

  it('fails when protein is off by more than 10%', () => {
    const plan = makePlan(
      { calories: 2600, protein_g: 150, carbs_g: 280, fat_g: 70 },
      { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 }
    )
    const result = checkMacroAccuracy(plan, baseProfile)
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('protein')
  })

  it('fails when rest day is off', () => {
    const plan = makePlan(
      { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
      { calories: 1500, protein_g: 200, carbs_g: 200, fat_g: 70 }
    )
    const result = checkMacroAccuracy(plan, baseProfile)
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('rest_day')
  })
})
