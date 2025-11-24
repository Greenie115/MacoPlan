'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding-store'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      }
      // Will redirect to Google, then back to callback
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (authData.user) {
        await saveProfileData(authData.user.id)
      }

      // Success - show confirmation message
      setError('Check your email to confirm your account!')
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (authData.user) {
        await saveProfileData(authData.user.id)
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log in')
      setLoading(false)
    }
  }

  const saveProfileData = async (userId: string) => {
    const store = useOnboardingStore.getState()
    
    // Only save if we have data (at least a goal)
    if (!store.goal) return

    const supabase = createClient()
    
    // Convert weight to kg
    const weightKg = store.weightUnit === 'kg' 
      ? store.weight 
      : (store.weight || 0) * 0.453592

    // Convert height to cm
    const heightInches = (store.heightFeet || 0) * 12 + (store.heightInches || 0)
    const heightCm = heightInches * 2.54

    const profileData = {
      user_id: userId,
      goal: store.goal,
      age: store.age,
      weight_kg: weightKg,
      height_cm: heightCm,
      sex: store.sex,
      activity_level: store.activityLevel,
      dietary_style: store.dietaryStyle,
      allergies: store.allergies,
      foods_to_avoid: store.foodsToAvoid,
      fitness_experience: store.fitnessExperience,
      tracking_experience: store.trackingExperience,
      meal_prep_skills: store.mealPrepSkills,
      bmr: store.bmr,
      tdee: store.tdee,
      target_calories: store.targetCalories,
      protein_grams: store.proteinGrams,
      carb_grams: store.carbGrams,
      fat_grams: store.fatGrams,
      onboarding_completed: true
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'user_id' })

    if (error) {
      console.error('Error saving profile:', error)
      // Don't block auth success on profile save error, but log it
    }
  }

  const handleContinueAsGuest = () => {
    // Just close modal and redirect to dashboard
    // Data stays in localStorage
    onOpenChange(false)
    router.push('/dashboard')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signup'
              ? 'Save your progress and access your plan anywhere'
              : 'Log in to access your personalized macro plan'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Google OAuth Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
            variant="outline"
            type="button"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={mode === 'signup' ? handleEmailSignUp : handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {mode === 'signup' && <span className="text-xs text-muted-foreground">(min. 8 characters)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
              {mode === 'signup' && password.length > 0 && password.length < 8 && (
                <p className="text-xs text-yellow-600">
                  Password must be at least 8 characters
                </p>
              )}
            </div>

            {error && (
              <div
                className={`text-sm p-3 rounded-md ${
                  error.includes('Check your email')
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'signup' ? 'Signing up...' : 'Logging in...'}
                </>
              ) : (
                <>{mode === 'signup' ? 'Sign Up' : 'Log In'}</>
              )}
            </Button>
          </form>

          {/* Toggle between signup/login */}
          <Button
            variant="link"
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup')
              setError(null)
            }}
            className="w-full"
            type="button"
            disabled={loading}
          >
            {mode === 'signup'
              ? 'Already have an account? Log in'
              : "Don't have an account? Sign up"}
          </Button>

          {/* Guest mode option */}
          <Button
            variant="ghost"
            onClick={handleContinueAsGuest}
            className="w-full"
            type="button"
            disabled={loading}
          >
            Continue as Guest
          </Button>

          {/* Terms & Privacy */}
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-primary">
              Terms
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
