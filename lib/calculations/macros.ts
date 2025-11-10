export type Goal = 'cut' | 'bulk' | 'maintain' | 'recomp'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
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
 * Calculate protein needs based on goal, experience level, and activity
 *
 * @param weightLbs - Body weight in pounds
 * @param goal - Fitness goal
 * @param experienceLevel - Training experience
 * @param activityLevel - Activity/training frequency
 * @returns Protein in grams per day
 */
function calculateProteinNeeds(
  weightLbs: number,
  goal: Goal,
  experienceLevel: ExperienceLevel = 'intermediate',
  activityLevel: ActivityLevel = 'moderately'
): number {
  let baseProtein: number

  // Base protein needs by goal and experience
  if (goal === 'cut') {
    // Higher protein during cuts to preserve muscle
    switch (experienceLevel) {
      case 'beginner':
        baseProtein = weightLbs * 1.0
        break
      case 'intermediate':
        baseProtein = weightLbs * 1.1
        break
      case 'advanced':
        baseProtein = weightLbs * 1.2
        break
    }
  } else if (goal === 'bulk') {
    // Moderate-high protein for muscle building
    switch (experienceLevel) {
      case 'beginner':
        baseProtein = weightLbs * 0.8
        break
      case 'intermediate':
        baseProtein = weightLbs * 0.9
        break
      case 'advanced':
        baseProtein = weightLbs * 1.0
        break
    }
  } else {
    // Maintain/recomp: moderate protein
    switch (experienceLevel) {
      case 'beginner':
        baseProtein = weightLbs * 0.8
        break
      case 'intermediate':
        baseProtein = weightLbs * 0.9
        break
      case 'advanced':
        baseProtein = weightLbs * 1.0
        break
    }
  }

  // Adjust for very high activity levels
  if (activityLevel === 'very' || activityLevel === 'extremely') {
    baseProtein *= 1.05 // 5% bump for high training volume
  }

  return Math.round(baseProtein)
}

/**
 * Calculate fat needs based on goal and activity level
 *
 * @param targetCalories - Target daily calories
 * @param goal - Fitness goal
 * @param activityLevel - Activity/training frequency
 * @returns Fat in grams per day
 */
function calculateFatNeeds(
  targetCalories: number,
  goal: Goal,
  activityLevel: ActivityLevel = 'moderately'
): number {
  let fatPercentage: number

  if (goal === 'cut') {
    // Higher fat % in deficit for hormone health and satiety
    fatPercentage = 0.30 // 30% of calories
  } else if (goal === 'bulk') {
    // Lower fat % to prioritize carbs for training performance
    if (activityLevel === 'very' || activityLevel === 'extremely') {
      fatPercentage = 0.20 // 20% for very active
    } else {
      fatPercentage = 0.25 // 25% for moderate activity
    }
  } else {
    // Maintain/recomp: balanced approach
    fatPercentage = 0.25 // 25% of calories
  }

  const fatCalories = targetCalories * fatPercentage
  return Math.round(fatCalories / 9)
}

/**
 * Calculate macronutrient distribution with enhanced logic
 *
 * @param targetCalories - Target daily calories
 * @param goal - Fitness goal
 * @param weight - Body weight
 * @param weightUnit - Unit of weight measurement
 * @param experienceLevel - Training experience (optional)
 * @param activityLevel - Activity/training frequency (optional)
 * @returns Macro distribution in grams
 */
export function calculateMacros(
  targetCalories: number,
  goal: Goal,
  weight: number,
  weightUnit: 'lbs' | 'kg',
  experienceLevel?: ExperienceLevel,
  activityLevel?: ActivityLevel
): MacroCalculation {
  // Input validation
  if (targetCalories <= 0 || !isFinite(targetCalories)) {
    throw new Error('Invalid target calories')
  }

  if (weight <= 0) {
    throw new Error('Weight must be greater than 0')
  }

  const weightLbs = weightUnit === 'kg' ? weight * 2.20462 : weight

  // Calculate protein needs (highest priority)
  const proteinGrams = calculateProteinNeeds(weightLbs, goal, experienceLevel, activityLevel)
  const proteinCalories = proteinGrams * 4

  // Calculate fat needs (second priority)
  const fatGrams = calculateFatNeeds(targetCalories, goal, activityLevel)
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
