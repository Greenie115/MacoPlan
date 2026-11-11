'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { searchLibraryRecipes, type LibraryRecipeListItem } from '@/app/actions/recipes'
import type { RecipeFilters } from '@/lib/utils/filter-validation'
import { RecipeGrid } from './recipe-grid'

const PER_PAGE = 20

interface RecipeInfiniteScrollProps {
  filters: RecipeFilters
  initialRecipes: LibraryRecipeListItem[]
  totalCount: number
  favoriteIds: string[]
}

/** The library grid: loads the next page of the same filtered query on scroll. */
export function RecipeInfiniteScroll({ filters, initialRecipes, totalCount, favoriteIds }: RecipeInfiniteScrollProps) {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(initialRecipes.length >= totalCount)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || done) return
    setLoading(true)
    try {
      const result = await searchLibraryRecipes(filters, page + 1, PER_PAGE)
      if (result.recipes.length === 0) {
        setDone(true)
      } else {
        setRecipes((prev) => {
          const seen = new Set(prev.map((r) => r.id))
          return [...prev, ...result.recipes.filter((r) => !seen.has(r.id))]
        })
        setPage(page + 1)
        setDone((page + 1) * PER_PAGE >= result.totalResults)
      }
    } catch {
      // Leave the sentinel in place: scrolling again retries.
    } finally {
      setLoading(false)
    }
  }, [loading, done, page, filters])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || done) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore(), {
      rootMargin: '300px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, done])

  return (
    <div>
      <p className="mx-auto max-w-7xl px-4 pt-5 font-mono text-xs tabular-nums text-muted-foreground" aria-live="polite">
        {totalCount.toLocaleString()} {totalCount === 1 ? 'recipe' : 'recipes'}
      </p>
      <RecipeGrid
        recipes={recipes}
        favoriteIds={favoriteIds}
        emptyMessage="No recipes match all of these"
        emptyHint="Loosen a limit or remove a tag. Every filter you add narrows the list."
      />
      {loading && <div className="skeleton mx-auto mb-8 h-1 w-24" aria-label="Loading more recipes" />}
      {!done && !loading && <div ref={sentinelRef} className="h-2" />}
    </div>
  )
}
