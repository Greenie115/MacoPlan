'use server'

import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
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

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      })

      customerId = customer.id

      // Save customer ID to database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)

      if (updateError) {
        // Continue anyway - we can handle this via webhook
      }
    }

    const baseUrl = getBaseUrl()

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
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
    return { success: false, error: 'Failed to access subscription management' }
  }
}

// ============================================================================
// Get Subscription Status (for display purposes)
// ============================================================================

export interface SubscriptionInfo {
  isActive: boolean
  plan: 'free' | 'monthly' | 'annual'
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
}

/**
 * Gets the current subscription status for display
 */
export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
  try {
    if (!stripe) {
      return { isActive: false, plan: 'free' }
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { isActive: false, plan: 'free' }
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return { isActive: false, plan: 'free' }
    }

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1,
      expand: ['data.items.data.price'],
    })

    if (subscriptions.data.length === 0) {
      return { isActive: false, plan: 'free' }
    }

    const subscription = subscriptions.data[0] as Stripe.Subscription
    const priceId = subscription.items.data[0]?.price?.id

    // Determine plan type from price ID
    let plan: 'monthly' | 'annual' = 'monthly'
    if (priceId === process.env.STRIPE_ANNUAL_PRICE_ID) {
      plan = 'annual'
    }

    // Access period end (Stripe API returns as number timestamp)
    const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end

    return {
      isActive: true,
      plan,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    }

  } catch (error) {
    return { isActive: false, plan: 'free' }
  }
}
