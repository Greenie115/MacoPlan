/**
 * Spoonacular Meal Plan API Service
 *
 * Handles meal plan generation with aggressive caching and rate limiting
 * Similar pattern to recipe service but optimized for meal plans
 *
 * NOTE: Spoonacular's Generate Meal Plan API only returns 3 meals per day
 * (breakfast, lunch, dinner) regardless of the numberOfMeals parameter.
 * For 4-6 meals, we supplement with random recipes to fill snack slots.
 */

import { createClient } from '@/lib/supabase/server'
import type {
  SpoonacularMealPlanParams,
  SpoonacularDailyMealPlan,
  SpoonacularWeeklyMealPlan,
  CachedSpoonacularMealPlan,
  SpoonacularMeal,
  SpoonacularRecipe,
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
  // Fetch Additional Snack Recipes
  // ==========================================================================

  /**
   * Fetches random snack recipes to supplement the base 3-meal plan
   * Spoonacular only returns breakfast/lunch/dinner, so we add snacks for 4-6 meal plans
   */
  private async fetchSnackRecipes(
    count: number,
    targetCaloriesPerSnack: number,
    diet?: string,
    exclude?: string
  ): Promise<SpoonacularMeal[]> {
    try {
      const queryParams = new URLSearchParams({
        apiKey: this.apiKey,
        number: count.toString(),
        type: 'snack',
        maxCalories: Math.round(targetCaloriesPerSnack * 1.2).toString(), // Allow 20% buffer
        minCalories: Math.round(targetCaloriesPerSnack * 0.5).toString(), // At least 50% of target
        addRecipeInformation: 'true',
      })

      if (diet) {
        queryParams.append('diet', diet)
      }

      if (exclude) {
        queryParams.append('excludeIngredients', exclude)
      }

      const apiUrl = `${this.baseUrl}/recipes/random?${queryParams}`
      console.log('[MealPlanService] Fetching snack recipes:', count)

      const response = await fetch(apiUrl)

      if (!response.ok) {
        console.error('[MealPlanService] Failed to fetch snacks:', response.status)
        return []
      }

      const data = await response.json()
      const recipes: SpoonacularRecipe[] = data.recipes || []

      // Convert to SpoonacularMeal format
      return recipes.map((recipe: SpoonacularRecipe) => ({
        id: recipe.id,
        title: recipe.title,
        imageType: recipe.imageType,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        sourceUrl: recipe.sourceUrl || '',
      }))
    } catch (error) {
      console.error('[MealPlanService] Error fetching snack recipes:', error)
      return []
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
    // Check if caching is disabled for development
    const skipCache = process.env.SKIP_MEAL_PLAN_CACHE === 'true'

    console.log('[MealPlanService] Generation params:', {
      timeFrame: params.timeFrame,
      targetCalories: params.targetCalories,
      mealsPerDay: params.mealsPerDay,
      diet: params.diet,
      skipCache,
    })

    // Step 1: Check cache (unless disabled)
    if (!skipCache) {
      const cachedPlan = await this.getCachedMealPlan(cacheKey)

      if (cachedPlan) {
        console.log('[MealPlanService] Cache HIT - returning cached plan with',
          cachedPlan.meals?.length || 0, 'meals')
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
    } else {
      console.log('[MealPlanService] Cache SKIPPED (SKIP_MEAL_PLAN_CACHE=true)')
    }

    // Step 2: Cache miss - call API
    console.log('[MealPlanService] Cache MISS - calling Spoonacular API')

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
      })

      // Add diet filter if specified
      if (params.diet) {
        queryParams.append('diet', params.diet)
      }

      // Add exclude items if specified
      if (params.exclude) {
        queryParams.append('exclude', params.exclude)
      }

      // CRITICAL: Add mealsPerDay using Spoonacular's 'numberOfMeals' parameter
      // According to Spoonacular API docs, this works for both 'day' and 'week' timeframes
      // Default to 3 meals if not specified
      const mealsCount = params.mealsPerDay || 3
      queryParams.append('numberOfMeals', mealsCount.toString())
      console.log('[MealPlanService] Requesting meals per day:', mealsCount)

      const apiUrl = `${this.baseUrl}/mealplanner/generate?${queryParams}`
      console.log('[MealPlanService] API Request URL:', apiUrl.replace(this.apiKey, 'API_KEY_HIDDEN'))
      console.log('[MealPlanService] Request params:', {
        timeFrame: params.timeFrame,
        targetCalories: params.targetCalories,
        mealsPerDay: params.mealsPerDay,
        diet: params.diet,
        exclude: params.exclude?.substring(0, 50), // truncate for readability
      })

      const response = await fetch(apiUrl)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Spoonacular API error (${response.status}): ${errorText}`
        )
      }

      let data: SpoonacularDailyMealPlan | SpoonacularWeeklyMealPlan =
        await response.json()

      // Log how many meals were returned from the API
      const requestedMeals = params.mealsPerDay || 3

      if (params.timeFrame === 'day') {
        const dailyData = data as SpoonacularDailyMealPlan
        const returnedMeals = dailyData.meals?.length || 0
        console.log(`[MealPlanService] API returned ${returnedMeals} meals (requested: ${requestedMeals})`)

        // WORKAROUND: Spoonacular only returns 3 meals (breakfast, lunch, dinner)
        // If user requested more than 3 meals, supplement with snack recipes
        if (requestedMeals > returnedMeals && returnedMeals > 0) {
          const snacksNeeded = requestedMeals - returnedMeals
          console.log(`[MealPlanService] Supplementing with ${snacksNeeded} snack(s)`)

          // Calculate calories per snack (distribute remaining calories)
          // Assume main meals get ~30% each, snacks get remaining portion
          const mainMealCalories = dailyData.nutrients.calories
          const targetDailyCalories = params.targetCalories
          const remainingCalories = Math.max(0, targetDailyCalories - mainMealCalories)
          const caloriesPerSnack = remainingCalories > 0
            ? Math.round(remainingCalories / snacksNeeded)
            : Math.round(targetDailyCalories * 0.1) // Default to 10% of daily if calculation fails

          console.log(`[MealPlanService] Target calories per snack: ${caloriesPerSnack}`)

          // Fetch snack recipes - add extra API call cost
          await this.incrementRateLimitCounter(1)
          const snackRecipes = await this.fetchSnackRecipes(
            snacksNeeded,
            caloriesPerSnack,
            params.diet,
            params.exclude
          )

          if (snackRecipes.length > 0) {
            // Insert snacks between meals (after breakfast, after lunch, etc.)
            const supplementedMeals = [...dailyData.meals]

            // Strategy: Insert snacks at logical points
            // 3 meals + 1 snack: After lunch (index 2)
            // 3 meals + 2 snacks: After breakfast (index 1), after lunch (index 3)
            // 3 meals + 3 snacks: After each meal (indices 1, 3, 5)
            const insertPositions = [2, 1, 4] // Insert after: lunch, breakfast, dinner

            snackRecipes.forEach((snack, index) => {
              const position = index < insertPositions.length
                ? insertPositions[index] + index // Adjust for already inserted items
                : supplementedMeals.length // Append to end if we run out of positions
              supplementedMeals.splice(Math.min(position, supplementedMeals.length), 0, snack)
            })

            console.log(`[MealPlanService] Supplemented plan now has ${supplementedMeals.length} meals`)

            // Update the data with supplemented meals
            data = {
              ...dailyData,
              meals: supplementedMeals,
            } as SpoonacularDailyMealPlan
          } else {
            console.warn('[MealPlanService] Failed to fetch snack recipes, returning base plan')
          }
        }
      }

      await this.incrementRateLimitCounter(estimatedPoints)

      // Cache the result (only if caching is enabled)
      const skipCacheForStorage = process.env.SKIP_MEAL_PLAN_CACHE === 'true'
      if (!skipCacheForStorage) {
        await this.cacheMealPlan(cacheKey, params, data)
      }

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
