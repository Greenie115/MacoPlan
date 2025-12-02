'use server'

/**
 * Server Actions for Meal Plan Management
 *
 * Handles meal plan generation, CRUD operations, and quota management
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { spoonacularMealPlanService } from '@/lib/services/spoonacular-meal-plans'
import { spoonacularService } from '@/lib/services/spoonacular'
import {
  getUserSubscriptionTier,
  checkMealPlanQuota,
  incrementMealPlanQuota,
} from '@/lib/utils/subscription'
import type {
  MealPlan,
  MealPlanInsert,
  MealPlanMeal,
  MealPlanMealInsert,
  MealPlanGenerationParams,
} from '@/lib/types/database'
import type {
  SpoonacularDailyMealPlan,
  SpoonacularWeeklyMealPlan,
  SpoonacularMeal,
} from '@/lib/types/spoonacular'

// ============================================================================
// Types
// ============================================================================

interface GenerateMealPlanRequest {
  timeFrame: 'day' | 'week'
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
// Helper: Map Dietary Style to Spoonacular Diet
// ============================================================================

function mapDietaryStyleToDiet(dietaryStyle?: string | null): string | undefined {
  if (!dietaryStyle || dietaryStyle === 'none') return undefined

  const dietMap: Record<string, string> = {
    vegetarian: 'vegetarian',
    vegan: 'vegan',
    pescatarian: 'pescatarian',
    paleo: 'paleo',
    keto: 'ketogenic',
    mediterranean: 'mediterranean',
  }

  return dietMap[dietaryStyle]
}

// ============================================================================
// Generate Meal Plan
// ============================================================================

export async function generateMealPlan(
  request: GenerateMealPlanRequest
): Promise<GenerateMealPlanResponse> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Step 1: Check subscription tier and quota
    const tier = await getUserSubscriptionTier(user.id)
    const quotaCheck = await checkMealPlanQuota(user.id, tier)

    if (!quotaCheck.allowed) {
      return {
        success: false,
        error: quotaCheck.reason,
        quotaInfo: {
          remaining: quotaCheck.remaining,
          total: quotaCheck.total,
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

    // Step 3: Build Spoonacular API parameters
    const targetCalories = request.targetCalories || profile.target_calories
    const diet = request.customDiet || mapDietaryStyleToDiet(profile.dietary_style)

    // Combine allergies and foods to avoid
    const excludeItems: string[] = []
    if (profile.allergies) {
      excludeItems.push(...profile.allergies)
    }
    if (profile.foods_to_avoid) {
      excludeItems.push(
        ...profile.foods_to_avoid
          .split(',')
          .map((item: string) => item.trim())
          .filter(Boolean)
      )
    }
    if (request.customExclude) {
      excludeItems.push(request.customExclude)
    }

    const params: MealPlanGenerationParams = {
      timeFrame: request.timeFrame,
      targetCalories,
      mealsPerDay: request.mealsPerDay,
      diet,
      exclude: excludeItems.length > 0 ? excludeItems.join(',') : undefined,
    }

    // Step 4: Generate meal plan via Spoonacular API (with caching)
    console.log('[GenerateMealPlan] Calling Spoonacular API with params:', params)

    const spoonacularPlan = await spoonacularMealPlanService.generateMealPlan({
      timeFrame: params.timeFrame,
      targetCalories: params.targetCalories,
      diet: params.diet,
      exclude: params.exclude,
    })

    // Step 5: Validate macro match (±5% tolerance)
    let actualCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    if (request.timeFrame === 'day') {
      const dailyPlan = spoonacularPlan as SpoonacularDailyMealPlan
      actualCalories = dailyPlan.nutrients.calories
      totalProtein = dailyPlan.nutrients.protein
      totalCarbs = dailyPlan.nutrients.carbohydrates
      totalFat = dailyPlan.nutrients.fat
    } else {
      const weeklyPlan = spoonacularPlan as SpoonacularWeeklyMealPlan
      const days = Object.values(weeklyPlan.week)
      days.forEach((day) => {
        actualCalories += day.nutrients.calories
        totalProtein += day.nutrients.protein
        totalCarbs += day.nutrients.carbohydrates
        totalFat += day.nutrients.fat
      })
      // Average per day for validation
      actualCalories /= 7
    }

    const macroMatch = spoonacularMealPlanService.validateMacroMatch(
      targetCalories,
      actualCalories
    )

    // Step 6: Deactivate existing active plans (unique constraint: only 1 active per user)
    const { error: deactivateError } = await supabase
      .from('meal_plans')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (deactivateError) {
      console.error('[GenerateMealPlan] Error deactivating existing plans:', deactivateError)
      // Continue anyway - this is not critical
    }

    // Step 7: Save meal plan to database
    const startDate = new Date()
    const endDate = new Date()
    if (request.timeFrame === 'week') {
      endDate.setDate(endDate.getDate() + 6)
    }

    const mealPlanData: MealPlanInsert = {
      user_id: user.id,
      name: `${request.timeFrame === 'day' ? 'Daily' : 'Weekly'} Meal Plan - ${startDate.toLocaleDateString()}`,
      description: `Generated meal plan with ${Math.round(actualCalories)} calories per day`,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      total_days: request.timeFrame === 'day' ? 1 : 7,
      target_calories: targetCalories,
      protein_grams: profile.protein_grams || 0,
      carb_grams: profile.carb_grams || 0,
      fat_grams: profile.fat_grams || 0,
      is_active: true,
      archived: false,
      completed_at: null,
      plan_source: 'generated',
      spoonacular_plan_id: null, // Will be linked if needed
      is_favorite: false,
      generation_params: params,
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

    if (request.timeFrame === 'day') {
      const dailyPlan = spoonacularPlan as SpoonacularDailyMealPlan
      dailyPlan.meals.forEach((meal, index) => {
        mealsToInsert.push(createMealPlanMealEntry(savedPlan.id, meal, 0, index))
      })
    } else {
      const weeklyPlan = spoonacularPlan as SpoonacularWeeklyMealPlan
      const dayNames = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]
      dayNames.forEach((dayName, dayIndex) => {
        const dayPlan = weeklyPlan.week[dayName as keyof typeof weeklyPlan.week]
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

    // Step 9: Increment quota counter
    await incrementMealPlanQuota(user.id, tier)

    // Step 10: Revalidate paths
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
        remaining: quotaCheck.remaining - 1,
        total: quotaCheck.total,
      },
    }
  } catch (error) {
    console.error('[GenerateMealPlan] Unexpected error:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate meal plan. Please try again.',
    }
  }
}

// Helper to create meal plan meal entry
function createMealPlanMealEntry(
  mealPlanId: string,
  meal: SpoonacularMeal,
  dayIndex: number,
  mealOrder: number
): MealPlanMealInsert {
  // Determine meal type based on order (simple heuristic)
  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ]
  const mealType = mealTypes[mealOrder] || 'snack'

  return {
    meal_plan_id: mealPlanId,
    day_index: dayIndex,
    meal_type: mealType,
    meal_order: mealOrder,
    recipe_id: null,
    spoonacular_id: meal.id,
    recipe_source: 'spoonacular',
    recipe_title: meal.title,
    recipe_image_url: meal.imageType
      ? `https://spoonacular.com/recipeImages/${meal.id}-312x231.${meal.imageType}`
      : null,
    servings: meal.servings,
    ready_in_minutes: meal.readyInMinutes,
    calories: null, // Will be fetched from recipe details if needed
    protein_grams: null,
    carb_grams: null,
    fat_grams: null,
    serving_multiplier: 1.0,
    notes: null,
  }
}

// ============================================================================
// Get User's Meal Plans
// ============================================================================

export async function getMealPlans(filters?: {
  activeOnly?: boolean
  favoritesOnly?: boolean
  archived?: boolean
}): Promise<{
  success: boolean
  data?: MealPlan[]
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
      .select('*')
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
      // Default: exclude archived unless explicitly requested
      query = query.eq('archived', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('[GetMealPlans] Error:', error)
      return { success: false, error: 'Failed to fetch meal plans' }
    }

    return { success: true, data: data as MealPlan[] }
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

    // Fetch meal plan
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

    // Fetch meals
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

    // Get current status
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

    // Delete will cascade to meal_plan_meals table
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

    // Get original plan with generation params
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

    // Generate new meal plan with same parameters
    return await generateMealPlan({
      timeFrame: params.timeFrame,
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
    const quotaCheck = await checkMealPlanQuota(user.id, tier)

    return {
      success: true,
      data: {
        tier,
        remaining: quotaCheck.remaining,
        total: quotaCheck.total,
        used: quotaCheck.total - quotaCheck.remaining,
      },
    }
  } catch (error) {
    console.error('[GetQuotaInfo] Unexpected error:', error)
    return { success: false, error: 'Failed to fetch quota info' }
  }
}
