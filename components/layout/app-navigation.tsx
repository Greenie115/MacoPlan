'use client'

import { usePathname } from 'next/navigation'
import { SidebarNav } from './sidebar-nav'
import { BottomNav } from './bottom-nav'
import { HamburgerButton } from './hamburger-button'

interface AppNavigationProps {
  /**
   * Whether the user has completed onboarding
   */
  hasCompletedOnboarding?: boolean
}

export function AppNavigation({ hasCompletedOnboarding = false }: AppNavigationProps) {
  const pathname = usePathname()

  // Don't show navigation during onboarding
  const isOnboardingRoute = pathname.startsWith('/onboarding')

  // Only show navigation if user completed onboarding and not on onboarding route
  const shouldShowNavigation = hasCompletedOnboarding && !isOnboardingRoute

  if (!shouldShowNavigation) {
    return null
  }

  return (
    <>
      {/* Desktop: Hamburger button */}
      <HamburgerButton />

      {/* Desktop: Sidebar navigation (hidden on mobile < lg) */}
      <SidebarNav />

      {/* Mobile: Bottom navigation (hidden on desktop >= lg) */}
      <BottomNav />
    </>
  )
}
