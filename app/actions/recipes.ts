'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import { revalidatePath, unstable_cache } from 'next/cache'
import { after } from 'next/server'
import { getUserSubscriptionTier } from '@/lib/utils/subscription'
import { FREE_FAVORITES_LIMIT } from '@/lib/constants/subscription'
import { checkFavoritesQuota } from '@/app/actions/subscription'
import { createCacheClient } from '@/lib/supabase/cache-client'
import { unsplashService } from '@/lib/services/unsplash'
import type { ValidatedFilters } from '@/lib/utils/filter-validation'

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

/**
 * Browse the self-hosted recipe library (no search/filters). Quality-first,
 * stable order (batch_prep_score desc, id) so pagination and infinite scroll
 * stay consistent across requests. Replaces the old Recipe-API.com cache path.
 */
export async function getCachedRecipes(
  page: number = 1,
  limit: number = 20
): Promise<{
  data: LibraryRecipeListItem[]
  totalCount: number
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    const { data, count, error } = await supabase
      .from('recipes')
      .select(LIBRARY_COLUMNS, { count: 'exact' })
      .order('batch_prep_score', { ascending: false, nullsFirst: false })
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      return { data: [], totalCount: 0, error: 'Failed to fetch recipes' }
    }

    return {
      data: await toListItems((data as LibraryRow[]) || []),
      totalCount: count || 0,
      error: null,
    }
  } catch {
    return { data: [], totalCount: 0, error: 'Failed to fetch recipes' }
  }
}

/**
 * Curated recipe "type" filters. Each maps to a single PostgREST or-filter
 * condition on the recipes row, so filtering and counting need no joins.
 * Ordered by usefulness for lifters (macros/prep first, then diets, then
 * cuisines). Cuisine is deliberately NOT a catch-all list: ~64% of the library
 * is "american", which is what made the old cuisine-only dropdown useless.
 */
const RECIPE_TYPE_FILTERS: ReadonlyArray<{ value: string; label: string; condition: string }> = [
  { value: 'high-protein', label: 'High Protein', condition: 'protein_grams.gte.30' },
  { value: 'low-carb', label: 'Low Carb', condition: 'carb_grams.lte.20' },
  { value: 'meal-prep', label: 'Meal-Prep Friendly', condition: 'batch_prep_score.gte.4' },
  { value: 'vegetarian', label: 'Vegetarian', condition: 'dietary_flags.cs.{vegetarian}' },
  { value: 'vegan', label: 'Vegan', condition: 'dietary_flags.cs.{vegan}' },
  { value: 'keto', label: 'Keto', condition: 'dietary_flags.cs.{keto}' },
  { value: 'paleo', label: 'Paleo', condition: 'dietary_flags.cs.{paleo}' },
  { value: 'gluten-free', label: 'Gluten-Free', condition: 'dietary_flags.cs.{gluten-free}' },
  { value: 'dairy-free', label: 'Dairy-Free', condition: 'dietary_flags.cs.{dairy-free}' },
  { value: 'italian', label: 'Italian', condition: 'cuisine.eq.italian' },
  { value: 'mexican', label: 'Mexican', condition: 'cuisine.eq.mexican' },
  { value: 'asian', label: 'Asian', condition: 'cuisine.eq.asian' },
  { value: 'mediterranean', label: 'Mediterranean', condition: 'cuisine.eq.mediterranean' },
  { value: 'indian', label: 'Indian', condition: 'cuisine.eq.indian' },
]

/**
 * Search and filter the self-hosted recipe library. Replaces the Recipe-API.com
 * search path: text match on name, macro/calorie ranges, recipe "type"
 * ("category"), and sort all run as SQL against the recipes table.
 */
export async function searchLibraryRecipes(
  filters: ValidatedFilters,
  page: number = 1,
  limit: number = 20
): Promise<{
  recipes: LibraryRecipeListItem[]
  totalResults: number
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    let query = supabase.from('recipes').select(LIBRARY_COLUMNS, { count: 'exact' })

    if (filters.q) query = query.ilike('name', `%${filters.q}%`)
    // "category" holds selected recipe-type values; each maps to a row-level
    // condition. Multiple selections are OR'd (union), matching how a user
    // expects "show me High Protein OR Vegan" to behave.
    if (filters.category) {
      const conditions = filters.category
        .split(',')
        .map((v) => RECIPE_TYPE_FILTERS.find((f) => f.value === v)?.condition)
        .filter((c): c is string => Boolean(c))
      if (conditions.length) query = query.or(conditions.join(','))
    }
    if (filters.min_calories !== undefined) query = query.gte('calories', filters.min_calories)
    if (filters.max_calories !== undefined) query = query.lte('calories', filters.max_calories)
    if (filters.min_protein !== undefined) query = query.gte('protein_grams', filters.min_protein)
    if (filters.max_protein !== undefined) query = query.lte('protein_grams', filters.max_protein)
    if (filters.min_carbs !== undefined) query = query.gte('carb_grams', filters.min_carbs)
    if (filters.max_carbs !== undefined) query = query.lte('carb_grams', filters.max_carbs)
    if (filters.min_fat !== undefined) query = query.gte('fat_grams', filters.min_fat)
    if (filters.max_fat !== undefined) query = query.lte('fat_grams', filters.max_fat)

    switch (filters.sort_by) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'caloriesPerServingAscending':
        query = query.order('calories', { ascending: true })
        break
      case 'caloriesPerServingDescending':
        query = query.order('calories', { ascending: false })
        break
      default:
        // Relevance: best batch-prep recipes first, stable via id.
        query = query.order('batch_prep_score', { ascending: false, nullsFirst: false })
    }
    query = query.order('id', { ascending: true })

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
 * Lightweight title autocomplete for the search bar — name match only, no
 * images or macros. Replaces the Recipe-API.com autocomplete call.
 */
export async function getRecipeAutocomplete(
  query: string
): Promise<Array<{ id: string; title: string }>> {
  const q = query.trim()
  if (q.length < 3) return []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name')
      .ilike('name', `%${q}%`)
      .order('batch_prep_score', { ascending: false, nullsFirst: false })
      .limit(5)

    if (error || !data) return []
    return data.map((r) => ({ id: r.id as string, title: r.name as string }))
  } catch {
    return []
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

/**
 * Recipe "type" filter options: the curated RECIPE_TYPE_FILTERS with a live
 * count per type (so users see how much is behind each). Types with zero
 * matches are dropped. Cached for an hour since the library changes slowly.
 */
export const getRecipeTypeFilters = unstable_cache(
  async (): Promise<{
    success: boolean
    data?: Array<{ value: string; label: string }>
    error?: string
  }> => {
    try {
      const supabase = createCacheClient()

      const counts = await Promise.all(
        RECIPE_TYPE_FILTERS.map(async (f) => {
          const { count } = await supabase
            .from('recipes')
            .select('id', { count: 'exact', head: true })
            .or(f.condition)
          return count ?? 0
        })
      )

      const data = RECIPE_TYPE_FILTERS.map((f, i) => ({ ...f, count: counts[i] }))
        .filter((f) => f.count > 0)
        .map((f) => ({ value: f.value, label: `${f.label} (${f.count})` }))

      return { success: true, data }
    } catch {
      return { success: false, error: 'Failed to fetch recipe types' }
    }
  },
  ['library-type-filters'],
  { revalidate: 3600 } // 1 hour
)
