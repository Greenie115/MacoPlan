'use server'

/**
 * Server Actions for Spoonacular Recipe Integration
 *
 * Handles all server-side operations for Spoonacular recipes including:
 * - Searching with dietary filtering
 * - Recipe details
 * - Favorites management
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { spoonacularService } from '@/lib/services/spoonacular'
import type {
  SpoonacularSearchParams,
  SpoonacularSearchResult,
  SpoonacularRecipe,
} from '@/lib/types/spoonacular'

// ============================================================================
// Types
// ============================================================================

interface SearchRecipesParams {
  query?: string
  cuisines?: string[]
  maxReadyTime?: number
  minProtein?: number
  maxCalories?: number
  page?: number
  number?: number // Number of results to return
  type?: string // meal type: breakfast, main course, dessert, appetizer, snack, etc.
  applyDietaryFilter?: boolean // NEW: Auto-filter based on user profile
  sort?: 'popularity' | 'healthiness' | 'price' | 'time' | 'random' | 'max-used-ingredients' | 'min-missing-ingredients'
}

interface SearchRecipesResponse {
  success: boolean
  data?: SpoonacularSearchResult
  error?: string
  dietaryFiltersApplied?: {
    diet?: string
    intolerances?: string[]
    excludedIngredients?: string[]
  }
}

// ============================================================================
// Dietary Filter Mapper
// ============================================================================

/**
 * Maps user's dietary_style to Spoonacular diet parameter
 */
function mapDietaryStyleToDiet(
  dietaryStyle?: string | null
): string | undefined {
  if (!dietaryStyle || dietaryStyle === 'none') return undefined

  const dietMap: Record<string, string> = {
    vegetarian: 'vegetarian',
    vegan: 'vegan',
    pescatarian: 'pescatarian',
    paleo: 'paleo',
    keto: 'ketogenic',
    mediterranean: 'mediterranean',
  }

  return dietMap[dietaryStyle]
}

/**
 * Parses user's allergies array into Spoonacular intolerances
 */
function parseAllergiesIntoIntolerances(
  allergies?: string[] | null
): string[] {
  if (!allergies || !Array.isArray(allergies) || allergies.length === 0) {
    return []
  }

  // Map common allergy names to Spoonacular intolerance values
  const intoleranceMap: Record<string, string> = {
    dairy: 'dairy',
    milk: 'dairy',
    egg: 'egg',
    eggs: 'egg',
    gluten: 'gluten',
    wheat: 'wheat',
    peanut: 'peanut',
    peanuts: 'peanut',
    'tree nut': 'tree nut',
    'tree nuts': 'tree nut',
    nuts: 'tree nut',
    soy: 'soy',
    seafood: 'seafood',
    fish: 'seafood',
    shellfish: 'shellfish',
    sesame: 'sesame',
    sulfite: 'sulfite',
    grain: 'grain',
  }

  return allergies
    .map((allergy) => {
      const normalized = allergy.toLowerCase().trim()
      return intoleranceMap[normalized] || normalized
    })
    .filter((value, index, self) => self.indexOf(value) === index) // Unique values
}

/**
 * Parses user's foods_to_avoid text into array of ingredients
 */
function parseFoodsToAvoid(foodsToAvoid?: string | null): string[] {
  if (!foodsToAvoid) return []

  return foodsToAvoid
    .split(',')
    .map((food) => food.trim())
    .filter((food) => food.length > 0)
}

// ============================================================================
// Search Recipes Action
// ============================================================================

