import { createClient } from '@/lib/supabase/server'

// Rate limiting constants for 2FA code requests
const TWO_FA_CODE_RATE_LIMIT = 3 // Max 3 code requests
const TWO_FA_CODE_WINDOW_MINUTES = 15 // Per 15 minute window

interface TwoFARateLimitResult {
  allowed: boolean
  remaining: number
  resetAt?: Date
}

/**
 * Check if user can request another 2FA verification code.
 * Limits to 3 requests per 15 minute window to prevent email spam.
 */
export async function check2FACodeRateLimit(
  userId: string
): Promise<TwoFARateLimitResult> {
  try {
    const supabase = await createClient()
    const windowStart = new Date()
    windowStart.setMinutes(windowStart.getMinutes() - TWO_FA_CODE_WINDOW_MINUTES)

    // Count recent code requests from pending_2fa_verification table
    const { count, error } = await supabase
      .from('pending_2fa_verification')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', windowStart.toISOString())

    if (error) {
      console.error('Error checking 2FA rate limit:', error)
      // Allow on error to prevent user lockout, but log for monitoring
      return { allowed: true, remaining: TWO_FA_CODE_RATE_LIMIT }
    }

    const requestCount = count || 0
    const remaining = Math.max(0, TWO_FA_CODE_RATE_LIMIT - requestCount)
    const allowed = requestCount < TWO_FA_CODE_RATE_LIMIT

    // Calculate when the rate limit window resets
    const resetAt = new Date()
    resetAt.setMinutes(resetAt.getMinutes() + TWO_FA_CODE_WINDOW_MINUTES)

    return { allowed, remaining, resetAt }
  } catch (err) {
    console.error('Unexpected error in 2FA rate limit check:', err)
    // Allow on error to prevent user lockout
    return { allowed: true, remaining: TWO_FA_CODE_RATE_LIMIT }
  }
}

/**
 * Calculate minutes until rate limit resets.
 */
export function getMinutesUntilReset(resetAt: Date): number {
  const now = new Date()
  const diff = resetAt.getTime() - now.getTime()
  return Math.max(1, Math.ceil(diff / 60000))
}
