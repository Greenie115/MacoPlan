'use server'

import { createClient } from '@/lib/supabase/server'
import {
  generateTOTPSecret,
  generateTOTPUri,
  verifyTOTPCode,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
} from '@/lib/security/totp'
import { generateEmailCode, hashCode, sendEmail2FACode } from '@/lib/security/email-2fa'
import { check2FACodeRateLimit, getMinutesUntilReset } from '@/lib/security/two-factor-rate-limit'

// In-memory rate limiter for 2FA verification attempts (TOTP brute-force prevention)
const verifyAttempts = new Map<string, { count: number; firstAttempt: number }>()
const MAX_VERIFY_ATTEMPTS = 5
const VERIFY_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkVerifyRateLimit(userId: string): { allowed: boolean; minutesLeft: number } {
  const now = Date.now()
  const entry = verifyAttempts.get(userId)

  if (!entry || now - entry.firstAttempt > VERIFY_WINDOW_MS) {
    verifyAttempts.set(userId, { count: 1, firstAttempt: now })
    return { allowed: true, minutesLeft: 0 }
  }

  if (entry.count >= MAX_VERIFY_ATTEMPTS) {
    const minutesLeft = Math.ceil((VERIFY_WINDOW_MS - (now - entry.firstAttempt)) / 60000)
    return { allowed: false, minutesLeft }
  }

  entry.count++
  return { allowed: true, minutesLeft: 0 }
}

function clearVerifyRateLimit(userId: string): void {
  verifyAttempts.delete(userId)
}

// ============================================================================
// TOTP (Authenticator App) Setup
// ============================================================================

/**
 * Start TOTP 2FA setup - generates secret and QR code URI.
 */
export async function setupTOTP(): Promise<{
  success?: boolean
  secret?: string
  uri?: string
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const secret = generateTOTPSecret()
  const uri = generateTOTPUri(secret, user.email || '')

  // Store the pending secret (not enabled yet)
  const { error } = await supabase.from('user_2fa').upsert(
    {
      user_id: user.id,
      method: 'totp',
      totp_secret: secret,
      is_enabled: false,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,method',
    }
  )

  if (error) {
    return { error: 'Failed to setup 2FA' }
  }

  return { success: true, secret, uri }
}

/**
 * Verify TOTP code and enable 2FA.
 */
export async function verifyAndEnableTOTP(code: string): Promise<{
  success?: boolean
  backupCodes?: string[]
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get pending TOTP secret
  const { data: pending } = await supabase
    .from('user_2fa')
    .select('totp_secret')
    .eq('user_id', user.id)
    .eq('method', 'totp')
    .single()

  if (!pending?.totp_secret) {
    return { error: 'No pending TOTP setup found' }
  }

  // Verify the code
  if (!verifyTOTPCode(pending.totp_secret, code)) {
    return { error: 'Invalid verification code' }
  }

  // Generate backup codes
  const backupCodes = generateBackupCodes()
  const hashedBackupCodes = backupCodes.map(hashBackupCode)

  // Enable TOTP and save backup codes
  const { error: updateError } = await supabase
    .from('user_2fa')
    .update({
      is_enabled: true,
      backup_codes: hashedBackupCodes,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('method', 'totp')

  if (updateError) {
    return { error: 'Failed to enable 2FA' }
  }

  // Update user profile
  await supabase
    .from('user_profiles')
    .update({
      two_factor_enabled: true,
      preferred_2fa_method: 'totp',
    })
    .eq('user_id', user.id)

  return { success: true, backupCodes }
}

// ============================================================================
// Email 2FA Setup
// ============================================================================

/**
 * Enable email-based 2FA.
 */
export async function enableEmail2FA(): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Create or update email 2FA record
  const { error } = await supabase.from('user_2fa').upsert(
    {
      user_id: user.id,
      method: 'email',
      is_enabled: true,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,method',
    }
  )

  if (error) {
    return { error: 'Failed to enable email 2FA' }
  }

  // Update user profile
  await supabase
    .from('user_profiles')
    .update({
      two_factor_enabled: true,
      preferred_2fa_method: 'email',
    })
    .eq('user_id', user.id)

  return { success: true }
}

// ============================================================================
// 2FA Verification During Login
// ============================================================================

/**
 * Send 2FA verification code during login.
 */
export async function send2FAVerificationCode(
  userId: string,
  method: 'totp' | 'email'
): Promise<{
  success?: boolean
  error?: string
}> {
  // Rate limit check for email 2FA to prevent spam
  if (method === 'email') {
    const rateCheck = await check2FACodeRateLimit(userId)
    if (!rateCheck.allowed) {
      const minutesRemaining = rateCheck.resetAt
        ? getMinutesUntilReset(rateCheck.resetAt)
        : 15
      return {
        error: `Too many code requests. Please wait ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} before requesting a new code.`,
      }
    }
  }

  const supabase = await createClient()

  if (method === 'email') {
    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(userId)

    if (!userData?.user?.email) {
      return { error: 'User email not found' }
    }

    // Generate and store code
    const code = generateEmailCode()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10) // 10 minute expiry

    // Delete any existing pending verification
    await supabase
      .from('pending_2fa_verification')
      .delete()
      .eq('user_id', userId)

    // Store new pending verification
    const { error: insertError } = await supabase.from('pending_2fa_verification').insert({
      user_id: userId,
      code_hash: hashCode(code),
      method: 'email',
      expires_at: expiresAt.toISOString(),
    })

    if (insertError) {
      return { error: 'Failed to create verification' }
    }

    // Send the email
    const emailResult = await sendEmail2FACode(userData.user.email, code)
    if (emailResult.error) {
      return { error: emailResult.error }
    }

    return { success: true }
  }

  // For TOTP, no code needs to be sent - user uses their authenticator app
  return { success: true }
}

