/**
 * TypeScript types for Supabase database tables
 */

export interface UserProfile {
  id: string
  user_id: string

  // Profile Info
  full_name: string | null
  avatar_url: string | null

  // Step 1: Goal
  goal: 'cut' | 'bulk' | 'maintain' | 'recomp' | null

  // Step 2: Personal Stats
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  sex: 'male' | 'female' | null

  // Step 3: Activity Level
  activity_level: 'sedentary' | 'lightly' | 'moderately' | 'very' | 'extremely' | null

  // Step 4: Dietary Preferences
  dietary_style: 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'paleo' | 'keto' | 'mediterranean' | null
  allergies: string[] | null
  foods_to_avoid: string | null

  // Step 5: Experience Level
  fitness_experience: 'beginner' | 'intermediate' | 'advanced' | null
  tracking_experience: 'never' | 'some' | 'experienced' | null
  meal_prep_skills: 'beginner' | 'intermediate' | 'advanced' | null

  // Step 6: Calculated Values
  bmr: number | null
  tdee: number | null
  target_calories: number | null
  protein_grams: number | null
  carb_grams: number | null
  fat_grams: number | null

  // Status
  onboarding_completed: boolean

  // Settings
  measurement_system: 'imperial' | 'metric' | null

  // Meal Planning Integration
  is_test_user: boolean
  simulated_tier: 'free' | 'paid' | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  subscription_period_end: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Insert type (omits generated fields)
 */
export type UserProfileInsert = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>

/**
 * Update type (all fields optional except user_id)
 */
export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

/**
 * Meal Plan from database
 */
export interface MealPlan {
  id: string
  user_id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  total_days: number
  target_calories: number
  protein_grams: number
  carb_grams: number
  fat_grams: number
  is_active: boolean
  archived: boolean
  completed_at: string | null

  // Enhanced fields for meal plan generation
  plan_source: 'manual' | 'generated'
  is_favorite: boolean
  generation_params: MealPlanGenerationParams | null
  archived_at: string | null

  created_at: string
  updated_at: string
}

/**
 * Insert type for meal plans
 */
export type MealPlanInsert = Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>

/**
 * Update type for meal plans
 */
export type MealPlanUpdate = Partial<Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

/**
 * Meal Plan Meal (junction table for recipes in meal plans)
 */
export interface MealPlanMeal {
  id: string
  meal_plan_id: string

  // Day and Meal Type
  day_index: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  meal_order: number

  // Recipe Reference
  recipe_id: string | null
  spoonacular_id: number | null
  fatsecret_id: string | null
  recipe_api_id: string | null
  recipe_source: 'local' | 'spoonacular' | 'fatsecret' | 'recipe-api'

  // Cached Recipe Data
  recipe_title: string
  recipe_image_url: string | null
  servings: number
  ready_in_minutes: number | null

  // Nutritional Info
  calories: number | null
  protein_grams: number | null
  carb_grams: number | null
  fat_grams: number | null

  // Customization
  serving_multiplier: number
  notes: string | null

  created_at: string
  updated_at: string
}

export type MealPlanMealInsert = Omit<MealPlanMeal, 'id' | 'created_at' | 'updated_at'>
export type MealPlanMealUpdate = Partial<Omit<MealPlanMeal, 'id' | 'meal_plan_id' | 'created_at' | 'updated_at'>>

/**
 * Shopping List
 */
export interface ShoppingList {
  id: string
  user_id: string
  meal_plan_id: string

  name: string
  start_date: string
  end_date: string

  ingredients: CategorizedIngredients
  checked_items: string[]

  last_exported_pdf_at: string | null
  last_exported_csv_at: string | null

  created_at: string
  updated_at: string
}

export type ShoppingListInsert = Omit<ShoppingList, 'id' | 'created_at' | 'updated_at'>
export type ShoppingListUpdate = Partial<Omit<ShoppingList, 'id' | 'user_id' | 'meal_plan_id' | 'created_at' | 'updated_at'>>

/**
 * Meal Plan Generation Quota
 */
export interface MealPlanGenerationQuota {
  id: string
  user_id: string

  total_generated: number
  free_tier_generated: number
  current_period_generated: number
  free_tier_swaps: number

  stripe_subscription_id: string | null
  period_start_date: string
  period_end_date: string | null

  last_generation_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Meal Plan Generation Parameters
 */
export interface MealPlanGenerationParams {
  timeFrame: 'day' | 'week'
  numberOfDays?: number
  targetCalories: number
  mealsPerDay?: number
  diet?: string
  exclude?: string
}

/**
 * Categorized Ingredients for Shopping List
 */
export interface CategorizedIngredients {
  produce: ShoppingListIngredient[]
  dairy: ShoppingListIngredient[]
  meat: ShoppingListIngredient[]
  pantry: ShoppingListIngredient[]
  bakery: ShoppingListIngredient[]
  frozen: ShoppingListIngredient[]
  other: ShoppingListIngredient[]
}

/**
 * Shopping List Ingredient
 */
export interface ShoppingListIngredient {
  id: string
  name: string
  amount: number
  unit: string
  original: string
  aisle?: string
}

/**
 * User Training Profile (Batch Prep Mode)
 */
export interface UserTrainingProfile {
  id: string
  user_id: string
  training_days_per_week: number
  training_day_macros: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
  rest_day_macros: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
  prep_day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  containers_per_week: number
  max_prep_time_mins: number
  created_at: string
  updated_at: string
}

/**
 * Batch Prep Plan DB row (JSONB fields validated via Zod in service layer)
 */
export interface BatchPrepPlanRow {
  id: string
  user_id: string
  week_starting: string
  training_day_plan: unknown
  rest_day_plan: unknown
  prep_timeline: unknown
  shopping_list: unknown
  container_assignments: unknown
  total_containers: number
  estimated_prep_time_mins: number
  generation_params: unknown | null
  created_at: string
}

/**
 * Anthropic Usage Log row (observability)
 */
export interface AnthropicUsageLogRow {
  id: string
  user_id: string | null
  endpoint: string
  model: string
  input_tokens: number
  output_tokens: number
  status: 'success' | 'validation_fail' | 'retry' | 'error'
  error_message: string | null
  created_at: string
}
