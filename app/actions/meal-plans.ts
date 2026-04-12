'use server'

/**
 * Server Actions for Meal Plan Management
 *
 * CRUD operations, quota management, and serving adjustments for meal plans.
 * Plan generation is now handled by the batch-prep system (see app/actions/batch-prep.ts).
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  getUserSubscriptionTier,
} from '@/lib/utils/subscription'
import type {
  MealPlan,
  MealPlanMeal,
} from '@/lib/types/database'
import { z } from 'zod'

// ============================================================================
// Get User's Meal Plans
// ============================================================================

export interface MealPlanWithPreviews extends MealPlan {
  preview_images: {
    recipe_api_id: string | null
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
          recipe_api_id,
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
        recipe_api_id: string | null
        recipe_image_url: string | null
        meal_order: number
      }>

      const sortedMeals = meals.sort((a, b) => a.meal_order - b.meal_order)
      const seenIds = new Set<string>()
      const previewImages: { recipe_api_id: string | null; image_url: string | null }[] = []

      for (const meal of sortedMeals) {
        if (previewImages.length >= 4) break
        const id = meal.recipe_api_id
        if (id && seenIds.has(id)) continue
        if (id) seenIds.add(id)

        previewImages.push({
          recipe_api_id: meal.recipe_api_id,
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
      // Log more details to help debug
      console.error('[GetMealPlanById] Error:', {
        planId,
        userId: user.id,
        error: planError?.message || 'Plan not found',
        code: planError?.code,
      })
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
