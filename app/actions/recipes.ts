'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import { revalidatePath, unstable_cache } from 'next/cache'
import { after } from 'next/server'
import { getUserSubscriptionTier } from '@/lib/utils/subscription'
import { FREE_FAVORITES_LIMIT } from '@/lib/constants/subscription'
import { checkFavoritesQuota } from '@/app/actions/subscription'
import { createCacheClient } from '@/lib/supabase/cache-client'
import { unsplashService } from '@/lib/services/unsplash'
import { RECIPE_TAGS, type RecipeFilters } from '@/lib/utils/filter-validation'

/**
 * Recipe metadata for favorites
 */
interface RecipeMetadata {
  title: string
  description?: string
  imageUrl?: string | null
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}

/**
 * Toggle a recipe as favorite for the current user
 * Adds the recipe to favorites if not already favorited, removes it otherwise
 */
export async function toggleRecipeFavorite(
  recipeId: string,
  metadata?: RecipeMetadata
) {
  if (!recipeId) {
    return { error: 'Invalid recipe ID' }
  }

  const supabase = await createClient()

  // Check if user is authenticated
  const user = await getAuthUser()

  if (!user) {
    return { error: 'You must be logged in to favorite recipes' }
  }

  // Check if recipe is already favorited
  const { data: existing } = await supabase
    .from('user_recipe_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  if (existing) {
    // Remove from favorites
    const { error } = await supabase
      .from('user_recipe_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)

    if (error) {
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

    const { error } = await supabase.from('user_recipe_favorites').insert({
      user_id: user.id,
      recipe_id: recipeId,
      recipe_title: metadata.title,
      recipe_description: metadata.description || null,
      recipe_image_url: metadata.imageUrl || null,
      calories: metadata.calories || null,
      protein_grams: metadata.protein || null,
      carb_grams: metadata.carbs || null,
      fat_grams: metadata.fat || null,
    })

    if (error) {
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

  const user = await getAuthUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('user_recipe_favorites')
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
export async function isRecipeFavorite(recipeId: string): Promise<boolean> {
  if (!recipeId) {
    return false
  }

  const supabase = await createClient()

  const user = await getAuthUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('user_recipe_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  return !!data
}

/**
 * Get all favorite recipes with metadata for display
 */
export async function getFavoriteRecipes() {
  const supabase = await createClient()

  const user = await getAuthUser()

  if (!user) {
    return { data: [], error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('user_recipe_favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: 'Failed to fetch favorites' }
  }

  return {
    data: data.map((fav) => ({
      id: fav.recipe_id,
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
 * A recipe list item as consumed by the browse grid and infinite scroll.
 */
export interface LibraryRecipeListItem {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
}

/** Columns selected from the recipes table for list views. */
type LibraryRow = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  calories: number | null
  protein_grams: number | null
  carb_grams: number | null
  fat_grams: number | null
}

/**
 * Map library rows to list items, attaching images: prefer a stored
 * `image_url`, otherwise fall back to a cached Unsplash image keyed by recipe
 * id. Misses are warmed out-of-band (after the response) so they fill in on the
 * next view without ever blocking the query.
 */
async function toListItems(rows: LibraryRow[]): Promise<LibraryRecipeListItem[]> {
  const needImages = rows.filter((r) => !r.image_url)
  const imageMap = needImages.length > 0
    ? await unsplashService.getCachedImages(needImages.map((r) => r.id))
    : new Map<string, { url: string }>()

  const missing = needImages.filter((r) => !imageMap.has(r.id)).map((r) => ({ id: r.id, name: r.name }))
  if (missing.length > 0) {
    after(async () => {
      try {
        await unsplashService.getImagesForRecipes(missing)
      } catch {
        // Best-effort warm-up; failures are negative-cached by the service
      }
    })
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.name,
    description: r.description,
    imageUrl: r.image_url ?? imageMap.get(r.id)?.url ?? null,
    calories: r.calories ?? 0,
    protein: r.protein_grams ?? 0,
    carbs: r.carb_grams ?? 0,
    fat: r.fat_grams ?? 0,
  }))
}

const LIBRARY_COLUMNS = 'id, name, description, image_url, calories, protein_grams, carb_grams, fat_grams'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Browse, search and filter the self-hosted recipe library. Every filter
 * narrows the result (AND). Pass `ids` to restrict to a known set (the
 * Favorites and Popular tabs).
 */
export async function searchLibraryRecipes(
  filters: RecipeFilters,
  page: number = 1,
  limit: number = 20,
  ids?: string[]
): Promise<{
  recipes: LibraryRecipeListItem[]
  totalResults: number
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    let query = supabase.from('recipes').select(LIBRARY_COLUMNS, { count: 'exact' })

    // Legacy favorites hold non-uuid Recipe-API ids, which the uuid column rejects.
    if (ids) query = query.in('id', ids.filter((id) => UUID.test(id)))
    if (filters.q) query = query.ilike('name', `%${filters.q}%`)
    // Chained .or() calls are AND'd, so each tag narrows the list.
    for (const tag of RECIPE_TAGS) {
      if (filters.tags.includes(tag.value)) query = query.or(tag.condition)
    }
    if (filters.minProtein !== undefined) query = query.gte('protein_grams', filters.minProtein)
    if (filters.maxCalories !== undefined) query = query.lte('calories', filters.maxCalories)
    if (filters.maxCarbs !== undefined) query = query.lte('carb_grams', filters.maxCarbs)
    if (filters.maxTime !== undefined) query = query.lte('total_time_minutes', filters.maxTime)

    const sorts = {
      prep: ['batch_prep_score', false],
      protein: ['protein_grams', false],
      caloriesAsc: ['calories', true],
      caloriesDesc: ['calories', false],
      fastest: ['total_time_minutes', true],
    } as const
    const [column, ascending] = sorts[filters.sort]
    query = query.order(column, { ascending, nullsFirst: false }).order('id', { ascending: true })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return { recipes: [], totalResults: 0, error: 'Failed to search recipes' }
    }

    return {
      recipes: await toListItems((data as LibraryRow[]) || []),
      totalResults: count || 0,
      error: null,
    }
  } catch {
    return { recipes: [], totalResults: 0, error: 'Failed to search recipes' }
  }
}

/**
 * Get the most favorited recipes across all users.
 * Cached for 5 minutes — aggregate data, same for all users.
 */
export const getMostFavoritedRecipes = unstable_cache(
  async (
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
  }> => {
    try {
      const supabase = createCacheClient()
      const offset = (page - 1) * limit

      const [recipesResult, countResult] = await Promise.all([
        supabase.rpc('get_most_favorited_recipes', {
          p_limit: limit,
          p_offset: offset,
        }),
        supabase.rpc('get_most_favorited_count'),
      ])

      if (recipesResult.error) {
        return { data: [], totalCount: 0, error: 'Failed to fetch popular recipes' }
      }

      const recipes = (recipesResult.data || []).map((recipe: {
        recipe_id: string
        recipe_title: string
        recipe_description: string | null
        recipe_image_url: string | null
        calories: number | null
        protein_grams: number | null
        carb_grams: number | null
        fat_grams: number | null
        favorite_count: number
      }) => ({
        id: recipe.recipe_id,
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
    } catch {
      return { data: [], totalCount: 0, error: 'Failed to fetch popular recipes' }
    }
  },
  ['popular-recipes'],
  { revalidate: 300 } // 5 minutes
)
