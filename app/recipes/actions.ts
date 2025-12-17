'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Recipe metadata for FatSecret favorites
 */
interface FatSecretRecipeMetadata {
  title: string
  description?: string
  imageUrl?: string | null
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}

/**
 * Toggle a FatSecret recipe as favorite for the current user
 * Adds the recipe to favorites if not already favorited, removes it otherwise
 */
export async function toggleFatSecretFavorite(
  recipeId: string,
  metadata?: FatSecretRecipeMetadata
) {
  // FatSecret recipe IDs are numeric strings
  if (!recipeId || !/^\d+$/.test(recipeId)) {
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
    .from('user_fatsecret_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('fatsecret_recipe_id', recipeId)
    .single()

  if (existing) {
    // Remove from favorites
    const { error } = await supabase
      .from('user_fatsecret_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('fatsecret_recipe_id', recipeId)

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
    revalidatePath(`/recipes/fatsecret/${recipeId}`)
    return { success: true, isFavorite: false }
  } else {
    // Add to favorites - requires metadata for first-time save
    if (!metadata?.title) {
      return { error: 'Recipe metadata required to add favorite' }
    }

    const { error } = await supabase.from('user_fatsecret_favorites').insert({
      user_id: user.id,
      fatsecret_recipe_id: recipeId,
      recipe_title: metadata.title,
      recipe_description: metadata.description || null,
      recipe_image_url: metadata.imageUrl || null,
      calories: metadata.calories || null,
      protein_grams: metadata.protein || null,
      carb_grams: metadata.carbs || null,
      fat_grams: metadata.fat || null,
    })

    if (error) {
      console.error('Failed to add favorite:', error)
      if (error.code === '23505') {
        return { error: 'Recipe is already in your favorites' }
      }
      return { error: 'Failed to add favorite. Please try again.' }
    }

    revalidatePath('/recipes')
    revalidatePath(`/recipes/fatsecret/${recipeId}`)
    return { success: true, isFavorite: true }
  }
}

/**
 * Get all favorite FatSecret recipe IDs for the current user
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
    .from('user_fatsecret_favorites')
    .select('fatsecret_recipe_id')
    .eq('user_id', user.id)

  if (error || !data) {
    return []
  }

  return data.map((fav) => fav.fatsecret_recipe_id)
}

/**
 * Check if a specific FatSecret recipe is favorited by the current user
 */
export async function isFatSecretFavorite(recipeId: string): Promise<boolean> {
  // FatSecret recipe IDs are numeric strings
  if (!recipeId || !/^\d+$/.test(recipeId)) {
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
    .from('user_fatsecret_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('fatsecret_recipe_id', recipeId)
    .single()

  return !!data
}

/**
 * Get all favorite FatSecret recipes with metadata for display
 */
export async function getFavoriteRecipes() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('user_fatsecret_favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorites:', error)
    return { data: [], error: 'Failed to fetch favorites' }
  }

  return {
    data: data.map((fav) => ({
      id: fav.fatsecret_recipe_id,
      title: fav.recipe_title,
      description: fav.recipe_description,
      imageUrl: fav.recipe_image_url,
      calories: fav.calories,
      protein: fav.protein_grams,
      carbs: fav.carb_grams,
      fat: fav.fat_grams,
      createdAt: fav.created_at,
    })),
    error: null,
  }
}
