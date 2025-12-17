/**
 * Image URL Validation Utilities
 * Validates and sanitizes external image URLs for security
 */

// Allowed image domains (must match next.config.ts remotePatterns)
const ALLOWED_IMAGE_DOMAINS = [
  'edamam-product-images.s3.amazonaws.com',
  'www.edamam.com',
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'dxhfjhprhxylnhufzaiu.supabase.co',
  // FatSecret domains
  'www.fatsecret.com',
  'm.fatsecret.com',
  'm.ftscrt.com',
  'static.fatsecret.com',
]

/**
 * Validates if an image URL is from an allowed domain
 * @param url - The image URL to validate
 * @returns true if URL is valid and from allowed domain
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false

  try {
    const parsedUrl = new URL(url)

    // Must be HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false
    }

    // Must be from allowed domain
    return ALLOWED_IMAGE_DOMAINS.includes(parsedUrl.hostname)
  } catch {
    // Invalid URL format
    return false
  }
}

/**
 * Gets a safe image URL or returns null if invalid
 * Use this before passing URLs to Next.js Image component
 * @param url - The image URL to validate
 * @returns Validated URL or null
 */
export function getSafeImageUrl(
  url: string | null | undefined
): string | null {
  return isValidImageUrl(url) ? (url as string) : null
}

/**
 * Validates and returns image URL or fallback
 * @param url - The image URL to validate
 * @param fallback - Fallback URL to use if invalid (optional)
 * @returns Validated URL or fallback
 */
export function getImageUrlOrFallback(
  url: string | null | undefined,
  fallback?: string
): string | null {
  if (isValidImageUrl(url)) {
    return url as string
  }
  return fallback || null
}
