'use client'

import Image from 'next/image'
import Link from 'next/link'
import { User, Bell } from 'lucide-react'

interface TopAppBarProps {
  userName?: string
  avatarUrl?: string | null
}

export function TopAppBar({ userName, avatarUrl }: TopAppBarProps) {
  return (
    <div className="sticky top-0 z-10 flex h-16 items-center bg-background px-4">
      <div className="flex shrink-0 items-center justify-start">
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-foreground">
          Macro Plan
        </h2>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-icon hover:bg-accent transition-colors">
          <Bell className="size-5" />
        </button>
        {/* User Avatar - Link to Profile */}
        <Link
          href="/profile"
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 relative overflow-hidden border-2 border-border-strong"
          aria-label="Go to profile"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={userName || 'User avatar'}
              fill
              className="object-cover"
              sizes="36px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent text-icon">
              <User className="size-5" />
            </div>
          )}
        </Link>
      </div>
    </div>
  )
}
