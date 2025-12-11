/**
 * Spoonacular API Type Definitions
 *
 * Type definitions for the Spoonacular Food API
 * https://spoonacular.com/food-api/docs
 */

// ============================================================================
// Core Recipe Types
// ============================================================================

export interface SpoonacularRecipe {
  id: number
  title: string
  image?: string
  imageType?: string
  servings: number
  readyInMinutes: number
  sourceUrl?: string
  sourceName?: string
  spoonacularSourceUrl?: string
  creditsText?: string
  aggregateLikes?: number
  healthScore?: number
  spoonacularScore?: number
  pricePerServing?: number
  summary?: string

  // Arrays
  cuisines?: string[]
  dishTypes?: string[]
  diets?: string[]
  occasions?: string[]

  // Booleans
  cheap?: boolean
  dairyFree?: boolean
  glutenFree?: boolean
  ketogenic?: boolean
  lowFodmap?: boolean
  sustainable?: boolean
  vegan?: boolean
  vegetarian?: boolean
  veryHealthy?: boolean
  veryPopular?: boolean
  whole30?: boolean

  // Nutrition
  nutrition?: SpoonacularNutrition

  // Ingredients
  extendedIngredients?: SpoonacularIngredient[]

  // Instructions
  analyzedInstructions?: SpoonacularAnalyzedInstruction[]
  instructions?: string // Fallback plain text instructions

  // Wine pairing
  winePairing?: {
    pairedWines: string[]
    pairingText: string
    productMatches: any[]
  }
}

// ============================================================================
// Nutrition Types
// ============================================================================

export interface SpoonacularNutrition {
  nutrients: SpoonacularNutrient[]
  properties?: SpoonacularNutrientProperty[]
  ingredients?: any[]
  caloricBreakdown?: {
    percentProtein: number
    percentFat: number
    percentCarbs: number
  }
  weightPerServing?: {
    amount: number
    unit: string
  }
}

export interface SpoonacularNutrient {
  name: string
  amount: number
  unit: string
  percentOfDailyNeeds?: number
}

export interface SpoonacularNutrientProperty {
  name: string
  amount: number
  unit: string
}

// ============================================================================
// Ingredient Types
// ============================================================================

export interface SpoonacularIngredient {
  id: number
  aisle?: string
  image?: string
  consistency?: string
  name: string
  nameClean?: string
  original: string
  originalName?: string
  amount: number
  unit: string
  meta?: string[]
  measures?: {
    us: {
      amount: number
      unitShort: string
      unitLong: string
    }
    metric: {
      amount: number
      unitShort: string
      unitLong: string
    }
  }
}

// ============================================================================
// Instruction Types
// ============================================================================

export interface SpoonacularAnalyzedInstruction {
  name: string
  steps: SpoonacularStep[]
}

export interface SpoonacularStep {
  number: number
  step: string
  ingredients: SpoonacularStepIngredient[]
  equipment: SpoonacularStepEquipment[]
  length?: {
    number: number
    unit: string
  }
}

export interface SpoonacularStepIngredient {
  id: number
  name: string
  localizedName?: string
  image: string
}

export interface SpoonacularStepEquipment {
  id: number
  name: string
  localizedName?: string
  image: string
  temperature?: {
    number: number
    unit: string
  }
}

// ============================================================================
// Search Types
// ============================================================================

export interface SpoonacularSearchResult {
  results: SpoonacularRecipe[]
  offset: number
  number: number
  totalResults: number
}

export interface SpoonacularAutocompleteResult {
  id: number
  title: string
  imageType: string
}

// ============================================================================
// Search Parameters
// ============================================================================

export interface SpoonacularSearchParams {
  query?: string
  cuisines?: string[] // e.g., ['italian', 'mexican']
  diet?: string // 'vegetarian', 'vegan', 'gluten free', 'ketogenic', 'paleo', etc.
  intolerances?: string[] // e.g., ['dairy', 'egg', 'gluten', 'peanut', 'sesame', 'seafood', 'shellfish', 'soy', 'sulfite', 'tree nut', 'wheat']
  excludeIngredients?: string[] // e.g., ['olives', 'cheese']
  includeIngredients?: string[]
  type?: string // Meal type: 'breakfast', 'main course', 'dessert', 'appetizer', 'snack', etc.
  maxReadyTime?: number // Maximum time in minutes
  minProtein?: number // Minimum amount of protein in grams
  maxCalories?: number // Maximum amount of calories
  minCalories?: number // Minimum amount of calories
  maxCarbs?: number
  minCarbs?: number
  maxFat?: number
  minFat?: number
  number?: number // Results per page (default: 10)
  offset?: number // Pagination offset
  sort?: 'popularity' | 'healthiness' | 'price' | 'time' | 'random' | 'max-used-ingredients' | 'min-missing-ingredients'
  sortDirection?: 'asc' | 'desc'
  addRecipeInformation?: boolean // Include detailed recipe info (costs more points)
  fillIngredients?: boolean // Add ingredient information (costs more points)
}

// ============================================================================
// Cached Recipe Types (Database)
// ============================================================================

