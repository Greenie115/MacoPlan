/**
 * Centralized Filter Validation Utility
 *
 * Validates and sanitizes recipe filter parameters from URL to prevent:
 * - XSS injection attacks
 * - DoS attacks via excessive parallel queries
 * - Invalid data being passed to APIs
 * - API quota exhaustion
 */

// Allowed filter values (must match component constants)
export const ALLOWED_CUISINES = [
  'italian',
  'mexican',
  'chinese',
  'indian',
  'japanese',
  'thai',
  'american',
  'mediterranean',
  'french',
  'greek',
  'korean',
  'spanish',
] as const

export const ALLOWED_PREP_TIMES = ['15', '30', '60'] as const

export const ALLOWED_MEAL_TYPES = [
  'breakfast',
  'main course',
  'snack',
  'dessert',
  'appetizer',
] as const

// Maximum selections to prevent DoS attacks and API quota exhaustion
export const MAX_CUISINES = 5
export const MAX_PREP_TIMES = 3 // All 3 allowed
export const MAX_MEAL_TYPES = 5 // All 5 allowed (but will trigger 5 parallel queries)

/**
 * Validates and sanitizes an array of filter values against an allowed set
 *
 * @param values - Raw values from URL parameter
 * @param allowedSet - Set of allowed values
 * @param maxSelections - Maximum number of selections allowed
 * @returns Validated array of values
 */
function validateFilterArray<T extends string>(
  values: string[] | undefined,
  allowedSet: readonly T[],
  maxSelections: number
): T[] {
  if (!values || values.length === 0) {
    return []
  }

  // Filter out invalid values and limit to max selections
  const validated = values
    .filter((val): val is T => allowedSet.includes(val as T))
    .slice(0, maxSelections)

  // Log warning if values were filtered out (potential attack)
  if (validated.length < values.length) {
    console.warn(
      `[FilterValidation] Filtered out invalid values. Original: ${values.length}, Valid: ${validated.length}`,
      { original: values, validated }
    )
  }

  return validated
}

/**
 * Validates and sanitizes integer values from comma-separated string
 *
 * @param rawValue - Raw comma-separated string from URL
 * @param allowedValues - Array of allowed integer values
 * @returns Array of validated integers
 */
function validateIntegerArray(
  rawValue: string | undefined,
  allowedValues: readonly string[]
): number[] {
  if (!rawValue) {
    return []
  }

  const values = rawValue
    .split(',')
    .map((v) => v.trim())
    .filter((v) => allowedValues.includes(v))
    .map((v) => parseInt(v, 10))
    .filter((n) => !isNaN(n) && n > 0)

  return values
}

/**
 * Main validation function for recipe filter parameters
 *
 * @param params - Raw URL search parameters
 * @returns Validated and sanitized filter values
 */
export function validateRecipeFilters(params: {
  cuisine?: string
  maxTime?: string
  type?: string
}) {
  // Validate cuisines
  const cuisineValues = params.cuisine?.split(',').filter(Boolean)
  const cuisines = validateFilterArray(
    cuisineValues,
    ALLOWED_CUISINES,
    MAX_CUISINES
  )

  // Validate prep times and return maximum value
  const prepTimeIntegers = validateIntegerArray(params.maxTime, ALLOWED_PREP_TIMES)
  const maxReadyTime = prepTimeIntegers.length > 0
    ? Math.max(...prepTimeIntegers)
    : undefined

  // Validate meal types
  const mealTypeValues = params.type?.split(',').filter(Boolean)
  const mealTypes = validateFilterArray(
    mealTypeValues,
    ALLOWED_MEAL_TYPES,
    MAX_MEAL_TYPES
  )

  return {
    cuisines: cuisines.length > 0 ? cuisines : undefined,
    maxReadyTime,
    mealTypes: mealTypes.length > 0 ? mealTypes : undefined,
    // Return raw values for chips display
    rawPrepTimes: prepTimeIntegers.map(String),
  }
}

/**
 * Type guard to check if a value is a valid cuisine
 */
export function isValidCuisine(value: string): value is typeof ALLOWED_CUISINES[number] {
  return ALLOWED_CUISINES.includes(value as typeof ALLOWED_CUISINES[number])
}

/**
 * Type guard to check if a value is a valid meal type
 */
export function isValidMealType(value: string): value is typeof ALLOWED_MEAL_TYPES[number] {
  return ALLOWED_MEAL_TYPES.includes(value as typeof ALLOWED_MEAL_TYPES[number])
}

/**
 * Type guard to check if a value is a valid prep time
 */
export function isValidPrepTime(value: string): value is typeof ALLOWED_PREP_TIMES[number] {
  return ALLOWED_PREP_TIMES.includes(value as typeof ALLOWED_PREP_TIMES[number])
}
