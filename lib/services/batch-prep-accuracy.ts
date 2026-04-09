import type { BatchPrepPlan, TrainingProfile, Macros } from '@/lib/types/batch-prep'

const TOLERANCE = 0.1 // 10%
const MACRO_KEYS: (keyof Macros)[] = ['calories', 'protein_g', 'carbs_g', 'fat_g']

export interface AccuracyResult {
  passed: boolean
  reason?: string
  deviations: {
    training_day: Record<keyof Macros, number>
    rest_day: Record<keyof Macros, number>
  }
}

function deviation(actual: number, target: number): number {
  if (target === 0) return actual === 0 ? 0 : 1
  return Math.abs(actual - target) / target
}

function computeDeviations(actual: Macros, target: Macros): Record<keyof Macros, number> {
  return {
    calories: deviation(actual.calories, target.calories),
    protein_g: deviation(actual.protein_g, target.protein_g),
    carbs_g: deviation(actual.carbs_g, target.carbs_g),
    fat_g: deviation(actual.fat_g, target.fat_g),
  }
}

export function checkMacroAccuracy(
  plan: BatchPrepPlan,
  profile: TrainingProfile
): AccuracyResult {
  const trainingDeviations = computeDeviations(
    plan.training_day.daily_totals,
    profile.training_day_macros
  )
  const restDeviations = computeDeviations(
    plan.rest_day.daily_totals,
    profile.rest_day_macros
  )

  const failures: string[] = []

  for (const key of MACRO_KEYS) {
    if (trainingDeviations[key] > TOLERANCE) {
      failures.push(
        `training_day.${key} off by ${(trainingDeviations[key] * 100).toFixed(1)}%`
      )
    }
    if (restDeviations[key] > TOLERANCE) {
      failures.push(
        `rest_day.${key} off by ${(restDeviations[key] * 100).toFixed(1)}%`
      )
    }
  }

  return {
    passed: failures.length === 0,
    reason: failures.length > 0 ? failures.join('; ') : undefined,
    deviations: { training_day: trainingDeviations, rest_day: restDeviations },
  }
}
