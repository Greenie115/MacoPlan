/**
 * Session Storage Cache for Recipe Search Results
 *
 * Provides client-side caching that survives page remounts but clears on tab close.
 * Perfect for back navigation scenarios where users browse recipes and return to search.
 *
 * Features:
 * - 30-minute TTL (auto-expires stale entries)
 * - Max 20 entries (LRU eviction)
 * - Scroll position preservation
 * - SSR-safe (checks for window)
 * - TypeScript typed
 *
 * Use Cases:
 * - User searches "Italian pasta" → Clicks recipe → Back button (instant!)
 * - User applies filters → Clicks recipe → Back button (filters preserved!)
 */

import type { SpoonacularRecipe } from '@/lib/types/spoonacular'

const CACHE_PREFIX = 'recipe_search_'
const MAX_ENTRIES = 20
const DEFAULT_TTL = 30 * 60 * 1000 // 30 minutes

interface CachedSearchResults {
  recipes: SpoonacularRecipe[]
  totalResults: number
  scrollPosition: number
  timestamp: number
  searchParams: string // Stringified URLSearchParams
  ttl: number
}

/**
 * Generates a cache key from URL search parameters
 */
function generateCacheKey(searchParams: URLSearchParams | string): string {
  const params = typeof searchParams === 'string'
    ? searchParams
    : searchParams.toString()

  return `${CACHE_PREFIX}${params}`
}

/**
 * Checks if session storage is available (SSR-safe)
 */
function isSessionStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const test = '__session_storage_test__'
    sessionStorage.setItem(test, test)
    sessionStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Gets all cache keys from session storage
 */
function getAllCacheKeys(): string[] {
  if (!isSessionStorageAvailable()) return []

  const keys: string[] = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key && key.startsWith(CACHE_PREFIX)) {
      keys.push(key)
    }
  }
  return keys
}

/**
 * Removes expired entries from session storage
 */
export function cleanupExpiredEntries(): void {
  if (!isSessionStorageAvailable()) return

  const now = Date.now()
  const keys = getAllCacheKeys()

  let removed = 0
  for (const key of keys) {
    try {
      const data = sessionStorage.getItem(key)
      if (!data) continue

      const cached: CachedSearchResults = JSON.parse(data)
      const age = now - cached.timestamp

      if (age > cached.ttl) {
        sessionStorage.removeItem(key)
        removed++
      }
    } catch (e) {
      // Invalid JSON, remove it
      sessionStorage.removeItem(key)
      removed++
    }
  }

  if (removed > 0) {
    console.log(`[SessionCache] Cleaned up ${removed} expired entries`)
  }
}

/**
 * Enforces max entry limit using LRU eviction
 */
function enforceMaxEntries(): void {
  if (!isSessionStorageAvailable()) return

  const keys = getAllCacheKeys()

  if (keys.length <= MAX_ENTRIES) return

  // Sort by timestamp (oldest first)
  const entries = keys
    .map((key) => {
      try {
        const data = sessionStorage.getItem(key)
        if (!data) return null
        const cached: CachedSearchResults = JSON.parse(data)
        return { key, timestamp: cached.timestamp }
      } catch (e) {
        return null
      }
    })
    .filter((entry): entry is { key: string; timestamp: number } => entry !== null)
    .sort((a, b) => a.timestamp - b.timestamp)

  // Remove oldest entries
  const toRemove = entries.length - MAX_ENTRIES
  for (let i = 0; i < toRemove; i++) {
    sessionStorage.removeItem(entries[i].key)
  }

  console.log(`[SessionCache] Evicted ${toRemove} oldest entries (LRU)`)
}

/**
 * Saves search results to session storage
 *
 * @param searchParams - URL search parameters
 * @param recipes - Recipe results to cache
 * @param totalResults - Total number of results
 * @param scrollPosition - Current scroll position (optional)
 */
export function saveSearchResults(
  searchParams: URLSearchParams | string,
  recipes: SpoonacularRecipe[],
  totalResults: number,
  scrollPosition?: number
): void {
  if (!isSessionStorageAvailable()) {
    console.warn('[SessionCache] Session storage not available')
    return
  }

  try {
    const key = generateCacheKey(searchParams)
    const data: CachedSearchResults = {
      recipes,
      totalResults,
      scrollPosition: scrollPosition ?? 0,
      timestamp: Date.now(),
      searchParams: typeof searchParams === 'string' ? searchParams : searchParams.toString(),
      ttl: DEFAULT_TTL,
    }

    sessionStorage.setItem(key, JSON.stringify(data))

    // Cleanup and enforce limits
    cleanupExpiredEntries()
    enforceMaxEntries()

    console.log(
      `[SessionCache] Saved ${recipes.length} recipes for params: ${data.searchParams}`
    )
  } catch (e) {
    console.error('[SessionCache] Failed to save results:', e)
    // If quota exceeded, clear old entries and retry
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      cleanupExpiredEntries()
      enforceMaxEntries()
    }
  }
}

/**
 * Retrieves search results from session storage
 *
 * @param searchParams - URL search parameters
 * @returns Cached results or null if not found/expired
 */
export function getSearchResults(
  searchParams: URLSearchParams | string
): CachedSearchResults | null {
  if (!isSessionStorageAvailable()) {
    return null
  }

  try {
    const key = generateCacheKey(searchParams)
    const data = sessionStorage.getItem(key)

    if (!data) {
      console.log('[SessionCache] Cache MISS for params:', searchParams.toString())
      return null
    }

    const cached: CachedSearchResults = JSON.parse(data)
    const now = Date.now()
    const age = now - cached.timestamp

    // Check if expired
    if (age > cached.ttl) {
      sessionStorage.removeItem(key)
      console.log('[SessionCache] Cache EXPIRED (age:', age, 'ms)')
      return null
    }

    console.log(
      `[SessionCache] Cache HIT! ${cached.recipes.length} recipes (age: ${Math.round(age / 1000)}s)`
    )
    return cached
  } catch (e) {
    console.error('[SessionCache] Failed to retrieve results:', e)
    return null
  }
}

/**
 * Clears all search result caches
 */
export function clearAllSearchCaches(): void {
  if (!isSessionStorageAvailable()) return

  const keys = getAllCacheKeys()
  keys.forEach((key) => sessionStorage.removeItem(key))

  console.log(`[SessionCache] Cleared ${keys.length} cache entries`)
}

/**
 * Gets cache statistics for monitoring
 */
export function getSessionCacheStats() {
  if (!isSessionStorageAvailable()) {
    return { available: false, entries: 0, totalSize: 0 }
  }

  const keys = getAllCacheKeys()
  let totalSize = 0

  for (const key of keys) {
    const data = sessionStorage.getItem(key)
    if (data) {
      totalSize += new Blob([data]).size
    }
  }

  const totalSizeKB = (totalSize / 1024).toFixed(2)

  return {
    available: true,
    entries: keys.length,
    maxEntries: MAX_ENTRIES,
    totalSize: `${totalSizeKB} KB`,
    limit: '5 MB (browser limit)',
  }
}
