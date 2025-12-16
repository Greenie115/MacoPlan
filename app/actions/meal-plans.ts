'use server'

/**
 * Server Actions for Meal Plan Management
 *
 * Handles meal plan generation using FatSecret API, CRUD operations, and quota management
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { fatSecretMealPlanService } from '@/lib/services/fatsecret-meal-plans'
import { fatSecretService } from '@/lib/services/fatsecret'
import {
  getUserSubscriptionTier,
} from '@/lib/utils/subscription'
import type {
  MealPlan,
  MealPlanInsert,
  MealPlanMeal,
  MealPlanMealInsert,
  MealPlanGenerationParams,
} from '@/lib/types/database'
import type {
  DailyMealPlan,
  WeeklyMealPlan,
  MealSlot,
  NormalizedRecipe,
} from '@/lib/types/fatsecret'
import { z } from 'zod'

// ============================================================================
// Input Validation Schemas
// ============================================================================

const GenerateMealPlanRequestSchema = z.object({
  timeFrame: z.enum(['day', 'week']),
  numberOfDays: z
    .number()
    .int()
    .min(1, 'Number of days must be at least 1')
    .max(7, 'Number of days cannot exceed 7')
    .optional(),
  mealsPerDay: z
    .number()
    .int()
    .min(2, 'Meals per day must be at least 2')
    .max(6, 'Meals per day cannot exceed 6')
    .optional(),
  targetCalories: z
    .number()
    .int()
    .min(1200, 'Target calories must be at least 1200 for safe nutrition')
    .max(5000, 'Target calories cannot exceed 5000')
    .optional(),
  customDiet: z
    .string()
    .max(50, 'Diet preference cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s-]*$/, 'Diet preference contains invalid characters')
    .optional(),
  customExclude: z
    .string()
    .max(500, 'Exclusion list cannot exceed 500 characters')
    .regex(
      /^[a-zA-Z0-9\s,.-]*$/,
      'Exclusion list contains invalid characters (only letters, numbers, commas, spaces, dots, and hyphens allowed)'
    )
    .optional(),
})

// ============================================================================
// Types
// ============================================================================

interface GenerateMealPlanRequest {
  timeFrame: 'day' | 'week'
  numberOfDays?: number // Specific number of days (1-7)
  mealsPerDay?: number
  targetCalories?: number // Override user profile
  customDiet?: string // Override user profile
  customExclude?: string // Override user profile
}

interface GenerateMealPlanResponse {
  success: boolean
  data?: {
    mealPlan: MealPlan
    meals: MealPlanMeal[]
    macroMatch: {
      isWithinTolerance: boolean
      percentDiff: number
    }
  }
  quotaInfo?: {
    remaining: number
    total: number
  }
  error?: string
}

// ============================================================================
// Helper: Map Dietary Style to search terms
// ============================================================================

function getDietaryPreferences(dietaryStyle?: string | null): string[] {
  if (!dietaryStyle || dietaryStyle === 'none') return []

  const dietMap: Record<string, string[]> = {
    vegetarian: ['vegetarian'],
    vegan: ['vegan'],
    pescatarian: ['pescatarian', 'fish', 'seafood'],
    paleo: ['paleo'],
    keto: ['keto', 'low carb'],
    mediterranean: ['mediterranean'],
  }

  return dietMap[dietaryStyle] || []
}

// ============================================================================
// Generate Meal Plan
// ============================================================================

export async function generateMealPlan(
  request: GenerateMealPlanRequest
): Promise<GenerateMealPlanResponse> {
  try {
    console.log('[GenerateMealPlan] Incoming request:', {
      timeFrame: request.timeFrame,
      mealsPerDay: request.mealsPerDay,
      targetCalories: request.targetCalories,
      customDiet: request.customDiet,
      customExclude: request.customExclude?.substring(0, 50),
    })

    // Step 0: Validate input
    const validationResult = GenerateMealPlanRequestSchema.safeParse(request)
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      console.error('[GenerateMealPlan] Validation error:', firstError)
      return {
        success: false,
        error: `Invalid input: ${firstError.message}`,
      }
    }

    const validatedRequest = validationResult.data

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Step 1: Atomic quota check and reserve
    const tier = await getUserSubscriptionTier(user.id)

    const { data: quotaResult, error: quotaError } = await supabase.rpc(
      'check_and_reserve_meal_plan_quota',
      {
        p_user_id: user.id,
        p_is_free_tier: tier === 'free',
      }
    )

    if (quotaError) {
      console.error('[GenerateMealPlan] Quota check error:', quotaError)
      return { success: false, error: 'Failed to check quota. Please try again.' }
    }

    if (!quotaResult.allowed) {
      return {
        success: false,
        error: quotaResult.reason,
        quotaInfo: {
          remaining: quotaResult.remaining,
          total: quotaResult.total,
        },
      }
    }

    // Step 2: Get user profile for macro targets and dietary preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(
        'target_calories, protein_grams, carb_grams, fat_grams, dietary_style, allergies, foods_to_avoid'
      )
      .eq('user_id', user.id)
      .single()

    if (!profile || !profile.target_calories) {
      return {
        success: false,
        error: 'Please complete your profile to generate meal plans',
      }
    }

    // Step 3: Build FatSecret meal plan parameters
    const targetCalories = validatedRequest.targetCalories || profile.target_calories
    const targetProtein = profile.protein_grams || Math.round(targetCalories * 0.3 / 4)
    const targetCarbs = profile.carb_grams || Math.round(targetCalories * 0.4 / 4)
    const targetFat = profile.fat_grams || Math.round(targetCalories * 0.3 / 9)

    // Build dietary preferences
    const dietaryPreferences = getDietaryPreferences(profile.dietary_style)
    if (validatedRequest.customDiet) {
      dietaryPreferences.push(validatedRequest.customDiet)
    }

    // Build exclude list
    const excludeIngredients: string[] = []
    if (profile.allergies) {
      excludeIngredients.push(...profile.allergies)
    }
    if (profile.foods_to_avoid) {
      excludeIngredients.push(
        ...profile.foods_to_avoid
          .split(',')
          .map((item: string) => item.trim())
          .filter(Boolean)
      )
    }
    if (validatedRequest.customExclude) {
      excludeIngredients.push(
        ...validatedRequest.customExclude
          .split(',')
          .map((item: string) => item.trim())
          .filter(Boolean)
      )
    }

    // Calculate number of days: use numberOfDays if provided, otherwise 1 for 'day' and 7 for 'week'
    const days = validatedRequest.numberOfDays
      ?? (validatedRequest.timeFrame === 'day' ? 1 : 7)

    const params = {
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      mealsPerDay: validatedRequest.mealsPerDay || 4,
      days,
      dietaryPreferences: dietaryPreferences.length > 0 ? dietaryPreferences : undefined,
      excludeIngredients: excludeIngredients.length > 0 ? excludeIngredients : undefined,
    }

    // Step 4: Generate meal plan via FatSecret
    console.log('[GenerateMealPlan] Calling FatSecret API with params:', params)

    const fatSecretPlan = await fatSecretMealPlanService.generateMealPlan(params)

    // Step 5: Calculate totals and validate macro match
    let actualCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    if (validatedRequest.timeFrame === 'day') {
      const dailyPlan = fatSecretPlan as DailyMealPlan
      actualCalories = dailyPlan.totalCalories
      totalProtein = dailyPlan.totalProtein
      totalCarbs = dailyPlan.totalCarbs
      totalFat = dailyPlan.totalFat
    } else {
      const weeklyPlan = fatSecretPlan as WeeklyMealPlan
      actualCalories = weeklyPlan.averageCalories
      totalProtein = weeklyPlan.averageProtein
      totalCarbs = weeklyPlan.averageCarbs
      totalFat = weeklyPlan.averageFat
    }

    const macroMatch = fatSecretMealPlanService.validateMacroMatch(
      targetCalories,
      actualCalories
    )

    // Step 6: Deactivate existing active plans
    const { error: deactivateError } = await supabase
      .from('meal_plans')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (deactivateError) {
      console.error('[GenerateMealPlan] CRITICAL: Failed to deactivate existing plans:', deactivateError)
      return {
        success: false,
        error: 'Failed to prepare for new meal plan. Please try again.',
      }
    }

    // Step 7: Save meal plan to database
    const startDate = new Date()
    const endDate = new Date()
    if (days > 1) {
      endDate.setDate(endDate.getDate() + days - 1)
    }

    // Generate plan name based on number of days
    const planName = days === 1
      ? `Daily Meal Plan - ${startDate.toLocaleDateString()}`
      : `${days}-Day Meal Plan - ${startDate.toLocaleDateString()}`

    const mealPlanData: MealPlanInsert = {
      user_id: user.id,
      name: planName,
      description: `Generated meal plan with ${Math.round(actualCalories)} calories per day`,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      total_days: days,
      target_calories: targetCalories,
      protein_grams: targetProtein,
      carb_grams: targetCarbs,
      fat_grams: targetFat,
      is_active: true,
      archived: false,
      completed_at: null,
      plan_source: 'generated',
      spoonacular_plan_id: null,
      is_favorite: false,
      generation_params: {
        timeFrame: validatedRequest.timeFrame,
        numberOfDays: days,
        targetCalories,
        mealsPerDay: params.mealsPerDay,
        diet: dietaryPreferences.join(',') || undefined,
        exclude: excludeIngredients.join(',') || undefined,
      } as MealPlanGenerationParams,
      archived_at: null,
    }

    const { data: savedPlan, error: planError } = await supabase
      .from('meal_plans')
      .insert(mealPlanData)
      .select()
      .single()

    if (planError || !savedPlan) {
      console.error('[GenerateMealPlan] Error saving meal plan:', planError)
      return { success: false, error: 'Failed to save meal plan' }
    }

    // Step 8: Save individual meals to meal_plan_meals table
    const mealsToInsert: MealPlanMealInsert[] = []

    if (validatedRequest.timeFrame === 'day') {
      const dailyPlan = fatSecretPlan as DailyMealPlan
      dailyPlan.meals.forEach((meal, index) => {
        mealsToInsert.push(
          createMealPlanMealEntry(savedPlan.id, meal, 0, index)
        )
      })
    } else {
      const weeklyPlan = fatSecretPlan as WeeklyMealPlan
      weeklyPlan.days.forEach((dayPlan, dayIndex) => {
        dayPlan.meals.forEach((meal, mealIndex) => {
          mealsToInsert.push(
            createMealPlanMealEntry(savedPlan.id, meal, dayIndex, mealIndex)
          )
        })
      })
    }

    const { data: savedMeals, error: mealsError } = await supabase
      .from('meal_plan_meals')
      .insert(mealsToInsert)
      .select()

    if (mealsError || !savedMeals) {
      console.error('[GenerateMealPlan] Error saving meals:', mealsError)
      return { success: false, error: 'Failed to save meal plan meals' }
    }

    // Step 9: Revalidate paths
    revalidatePath('/meal-plans')
    revalidatePath('/dashboard')

    console.log(
      `[GenerateMealPlan] Successfully generated meal plan for user ${user.id}`
    )

    return {
      success: true,
      data: {
        mealPlan: savedPlan as MealPlan,
        meals: savedMeals as MealPlanMeal[],
        macroMatch,
      },
      quotaInfo: {
        remaining: quotaResult.remaining,
        total: quotaResult.total,
      },
    }
  } catch (error) {
    console.error('[GenerateMealPlan] Unexpected error:', error)
    return {
      success: false,
      error: 'Failed to generate meal plan. Please try again.',
    }
  }
}

// Helper to create meal plan meal entry from FatSecret data
// Stores original recipe values with 1.0 multiplier - user adjusts servings manually
function createMealPlanMealEntry(
  mealPlanId: string,
  meal: MealSlot,
  dayIndex: number,
  mealOrder: number
): MealPlanMealInsert {
  const recipe = meal.recipe

  // Always store original recipe values with 1.0 multiplier
  // User can adjust serving_multiplier manually on meal cards
  return {
    meal_plan_id: mealPlanId,
    day_index: dayIndex,
    meal_type: meal.type,
    meal_order: mealOrder,
    recipe_id: null,
    spoonacular_id: null,
    fatsecret_id: recipe?.id || null,
    recipe_source: 'fatsecret',
    recipe_title: recipe?.title || `${meal.type} meal`,
    recipe_image_url: recipe?.imageUrl || null,
    servings: recipe?.servings || 1,
    ready_in_minutes: recipe?.totalTimeMinutes || null,
    calories: recipe?.calories ? Math.round(recipe.calories) : Math.round(meal.targetCalories),
    protein_grams: recipe?.protein ? Math.round(recipe.protein * 10) / 10 : Math.round(meal.targetProtein * 10) / 10,
    carb_grams: recipe?.carbs ? Math.round(recipe.carbs * 10) / 10 : 0,
    fat_grams: recipe?.fat ? Math.round(recipe.fat * 10) / 10 : 0,
    serving_multiplier: 1.0,
    notes: null,
  }
}

// ============================================================================
// Get User's Meal Plans
// ============================================================================

export interface MealPlanWithPreviews extends MealPlan {
  preview_images: {
    fatsecret_id: string | null
    spoonacular_id: number | null
    image_url: string | null
  }[]
}

export async function getMealPlans(filters?: {
  activeOnly?: boolean
  favoritesOnly?: boolean
  archived?: boolean
}): Promise<{
  success: boolean
  data?: MealPlanWithPreviews[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    let query = supabase
      .from('meal_plans')
      .select(`
        *,
        meal_plan_meals (
          fatsecret_id,
          spoonacular_id,
          recipe_image_url,
          meal_order
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filters?.activeOnly) {
      query = query.eq('is_active', true)
    }

    if (filters?.favoritesOnly) {
      query = query.eq('is_favorite', true)
    }

    if (filters?.archived !== undefined) {
      query = query.eq('archived', filters.archived)
    } else {
      query = query.eq('archived', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('[GetMealPlans] Error:', error)
      return { success: false, error: 'Failed to fetch meal plans' }
    }

    const plansWithPreviews: MealPlanWithPreviews[] = (data || []).map((plan) => {
      const meals = (plan.meal_plan_meals || []) as Array<{
        fatsecret_id: string | null
        spoonacular_id: number | null
        recipe_image_url: string | null
        meal_order: number
      }>

      const sortedMeals = meals.sort((a, b) => a.meal_order - b.meal_order)
      const seenIds = new Set<string>()
      const previewImages: { fatsecret_id: string | null; spoonacular_id: number | null; image_url: string | null }[] = []

      for (const meal of sortedMeals) {
        if (previewImages.length >= 4) break
        const id = meal.fatsecret_id || String(meal.spoonacular_id)
        if (id && seenIds.has(id)) continue
        if (id) seenIds.add(id)

        previewImages.push({
          fatsecret_id: meal.fatsecret_id,
          spoonacular_id: meal.spoonacular_id,
          image_url: meal.recipe_image_url,
        })
      }

      const { meal_plan_meals, ...planData } = plan
      return {
        ...planData,
        preview_images: previewImages,
      } as MealPlanWithPreviews
    })

    return { success: true, data: plansWithPreviews }
  } catch (error) {
    console.error('[GetMealPlans] Unexpected error:', error)
    return { success: false, error: 'Failed to fetch meal plans' }
  }
}

// ============================================================================
// Get Single Meal Plan with Meals
// ============================================================================

export async function getMealPlanById(
  planId: string
): Promise<{
  success: boolean
  data?: { plan: MealPlan; meals: MealPlanMeal[] }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: plan, error: planError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single()

    if (planError || !plan) {
      console.error('[GetMealPlanById] Error:', planError)
      return { success: false, error: 'Meal plan not found' }
    }

    const { data: meals, error: mealsError } = await supabase
      .from('meal_plan_meals')
      .select('*')
      .eq('meal_plan_id', planId)
      .order('day_index', { ascending: true })
      .order('meal_order', { ascending: true })

    if (mealsError) {
      console.error('[GetMealPlanById] Error fetching meals:', mealsError)
      return { success: false, error: 'Failed to fetch meal plan meals' }
    }

    return {
      success: true,
      data: {
        plan: plan as MealPlan,
        meals: (meals || []) as MealPlanMeal[],
      },
    }
  } catch (error) {
    console.error('[GetMealPlanById] Unexpected error:', error)
    return { success: false, error: 'Failed to fetch meal plan' }
  }
}

// ============================================================================
// Update Meal Plan
// ============================================================================

export async function updateMealPlan(
  planId: string,
  updates: {
    name?: string
    description?: string
    is_active?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('meal_plans')
      .update(updates)
      .eq('id', planId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[UpdateMealPlan] Error:', error)
      return { success: false, error: 'Failed to update meal plan' }
    }

    revalidatePath('/meal-plans')
    return { success: true }
  } catch (error) {
    console.error('[UpdateMealPlan] Unexpected error:', error)
    return { success: false, error: 'Failed to update meal plan' }
  }
}

// ============================================================================
// Toggle Favorite
// ============================================================================

export async function toggleMealPlanFavorite(
  planId: string
): Promise<{ success: boolean; isFavorite?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: plan } = await supabase
      .from('meal_plans')
      .select('is_favorite')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single()

    if (!plan) {
      return { success: false, error: 'Meal plan not found' }
    }

    const newStatus = !plan.is_favorite

    const { error } = await supabase
      .from('meal_plans')
      .update({ is_favorite: newStatus })
      .eq('id', planId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[ToggleFavorite] Error:', error)
      return { success: false, error: 'Failed to toggle favorite' }
    }

    revalidatePath('/meal-plans')
    return { success: true, isFavorite: newStatus }
  } catch (error) {
    console.error('[ToggleFavorite] Unexpected error:', error)
    return { success: false, error: 'Failed to toggle favorite' }
  }
}

// ============================================================================
// Archive Meal Plan
// ============================================================================

export async function archiveMealPlan(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('meal_plans')
      .update({
        archived: true,
        archived_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', planId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[ArchiveMealPlan] Error:', error)
      return { success: false, error: 'Failed to archive meal plan' }
    }

    revalidatePath('/meal-plans')
    return { success: true }
  } catch (error) {
    console.error('[ArchiveMealPlan] Unexpected error:', error)
    return { success: false, error: 'Failed to archive meal plan' }
  }
}

// ============================================================================
// Delete Meal Plan
// ============================================================================

export async function deleteMealPlan(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[DeleteMealPlan] Error:', error)
      return { success: false, error: 'Failed to delete meal plan' }
    }

    revalidatePath('/meal-plans')
    return { success: true }
  } catch (error) {
    console.error('[DeleteMealPlan] Unexpected error:', error)
    return { success: false, error: 'Failed to delete meal plan' }
  }
}

// ============================================================================
// Regenerate Meal Plan
// ============================================================================

export async function regenerateMealPlan(
  planId: string
): Promise<GenerateMealPlanResponse> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: originalPlan } = await supabase
      .from('meal_plans')
      .select('generation_params')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single()

    if (!originalPlan || !originalPlan.generation_params) {
      return {
        success: false,
        error: 'Cannot regenerate: original parameters not found',
      }
    }

    const params = originalPlan.generation_params as MealPlanGenerationParams

    return await generateMealPlan({
      timeFrame: params.timeFrame,
      numberOfDays: params.numberOfDays,
      mealsPerDay: params.mealsPerDay,
      targetCalories: params.targetCalories,
      customDiet: params.diet,
      customExclude: params.exclude,
    })
  } catch (error) {
    console.error('[RegenerateMealPlan] Unexpected error:', error)
    return { success: false, error: 'Failed to regenerate meal plan' }
  }
}

// ============================================================================
// Swap Meal - Get Alternatives
// ============================================================================

interface SwapOption {
  id: string
  title: string
  image: string | null
  readyInMinutes: number | null
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

export async function getSwapOptions(
  mealId: string,
  mealType: string,
  targetCalories: number
): Promise<{ success: boolean; data?: SwapOption[]; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: meal, error: mealError } = await supabase
      .from('meal_plan_meals')
      .select('*, meal_plans!inner(user_id)')
      .eq('id', mealId)
      .single()

    if (mealError || !meal) {
      return { success: false, error: 'Meal not found' }
    }

    if ((meal.meal_plans as { user_id: string }).user_id !== user.id) {
      return { success: false, error: 'Meal not found' }
    }

    // Get user's dietary preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('dietary_style, allergies, foods_to_avoid')
      .eq('user_id', user.id)
      .single()

    // Import keyword extraction utilities
    const {
      extractRecipeKeywords,
      checkDietaryConflict,
      buildDietarySearchTerms,
      calculateMacroSimilarity,
    } = await import('@/lib/utils/recipe-keywords')

    // Extract keywords from current meal title
    const keywords = extractRecipeKeywords(meal.recipe_title)
    console.log('[GetSwapOptions] Extracted keywords:', keywords)

    // Original meal macros for similarity scoring
    const originalMacros = {
      calories: (meal.calories || 0) * meal.serving_multiplier,
      protein: (meal.protein_grams || 0) * meal.serving_multiplier,
      carbs: (meal.carb_grams || 0) * meal.serving_multiplier,
      fat: (meal.fat_grams || 0) * meal.serving_multiplier,
    }

    // Build search expressions with fallback strategy
    const searchStrategies: string[] = []

    // Strategy 1: Use extracted keywords (most specific)
    if (keywords.searchExpression && keywords.searchExpression !== 'healthy meal') {
      searchStrategies.push(keywords.searchExpression)
    }

    // Strategy 2: Protein + meal type
    if (keywords.protein) {
      searchStrategies.push(`${keywords.protein} ${mealType}`)
    }

    // Strategy 3: Base ingredient + cooking method or cuisine
    if (keywords.base) {
      if (keywords.cookingMethod) {
        searchStrategies.push(`${keywords.cookingMethod} ${keywords.base}`)
      } else if (keywords.cuisine) {
        searchStrategies.push(`${keywords.cuisine} ${keywords.base}`)
      }
    }

    // Strategy 4: Dietary-aware search (for users with dietary preferences)
    if (profile?.dietary_style && profile.dietary_style !== 'none') {
      const dietaryTerms = buildDietarySearchTerms(profile.dietary_style)
      if (dietaryTerms.length > 0) {
        const randomDietaryTerm = dietaryTerms[Math.floor(Math.random() * dietaryTerms.length)]
        searchStrategies.push(`${randomDietaryTerm} ${mealType}`)
      }
    }

    // Strategy 5: Fallback to meal type categories
    const mealTypeFallbacks: Record<string, string[]> = {
      breakfast: ['breakfast eggs', 'oatmeal breakfast', 'healthy breakfast'],
      lunch: ['lunch bowl', 'healthy salad', 'lunch sandwich'],
      dinner: ['dinner protein', 'healthy dinner', 'grilled dinner'],
      snack: ['healthy snack', 'protein snack', 'light snack'],
    }
    const fallbacks = mealTypeFallbacks[mealType] || ['healthy meal']
    searchStrategies.push(fallbacks[Math.floor(Math.random() * fallbacks.length)])

    // Remove duplicates while preserving order
    const uniqueStrategies = [...new Set(searchStrategies)]
    console.log('[GetSwapOptions] Search strategies:', uniqueStrategies)

    // Calorie range for filtering
    const minCal = targetCalories * 0.7
    const maxCal = targetCalories * 1.3

    // Try each search strategy until we get enough results
    let allRecipes: Array<{
      recipe_id: string
      recipe_name: string
      recipe_image?: string
      recipe_nutrition?: {
        calories?: string
        protein?: string
        carbohydrate?: string
        fat?: string
      }
    }> = []

    for (const searchExpression of uniqueStrategies) {
      if (allRecipes.length >= 12) break // We have enough candidates

      console.log('[GetSwapOptions] Trying search:', searchExpression)
      const response = await fatSecretService.searchRecipes({
        search_expression: searchExpression,
        max_results: 15,
      })

      if (response.recipes?.recipe) {
        const recipes = Array.isArray(response.recipes.recipe)
          ? response.recipes.recipe
          : [response.recipes.recipe]

        // Add new recipes (avoid duplicates)
        const existingIds = new Set(allRecipes.map(r => r.recipe_id))
        for (const recipe of recipes) {
          if (!existingIds.has(recipe.recipe_id)) {
            allRecipes.push(recipe)
            existingIds.add(recipe.recipe_id)
          }
        }
      }

      // If first strategy gives good results, don't need fallbacks
      if (allRecipes.length >= 8 && searchExpression === uniqueStrategies[0]) {
        break
      }
    }

    if (allRecipes.length === 0) {
      return { success: true, data: [] }
    }

    // Filter and score results
    const scoredOptions = allRecipes
      .map(recipe => {
        const calories = parseFloat(recipe.recipe_nutrition?.calories || '0')
        const protein = parseFloat(recipe.recipe_nutrition?.protein || '0')
        const carbs = parseFloat(recipe.recipe_nutrition?.carbohydrate || '0')
        const fat = parseFloat(recipe.recipe_nutrition?.fat || '0')

        // Check dietary conflicts
        const hasDietaryConflict = checkDietaryConflict(
          recipe.recipe_name,
          profile?.dietary_style || null,
          profile?.allergies || null
        )

        // Check foods to avoid
        let hasAvoidedFood = false
        if (profile?.foods_to_avoid) {
          const avoidList = profile.foods_to_avoid.toLowerCase().split(',').map((s: string) => s.trim())
          const recipeLower = recipe.recipe_name.toLowerCase()
          hasAvoidedFood = avoidList.some((food: string) => food && recipeLower.includes(food))
        }

        // Calculate macro similarity score
        const macroSimilarity = calculateMacroSimilarity(originalMacros, {
          calories,
          protein,
          carbs,
          fat,
        })

        // Calorie range check
        const inCalorieRange = calories >= minCal && calories <= maxCal

        // Exclude current meal from results
        const isCurrentMeal = recipe.recipe_name.toLowerCase() === meal.recipe_title.toLowerCase()

        return {
          recipe,
          calories,
          protein,
          carbs,
          fat,
          macroSimilarity,
          hasDietaryConflict,
          hasAvoidedFood,
          inCalorieRange,
          isCurrentMeal,
        }
      })
      // Filter out conflicts and out-of-range
      .filter(item =>
        !item.hasDietaryConflict &&
        !item.hasAvoidedFood &&
        !item.isCurrentMeal &&
        item.inCalorieRange
      )
      // Sort by macro similarity (best matches first)
      .sort((a, b) => b.macroSimilarity - a.macroSimilarity)

    console.log('[GetSwapOptions] Found', scoredOptions.length, 'valid options after filtering')

    // Take top 6 results
    const swapOptions: SwapOption[] = scoredOptions
      .slice(0, 6)
      .map(item => ({
        id: item.recipe.recipe_id,
        title: item.recipe.recipe_name,
        image: item.recipe.recipe_image || null,
        readyInMinutes: null,
        servings: 1,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      }))

    return { success: true, data: swapOptions }
  } catch (error) {
    console.error('[GetSwapOptions] Error:', error)
    return { success: false, error: 'Failed to fetch alternatives' }
  }
}

// ============================================================================
// Swap Meal - Perform Swap
// ============================================================================

export async function swapMeal(
  mealId: string,
  newRecipeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: meal, error: mealError } = await supabase
      .from('meal_plan_meals')
      .select('*, meal_plans!inner(user_id, id)')
      .eq('id', mealId)
      .single()

    if (mealError || !meal) {
      return { success: false, error: 'Meal not found' }
    }

    if ((meal.meal_plans as { user_id: string }).user_id !== user.id) {
      return { success: false, error: 'Meal not found' }
    }

    // Fetch new recipe details from FatSecret
    const newRecipe = await fatSecretService.getRecipeDetails(newRecipeId)

    if (!newRecipe) {
      return { success: false, error: 'Failed to fetch recipe details' }
    }

    const normalized = fatSecretService.normalizeRecipe(newRecipe)

    // Update the meal with new recipe
    const { error: updateError } = await supabase
      .from('meal_plan_meals')
      .update({
        fatsecret_id: normalized.id,
        spoonacular_id: null,
        recipe_source: 'fatsecret',
        recipe_title: normalized.title,
        recipe_image_url: normalized.imageUrl,
        servings: normalized.servings,
        ready_in_minutes: normalized.totalTimeMinutes,
        calories: normalized.calories,
        protein_grams: normalized.protein,
        carb_grams: normalized.carbs,
        fat_grams: normalized.fat,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mealId)

    if (updateError) {
      console.error('[SwapMeal] Update error:', updateError)
      return { success: false, error: 'Failed to swap meal' }
    }

    const planId = (meal.meal_plans as { id: string }).id
    revalidatePath(`/meal-plans/${planId}`)
    revalidatePath('/meal-plans')

    return { success: true }
  } catch (error) {
    console.error('[SwapMeal] Error:', error)
    return { success: false, error: 'Failed to swap meal' }
  }
}

// ============================================================================
// Get Quota Info
// ============================================================================

export async function getMealPlanQuotaInfo(): Promise<{
  success: boolean
  data?: {
    tier: 'free' | 'paid'
    remaining: number
    total: number
    used: number
  }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const tier = await getUserSubscriptionTier(user.id)

    const { data: quota } = await supabase
      .from('meal_plan_generation_quota')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const total = tier === 'free' ? 3 : 100
    const used = tier === 'free'
      ? (quota?.free_tier_generated || 0)
      : (quota?.current_period_generated || 0)
    const remaining = Math.max(0, total - used)

    return {
      success: true,
      data: {
        tier,
        remaining,
        total,
        used,
      },
    }
  } catch (error) {
    console.error('[GetQuotaInfo] Unexpected error:', error)
    return { success: false, error: 'Failed to fetch quota info' }
  }
}

// ============================================================================
// Update Meal Serving Size
// ============================================================================

const UpdateMealServingSchema = z.object({
  mealId: z.string().uuid('Invalid meal ID'),
  servingMultiplier: z
    .number()
    .min(0.5, 'Serving size must be at least 0.5x')
    .max(3.0, 'Serving size cannot exceed 3x'),
})

export async function updateMealServing(
  mealId: string,
  servingMultiplier: number
): Promise<{
  success: boolean
  data?: {
    servingMultiplier: number
    adjustedCalories: number
    adjustedProtein: number
    adjustedCarbs: number
    adjustedFat: number
  }
  error?: string
}> {
  try {
    // Validate input
    const validation = UpdateMealServingSchema.safeParse({ mealId, servingMultiplier })
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify meal belongs to user's plan
    const { data: meal, error: mealError } = await supabase
      .from('meal_plan_meals')
      .select('*, meal_plans!inner(user_id, id)')
      .eq('id', mealId)
      .single()

    if (mealError || !meal) {
      return { success: false, error: 'Meal not found' }
    }

    if ((meal.meal_plans as { user_id: string }).user_id !== user.id) {
      return { success: false, error: 'Meal not found' }
    }

    // Update serving multiplier
    const { error: updateError } = await supabase
      .from('meal_plan_meals')
      .update({
        serving_multiplier: servingMultiplier,
        notes: servingMultiplier !== 1.0 ? `${servingMultiplier}x serving size` : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mealId)

    if (updateError) {
      console.error('[UpdateMealServing] Update error:', updateError)
      return { success: false, error: 'Failed to update serving size' }
    }

    // Calculate adjusted values
    const adjustedCalories = Math.round((meal.calories || 0) * servingMultiplier)
    const adjustedProtein = Math.round((meal.protein_grams || 0) * servingMultiplier * 10) / 10
    const adjustedCarbs = Math.round((meal.carb_grams || 0) * servingMultiplier * 10) / 10
    const adjustedFat = Math.round((meal.fat_grams || 0) * servingMultiplier * 10) / 10

    const planId = (meal.meal_plans as { id: string }).id
    revalidatePath(`/meal-plans/${planId}`)

    return {
      success: true,
      data: {
        servingMultiplier,
        adjustedCalories,
        adjustedProtein,
        adjustedCarbs,
        adjustedFat,
      },
    }
  } catch (error) {
    console.error('[UpdateMealServing] Unexpected error:', error)
    return { success: false, error: 'Failed to update serving size' }
  }
}

// ============================================================================
// Get Meal Plan Meal Info (for recipe page linking)
// ============================================================================

export async function getMealPlanMealInfo(
  mealId: string
): Promise<{
  success: boolean
  data?: {
    id: string
    mealPlanId: string
    servingMultiplier: number
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: meal, error: mealError } = await supabase
      .from('meal_plan_meals')
      .select('id, meal_plan_id, serving_multiplier, calories, protein_grams, carb_grams, fat_grams, meal_plans!inner(user_id)')
      .eq('id', mealId)
      .single()

    if (mealError || !meal) {
      return { success: false, error: 'Meal not found' }
    }

    // Verify ownership - meal_plans from inner join is an object (not array) due to single()
    const mealPlan = meal.meal_plans as unknown as { user_id: string }
    if (mealPlan.user_id !== user.id) {
      return { success: false, error: 'Meal not found' }
    }

    return {
      success: true,
      data: {
        id: meal.id,
        mealPlanId: meal.meal_plan_id,
        servingMultiplier: meal.serving_multiplier,
        calories: meal.calories || 0,
        protein: meal.protein_grams || 0,
        carbs: meal.carb_grams || 0,
        fat: meal.fat_grams || 0,
      },
    }
  } catch (error) {
    console.error('[GetMealPlanMealInfo] Unexpected error:', error)
    return { success: false, error: 'Failed to fetch meal info' }
  }
}
