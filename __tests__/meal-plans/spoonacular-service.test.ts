import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SpoonacularMealPlanService } from '@/lib/services/spoonacular-meal-plans'
import type {
  SpoonacularMealPlanParams,
  SpoonacularDailyMealPlan,
} from '@/lib/types/spoonacular'

// Mock fetch
global.fetch = vi.fn()

// Create mock Supabase instance using vi.hoisted
const { mockSupabase, mockCreateClient } = vi.hoisted(() => {
  const mockSupabase = {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
  }
  const mockCreateClient = vi.fn()

  return { mockSupabase, mockCreateClient }
})

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

describe('Spoonacular Meal Plan Service', () => {
  let service: SpoonacularMealPlanService

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase)

    // Reset fetch mock
    ;(global.fetch as any).mockReset()

    service = new SpoonacularMealPlanService()
  })

  describe('validateMacroMatch', () => {
    it('should return true for exact match', () => {
      const result = service.validateMacroMatch(2000, 2000)
      expect(result.isWithinTolerance).toBe(true)
      expect(result.percentDiff).toBe(0)
    })

    it('should return true for 5% difference', () => {
      const result = service.validateMacroMatch(2000, 2100)
      expect(result.isWithinTolerance).toBe(true)
      expect(result.percentDiff).toBe(5)
    })

    it('should return true for -5% difference', () => {
      const result = service.validateMacroMatch(2000, 1900)
      expect(result.isWithinTolerance).toBe(true)
      expect(result.percentDiff).toBe(-5)
    })

    it('should return false for 6% difference', () => {
      const result = service.validateMacroMatch(2000, 2120)
      expect(result.isWithinTolerance).toBe(false)
      expect(result.percentDiff).toBe(6)
    })

    it('should return false for -6% difference', () => {
      const result = service.validateMacroMatch(2000, 1880)
      expect(result.isWithinTolerance).toBe(false)
      expect(result.percentDiff).toBe(-6)
    })

    it('should handle zero target calories', () => {
      const result = service.validateMacroMatch(0, 2000)
      expect(result.isWithinTolerance).toBe(false)
    })
  })

  describe('generateCacheKey', () => {
    it('should generate consistent hash for same params', async () => {
      const params: SpoonacularMealPlanParams = {
        timeFrame: 'day',
        targetCalories: 2000,
        diet: 'vegetarian',
        exclude: 'peanuts,shellfish',
      }

      const hash1 = await service.generateCacheKey(params)
      const hash2 = await service.generateCacheKey(params)

      expect(hash1).toBe(hash2)
      expect(typeof hash1).toBe('string')
      expect(hash1.length).toBe(64) // SHA-256 produces 64 char hex string
    })

    it('should generate different hashes for different params', async () => {
      const params1: SpoonacularMealPlanParams = {
        timeFrame: 'day',
        targetCalories: 2000,
      }

      const params2: SpoonacularMealPlanParams = {
        timeFrame: 'day',
        targetCalories: 2500,
      }

      const hash1 = await service.generateCacheKey(params1)
      const hash2 = await service.generateCacheKey(params2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('generateMealPlan - Cache Hit', () => {
    it('should return cached plan if available', async () => {
      const params: SpoonacularMealPlanParams = {
        timeFrame: 'day',
        targetCalories: 2000,
      }

      const mockCachedPlan = {
        id: 'cache-id',
        query_hash: 'test-hash',
        meals: [
          {
            id: 123,
            title: 'Grilled Chicken',
            readyInMinutes: 30,
            servings: 2,
            sourceUrl: 'https://example.com',
          },
        ],
        total_calories: 2000,
        total_protein: 150,
        total_carbs: 200,
        total_fat: 50,
        hit_count: 5,
      }

      // Mock cache check
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: mockCachedPlan,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      })

      const result = (await service.generateMealPlan(
        params
      )) as SpoonacularDailyMealPlan

      expect(result).toBeDefined()
      expect(result.meals).toHaveLength(1)
      expect(result.nutrients.calories).toBe(2000)
      expect(global.fetch).not.toHaveBeenCalled() // Should not call API
    })
  })

  describe('generateMealPlan - API Call', () => {
    it('should call Spoonacular API on cache miss', async () => {
      const params: SpoonacularMealPlanParams = {
        timeFrame: 'day',
        targetCalories: 2000,
      }

      const mockApiResponse = {
        nutrients: {
          calories: 2000,
          protein: 150,
          fat: 50,
          carbohydrates: 200,
        },
        meals: [
          {
            id: 456,
            title: 'Salmon Dinner',
            readyInMinutes: 45,
            servings: 2,
            sourceUrl: 'https://example.com/salmon',
          },
        ],
      }

      // Mock cache miss
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new-cache-id' },
            }),
          }),
        }),
      })

      // Mock API response
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      })

      const result = (await service.generateMealPlan(
        params
      )) as SpoonacularDailyMealPlan

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(result.meals).toHaveLength(1)
      expect(result.meals[0].title).toBe('Salmon Dinner')
      expect(result.nutrients.calories).toBe(2000)
    })

    it('should handle API errors gracefully', async () => {
      const params: SpoonacularMealPlanParams = {
        timeFrame: 'day',
        targetCalories: 2000,
      }

      // Mock cache miss
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      })

      // Mock API error
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 402,
        statusText: 'Payment Required',
      })

      await expect(service.generateMealPlan(params)).rejects.toThrow(
        'Spoonacular API error'
      )
    })
  })

  describe('Request Deduplication', () => {
    it('should deduplicate concurrent requests with same params', async () => {
      const params: SpoonacularMealPlanParams = {
        timeFrame: 'day',
        targetCalories: 2000,
      }

      const mockApiResponse = {
        nutrients: {
          calories: 2000,
          protein: 150,
          fat: 50,
          carbohydrates: 200,
        },
        meals: [],
      }

      // Mock cache miss
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new-cache-id' },
            }),
          }),
        }),
      })

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      })

      // Make 3 concurrent requests with same params
      const promises = [
        service.generateMealPlan(params),
        service.generateMealPlan(params),
        service.generateMealPlan(params),
      ]

      await Promise.all(promises)

      // Should only call API once due to deduplication
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})
