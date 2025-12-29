'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Send a password reset email to the specified email address.
 * Uses Supabase's built-in password recovery flow.
 */
export async function sendPasswordResetEmail(email: string): Promise<{
  success?: boolean
  error?: string
}> {
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) {
    // Don't reveal whether the email exists or not for security
    console.error('Password reset error:', error.message)
    // Always return success to prevent email enumeration
    return { success: true }
  }

  return { success: true }
}

/**
 * Update the user's password after they've clicked the reset link.
 * The user must be authenticated via the reset token (handled by Supabase).
 */
export async function updatePassword(newPassword: string): Promise<{
  success?: boolean
  error?: string
}> {
  if (!newPassword || newPassword.length < 12) {
    return { error: 'Password must be at least 12 characters long' }
  }

  const supabase = await createClient()

  // Check if user is authenticated (via reset token)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Invalid or expired reset link. Please request a new one.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error('Password update error:', error.message)
    return { error: 'Failed to update password. Please try again.' }
  }

  return { success: true }
}
