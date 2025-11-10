'use client'

import Image from 'next/image'
import { User } from 'lucide-react'

interface TopAppBarProps {
  userName?: string
  avatarUrl?: string
}

export function TopAppBar({ userName, avatarUrl }: TopAppBarProps) {
  return (
    <div className="sticky top-0 z-10 flex h-16 items-center bg-background/80 px-4 backdrop-blur-sm border-b border-border">
      <div className="flex shrink-0 items-center justify-start">
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
