/**
 * Spoonacular API Service
 *
 * Handles all interactions with Spoonacular API including:
 * - Rate limiting
 * - Aggressive caching (95%+ hit rate target)
 * - Error handling and fallbacks
 * - Cost optimization
 * - Request deduplication
 */

import { createClient } from '@/lib/supabase/server'
import type {
  SpoonacularRecipe,
  SpoonacularSearchParams,
  SpoonacularSearchResult,
  SpoonacularAutocompleteResult,
  CachedSpoonacularRecipe,
} from '@/lib/types/spoonacular'

// ============================================================================
// Configuration
// ============================================================================

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com'

// Ultra-conservative rate limits for free tier (150 points/day)
const RATE_LIMIT = {
  maxRequestsPerMinute: 40,
  maxPointsPerDay: 100, // Leave headroom for free tier (150 points)
}

// Cache TTLs (longer for cost optimization)
const CACHE_TTL = {
  search: 14 * 24 * 60 * 60 * 1000, // 14 days
  recipeDetails: 60 * 24 * 60 * 60 * 1000, // 60 days
  autocomplete: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// ============================================================================
// Spoonacular Service Class
// ============================================================================

class SpoonacularService {
  private apiKey: string
  private baseUrl: string = SPOONACULAR_BASE_URL

  // In-memory rate limiting (resets on server restart - acceptable for MVP)
  private requestCount = 0
  private dailyPoints = 0
  private lastResetMinute = Date.now()
  private lastResetDay = Date.now()

  // Request deduplication map
  private inflightRequests = new Map<string, Promise<any>>()

  constructor() {
    const apiKey = process.env.SPOONACULAR_API_KEY
    if (!apiKey) {
      throw new Error('SPOONACULAR_API_KEY environment variable is not set')
    }
    this.apiKey = apiKey
  }

  // ==========================================================================
  // Rate Limiting (Persistent with Supabase)
  // ==========================================================================

  /**
   * Get identifier for rate limiting (user ID or 'anonymous')
   */
  private async getRateLimitIdentifier(): Promise<string> {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id || 'anonymous'
  }

  /**
   * Check if request is within rate limits using persistent Supabase tracking
   */
  private async checkRateLimit(estimatedPoints: number = 1): Promise<boolean> {
    const now = Date.now()

    // In-memory per-minute limit (fast check)
    if (now - this.lastResetMinute > 60000) {
      this.requestCount = 0
      this.lastResetMinute = now
    }

    if (this.requestCount >= RATE_LIMIT.maxRequestsPerMinute) {
      console.warn('[Spoonacular] Rate limit exceeded: requests per minute')
      return false
    }

    // Persistent daily limit check (Supabase)
    try {
      const identifier = await this.getRateLimitIdentifier()
      const supabase = await createClient()

      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_max_points: RATE_LIMIT.maxPointsPerDay,
      })

      if (error) {
        console.error('[Spoonacular] Rate limit check error:', error)
        // Fail open (allow request) if check fails
        return true
      }

      if (!data.allowed) {
        console.warn(
          `[Spoonacular] Daily rate limit exceeded: ${data.daily_points_used}/${data.limit} points`
        )
        return false
      }

      console.log(
        `[Spoonacular] Rate limit OK: ${data.daily_points_used}/${data.limit} points used today`
      )
      return true
    } catch (error) {
      console.error('[Spoonacular] Rate limit check failed:', error)
      // Fail open (allow request) if check fails
      return true
    }
  }

  /**
   * Increment counters (both in-memory and persistent)
   */
  private async incrementCounters(pointsUsed: number) {
    this.requestCount++
    this.dailyPoints += pointsUsed

    // Update persistent rate limit in Supabase
    try {
      const identifier = await this.getRateLimitIdentifier()
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data, error } = await supabase.rpc('increment_rate_limit', {
        p_identifier: identifier,
        p_points: pointsUsed,
        p_user_id: user?.id || null,
      })

      if (error) {
        console.error('[Spoonacular] Failed to increment rate limit:', error)
      } else {
        console.log(
          `[Spoonacular] Points used: ${pointsUsed} | Daily total: ${data.daily_points_used}/${RATE_LIMIT.maxPointsPerDay}`
        )
      }
    } catch (error) {
      console.error('[Spoonacular] Rate limit increment failed:', error)
    }
  }

  // ==========================================================================
  // Cache Helpers
  // ==========================================================================

  private async generateCacheKey(prefix: string, params: any): Promise<string> {
    // Sort keys for consistent hashing
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key]
        return acc
      }, {} as any)

    const paramsString = JSON.stringify(sortedParams)

    // Use SHA-256 for secure, deterministic cache keys
    const encoder = new TextEncoder()
    const data = encoder.encode(paramsString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    return `${prefix}:${hashHex}`
  }

  private async getCachedRecipe(
    spoonacularId: number
  ): Promise<CachedSpoonacularRecipe | null> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('spoonacular_recipes')
        .select('*')
        .eq('spoonacular_id', spoonacularId)
        .gt('cache_expires_at', new Date().toISOString())
        .single()

      if (error) {
        console.log('[Spoonacular] Cache miss for recipe:', spoonacularId)
        return null
      }

      console.log('[Spoonacular] Cache HIT for recipe:', spoonacularId)

      // Update access tracking
      await supabase
        .from('spoonacular_recipes')
        .update({
          fetch_count: data.fetch_count + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', data.id)

      return data
    } catch (error) {
      console.error('[Spoonacular] Error checking recipe cache:', error)
      return null
    }
  }

  private async cacheRecipe(
    recipe: SpoonacularRecipe,
    ttlMs: number = CACHE_TTL.recipeDetails
  ): Promise<void> {
    try {
      const supabase = await createClient()

      // Extract nutrition values
      const nutrients = recipe.nutrition?.nutrients || []
      const getN = (name: string) =>
        nutrients.find((n) => n.name === name)?.amount || null

      const recipeData = {
        spoonacular_id: recipe.id,
        title: recipe.title,
        image_url: recipe.image || null,
        image_type: recipe.imageType || null,
        summary: recipe.summary || null,
        servings: recipe.servings,
        ready_in_minutes: recipe.readyInMinutes || null,
        calories: getN('Calories'),
        protein_grams: getN('Protein'),
        carb_grams: getN('Carbohydrates'),
        fat_grams: getN('Fat'),
        fiber_grams: getN('Fiber'),
        sugar_grams: getN('Sugar'),
        sodium_mg: getN('Sodium'),
        nutrition_data: recipe.nutrition || null,
        cuisines: recipe.cuisines || [],
        dish_types: recipe.dishTypes || [],
        diets: recipe.diets || [],
        ingredients: recipe.extendedIngredients || null,
        instructions:
          recipe.analyzedInstructions ||
          (recipe.instructions ? [{ name: '', steps: [{ number: 1, step: recipe.instructions, ingredients: [], equipment: [] }] }] : null),
        source_url: recipe.sourceUrl || null,
        source_name: recipe.sourceName || null,
        spoonacular_source_url: recipe.spoonacularSourceUrl || null,
        health_score: recipe.healthScore || null,
        spoonacular_score: recipe.spoonacularScore || null,
        price_per_serving: recipe.pricePerServing || null,
        cheap: recipe.cheap || false,
        dairy_free: recipe.dairyFree || false,
        gluten_free: recipe.glutenFree || false,
        ketogenic: recipe.ketogenic || false,
        vegan: recipe.vegan || false,
        vegetarian: recipe.vegetarian || false,
        very_healthy: recipe.veryHealthy || false,
        very_popular: recipe.veryPopular || false,
        cache_expires_at: new Date(Date.now() + ttlMs).toISOString(),
      }

      await supabase
        .from('spoonacular_recipes')
        .upsert(recipeData, { onConflict: 'spoonacular_id' })

      console.log('[Spoonacular] Cached recipe:', recipe.id)
    } catch (error) {
      console.error('[Spoonacular] Error caching recipe:', error)
    }
  }

  // ==========================================================================
  // Search Recipes
  // ==========================================================================

  async searchRecipes(
    params: SpoonacularSearchParams
  ): Promise<SpoonacularSearchResult> {
    const cacheKey = await this.generateCacheKey('search', params)

    // Check if request is in-flight (deduplication)
    if (this.inflightRequests.has(cacheKey)) {
      console.log('[Spoonacular] Request deduplicated')
      return this.inflightRequests.get(cacheKey)!
    }

    // Create promise for this search
    const searchPromise = this._searchRecipesInternal(params, cacheKey)

    // Store in-flight request
    this.inflightRequests.set(cacheKey, searchPromise)

    // Clean up after completion
    searchPromise.finally(() => {
      this.inflightRequests.delete(cacheKey)
    })

    return searchPromise
  }

  private async _searchRecipesInternal(
    params: SpoonacularSearchParams,
    cacheKey: string
  ): Promise<SpoonacularSearchResult> {
    const supabase = await createClient()

    // Step 1: Check search cache
    const { data: cachedSearch } = await supabase
      .from('spoonacular_search_cache')
      .select('*')
      .eq('query_hash', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cachedSearch) {
      console.log('[Spoonacular] Search cache HIT')

      // Increment hit count
      await supabase
        .from('spoonacular_search_cache')
        .update({ hit_count: cachedSearch.hit_count + 1 })
        .eq('id', cachedSearch.id)

      // Fetch cached recipes
      const { data: recipes } = await supabase
        .from('spoonacular_recipes')
        .select('*')
        .in('spoonacular_id', cachedSearch.recipe_ids)

      const recipeMap = new Map(
        recipes?.map((r) => [r.spoonacular_id, this.convertToRecipe(r)]) || []
      )

      // Return in original order
      const orderedRecipes = cachedSearch.recipe_ids
        .map((id: number) => recipeMap.get(id))
        .filter(Boolean) as SpoonacularRecipe[]

      return {
        results: orderedRecipes,
        offset: params.offset || 0,
        number: params.number || 20,
        totalResults: cachedSearch.total_results,
      }
    }

    // Step 2: Cache miss - call API
    console.log('[Spoonacular] Search cache MISS - calling API')

    // COST OPTIMIZATION: Don't include full recipe info in search (save 0.01 per result)
    const estimatedPoints = 1 // Base cost for complexSearch

    if (!this.checkRateLimit(estimatedPoints)) {
      throw new Error(
        'API rate limit exceeded. Please try again later or use cached results.'
      )
    }

    try {
      // Build query params
      const queryParams = new URLSearchParams({
        apiKey: this.apiKey,
        number: (params.number || 20).toString(),
        offset: (params.offset || 0).toString(),
        addRecipeInformation: 'false', // COST SAVE: Don't include detailed info
        fillIngredients: 'false', // COST SAVE: Don't fill ingredients
        ...(params.query && { query: params.query }),
        ...(params.cuisines?.length && { cuisine: params.cuisines.join(',') }),
        ...(params.diet && { diet: params.diet }),
        ...(params.intolerances?.length && {
          intolerances: params.intolerances.join(','),
        }),
        ...(params.excludeIngredients?.length && {
          excludeIngredients: params.excludeIngredients.join(','),
        }),
        ...(params.type && { type: params.type }),
        ...(params.maxReadyTime && {
          maxReadyTime: params.maxReadyTime.toString(),
        }),
        ...(params.minProtein && { minProtein: params.minProtein.toString() }),
        ...(params.maxCalories && {
          maxCalories: params.maxCalories.toString(),
        }),
        ...(params.sort && { sort: params.sort }),
      })

      const response = await fetch(
        `${this.baseUrl}/recipes/complexSearch?${queryParams}`
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Spoonacular API error (${response.status}): ${errorText}`
        )
      }

      const data: SpoonacularSearchResult = await response.json()

      this.incrementCounters(estimatedPoints)

      // Cache search results
      const recipeIds = data.results.map((r) => r.id)

      await supabase.from('spoonacular_search_cache').insert({
        query_hash: cacheKey,
        query_params: params,
        recipe_ids: recipeIds,
        total_results: data.totalResults,
        expires_at: new Date(Date.now() + CACHE_TTL.search).toISOString(),
      })

      // Cache individual recipe summaries (lightweight)
      for (const recipe of data.results) {
        await this.cacheRecipe(recipe, CACHE_TTL.recipeDetails)
      }

      console.log(
        `[Spoonacular] Search completed. Found ${data.totalResults} results, cached ${recipeIds.length} recipes`
      )

      return data
    } catch (error) {
      console.error('[Spoonacular] Search API error:', error)
      throw error
    }
  }

  // ==========================================================================
  // Get Recipe Information
  // ==========================================================================

  async getRecipeInformation(id: number): Promise<SpoonacularRecipe> {
    // Check cache first
    const cachedRecipe = await this.getCachedRecipe(id)

    if (cachedRecipe) {
      return this.convertToRecipe(cachedRecipe)
    }

    // Cache miss - call API
    console.log('[Spoonacular] Recipe cache MISS - calling API for ID:', id)

    const estimatedPoints = 1.1 // 1 base + 0.1 for nutrition

    if (!this.checkRateLimit(estimatedPoints)) {
      throw new Error('API rate limit exceeded. Please try again later.')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/recipes/${id}/information?apiKey=${this.apiKey}&includeNutrition=true`
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Spoonacular API error (${response.status}): ${errorText}`
        )
      }

      const recipe: SpoonacularRecipe = await response.json()

      this.incrementCounters(estimatedPoints)

      // Cache recipe with long TTL
      await this.cacheRecipe(recipe, CACHE_TTL.recipeDetails)

      return recipe
    } catch (error) {
      console.error('[Spoonacular] Get recipe API error:', error)
      throw error
    }
  }

  // ==========================================================================
  // Autocomplete
  // ==========================================================================

  async autocomplete(
    query: string,
    number: number = 10
  ): Promise<SpoonacularAutocompleteResult[]> {
    if (query.length < 3) {
      return [] // Don't call API for < 3 chars (cost optimization)
    }

    const cacheKey = await this.generateCacheKey('autocomplete', { query, number })

    // Check cache
    const supabase = await createClient()
    const { data: cached } = await supabase
      .from('spoonacular_search_cache')
      .select('*')
      .eq('query_hash', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cached && cached.query_params?.autocomplete_results) {
      console.log('[Spoonacular] Autocomplete cache HIT')
      return cached.query_params.autocomplete_results
    }

    // Cache miss - call API
    const estimatedPoints = 1

    if (!this.checkRateLimit(estimatedPoints)) {
      return [] // Graceful degradation for autocomplete
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/recipes/autocomplete?apiKey=${this.apiKey}&query=${encodeURIComponent(
          query
        )}&number=${number}`
      )

      if (!response.ok) {
        console.warn('[Spoonacular] Autocomplete API error:', response.status)
        return []
      }

      const results: SpoonacularAutocompleteResult[] = await response.json()

      this.incrementCounters(estimatedPoints)

      // Cache autocomplete results
      await supabase.from('spoonacular_search_cache').insert({
        query_hash: cacheKey,
        query_params: { query, number, autocomplete_results: results },
        recipe_ids: results.map((r) => r.id),
        total_results: results.length,
        expires_at: new Date(Date.now() + CACHE_TTL.autocomplete).toISOString(),
      })

      return results
    } catch (error) {
      console.error('[Spoonacular] Autocomplete error:', error)
      return [] // Graceful degradation
    }
  }

  // ==========================================================================
  // Helper: Convert cached recipe to API format
  // ==========================================================================

  private convertToRecipe(cached: CachedSpoonacularRecipe): SpoonacularRecipe {
    return {
      id: cached.spoonacular_id,
      title: cached.title,
      image: cached.image_url || undefined,
      imageType: cached.image_type || undefined,
      servings: cached.servings,
      readyInMinutes: cached.ready_in_minutes || 0,
      summary: cached.summary || undefined,
      sourceUrl: cached.source_url || undefined,
      sourceName: cached.source_name || undefined,
      spoonacularSourceUrl: cached.spoonacular_source_url || undefined,
      healthScore: cached.health_score || undefined,
      spoonacularScore: cached.spoonacular_score || undefined,
      pricePerServing: cached.price_per_serving || undefined,
      cuisines: cached.cuisines || [],
      dishTypes: cached.dish_types || [],
      diets: cached.diets || [],
      cheap: cached.cheap,
      dairyFree: cached.dairy_free,
      glutenFree: cached.gluten_free,
      ketogenic: cached.ketogenic,
      vegan: cached.vegan,
      vegetarian: cached.vegetarian,
      veryHealthy: cached.very_healthy,
      veryPopular: cached.very_popular,
      nutrition: cached.nutrition_data || undefined,
      extendedIngredients: cached.ingredients || undefined,
      analyzedInstructions: cached.instructions || undefined,
    }
  }
}

// Export singleton instance
export const spoonacularService = new SpoonacularService()
