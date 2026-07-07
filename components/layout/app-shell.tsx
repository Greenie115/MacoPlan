'use client'

import { useSidebarStore } from '@/stores/sidebar-store'
import { SidebarNav } from './sidebar-nav'
import { BottomNav } from './bottom-nav'
import { TopAppBar } from './top-app-bar'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  userName: string
  avatarUrl: string | null
}

/**
 * Shared chrome for authenticated app routes: sidebar (desktop),
 * bottom nav (mobile), and the top app bar.
 *
 * Route protection lives in middleware — by the time this renders,
 * the user is authenticated and has completed onboarding.
 *
 * userName/avatarUrl come from the server layout (single fetch) instead of
 * a mount-time client fetch.
 * ponytail: no onAuthStateChange listener — profile edits already call
 * revalidatePath, and a hard nav refreshes the server layout anyway.
 */
export function AppShell({ children, userName, avatarUrl }: AppShellProps) {
  const { isCollapsed } = useSidebarStore()

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav />
      <BottomNav />

      <main
        id="main-content"
        className={cn(
          'flex-1 overflow-auto bg-background transition-[padding] duration-200 ease-out-quint',
          // Bottom padding on mobile for the bottom nav
          'pb-16 lg:pb-0',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border-strong">
          <div className="max-w-7xl mx-auto">
            <TopAppBar userName={userName} avatarUrl={avatarUrl} />
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
