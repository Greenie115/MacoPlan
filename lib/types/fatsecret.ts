/**
 * FatSecret API Type Definitions
 *
 * Type definitions for the FatSecret Platform API
 * https://platform.fatsecret.com/docs/guides
 */

// ============================================================================
// OAuth Types
// ============================================================================

export interface FatSecretTokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  scope: string
}

// ============================================================================
// Food Types
// ============================================================================

export interface FatSecretServing {
  serving_id: string
  serving_description: string
  serving_url?: string
  metric_serving_amount?: string
  metric_serving_unit?: string
  number_of_units?: string
  measurement_description?: string
  is_default?: string
  calories: string
  carbohydrate: string
  protein: string
  fat: string
  saturated_fat?: string
  polyunsaturated_fat?: string
  monounsaturated_fat?: string
  trans_fat?: string
  cholesterol?: string
  sodium?: string
  potassium?: string
  fiber?: string
  sugar?: string
  added_sugars?: string
  vitamin_a?: string
  vitamin_c?: string
  vitamin_d?: string
  calcium?: string
  iron?: string
}

export interface FatSecretFood {
  food_id: string
  food_name: string
  food_type: 'Brand' | 'Generic'
  brand_name?: string
  food_url: string
  food_description?: string
  servings?: {
    serving: FatSecretServing | FatSecretServing[]
  }
}

export interface FatSecretFoodSearchResponse {
  foods?: {
    food: FatSecretFood | FatSecretFood[]
    max_results: string
    page_number: string
    total_results: string
  }
  error?: FatSecretError
}

export interface FatSecretFoodDetailResponse {
  food?: FatSecretFood
  error?: FatSecretError
}

// ============================================================================
// Recipe Types
// ============================================================================

export interface FatSecretRecipeNutrition {
  calories: string
  carbohydrate: string
  fat: string
  protein: string
  fiber?: string
  sugar?: string
  sodium?: string
  cholesterol?: string
  saturated_fat?: string
}

export interface FatSecretRecipeIngredient {
  food_id: string
  food_name: string
  serving_id: string
  number_of_units: string
  measurement_description: string
  ingredient_description: string
  ingredient_url: string
}

export interface FatSecretRecipeDirection {
  direction_number: string
  direction_description: string
}

export interface FatSecretRecipeCategory {
  recipe_category_name: string
  recipe_category_url: string
}

export interface FatSecretRecipeImage {
  recipe_image: string
}

export interface FatSecretRecipeSearchItem {
  recipe_id: string
  recipe_name: string
  recipe_description: string
  recipe_image?: string
  recipe_url?: string
  recipe_nutrition?: FatSecretRecipeNutrition
}

export interface FatSecretRecipeDetail {
  recipe_id: string
  recipe_name: string
  recipe_description: string
  recipe_url: string
  recipe_images?: {
    recipe_image: string | string[]
  }
  recipe_image?: string
  recipe_categories?: {
    recipe_category: FatSecretRecipeCategory | FatSecretRecipeCategory[]
  }
  recipe_types?: {
    recipe_type: string | string[]
  }
  serving_sizes?: {
    serving: {
      serving_size: string
      calories: string
      carbohydrate: string
      protein: string
      fat: string
      fiber?: string
      sugar?: string
      sodium?: string
      cholesterol?: string
      saturated_fat?: string
    }
  }
  ingredients?: {
    ingredient: FatSecretRecipeIngredient | FatSecretRecipeIngredient[]
  }
  directions?: {
    direction: FatSecretRecipeDirection | FatSecretRecipeDirection[]
  }
  preparation_time_min?: string
  cooking_time_min?: string
  number_of_servings: string
  rating?: string
  grams_per_portion?: string
}

export interface FatSecretRecipeSearchResponse {
  recipes?: {
    recipe: FatSecretRecipeSearchItem | FatSecretRecipeSearchItem[]
    max_results: string
    page_number: string
    total_results: string
  }
  error?: FatSecretError
}

export interface FatSecretRecipeDetailResponse {
  recipe?: FatSecretRecipeDetail
  error?: FatSecretError
}

// ============================================================================
// Recipe Types (Categories)
// ============================================================================

export interface FatSecretRecipeType {
  recipe_type_id: string
  recipe_type_name: string
}

export interface FatSecretRecipeTypesResponse {
  recipe_types?: {
    recipe_type: FatSecretRecipeType | FatSecretRecipeType[]
  }
  error?: FatSecretError
}

// ============================================================================
// Error Types
// ============================================================================

export interface FatSecretError {
  code: number
  message: string
}

// ============================================================================
// Search Parameters
// ============================================================================

export interface FatSecretFoodSearchParams {
  search_expression?: string
  page_number?: number
  max_results?: number // Default 20, max 50
  region?: string // e.g., 'US', 'FR', 'AU'
  language?: string // e.g., 'en', 'fr'
}

export interface FatSecretRecipeSearchParams {
  search_expression?: string
  page_number?: number
  max_results?: number // Default 20, max 50

