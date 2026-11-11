'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar-store'
import { Logo, LogoMark } from '@/components/brand/logo'
import { NAV_ITEMS, activePath } from './nav-items'
import { UserAvatar } from './user-avatar'

export function SidebarNav({ userName, avatarUrl }: { userName: string; avatarUrl: string | null }) {
  const current = activePath(usePathname())
  const { isCollapsed, toggle } = useSidebarStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-full flex-col border-r border-border-strong bg-card transition-[width] duration-200 ease-out-quint lg:flex',
        isCollapsed ? 'w-[4.5rem]' : 'w-60'
      )}
      aria-label="Main navigation"
    >
      <div className={cn('flex h-16 items-center', isCollapsed ? 'justify-center' : 'px-5')}>
        {isCollapsed ? (
          <Link href="/dashboard" aria-label="MacroPlan — Home">
            <LogoMark size={28} />
          </Link>
        ) : (
          <Logo href="/dashboard" markSize={26} textClassName="font-display text-lg font-bold tracking-tight" />
        )}
      </div>

      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const isActive = current === path
            return (
              <li key={path}>
                <Link
                  href={path}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCollapsed ? label : undefined}
                  className={cn(
                    'flex h-10 items-center gap-3 rounded-lg text-sm transition-colors duration-fast',
                    isCollapsed ? 'justify-center' : 'px-3',
                    isActive
                      ? 'bg-muted font-semibold text-foreground'
                      : 'font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <Icon className={cn('size-[1.125rem] shrink-0', isActive && 'text-primary')} strokeWidth={isActive ? 2.25 : 2} />
                  {isCollapsed ? <span className="sr-only">{label}</span> : label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-0.5 border-t border-border p-3">
        <button
          onClick={toggle}
          className={cn(
            'flex h-10 w-full items-center gap-3 rounded-lg text-sm font-medium text-muted-foreground transition-colors duration-fast hover:bg-muted/60 hover:text-foreground',
            isCollapsed ? 'justify-center' : 'px-3'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="size-[1.125rem]" /> : <PanelLeftClose className="size-[1.125rem]" />}
          {!isCollapsed && 'Collapse'}
        </button>
        <Link
          href="/profile"
          className={cn(
            'flex h-12 items-center gap-3 rounded-lg transition-colors duration-fast hover:bg-muted/60',
            isCollapsed ? 'justify-center' : 'px-2'
          )}
          aria-label="Your profile"
        >
          <UserAvatar name={userName} avatarUrl={avatarUrl} />
          {!isCollapsed && <span className="truncate text-sm font-medium">{userName}</span>}
        </Link>
      </div>
    </aside>
  )
}
