'use server'

import { createClient } from '@/lib/supabase/server'

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
    console.error('Error fetching favorite recipes:', error)
    return { error: 'Failed to fetch favorite recipes', data: [] }
  }

  // Flatten the structure
  const recipes = data
    .filter((fav) => fav.recipes) // Filter out any null recipes
    .map((fav: any) => fav.recipes)

  return { success: true, data: recipes }
}
