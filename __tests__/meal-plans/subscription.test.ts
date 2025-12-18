import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Create mock implementations using vi.hoisted to ensure proper initialization order
const { mockFrom, mockSupabase, mockCreateClient } = vi.hoisted(() => {
  const mockFrom = vi.fn()
  const mockSupabase = {
    from: mockFrom,
    auth: {
      getUser: vi.fn(),
    },
  }
  const mockCreateClient = vi.fn(() => Promise.resolve(mockSupabase))

  return { mockFrom, mockSupabase, mockCreateClient }
})

// Mock Supabase module
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    subscriptions: {
      list: vi.fn(),
    },
  })),
}))

// Import AFTER mocks are set up
import {
  getUserSubscriptionTier,
  checkMealPlanQuota,
} from '@/lib/utils/subscription'

describe('Subscription Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getUserSubscriptionTier', () => {
    it('should return simulated tier for test users with simulation active', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                is_test_user: true,
                simulated_tier: 'paid',
                stripe_customer_id: null,
              },
            }),
          }),
        }),
      })

      const tier = await getUserSubscriptionTier('test-user-id')
      expect(tier).toBe('paid')
    })

    it('should return free simulated tier when test user simulates free', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                is_test_user: true,
                simulated_tier: 'free',
                stripe_customer_id: 'cus_xxx',
              },
            }),
          }),
        }),
      })

      const tier = await getUserSubscriptionTier('test-user-id')
      expect(tier).toBe('free')
    })

    it('should return real tier for test users when simulated_tier is null', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                is_test_user: true,
                simulated_tier: null,
                stripe_customer_id: null,
              },
            }),
          }),
        }),
      })

      const tier = await getUserSubscriptionTier('test-user-id')
      expect(tier).toBe('free') // No Stripe = free
    })

    it('should return "free" when user profile not found', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      })

      const tier = await getUserSubscriptionTier('test-user-id')
      expect(tier).toBe('free')
    })

    it('should return "free" when no Stripe customer ID', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                is_test_user: false,
                simulated_tier: null,
                stripe_customer_id: null,
              },
            }),
          }),
        }),
      })

      const tier = await getUserSubscriptionTier('test-user-id')
      expect(tier).toBe('free')
    })

    it('should ignore simulated_tier for non-test users', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                is_test_user: false,
                simulated_tier: 'paid', // This should be ignored
                stripe_customer_id: null,
              },
            }),
          }),
        }),
      })

      const tier = await getUserSubscriptionTier('test-user-id')
      expect(tier).toBe('free') // Non-test users use real tier
    })
  })

  describe('checkMealPlanQuota', () => {
    it('should allow free tier users with less than 3 plans', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                user_id: 'test-user',
                free_tier_generated: 2,
                current_period_generated: 2,
                total_generated: 2,
              },
            }),
          }),
        }),
      })

      const result = await checkMealPlanQuota('test-user', 'free')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)
      expect(result.total).toBe(3)
      expect(result.reason).toBeUndefined()
    })

    it('should block free tier users at 3 plans limit', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                user_id: 'test-user',
                free_tier_generated: 3,
                current_period_generated: 3,
                total_generated: 3,
              },
            }),
          }),
        }),
      })

      const result = await checkMealPlanQuota('test-user', 'free')

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.total).toBe(3)
      expect(result.reason).toContain('Free tier limit reached')
    })

    it('should allow paid tier users with less than 100 plans', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                user_id: 'test-user',
                free_tier_generated: 0,
                current_period_generated: 50,
                total_generated: 50,
              },
            }),
          }),
        }),
      })

      const result = await checkMealPlanQuota('test-user', 'paid')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(50)
      expect(result.total).toBe(100)
    })

    it('should block paid tier users at 100 plans limit', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                user_id: 'test-user',
                free_tier_generated: 0,
                current_period_generated: 100,
                total_generated: 100,
              },
            }),
          }),
        }),
      })

      const result = await checkMealPlanQuota('test-user', 'paid')

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.total).toBe(100)
      expect(result.reason).toContain('Monthly generation limit reached')
    })

    it('should create quota record for new users', async () => {
      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              user_id: 'new-user',
              free_tier_generated: 0,
              current_period_generated: 0,
              total_generated: 0,
            },
            error: null,
          }),
        }),
      })

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
        insert: insertMock,
      })

      const result = await checkMealPlanQuota('new-user', 'free')

      expect(insertMock).toHaveBeenCalledWith({ user_id: 'new-user' })
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(3)
    })
  })
})