  // Recipe type filters
  recipe_types?: string // Comma-separated list of recipe types
  recipe_types_matchall?: boolean // If true, recipes must match ALL types; false = ANY

  // Nutrition filters (ranges)
  calories_from?: number
  calories_to?: number
  protein_percentage_from?: number
  protein_percentage_to?: number
  carb_percentage_from?: number
  carb_percentage_to?: number
  fat_percentage_from?: number
  fat_percentage_to?: number

  // Time filter
  prep_time_from?: number // Minutes
  prep_time_to?: number // Minutes

  // Other filters
  must_have_images?: boolean
  sort_by?: 'newest' | 'oldest' | 'caloriesPerServingAscending' | 'caloriesPerServingDescending'
}

// Valid FatSecret API recipe types (from recipe_types.get endpoint)
// Note: These are the actual values accepted by the API - use these exact strings
export type FatSecretRecipeTypeFilter =
  | 'Appetizers'
  | 'Baked'
  | 'Beverages'
  | 'Breads'
  | 'Breakfast'
  | 'Desserts'
  | 'Main Dishes'
  | 'Preserving'
  | 'Salads'
  | 'Sandwiches'
  | 'Sauces and Condiments'
  | 'Side Dishes'
  | 'Soups'
  | 'Vegetables'

// ============================================================================
// Normalized Types (for internal use)
// ============================================================================

/**
 * Normalized recipe format for consistent handling in the app
 */
export interface NormalizedRecipe {
  id: string
  source: 'fatsecret'
  title: string
  description: string
  imageUrl: string | null
  sourceUrl: string
  servings: number
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  totalTimeMinutes: number | null
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number | null
  sugar: number | null
  ingredients: NormalizedIngredient[]
  instructions: NormalizedInstruction[]
  categories: string[]
  recipeTypes: string[]
  rating: number | null
}

export interface NormalizedIngredient {
  foodId: string
  name: string
  amount: number
  unit: string
  description: string
}

export interface NormalizedInstruction {
  stepNumber: number
  instruction: string
}

/**
 * Normalized serving/nutrition format
 */
export interface NormalizedNutrition {
  servingDescription: string
  servingSize: number | null
  servingUnit: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number | null
  sugar: number | null
  sodium: number | null
  saturatedFat: number | null
  cholesterol: number | null
}

// ============================================================================
// Meal Plan Types
// ============================================================================

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface MealSlot {
  type: MealType
  recipe: NormalizedRecipe | null
  targetCalories: number
  targetProtein: number
}

export interface DailyMealPlan {
  date: string
  meals: MealSlot[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export interface WeeklyMealPlan {
  startDate: string
  days: DailyMealPlan[]
  averageCalories: number
  averageProtein: number
  averageCarbs: number
  averageFat: number
}

export interface MealPlanGenerationParams {
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  mealsPerDay: number // 3-6
  days: number // 1-7
  dietaryPreferences?: string[]
  excludeIngredients?: string[]
}

// ============================================================================
// Cache Types (Database)
// ============================================================================

export interface CachedFatSecretFood {
  id: string
  fatsecret_id: string
  food_name: string
  food_type: 'Brand' | 'Generic'
  brand_name: string | null
  food_url: string | null
  servings: FatSecretServing[] | null
  default_serving: FatSecretServing | null
  cached_at: string
  cache_expires_at: string
  fetch_count: number
  last_accessed_at: string
  created_at: string
  updated_at: string
}

export interface CachedFatSecretRecipe {
  id: string
  fatsecret_id: string
  recipe_name: string
  recipe_description: string | null
  recipe_url: string | null
  image_url: string | null
  calories: number | null
  protein_grams: number | null
  carb_grams: number | null
  fat_grams: number | null
  fiber_grams: number | null
  ingredients: FatSecretRecipeIngredient[] | null
  directions: FatSecretRecipeDirection[] | null
  categories: string[] | null
  recipe_types: string[] | null
  number_of_servings: number | null
  prep_time_min: number | null
  cook_time_min: number | null
  rating: number | null
  cached_at: string
  cache_expires_at: string
  fetch_count: number
  last_accessed_at: string
  created_at: string
  updated_at: string
}

export interface CachedFatSecretSearch {
  id: string
  query_hash: string
  search_type: 'food' | 'recipe'
  query_params: FatSecretFoodSearchParams | FatSecretRecipeSearchParams
  result_ids: string[]
  total_results: number
  cached_at: string
  expires_at: string
  hit_count: number
  created_at: string
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface FatSecretApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  fromCache?: boolean
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Helper to ensure arrays (FatSecret returns single objects when only 1 result)
 */
export function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * Parse string number to number, with fallback
 */
export function parseNumber(value: string | undefined, fallback: number = 0): number {
  if (value === undefined) return fallback
  const parsed = parseFloat(value)
  return isNaN(parsed) ? fallback : parsed
}
