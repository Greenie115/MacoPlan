'use client'

import { useOnboardingStore } from '@/stores/onboarding-store'
import { AppNavigation } from './app-navigation'
import { useNavigationStore } from '@/stores/navigation-store'
import { cn } from '@/lib/utils'

interface AppLayoutWrapperProps {
  children: React.ReactNode
}

export function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const { completedSteps } = useOnboardingStore()
  const { isSidebarOpen } = useNavigationStore()

  // Check if user has completed all 6 steps of onboarding
  const hasCompletedOnboarding = completedSteps.includes(6)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Navigation */}
      <AppNavigation hasCompletedOnboarding={hasCompletedOnboarding} />

      {/* Main content area */}
      <main
        className={cn(
          'flex-1 overflow-auto',
          // Add padding bottom on mobile to account for bottom nav
          'pb-16 lg:pb-0',
          // Add padding left on desktop when sidebar is open
          hasCompletedOnboarding && 'lg:pl-0'
        )}
      >
        {children}
      </main>
    </div>
  )
}
