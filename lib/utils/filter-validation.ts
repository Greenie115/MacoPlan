/**
 * Centralized Filter Validation Utility for FatSecret API
 *
 * Validates and sanitizes recipe filter parameters from URL to prevent:
 * - XSS injection attacks
 * - DoS attacks via excessive parallel queries
 * - Invalid data being passed to APIs
 * - API quota exhaustion
 */

import type { FatSecretRecipeSearchParams } from '@/lib/types/fatsecret'

// ============================================================================
// Allowed Values
// ============================================================================

// Sort options supported by FatSecret API
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
 * URL parameter names for FatSecret filters
 */
export interface FatSecretFilterParams {
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

/**
 * Validated and sanitized filter values ready for API
 */
export interface ValidatedFilters {
  search_expression?: string
  recipe_types?: string
  calories_from?: number
  calories_to?: number
  protein_percentage_from?: number
  protein_percentage_to?: number
  carb_percentage_from?: number
  carb_percentage_to?: number
  fat_percentage_from?: number
  fat_percentage_to?: number
  prep_time_from?: number
  prep_time_to?: number
  must_have_images?: boolean
  sort_by?: SortOption
  page_number?: number
}

/**
 * Main validation function for FatSecret recipe filter parameters
 *
 * @param params - Raw URL search parameters
 * @returns Validated and sanitized filter values for FatSecret API
 */
export function validateRecipeFilters(params: FatSecretFilterParams): ValidatedFilters {
  const validated: ValidatedFilters = {}

  // Search expression - basic sanitization (no script tags, etc.)
  if (params.search) {
    const sanitized = params.search
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim()
      .slice(0, 200) // Limit length
    if (sanitized.length > 0) {
      validated.search_expression = sanitized
    }
  }

  // Recipe types
  validated.recipe_types = validateRecipeTypes(params.recipeTypes)

  // Calorie range
  validated.calories_from = validateNumber(
    params.caloriesFrom,
    FILTER_LIMITS.minCalories,
    FILTER_LIMITS.maxCalories
  )
  validated.calories_to = validateNumber(
    params.caloriesTo,
    FILTER_LIMITS.minCalories,
    FILTER_LIMITS.maxCalories
  )

  // Ensure from <= to
  if (
    validated.calories_from !== undefined &&
    validated.calories_to !== undefined &&
    validated.calories_from > validated.calories_to
  ) {
    ;[validated.calories_from, validated.calories_to] = [
      validated.calories_to,
      validated.calories_from,
    ]
  }

  // Protein percentage range
  validated.protein_percentage_from = validateNumber(
    params.proteinFrom,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )
  validated.protein_percentage_to = validateNumber(
    params.proteinTo,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )

  // Carbs percentage range
  validated.carb_percentage_from = validateNumber(
    params.carbsFrom,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )
  validated.carb_percentage_to = validateNumber(
    params.carbsTo,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )

  // Fat percentage range
  validated.fat_percentage_from = validateNumber(
    params.fatFrom,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )
  validated.fat_percentage_to = validateNumber(
    params.fatTo,
    FILTER_LIMITS.minPercentage,
    FILTER_LIMITS.maxPercentage
  )

  // Prep time range
  validated.prep_time_from = validateNumber(
    params.prepTimeFrom,
    FILTER_LIMITS.minPrepTime,
    FILTER_LIMITS.maxPrepTime
  )
  validated.prep_time_to = validateNumber(
    params.prepTimeTo,
    FILTER_LIMITS.minPrepTime,
    FILTER_LIMITS.maxPrepTime
  )

  // Must have images
  validated.must_have_images = validateBoolean(params.mustHaveImages)

  // Sort option
  validated.sort_by = validateSortOption(params.sortBy)

  // Page number (0-indexed for API)
  const page = validateNumber(params.page, 0, 1000)
  if (page !== undefined && page > 0) {
    validated.page_number = page - 1 // Convert to 0-indexed
  }

  return validated
}

/**
 * Convert validated filters to FatSecretRecipeSearchParams
 */
export function toSearchParams(filters: ValidatedFilters): FatSecretRecipeSearchParams {
  return {
    search_expression: filters.search_expression,
    recipe_types: filters.recipe_types,
    calories_from: filters.calories_from,
    calories_to: filters.calories_to,
    protein_percentage_from: filters.protein_percentage_from,
    protein_percentage_to: filters.protein_percentage_to,
    carb_percentage_from: filters.carb_percentage_from,
    carb_percentage_to: filters.carb_percentage_to,
    fat_percentage_from: filters.fat_percentage_from,
    fat_percentage_to: filters.fat_percentage_to,
    prep_time_from: filters.prep_time_from,
    prep_time_to: filters.prep_time_to,
    must_have_images: filters.must_have_images,
    sort_by: filters.sort_by,
    page_number: filters.page_number,
  }
}

/**
 * Check if any filters are active (besides search)
 */
export function hasActiveFilters(filters: ValidatedFilters): boolean {
  return !!(
    filters.recipe_types ||
    filters.calories_from !== undefined ||
    filters.calories_to !== undefined ||
    filters.protein_percentage_from !== undefined ||
    filters.protein_percentage_to !== undefined ||
    filters.carb_percentage_from !== undefined ||
    filters.carb_percentage_to !== undefined ||
    filters.fat_percentage_from !== undefined ||
    filters.fat_percentage_to !== undefined ||
    filters.prep_time_from !== undefined ||
    filters.prep_time_to !== undefined ||
    filters.must_have_images !== undefined ||
    filters.sort_by !== undefined
  )
}
