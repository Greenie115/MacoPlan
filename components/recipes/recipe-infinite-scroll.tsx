'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { RecipeGrid } from './recipe-grid'
import { getCachedRecipes } from '@/app/actions/recipes'
import { getSearchResults, saveSearchResults } from '@/lib/cache/session-cache'

const PER_PAGE = 20

interface RecipeItem {
  id: string
  title: string
  name: string
  imageUrl?: string
  image_url?: string
  calories: number
  protein: number
  protein_grams: number
  carbs: number
  carb_grams: number
  fat: number
  fat_grams: number
  source: 'recipe-api'
}

interface RecipeInfiniteScrollProps {
  initialRecipes: RecipeItem[]
  totalCount: number
  favoriteIds: string[]
}

function toGridItem(r: {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
}): RecipeItem {
  return {
    id: r.id,
    title: r.title,
    name: r.title,
    imageUrl: r.imageUrl ?? undefined,
    image_url: r.imageUrl ?? undefined,
    calories: r.calories,
    protein: r.protein,
    protein_grams: r.protein,
    carbs: r.carbs,
    carb_grams: r.carbs,
    fat: r.fat,
    fat_grams: r.fat,
    source: 'recipe-api',
  }
}

export function RecipeInfiniteScroll({
  initialRecipes,
  totalCount,
  favoriteIds,
}: RecipeInfiniteScrollProps) {
  const searchParams = useSearchParams()
  const [recipes, setRecipes] = useState<RecipeItem[]>(initialRecipes)
  const [total, setTotal] = useState(totalCount)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialRecipes.length < totalCount)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const restoredRef = useRef(false)

  // Restore accumulated recipes from session cache (back-nav)
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true

    const cached = getSearchResults(searchParams)
    if (cached && cached.recipes.length > initialRecipes.length) {
      setRecipes(cached.recipes as RecipeItem[])
      setTotal(cached.totalResults)
      setPage(Math.ceil(cached.recipes.length / PER_PAGE))
      setHasMore(cached.recipes.length < cached.totalResults)

      if (cached.scrollPosition > 0) {
        requestAnimationFrame(() => window.scrollTo(0, cached.scrollPosition))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save accumulated recipes to session cache on unmount
  useEffect(() => {
    return () => {
      if (recipes.length > 0) {
        const scroll = typeof window !== 'undefined' ? window.scrollY : 0
        saveSearchResults(searchParams, recipes, total, scroll)
      }
    }
  }, [recipes, total, searchParams])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    const nextPage = page + 1
    try {
      const result = await getCachedRecipes(nextPage, PER_PAGE)

      if (!result.data || result.data.length === 0) {
        setHasMore(false)
      } else {
        setRecipes((prev) => {
          const seen = new Set(prev.map((r) => r.id))
          const fresh = result.data.filter((r) => !seen.has(r.id)).map(toGridItem)
          return [...prev, ...fresh]
        })
        setPage(nextPage)
        setTotal(result.totalCount)
        setHasMore(nextPage * PER_PAGE < result.totalCount)
      }
    } catch {
      // fail silently — user can scroll again to retry
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page])

  // Trigger loadMore when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, hasMore])

  return (
    <div>
      <RecipeGrid recipes={recipes} favoriteIds={favoriteIds} />

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Sentinel — sits below the grid, triggers next page */}
      {hasMore && !loading && <div ref={sentinelRef} className="h-2" />}

      {!hasMore && recipes.length > 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm tabular-nums">
          All {recipes.length} recipes loaded
        </p>
      )}
    </div>
  )
}