export interface CachedSpoonacularRecipe {
  id: string // UUID
  spoonacular_id: number
  title: string
  image_url: string | null
  image_type: string | null
  summary: string | null
  servings: number
  ready_in_minutes: number | null
  calories: number | null
  protein_grams: number | null
  carb_grams: number | null
  fat_grams: number | null
  fiber_grams: number | null
  sugar_grams: number | null
  sodium_mg: number | null
  nutrition_data: any // JSONB
  cuisines: string[]
  dish_types: string[]
  diets: string[]
  ingredients: any // JSONB
  instructions: any // JSONB
  source_url: string | null
  source_name: string | null
  spoonacular_source_url: string | null
  health_score: number | null
  spoonacular_score: number | null
  price_per_serving: number | null
  cheap: boolean
  dairy_free: boolean
  gluten_free: boolean
  ketogenic: boolean
  vegan: boolean
  vegetarian: boolean
  very_healthy: boolean
  very_popular: boolean
  cached_at: string
  cache_expires_at: string
  fetch_count: number
  last_accessed_at: string
  created_at: string
  updated_at: string
}

// ============================================================================
// Search Cache Types
// ============================================================================

export interface SearchCacheEntry {
  id: string
  query_hash: string
  query_params: SpoonacularSearchParams
  recipe_ids: number[]
  total_results: number
  cached_at: string
  expires_at: string
  hit_count: number
  created_at: string
}

// ============================================================================
// User Favorite Types (Extended)
// ============================================================================

export interface UserFavoriteRecipeExtended {
  id: string
  user_id: string
  recipe_id: string | null // For local recipes
  spoonacular_id: number | null // For Spoonacular recipes
  recipe_source: 'local' | 'spoonacular'
  created_at: string
}

// ============================================================================
// Utility Types
// ============================================================================

export type DietType =
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'paleo'
  | 'ketogenic'
  | 'gluten free'
  | 'lacto vegetarian'
  | 'ovo vegetarian'
  | 'primal'
  | 'whole 30'

export type IntoleranceType =
  | 'dairy'
  | 'egg'
  | 'gluten'
  | 'grain'
  | 'peanut'
  | 'seafood'
  | 'sesame'
  | 'shellfish'
  | 'soy'
  | 'sulfite'
  | 'tree nut'
  | 'wheat'

export type CuisineType =
  | 'african'
  | 'american'
  | 'british'
  | 'cajun'
  | 'caribbean'
  | 'chinese'
  | 'eastern european'
  | 'european'
  | 'french'
  | 'german'
  | 'greek'
  | 'indian'
  | 'irish'
  | 'italian'
  | 'japanese'
  | 'jewish'
  | 'korean'
  | 'latin american'
  | 'mediterranean'
  | 'mexican'
  | 'middle eastern'
  | 'nordic'
  | 'southern'
  | 'spanish'
  | 'thai'
  | 'vietnamese'

// ============================================================================
// API Response Types
// ============================================================================

export interface SpoonacularApiError {
  status: string
  code: number
  message: string
}

export interface SpoonacularApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  fromCache?: boolean
  fromLegacy?: boolean
}

// ============================================================================
// Meal Plan Types
// ============================================================================

/**
 * Meal Plan Nutrients (aggregate for the day or week)
 */
export interface SpoonacularMealPlanNutrients {
  calories: number
  protein: number
  fat: number
  carbohydrates: number
}

/**
 * Individual Meal in a Meal Plan
 */
export interface SpoonacularMeal {
  id: number
  title: string
  imageType?: string
  readyInMinutes: number
  servings: number
  sourceUrl: string
}

/**
 * Daily Meal Plan Response (timeFrame = 'day')
 */
export interface SpoonacularDailyMealPlan {
  nutrients: SpoonacularMealPlanNutrients
  meals: SpoonacularMeal[]
}

/**
 * Day within a Weekly Meal Plan
 */
export interface SpoonacularDayPlan {
  meals: SpoonacularMeal[]
  nutrients: SpoonacularMealPlanNutrients
}

/**
 * Weekly Meal Plan Response (timeFrame = 'week')
 */
export interface SpoonacularWeeklyMealPlan {
  week: {
    monday: SpoonacularDayPlan
    tuesday: SpoonacularDayPlan
    wednesday: SpoonacularDayPlan
    thursday: SpoonacularDayPlan
    friday: SpoonacularDayPlan
    saturday: SpoonacularDayPlan
    sunday: SpoonacularDayPlan
  }
}

/**
 * Meal Plan Generation Parameters
 */
export interface SpoonacularMealPlanParams {
  timeFrame: 'day' | 'week'
  targetCalories: number
  mealsPerDay?: number
  diet?: string
  exclude?: string
}

/**
 * Cached Meal Plan (Database)
 */
export interface CachedSpoonacularMealPlan {
  id: string
  query_hash: string
  query_params: SpoonacularMealPlanParams
  time_frame: 'day' | 'week'
  target_calories: number
  total_calories: number | null
  total_protein: number | null
  total_carbs: number | null
  total_fat: number | null
  meals: any // JSONB - SpoonacularMeal[]
  week_data: any // JSONB - SpoonacularWeeklyMealPlan
  recipe_ids: number[]
  cached_at: string
  expires_at: string
  hit_count: number
  created_at: string
}
