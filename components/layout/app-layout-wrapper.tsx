'use client'

import { useOnboardingStore } from '@/stores/onboarding-store'
import { useSidebarStore } from '@/stores/sidebar-store'
import { AppNavigation } from './app-navigation'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

interface AppLayoutWrapperProps {
  children: React.ReactNode
}

export function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const { completedSteps } = useOnboardingStore()
  const { isCollapsed } = useSidebarStore()
  const pathname = usePathname()

  // Check if user has completed all 6 steps of onboarding
  const hasCompletedOnboarding = completedSteps.includes(6)
  
  // Explicitly check if we are on an onboarding route
  const isOnboardingRoute = pathname.startsWith('/onboarding')

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Navigation */}
      {!pathname.startsWith('/login') && !pathname.startsWith('/signup') && (
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
          !isOnboardingRoute && !pathname.startsWith('/login') && !pathname.startsWith('/signup') && hasCompletedOnboarding && (isCollapsed ? 'lg:pl-20' : 'lg:pl-64')
        )}
      >
        {children}
      </main>
    </div>
  )
}
