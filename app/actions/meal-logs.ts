'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { LogMealInput, LoggedMeal, DailyTotals } from '@/lib/types/meal-log'

// Validation schema for recipe ID
const recipeIdSchema = z.string().uuid({ message: 'Invalid recipe ID format' })

/**
 * Log a new meal for the authenticated user
 */
export async function logMeal(input: LogMealInput, recipeId?: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Validation
  if (!input.name || input.name.trim().length === 0) {
    return { error: 'Meal name is required' }
  }

  if (input.name.trim().length > 100) {
    return { error: 'Meal name must be less than 100 characters' }
  }

  if (
    input.calories < 0 ||
    input.proteinGrams < 0 ||
    input.carbGrams < 0 ||
    input.fatGrams < 0
  ) {
    return { error: 'Nutritional values must be non-negative' }
  }

  if (
    input.calories > 10000 ||
    input.proteinGrams > 1000 ||
    input.carbGrams > 1000 ||
    input.fatGrams > 1000
  ) {
    return { error: 'Nutritional values seem too high. Please check your input.' }
  }

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const { data, error } = await supabase
    .from('logged_meals')
    .insert({
      user_id: user.id,
      date: today,
      name: input.name.trim(),
      meal_type: input.mealType,
      calories: Math.round(input.calories),
      protein_grams: Number(input.proteinGrams.toFixed(1)),
      carb_grams: Number(input.carbGrams.toFixed(1)),
      fat_grams: Number(input.fatGrams.toFixed(1)),
      serving_size: input.servingSize?.trim() || null,
      description: input.description?.trim() || null,
      recipe_id: recipeId || null,
      plan_meal_id: null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error logging meal:', error)
    return { error: 'Failed to log meal. Please try again.' }
  }

  revalidatePath('/dashboard')
  return { success: true, data }
}

/**
 * Get all logged meals for a specific date
 */
export async function getMealsForDate(date?: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required', data: null }
  }

  const targetDate = date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('logged_meals')
    .select('*')
    .eq('date', targetDate)
    .order('logged_at', { ascending: true })

  if (error) {
    console.error('Error fetching meals:', error)
    return { error: 'Failed to fetch meals', data: null }
  }

  return { success: true, data: data as LoggedMeal[] }
}

/**
 * Get daily totals for dashboard
 */
export async function getDailyTotals(date?: string): Promise<{
  success?: boolean
  error?: string
  data?: DailyTotals
}> {
  const result = await getMealsForDate(date)

  if (result.error || !result.data) {
    return { error: result.error || 'No data', data: undefined }
  }

  const totals = result.data.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein_grams,
      carbs: acc.carbs + meal.carb_grams,
      fat: acc.fat + meal.fat_grams,
      mealsLogged: acc.mealsLogged + 1,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, mealsLogged: 0 }
  )

  return { success: true, data: totals }
}

/**
 * Update an existing logged meal
 */
export async function updateMealLog(
  mealId: string,
  updates: Partial<LogMealInput>
) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Validation
  if (updates.name !== undefined) {
    if (!updates.name || updates.name.trim().length === 0) {
      return { error: 'Meal name is required' }
    }
    if (updates.name.trim().length > 100) {
      return { error: 'Meal name must be less than 100 characters' }
    }
  }

  // Build update object
  const updateData: Record<string, unknown> = {}

  if (updates.name !== undefined) updateData.name = updates.name.trim()
  if (updates.mealType !== undefined) updateData.meal_type = updates.mealType
  if (updates.calories !== undefined)
    updateData.calories = Math.round(updates.calories)
  if (updates.proteinGrams !== undefined)
    updateData.protein_grams = Number(updates.proteinGrams.toFixed(1))
  if (updates.carbGrams !== undefined)
    updateData.carb_grams = Number(updates.carbGrams.toFixed(1))
  if (updates.fatGrams !== undefined)
    updateData.fat_grams = Number(updates.fatGrams.toFixed(1))
  if (updates.servingSize !== undefined)
    updateData.serving_size = updates.servingSize?.trim() || null
  if (updates.description !== undefined)
    updateData.description = updates.description?.trim() || null

  const { data, error } = await supabase
    .from('logged_meals')
    .update(updateData)
    .eq('id', mealId)
    .select()
    .single()

  if (error) {
    console.error('Error updating meal:', error)
    return { error: 'Failed to update meal' }
  }

  revalidatePath('/dashboard')
  return { success: true, data }
}

/**
 * Delete a logged meal
 */
export async function deleteMealLog(mealId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  const { error } = await supabase.from('logged_meals').delete().eq('id', mealId)

  if (error) {
    console.error('Error deleting meal:', error)
    return { error: 'Failed to delete meal' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/recipes/[id]', 'page')
  return { success: true }
}

/**
 * Check if a recipe has been logged today and return the meal log ID
 */
export async function getLoggedMealForRecipe(
  recipeId: string,
  date?: string
): Promise<{ mealId: string | null }> {
  // Validate recipe ID
  const validationResult = recipeIdSchema.safeParse(recipeId)
  if (!validationResult.success) {
    return { mealId: null }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { mealId: null }
  }

  const targetDate = date || new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const { data, error } = await supabase
    .from('logged_meals')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .eq('date', targetDate)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return { mealId: null }
  }

  return { mealId: data.id }
}