export async function searchSpoonacularRecipes(
  params: SearchRecipesParams
): Promise<SearchRecipesResponse> {
  try {
    // Security: Validate query length to prevent abuse
    if (params.query && params.query.length > 200) {
      return {
        success: false,
        error: 'Search query is too long (max 200 characters)',
      }
    }

    const { page = 1, number = 20, applyDietaryFilter = true, ...searchFilters } = params
    const offset = (page - 1) * number

    // Build base search params
    let searchParams: SpoonacularSearchParams = {
      ...searchFilters,
      number,
      offset,
    }

    let dietaryFiltersApplied: SearchRecipesResponse['dietaryFiltersApplied'] =
      {}

    // Apply dietary filtering if requested
    if (applyDietaryFilter) {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('dietary_style, allergies, foods_to_avoid')
          .eq('user_id', user.id)
          .single()

        if (profile) {
          // Map dietary style to Spoonacular diet
          const diet = mapDietaryStyleToDiet(profile.dietary_style)
          if (diet) {
            searchParams.diet = diet
            dietaryFiltersApplied.diet = diet
          }

          // Parse allergies into intolerances
          const intolerances = parseAllergiesIntoIntolerances(
            profile.allergies
          )
          if (intolerances.length > 0) {
            searchParams.intolerances = intolerances
            dietaryFiltersApplied.intolerances = intolerances
          }

          // Parse foods to avoid into excludeIngredients
          const excludedIngredients = parseFoodsToAvoid(
            profile.foods_to_avoid
          )
          if (excludedIngredients.length > 0) {
            searchParams.excludeIngredients = excludedIngredients
            dietaryFiltersApplied.excludedIngredients = excludedIngredients
          }

          console.log(
            '[SearchAction] Applied dietary filters:',
            dietaryFiltersApplied
          )
        }
      }
    }

    // Call Spoonacular service
    const results = await spoonacularService.searchRecipes(searchParams)

    return {
      success: true,
      data: results,
      dietaryFiltersApplied:
        Object.keys(dietaryFiltersApplied).length > 0
          ? dietaryFiltersApplied
          : undefined,
    }
  } catch (error) {
    // Log full error server-side for debugging
    console.error('[SearchAction] Error searching recipes:', error)
    // Return generic error message to prevent information disclosure
    return {
      success: false,
      error: 'Failed to search recipes. Please try again.',
    }
  }
}

// ============================================================================
// Get Recipe Details Action
// ============================================================================

export async function getSpoonacularRecipeDetails(
  id: number
): Promise<{ success: boolean; data?: SpoonacularRecipe; error?: string }> {
  try {
    const recipe = await spoonacularService.getRecipeInformation(id)

    return {
      success: true,
      data: recipe,
    }
  } catch (error) {
    // Log full error server-side for debugging
    console.error('[GetRecipeAction] Error fetching recipe details:', error)
    // Return generic error message to prevent information disclosure
    return {
      success: false,
      error: 'Failed to fetch recipe details. Please try again.',
    }
  }
}

// ============================================================================
// Autocomplete Action
// ============================================================================

export async function autocompleteRecipes(
  query: string
): Promise<{
  success: boolean
  data?: Array<{ id: number; title: string; imageType: string }>
  error?: string
}> {
  try {
    // Security: Validate query length
    if (query.length > 200) {
      return { success: false, error: 'Query too long (max 200 characters)' }
    }

    if (query.length < 3) {
      return { success: true, data: [] }
    }

    const results = await spoonacularService.autocomplete(query, 10)

    return {
      success: true,
      data: results,
    }
  } catch (error) {
    console.error('[AutocompleteAction] Error:', error)
    // Graceful degradation - return empty array
    return {
      success: true,
      data: [],
    }
  }
}

// ============================================================================
// Toggle Favorite Action
// ============================================================================

export async function toggleSpoonacularFavorite(
  spoonacularId: number
): Promise<{ success: boolean; isFavorited?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorite_recipes')
      .select('id')
      .eq('user_id', user.id)
      .eq('spoonacular_id', spoonacularId)
      .eq('recipe_source', 'spoonacular')
      .single()

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from('user_favorite_recipes')
        .delete()
        .eq('id', existing.id)

      if (error) throw error

      revalidatePath('/recipes')
      return { success: true, isFavorited: false }
    } else {
      // Add favorite
      const { error } = await supabase
        .from('user_favorite_recipes')
        .insert({
          user_id: user.id,
          spoonacular_id: spoonacularId,
          recipe_source: 'spoonacular',
          recipe_id: null, // No local recipe ID
        })

      if (error) throw error

      revalidatePath('/recipes')
      return { success: true, isFavorited: true }
    }
  } catch (error) {
    console.error('[ToggleFavoriteAction] Error:', error)
    return {
      success: false,
      error: 'Failed to update favorite status. Please try again.',
    }
  }
}

// ============================================================================
// Get User's Favorited Spoonacular Recipe IDs
// ============================================================================

export async function getUserFavoriteSpoonacularIds(): Promise<{
  success: boolean
  data?: number[]
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

    const { data, error } = await supabase
      .from('user_favorite_recipes')
      .select('spoonacular_id')
      .eq('user_id', user.id)
      .eq('recipe_source', 'spoonacular')
      .not('spoonacular_id', 'is', null)

    if (error) throw error

    const ids = data?.map((d) => d.spoonacular_id).filter(Boolean) as number[]

    return {
      success: true,
      data: ids || [],
    }
  } catch (error) {
    console.error('[GetFavoritesAction] Error:', error)
    return {
      success: false,
      error: 'Failed to fetch favorites',
    }
  }
}
