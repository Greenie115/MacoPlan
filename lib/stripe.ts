/**
 * Shared Stripe Client
 *
 * Centralized Stripe initialization with key validation.
 * Warns when test keys are used in production or live keys in development.
 */

import Stripe from 'stripe'

function validateStripeKey(key: string): void {
  const isProduction = process.env.NODE_ENV === 'production'
  const isTestKey = key.startsWith('sk_test_') || key.startsWith('rk_test_')
  const isLiveKey = key.startsWith('sk_live_') || key.startsWith('rk_live_')

  if (isProduction && isTestKey) {
    console.warn(
      '[Stripe] WARNING: Using a test key in production. ' +
        'Set STRIPE_SECRET_KEY to your live key (sk_live_...) for production.'
    )
  }

  if (!isProduction && isLiveKey) {
    console.warn(
      '[Stripe] WARNING: Using a live key in development. ' +
        'Set STRIPE_SECRET_KEY to your test key (sk_test_...) to avoid real charges.'
    )
  }

  if (!isTestKey && !isLiveKey) {
    console.error(
      '[Stripe] ERROR: STRIPE_SECRET_KEY does not look like a valid Stripe key. ' +
        'Expected a key starting with sk_test_, sk_live_, rk_test_, or rk_live_.'
    )
  }
}

function validatePublishableKey(key: string): void {
  const isProduction = process.env.NODE_ENV === 'production'
  const isTestKey = key.startsWith('pk_test_')
  const isLiveKey = key.startsWith('pk_live_')

  if (isProduction && isTestKey) {
    console.warn(
      '[Stripe] WARNING: Using a test publishable key in production. ' +
        'Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your live key (pk_live_...).'
    )
  }

  if (!isProduction && isLiveKey) {
    console.warn(
      '[Stripe] WARNING: Using a live publishable key in development. ' +
        'Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your test key (pk_test_...).'
    )
  }
}

// Validate keys on module load (server-side only)
if (process.env.STRIPE_SECRET_KEY) {
  validateStripeKey(process.env.STRIPE_SECRET_KEY)
}
if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  validatePublishableKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

/**
 * Shared Stripe instance. Returns null if STRIPE_SECRET_KEY is not set.
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    })
  : null

/**
 * Get the Stripe instance, throwing if not configured.
 * Use this in code paths that require Stripe to be available.
 */
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      'Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.'
    )
  }
  return stripe
}
