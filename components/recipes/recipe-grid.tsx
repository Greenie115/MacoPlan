'use client'

import { Recipe } from '@/lib/types/recipe'
import { RecipeCard } from './recipe-card'

interface RecipeGridProps {
  recipes: (Recipe | any)[] // Allow both local Recipe and Spoonacular recipes
  favoriteIds: (string | number)[]
}

export function RecipeGrid({ recipes, favoriteIds }: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-muted-foreground text-lg">No recipes found</p>
        <p className="text-muted-foreground/70 text-sm mt-2">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-28">
      {/* Responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop, 5 cols large */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
        {recipes.map((recipe) => {
          const source = (recipe as any).source || 'local'
          const recipeId = source === 'spoonacular' ? recipe.id : recipe.id

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
