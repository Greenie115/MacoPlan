'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import {
  checkLoginAllowed,
  recordLoginAttempt,
  clearLockout,
} from '@/lib/security/rate-limiter'

interface LoginResult {
  success?: boolean
  error?: string
  remainingAttempts?: number
  lockedUntil?: string
  requires2FA?: boolean
  userId?: string
}

/**
 * Login with rate limiting and brute force protection.
 */
export async function loginWithRateLimit(
  email: string,
  password: string
): Promise<LoginResult> {
  // Get request metadata for logging
  const headersList = await headers()
  const ipAddress =
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-real-ip') ||
    'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  // 1. Check if login is allowed (rate limiting)
  const rateCheck = await checkLoginAllowed(email)

  if (!rateCheck.allowed) {
    return {
      error: 'Account temporarily locked due to too many failed attempts',
      lockedUntil: rateCheck.lockedUntil?.toISOString(),
      remainingAttempts: 0,
    }
  }

  // 2. Attempt login with Supabase
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // 3. Record the attempt
  await recordLoginAttempt(
    email,
    !error,
    ipAddress,
    userAgent,
    error?.message
  )

  if (error) {
    const newRemainingAttempts = rateCheck.remainingAttempts - 1

    // Provide appropriate error message
    let errorMessage = 'Invalid email or password'

    if (newRemainingAttempts <= 2 && newRemainingAttempts > 0) {
      errorMessage = `Invalid credentials. ${newRemainingAttempts} attempt${newRemainingAttempts === 1 ? '' : 's'} remaining before account lockout.`
    } else if (newRemainingAttempts === 0) {
      errorMessage =
        'Account locked due to too many failed attempts. Please try again in 15 minutes.'
    }

    return {
      error: errorMessage,
      remainingAttempts: newRemainingAttempts,
    }
  }

  // 4. Success - clear any existing lockout
  await clearLockout(email)

  // 5. Check if 2FA is required
  if (data.user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('two_factor_enabled, preferred_2fa_method')
      .eq('user_id', data.user.id)
      .single()

    if (profile?.two_factor_enabled) {
      // Sign out temporarily - 2FA verification required
      await supabase.auth.signOut()

      return {
        requires2FA: true,
        userId: data.user.id,
      }
    }
  }

  return { success: true }
}

/**
 * Check if a user has 2FA enabled.
 */
export async function check2FAEnabled(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_profiles')
    .select('two_factor_enabled')
    .eq('user_id', userId)
    .single()

  return data?.two_factor_enabled ?? false
}

/**
 * Get 2FA methods enabled for a user.
 */
export async function get2FAMethods(userId: string): Promise<{
  totp: boolean
  email: boolean
  preferred: 'totp' | 'email' | null
}> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('preferred_2fa_method')
    .eq('user_id', userId)
    .single()

  const { data: methods } = await supabase
    .from('user_2fa')
    .select('method, is_enabled')
    .eq('user_id', userId)

  const totpEnabled = methods?.some(
    (m) => m.method === 'totp' && m.is_enabled
  ) ?? false
  const emailEnabled = methods?.some(
    (m) => m.method === 'email' && m.is_enabled
  ) ?? false

  return {
    totp: totpEnabled,
    email: emailEnabled,
    preferred: profile?.preferred_2fa_method as 'totp' | 'email' | null,
  }
}
