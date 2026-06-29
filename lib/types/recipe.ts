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
  cuisine?: string | null
  dietary_flags?: string[]
  batch_prep_score?: number | null
  storage_fridge_days?: number | null
  storage_freezer_days?: number | null
  reheating_notes?: string | null
  source?: string | null
  source_id?: string | null
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

// ============================================================================
// Normalized Types (Provider-agnostic)
// Used throughout the app for recipe data from any external API
// ============================================================================

/**
 * Normalized recipe format for consistent handling in the app
 */
export interface NormalizedRecipe {
  id: string
  source: 'recipe-api' | 'fatsecret' | 'library'
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
  // Rich detail fields (present when the provider supplies them)
  cuisine?: string | null
  difficulty?: string | null
  dietaryFlags?: string[]
  yields?: string | null
  overnightRequired?: boolean
  ingredientGroups?: NormalizedIngredientGroup[]
  equipment?: NormalizedEquipment[]
  storage?: NormalizedStorage | null
  chefNotes?: string[]
  troubleshooting?: NormalizedTroubleshooting[]
  culturalContext?: string | null
  nutritionDetail?: NormalizedNutritionDetail | null
}

export interface NormalizedIngredient {
  foodId: string
  name: string
  amount: number
  unit: string
  description: string
}

export interface NormalizedIngredientDetail extends NormalizedIngredient {
  preparation: string | null
  notes: string | null
  substitutions: string[]
}

export interface NormalizedIngredientGroup {
  groupName: string
  items: NormalizedIngredientDetail[]
}

export interface NormalizedInstruction {
  stepNumber: number
  instruction: string
  phase?: 'prep' | 'cook' | 'assemble' | 'finish'
  tips?: string[]
}

export interface NormalizedEquipment {
  name: string
  required: boolean
  alternative: string | null
}

export interface NormalizedStorage {
  refrigerator: { duration: string; notes: string } | null
  freezer: { duration: string; notes: string } | null
  reheating: string | null
  doesNotKeep: boolean
}

export interface NormalizedTroubleshooting {
  symptom: string
  likelyCause: string
  prevention: string
  fix: string
}

/** Extended per-serving nutrition beyond the core macros (all optional). */
export interface NormalizedNutritionDetail {
  saturatedFat: number | null
  sodium: number | null
  cholesterol: number | null
  potassium: number | null
  calcium: number | null
  iron: number | null
  magnesium: number | null
  zinc: number | null
  vitaminC: number | null
  vitaminD: number | null
  vitaminB12: number | null
  folate: number | null
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
// Utility Functions
// ============================================================================

/**
 * Helper to ensure arrays (some APIs return single objects when only 1 result)
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
