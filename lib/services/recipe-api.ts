/**
 * Recipe-API.com Service
 *
 * Handles all interactions with Recipe-API.com including:
 * - Simple X-API-Key authentication (no OAuth, no IP restrictions)
 * - Recipe search and detail retrieval
 * - Category/cuisine discovery
 * - Response normalization to NormalizedRecipe format
 * - Supabase-backed caching (7 days search, 30 days details)
 * - Request deduplication
 */

import { createClient } from '@/lib/supabase/server'
import type {
  RecipeApiRecipe,
  RecipeApiListItem,
  RecipeApiSearchParams,
  RecipeApiResponse,
  RecipeApiListResponse,
  RecipeApiError,
  RecipeApiCategoryCount,
} from '@/lib/types/recipe-api'
import { parseISODuration } from '@/lib/types/recipe-api'
import type {
  NormalizedRecipe,
  NormalizedIngredient,
  NormalizedInstruction,
} from '@/lib/types/recipe'

// ============================================================================
// Configuration
// ============================================================================

const RECIPE_API_BASE_URL = 'https://recipe-api.com/api/v1'

// Cache TTLs
const CACHE_TTL = {
  search: 7 * 24 * 60 * 60 * 1000, // 7 days
  recipeDetails: 30 * 24 * 60 * 60 * 1000, // 30 days
}

// ============================================================================
// Service Class
// ============================================================================

export class RecipeApiService {
  private _apiKey: string | null = null

  // Request deduplication
  private inflightRequests = new Map<string, Promise<unknown>>()

  private get apiKey(): string {
    if (!this._apiKey) {
      const key = process.env.RECIPE_API_KEY
      if (!key) {
        throw new Error('RECIPE_API_KEY environment variable is required')
      }
      this._apiKey = key
    }
    return this._apiKey
  }

  // ==========================================================================
  // API Request Helper
  // ==========================================================================

