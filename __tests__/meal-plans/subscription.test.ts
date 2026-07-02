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

  // Simulation is gated on the authenticated email being in the allowlist.
  const ALLOWED_EMAIL = 'dggreen545@gmail.com'
  const mockAuthUser = (id: string, email: string | null) =>
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id, email } } })

  describe('getUserSubscriptionTier', () => {
    it('should return simulated tier for allowlisted account with simulation active', async () => {
      mockAuthUser('test-user-id', ALLOWED_EMAIL)
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
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

    it('should return free simulated tier when allowlisted account simulates free', async () => {
      mockAuthUser('test-user-id', ALLOWED_EMAIL)
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
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

    it('should return real tier for allowlisted account when simulated_tier is null', async () => {
      mockAuthUser('test-user-id', ALLOWED_EMAIL)
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
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

    it('should ignore simulated_tier for non-allowlisted accounts', async () => {
      mockAuthUser('test-user-id', 'someone-else@example.com')
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                simulated_tier: 'paid', // This should be ignored
                stripe_customer_id: null,
              },
            }),
          }),
        }),
      })

      const tier = await getUserSubscriptionTier('test-user-id')
      expect(tier).toBe('free') // Non-allowlisted accounts use real tier
    })
  })

  describe('checkMealPlanQuota', () => {
    // checkMealPlanQuota counts batch_prep_plans rows. The count query is a
    // thenable builder: free tier awaits after .eq(), paid chains .gte() first.
    const mockPlanCount = (count: number) => {
      const result = { count, error: null }
      const query = Object.assign(Promise.resolve(result), {
        gte: vi.fn().mockResolvedValue(result),
      })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(query),
        }),
      })
    }

    it('should allow free tier users with less than 3 plans', async () => {
      mockPlanCount(2)

      const result = await checkMealPlanQuota('test-user', 'free')

      expect(result.allowed).toBe(true)
      expect(result.used).toBe(2)
      expect(result.remaining).toBe(1)
      expect(result.total).toBe(3)
      expect(result.reason).toBeUndefined()
    })

    it('should block free tier users at 3 plans limit', async () => {
      mockPlanCount(3)

      const result = await checkMealPlanQuota('test-user', 'free')

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.total).toBe(3)
      expect(result.reason).toContain('Free tier limit reached')
    })

    it('should allow paid tier users with less than 100 plans this month', async () => {
      mockPlanCount(50)

      const result = await checkMealPlanQuota('test-user', 'paid')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(50)
      expect(result.total).toBe(100)
    })

    it('should block paid tier users at 100 plans limit', async () => {
      mockPlanCount(100)

      const result = await checkMealPlanQuota('test-user', 'paid')

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.total).toBe(100)
      expect(result.reason).toContain('Monthly generation limit reached')
    })

    it('should treat users with no plans as full quota', async () => {
      mockPlanCount(0)

      const result = await checkMealPlanQuota('new-user', 'free')

      expect(result.allowed).toBe(true)
      expect(result.used).toBe(0)
      expect(result.remaining).toBe(3)
    })
  })

  describe('getUserSubscriptionTier via subscription_status column', () => {
    const mockProfile = (subscription_status: string | null) => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                simulated_tier: null,
                stripe_customer_id: 'cus_xxx',
                subscription_status,
              },
            }),
          }),
        }),
      })
    }

    it('returns paid for active status without calling Stripe', async () => {
      mockProfile('active')
      expect(await getUserSubscriptionTier('u1')).toBe('paid')
    })

    it('returns paid for trialing status', async () => {
      mockProfile('trialing')
      expect(await getUserSubscriptionTier('u1')).toBe('paid')
    })

    it('returns free for canceled status', async () => {
      mockProfile('canceled')
      expect(await getUserSubscriptionTier('u1')).toBe('free')
    })

    it('returns free for past_due status', async () => {
      mockProfile('past_due')
      expect(await getUserSubscriptionTier('u1')).toBe('free')
    })
  })
})
