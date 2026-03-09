'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Mail, Smartphone, ArrowLeft, RefreshCw } from 'lucide-react'
import { verify2FALogin, send2FAVerificationCode } from '@/app/actions/two-factor'
import { get2FAMethods } from '@/app/actions/login'
import { createClient } from '@/lib/supabase/client'

export default function Verify2FAPage() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [method, setMethod] = useState<'totp' | 'email'>('totp')
  const [availableMethods, setAvailableMethods] = useState<{
    totp: boolean
    email: boolean
    preferred: 'totp' | 'email' | null
  }>({ totp: false, email: false, preferred: null })
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [codeSent, setCodeSent] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const supabase = createClient()

  // Load pending 2FA data from session storage
  useEffect(() => {
    const pending = sessionStorage.getItem('pending2FA')
    if (!pending) {
      sessionStorage.removeItem('pendingPassword')
      router.push('/login')
      return
    }

    try {
      const data = JSON.parse(pending)
      setUserId(data.userId)
      setEmail(data.email)

      // Fetch available 2FA methods
      get2FAMethods(data.userId).then((methods) => {
        setAvailableMethods(methods)
        setMethod(methods.preferred || (methods.totp ? 'totp' : 'email'))
      })
    } catch {
      sessionStorage.removeItem('pendingPassword')
      router.push('/login')
    }
  }, [router])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newCode.every((c) => c !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]

    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }

    setCode(newCode)

    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex((c) => c === '')
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
      // Auto-submit if all filled
      if (newCode.every((c) => c !== '')) {
        handleVerify(newCode.join(''))
      }
    }
  }

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('')

    if (codeToVerify.length !== 6 && !codeToVerify.includes('-')) {
      setError('Please enter a 6-digit code')
      return
    }

    if (!userId) {
      setError('Session expired. Please login again.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await verify2FALogin(userId, codeToVerify, method)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      return
    }

    if (result.usedBackupCode) {
      // Backup code was used - user should be aware their codes are depleting
    }

    // Clear pending 2FA data
    sessionStorage.removeItem('pending2FA')

    // Re-authenticate with Supabase to complete login
    if (email) {
      const password = sessionStorage.getItem('pendingPassword')
      // Clear stored password immediately before use
      sessionStorage.removeItem('pendingPassword')

      if (!password) {
        setError('Session expired. Please log in again.')
        setLoading(false)
        router.push('/login')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // If re-auth fails, redirect to login to start fresh
        setError('Authentication failed. Please log in again.')
        setLoading(false)
        router.push('/login')
        return
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleSendEmailCode = async () => {
    if (!userId) return

    setSendingCode(true)
    setError(null)

    const result = await send2FAVerificationCode(userId, 'email')

    if (result.error) {
      setError(result.error)
    } else {
      setCodeSent(true)
    }

    setSendingCode(false)
  }

  const handleMethodSwitch = (newMethod: 'totp' | 'email') => {
    setMethod(newMethod)
    setCode(['', '', '', '', '', ''])
    setError(null)
    setCodeSent(false)
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-foreground">
          Two-Factor Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {method === 'totp'
            ? 'Enter the code from your authenticator app'
            : 'Enter the code sent to your email'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-card py-8 px-6 shadow-sm sm:rounded-2xl border border-border-strong">
          {/* Method Selection */}
          {availableMethods.totp && availableMethods.email && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => handleMethodSwitch('totp')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  method === 'totp'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Authenticator
              </button>
              <button
                onClick={() => handleMethodSwitch('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  method === 'email'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>
          )}

          {/* Email code sending */}
          {method === 'email' && !codeSent && (
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                We&apos;ll send a verification code to your email address.
              </p>
              <button
                onClick={handleSendEmailCode}
                disabled={sendingCode}
                className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {sendingCode ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Code
                  </>
                )}
              </button>
            </div>
          )}

          {/* Code Input */}
          {(method === 'totp' || codeSent) && (
            <>
              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-mono border-2 border-border-strong rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 text-foreground"
                  />
                ))}
              </div>

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-xl mb-4 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={() => handleVerify()}
                disabled={loading || code.some((c) => c === '')}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </>
          )}

          {/* Backup code option for TOTP */}
          {method === 'totp' && (
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Lost your device? Enter a backup code instead.
              </p>
            </div>
          )}

          {/* Resend email code */}
          {method === 'email' && codeSent && (
            <div className="mt-4 text-center">
              <button
                onClick={handleSendEmailCode}
                disabled={sendingCode}
                className="text-sm text-primary hover:text-primary/90"
              >
                Resend code
              </button>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-6">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
