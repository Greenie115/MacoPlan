'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, activePath } from './nav-items'

export function BottomNav() {
  const current = activePath(usePathname())

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-strong bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-4">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const isActive = current === path
          return (
            <Link
              key={path}
              href={path}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 text-[0.6875rem] transition-colors duration-fast',
                isActive ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden="true" />}
              <Icon className={cn('size-5', isActive && 'text-primary')} strokeWidth={isActive ? 2.25 : 2} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
