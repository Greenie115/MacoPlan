import { RecipeGrid } from '@/components/recipes/recipe-grid'
import { RecipeInfiniteScroll } from '@/components/recipes/recipe-infinite-scroll'
import {
  getFavoriteRecipeIds,
  getFavoriteRecipes,
  getMostFavoritedRecipes,
  searchLibraryRecipes,
} from '@/app/actions/recipes'
import { hasActiveFilters, parseRecipeFilters, type RecipeFilterParams } from '@/lib/utils/filter-validation'

const PAGE_SIZE = 20

/**
 * Results for the current tab + filters. Lives inside a keyed <Suspense> so a
 * change only swaps this subtree while the filter bar above stays mounted.
 *
 * - All recipes: the library, filtered and sorted in SQL, infinite scroll.
 * - Favorites / Popular: that set of recipes; when anything is filtered the
 *   same library query runs restricted to those ids, so filters behave
 *   identically on every tab.
 */
export async function RecipeResults({ params }: { params: RecipeFilterParams }) {
  const filters = parseRecipeFilters(params)
  const tab = params.tab ?? 'all'
  const favoriteIds = await getFavoriteRecipeIds()

  if (tab !== 'favorites' && tab !== 'popular') {
    const { recipes, totalResults, error } = await searchLibraryRecipes(filters, 1, PAGE_SIZE)
    if (error) return <ResultsError />
    return (
      <RecipeInfiniteScroll
        filters={filters}
        initialRecipes={recipes}
        totalCount={totalResults}
        favoriteIds={favoriteIds}
      />
    )
  }

  const base = tab === 'favorites' ? await getFavoriteRecipes() : await getMostFavoritedRecipes(1, PAGE_SIZE)
  if (base.error) return <ResultsError />

  let recipes: Array<{ id: string; title: string }> = base.data
  if (hasActiveFilters(filters) || filters.sort !== 'prep') {
    const narrowed = await searchLibraryRecipes(filters, 1, 100, base.data.map((r) => r.id))
    if (narrowed.error) return <ResultsError />
    recipes = narrowed.recipes
  }

  return (
    <RecipeGrid
      recipes={recipes}
      favoriteIds={favoriteIds}
      emptyMessage={
        hasActiveFilters(filters)
          ? 'No recipes match all of these'
          : tab === 'favorites'
            ? 'No favorites yet'
            : 'Nothing popular yet'
      }
      emptyHint={
        hasActiveFilters(filters)
          ? 'Loosen a limit or remove a tag. Every filter you add narrows the list.'
          : 'Tap the heart on any recipe to save it here.'
      }
    />
  )
}

function ResultsError() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        We couldn&apos;t load recipes. Refresh the page to try again.
      </p>
    </div>
  )
}
