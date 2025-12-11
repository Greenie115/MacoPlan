/**
 * Spoonacular Image URL Utilities
 *
 * Spoonacular provides images at different sizes via URL patterns.
 * Larger images (636x393+) are watermark-free, while smaller images
 * have the Spoonacular logo overlay.
 *
 * URL Format: https://img.spoonacular.com/recipes/{id}-{width}x{height}.{type}
 */

export type SpoonacularImageSize =
  | '90x90' // Tiny thumbnail (watermarked)
  | '240x150' // Small thumbnail (watermarked)
  | '312x231' // Medium thumbnail (watermarked)
  | '480x360' // Card size (watermarked)
  | '556x370' // Large card (minimal/no watermark)
  | '636x393' // Extra large (no watermark) - RECOMMENDED for cards
  | '1200x900' // Hero/detail page (no watermark)

/**
 * Generates a Spoonacular image URL at the specified size
 * @param recipeId - Spoonacular recipe ID
 * @param size - Image size preset (default: 636x393 for high quality, no watermark)
 * @param imageType - Image file type (default: jpg)
 */
export function getSpoonacularImageUrl(
  recipeId: number,
  size: SpoonacularImageSize = '636x393',
  imageType: 'jpg' | 'png' = 'jpg'
): string {
  return `https://img.spoonacular.com/recipes/${recipeId}-${size}.${imageType}`
}

/**
 * Extracts recipe ID from a Spoonacular image URL
 * @param imageUrl - Full Spoonacular image URL
 * @returns Recipe ID or null if not a valid Spoonacular URL
 */
export function extractRecipeIdFromImageUrl(imageUrl: string): number | null {
  const match = imageUrl.match(/recipes\/(\d+)-/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Converts any Spoonacular image URL to a specific size
 * @param imageUrl - Original Spoonacular image URL
 * @param newSize - Desired image size
 */
export function resizeSpoonacularImage(
  imageUrl: string,
  newSize: SpoonacularImageSize
): string {
  const recipeId = extractRecipeIdFromImageUrl(imageUrl)
  if (!recipeId) return imageUrl // Return original if not a Spoonacular URL

  // Extract image type from original URL
  const imageType = imageUrl.endsWith('.png') ? 'png' : 'jpg'

  return getSpoonacularImageUrl(recipeId, newSize, imageType)
}

/**
 * Get responsive image URLs for different screen sizes
 * @param recipeId - Spoonacular recipe ID
 * @returns Object with URLs for different screen sizes
 */
export function getResponsiveSpoonacularImages(recipeId: number) {
  return {
    // Mobile
    small: getSpoonacularImageUrl(recipeId, '480x360'),
    // Tablet
    medium: getSpoonacularImageUrl(recipeId, '636x393'),
    // Desktop
    large: getSpoonacularImageUrl(recipeId, '1200x900'),
  }
}
