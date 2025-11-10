export type Goal = 'cut' | 'bulk' | 'maintain' | 'recomp'
export type ActivityLevel = 'sedentary' | 'lightly' | 'moderately' | 'very' | 'extremely'

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
  // Input validation
  if (tdee <= 0 || !isFinite(tdee)) {
    throw new Error('Invalid TDEE value')
  }

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
 * Calculate protein needs based on ISSN evidence-based recommendations
 *
 * Research: International Society of Sports Nutrition Position Stand
 * - Bulk: 1.6-2.0 g/kg body weight
 * - Cut: 2.0-3.0 g/kg body weight (preserve muscle in deficit)
 * - Activity level matters more than training experience
 *
 * @param weightKg - Body weight in kilograms
 * @param goal - Fitness goal
 * @param activityLevel - Activity/training frequency
 * @returns Protein in grams per day
 */
function calculateProteinNeeds(
  weightKg: number,
  goal: Goal,
  activityLevel: ActivityLevel = 'moderately'
): number {
  let proteinGKg: number

  // Evidence-based protein ranges from ISSN
  if (goal === 'cut') {
    // Cutting: 2.0-3.0 g/kg to preserve muscle in caloric deficit
    // Higher activity = higher protein needs
    if (activityLevel === 'very' || activityLevel === 'extremely') {
      proteinGKg = 2.4 // High training volume during cut
    } else {
      proteinGKg = 2.2 // Moderate training volume
    }
  } else if (goal === 'bulk') {
    // Bulking: 1.6-2.0 g/kg for muscle building in surplus
    if (activityLevel === 'very' || activityLevel === 'extremely') {
      proteinGKg = 1.8 // High training volume
    } else {
      proteinGKg = 1.6 // Moderate training volume
    }
  } else {
    // Maintain/recomp: 1.8-2.0 g/kg
    proteinGKg = 1.8
  }

  return Math.round(weightKg * proteinGKg)
}

/**
 * Calculate fat needs based on goal and activity level
 *
 * Ensures minimum fat intake of 0.5-1.0 g/kg for hormone production
 * and essential fatty acid needs, then adjusts based on goals.
 *
 * @param targetCalories - Target daily calories
 * @param weightKg - Body weight in kilograms
 * @param goal - Fitness goal
 * @param activityLevel - Activity/training frequency
 * @returns Fat in grams per day
 */
function calculateFatNeeds(
  targetCalories: number,
  weightKg: number,
  goal: Goal,
  activityLevel: ActivityLevel = 'moderately'
): number {
  let fatPercentage: number

  if (goal === 'cut') {
    // Moderate fat in deficit for hormone health and satiety
    fatPercentage = 0.25 // 25% of calories
  } else if (goal === 'bulk') {
    // Lower fat % to prioritize carbs for training performance
    if (activityLevel === 'very' || activityLevel === 'extremely') {
      fatPercentage = 0.20 // 20% for very active (more carbs)
    } else {
      fatPercentage = 0.25 // 25% for moderate activity
    }
  } else {
    // Maintain/recomp: balanced approach
    fatPercentage = 0.25 // 25% of calories
  }

  const fatFromPercentage = Math.round((targetCalories * fatPercentage) / 9)

  // Ensure minimum for hormone production (0.5-1.0 g/kg recommended)
  const minFatGrams = Math.round(weightKg * 0.5)

  // Return the higher of percentage-based or minimum
  return Math.max(fatFromPercentage, minFatGrams)
}

/**
 * Calculate macronutrient distribution using evidence-based recommendations
 *
 * Based on International Society of Sports Nutrition (ISSN) Position Stand:
 * - Protein: 1.6-2.0 g/kg (bulk), 2.0-3.0 g/kg (cut)
 * - Fat: 20-25% of calories, minimum 0.5 g/kg for hormones
 * - Carbs: Remaining calories for training performance
 *
 * @param targetCalories - Target daily calories
 * @param goal - Fitness goal
 * @param weight - Body weight
 * @param weightUnit - Unit of weight measurement
 * @param activityLevel - Activity/training frequency (optional)
 * @returns Macro distribution in grams
 */
export function calculateMacros(
  targetCalories: number,
  goal: Goal,
  weight: number,
  weightUnit: 'lbs' | 'kg',
  activityLevel?: ActivityLevel
): MacroCalculation {
  // Input validation
  if (targetCalories <= 0 || !isFinite(targetCalories)) {
    throw new Error('Invalid target calories')
  }

  if (weight <= 0) {
    throw new Error('Weight must be greater than 0')
  }

  // Convert to kg for calculations (ISSN uses g/kg)
  const weightKg = weightUnit === 'kg' ? weight : weight * 0.453592

  // Calculate protein needs (highest priority) - ISSN recommendations
  const proteinGrams = calculateProteinNeeds(weightKg, goal, activityLevel)
  const proteinCalories = proteinGrams * 4

  // Calculate fat needs (second priority) - minimum for hormones
  const fatGrams = calculateFatNeeds(targetCalories, weightKg, goal, activityLevel)
  const fatCalories = fatGrams * 9

  // Carbs: Fill remaining calories (fuel for performance)
  const carbCalories = targetCalories - proteinCalories - fatCalories
  const carbGrams = Math.round(carbCalories / 4)

  // Safety check: ensure all macros are positive
  if (carbGrams < 0) {
    throw new Error('Insufficient calories for protein and fat needs. Target calories may be too low.')
  }

  return {
    targetCalories,
    protein: proteinGrams,
    carbs: Math.max(0, carbGrams),
    fat: fatGrams,
  }
}
