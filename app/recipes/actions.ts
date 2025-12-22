'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserSubscriptionTier } from '@/lib/utils/subscription'
import { FREE_FAVORITES_LIMIT } from '@/lib/constants/subscription'
import { checkFavoritesQuota } from '@/app/actions/subscription'

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

    // Check favorites quota before adding
    const tier = await getUserSubscriptionTier(user.id)
    const quota = await checkFavoritesQuota(user.id, tier)

    if (!quota.allowed) {
      return {
        error: `You've reached the free tier limit of ${FREE_FAVORITES_LIMIT} favorites. Upgrade to Premium for unlimited favorites.`,
        limitReached: true,
      }
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

/**
 * Get cached recipes from local database for browsing
 * Used when no search query is provided to show all available recipes
 */
export async function getCachedRecipes(
  page: number = 1,
  limit: number = 20
): Promise<{
  data: Array<{
    id: string
    title: string
    description: string | null
    imageUrl: string | null
    calories: number
    protein: number
    carbs: number
    fat: number
  }>
  totalCount: number
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    // Get total count
    const { count } = await supabase
      .from('fatsecret_recipes')
      .select('*', { count: 'exact', head: true })

    // Fetch paginated recipes from local cache
    const { data, error } = await supabase
      .from('fatsecret_recipes')
      .select('fatsecret_id, recipe_name, recipe_description, image_url, calories, protein_grams, carb_grams, fat_grams')
      .not('image_url', 'is', null) // Only recipes with images
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching cached recipes:', error)
      return { data: [], totalCount: 0, error: 'Failed to fetch recipes' }
    }

    const recipes = (data || []).map((recipe) => ({
      id: recipe.fatsecret_id,
      title: recipe.recipe_name,
      description: recipe.recipe_description,
      imageUrl: recipe.image_url,
      calories: recipe.calories || 0,
      protein: recipe.protein_grams || 0,
      carbs: recipe.carb_grams || 0,
      fat: recipe.fat_grams || 0,
    }))

    return {
      data: recipes,
      totalCount: count || 0,
      error: null,
    }
  } catch (error) {
    console.error('Unexpected error fetching cached recipes:', error)
    return { data: [], totalCount: 0, error: 'Failed to fetch recipes' }
  }
}

/**
 * Get the most favorited recipes across all users
 * Uses Supabase RPC to bypass RLS and aggregate data
 */
export async function getMostFavoritedRecipes(
  page: number = 1,
  limit: number = 20
): Promise<{
  data: Array<{
    id: string
    title: string
    description: string | null
    imageUrl: string | null
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
    favoriteCount: number
  }>
  totalCount: number
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    // Fetch most favorited recipes using RPC
    const [recipesResult, countResult] = await Promise.all([
      supabase.rpc('get_most_favorited_recipes', {
        p_limit: limit,
        p_offset: offset,
      }),
      supabase.rpc('get_most_favorited_count'),
    ])

    if (recipesResult.error) {
      console.error('Error fetching most favorited recipes:', recipesResult.error)
      return { data: [], totalCount: 0, error: 'Failed to fetch popular recipes' }
    }

    if (countResult.error) {
      console.error('Error fetching count:', countResult.error)
      // Continue with recipes even if count fails
    }

    const recipes = (recipesResult.data || []).map((recipe: {
      fatsecret_recipe_id: string
      recipe_title: string
      recipe_description: string | null
      recipe_image_url: string | null
      calories: number | null
      protein_grams: number | null
      carb_grams: number | null
      fat_grams: number | null
      favorite_count: number
    }) => ({
      id: recipe.fatsecret_recipe_id,
      title: recipe.recipe_title,
      description: recipe.recipe_description,
      imageUrl: recipe.recipe_image_url,
      calories: recipe.calories ? Number(recipe.calories) : null,
      protein: recipe.protein_grams ? Number(recipe.protein_grams) : null,
      carbs: recipe.carb_grams ? Number(recipe.carb_grams) : null,
      fat: recipe.fat_grams ? Number(recipe.fat_grams) : null,
      favoriteCount: Number(recipe.favorite_count),
    }))

    return {
      data: recipes,
      totalCount: countResult.data || 0,
      error: null,
    }
  } catch (error) {
    console.error('Unexpected error fetching most favorited:', error)
    return { data: [], totalCount: 0, error: 'Failed to fetch popular recipes' }
  }
}
