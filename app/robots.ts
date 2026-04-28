import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://macroplan.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/blog/*', '/pricing'],
        disallow: [
          '/dashboard',
          '/profile',
          '/meal-plans',
          '/recipes',
          '/onboarding',
          '/checkout',
          '/api',
          '/auth',
          '/help',
          '/forgot-password',
          '/reset-password',
          '/login/verify-2fa',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
