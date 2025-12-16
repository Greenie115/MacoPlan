'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Set a plan as active (deactivates all other plans for user)
 * Enforces single active plan rule
 */
export async function setActivePlan(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Deactivate all other plans for this user
    await supabase
      .from('meal_plans')
      .update({ is_active: false })
      .eq('user_id', user.id)

    // Activate the selected plan
    const { error } = await supabase
      .from('meal_plans')
      .update({ is_active: true })
      .eq('id', planId)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/meal-plans')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to set active plan' }
  }
}

/**
 * Get recent plans with calculated progress based on actual meal logging
 * Returns up to 4 plans: 1 active + 3 recent non-archived plans
 */
export async function getRecentPlansWithProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] }
  }

  try {
    // Fetch up to 4 recent non-archived plans (active first, then by start_date)
    const { data: plans, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('is_active', { ascending: false }) // Active plans first
      .order('start_date', { ascending: false }) // Then by most recent
      .limit(4)

    if (error) {
      console.error('Error fetching plans:', error)
      return { success: false, error: error.message, data: [] }
    }

    if (!plans || plans.length === 0) {
      return { success: true, data: [] }
    }

    // Calculate days completed for each plan based on actual meal logging
    const plansWithProgress = await Promise.all(
      plans.map(async (plan) => {
        // Get distinct dates where user logged meals within this plan's date range
        const { data: loggedDays } = await supabase
          .from('logged_meals')
          .select('date')
          .eq('user_id', user.id)
          .gte('date', plan.start_date)
          .lte('date', plan.end_date)

        // Count unique days with at least one meal logged
        const uniqueDays = new Set(loggedDays?.map((log) => log.date) || [])
        const daysCompleted = uniqueDays.size

        // Fetch preview images from meal_plan_meals (first 4 unique recipes)
        const { data: meals } = await supabase
          .from('meal_plan_meals')
          .select('recipe_image_url, fatsecret_id, spoonacular_id, meal_order')
          .eq('meal_plan_id', plan.id)
          .order('meal_order', { ascending: true })

        // Get first 4 unique images (avoid duplicates from same recipe)
        const seenIds = new Set<string>()
        const previewImages: string[] = []

        if (meals) {
          for (const meal of meals) {
            if (previewImages.length >= 4) break

            // Create unique key from recipe ID
            const uniqueKey = meal.fatsecret_id || meal.spoonacular_id?.toString() || meal.meal_order?.toString()
            if (uniqueKey && seenIds.has(uniqueKey)) continue
            if (uniqueKey) seenIds.add(uniqueKey)

            // Only add if there's an actual image URL
            if (meal.recipe_image_url) {
              previewImages.push(meal.recipe_image_url)
            }
          }
        }

        // Format date range for display
        const startDate = new Date(plan.start_date)
        const endDate = new Date(plan.end_date)
        const dateRange = `${startDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}-${endDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`

        return {
          id: plan.id,
          name: plan.name,
          dateRange,
          caloriesPerDay: plan.target_calories,
          proteinGrams: plan.protein_grams,
          carbGrams: plan.carb_grams,
          fatGrams: plan.fat_grams,
          isActive: plan.is_active,
          daysCompleted,
          totalDays: plan.total_days,
          images: previewImages, // Actual recipe images
          createdAt: new Date(plan.created_at),
        }
      })
    )

    return { success: true, data: plansWithProgress }
  } catch (error) {
    console.error('Error calculating plan progress:', error)
    return { success: false, error: 'Failed to load plans', data: [] }
  }
}

/**
 * Archive old completed plans (7+ days after end_date)
 * This keeps the Recent Plans section clean while preserving plan history
 */
export async function archiveOldCompletedPlans() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoString = sevenDaysAgo.toISOString().split('T')[0]

    // Archive plans where:
    // - end_date is more than 7 days ago
    // - plan is not active
    // - plan is not already archived
    const { error } = await supabase
      .from('meal_plans')
      .update({
        archived: true,
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('is_active', false)
      .eq('archived', false)
      .lt('end_date', sevenDaysAgoString)

    if (error) {
      console.error('Error archiving plans:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/meal-plans')
    return { success: true }
  } catch (error) {
    console.error('Error archiving old plans:', error)
    return { success: false, error: 'Failed to archive old plans' }
  }
}

/**
 * Mark a plan as completed manually
 * Sets completed_at timestamp
 */
export async function markPlanCompleted(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const { error } = await supabase
      .from('meal_plans')
      .update({
        completed_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', planId)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/meal-plans')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to mark plan as completed' }
  }
}
