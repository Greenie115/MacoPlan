'use client'

import { UtensilsCrossed } from 'lucide-react'
import { RecipeCard, type RecipeCardData } from './recipe-card'

type GridRecipe = RecipeCardData & { source?: 'local' | 'recipe-api' }

interface RecipeGridProps {
  recipes: GridRecipe[]
  favoriteIds: (string | number)[]
  /** Heading for the empty state — defaults to a generic message. */
  emptyMessage?: string
}

export function RecipeGrid({ recipes, favoriteIds, emptyMessage = 'No recipes found' }: RecipeGridProps) {
  // Filter out recipes with missing IDs to avoid /recipes/undefined links
  const validRecipes = recipes.filter((recipe) => {
    const id = recipe?.id
    return id !== undefined && id !== null && id !== '' && id !== 'undefined'
  })

  if (validRecipes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <UtensilsCrossed className="size-6 text-icon" strokeWidth={1.5} />
        </div>
        <p className="text-foreground text-base font-semibold">{emptyMessage}</p>
        <p className="text-muted-foreground text-sm max-w-xs">
          Try a broader search, or clear a filter to see more recipes.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-6 pb-28">
      {/* auto-fit reflow, min width clamped to 45vw so mobile still gets 2 columns
          instead of one oversized card per row */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,45vw),1fr))] gap-4 md:gap-5 lg:gap-6">
        {validRecipes.map((recipe) => {
          const source = recipe.source || 'local'
          const recipeId = recipe.id

          return (
            <RecipeCard
              key={`${source}-${recipeId}`}
              recipe={recipe}
              isFavorite={favoriteIds.includes(recipeId)}
              source={source}
            />
          )
        })}
      </div>
    </div>
  )
}
