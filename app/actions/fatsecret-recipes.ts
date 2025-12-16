'use server'

/**
 * FatSecret Recipe Server Actions
 *
 * Server-side actions for searching and retrieving recipe data from FatSecret API
 */

import { fatSecretService } from '@/lib/services/fatsecret'
import { fatSecretMealPlanService } from '@/lib/services/fatsecret-meal-plans'
import type {
  FatSecretRecipeSearchParams,
  NormalizedRecipe,
  DailyMealPlan,
  WeeklyMealPlan,
  MealPlanGenerationParams,
} from '@/lib/types/fatsecret'

// ============================================================================
// Recipe Search Actions
// ============================================================================

/**
 * Search for recipes in the FatSecret database
 */
export async function searchRecipes(params: FatSecretRecipeSearchParams): Promise<{
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
    const response = await fatSecretService.searchRecipes(params)

    if (!response.recipes?.recipe) {
      return {
        success: true,
        data: {
          recipes: [],
          totalResults: 0,
          page: params.page_number || 0,
        },
      }
    }

    const recipes = Array.isArray(response.recipes.recipe)
      ? response.recipes.recipe
      : [response.recipes.recipe]

    return {
      success: true,
      data: {
        recipes: recipes.map(r => ({
          id: r.recipe_id,
          title: r.recipe_name,
          description: r.recipe_description || '',
          imageUrl: r.recipe_image || null,
          calories: r.recipe_nutrition ? parseFloat(r.recipe_nutrition.calories) : 0,
          protein: r.recipe_nutrition ? parseFloat(r.recipe_nutrition.protein) : 0,
          carbs: r.recipe_nutrition ? parseFloat(r.recipe_nutrition.carbohydrate) : 0,
          fat: r.recipe_nutrition ? parseFloat(r.recipe_nutrition.fat) : 0,
        })),
        totalResults: parseInt(response.recipes.total_results),
        page: params.page_number || 0,
      },
    }
  } catch (error) {
    console.error('[searchRecipes] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search recipes',
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
    const recipe = await fatSecretService.getRecipeDetails(recipeId)

    if (!recipe) {
      return {
        success: false,
        error: 'Recipe not found',
      }
    }

    return {
      success: true,
      data: fatSecretService.normalizeRecipe(recipe),
    }
  } catch (error) {
    console.error('[getRecipeDetails] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recipe details',
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
      const recipe = await fatSecretService.getRecipeDetails(id)
      if (recipe) {
        recipes.push(fatSecretService.normalizeRecipe(recipe))
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
      error: error instanceof Error ? error.message : 'Failed to get recipes',
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
    const mealPlan = await fatSecretMealPlanService.generateMealPlan({
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
      error: error instanceof Error ? error.message : 'Failed to generate meal plan',
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
    const mealPlan = await fatSecretMealPlanService.generateMealPlan({
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
      error: error instanceof Error ? error.message : 'Failed to generate meal plan',
    }
  }
}

// ============================================================================
// Recipe Type Filters
// ============================================================================

/**
 * Get available recipe type filters
 * These are the valid recipe types from the FatSecret API (recipe_types.get endpoint)
 */
export async function getRecipeTypeFilters(): Promise<{
  success: boolean
  data?: Array<{ value: string; label: string }>
}> {
  return {
    success: true,
    data: [
      { value: 'Appetizers', label: 'Appetizers' },
      { value: 'Baked', label: 'Baked' },
      { value: 'Beverages', label: 'Beverages' },
      { value: 'Breads', label: 'Breads' },
      { value: 'Breakfast', label: 'Breakfast' },
      { value: 'Desserts', label: 'Desserts' },
      { value: 'Main Dishes', label: 'Main Dishes' },
      { value: 'Preserving', label: 'Preserving' },
      { value: 'Salads', label: 'Salads' },
      { value: 'Sandwiches', label: 'Sandwiches' },
      { value: 'Sauces and Condiments', label: 'Sauces & Condiments' },
      { value: 'Side Dishes', label: 'Side Dishes' },
      { value: 'Soups', label: 'Soups' },
      { value: 'Vegetables', label: 'Vegetables' },
    ],
  }
}
