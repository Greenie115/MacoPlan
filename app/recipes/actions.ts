'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schema for recipe ID (must be valid UUID)
const recipeIdSchema = z.string().uuid({ message: 'Invalid recipe ID format' })

/**
 * Toggle a recipe as favorite for the current user
 * Adds the recipe to favorites if not already favorited, removes it otherwise
 */
export async function toggleFavorite(recipeId: string) {
  // Validate recipe ID format
  const validationResult = recipeIdSchema.safeParse(recipeId)
  if (!validationResult.success) {
    return { error: 'Invalid recipe ID' }
  }

  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be logged in to favorite recipes' }
  }

  // Check if recipe is already favorited
  const { data: existing } = await supabase
    .from('user_favorite_recipes')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  if (existing) {
    // Remove from favorites
    const { error } = await supabase
      .from('user_favorite_recipes')
      .delete()
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)

    if (error) {
      console.error('Failed to remove favorite:', error)
      return {
        error:
          error.code === 'PGRST116'
            ? 'Favorite not found'
            : 'Failed to remove favorite. Please try again.',
      }
    }

    revalidatePath('/recipes')
    revalidatePath(`/recipes/${recipeId}`)
    return { success: true, isFavorite: false }
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('user_favorite_recipes')
      .insert({ user_id: user.id, recipe_id: recipeId })

    if (error) {
      console.error('Failed to add favorite:', error)
      // PostgreSQL error codes: 23503 = foreign key violation, 23505 = unique violation
      if (error.code === '23503') {
        return { error: 'Recipe not found' }
      }
      if (error.code === '23505') {
        return { error: 'Recipe is already in your favorites' }
      }
      return { error: 'Failed to add favorite. Please try again.' }
    }

    revalidatePath('/recipes')
    revalidatePath(`/recipes/${recipeId}`)
    return { success: true, isFavorite: true }
  }
}

/**
 * Get all favorite recipe IDs for the current user
 */
export async function getFavoriteRecipeIds(): Promise<string[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('user_favorite_recipes')
    .select('recipe_id')
    .eq('user_id', user.id)

  if (error || !data) {
    return []
  }

  return data.map((fav) => fav.recipe_id)
}

/**
 * Check if a specific recipe is favorited by the current user
 */
export async function isFavorite(recipeId: string): Promise<boolean> {
  // Validate recipe ID format
  const validationResult = recipeIdSchema.safeParse(recipeId)
  if (!validationResult.success) {
    return false
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('user_favorite_recipes')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  return !!data
}
