'use client'

import Image from 'next/image'
import { User, Menu } from 'lucide-react'
import { useNavigationStore } from '@/stores/navigation-store'
import { cn } from '@/lib/utils'

interface TopAppBarProps {
  userName?: string
  avatarUrl?: string
  showHamburger?: boolean
}

export function TopAppBar({ userName, avatarUrl, showHamburger = true }: TopAppBarProps) {
  const { toggleSidebar } = useNavigationStore()

  return (
    <div className="sticky top-0 z-10 flex h-16 items-center bg-background/80 px-4 backdrop-blur-sm border-b border-border">
      <div className="flex shrink-0 items-center justify-start gap-3">
        {/* Hamburger button - only on desktop */}
        {showHamburger && (
          <button
            onClick={toggleSidebar}
            className={cn(
              'p-2 hover:bg-accent rounded-lg transition-colors',
              // Only show on desktop
              'hidden lg:flex items-center justify-center'
            )}
            aria-label="Toggle navigation menu"
          >
            <Menu className="size-5" />
          </button>
        )}

        <h2 className="text-lg font-bold leading-tight tracking-tight text-charcoal">
          MacroPlan
        </h2>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        {/* User Avatar */}
        <div className="flex size-10 items-center justify-center rounded-full bg-muted overflow-hidden relative">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={userName || 'User avatar'}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <User className="size-5 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}
