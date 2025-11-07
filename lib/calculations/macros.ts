export type Goal = 'cut' | 'bulk' | 'maintain' | 'recomp'

export interface MacroCalculation {
  targetCalories: number
  protein: number
  carbs: number
  fat: number
}

/**
 * Calculate target calories based on goal
 *
 * @param tdee - Total Daily Energy Expenditure
 * @param goal - Fitness goal
 * @returns Target calories per day
 */
export function calculateTargetCalories(tdee: number, goal: Goal): number {
  switch (goal) {
    case 'cut':
      return Math.round(tdee * 0.8) // 20% deficit
    case 'bulk':
      return Math.round(tdee * 1.1) // 10% surplus
    case 'maintain':
      return tdee
    case 'recomp':
      return tdee // Maintenance with specific macro ratios
  }
}

/**
 * Calculate macronutrient distribution
 *
 * @param targetCalories - Target daily calories
 * @param goal - Fitness goal
 * @param weight - Body weight
 * @param weightUnit - Unit of weight measurement
 * @returns Macro distribution in grams
 */
export function calculateMacros(
  targetCalories: number,
  goal: Goal,
  weight: number,
  weightUnit: 'lbs' | 'kg'
): MacroCalculation {
  const weightLbs = weightUnit === 'kg' ? weight * 2.20462 : weight

  // Protein: 0.8-1g per lb bodyweight (higher for cutting)
  const proteinMultiplier = goal === 'cut' ? 1.0 : 0.8
  const proteinGrams = Math.round(weightLbs * proteinMultiplier)
  const proteinCalories = proteinGrams * 4

  // Fat: 25-30% of total calories
  const fatPercentage = goal === 'bulk' ? 0.25 : 0.3
  const fatCalories = Math.round(targetCalories * fatPercentage)
  const fatGrams = Math.round(fatCalories / 9)

  // Carbs: Remaining calories
  const carbCalories = targetCalories - proteinCalories - fatCalories
  const carbGrams = Math.round(carbCalories / 4)

  return {
    targetCalories,
    protein: proteinGrams,
    carbs: Math.max(0, carbGrams), // Ensure non-negative
    fat: fatGrams,
  }
}
