'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useOnboardingStore } from '@/stores/onboarding-store'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmSent, setConfirmSent] = useState(false)
  const [resending, setResending] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [resendNote, setResendNote] = useState<string | null>(null)
  const router = useRouter()

  // Guests who finished onboarding have a macro plan waiting in localStorage;
  // after auth they go to /onboarding/complete which migrates it to Supabase.
  // Read after mount so the statically prerendered HTML hydrates cleanly.
  const { completedSteps } = useOnboardingStore()
  const [hasPendingPlan, setHasPendingPlan] = useState(false)
  useEffect(() => {
    setHasPendingPlan(completedSteps.includes(6))
  }, [completedSteps])
  const postAuthPath = hasPendingPlan ? '/onboarding/complete' : '/onboarding/1'

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(postAuthPath)}`,
        },
      })

      if (error) {
        setError(error.message)
        setGoogleLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up with Google')
      setGoogleLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // 1. Sign up the user. Carry postAuthPath through the confirmation link so
      // that after the user confirms their email, /auth/callback forwards them
      // to migrate their pending plan instead of dropping them at onboarding.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(postAuthPath)}`,
          data: {
            full_name: fullName,
          }
        },
      })

      if (authError) {
        throw authError
      }

      // 2. Profile is created automatically by database trigger.
      // If email confirmation is on, signUp returns no session — the user must
      // confirm before they're authenticated. Show a "check your email" state;
      // their plan stays safe in localStorage and migrates via the callback.
      if (!authData.session) {
        setConfirmSent(true)
        return
      }

      // 3. Session established immediately (confirmation off): migrate now.
      router.push(postAuthPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setResendNote(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(postAuthPath)}`,
        },
      })
      if (error) throw error
      setResendNote('Sent again — check your inbox.')
      setCanResend(false)
      setTimeout(() => setCanResend(true), 45000)
    } catch (err) {
      setResendNote(err instanceof Error ? err.message : 'Could not resend. Try again in a moment.')
    } finally {
      setResending(false)
    }
  }

  const handleUseDifferentEmail = () => {
    setConfirmSent(false)
    setEmail('')
    setResendNote(null)
    setError(null)
  }

  if (confirmSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-card py-10 px-6 shadow-sm sm:rounded-2xl border border-border-strong text-center space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="size-7 text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Check your inbox</h2>
            {hasPendingPlan && (
              <p className="text-sm font-medium text-foreground">
                Your macro plan is saved. Confirm your email to unlock it.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to{' '}
              <span className="font-semibold text-foreground break-words">{email}</span>. Click it
              to activate your account. Check spam if it hasn&apos;t arrived in a minute.
            </p>
            <div className="flex items-start gap-2 rounded-xl bg-muted p-3 text-left">
              <AlertCircle className="size-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Open the link on this device — that&apos;s where your plan is saved.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resending || !canResend}
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Resending...
                  </>
                ) : canResend ? (
                  'Resend email'
                ) : (
                  'Email sent'
                )}
              </Button>
              {resendNote && (
                <p className="text-xs text-muted-foreground">{resendNote}</p>
              )}
              <button
                type="button"
                onClick={handleUseDifferentEmail}
                className="text-sm font-semibold text-primary hover:text-primary/90"
              >
                Use a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {hasPendingPlan ? 'Your macros are ready' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {hasPendingPlan
            ? 'Create a free account to save your personalized plan'
            : 'Start your journey to better nutrition'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-card py-8 px-6 shadow-sm sm:rounded-2xl border border-border-strong">
          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-input rounded-xl shadow-sm text-sm font-medium bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSignUp}>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <div className="mt-1">
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>
            </div>

            {error && (
              <div className="text-sm p-3 rounded-xl bg-destructive/10 text-destructive">
                {error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Creating account...
                  </>
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/90">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
