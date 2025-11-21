import { createClient } from '@/lib/supabase/server'
import { TopAppBar } from '@/components/layout/top-app-bar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { RecipeSearch } from '@/components/recipes/recipe-search'
import { RecipeFilters } from '@/components/recipes/recipe-filters'
import { UpgradeBanner } from '@/components/recipes/upgrade-banner'
import { RecipeGrid } from '@/components/recipes/recipe-grid'
import { Recipe } from '@/lib/types/recipe'
import { getFavoriteRecipeIds } from './actions'

// Pagination configuration
const RECIPES_PER_PAGE = 20

interface RecipesPageProps {
  searchParams: Promise<{
    search?: string
    filters?: string
    page?: string
  }>
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams
  const searchQuery = params.search?.trim() || ''
  const filterTags = params.filters?.split(',').filter(Boolean) || []
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))

  const supabase = await createClient()

  // Calculate pagination range
  const from = (currentPage - 1) * RECIPES_PER_PAGE
  const to = from + RECIPES_PER_PAGE - 1

  // Build the query with filtering
  let query = supabase
    .from('recipes')
    .select(
      `
      *,
      recipe_tags(tag)
    `,
      { count: 'exact' }
    )

  // Apply text search filter on name and description
  // Escape special SQL LIKE characters (%, _) to prevent SQL injection
  if (searchQuery) {
    const sanitizedQuery = searchQuery.replace(/[%_]/g, '\\$&')
    query = query.or(
      `name.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%`
    )
  }

  // Apply tag filters
  // Note: For single tag, we use database filtering (efficient)
  // For multiple tags with AND logic, we fetch broadly and filter in-app
  // TODO: Optimize with PostgreSQL RPC function for large datasets:
  //   CREATE FUNCTION get_recipes_with_all_tags(tag_array text[])
  //   This is acceptable for current dataset size (<100 recipes)
  if (filterTags.length > 0) {
    query = query.in('recipe_tags.tag', filterTags)
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data: recipes, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`)
  }

  // If multiple tag filters, ensure recipes have ALL selected tags (AND logic)
  // This is done post-query for simplicity; optimal solution requires DB-level aggregation
  let filteredRecipes = recipes || []
  if (filterTags.length > 1 && filteredRecipes.length > 0) {
    filteredRecipes = filteredRecipes.filter((recipe: any) => {
      const recipeTags = recipe.recipe_tags?.map((t: any) => t.tag) || []
      return filterTags.every((tag) => recipeTags.includes(tag))
    })
  }

  // Remove duplicate recipes (due to JOIN with recipe_tags)
  const uniqueRecipes = Array.from(
    new Map(filteredRecipes.map((r: any) => [r.id, r])).values()
  )

  // Get user's favorite recipe IDs
  const favoriteIds = await getFavoriteRecipeIds()

  // Calculate pagination info
  const totalRecipes = count || 0
  const totalPages = Math.ceil(totalRecipes / RECIPES_PER_PAGE)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top App Bar */}
      <TopAppBar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Recipe Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse and save your favorite recipes
            {totalRecipes > 0 && ` (${totalRecipes} total)`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto">
        <RecipeSearch />
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto">
        <RecipeFilters />
      </div>

      {/* Upgrade Banner */}
      <div className="max-w-7xl mx-auto px-4">
        <UpgradeBanner />
      </div>

      {/* Recipe Grid */}
      <RecipeGrid recipes={uniqueRecipes} favoriteIds={favoriteIds} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <a
              href={
                hasPrevPage
                  ? `/recipes?${new URLSearchParams({
                      ...(searchQuery && { search: searchQuery }),
                      ...(filterTags.length > 0 && {
                        filters: filterTags.join(','),
                      }),
                      page: (currentPage - 1).toString(),
                    }).toString()}`
                  : '#'
              }
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                hasPrevPage
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              Previous
            </a>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <a
              href={
                hasNextPage
                  ? `/recipes?${new URLSearchParams({
                      ...(searchQuery && { search: searchQuery }),
                      ...(filterTags.length > 0 && {
                        filters: filterTags.join(','),
                      }),
                      page: (currentPage + 1).toString(),
                    }).toString()}`
                  : '#'
              }
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                hasNextPage
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              Next
            </a>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab="recipes" />
    </div>
  )
}
