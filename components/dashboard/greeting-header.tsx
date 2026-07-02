'use client'

import { useGreeting } from '@/lib/hooks/use-greeting'
import { getGreetingSubline } from '@/lib/utils/time-utils'

interface GreetingHeaderProps {
  userName?: string
  /** Today's protein progress — subline renders only when provided */
  proteinTarget?: number
  proteinEaten?: number
  mealsLogged?: number
}

export function GreetingHeader({
  userName,
  proteinTarget,
  proteinEaten,
  mealsLogged,
}: GreetingHeaderProps) {
  const greeting = useGreeting(userName)

  const subline =
    proteinTarget !== undefined
      ? getGreetingSubline(proteinTarget, proteinEaten ?? 0, mealsLogged ?? 0)
      : null

  return (
    <div className="pb-2">
      <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em] text-foreground">
        {greeting} 👋
      </h1>
      {subline && (
        <p className="mt-1 text-sm text-muted-foreground animate-in fade-in duration-500">
          {subline}
        </p>
      )}
    </div>
  )
}
