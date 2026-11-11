import { UtensilsCrossed } from 'lucide-react'
import { RecipeCard, type RecipeCardData } from './recipe-card'

interface RecipeGridProps {
  recipes: RecipeCardData[]
  favoriteIds: string[]
  emptyMessage?: string
  emptyHint?: string
}

export function RecipeGrid({
  recipes,
  favoriteIds,
  emptyMessage = 'No recipes found',
  emptyHint = 'Try a broader search, or clear a filter to see more recipes.',
}: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <UtensilsCrossed className="size-6 text-icon" strokeWidth={1.5} />
        </div>
        <p className="text-base font-semibold text-foreground">{emptyMessage}</p>
        <p className="max-w-xs text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4">
      {/* min width clamped to 45vw so phones still get 2 columns */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(220px,42vw),1fr))] gap-3 md:gap-5">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} isFavorite={favoriteIds.includes(recipe.id)} />
        ))}
      </div>
    </div>
  )
}
