/**
 * FatSecret API Service
 *
 * Handles all interactions with FatSecret Platform API including:
 * - OAuth 2.0 token management (auto-refresh)
 * - Rate limiting (5,000 calls/day)
 * - Aggressive caching
 * - Error handling and retries
 * - Request deduplication
 */

import { createClient } from '@/lib/supabase/server'
import type {
  FatSecretTokenResponse,
  FatSecretFoodSearchParams,
  FatSecretFoodSearchResponse,
  FatSecretFoodDetailResponse,
  FatSecretRecipeSearchParams,
  FatSecretRecipeSearchResponse,
  FatSecretRecipeDetailResponse,
  FatSecretRecipeTypesResponse,
  FatSecretFood,
  FatSecretRecipeDetail,
  FatSecretServing,
  NormalizedRecipe,
  NormalizedNutrition,
  CachedFatSecretRecipe,
  ensureArray,
  parseNumber,
} from '@/lib/types/fatsecret'

// Re-export utility functions
export { ensureArray, parseNumber } from '@/lib/types/fatsecret'

// ============================================================================
// Configuration
// ============================================================================

const FATSECRET_TOKEN_URL = 'https://oauth.fatsecret.com/connect/token'
const FATSECRET_API_URL = 'https://platform.fatsecret.com/rest/server.api'

// Rate limits for free tier (5,000 calls/day)
const RATE_LIMIT = {
  maxCallsPerDay: 4500, // Leave headroom
  maxCallsPerMinute: 50,
}

// Cache TTLs
const CACHE_TTL = {
  search: 7 * 24 * 60 * 60 * 1000, // 7 days
  recipeDetails: 30 * 24 * 60 * 60 * 1000, // 30 days
  foodDetails: 30 * 24 * 60 * 60 * 1000, // 30 days
}

// Token refresh buffer (refresh 5 minutes before expiry)
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000

// ============================================================================
// FatSecret Service Class
// ============================================================================

class FatSecretService {
  private clientId: string
  private clientSecret: string

  // Token management
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null
  private tokenPromise: Promise<string> | null = null

  // Rate limiting
  private dailyCallCount = 0
  private minuteCallCount = 0
  private lastMinuteReset = Date.now()
  private lastDayReset = Date.now()

  // Request deduplication
  private inflightRequests = new Map<string, Promise<any>>()

  constructor() {
    const clientId = process.env.FATSECRET_ID
    const clientSecret = process.env.FATSECRET_API_KEY

    if (!clientId || !clientSecret) {
      throw new Error('FATSECRET_ID and FATSECRET_API_KEY environment variables are required')
    }

    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  // ==========================================================================
  // OAuth 2.0 Token Management
  // ==========================================================================

  /**
   * Get a valid access token, refreshing if necessary
   */
  private async getAccessToken(): Promise<string> {
    // Return existing token if still valid
    if (this.accessToken && this.tokenExpiry) {
      const now = new Date()
      const bufferTime = new Date(this.tokenExpiry.getTime() - TOKEN_REFRESH_BUFFER)

      if (now < bufferTime) {
        return this.accessToken
      }
    }

    // If already refreshing, wait for that promise
    if (this.tokenPromise) {
      return this.tokenPromise
    }

    // Refresh token
    this.tokenPromise = this.refreshToken()

    try {
      const token = await this.tokenPromise
      return token
    } finally {
      this.tokenPromise = null
    }
  }

  /**
   * Request a new access token from FatSecret
   */
  private async refreshToken(): Promise<string> {
    console.log('[FatSecret] Refreshing OAuth 2.0 token...')

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

    const response = await fetch(FATSECRET_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'basic',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`FatSecret token request failed (${response.status}): ${errorText}`)
    }

    const data: FatSecretTokenResponse = await response.json()

    this.accessToken = data.access_token
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000)

    console.log(`[FatSecret] Token refreshed, expires at: ${this.tokenExpiry.toISOString()}`)

