'use server'

/**
 * Recipe Tracking Actions
 *
 * Tracks user interactions with recipes for Netflix-style recommendations
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Track recipe view - called when user clicks into recipe detail page
 * Extracts keywords from recipe title and increments counts for recommendation algorithm
 */
export async function trackRecipeView(
  recipeId: number | string,
  recipeTitle: string,
  source: 'fatsecret'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Only track for authenticated users
    if (!user) {
      return { success: true } // Silently succeed for anonymous users
    }

    // Call Supabase function to extract and track keywords
    const { error } = await supabase.rpc('track_recipe_keywords', {
      p_user_id: user.id,
      p_recipe_title: recipeTitle,
    })

    if (error) {
      console.error('[TrackRecipeView] Error tracking keywords:', error)
      // Don't fail the page load if tracking fails
      return { success: true }
    }

    return { success: true }
  } catch (error) {
    console.error('[TrackRecipeView] Unexpected error:', error)
    // Don't fail the page load if tracking fails
    return { success: true }
  }
}

/**
 * Get user's top recipe keywords for recommendations
 * Returns keywords with 3+ views, sorted by frequency
 */
export async function getUserTopKeywords(
  limit: number = 3,
  minCount: number = 3
): Promise<{
  success: boolean
  data?: Array<{ keyword: string; search_count: number }>
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: true, data: [] }
    }

    const { data, error } = await supabase.rpc('get_top_recipe_keywords', {
      p_user_id: user.id,
      p_limit: limit,
      p_min_count: minCount,
    })

    if (error) {
      console.error('[GetTopKeywords] Error:', error)
      return { success: false, error: 'Failed to fetch keywords' }
    }

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error('[GetTopKeywords] Unexpected error:', error)
    return {
      success: false,
      error: 'Failed to fetch keywords',
    }
  }
}
