/**
 * Rate Limiter for Login Attempts
 *
 * SECURITY NOTE: This module uses the Supabase service role client (bypasses RLS)
 * because rate limiting must function before authentication completes. It only
 * accesses `account_lockouts` and `login_attempts` tables — never user data.
 */
import { createServiceRoleClient } from '@/lib/supabase/server'

// Rate limiting constants
const MAX_ATTEMPTS = 5 // Lock account after 5 failed attempts
const LOCKOUT_DURATION_MINUTES = 15 // Lock duration in minutes
const ATTEMPT_WINDOW_MINUTES = 15 // Time window for counting attempts

interface LoginAllowedResult {
  allowed: boolean
  remainingAttempts: number
  lockedUntil?: Date
  attemptCount: number
}

/**
 * Check if login is allowed for the given email.
 * Returns lockout status and remaining attempts.
 */
export async function checkLoginAllowed(email: string): Promise<LoginAllowedResult> {
  const supabase = createServiceRoleClient()
  const normalizedEmail = email.toLowerCase().trim()

  // Check if account is currently locked
  const { data: lockout } = await supabase
    .from('account_lockouts')
    .select('locked_until, attempt_count')
    .eq('email', normalizedEmail)
    .single()

  if (lockout && new Date(lockout.locked_until) > new Date()) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(lockout.locked_until),
      attemptCount: lockout.attempt_count,
    }
  }

  // Count recent failed attempts
  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - ATTEMPT_WINDOW_MINUTES)

  const { count } = await supabase
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('email', normalizedEmail)
    .eq('success', false)
    .gte('created_at', windowStart.toISOString())

  const attemptCount = count || 0
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attemptCount)

  return {
    allowed: remainingAttempts > 0,
    remainingAttempts,
    attemptCount,
  }
}

/**
 * Record a login attempt (successful or failed).
 * If failed, check if lockout threshold is reached.
 */
export async function recordLoginAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  failureReason?: string
): Promise<void> {
  const supabase = createServiceRoleClient()
  const normalizedEmail = email.toLowerCase().trim()

  // Insert the login attempt record
  await supabase.from('login_attempts').insert({
    email: normalizedEmail,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    success,
    failure_reason: failureReason || null,
  })

  // If failed, check if we need to lock the account
  if (!success) {
    const windowStart = new Date()
    windowStart.setMinutes(windowStart.getMinutes() - ATTEMPT_WINDOW_MINUTES)

    const { count } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .eq('success', false)
      .gte('created_at', windowStart.toISOString())

    const attemptCount = count || 0

    // Lock account if threshold reached
    if (attemptCount >= MAX_ATTEMPTS) {
      const lockedUntil = new Date()
      lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_DURATION_MINUTES)

      // Upsert lockout record
      await supabase.from('account_lockouts').upsert(
        {
          email: normalizedEmail,
          locked_until: lockedUntil.toISOString(),
          attempt_count: attemptCount,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
        }
      )
    }
  }
}

/**
 * Clear lockout after successful login.
 */
export async function clearLockout(email: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const normalizedEmail = email.toLowerCase().trim()

  // Delete any existing lockout for this email
  await supabase.from('account_lockouts').delete().eq('email', normalizedEmail)

  // Note: We keep the login_attempts for audit purposes
  // They will be cleaned up by the cleanup function after 30 days
}

/**
 * Format remaining lockout time for display.
 */
export function formatLockoutTime(lockedUntil: Date): string {
  const now = new Date()
  const diff = lockedUntil.getTime() - now.getTime()

  if (diff <= 0) return 'unlocked'

  const minutes = Math.ceil(diff / (1000 * 60))

  if (minutes === 1) return '1 minute'
  if (minutes < 60) return `${minutes} minutes`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 1 && remainingMinutes === 0) return '1 hour'
  if (remainingMinutes === 0) return `${hours} hours`

  return `${hours}h ${remainingMinutes}m`
}