    return this.accessToken
  }

  // ==========================================================================
  // Rate Limiting
  // ==========================================================================

  private checkRateLimit(): boolean {
    const now = Date.now()

    // Reset minute counter
    if (now - this.lastMinuteReset > 60000) {
      this.minuteCallCount = 0
      this.lastMinuteReset = now
    }

    // Reset daily counter
    if (now - this.lastDayReset > 24 * 60 * 60 * 1000) {
      this.dailyCallCount = 0
      this.lastDayReset = now
    }

    if (this.minuteCallCount >= RATE_LIMIT.maxCallsPerMinute) {
      console.warn('[FatSecret] Rate limit exceeded: calls per minute')
      return false
    }

    if (this.dailyCallCount >= RATE_LIMIT.maxCallsPerDay) {
      console.warn('[FatSecret] Rate limit exceeded: calls per day')
      return false
    }

    return true
  }

  private incrementRateLimit(): void {
    this.minuteCallCount++
    this.dailyCallCount++
    console.log(`[FatSecret] API call: ${this.dailyCallCount}/${RATE_LIMIT.maxCallsPerDay} daily, ${this.minuteCallCount}/${RATE_LIMIT.maxCallsPerMinute} per minute`)
  }

  // ==========================================================================
  // API Request Helper
  // ==========================================================================

  private async apiRequest<T>(
    method: string,
    params: Record<string, string | number | undefined>
  ): Promise<T> {
    if (!this.checkRateLimit()) {
      throw new Error('FatSecret API rate limit exceeded. Please try again later.')
    }

    const token = await this.getAccessToken()

    // Build request params
    const requestParams = new URLSearchParams({
      method,
      format: 'json',
    })

    // Add additional params, filtering out undefined
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        requestParams.append(key, String(value))
      }
    })

    const response = await fetch(FATSECRET_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestParams,
    })

    this.incrementRateLimit()

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`FatSecret API error (${response.status}): ${errorText}`)
    }

    const data: T = await response.json()

    // Check for API-level errors
    if ((data as any).error) {
      const error = (data as any).error
      throw new Error(`FatSecret API error (${error.code}): ${error.message}`)
    }

    return data
  }

  // ==========================================================================
  // Cache Helpers
  // ==========================================================================

  private async generateCacheKey(prefix: string, params: Record<string, any>): Promise<string> {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined) {
          acc[key] = params[key]
        }
        return acc
      }, {} as Record<string, any>)

    const paramsString = JSON.stringify(sortedParams)
    const encoder = new TextEncoder()
    const data = encoder.encode(paramsString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    return `${prefix}:${hashHex}`
  }

  // ==========================================================================
  // Food Search & Details
  // ==========================================================================

  /**
   * Search for foods in the FatSecret database
   */
  async searchFoods(params: FatSecretFoodSearchParams): Promise<FatSecretFoodSearchResponse> {
    const cacheKey = await this.generateCacheKey('food_search', params)

    // Check for in-flight request
    if (this.inflightRequests.has(cacheKey)) {
      console.log('[FatSecret] Food search deduplicated')
      return this.inflightRequests.get(cacheKey)!
    }

    const searchPromise = this._searchFoodsInternal(params, cacheKey)
    this.inflightRequests.set(cacheKey, searchPromise)
    searchPromise.finally(() => this.inflightRequests.delete(cacheKey))

    return searchPromise
  }

  private async _searchFoodsInternal(
    params: FatSecretFoodSearchParams,
    cacheKey: string
  ): Promise<FatSecretFoodSearchResponse> {
    const supabase = await createClient()

    // Check cache
    const { data: cached } = await supabase
      .from('fatsecret_search_cache')
      .select('*')
      .eq('query_hash', cacheKey)
      .eq('search_type', 'food')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cached) {
      console.log('[FatSecret] Food search cache HIT')

      // Increment hit count
      await supabase
        .from('fatsecret_search_cache')
        .update({ hit_count: cached.hit_count + 1 })
        .eq('id', cached.id)

      // Fetch cached foods
      const { data: foods } = await supabase
        .from('fatsecret_foods')
        .select('*')
        .in('fatsecret_id', cached.result_ids)

      if (foods) {
        return {
          foods: {
            food: foods.map(f => this.convertCachedFood(f)),
            max_results: String(params.max_results || 20),
            page_number: String(params.page_number || 0),
            total_results: String(cached.total_results),
          },
        }
      }
    }

    // Cache miss - call API
    console.log('[FatSecret] Food search cache MISS - calling API')

    const response = await this.apiRequest<FatSecretFoodSearchResponse>('foods.search', {
      search_expression: params.search_expression,
      page_number: params.page_number,
      max_results: params.max_results || 20,
      region: params.region,
      language: params.language,
    })

    // Cache results
    if (response.foods?.food) {
      const foods = this.ensureArray(response.foods.food)
      const foodIds = foods.map(f => f.food_id)

      // Cache search
      await supabase.from('fatsecret_search_cache').upsert({
        query_hash: cacheKey,
        search_type: 'food',
        query_params: params,
        result_ids: foodIds,
        total_results: parseInt(response.foods.total_results),
        expires_at: new Date(Date.now() + CACHE_TTL.search).toISOString(),
      }, { onConflict: 'query_hash' })

      // Cache individual foods (lightweight, without full details)
      for (const food of foods) {
        await this.cacheFoodLightweight(food)
      }
    }

    return response
  }

  /**
   * Get detailed food information including all servings
   */
  async getFoodDetails(foodId: string): Promise<FatSecretFood | null> {
    const supabase = await createClient()

    // Check cache
    const { data: cached } = await supabase
      .from('fatsecret_foods')
      .select('*')
      .eq('fatsecret_id', foodId)
      .gt('cache_expires_at', new Date().toISOString())
      .single()

    if (cached?.servings) {
      console.log('[FatSecret] Food details cache HIT:', foodId)

      // Update access tracking
      await supabase
        .from('fatsecret_foods')
        .update({
          fetch_count: cached.fetch_count + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', cached.id)

      return this.convertCachedFood(cached)
    }

    // Cache miss - call API
    console.log('[FatSecret] Food details cache MISS - calling API for:', foodId)

    const response = await this.apiRequest<FatSecretFoodDetailResponse>('food.get.v4', {
      food_id: foodId,
    })

    if (response.food) {
      await this.cacheFoodFull(response.food)
    }

    return response.food || null
  }

  // ==========================================================================
  // Recipe Search & Details
  // ==========================================================================

  /**
   * Search for recipes in the FatSecret database
   */
  async searchRecipes(params: FatSecretRecipeSearchParams): Promise<FatSecretRecipeSearchResponse> {
    const cacheKey = await this.generateCacheKey('recipe_search', params)

    // Check for in-flight request
    if (this.inflightRequests.has(cacheKey)) {
      console.log('[FatSecret] Recipe search deduplicated')
      return this.inflightRequests.get(cacheKey)!
    }

    const searchPromise = this._searchRecipesInternal(params, cacheKey)
    this.inflightRequests.set(cacheKey, searchPromise)
    searchPromise.finally(() => this.inflightRequests.delete(cacheKey))

    return searchPromise
  }

  private async _searchRecipesInternal(
    params: FatSecretRecipeSearchParams,
    cacheKey: string
  ): Promise<FatSecretRecipeSearchResponse> {
    const supabase = await createClient()

    // Check cache
    const { data: cached } = await supabase
      .from('fatsecret_search_cache')
      .select('*')
      .eq('query_hash', cacheKey)
      .eq('search_type', 'recipe')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cached) {
      console.log('[FatSecret] Recipe search cache HIT')

      // Increment hit count
      await supabase
        .from('fatsecret_search_cache')
        .update({ hit_count: cached.hit_count + 1 })
        .eq('id', cached.id)

      // Fetch cached recipes
      const { data: recipes } = await supabase
        .from('fatsecret_recipes')
        .select('*')
        .in('fatsecret_id', cached.result_ids)

      if (recipes) {
        return {
          recipes: {
            recipe: recipes.map(r => ({
              recipe_id: r.fatsecret_id,
              recipe_name: r.recipe_name,
              recipe_description: r.recipe_description || '',
              recipe_image: r.image_url || undefined,
              recipe_nutrition: {
                calories: String(r.calories || 0),
                carbohydrate: String(r.carb_grams || 0),
                fat: String(r.fat_grams || 0),
                protein: String(r.protein_grams || 0),
              },
            })),
            max_results: String(params.max_results || 20),
            page_number: String(params.page_number || 0),
            total_results: String(cached.total_results),
          },
        }
      }
    }

    // Cache miss - call API
    console.log('[FatSecret] Recipe search cache MISS - calling API')

    // Build API parameters with all available filters
    const apiParams: Record<string, string | number | undefined> = {
      search_expression: params.search_expression,
      page_number: params.page_number,
      max_results: params.max_results || 20,
    }

    // Recipe type filters
    if (params.recipe_types) {
      apiParams.recipe_types = params.recipe_types
    }
    if (params.recipe_types_matchall !== undefined) {
      apiParams.recipe_types_matchall = params.recipe_types_matchall ? 1 : 0
    }

    // Nutrition filters (ranges) - use dot notation for API
    if (params.calories_from !== undefined) {
      apiParams['calories.from'] = params.calories_from
    }
    if (params.calories_to !== undefined) {
      apiParams['calories.to'] = params.calories_to
    }
    if (params.protein_percentage_from !== undefined) {
      apiParams['protein_percentage.from'] = params.protein_percentage_from
    }
    if (params.protein_percentage_to !== undefined) {
      apiParams['protein_percentage.to'] = params.protein_percentage_to
    }
    if (params.carb_percentage_from !== undefined) {
      apiParams['carb_percentage.from'] = params.carb_percentage_from
    }
    if (params.carb_percentage_to !== undefined) {
      apiParams['carb_percentage.to'] = params.carb_percentage_to
    }
    if (params.fat_percentage_from !== undefined) {
      apiParams['fat_percentage.from'] = params.fat_percentage_from
    }
    if (params.fat_percentage_to !== undefined) {
      apiParams['fat_percentage.to'] = params.fat_percentage_to
    }

    // Time filter
    if (params.prep_time_from !== undefined) {
      apiParams['prep_time.from'] = params.prep_time_from
    }
    if (params.prep_time_to !== undefined) {
      apiParams['prep_time.to'] = params.prep_time_to
    }

    // Other filters
    if (params.must_have_images !== undefined) {
      apiParams.must_have_images = params.must_have_images ? 1 : 0
    }
    if (params.sort_by) {
      apiParams.sort_by = params.sort_by
    }

    const response = await this.apiRequest<FatSecretRecipeSearchResponse>('recipes.search.v3', apiParams)

    // Cache results
    if (response.recipes?.recipe) {
      const recipes = this.ensureArray(response.recipes.recipe)
      const recipeIds = recipes.map(r => r.recipe_id)

      // Cache search
      await supabase.from('fatsecret_search_cache').upsert({
        query_hash: cacheKey,
        search_type: 'recipe',
        query_params: params,
        result_ids: recipeIds,
        total_results: parseInt(response.recipes.total_results),
        expires_at: new Date(Date.now() + CACHE_TTL.search).toISOString(),
      }, { onConflict: 'query_hash' })

      // Cache individual recipes (lightweight)
      for (const recipe of recipes) {
        await this.cacheRecipeLightweight(recipe)
      }
    }

    return response
  }

  /**
   * Get detailed recipe information including ingredients and directions
   */
  async getRecipeDetails(recipeId: string): Promise<FatSecretRecipeDetail | null> {
    const supabase = await createClient()

    // Check cache for full details
    const { data: cached } = await supabase
      .from('fatsecret_recipes')
      .select('*')
      .eq('fatsecret_id', recipeId)
      .gt('cache_expires_at', new Date().toISOString())
      .single()

    if (cached?.ingredients && cached?.directions) {
      console.log('[FatSecret] Recipe details cache HIT:', recipeId)

      // Update access tracking
      await supabase
        .from('fatsecret_recipes')
        .update({
          fetch_count: cached.fetch_count + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', cached.id)

      return this.convertCachedRecipe(cached)
    }

    // Cache miss - call API
    console.log('[FatSecret] Recipe details cache MISS - calling API for:', recipeId)

    const response = await this.apiRequest<FatSecretRecipeDetailResponse>('recipe.get.v2', {
      recipe_id: recipeId,
    })

    if (response.recipe) {
      await this.cacheRecipeFull(response.recipe)
    }

    return response.recipe || null
  }

  // ==========================================================================
  // Recipe Types
  // ==========================================================================

  // In-memory cache for recipe types (rarely changes)
  private recipeTypesCache: { types: Array<{ value: string; label: string }>; expiresAt: number } | null = null
  private recipeTypesPromise: Promise<Array<{ value: string; label: string }>> | null = null

  /**
   * Get all available recipe types from FatSecret API
   * Results are cached in memory for 24 hours
   */
  async getRecipeTypes(): Promise<Array<{ value: string; label: string }>> {
    // Check in-memory cache
    if (this.recipeTypesCache && Date.now() < this.recipeTypesCache.expiresAt) {
      console.log('[FatSecret] Recipe types cache HIT (in-memory)')
      return this.recipeTypesCache.types
    }

    // If already fetching, wait for that promise
    if (this.recipeTypesPromise) {
      return this.recipeTypesPromise
    }

    // Fetch from API
    this.recipeTypesPromise = this._fetchRecipeTypes()

    try {
      const types = await this.recipeTypesPromise
      return types
    } finally {
      this.recipeTypesPromise = null
    }
  }

  private async _fetchRecipeTypes(): Promise<Array<{ value: string; label: string }>> {
    console.log('[FatSecret] Fetching recipe types from API')

    try {
      const response = await this.apiRequest<FatSecretRecipeTypesResponse>('recipe_types.get.v2', {})

      if (!response.recipe_types?.recipe_type) {
        console.warn('[FatSecret] No recipe types returned from API')
        return this.getDefaultRecipeTypes()
      }

      const recipeTypes = this.ensureArray(response.recipe_types.recipe_type)
      const types = recipeTypes.map(rt => ({
        value: rt.recipe_type_name || (rt as unknown as string),
        label: rt.recipe_type_name || (rt as unknown as string),
      }))

      // Cache for 24 hours
      this.recipeTypesCache = {
        types,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }

      console.log(`[FatSecret] Cached ${types.length} recipe types`)
      return types
    } catch (error) {
      console.error('[FatSecret] Error fetching recipe types:', error)
      return this.getDefaultRecipeTypes()
    }
  }

  /**
   * Fallback recipe types if API call fails
   */
  private getDefaultRecipeTypes(): Array<{ value: string; label: string }> {
    return [
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
    ]
  }

  // ==========================================================================
  // Cache Storage Helpers
  // ==========================================================================

  private async cacheFoodLightweight(food: FatSecretFood): Promise<void> {
    try {
      const supabase = await createClient()

      await supabase.from('fatsecret_foods').upsert({
        fatsecret_id: food.food_id,
        food_name: food.food_name,
        food_type: food.food_type,
        brand_name: food.brand_name || null,
        food_url: food.food_url,
        cache_expires_at: new Date(Date.now() + CACHE_TTL.foodDetails).toISOString(),
      }, { onConflict: 'fatsecret_id', ignoreDuplicates: false })
    } catch (error) {
      console.error('[FatSecret] Error caching food:', error)
    }
  }

  private async cacheFoodFull(food: FatSecretFood): Promise<void> {
    try {
      const supabase = await createClient()
      const servings = food.servings?.serving
        ? this.ensureArray(food.servings.serving)
        : null

      const defaultServing = servings?.find(s => s.is_default === '1') || servings?.[0] || null

      await supabase.from('fatsecret_foods').upsert({
        fatsecret_id: food.food_id,
        food_name: food.food_name,
        food_type: food.food_type,
        brand_name: food.brand_name || null,
        food_url: food.food_url,
        servings,
        default_serving: defaultServing,
        cache_expires_at: new Date(Date.now() + CACHE_TTL.foodDetails).toISOString(),
      }, { onConflict: 'fatsecret_id' })

      console.log('[FatSecret] Cached food full details:', food.food_id)
    } catch (error) {
      console.error('[FatSecret] Error caching food:', error)
    }
  }

  private async cacheRecipeLightweight(recipe: { recipe_id: string; recipe_name: string; recipe_description?: string; recipe_image?: string; recipe_nutrition?: any }): Promise<void> {
    try {
      const supabase = await createClient()

      await supabase.from('fatsecret_recipes').upsert({
        fatsecret_id: recipe.recipe_id,
        recipe_name: recipe.recipe_name,
        recipe_description: recipe.recipe_description || null,
        image_url: recipe.recipe_image || null,
        calories: recipe.recipe_nutrition ? parseFloat(recipe.recipe_nutrition.calories) : null,
        protein_grams: recipe.recipe_nutrition ? parseFloat(recipe.recipe_nutrition.protein) : null,
        carb_grams: recipe.recipe_nutrition ? parseFloat(recipe.recipe_nutrition.carbohydrate) : null,
        fat_grams: recipe.recipe_nutrition ? parseFloat(recipe.recipe_nutrition.fat) : null,
        cache_expires_at: new Date(Date.now() + CACHE_TTL.recipeDetails).toISOString(),
      }, { onConflict: 'fatsecret_id', ignoreDuplicates: false })
    } catch (error) {
      console.error('[FatSecret] Error caching recipe:', error)
    }
  }

  private async cacheRecipeFull(recipe: FatSecretRecipeDetail): Promise<void> {
    try {
      const supabase = await createClient()

      const ingredients = recipe.ingredients?.ingredient
        ? this.ensureArray(recipe.ingredients.ingredient)
        : null

      const directions = recipe.directions?.direction
        ? this.ensureArray(recipe.directions.direction)
        : null

      const categories = recipe.recipe_categories?.recipe_category
        ? this.ensureArray(recipe.recipe_categories.recipe_category).map(c => c.recipe_category_name)
        : null

      const recipeTypes = recipe.recipe_types?.recipe_type
        ? this.ensureArray(recipe.recipe_types.recipe_type)
        : null

      const imageUrl = recipe.recipe_images?.recipe_image
        ? (Array.isArray(recipe.recipe_images.recipe_image)
            ? recipe.recipe_images.recipe_image[0]
            : recipe.recipe_images.recipe_image)
        : recipe.recipe_image || null

      await supabase.from('fatsecret_recipes').upsert({
        fatsecret_id: recipe.recipe_id,
        recipe_name: recipe.recipe_name,
        recipe_description: recipe.recipe_description || null,
        recipe_url: recipe.recipe_url,
        image_url: imageUrl,
        calories: recipe.serving_sizes?.serving ? parseFloat(recipe.serving_sizes.serving.calories) : null,
        protein_grams: recipe.serving_sizes?.serving ? parseFloat(recipe.serving_sizes.serving.protein) : null,
        carb_grams: recipe.serving_sizes?.serving ? parseFloat(recipe.serving_sizes.serving.carbohydrate) : null,
        fat_grams: recipe.serving_sizes?.serving ? parseFloat(recipe.serving_sizes.serving.fat) : null,
        fiber_grams: recipe.serving_sizes?.serving?.fiber ? parseFloat(recipe.serving_sizes.serving.fiber) : null,
        ingredients,
        directions,
        categories,
        recipe_types: recipeTypes,
        number_of_servings: recipe.number_of_servings ? parseInt(recipe.number_of_servings) : null,
        prep_time_min: recipe.preparation_time_min ? parseInt(recipe.preparation_time_min) : null,
        cook_time_min: recipe.cooking_time_min ? parseInt(recipe.cooking_time_min) : null,
        rating: recipe.rating ? parseFloat(recipe.rating) : null,
        cache_expires_at: new Date(Date.now() + CACHE_TTL.recipeDetails).toISOString(),
      }, { onConflict: 'fatsecret_id' })

      console.log('[FatSecret] Cached recipe full details:', recipe.recipe_id)
    } catch (error) {
      console.error('[FatSecret] Error caching recipe:', error)
    }
  }

  // ==========================================================================
  // Conversion Helpers
  // ==========================================================================

  private convertCachedFood(cached: any): FatSecretFood {
    return {
      food_id: cached.fatsecret_id,
      food_name: cached.food_name,
      food_type: cached.food_type,
      brand_name: cached.brand_name,
      food_url: cached.food_url,
      servings: cached.servings ? { serving: cached.servings } : undefined,
    }
  }

  private convertCachedRecipe(cached: CachedFatSecretRecipe): FatSecretRecipeDetail {
    return {
      recipe_id: cached.fatsecret_id,
      recipe_name: cached.recipe_name,
      recipe_description: cached.recipe_description || '',
      recipe_url: cached.recipe_url || '',
      recipe_image: cached.image_url || undefined,
      serving_sizes: cached.calories ? {
        serving: {
          serving_size: String(cached.number_of_servings || 1),
          calories: String(cached.calories || 0),
          carbohydrate: String(cached.carb_grams || 0),
          protein: String(cached.protein_grams || 0),
          fat: String(cached.fat_grams || 0),
          fiber: cached.fiber_grams ? String(cached.fiber_grams) : undefined,
        },
      } : undefined,
      ingredients: cached.ingredients ? { ingredient: cached.ingredients } : undefined,
      directions: cached.directions ? { direction: cached.directions } : undefined,
      recipe_categories: cached.categories ? {
        recipe_category: cached.categories.map((name: string) => ({
          recipe_category_name: name,
          recipe_category_url: '',
        })),
      } : undefined,
      recipe_types: cached.recipe_types ? { recipe_type: cached.recipe_types } : undefined,
      number_of_servings: String(cached.number_of_servings || 1),
      preparation_time_min: cached.prep_time_min ? String(cached.prep_time_min) : undefined,
      cooking_time_min: cached.cook_time_min ? String(cached.cook_time_min) : undefined,
      rating: cached.rating ? String(cached.rating) : undefined,
    }
  }

  /**
   * Convert FatSecret recipe to normalized format for app use
   */
  normalizeRecipe(recipe: FatSecretRecipeDetail): NormalizedRecipe {
    const ingredients = recipe.ingredients?.ingredient
      ? this.ensureArray(recipe.ingredients.ingredient)
      : []

    const directions = recipe.directions?.direction
      ? this.ensureArray(recipe.directions.direction)
      : []

    const categories = recipe.recipe_categories?.recipe_category
      ? this.ensureArray(recipe.recipe_categories.recipe_category).map(c => c.recipe_category_name)
      : []

    const recipeTypes = recipe.recipe_types?.recipe_type
      ? this.ensureArray(recipe.recipe_types.recipe_type)
      : []

    const imageUrl = recipe.recipe_images?.recipe_image
      ? (Array.isArray(recipe.recipe_images.recipe_image)
          ? recipe.recipe_images.recipe_image[0]
          : recipe.recipe_images.recipe_image)
      : recipe.recipe_image || null

    const prepTime = recipe.preparation_time_min ? parseInt(recipe.preparation_time_min) : null
    const cookTime = recipe.cooking_time_min ? parseInt(recipe.cooking_time_min) : null

    return {
      id: recipe.recipe_id,
      source: 'fatsecret',
      title: recipe.recipe_name,
      description: recipe.recipe_description,
      imageUrl,
      sourceUrl: recipe.recipe_url,
      servings: parseInt(recipe.number_of_servings) || 1,
      prepTimeMinutes: prepTime,
      cookTimeMinutes: cookTime,
      totalTimeMinutes: prepTime && cookTime ? prepTime + cookTime : prepTime || cookTime,
      calories: recipe.serving_sizes?.serving ? parseFloat(recipe.serving_sizes.serving.calories) : 0,
      protein: recipe.serving_sizes?.serving ? parseFloat(recipe.serving_sizes.serving.protein) : 0,
      carbs: recipe.serving_sizes?.serving ? parseFloat(recipe.serving_sizes.serving.carbohydrate) : 0,
      fat: recipe.serving_sizes?.serving ? parseFloat(recipe.serving_sizes.serving.fat) : 0,
      fiber: recipe.serving_sizes?.serving?.fiber ? parseFloat(recipe.serving_sizes.serving.fiber) : null,
      sugar: recipe.serving_sizes?.serving?.sugar ? parseFloat(recipe.serving_sizes.serving.sugar) : null,
      ingredients: ingredients.map(ing => ({
        foodId: ing.food_id,
        name: ing.food_name,
        amount: parseFloat(ing.number_of_units) || 1,
        unit: ing.measurement_description,
        description: ing.ingredient_description,
      })),
      instructions: directions.map(dir => ({
        stepNumber: parseInt(dir.direction_number),
        instruction: dir.direction_description,
      })),
      categories,
      recipeTypes,
      rating: recipe.rating ? parseFloat(recipe.rating) : null,
    }
  }

  /**
   * Get normalized nutrition from a serving
   */
  normalizeNutrition(serving: FatSecretServing): NormalizedNutrition {
    return {
      servingDescription: serving.serving_description,
      servingSize: serving.metric_serving_amount ? parseFloat(serving.metric_serving_amount) : null,
      servingUnit: serving.metric_serving_unit || null,
      calories: parseFloat(serving.calories) || 0,
      protein: parseFloat(serving.protein) || 0,
      carbs: parseFloat(serving.carbohydrate) || 0,
      fat: parseFloat(serving.fat) || 0,
      fiber: serving.fiber ? parseFloat(serving.fiber) : null,
      sugar: serving.sugar ? parseFloat(serving.sugar) : null,
      sodium: serving.sodium ? parseFloat(serving.sodium) : null,
      saturatedFat: serving.saturated_fat ? parseFloat(serving.saturated_fat) : null,
      cholesterol: serving.cholesterol ? parseFloat(serving.cholesterol) : null,
    }
  }

  // Helper to ensure arrays
  private ensureArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) return []
    return Array.isArray(value) ? value : [value]
  }
}

// Export singleton instance
export const fatSecretService = new FatSecretService()

// Export class for testing
export { FatSecretService }
