'use client'

import { useEffect, useState } from 'react'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { useSidebarStore } from '@/stores/sidebar-store'
import { AppNavigation } from './app-navigation'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AppLayoutWrapperProps {
  children: React.ReactNode
}

export function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const { completedSteps } = useOnboardingStore()
  const { isCollapsed } = useSidebarStore()
  const pathname = usePathname()
  const [hasProfile, setHasProfile] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(true)

  // Check if user has a profile in database (more reliable than localStorage)
  useEffect(() => {
    async function checkUserProfile() {
      // Skip check on auth pages
      if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/onboarding')) {
        setCheckingProfile(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()

        setHasProfile(!!data?.onboarding_completed)
      }

      setCheckingProfile(false)
    }

    checkUserProfile()
  }, [pathname])

  // Check if user has completed onboarding (either from localStorage or database)
  const hasCompletedOnboarding = completedSteps.includes(6) || hasProfile

  // Explicitly check if we are on an onboarding route
  const isOnboardingRoute = pathname.startsWith('/onboarding')

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Navigation */}
        {!pathname.startsWith('/login') && !pathname.startsWith('/signup') && pathname !== '/' && !pathname.startsWith('/blog') && (
          <AppNavigation hasCompletedOnboarding={hasCompletedOnboarding} />
        )}

        {/* Main content area */}
        <main
          className={cn(
            'flex-1 overflow-auto transition-all duration-300 ease-in-out',
            // Add padding bottom on mobile to account for bottom nav
            'pb-16 lg:pb-0',
            // Add padding left on desktop when sidebar is visible
            // ONLY if not on onboarding route, not on login/signup route, and user has completed onboarding
            !isOnboardingRoute && !pathname.startsWith('/login') && !pathname.startsWith('/signup') && pathname !== '/' && !pathname.startsWith('/blog') && hasCompletedOnboarding && (isCollapsed ? 'lg:pl-20' : 'lg:pl-64')
          )}
        >
          {children}
        </main>
      </div>
      <Toaster />
    </>
  )
}
