import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Helper type for subscription with period timestamps
interface SubscriptionWithPeriod extends Stripe.Subscription {
  current_period_start: number
  current_period_end: number
}

// Helper to safely get period timestamps from subscription
function getSubscriptionPeriod(sub: Stripe.Subscription): { start: number; end: number } {
  const s = sub as unknown as SubscriptionWithPeriod
  return {
    start: s.current_period_start || 0,
    end: s.current_period_end || 0,
  }
}

// Helper type for invoice with subscription
interface InvoiceWithSubscription extends Stripe.Invoice {
  subscription: string | null
}

// ============================================================================
// Webhook Handler
// ============================================================================

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.error('[Webhook] Stripe not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[Webhook] Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Idempotency check — skip already-processed events
    const supabaseAdmin = await createClient()
    const { data: existingEvent } = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single()

    if (existingEvent) {
      return NextResponse.json({ received: true, deduplicated: true })
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        break
    }

    // Record event as processed
    await supabaseAdmin
      .from('webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
      })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`[Webhook] Error handling ${event.type}:`, error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!userId) {
    console.error('[Webhook] No user ID in checkout metadata')
    return
  }

  // Fetch subscription details
  const subscription = await stripe!.subscriptions.retrieve(subscriptionId)
  const period = getSubscriptionPeriod(subscription)

  const supabase = await createClient()

  // Update user profile with subscription info
  const { error } = await supabase
    .from('user_profiles')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: subscription.status,
      subscription_period_end: period.end ? new Date(period.end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('[Webhook] Error updating user profile:', error)
    throw error
  }

  // Reset quota for new subscription
  await resetQuotaForUser(userId, subscriptionId, subscription)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id
  if (!userId) {
    console.error('[Webhook] No user ID in subscription metadata')
    return
  }

  const supabase = await createClient()

  const period = getSubscriptionPeriod(subscription)

  const { error } = await supabase
    .from('user_profiles')
    .update({
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_period_end: period.end ? new Date(period.end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('[Webhook] Error updating user profile:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id
  if (!userId) {
    // Try to find user by customer ID
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single()

    if (!profile) {
      console.error('[Webhook] Could not find user for subscription')
      return
    }

    await updateSubscriptionInDb(profile.user_id, subscription)
    return
  }

  await updateSubscriptionInDb(userId, subscription)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = await createClient()

  // Find user by subscription ID or customer ID
  let userId = subscription.metadata?.supabase_user_id

  if (!userId) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (!profile) {
      console.error('[Webhook] Could not find user for deleted subscription')
      return
    }

    userId = profile.user_id
  }

  // Clear subscription info but keep customer ID for future purchases
  const { error } = await supabase
    .from('user_profiles')
    .update({
      stripe_subscription_id: null,
      subscription_status: 'canceled',
      subscription_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('[Webhook] Error clearing subscription:', error)
    throw error
  }

}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const inv = invoice as InvoiceWithSubscription
  const subscriptionId = inv.subscription
  if (!subscriptionId) {
    return
  }

  // Get subscription details
  const subscription = await stripe!.subscriptions.retrieve(subscriptionId)

  const userId = subscription.metadata?.supabase_user_id
  if (!userId) {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (!profile) {
      console.error('[Webhook] Could not find user for invoice')
      return
    }

    await resetQuotaForUser(profile.user_id, subscriptionId, subscription)
    return
  }

  await resetQuotaForUser(userId, subscriptionId, subscription)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const inv = invoice as InvoiceWithSubscription
  const subscriptionId = inv.subscription
  if (!subscriptionId) return

  // Get subscription to check status
  const subscription = await stripe!.subscriptions.retrieve(subscriptionId)

  const supabase = await createClient()

  // Find user and update status
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!profile) {
    console.error('[Webhook] Could not find user for failed invoice')
    return
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: subscription.status, // Will be 'past_due' or similar
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', profile.user_id)

  if (error) {
    console.error('[Webhook] Error updating subscription status:', error)
    throw error
  }

}

// ============================================================================
// Helper Functions
// ============================================================================

async function updateSubscriptionInDb(userId: string, subscription: Stripe.Subscription) {
  const supabase = await createClient()
  const period = getSubscriptionPeriod(subscription)

  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: subscription.status,
      subscription_period_end: period.end ? new Date(period.end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('[Webhook] Error updating subscription in DB:', error)
    throw error
  }

}

async function resetQuotaForUser(userId: string, subscriptionId: string, subscription: Stripe.Subscription) {
  const supabase = await createClient()
  const period = getSubscriptionPeriod(subscription)

  // Reset quota for new billing period
  const { error } = await supabase
    .from('meal_plan_generation_quota')
    .update({
      current_period_generated: 0,
      stripe_subscription_id: subscriptionId,
      period_start_date: period.start ? new Date(period.start * 1000).toISOString() : null,
      period_end_date: period.end ? new Date(period.end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('[Webhook] Error resetting quota:', error)
    // Don't throw - quota reset failure shouldn't fail the webhook
  }
}
