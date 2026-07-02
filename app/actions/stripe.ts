'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// Get base URL for redirects
function getBaseUrl(): string {
  // Use explicit env var if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // In production we must never fall back to localhost (would break checkout redirects)
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_APP_URL must be set in production for Stripe checkout redirects')
  }
  // Default to localhost for development
  return 'http://localhost:3000'
}

// ============================================================================
// Types
// ============================================================================

type PlanType = 'monthly' | 'annual'

interface CheckoutResult {
  success: boolean
  url?: string
  error?: string
}

interface PortalResult {
  success: boolean
  url?: string
  error?: string
}

// ============================================================================
// Create Checkout Session
// ============================================================================

/**
 * Creates a Stripe Checkout session for subscription
 *
 * @param plan - 'monthly' or 'annual'
 * @returns Checkout session URL or error
 */
export async function createCheckoutSession(plan: PlanType): Promise<CheckoutResult> {
  try {
    if (!stripe) {
      return { success: false, error: 'Payment system not configured' }
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'You must be authenticated to subscribe' }
    }

    // Get price ID based on plan
    const priceId = plan === 'annual'
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID

    if (!priceId) {
      return { success: false, error: 'Subscription plan not configured' }
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    const customerId = profile?.stripe_customer_id
    const baseUrl = getBaseUrl()

    // Create checkout session. Returning customer -> reuse their Stripe id;
    // first-time upgrade -> let Checkout create the customer from their email.
    // The webhook (checkout.session.completed) writes the new
    // stripe_customer_id back, so we skip a synchronous customers.create + DB
    // write here — two fewer round-trips before the redirect.
    const session = await stripe.checkout.sessions.create({
      ...(customerId
        ? { customer: customerId }
        : { customer_email: user.email || undefined }),
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        supabase_user_id: user.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      allow_promotion_codes: true,
    })

    if (!session.url) {
      return { success: false, error: 'Failed to create checkout session' }
    }

    return { success: true, url: session.url }

  } catch (error) {
    console.error('[stripe] createCheckoutSession failed:', error)
    return { success: false, error: 'Failed to initiate checkout' }
  }
}

// ============================================================================
// Create Customer Portal Session
// ============================================================================

/**
 * Creates a Stripe Customer Portal session for subscription management
 *
 * @returns Portal session URL or error
 */
export async function createPortalSession(): Promise<PortalResult> {
  try {
    if (!stripe) {
      return { success: false, error: 'Payment system not configured' }
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'You must be authenticated to manage your subscription' }
    }

    // Get Stripe customer ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return { success: false, error: 'No active subscription found' }
    }

    const baseUrl = getBaseUrl()

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/dashboard`,
    })

    return { success: true, url: session.url }

  } catch (error) {
    console.error('[stripe] createPortalSession failed:', error)
    return { success: false, error: 'Failed to access subscription management' }
  }
}

