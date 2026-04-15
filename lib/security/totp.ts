import { authenticator } from 'otplib'
import crypto from 'crypto'

/**
 * Generate a new TOTP secret for authenticator app setup.
 */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret()
}

/**
 * Generate a TOTP URI for QR code display.
 * This URI can be scanned by authenticator apps like Google Authenticator.
 */
export function generateTOTPUri(secret: string, email: string): string {
  return authenticator.keyuri(email, 'Macro Plan', secret)
}

/**
 * Verify a TOTP code against a secret.
 * Includes a 30-second window tolerance for clock drift.
 */
export function verifyTOTPCode(secret: string, code: string): boolean {
  try {
    // Set window to allow 1 step before/after (±30 seconds)
    authenticator.options = {
      window: 1,
    }
    return authenticator.verify({ token: code, secret })
  } catch {
    return false
  }
}

/**
 * Generate backup codes for recovery.
 * Returns array of 8-character alphanumeric codes.
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing chars: I, O, 0, 1

  for (let i = 0; i < count; i++) {
    let code = ''
    for (let j = 0; j < 8; j++) {
      const randomIndex = crypto.randomInt(0, chars.length)
      code += chars[randomIndex]
    }
    // Format as XXXX-XXXX for readability
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
  }

  return codes
}

/**
 * Hash a backup code for secure storage.
 */
export function hashBackupCode(code: string): string {
  // Remove formatting (dashes) and normalize to uppercase
  const normalizedCode = code.replace(/-/g, '').toUpperCase()
  return crypto.createHash('sha256').update(normalizedCode).digest('hex')
}

/**
 * Verify a backup code against stored hashed codes.
 * Returns whether the code is valid and the updated list of remaining codes.
 */
export function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): { valid: boolean; remainingCodes: string[] } {
  const inputHash = hashBackupCode(code)

  const index = hashedCodes.findIndex((hash) => hash === inputHash)

  if (index === -1) {
    return { valid: false, remainingCodes: hashedCodes }
  }

  // Remove the used code
  const remainingCodes = [...hashedCodes]
  remainingCodes.splice(index, 1)

  return { valid: true, remainingCodes }
}
