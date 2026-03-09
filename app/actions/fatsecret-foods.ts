'use server'

/**
 * FatSecret Food Server Actions
 *
 * Server-side actions for searching and retrieving food/ingredient data from FatSecret API
 */

import { fatSecretService } from '@/lib/services/fatsecret'
import type {
  FatSecretFoodSearchParams,
  NormalizedNutrition,
} from '@/lib/types/fatsecret'

// ============================================================================
// Food Search Actions
// ============================================================================

/**
 * Search for foods in the FatSecret database
 */
export async function searchFoods(params: FatSecretFoodSearchParams): Promise<{
  success: boolean
  data?: {
    foods: Array<{
      id: string
      name: string
      type: 'Brand' | 'Generic'
      brandName: string | null
      description: string
      url: string
    }>
    totalResults: number
    page: number
  }
  error?: string
}> {
  try {
    const response = await fatSecretService.searchFoods(params)

    if (!response.foods?.food) {
      return {
        success: true,
        data: {
          foods: [],
          totalResults: 0,
          page: params.page_number || 0,
        },
      }
    }

    const foods = Array.isArray(response.foods.food)
      ? response.foods.food
      : [response.foods.food]

    return {
      success: true,
      data: {
        foods: foods.map(f => ({
          id: f.food_id,
          name: f.food_name,
          type: f.food_type,
          brandName: f.brand_name || null,
          description: f.food_description || '',
          url: f.food_url,
        })),
        totalResults: parseInt(response.foods.total_results),
        page: params.page_number || 0,
      },
    }
  } catch (error) {
    console.error('[searchFoods] Error:', error)
    return {
      success: false,
      error: 'Failed to search foods',
    }
  }
}

/**
 * Get detailed food information with all servings
 */
export async function getFoodDetails(foodId: string): Promise<{
  success: boolean
  data?: {
    id: string
    name: string
    type: 'Brand' | 'Generic'
    brandName: string | null
    url: string
    servings: NormalizedNutrition[]
    defaultServing: NormalizedNutrition | null
  }
  error?: string
}> {
  try {
    const food = await fatSecretService.getFoodDetails(foodId)

    if (!food) {
      return {
        success: false,
        error: 'Food not found',
      }
    }

    const servingsRaw = food.servings?.serving
    const servings = servingsRaw
      ? (Array.isArray(servingsRaw) ? servingsRaw : [servingsRaw])
      : []

    const normalizedServings = servings.map(s => fatSecretService.normalizeNutrition(s))
    const defaultServing = normalizedServings.find((_, i) => servings[i].is_default === '1')
      || normalizedServings[0]
      || null

    return {
      success: true,
      data: {
        id: food.food_id,
        name: food.food_name,
        type: food.food_type,
        brandName: food.brand_name || null,
        url: food.food_url,
        servings: normalizedServings,
        defaultServing,
      },
    }
  } catch (error) {
    console.error('[getFoodDetails] Error:', error)
    return {
      success: false,
      error: 'Failed to get food details',
    }
  }
}

/**
 * Autocomplete search for foods (for quick search UI)
 */
export async function autocompleteFoods(query: string): Promise<{
  success: boolean
  data?: Array<{
    id: string
    name: string
    type: 'Brand' | 'Generic'
    brandName: string | null
  }>
  error?: string
}> {
  if (!query || query.length < 2) {
    return {
      success: true,
      data: [],
    }
  }

  try {
    const response = await fatSecretService.searchFoods({
      search_expression: query,
      max_results: 10,
    })

    if (!response.foods?.food) {
      return {
        success: true,
        data: [],
      }
    }

    const foods = Array.isArray(response.foods.food)
      ? response.foods.food
      : [response.foods.food]

    return {
      success: true,
      data: foods.map(f => ({
        id: f.food_id,
        name: f.food_name,
        type: f.food_type,
        brandName: f.brand_name || null,
      })),
    }
  } catch (error) {
    console.error('[autocompleteFoods] Error:', error)
    return {
      success: false,
      error: 'Failed to search foods',
    }
  }
}

/**
 * Get nutrition for a specific food and serving
 */
export async function getFoodNutrition(
  foodId: string,
  servingId?: string
): Promise<{
  success: boolean
  data?: NormalizedNutrition
  error?: string
}> {
  try {
    const food = await fatSecretService.getFoodDetails(foodId)

    if (!food?.servings?.serving) {
      return {
        success: false,
        error: 'Food not found or has no nutrition data',
      }
    }

    const servings = Array.isArray(food.servings.serving)
      ? food.servings.serving
      : [food.servings.serving]

    // Find requested serving or default
    let serving = servingId
      ? servings.find(s => s.serving_id === servingId)
      : servings.find(s => s.is_default === '1') || servings[0]

    if (!serving) {
      return {
        success: false,
        error: 'Serving not found',
      }
    }

    return {
      success: true,
      data: fatSecretService.normalizeNutrition(serving),
    }
  } catch (error) {
    console.error('[getFoodNutrition] Error:', error)
    return {
      success: false,
      error: 'Failed to get nutrition data',
    }
  }
}
