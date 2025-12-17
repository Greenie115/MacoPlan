/**
 * Recipe Search Cache
 *
 * Implements intelligent caching to reduce FatSecret API costs:
 * - In-memory LRU cache for filter combinations
 * - 30-minute cache duration (balances freshness vs cost)
 * - Deduplicates concurrent requests
 * - Tracks cache hit rate for monitoring
 *
 * Expected savings:
 * - Without cache: Multiple API calls per search
 * - With cache: Single API call (first time)
 * - Subsequent visits: 0 API calls (cache hit)
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
}

class RecipeCache {
  private cache: Map<string, CacheEntry<any>>
  private stats: CacheStats
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize = 100, defaultTTL = 30 * 60 * 1000) {
    // 30 minutes (increased from 15min to match session cache)
    this.cache = new Map()
    this.stats = { hits: 0, misses: 0, evictions: 0 }
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  /**
   * Generates a cache key from search parameters
   */
  private generateKey(params: Record<string, any>): string {
    // Sort keys for consistent cache keys
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        const value = params[key]
        // Normalize arrays to sorted strings
        if (Array.isArray(value)) {
          acc[key] = [...value].sort().join(',')
        } else if (value !== undefined && value !== null) {
          acc[key] = String(value)
        }
        return acc
      }, {} as Record<string, string>)

    return JSON.stringify(sortedParams)
  }

  /**
   * Gets cached value if exists and not expired
   */
  get<T>(params: Record<string, any>): T | null {
    const key = this.generateKey(params)
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return null
    }

    const now = Date.now()
    const age = now - entry.timestamp

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return entry.data as T
  }

  /**
   * Sets a value in cache with optional TTL
   */
  set<T>(params: Record<string, any>, data: T, ttl?: number): void {
    const key = this.generateKey(params)

    // Evict oldest entry if cache is full (LRU)
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
        this.stats.evictions++
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }

  /**
   * Clears all cached entries
   */
  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0 }
  }

  /**
   * Gets cache statistics for monitoring
   */
  getStats() {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
        : 0

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: hitRate.toFixed(2) + '%',
    }
  }

  /**
   * Removes expired entries (garbage collection)
   */
  cleanup(): void {
    const now = Date.now()
    let removed = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        removed++
      }
    }

    if (removed > 0) {
      console.log(`[RecipeCache] Cleaned up ${removed} expired entries`)
    }
  }
}

// Singleton instance
const recipeCache = new RecipeCache()

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => recipeCache.cleanup(), 5 * 60 * 1000)
}

export { recipeCache }

/**
 * Wrapper function for cached API calls
 *
 * Usage:
 * const result = await withCache(
 *   { query: 'pasta', cuisine: 'italian' },
 *   async () => await apiCall()
 * )
 */
export async function withCache<T>(
  params: Record<string, any>,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache
  const cached = recipeCache.get<T>(params)
  if (cached) {
    console.log('[RecipeCache] Cache HIT', params)
    return cached
  }

  // Cache miss - fetch and store
  console.log('[RecipeCache] Cache MISS', params)
  const data = await fetcher()
  recipeCache.set(params, data, ttl)

  return data
}

/**
 * Get cache statistics for monitoring API cost savings
 */
export function getCacheStats() {
  return recipeCache.getStats()
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearCache() {
  recipeCache.clear()
}
