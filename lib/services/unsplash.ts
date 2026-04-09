/**
 * Unsplash Image Service
 *
 * Fetches food photos for recipes and caches URLs permanently in Supabase.
 * Attribution required: "Photo by {name} on Unsplash"
 */

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// Configuration
// ============================================================================

const UNSPLASH_API_URL = 'https://api.unsplash.com'

// ============================================================================
// Types
// ============================================================================

export interface UnsplashPhoto {
  url: string
  smallUrl: string
  photographerName: string
  photographerUrl: string
}

interface UnsplashSearchResponse {
  results: Array<{
    urls: {
      raw: string
      full: string
      regular: string
      small: string
      thumb: string
    }
    user: {
      name: string
      links: {
        html: string
      }
    }
  }>
}

// ============================================================================
// Service Class
// ============================================================================

export class UnsplashService {
  private _accessKey: string | null = null

  private get accessKey(): string {
    if (!this._accessKey) {
      const key = process.env.UNSPLASH_ACCESS_KEY
      if (!key) {
        throw new Error('UNSPLASH_ACCESS_KEY environment variable is required')
      }
      this._accessKey = key
    }
    return this._accessKey
  }

  /**
   * Search for a food photo by recipe name.
   * Returns the first relevant result or null.
   */
  async searchFoodPhoto(recipeName: string): Promise<UnsplashPhoto | null> {
    try {
      const url = new URL(`${UNSPLASH_API_URL}/search/photos`)
      url.searchParams.set('query', `${recipeName} food`)
      url.searchParams.set('per_page', '1')
      url.searchParams.set('orientation', 'landscape')
      url.searchParams.set('content_filter', 'high')

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        console.error(`[Unsplash] API error: ${response.status}`)
        return null
      }

      const data: UnsplashSearchResponse = await response.json()

      if (!data.results || data.results.length === 0) {
        return null
      }

      const photo = data.results[0]
      return {
        url: photo.urls.regular,
        smallUrl: photo.urls.small,
        photographerName: photo.user.name,
        photographerUrl: photo.user.links.html,
      }
    } catch (error) {
      console.error('[Unsplash] Search failed:', error)
      return null
    }
  }

  /**
   * Get a cached image for a recipe, or fetch from Unsplash if not cached.
   * Caches permanently in Supabase `recipe_images` table.
   */
  async getImageForRecipe(recipeId: string, recipeName: string): Promise<UnsplashPhoto | null> {
    const supabase = await createClient()

    // Check cache first
    const { data: cached } = await supabase
      .from('recipe_images')
      .select('unsplash_url, unsplash_small_url, photographer_name, photographer_url')
      .eq('recipe_api_id', recipeId)
      .single()

    if (cached?.unsplash_url) {
      return {
        url: cached.unsplash_url,
        smallUrl: cached.unsplash_small_url || cached.unsplash_url,
        photographerName: cached.photographer_name,
        photographerUrl: cached.photographer_url,
      }
    }

    // Cache miss — fetch from Unsplash
    const photo = await this.searchFoodPhoto(recipeName)

    if (!photo) {
      return null
    }

    // Cache the result permanently
    await supabase.from('recipe_images').upsert({
      recipe_api_id: recipeId,
      unsplash_url: photo.url,
      unsplash_small_url: photo.smallUrl,
      photographer_name: photo.photographerName,
      photographer_url: photo.photographerUrl,
      cached_at: new Date().toISOString(),
    }, {
      onConflict: 'recipe_api_id',
    })

    return photo
  }

  /**
   * Batch-fetch images for multiple recipes.
   * Returns a map of recipeId → UnsplashPhoto | null.
   */
  async getImagesForRecipes(
    recipes: Array<{ id: string; name: string }>
  ): Promise<Map<string, UnsplashPhoto | null>> {
    const supabase = await createClient()
    const imageMap = new Map<string, UnsplashPhoto | null>()
    const recipeIds = recipes.map((r) => r.id)

    // Batch-check cache
    const { data: cachedImages } = await supabase
      .from('recipe_images')
      .select('recipe_api_id, unsplash_url, unsplash_small_url, photographer_name, photographer_url')
      .in('recipe_api_id', recipeIds)

    const cachedMap = new Map(
      (cachedImages || []).map((img) => [img.recipe_api_id, {
        url: img.unsplash_url,
        smallUrl: img.unsplash_small_url || img.unsplash_url,
        photographerName: img.photographer_name,
        photographerUrl: img.photographer_url,
      } as UnsplashPhoto])
    )

    // Separate cached from uncached
    const uncachedRecipes: Array<{ id: string; name: string }> = []
    for (const recipe of recipes) {
      if (cachedMap.has(recipe.id)) {
        imageMap.set(recipe.id, cachedMap.get(recipe.id)!)
      } else {
        uncachedRecipes.push(recipe)
      }
    }

    // Fetch uncached images with individual error handling
    const fetchPromises = uncachedRecipes.map(async (recipe) => {
      try {
        const photo = await this.getImageForRecipe(recipe.id, recipe.name)
        imageMap.set(recipe.id, photo)
      } catch {
        imageMap.set(recipe.id, null)
      }
    })

    await Promise.all(fetchPromises)

    return imageMap
  }
}

// Singleton instance
export const unsplashService = new UnsplashService()