/**
 * Verify 2FA code during login.
 */
export async function verify2FALogin(
  userId: string,
  code: string,
  method: 'totp' | 'email'
): Promise<{
  success?: boolean
  usedBackupCode?: boolean
  error?: string
}> {
  // Rate limit verification attempts to prevent brute-force
  const rateLimit = checkVerifyRateLimit(userId)
  if (!rateLimit.allowed) {
    return { error: `Too many verification attempts. Try again in ${rateLimit.minutesLeft} minutes.` }
  }

  const supabase = await createClient()

  if (method === 'totp') {
    // Get TOTP secret
    const { data: setup } = await supabase
      .from('user_2fa')
      .select('totp_secret, backup_codes')
      .eq('user_id', userId)
      .eq('method', 'totp')
      .eq('is_enabled', true)
      .single()

    if (!setup?.totp_secret) {
      return { error: 'TOTP not configured' }
    }

    // Try TOTP verification first
    if (verifyTOTPCode(setup.totp_secret, code)) {
      clearVerifyRateLimit(userId)
      return { success: true }
    }

    // Try backup code
    if (setup.backup_codes && setup.backup_codes.length > 0) {
      const backupResult = verifyBackupCode(code, setup.backup_codes)
      if (backupResult.valid) {
        clearVerifyRateLimit(userId)
        // Update remaining backup codes
        await supabase
          .from('user_2fa')
          .update({ backup_codes: backupResult.remainingCodes })
          .eq('user_id', userId)
          .eq('method', 'totp')

        return { success: true, usedBackupCode: true }
      }
    }

    return { error: 'Invalid verification code' }
  } else {
    // Email verification
    const { data: pending } = await supabase
      .from('pending_2fa_verification')
      .select('code_hash, expires_at')
      .eq('user_id', userId)
      .eq('method', 'email')
      .single()

    if (!pending) {
      return { error: 'No pending verification found' }
    }

    if (new Date(pending.expires_at) < new Date()) {
      return { error: 'Verification code expired' }
    }

    if (pending.code_hash !== hashCode(code)) {
      return { error: 'Invalid verification code' }
    }

    // Delete the used verification
    await supabase
      .from('pending_2fa_verification')
      .delete()
      .eq('user_id', userId)

    clearVerifyRateLimit(userId)
    return { success: true }
  }
}

// ============================================================================
// Disable 2FA
// ============================================================================

/**
 * Disable 2FA for a specific method.
 */
export async function disable2FA(method: 'totp' | 'email'): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Delete the 2FA record
  const { error } = await supabase
    .from('user_2fa')
    .delete()
    .eq('user_id', user.id)
    .eq('method', method)

  if (error) {
    return { error: 'Failed to disable 2FA' }
  }

  // Check if user has any other 2FA methods enabled
  const { data: remaining } = await supabase
    .from('user_2fa')
    .select('method')
    .eq('user_id', user.id)
    .eq('is_enabled', true)

  if (!remaining || remaining.length === 0) {
    // No 2FA methods left, update profile
    await supabase
      .from('user_profiles')
      .update({
        two_factor_enabled: false,
        preferred_2fa_method: null,
      })
      .eq('user_id', user.id)
  } else {
    // Update preferred method to remaining one
    await supabase
      .from('user_profiles')
      .update({
        preferred_2fa_method: remaining[0].method,
      })
      .eq('user_id', user.id)
  }

  return { success: true }
}

// ============================================================================
// Get 2FA Status
// ============================================================================

/**
 * Get current 2FA configuration for authenticated user.
 */
export async function get2FAStatus(): Promise<{
  enabled: boolean
  methods: { totp: boolean; email: boolean }
  preferred: 'totp' | 'email' | null
  backupCodesRemaining?: number
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      enabled: false,
      methods: { totp: false, email: false },
      preferred: null,
    }
  }

  const { data: methods } = await supabase
    .from('user_2fa')
    .select('method, is_enabled, backup_codes')
    .eq('user_id', user.id)

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('two_factor_enabled, preferred_2fa_method')
    .eq('user_id', user.id)
    .single()

  const totpRecord = methods?.find((m) => m.method === 'totp' && m.is_enabled)
  const emailRecord = methods?.find((m) => m.method === 'email' && m.is_enabled)

  return {
    enabled: profile?.two_factor_enabled ?? false,
    methods: {
      totp: !!totpRecord,
      email: !!emailRecord,
    },
    preferred: profile?.preferred_2fa_method as 'totp' | 'email' | null,
    backupCodesRemaining: totpRecord?.backup_codes?.length,
  }
}

/**
 * Regenerate backup codes.
 */
export async function regenerateBackupCodes(): Promise<{
  success?: boolean
  backupCodes?: string[]
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if TOTP is enabled
  const { data: setup } = await supabase
    .from('user_2fa')
    .select('is_enabled')
    .eq('user_id', user.id)
    .eq('method', 'totp')
    .single()

  if (!setup?.is_enabled) {
    return { error: 'TOTP 2FA not enabled' }
  }

  // Generate new backup codes
  const backupCodes = generateBackupCodes()
  const hashedBackupCodes = backupCodes.map(hashBackupCode)

  // Update backup codes
  const { error } = await supabase
    .from('user_2fa')
    .update({
      backup_codes: hashedBackupCodes,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('method', 'totp')

  if (error) {
    return { error: 'Failed to regenerate backup codes' }
  }

  return { success: true, backupCodes }
}
