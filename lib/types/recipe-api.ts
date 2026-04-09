/**
 * Recipe-API.com Type Definitions
 * Based on OpenAPI spec at https://recipe-api.com/docs/openapi.json
 */

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface RecipeApiResponse<T> {
  data: T
  usage?: RecipeApiUsage
}

export interface RecipeApiListResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    per_page: number
    total_capped?: boolean
  }
}

export interface RecipeApiUsage {
  monthly_remaining: number
  monthly_limit: number
  daily_remaining: number
  daily_limit: number
}

export interface RecipeApiError {
  error: {
    code: string
    message: string
  }
}

// ============================================================================
// Recipe Types
// ============================================================================

export interface RecipeApiRecipe {
  id: string // UUID
  name: string
  description: string
  category: string
  cuisine: string
  difficulty: string
  tags: string[]
  meta: RecipeApiMeta
  dietary: RecipeApiDietary
  storage: RecipeApiStorage | null
  equipment: RecipeApiEquipment[]
  ingredients: RecipeApiIngredientGroup[]
  instructions: RecipeApiInstruction[]
  troubleshooting: RecipeApiTroubleshooting[]
  chef_notes: string[]
  cultural_context: string | null
  nutrition: RecipeApiNutrition
}

export interface RecipeApiListItem {
  id: string
  name: string
  description: string
  category: string
  cuisine: string
  difficulty: string
  tags: string[]
  meta: RecipeApiMeta
  dietary: RecipeApiDietary
  nutrition_summary: RecipeApiNutritionSummary
}

// ============================================================================
// Sub-types
// ============================================================================

export interface RecipeApiMeta {
  active_time: string // ISO 8601 duration
  passive_time: string
  total_time: string
  overnight_required: boolean
  yields: string
  yield_count: number
  serving_size_g: number | null
}

export interface RecipeApiDietary {
  flags: string[]
  not_suitable_for: string[]
}

export interface RecipeApiStorage {
  refrigerator: { duration: string; notes: string } | null
  freezer: { duration: string; notes: string } | null
  reheating: string | null
  does_not_keep: boolean
}

export interface RecipeApiEquipment {
  name: string
  required: boolean
  alternative: string | null
}

export interface RecipeApiIngredientGroup {
  group_name: string
  items: RecipeApiIngredient[]
}

export interface RecipeApiIngredient {
  name: string
  quantity: number | null
  unit: string | null
  preparation: string | null
  notes: string | null
  substitutions: string[]
  ingredient_id: string | null
  nutrition_source: string | null
}

export interface RecipeApiInstruction {
  step_number: number
  phase: 'prep' | 'cook' | 'assemble' | 'finish'
  text: string
  structured: RecipeApiStructuredStep | null
  tips: string[]
}

export interface RecipeApiStructuredStep {
  action: string
  temperature: { celsius: number; fahrenheit: number } | null
  duration: string | null
  doneness_cues: { visual: string; tactile: string } | null
}

export interface RecipeApiTroubleshooting {
  symptom: string
  likely_cause: string
  prevention: string
  fix: string
}

export interface RecipeApiNutritionSummary {
  calories: number | null
  protein_g: number | null
  carbohydrates_g: number | null
  fat_g: number | null
}

export interface RecipeApiNutritionPerServing {
  calories: number | null
  protein_g: number | null
  carbohydrates_g: number | null
  fat_g: number | null
  saturated_fat_g: number | null
  trans_fat_g: number | null
  monounsaturated_fat_g: number | null
  polyunsaturated_fat_g: number | null
  fiber_g: number | null
  sugar_g: number | null
  sodium_mg: number | null
  cholesterol_mg: number | null
  potassium_mg: number | null
  calcium_mg: number | null
  iron_mg: number | null
  magnesium_mg: number | null
  phosphorus_mg: number | null
  zinc_mg: number | null
  vitamin_a_mcg: number | null
  vitamin_c_mg: number | null
  vitamin_d_mcg: number | null
  vitamin_e_mg: number | null
  vitamin_k_mcg: number | null
  vitamin_b6_mg: number | null
  vitamin_b12_mcg: number | null
  thiamin_mg: number | null
  riboflavin_mg: number | null
  niacin_mg: number | null
  folate_mcg: number | null
  water_g: number | null
  alcohol_g: number | null
  caffeine_mg: number | null
}

export interface RecipeApiNutrition {
  per_serving: RecipeApiNutritionPerServing
  sources: string[]
}

// ============================================================================
// Search Parameters
// ============================================================================

export interface RecipeApiSearchParams {
  q?: string
  category?: string
  cuisine?: string
  difficulty?: 'Easy' | 'Intermediate' | 'Advanced'
  dietary?: string // comma-separated flags
  min_calories?: number
  max_calories?: number
  min_protein?: number
  max_protein?: number
  min_carbs?: number
  max_carbs?: number
  min_fat?: number
  max_fat?: number
  ingredients?: string // comma-separated UUIDs
  page?: number
  per_page?: number
}

// ============================================================================
// Category/Filter Types
// ============================================================================

export interface RecipeApiCategoryCount {
  name: string
  count: number
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse ISO 8601 duration (e.g., "PT30M", "PT1H30M") to minutes
 */
export function parseISODuration(duration: string | null | undefined): number | null {
  if (!duration) return null

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return null

  const hours = match[1] ? parseInt(match[1], 10) : 0
  const minutes = match[2] ? parseInt(match[2], 10) : 0

  return hours * 60 + minutes || null
}
