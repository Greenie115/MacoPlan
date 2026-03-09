'use server'

import { createClient } from '@/lib/supabase/server'

interface FavoriteWithRecipe {
  recipe_id: string
  recipes: {
    id: string
    name: string
    calories: number
    protein_grams: number
    carb_grams: number
    fat_grams: number
    image_url: string | null
  } | null
}

/**
 * Get favorite recipes for quick logging on dashboard
 */
export async function getFavoriteRecipesForDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required', data: [] }
  }

  // Get user's favorites with recipe details
  const { data, error } = await supabase
    .from('user_favorite_recipes')
    .select(`
      recipe_id,
      recipes (
        id,
        name,
        calories,
        protein_grams,
        carb_grams,
        fat_grams,
        image_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return { error: 'Failed to fetch favorite recipes', data: [] }
  }

  // Flatten the structure
  const recipes = data
    .filter((fav: { recipes: unknown }) => fav.recipes)
    .map((fav: { recipes: unknown }) => fav.recipes)

  return { success: true, data: recipes }
}
