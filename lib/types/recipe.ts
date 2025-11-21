/**
 * Recipe Type Definitions
 * TypeScript interfaces for the MacroPlan recipe system
 */

export interface Recipe {
  id: string
  name: string
  description: string | null
  image_url: string | null
  calories: number
  protein_grams: number
  carb_grams: number
  fat_grams: number
  fiber_grams?: number | null
  sugar_grams?: number | null
  sodium_mg?: number | null
  cholesterol_mg?: number | null
  saturated_fat_grams?: number | null
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  total_time_minutes: number | null
  servings: number
  difficulty: 'easy' | 'medium' | 'hard' | null
  rating: number
  rating_count: number
  created_at: string
  updated_at: string
}

export interface RecipeTag {
  id: string
  recipe_id: string
  tag: string
  created_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  ingredient: string
  amount: string
  unit: string | null
  order_index: number
  created_at: string
}

export interface RecipeInstruction {
  id: string
  recipe_id: string
  step_number: number
  instruction: string
  created_at: string
}

export interface UserFavoriteRecipe {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
}

/**
 * Extended recipe with all related data
 * Used for recipe detail page
 */
export interface RecipeWithDetails extends Recipe {
  tags: RecipeTag[]
  ingredients: RecipeIngredient[]
  instructions: RecipeInstruction[]
}

/**
 * Filter tags used in the recipe library
 */
export type RecipeFilterTag =
  | 'high-protein'
  | 'low-carb'
  | 'quick'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'keto'
  | 'gluten-free'

/**
 * Recipe difficulty levels
 */
export type RecipeDifficulty = 'easy' | 'medium' | 'hard'

/**
 * Recipe search and filter params
 */
export interface RecipeFilters {
  searchQuery?: string
  tags?: RecipeFilterTag[]
  difficulty?: RecipeDifficulty
  maxCalories?: number
  minProtein?: number
}

/**
 * Macros for a recipe
 * Represents macros per serving
 */
export interface RecipeMacros {
  calories: number
  protein: number
  carbs: number
  fat: number
}
