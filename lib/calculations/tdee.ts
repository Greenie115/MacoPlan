/**
 * Activity level multipliers based on exercise frequency
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // Little to no exercise
  lightly: 1.375, // 1-3 days/week
  moderately: 1.55, // 3-5 days/week
  very: 1.725, // 6-7 days/week
  extremely: 1.9, // 2x per day + physical job
} as const

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS

/**
 * Calculate Total Daily Energy Expenditure
 *
 * @param bmr - Basal Metabolic Rate in calories
 * @param activityLevel - Activity level enum
 * @returns TDEE in calories per day
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}
