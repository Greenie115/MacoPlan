/**
 * Custom Hook for Recipe Search Caching
 *
 * Manages session storage cache for recipe search results with scroll position restoration.
 * Provides a React-friendly API for the session cache utilities.
 */

'use client'

import { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  getSearchResults,
  saveSearchResults,
  cleanupExpiredEntries,
  type CachedRecipe,
} from '@/lib/cache/session-cache'

interface UseRecipeCacheOptions {
  initialRecipes: CachedRecipe[]
  totalResults: number
  enableScrollRestoration?: boolean
}

interface UseRecipeCacheReturn {
  recipes: CachedRecipe[]
  totalResults: number
  isFromCache: boolean
  saveToCache: (scrollPosition?: number) => void
}

/**
 * Hook to manage recipe search caching with scroll restoration
 *
 * Usage:
 * ```tsx
 * const { recipes, isFromCache, saveToCache } = useRecipeCache({
 *   initialRecipes: serverRecipes,
 *   totalResults: serverTotal
 * })
 *
 * // Save before navigation
 * <Link onClick={() => saveToCache(window.scrollY)}>
 * ```
 */
export function useRecipeCache({
  initialRecipes,
  totalResults,
  enableScrollRestoration = true,
}: UseRecipeCacheOptions): UseRecipeCacheReturn {
  const searchParams = useSearchParams()
  const [recipes, setRecipes] = useState<CachedRecipe[]>(initialRecipes)
  const [total, setTotal] = useState(totalResults)
  const [isFromCache, setIsFromCache] = useState(false)
  const hasRestoredScroll = useRef(false)

  // Check session cache on mount
  useEffect(() => {
    // Clean up expired entries first
    cleanupExpiredEntries()

    const cached = getSearchResults(searchParams)

    if (cached) {
      setRecipes(cached.recipes)
      setTotal(cached.totalResults)
      setIsFromCache(true)

      // Restore scroll position (use useLayoutEffect separately)
      if (enableScrollRestoration && cached.scrollPosition > 0 && !hasRestoredScroll.current) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, cached.scrollPosition)
          hasRestoredScroll.current = true
          console.log('[RecipeCache] Restored scroll position:', cached.scrollPosition)
        })
      }
    } else {
      // Use server data
      setRecipes(initialRecipes)
      setTotal(totalResults)
      setIsFromCache(false)
    }
  }, [searchParams, initialRecipes, totalResults, enableScrollRestoration])

  // Function to save current state to cache
  const saveToCache = (scrollPosition?: number) => {
    const scroll = scrollPosition ?? (typeof window !== 'undefined' ? window.scrollY : 0)
    saveSearchResults(searchParams, recipes, total, scroll)
  }

  // Auto-save to cache before unmount
  useEffect(() => {
    return () => {
      if (recipes.length > 0) {
        const scrollPos = typeof window !== 'undefined' ? window.scrollY : 0
        saveSearchResults(searchParams, recipes, total, scrollPos)
      }
    }
  }, [searchParams, recipes, total])

  return {
    recipes,
    totalResults: total,
    isFromCache,
    saveToCache,
  }
}

/**
 * Simpler hook for just checking if cache exists
 */
export function useHasCachedResults(): boolean {
  const searchParams = useSearchParams()
  const [hasCached, setHasCached] = useState(false)

  useEffect(() => {
    const cached = getSearchResults(searchParams)
    setHasCached(cached !== null)
  }, [searchParams])

  return hasCached
}
