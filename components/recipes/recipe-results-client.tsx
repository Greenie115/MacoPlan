/**
 * Client Wrapper for Recipe Search Results
 *
 * This component wraps the recipe grid with session cache functionality.
 * It checks session storage on mount and either:
 * 1. Shows cached results instantly (no loading state)
 * 2. Shows server-rendered results and caches them
 *
 * Benefits:
 * - Instant back navigation (no API call)
 * - Preserved scroll position
 * - Preserved filter state
 * - Progressive enhancement (falls back to server data)
 */

'use client'

import { useRecipeCache } from '@/lib/hooks/use-recipe-cache'
import { RecipeGrid } from './recipe-grid'

interface RecipeData {
  id: string | number
  title?: string
  name?: string
  imageUrl?: string
  image_url?: string
  calories?: number
  protein?: number
  protein_grams?: number
  carbs?: number
  carb_grams?: number
  fat?: number
  fat_grams?: number
  source?: 'local' | 'fatsecret'
}

interface RecipeResultsClientProps {
  initialRecipes: RecipeData[]
  totalResults: number
  favoriteIds: number[] | string[]
  searchQuery?: string
  isAdaptiveRecommendation?: boolean
}

export function RecipeResultsClient({
  initialRecipes,
  totalResults,
  favoriteIds,
  searchQuery,
  isAdaptiveRecommendation = false,
}: RecipeResultsClientProps) {
  // Use the cache hook to manage state
  const { recipes, totalResults: total, isFromCache } = useRecipeCache({
    initialRecipes,
    totalResults,
    enableScrollRestoration: true,
  })

  // Show cache indicator in development
  if (process.env.NODE_ENV === 'development' && isFromCache) {
    console.log(
      `[RecipeResults] Showing ${recipes.length} cached recipes (scroll position restored)`
    )
  }

  return (
    <>
      {/* Cache indicator for development */}
      {process.env.NODE_ENV === 'development' && isFromCache && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800">
            ⚡ Showing cached results (no API call) - {recipes.length} recipes
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      <RecipeGrid recipes={recipes} favoriteIds={favoriteIds} />

      {/* Results summary */}
      {recipes.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery
              ? `No recipes found for "${searchQuery}". Try different filters or search terms.`
              : 'No recipes found. Try adjusting your filters.'}
          </p>
        </div>
      )}
    </>
  )
}
