'use client'

import { useGreeting } from '@/lib/hooks/use-greeting'

interface GreetingHeaderProps {
  userName?: string
}

export function GreetingHeader({ userName }: GreetingHeaderProps) {
  const greeting = useGreeting(userName)

  return (
    <h1 className="text-xl font-bold leading-tight tracking-tight text-charcoal px-4 pt-2 pb-4">
      {greeting} 👋
    </h1>
  )
}
