'use client'

import { useEffect, useState } from 'react'
import { useSidebarStore } from '@/stores/sidebar-store'
import { SidebarNav } from './sidebar-nav'
import { BottomNav } from './bottom-nav'
import { TopAppBar } from './top-app-bar'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface AppShellProps {
  children: React.ReactNode
}

/**
 * Shared chrome for authenticated app routes: sidebar (desktop),
 * bottom nav (mobile), and the top app bar.
 *
 * Route protection lives in middleware — by the time this renders,
 * the user is authenticated and has completed onboarding.
 */
export function AppShell({ children }: AppShellProps) {
  const { isCollapsed } = useSidebarStore()
  const [userName, setUserName] = useState('User')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single()

      setUserName(data?.full_name || user.email?.split('@')[0] || 'User')
      setAvatarUrl(data?.avatar_url ?? null)
    }

    loadProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        loadProfile()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav />
      <BottomNav />

      <main
        className={cn(
          'flex-1 overflow-auto transition-all duration-300 ease-in-out',
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
