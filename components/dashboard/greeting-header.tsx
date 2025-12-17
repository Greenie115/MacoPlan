'use client'

import { useGreeting } from '@/lib/hooks/use-greeting'

interface GreetingHeaderProps {
  userName?: string
}

export function GreetingHeader({ userName }: GreetingHeaderProps) {
  const greeting = useGreeting(userName)

  return (
    <div className="pb-2">
      <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em] text-foreground">
        {greeting} 👋
      </h1>
    </div>
  )
}
