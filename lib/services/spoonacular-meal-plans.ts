/**
 * Spoonacular Meal Plan API Service
 *
 * Handles meal plan generation with aggressive caching and rate limiting
 * Similar pattern to recipe service but optimized for meal plans
 */

import { createClient } from '@/lib/supabase/server'
import type {
  SpoonacularMealPlanParams,
  SpoonacularDailyMealPlan,
  SpoonacularWeeklyMealPlan,
  CachedSpoonacularMealPlan,
} from '@/lib/types/spoonacular'

// ============================================================================
// Configuration
// ============================================================================

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com'

// Cache TTL for meal plans
const MEAL_PLAN_CACHE_TTL = 14 * 24 * 60 * 60 * 1000 // 14 days

// ============================================================================
// Spoonacular Meal Plan Service
// ============================================================================

class SpoonacularMealPlanService {
  private apiKey: string
  private baseUrl: string = SPOONACULAR_BASE_URL

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
  // Cache Helpers
  // ==========================================================================

  private async generateCacheKey(params: SpoonacularMealPlanParams): Promise<string> {
    // Sort keys for consistent hashing
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key as keyof SpoonacularMealPlanParams]
        return acc
      }, {} as any)

    const paramsString = JSON.stringify(sortedParams)

    // Use SHA-256 for secure, deterministic cache keys
    const encoder = new TextEncoder()
    const data = encoder.encode(paramsString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return `mealplan:${hashHex}`
  }

  private async getCachedMealPlan(
    cacheKey: string
  ): Promise<CachedSpoonacularMealPlan | null> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('spoonacular_meal_plans')
        .select('*')
        .eq('query_hash', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error) {
        console.log('[MealPlanService] Cache miss for key:', cacheKey)
        return null
      }

      console.log('[MealPlanService] Cache HIT for key:', cacheKey)

      // Increment hit count
      await supabase
        .from('spoonacular_meal_plans')
        .update({ hit_count: data.hit_count + 1 })
        .eq('id', data.id)

      return data as CachedSpoonacularMealPlan
    } catch (error) {
      console.error('[MealPlanService] Error checking cache:', error)
      return null
    }
  }

  private async cacheMealPlan(
    cacheKey: string,
    params: SpoonacularMealPlanParams,
    data: SpoonacularDailyMealPlan | SpoonacularWeeklyMealPlan
  ): Promise<void> {
    try {
      const supabase = await createClient()

      // Extract recipe IDs
      let recipeIds: number[] = []
      let totalCalories = 0
      let totalProtein = 0
      let totalCarbs = 0
      let totalFat = 0

      if (params.timeFrame === 'day') {
        const dailyPlan = data as SpoonacularDailyMealPlan
        recipeIds = dailyPlan.meals.map((m) => m.id)
        totalCalories = dailyPlan.nutrients.calories
        totalProtein = dailyPlan.nutrients.protein
        totalCarbs = dailyPlan.nutrients.carbohydrates
        totalFat = dailyPlan.nutrients.fat
      } else {
        const weeklyPlan = data as SpoonacularWeeklyMealPlan
        const days = Object.values(weeklyPlan.week)
        recipeIds = days.flatMap((day) => day.meals.map((m) => m.id))
        // Sum up nutrients for the week
        days.forEach((day) => {
          totalCalories += day.nutrients.calories
          totalProtein += day.nutrients.protein
          totalCarbs += day.nutrients.carbohydrates
          totalFat += day.nutrients.fat
        })
      }

      const cacheEntry = {
        query_hash: cacheKey,
        query_params: params,
        time_frame: params.timeFrame,
        target_calories: params.targetCalories,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fat: totalFat,
        meals: params.timeFrame === 'day' ? (data as SpoonacularDailyMealPlan).meals : null,
        week_data: params.timeFrame === 'week' ? data : null,
        recipe_ids: recipeIds,
        expires_at: new Date(Date.now() + MEAL_PLAN_CACHE_TTL).toISOString(),
      }

      await supabase
        .from('spoonacular_meal_plans')
        .upsert(cacheEntry, { onConflict: 'query_hash' })

      console.log('[MealPlanService] Cached meal plan:', cacheKey)
    } catch (error) {
      console.error('[MealPlanService] Error caching meal plan:', error)
    }
  }

  // ==========================================================================
  // Rate Limiting (Reuse from recipe service)
  // ==========================================================================

  private async checkRateLimit(estimatedPoints: number = 1): Promise<boolean> {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const identifier = user?.id || 'anonymous'

      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_max_points: 100, // Conservative limit
      })

      if (error) {
        console.error('[MealPlanService] Rate limit check error:', error)
        return false // Fail closed - deny requests when rate limit check fails
      }

      if (!data.allowed) {
        console.warn(
          `[MealPlanService] Daily rate limit exceeded: ${data.daily_points_used}/${data.limit} points`
        )
        return false
      }

      console.log(
        `[MealPlanService] Rate limit OK: ${data.daily_points_used}/${data.limit} points`
      )
      return true
    } catch (error) {
      console.error('[MealPlanService] Rate limit check failed:', error)
      return false // Fail closed - deny requests when rate limit check fails
    }
  }

  private async incrementRateLimitCounter(pointsUsed: number): Promise<void> {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const identifier = user?.id || 'anonymous'

      const { data, error } = await supabase.rpc('increment_rate_limit', {
        p_identifier: identifier,
        p_points: pointsUsed,
        p_user_id: user?.id || null,
      })

      if (error) {
        console.error('[MealPlanService] Failed to increment rate limit:', error)
      } else {
        console.log(
          `[MealPlanService] Points used: ${pointsUsed} | Daily total: ${data.daily_points_used}`
        )
      }
    } catch (error) {
      console.error('[MealPlanService] Rate limit increment failed:', error)
    }
  }

  // ==========================================================================
  // Generate Meal Plan
  // ==========================================================================

  async generateMealPlan(
    params: SpoonacularMealPlanParams
  ): Promise<SpoonacularDailyMealPlan | SpoonacularWeeklyMealPlan> {
    const cacheKey = await this.generateCacheKey(params)

    // Check if request is in-flight (deduplication)
    if (this.inflightRequests.has(cacheKey)) {
      console.log('[MealPlanService] Request deduplicated')
      return this.inflightRequests.get(cacheKey)!
    }

    // Create promise for this generation
    const generatePromise = this._generateMealPlanInternal(params, cacheKey)

    // Store in-flight request
    this.inflightRequests.set(cacheKey, generatePromise)

    // Clean up after completion
    generatePromise.finally(() => {
      this.inflightRequests.delete(cacheKey)
    })

    return generatePromise
  }

  private async _generateMealPlanInternal(
    params: SpoonacularMealPlanParams,
    cacheKey: string
  ): Promise<SpoonacularDailyMealPlan | SpoonacularWeeklyMealPlan> {
    // Step 1: Check cache
    const cachedPlan = await this.getCachedMealPlan(cacheKey)

    if (cachedPlan) {
      // Return cached data in correct format
      if (cachedPlan.time_frame === 'day') {
        return {
          nutrients: {
            calories: cachedPlan.total_calories || 0,
            protein: cachedPlan.total_protein || 0,
            carbohydrates: cachedPlan.total_carbs || 0,
            fat: cachedPlan.total_fat || 0,
          },
          meals: cachedPlan.meals || [],
        } as SpoonacularDailyMealPlan
      } else {
        return cachedPlan.week_data as SpoonacularWeeklyMealPlan
      }
    }

    // Step 2: Cache miss - call API
    console.log('[MealPlanService] Cache MISS - calling API')

    const estimatedPoints = 1 // Meal plan generation = 1 point

    if (!(await this.checkRateLimit(estimatedPoints))) {
      throw new Error(
        'API rate limit exceeded. Please try again later or use cached results.'
      )
    }

    try {
      // Build query params
      const queryParams = new URLSearchParams({
        apiKey: this.apiKey,
        timeFrame: params.timeFrame,
        targetCalories: params.targetCalories.toString(),
        ...(params.diet && { diet: params.diet }),
        ...(params.exclude && { exclude: params.exclude }),
      })

      const response = await fetch(
        `${this.baseUrl}/mealplanner/generate?${queryParams}`
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Spoonacular API error (${response.status}): ${errorText}`
        )
      }

      const data: SpoonacularDailyMealPlan | SpoonacularWeeklyMealPlan =
        await response.json()

      await this.incrementRateLimitCounter(estimatedPoints)

      // Cache the result
      await this.cacheMealPlan(cacheKey, params, data)

      console.log(
        `[MealPlanService] Meal plan generated successfully (${params.timeFrame})`
      )

      return data
    } catch (error) {
      console.error('[MealPlanService] API error:', error)
      throw error
    }
  }

  // ==========================================================================
  // Validate Macro Match
  // ==========================================================================

  validateMacroMatch(
    target: number,
    actual: number
  ): {
    isWithinTolerance: boolean
    percentDiff: number
  } {
    const diff = Math.abs(actual - target)
    const percentDiff = (diff / target) * 100

    return {
      isWithinTolerance: percentDiff <= 5, // ±5% tolerance
      percentDiff: Math.round(percentDiff * 10) / 10,
    }
  }
}

// Export class for testing
export { SpoonacularMealPlanService }

// Export singleton instance for production use
export const spoonacularMealPlanService = new SpoonacularMealPlanService()
