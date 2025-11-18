'use client'

import { Menu } from 'lucide-react'
import { useNavigationStore } from '@/stores/navigation-store'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export function HamburgerButton() {
  const { toggleSidebar } = useNavigationStore()
  const pathname = usePathname()

  // Don't show on onboarding routes
  if (pathname.startsWith('/onboarding')) {
    return null
  }

  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        'fixed top-4 left-4 z-30 lg:z-20',
        'p-3 bg-card border border-border rounded-lg',
        'hover:bg-accent transition-colors duration-200',
        'shadow-lg lg:shadow-md',
        'flex items-center justify-center'
      )}
      aria-label="Toggle navigation menu"
    >
      <Menu className="size-5" />
    </button>
  )
}
