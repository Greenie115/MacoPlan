'use server'

/**
 * Recipe Detail Server Action (legacy)
 *
 * Recipe-API.com is no longer used for browsing or generation. This remains
 * only to render recipes from pre-pivot meal plans / old favorites that store a
 * Recipe-API id (see recipes/[id] detail fallback and shopping-lists). Remove
 * once legacy meal_plans are sunset.
 */

import { recipeApiService } from '@/lib/services/recipe-api'
import { unsplashService } from '@/lib/services/unsplash'
import type { NormalizedRecipe } from '@/lib/types/recipe'

/**
 * Get detailed recipe information by Recipe-API id (legacy data only).
 */
export async function getRecipeDetails(recipeId: string): Promise<{
  success: boolean
  data?: NormalizedRecipe
  error?: string
}> {
  try {
    const recipe = await recipeApiService.getRecipeDetails(recipeId)

    if (!recipe) {
      return { success: false, error: 'Recipe not found' }
    }

    const image = await unsplashService.getImageForRecipe(recipeId, recipe.name)

    return {
      success: true,
      data: recipeApiService.normalizeRecipe(recipe, image?.url || null),
    }
  } catch (error) {
    console.error('[getRecipeDetails] Error:', error)
    return { success: false, error: 'Failed to get recipe details' }
  }
}
