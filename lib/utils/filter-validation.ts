/**
 * Centralized Filter Validation Utility for Recipe-API.com
 *
 * Validates and sanitizes recipe filter parameters from URL to prevent:
 * - XSS injection attacks
 * - DoS attacks via excessive parallel queries
 * - Invalid data being passed to APIs
 * - API quota exhaustion
 */

import type { RecipeApiSearchParams } from '@/lib/types/recipe-api'

// ============================================================================
// Allowed Values
// ============================================================================

// Sort options
export const ALLOWED_SORT_OPTIONS = [
  'newest',
  'oldest',
  'caloriesPerServingAscending',
  'caloriesPerServingDescending',
] as const

export type SortOption = (typeof ALLOWED_SORT_OPTIONS)[number]

// Maximum values for range filters
export const FILTER_LIMITS = {
  maxRecipeTypes: 5, // Maximum recipe types to select
  minCalories: 0,
  maxCalories: 2000,
  minPercentage: 0,
  maxPercentage: 100,
  minPrepTime: 0,
  maxPrepTime: 180, // 3 hours max
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates a number is within a given range
 */
function validateNumber(
  value: string | undefined,
  min: number,
  max: number
): number | undefined {
  if (value === undefined || value === '') return undefined

  const num = parseInt(value, 10)
  if (isNaN(num)) return undefined

  // Clamp to valid range
  return Math.max(min, Math.min(max, num))
}

/**
 * Validates a sort option
 */
function validateSortOption(value: string | undefined): SortOption | undefined {
  if (!value) return undefined
  if (ALLOWED_SORT_OPTIONS.includes(value as SortOption)) {
    return value as SortOption
  }
  return undefined
}

/**
 * Validates recipe types (comma-separated string)
 * Recipe types are dynamic from API, so we just validate format and limit count
 */
function validateRecipeTypes(value: string | undefined): string | undefined {
  if (!value) return undefined

  const types = value
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length < 100) // Basic sanitization
    .slice(0, FILTER_LIMITS.maxRecipeTypes)

  return types.length > 0 ? types.join(',') : undefined
}

/**
 * Validates boolean filter
 */
function validateBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined || value === '') return undefined
  return value === 'true' || value === '1'
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * URL parameter names for recipe filters
 */
export interface RecipeFilterParams {
  search?: string
  recipeTypes?: string
  caloriesFrom?: string
  caloriesTo?: string
  proteinFrom?: string
  proteinTo?: string
  carbsFrom?: string
  carbsTo?: string
  fatFrom?: string
  fatTo?: string
  prepTimeFrom?: string
  prepTimeTo?: string
  mustHaveImages?: string
  sortBy?: string
  page?: string
}

// Backward compat alias
export type RecipeAPIFilterParams = RecipeFilterParams

/**
 * Validated and sanitized filter values ready for API
 */
export interface ValidatedFilters {
  q?: string
  category?: string
  min_calories?: number
  max_calories?: number
  min_protein?: number
  max_protein?: number
  min_carbs?: number
  max_carbs?: number
  min_fat?: number
  max_fat?: number
  must_have_images?: boolean
  sort_by?: SortOption
  page?: number
  per_page?: number
}

/**
 * Main validation function for recipe filter parameters
 *
 * @param params - Raw URL search parameters
 * @returns Validated and sanitized filter values for Recipe-API.com
 */
export function validateRecipeFilters(params: RecipeFilterParams): ValidatedFilters {
  const validated: ValidatedFilters = {}

  // Search query - basic sanitization (no script tags, etc.)
  if (params.search) {
    const sanitized = params.search
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim()
      .slice(0, 200) // Limit length
    if (sanitized.length > 0) {
      validated.q = sanitized
    }
  }

  // Category (recipe types)
  validated.category = validateRecipeTypes(params.recipeTypes)

  // Calorie range
  validated.min_calories = validateNumber(
    params.caloriesFrom,
    FILTER_LIMITS.minCalories,
    FILTER_LIMITS.maxCalories
  )
  validated.max_calories = validateNumber(
    params.caloriesTo,
    FILTER_LIMITS.minCalories,
    FILTER_LIMITS.maxCalories
  )

  // Ensure from <= to
  if (
    validated.min_calories !== undefined &&
    validated.max_calories !== undefined &&
    validated.min_calories > validated.max_calories
  ) {
    ;[validated.min_calories, validated.max_calories] = [
      validated.max_calories,
      validated.min_calories,
    ]
  }

  // Protein range (grams, not percentage)
  validated.min_protein = validateNumber(
    params.proteinFrom,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )
  validated.max_protein = validateNumber(
    params.proteinTo,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )

  // Carbs range
  validated.min_carbs = validateNumber(
    params.carbsFrom,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )
  validated.max_carbs = validateNumber(
    params.carbsTo,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )

  // Fat range
  validated.min_fat = validateNumber(
    params.fatFrom,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )
  validated.max_fat = validateNumber(
    params.fatTo,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )

  // Must have images
  validated.must_have_images = validateBoolean(params.mustHaveImages)

  // Sort option
  validated.sort_by = validateSortOption(params.sortBy)

  // Page number (1-indexed for Recipe-API.com)
  const page = validateNumber(params.page, 1, 1000)
  if (page !== undefined) {
    validated.page = page
  }

  return validated
}

/**
 * Convert validated filters to RecipeApiSearchParams
 */
export function toSearchParams(filters: ValidatedFilters): RecipeApiSearchParams {
  return {
    q: filters.q,
    category: filters.category,
    min_calories: filters.min_calories,
    max_calories: filters.max_calories,
    min_protein: filters.min_protein,
    max_protein: filters.max_protein,
    min_carbs: filters.min_carbs,
    max_carbs: filters.max_carbs,
    min_fat: filters.min_fat,
    max_fat: filters.max_fat,
    page: filters.page,
    per_page: filters.per_page,
  }
}

/**
 * Check if any filters are active (besides search)
 */
export function hasActiveFilters(filters: ValidatedFilters): boolean {
  return !!(
    filters.category ||
    filters.min_calories !== undefined ||
    filters.max_calories !== undefined ||
    filters.min_protein !== undefined ||
    filters.max_protein !== undefined ||
    filters.min_carbs !== undefined ||
    filters.max_carbs !== undefined ||
    filters.min_fat !== undefined ||
    filters.max_fat !== undefined ||
    filters.must_have_images !== undefined ||
    filters.sort_by !== undefined
  )
}
