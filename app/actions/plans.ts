'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { listBatchPrepPlans } from '@/lib/services/batch-prep-persistence'

function formatWeekOf(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00Z`)
  return `Week of ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })}`
}

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
      console.error('Database error:', error)
      return { success: false, error: 'An unexpected error occurred' }
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
    // Batch prep plans are the primary plan type; legacy meal_plans are kept
    // for users who generated plans before the batch-prep pivot.
    const [batchPlansResult, legacyResult] = await Promise.all([
      listBatchPrepPlans(user.id).catch(() => []),
      supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('is_active', { ascending: false }) // Active plans first
        .order('start_date', { ascending: false }) // Then by most recent
        .limit(4),
    ])

    const batchPlanCards = batchPlansResult.slice(0, 4).map((plan, index) => ({
      id: plan.id,
      name: 'Batch Prep',
      dateRange: formatWeekOf(plan.week_starting),
      caloriesPerDay: plan.calories ?? 0,
      proteinGrams: plan.protein_g ?? 0,
      carbGrams: plan.carbs_g ?? 0,
      fatGrams: plan.fat_g ?? 0,
      isActive: index === 0,
      images: [] as string[],
      createdAt: new Date(plan.created_at),
    }))

    const { data: plans, error } = legacyResult

    if (error) {
      console.error('Error fetching plans:', error)
      return { success: false, error: 'Failed to fetch meal plans', data: batchPlanCards }
    }

    if (!plans || plans.length === 0) {
      return { success: true, data: batchPlanCards }
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
          .select('recipe_image_url, recipe_api_id, meal_order')
          .eq('meal_plan_id', plan.id)
          .order('meal_order', { ascending: true })

        // Get first 4 unique images (avoid duplicates from same recipe)
        const seenIds = new Set<string>()
        const previewImages: string[] = []

        if (meals) {
          for (const meal of meals) {
            if (previewImages.length >= 4) break

            // Create unique key from recipe ID
            const uniqueKey = meal.recipe_api_id || meal.meal_order?.toString()
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
          // Stored legacy names embed an ambiguous locale date
          // ("Daily Meal Plan - 08/01/2026"); the dateRange line below
          // already shows the dates unambiguously.
          id: plan.id,
          name: String(plan.name || 'Meal Plan').replace(/\s*-\s*\d{1,2}\/\d{1,2}\/\d{2,4}$/, ''),
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

    // Batch preps first (newest first), then legacy plans; cap at 4 cards.
    // If a legacy plan is explicitly active, let it keep the badge.
    const hasActiveLegacy = plansWithProgress.some((p) => p.isActive)
    const combined = [
      ...batchPlanCards.map((p) => (hasActiveLegacy ? { ...p, isActive: false } : p)),
      ...plansWithProgress,
    ].slice(0, 4)

    return { success: true, data: combined }
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
      console.error('Database error:', error)
      return { success: false, error: 'An unexpected error occurred' }
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
      console.error('Database error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/meal-plans')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to mark plan as completed' }
  }
}