  private async apiRequest<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>
  ): Promise<T> {
    const url = new URL(`${RECIPE_API_BASE_URL}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value))
        }
      })
    }

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': this.apiKey,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null) as RecipeApiError | null
      const errorMessage = errorBody?.error?.message || `HTTP ${response.status}`
      throw new Error(`Recipe API error: ${errorMessage}`)
    }

    return response.json() as Promise<T>
  }

  // ==========================================================================
  // Cache Helpers
  // ==========================================================================

  private async generateCacheKey(prefix: string, params: Record<string, unknown>): Promise<string> {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined) {
          acc[key] = params[key]
        }
        return acc
      }, {} as Record<string, unknown>)

    const paramsString = JSON.stringify(sortedParams)
    const encoder = new TextEncoder()
    const data = encoder.encode(paramsString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    return `${prefix}:${hashHex}`
  }

  // ==========================================================================
  // Recipe Search
  // ==========================================================================

  async searchRecipes(params: RecipeApiSearchParams): Promise<RecipeApiListResponse<RecipeApiListItem>> {
    const cacheKey = await this.generateCacheKey('recipe_search', params as Record<string, unknown>)

    // Check for in-flight request
    if (this.inflightRequests.has(cacheKey)) {
      return this.inflightRequests.get(cacheKey) as Promise<RecipeApiListResponse<RecipeApiListItem>>
    }

    const searchPromise = this._searchRecipesInternal(params, cacheKey)
    this.inflightRequests.set(cacheKey, searchPromise)
    searchPromise.finally(() => this.inflightRequests.delete(cacheKey))

    return searchPromise
  }

  private async _searchRecipesInternal(
    params: RecipeApiSearchParams,
    cacheKey: string
  ): Promise<RecipeApiListResponse<RecipeApiListItem>> {
    const supabase = await createClient()

    // Check cache
    const { data: cached } = await supabase
      .from('recipe_api_search_cache')
      .select('*')
      .eq('query_hash', cacheKey)
      .eq('search_type', 'recipe')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cached) {
      // Increment hit count
      await supabase
        .from('recipe_api_search_cache')
        .update({ hit_count: cached.hit_count + 1 })
        .eq('id', cached.id)

      // Fetch cached recipes
      const { data: recipes } = await supabase
        .from('recipe_api_cache')
        .select('*')
        .in('recipe_api_id', cached.result_ids)

      if (recipes && recipes.length > 0) {
        return {
          data: recipes.map(r => ({
            id: r.recipe_api_id,
            name: r.name,
            description: r.description || '',
            category: r.category || '',
            cuisine: r.cuisine || '',
            difficulty: r.difficulty || '',
            tags: r.tags || [],
            meta: r.meta || {
              active_time: '', passive_time: '', total_time: '',
              overnight_required: false, yields: '', yield_count: 1, serving_size_g: null,
            },
            dietary: { flags: [], not_suitable_for: [] },
            nutrition_summary: {
              calories: r.nutrition?.per_serving?.calories ?? null,
              protein_g: r.nutrition?.per_serving?.protein_g ?? null,
              carbohydrates_g: r.nutrition?.per_serving?.carbohydrates_g ?? null,
              fat_g: r.nutrition?.per_serving?.fat_g ?? null,
            },
          })),
          meta: {
            total: cached.total_results,
            page: params.page || 1,
            per_page: params.per_page || 20,
          },
        }
      }
    }

    // Cache miss - call API
    const response = await this.apiRequest<RecipeApiListResponse<RecipeApiListItem>>('/recipes', {
      q: params.q,
      category: params.category,
      cuisine: params.cuisine,
      difficulty: params.difficulty,
      dietary: params.dietary,
      min_calories: params.min_calories,
      max_calories: params.max_calories,
      min_protein: params.min_protein,
      max_protein: params.max_protein,
      min_carbs: params.min_carbs,
      max_carbs: params.max_carbs,
      min_fat: params.min_fat,
      max_fat: params.max_fat,
      ingredients: params.ingredients,
      page: params.page,
      per_page: params.per_page,
    })

    // Cache results
    if (response.data && response.data.length > 0) {
      const recipeIds = response.data.map(r => r.id)

      // Cache search
      await supabase.from('recipe_api_search_cache').upsert({
        query_hash: cacheKey,
        search_type: 'recipe',
        query_params: params,
        result_ids: recipeIds,
        total_results: response.meta.total,
        expires_at: new Date(Date.now() + CACHE_TTL.search).toISOString(),
      }, { onConflict: 'query_hash' })

      // Cache individual recipes (lightweight)
      for (const recipe of response.data) {
        await this.cacheRecipeLightweight(recipe)
      }
    }

    return response
  }

  // ==========================================================================
  // Recipe Details
  // ==========================================================================

  async getRecipeDetails(recipeId: string): Promise<RecipeApiRecipe | null> {
    const supabase = await createClient()

    // Check cache for full details
    const { data: cached } = await supabase
      .from('recipe_api_cache')
      .select('*')
      .eq('recipe_api_id', recipeId)
      .gt('cache_expires_at', new Date().toISOString())
      .single()

    if (cached?.ingredients && cached?.instructions) {
      // Update access tracking
      await supabase
        .from('recipe_api_cache')
        .update({
          fetch_count: cached.fetch_count + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', cached.id)

      return this.convertCachedRecipe(cached)
    }

    // Cache miss - call API
    try {
      const response = await this.apiRequest<RecipeApiResponse<RecipeApiRecipe>>(
        `/recipes/${recipeId}`
      )

      if (response.data) {
        await this.cacheRecipeFull(response.data)
      }

      return response.data || null
    } catch (error) {
      console.error(`[RecipeApi] Failed to get recipe ${recipeId}:`, error)
      return null
    }
  }

  // ==========================================================================
  // Discovery Endpoints
  // ==========================================================================

  async getCategories(): Promise<RecipeApiCategoryCount[]> {
    const response = await this.apiRequest<RecipeApiListResponse<RecipeApiCategoryCount> | RecipeApiCategoryCount[]>(
      '/categories'
    )
    return Array.isArray(response) ? response : (response.data ?? [])
  }

  async getCuisines(): Promise<RecipeApiCategoryCount[]> {
    const response = await this.apiRequest<RecipeApiListResponse<RecipeApiCategoryCount> | RecipeApiCategoryCount[]>(
      '/cuisines'
    )
    return Array.isArray(response) ? response : (response.data ?? [])
  }

  async getDietaryFlags(): Promise<RecipeApiCategoryCount[]> {
    const response = await this.apiRequest<RecipeApiListResponse<RecipeApiCategoryCount> | RecipeApiCategoryCount[]>(
      '/dietary-flags'
    )
    return Array.isArray(response) ? response : (response.data ?? [])
  }

  // ==========================================================================
  // Normalization
  // ==========================================================================

  normalizeRecipe(recipe: RecipeApiRecipe, imageUrl: string | null): NormalizedRecipe {
    const ingredients: NormalizedIngredient[] = recipe.ingredients.flatMap(
      (group) => group.items.map((item) => ({
        foodId: item.ingredient_id || '',
        name: item.name,
        amount: item.quantity || 0,
        unit: item.unit || '',
        description: [
          item.quantity,
          item.unit,
          item.name,
          item.preparation ? `(${item.preparation})` : '',
        ].filter(Boolean).join(' '),
      }))
    )

    const instructions: NormalizedInstruction[] = recipe.instructions.map((step) => ({
      stepNumber: step.step_number,
      instruction: step.text,
    }))

    const nutrition = recipe.nutrition.per_serving

    return {
      id: recipe.id,
      source: 'recipe-api',
      title: recipe.name,
      description: recipe.description,
      imageUrl,
      sourceUrl: '',
      servings: recipe.meta.yield_count || 1,
      prepTimeMinutes: parseISODuration(recipe.meta.active_time),
      cookTimeMinutes: parseISODuration(recipe.meta.passive_time),
      totalTimeMinutes: parseISODuration(recipe.meta.total_time),
      calories: nutrition.calories || 0,
      protein: nutrition.protein_g || 0,
      carbs: nutrition.carbohydrates_g || 0,
      fat: nutrition.fat_g || 0,
      fiber: nutrition.fiber_g,
      sugar: nutrition.sugar_g,
      ingredients,
      instructions,
      categories: [recipe.category],
      recipeTypes: recipe.tags,
      rating: null,
    }
  }

  normalizeListItem(
    item: RecipeApiListItem,
    imageUrl: string | null
  ): {
    id: string
    title: string
    description: string
    imageUrl: string | null
    calories: number
    protein: number
    carbs: number
    fat: number
  } {
    return {
      id: item.id,
      title: item.name,
      description: item.description,
      imageUrl,
      calories: item.nutrition_summary.calories || 0,
      protein: item.nutrition_summary.protein_g || 0,
      carbs: item.nutrition_summary.carbohydrates_g || 0,
      fat: item.nutrition_summary.fat_g || 0,
    }
  }

  // ==========================================================================
  // Cache Storage Helpers
  // ==========================================================================

  private async cacheRecipeLightweight(recipe: RecipeApiListItem): Promise<void> {
    try {
      const supabase = await createClient()

      await supabase.from('recipe_api_cache').upsert({
        recipe_api_id: recipe.id,
        name: recipe.name,
        description: recipe.description || null,
        category: recipe.category || null,
        cuisine: recipe.cuisine || null,
        difficulty: recipe.difficulty || null,
        tags: recipe.tags || [],
        nutrition: { per_serving: recipe.nutrition_summary },
        meta: recipe.meta,
        cache_expires_at: new Date(Date.now() + CACHE_TTL.recipeDetails).toISOString(),
      }, { onConflict: 'recipe_api_id', ignoreDuplicates: false })
    } catch (error) {
      console.error('[RecipeApi] Error caching recipe:', error)
    }
  }

  private async cacheRecipeFull(recipe: RecipeApiRecipe): Promise<void> {
    try {
      const supabase = await createClient()

      await supabase.from('recipe_api_cache').upsert({
        recipe_api_id: recipe.id,
        name: recipe.name,
        description: recipe.description || null,
        category: recipe.category || null,
        cuisine: recipe.cuisine || null,
        difficulty: recipe.difficulty || null,
        tags: recipe.tags || [],
        nutrition: recipe.nutrition,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        meta: recipe.meta,
        cache_expires_at: new Date(Date.now() + CACHE_TTL.recipeDetails).toISOString(),
      }, { onConflict: 'recipe_api_id' })
    } catch (error) {
      console.error('[RecipeApi] Error caching recipe:', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private convertCachedRecipe(cached: Record<string, any>): RecipeApiRecipe {
    return {
      id: cached.recipe_api_id as string,
      name: cached.name as string,
      description: (cached.description as string) || '',
      category: (cached.category as string) || '',
      cuisine: (cached.cuisine as string) || '',
      difficulty: (cached.difficulty as string) || '',
      tags: (cached.tags as string[]) || [],
      meta: (cached.meta as RecipeApiRecipe['meta']) || {
        active_time: '', passive_time: '', total_time: '',
        overnight_required: false, yields: '', yield_count: 1, serving_size_g: null,
      },
      dietary: { flags: [], not_suitable_for: [] },
      storage: null,
      equipment: [],
      ingredients: (cached.ingredients as RecipeApiRecipe['ingredients']) || [],
      instructions: (cached.instructions as RecipeApiRecipe['instructions']) || [],
      troubleshooting: [],
      chef_notes: [],
      cultural_context: null,
      nutrition: (cached.nutrition as RecipeApiRecipe['nutrition']) || {
        per_serving: {
          calories: null, protein_g: null, carbohydrates_g: null, fat_g: null,
          saturated_fat_g: null, trans_fat_g: null, monounsaturated_fat_g: null,
          polyunsaturated_fat_g: null, fiber_g: null, sugar_g: null, sodium_mg: null,
          cholesterol_mg: null, potassium_mg: null, calcium_mg: null, iron_mg: null,
          magnesium_mg: null, phosphorus_mg: null, zinc_mg: null, vitamin_a_mcg: null,
          vitamin_c_mg: null, vitamin_d_mcg: null, vitamin_e_mg: null, vitamin_k_mcg: null,
          vitamin_b6_mg: null, vitamin_b12_mcg: null, thiamin_mg: null, riboflavin_mg: null,
          niacin_mg: null, folate_mcg: null, water_g: null, alcohol_g: null, caffeine_mg: null,
        },
        sources: [],
      },
    }
  }
}

// Singleton instance
export const recipeApiService = new RecipeApiService()
