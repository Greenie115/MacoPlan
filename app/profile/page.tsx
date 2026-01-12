'use client'

import { BottomNav } from '@/components/layout/bottom-nav'
import {
  Utensils,
  ChevronRight,
  HelpCircle,
  FileText,
  LogOut,
  Moon,
  Lock,
  Shield,
  ArrowRight,
  User,
  FlaskConical,
  Settings,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useTransition } from 'react'
import { UserProfile } from '@/lib/types/database'
import { getSubscriptionStatus } from '@/app/actions/subscription'
import { createPortalSession } from '@/app/actions/stripe'
import { updateSimulatedTier } from '@/app/actions/profile'
import type { SubscriptionStatus } from '@/lib/constants/subscription'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { ChangePasswordModal } from '@/components/profile/change-password-modal'
import { TwoFactorSetup } from '@/components/profile/two-factor-setup'

export default function ProfilePage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [authProvider, setAuthProvider] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [simulatedTier, setSimulatedTier] = useState<'free' | 'paid' | null>(null)
  const [isUpdatingTier, setIsUpdatingTier] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [portalError, setPortalError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        setUserEmail(user.email || '')
        // Detect auth provider (google, email, etc.)
        setAuthProvider(user.app_metadata?.provider || 'email')

        const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single()

        if (error) {
          // PGRST116 = no rows returned (user has no profile)
          if (error.code === 'PGRST116') {
            console.log('No profile found - user needs to complete onboarding')
            setProfile(null)
          } else {
            console.error('Failed to load profile:', error)
            setProfile(null)
          }
        } else {
          setProfile(data)
          setSimulatedTier(data.simulated_tier)
        }

        // Load subscription status
        const status = await getSubscriptionStatus()
        setSubscriptionStatus(status)
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase, router])

  // Handle hydration for theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDarkMode = mounted ? resolvedTheme === 'dark' : false
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark')

  const handleSimulatedTierToggle = async () => {
    if (!profile?.is_test_user || isUpdatingTier) return

    setIsUpdatingTier(true)

    // Toggle between 'free' and 'paid'
    const nextTier = simulatedTier === 'paid' ? 'free' : 'paid'

    const result = await updateSimulatedTier(nextTier)

    if (result.success) {
      setSimulatedTier(nextTier)
      // Refresh subscription status to reflect new tier
      const status = await getSubscriptionStatus()
      setSubscriptionStatus(status)
    } else {
      console.error('Failed to update simulated tier:', result.error)
    }

    setIsUpdatingTier(false)
  }

  const handleClearSimulation = async () => {
    if (!profile?.is_test_user || isUpdatingTier) return

    setIsUpdatingTier(true)
    const result = await updateSimulatedTier(null)

    if (result.success) {
      setSimulatedTier(null)
      const status = await getSubscriptionStatus()
      setSubscriptionStatus(status)
    }

    setIsUpdatingTier(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleManageSubscription = () => {
    setPortalError(null)
    startTransition(async () => {
      const result = await createPortalSession()
      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        setPortalError(result.error || 'Failed to open subscription portal')
      }
    })
  }

  const userInitials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  const goalLabels = {
    cut: 'Lose Fat',
    bulk: 'Build Muscle',
    maintain: 'Maintain Weight',
    recomp: 'Recomposition',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
        <BottomNav activeTab="profile" />
      </div>
    )
  }

  // Show onboarding prompt if no profile exists
  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <main className="max-w-3xl mx-auto p-4">
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Complete Your Profile</h2>
              <p className="text-muted-foreground max-w-md">
                It looks like you haven't completed your profile setup yet. Complete the onboarding process to unlock
                all features.
              </p>
            </div>
            <Link
              href="/onboarding/1"
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Complete Onboarding
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </main>
        <BottomNav activeTab="profile" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="p-4">
          <div className="flex flex-col items-center gap-4 bg-card p-6 rounded-2xl shadow-sm border border-border-strong">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || undefined} alt="Profile picture" />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">{profile?.full_name || 'User'}</h2>
              <p className="text-muted-foreground">{userEmail}</p>
            </div>
            <Link
              href="/profile/editprofile"
              className="w-full max-w-xs h-10 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors flex items-center justify-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="px-4"><div className="h-px bg-border-strong w-full"></div></div>

        {/* Plan & Billing */}
        <section className="pt-6">
          <h3 className="px-4 pb-2 text-lg font-bold text-foreground">Plan & Billing</h3>
          <div className="px-4">
            <div className="bg-card p-4 rounded-2xl shadow-sm border border-border-strong space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Current Plan</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  subscriptionStatus?.isPremium
                    ? 'bg-primary/20 text-primary'
                    : 'bg-accent text-foreground'
                }`}>
                  {subscriptionStatus?.isPremium ? 'Premium' : 'Free'}
                </span>
              </div>
              {subscriptionStatus?.isPremium ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      {subscriptionStatus.quota.total - subscriptionStatus.quota.remaining} of {subscriptionStatus.quota.total} meal plans this month
                    </p>
                    <div className="w-full bg-secondary rounded-full h-2 mt-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${((subscriptionStatus.quota.total - subscriptionStatus.quota.remaining) / subscriptionStatus.quota.total) * 100}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {subscriptionStatus.quota.remaining} meal plans remaining this month
                    </p>
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-secondary text-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Settings className="size-4" />
                    )}
                    <span>Manage Subscription</span>
                  </button>
                  {portalError && (
                    <p className="text-xs text-destructive text-center">{portalError}</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {subscriptionStatus
                      ? `${subscriptionStatus.quota.total - subscriptionStatus.quota.remaining} of ${subscriptionStatus.quota.total} meal plans generated`
                      : 'Loading...'}
                  </p>
                  <div className="w-full bg-secondary rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: subscriptionStatus
                          ? `${((subscriptionStatus.quota.total - subscriptionStatus.quota.remaining) / subscriptionStatus.quota.total) * 100}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              )}
              {!subscriptionStatus?.isPremium && (
                <Link
                  href="/pricing"
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  <span>Upgrade to Premium</span>
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        </section>

        <div className="px-4 pt-6"><div className="h-px bg-border-strong w-full"></div></div>

        {/* Macro Goals */}
        <section className="pt-6">
          <h3 className="px-4 pb-2 text-lg font-bold text-foreground">Macro Goals</h3>
          <div className="px-4">
            <div className="bg-card p-4 rounded-2xl shadow-sm border border-border-strong space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Target</p>
                  <p className="text-xl font-bold text-foreground">
                    {profile?.target_calories?.toLocaleString() || '-'} cal
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Goal</p>
                  <p className="text-sm font-bold text-primary">
                    {profile?.goal ? goalLabels[profile.goal] : '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-protein/10 p-3 rounded-xl">
                  <p className="font-bold text-protein">{profile?.protein_grams || '-'}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="bg-carb/10 p-3 rounded-xl">
                  <p className="font-bold text-carb">{profile?.carb_grams || '-'}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="bg-fat/10 p-3 rounded-xl">
                  <p className="font-bold text-fat">{profile?.fat_grams || '-'}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
              </div>

              <Link
                href="/profile/editprofile"
                className="w-full h-10 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors flex items-center justify-center"
              >
                Update Macros
              </Link>
            </div>
          </div>
        </section>

        {/* Dietary Preferences */}
        <section className="px-4 pt-6">
          <div className="flex items-center justify-between bg-card p-4 rounded-2xl shadow-sm border border-border-strong">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-success/10 flex items-center justify-center text-success">
                <Utensils className="size-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Dietary Preferences</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.dietary_style && profile.dietary_style !== 'none'
                    ? profile.dietary_style.charAt(0).toUpperCase() + profile.dietary_style.slice(1)
                    : 'No restrictions'}
                </p>
              </div>
            </div>
            <Link href="/profile/editprofile" className="text-primary font-semibold text-sm hover:underline">
              Edit
            </Link>
          </div>
        </section>

        <div className="px-4 pt-6"><div className="h-px bg-border-strong w-full"></div></div>

        {/* Account Settings */}
        <section className="pt-6">
          <h3 className="px-4 pb-2 text-lg font-bold text-foreground">Account Settings</h3>
          <div className="px-4 flex flex-col gap-px rounded-2xl overflow-hidden border border-border-strong shadow-sm bg-border-strong">
            {authProvider === 'email' && (
              <div
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center justify-between p-4 bg-card hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Lock className="size-5 text-icon" />
                  <span className="text-foreground font-medium">Change Password</span>
                </div>
                <ChevronRight className="size-5 text-icon" />
              </div>
            )}
            <div
              className="flex items-center justify-between p-4 bg-card cursor-pointer hover:bg-accent transition-colors"
              onClick={toggleDarkMode}
            >
              <div className="flex items-center gap-3">
                <Moon className="size-5 text-icon" />
                <span className="text-foreground font-medium">Dark Mode</span>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-secondary'}`}>
                <div className={`absolute top-1 size-4 bg-white rounded-full shadow-sm transition-all ${isDarkMode ? 'left-6' : 'left-1'}`}></div>
              </div>
            </div>
            {/* Test User Tier Toggle - only visible for test users */}
            {profile?.is_test_user && (
              <div className="flex flex-col gap-2 p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FlaskConical className="size-5 text-icon" />
                    <div>
                      <span className="text-foreground font-medium">Simulate Tier</span>
                      <p className="text-xs text-muted-foreground">
                        {simulatedTier === null
                          ? 'Using real subscription'
                          : `Simulating: ${simulatedTier}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSimulatedTierToggle}
                    disabled={isUpdatingTier}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      simulatedTier === 'paid'
                        ? 'bg-primary text-white'
                        : simulatedTier === 'free'
                        ? 'bg-secondary text-foreground'
                        : 'bg-accent text-muted-foreground'
                    }`}
                  >
                    {isUpdatingTier ? '...' : simulatedTier === 'paid' ? 'Paid' : simulatedTier === 'free' ? 'Free' : 'None'}
                  </button>
                </div>
                {simulatedTier !== null && (
                  <button
                    onClick={handleClearSimulation}
                    disabled={isUpdatingTier}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    Clear simulation (use real tier)
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Two-Factor Authentication */}
        <section className="pt-6 px-4">
          <TwoFactorSetup />
        </section>

        {/* Support & Legal */}
        <section className="pt-6">
          <h3 className="px-4 pb-2 text-lg font-bold text-foreground">Support & Legal</h3>
          <div className="px-4 flex flex-col gap-px rounded-2xl overflow-hidden border border-border-strong shadow-sm bg-border-strong">
            <Link href="/help" className="flex items-center justify-between p-4 bg-card hover:bg-accent transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="size-5 text-icon" />
                <span className="text-foreground font-medium">Help Center</span>
              </div>
              <ChevronRight className="size-5 text-icon" />
            </Link>
            <Link href="/privacy" className="flex items-center justify-between p-4 bg-card hover:bg-accent transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="size-5 text-icon" />
                <span className="text-foreground font-medium">Privacy Policy</span>
              </div>
              <ChevronRight className="size-5 text-icon" />
            </Link>
            <Link href="/terms" className="flex items-center justify-between p-4 bg-card hover:bg-accent transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-icon" />
                <span className="text-foreground font-medium">Terms of Service</span>
              </div>
              <ChevronRight className="size-5 text-icon" />
            </Link>
          </div>
        </section>

        {/* Logout */}
        <div className="p-4 mt-4">
          <button
            onClick={handleLogout}
            className="w-full h-12 flex items-center justify-center gap-2 text-destructive font-semibold hover:bg-destructive/10 rounded-xl transition-colors"
          >
            <LogOut className="size-5" />
            <span>Log Out</span>
          </button>
        </div>

        <div className="text-center pb-8">
          <p className="text-xs text-muted-foreground">App Version 1.0.0</p>
        </div>
      </main>

      <BottomNav activeTab="profile" />

      <ChangePasswordModal open={showPasswordModal} onOpenChange={setShowPasswordModal} />
    </div>
  )
}
