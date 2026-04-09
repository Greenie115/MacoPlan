import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)
vi.stubEnv('UNSPLASH_ACCESS_KEY', 'test_unsplash_key')

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}))

import { UnsplashService } from '@/lib/services/unsplash'

describe('UnsplashService', () => {
  let service: UnsplashService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new UnsplashService()
  })

  describe('searchFoodPhoto', () => {
    it('returns photo URL and attribution from Unsplash API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{
            urls: {
              raw: 'https://images.unsplash.com/photo-test?raw',
              full: 'https://images.unsplash.com/photo-test?full',
              regular: 'https://images.unsplash.com/photo-test?w=1080',
              small: 'https://images.unsplash.com/photo-test?w=400',
              thumb: 'https://images.unsplash.com/photo-test?w=200',
            },
            user: {
              name: 'John Photographer',
              links: { html: 'https://unsplash.com/@john' },
            },
          }],
        }),
      })

      const result = await service.searchFoodPhoto('Grilled Chicken Salad')

      expect(result).not.toBeNull()
      expect(result!.url).toContain('unsplash.com')
      expect(result!.photographerName).toBe('John Photographer')
      expect(result!.photographerUrl).toContain('unsplash.com/@john')
    })

    it('returns null when no results found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      })

      const result = await service.searchFoodPhoto('Nonexistent Dish XYZ')
      expect(result).toBeNull()
    })

    it('returns null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      })

      const result = await service.searchFoodPhoto('Test Recipe')
      expect(result).toBeNull()
    })
  })
})
