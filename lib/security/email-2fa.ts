import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

/**
 * Generate a random 6-digit code for email 2FA.
 */
export function generateEmailCode(): string {
  // Generate a cryptographically secure 6-digit code
  const code = crypto.randomInt(100000, 999999)
  return code.toString()
}

/**
 * Hash a verification code for secure storage.
 */
export function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

/**
 * Send a 2FA verification code via email.
 * Uses Supabase to send the email.
 */
export async function sendEmail2FACode(email: string, code: string): Promise<{ success?: boolean; error?: string }> {
  // For now, we'll use Supabase's auth email functionality
  // In production, you might want to use a dedicated email service like Resend, SendGrid, etc.

  const supabase = await createClient()

  try {
    // Use Supabase's built-in email sending through auth
    // This sends an OTP email that we can use for 2FA verification
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        data: {
          verification_code: code,
          purpose: '2fa_verification',
        },
      },
    })

    if (error) {
      return { error: 'Failed to send verification email' }
    }

    return { success: true }
  } catch {
    return { error: 'Failed to send verification email' }
  }
}

/**
 * Alternative: Send 2FA code using a custom email template.
 * This requires setting up a custom email provider like Resend.
 */
export async function sendEmail2FACodeCustom(
  email: string,
  code: string
): Promise<{ success?: boolean; error?: string }> {
  // TODO: Implement with Resend or another email service
  // Example with Resend:
  //
  // import { Resend } from 'resend'
  // const resend = new Resend(process.env.RESEND_API_KEY)
  //
  // const { error } = await resend.emails.send({
  //   from: 'MacroPlan <noreply@macoplan.com>',
  //   to: email,
  //   subject: 'Your MacroPlan verification code',
  //   html: `
  //     <h1>Your verification code</h1>
  //     <p>Enter this code to complete your login:</p>
  //     <h2 style="font-size: 32px; font-family: monospace; letter-spacing: 4px;">${code}</h2>
  //     <p>This code expires in 10 minutes.</p>
  //     <p>If you didn't request this code, you can ignore this email.</p>
  //   `,
  // })

  return { error: 'Email service not configured' }
}
