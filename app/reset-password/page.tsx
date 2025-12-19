'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { updatePassword } from '@/app/actions/password-reset'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check if user has a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsValidSession(!!session)
    }
    checkSession()

    // Listen for auth state changes (when user clicks reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const validatePassword = () => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validatePassword()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    const result = await updatePassword(password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // Sign out and redirect to login after a short delay
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login')
      }, 3000)
    }
  }

  // Show loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-card py-8 px-6 shadow-sm sm:rounded-2xl border border-border-strong text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error if no valid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-card py-8 px-6 shadow-sm sm:rounded-2xl border border-border-strong text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Invalid or expired link
            </h2>
            <p className="text-muted-foreground mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="block w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors text-center"
            >
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-card py-8 px-6 shadow-sm sm:rounded-2xl border border-border-strong text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Password updated
            </h2>
            <p className="text-muted-foreground mb-4">
              Your password has been successfully reset. You&apos;ll be redirected to the login page shortly.
            </p>
            <Link
              href="/login"
              className="block w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors text-center"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Create new password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-card py-8 px-6 shadow-sm sm:rounded-2xl border border-border-strong">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                New password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="appearance-none block w-full pl-10 pr-12 py-3 border border-input rounded-xl shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm new password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="appearance-none block w-full pl-10 pr-12 py-3 border border-input rounded-xl shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className={password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
                {password.length >= 8 ? '✓' : '•'} At least 8 characters
              </p>
              <p className={password && password === confirmPassword ? 'text-green-600 dark:text-green-400' : ''}>
                {password && password === confirmPassword ? '✓' : '•'} Passwords match
              </p>
            </div>

            {error && (
              <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {loading ? 'Updating password...' : 'Reset password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
