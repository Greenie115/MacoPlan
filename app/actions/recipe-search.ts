'use server'

/**
 * Recipe Search Server Actions
 *
 * Server-side actions for searching and retrieving recipe data
 * from Recipe-API.com + Unsplash images.
 */

import { recipeApiService } from '@/lib/services/recipe-api'
import { unsplashService } from '@/lib/services/unsplash'
import { mealPlanGeneratorService } from '@/lib/services/meal-plan-generator'
import type {
  NormalizedRecipe,
  DailyMealPlan,
  WeeklyMealPlan,
  MealPlanGenerationParams,
} from '@/lib/types/recipe'
import type { RecipeApiSearchParams } from '@/lib/types/recipe-api'

// ============================================================================
// Recipe Search Actions
// ============================================================================

/**
 * Search for recipes via Recipe-API.com
 */
export async function searchRecipes(params: RecipeApiSearchParams): Promise<{
  success: boolean
  data?: {
    recipes: Array<{
      id: string
      title: string
      description: string
      imageUrl: string | null
      calories: number
      protein: number
      carbs: number
      fat: number
    }>
    totalResults: number
    page: number
  }
  error?: string
}> {
  try {
    const response = await recipeApiService.searchRecipes(params)

    if (!response.data || response.data.length === 0) {
      return {
        success: true,
        data: {
          recipes: [],
          totalResults: 0,
          page: params.page || 1,
        },
      }
    }

    // Fetch images for all results in parallel
    const imageMap = await unsplashService.getImagesForRecipes(
      response.data.map(r => ({ id: r.id, name: r.name }))
    )

    return {
      success: true,
      data: {
        recipes: response.data.map(r => {
          const image = imageMap.get(r.id)
          return recipeApiService.normalizeListItem(r, image?.url || null)
        }),
        totalResults: response.meta.total,
        page: params.page || 1,
      },
    }
  } catch (error) {
    console.error('[searchRecipes] Error:', error)
    return {
      success: false,
      error: 'Failed to search recipes',
    }
  }
}

/**
 * Get detailed recipe information by ID
 */
export async function getRecipeDetails(recipeId: string): Promise<{
  success: boolean
  data?: NormalizedRecipe
  error?: string
}> {
  try {
    const recipe = await recipeApiService.getRecipeDetails(recipeId)

    if (!recipe) {
      return {
        success: false,
        error: 'Recipe not found',
      }
    }

    // Fetch image
    const image = await unsplashService.getImageForRecipe(recipeId, recipe.name)

    return {
      success: true,
      data: recipeApiService.normalizeRecipe(recipe, image?.url || null),
    }
  } catch (error) {
    console.error('[getRecipeDetails] Error:', error)
    return {
      success: false,
      error: 'Failed to get recipe details',
    }
  }
}

/**
 * Get multiple recipes by IDs (for meal plan display)
 */
export async function getMultipleRecipes(recipeIds: string[]): Promise<{
  success: boolean
  data?: NormalizedRecipe[]
  error?: string
}> {
  try {
    const recipes: NormalizedRecipe[] = []

    for (const id of recipeIds) {
      const recipe = await recipeApiService.getRecipeDetails(id)
      if (recipe) {
        const image = await unsplashService.getImageForRecipe(id, recipe.name)
        recipes.push(recipeApiService.normalizeRecipe(recipe, image?.url || null))
      }
    }

    return {
      success: true,
      data: recipes,
    }
  } catch (error) {
    console.error('[getMultipleRecipes] Error:', error)
    return {
      success: false,
      error: 'Failed to get recipes',
    }
  }
}

// ============================================================================
// Meal Plan Generation Actions
// ============================================================================

/**
 * Generate a daily meal plan
 */
export async function generateDailyMealPlan(params: {
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  mealsPerDay?: number
  dietaryPreferences?: string[]
  excludeIngredients?: string[]
}): Promise<{
  success: boolean
  data?: DailyMealPlan
  error?: string
}> {
  try {
    const mealPlan = await mealPlanGeneratorService.generateMealPlan({
      ...params,
      mealsPerDay: params.mealsPerDay || 4,
      days: 1,
    }) as DailyMealPlan

    return {
      success: true,
      data: mealPlan,
    }
  } catch (error) {
    console.error('[generateDailyMealPlan] Error:', error)
    return {
      success: false,
      error: 'Failed to generate meal plan',
    }
  }
}

/**
 * Generate a weekly meal plan
 */
export async function generateWeeklyMealPlan(params: {
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  mealsPerDay?: number
  days?: number
  dietaryPreferences?: string[]
  excludeIngredients?: string[]
}): Promise<{
  success: boolean
  data?: WeeklyMealPlan
  error?: string
}> {
  try {
    const mealPlan = await mealPlanGeneratorService.generateMealPlan({
      ...params,
      mealsPerDay: params.mealsPerDay || 4,
      days: params.days || 7,
    }) as WeeklyMealPlan

    return {
      success: true,
      data: mealPlan,
    }
  } catch (error) {
    console.error('[generateWeeklyMealPlan] Error:', error)
    return {
      success: false,
      error: 'Failed to generate meal plan',
    }
  }
}

// ============================================================================
// Recipe Type Filters
// ============================================================================

/**
 * Get available recipe category filters from Recipe-API.com
 */
export async function getRecipeTypeFilters(): Promise<{
  success: boolean
  data?: Array<{ value: string; label: string }>
  error?: string
}> {
  try {
    const categories = await recipeApiService.getCategories()
    return {
      success: true,
      data: categories.map(c => ({
        value: c.name,
        label: `${c.name} (${c.count})`,
      })),
    }
  } catch (error) {
    console.error('[getRecipeTypeFilters] Error:', error)
    return {
      success: false,
      error: 'Failed to fetch recipe categories',
    }
  }
}

// ============================================================================
// Sort Options
// ============================================================================

/**
 * Get available sort options for recipe search
 */
export async function getSortOptions() {
  return [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'caloriesPerServingAscending', label: 'Calories: Low to High' },
    { value: 'caloriesPerServingDescending', label: 'Calories: High to Low' },
  ]
}
