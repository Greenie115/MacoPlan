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
      <SidebarNav userName={userName} avatarUrl={avatarUrl} />
      <BottomNav />

      <main
        id="main-content"
        className={cn(
          'flex-1 overflow-auto bg-background pb-16 transition-[padding] duration-200 ease-out-quint lg:pb-0',
          isCollapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-60'
        )}
      >
        <TopAppBar userName={userName} avatarUrl={avatarUrl} />
        {children}
      </main>
    </div>
  )
}
