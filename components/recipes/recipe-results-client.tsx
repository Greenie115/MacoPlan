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
  source?: 'local' | 'recipe-api'
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

  return (
    <RecipeGrid
      recipes={recipes}
      favoriteIds={favoriteIds}
      emptyMessage={searchQuery ? `No recipes found for "${searchQuery}"` : 'No recipes found'}
    />
  )
}
