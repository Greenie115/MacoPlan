'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { LogMealInput, LoggedMeal } from '@/lib/types/meal-log'

// Validation schema for recipe ID
const recipeIdSchema = z.string().uuid({ message: 'Invalid recipe ID format' })

// Client-supplied local date (YYYY-MM-DD); falls back to server UTC date if
// absent/invalid so old callers keep working
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
function resolveDate(date?: string): string {
  return dateSchema.safeParse(date).success
    ? (date as string)
    : new Date().toISOString().split('T')[0]
}

// Bounds check shared by logMeal and updateMealLog; skips absent fields so
// partial updates validate only what they change
function validateMacros(input: Partial<LogMealInput>): string | null {
  const bounds: [number | undefined, number][] = [
    [input.calories, 10000],
    [input.proteinGrams, 1000],
    [input.carbGrams, 1000],
    [input.fatGrams, 1000],
  ]
  for (const [value, max] of bounds) {
    if (value === undefined) continue
    if (value < 0) return 'Nutritional values must be non-negative'
    if (value > max) return 'Nutritional values seem too high. Please check your input.'
  }
  return null
}

/**
 * Log a new meal for the authenticated user
 */
export async function logMeal(input: LogMealInput, recipeId?: string) {
  const supabase = await createClient()
  const user = await getAuthUser()

  if (!user) {
    return { error: 'Authentication required' }
  }

  // Validation
  if (!input.name || input.name.trim().length === 0) {
    return { error: 'Meal name is required' }
  }

  if (input.name.trim().length > 100) {
    return { error: 'Meal name must be less than 100 characters' }
  }

  const macroError = validateMacros(input)
  if (macroError) {
    return { error: macroError }
  }

  const { data, error } = await supabase
    .from('logged_meals')
    .insert({
      user_id: user.id,
      date: resolveDate(input.date),
      name: input.name.trim(),
      meal_type: input.mealType,
      calories: Math.round(input.calories),
      protein_grams: Number(input.proteinGrams.toFixed(1)),
      carb_grams: Number(input.carbGrams.toFixed(1)),
      fat_grams: Number(input.fatGrams.toFixed(1)),
      serving_size: input.servingSize?.trim() || null,
      description: input.description?.trim() || null,
      recipe_id: recipeId && recipeId.length > 0 ? recipeId : null,
      plan_meal_id: null,
    })
    .select()
    .single()

  if (error) {
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
  const user = await getAuthUser()

  if (!user) {
    return { error: 'Authentication required', data: null }
  }

  const targetDate = resolveDate(date)

  const { data, error } = await supabase
    .from('logged_meals')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', targetDate)
    .order('logged_at', { ascending: true })

  if (error) {
    return { error: 'Failed to fetch meals', data: null }
  }

  return { success: true, data: data as LoggedMeal[] }
}

/**
 * Update an existing logged meal
 */
export async function updateMealLog(
  mealId: string,
  updates: Partial<LogMealInput>
) {
  const supabase = await createClient()
  const user = await getAuthUser()

  if (!user) {
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

  const macroError = validateMacros(updates)
  if (macroError) {
    return { error: macroError }
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
  const user = await getAuthUser()

  if (!user) {
    return { error: 'Authentication required' }
  }

  const { error } = await supabase.from('logged_meals').delete().eq('id', mealId)

  if (error) {
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
  const user = await getAuthUser()

  if (!user) {
    return { mealId: null }
  }

  const targetDate = resolveDate(date)

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
