'use client'

import { useGreeting } from '@/lib/hooks/use-greeting'

interface GreetingHeaderProps {
  userName?: string
  currentStreak?: number
  currentGoal?: 'bulk' | 'cut' | 'maintain' | 'recomp'
  activePlanName?: string
  activePlanDay?: number
  activePlanTotalDays?: number
}

export function GreetingHeader({
  userName,
  currentStreak = 0,
  currentGoal,
  activePlanName,
  activePlanDay,
  activePlanTotalDays,
}: GreetingHeaderProps) {
  const greeting = useGreeting(userName)

  // Generate context message
  const getContextMessage = () => {
    if (activePlanName && activePlanDay && activePlanTotalDays) {
      return `Day ${activePlanDay} of ${activePlanName}`
    }

    if (currentGoal) {
      const goalText = {
        bulk: 'your bulk',
        cut: 'your cut',
        maintain: 'maintenance',
        recomp: 'your recomp',
      }[currentGoal]
      return `Week ${Math.ceil(currentStreak / 7)} of ${goalText}`
    }

    if (currentStreak >= 7) {
      return `${currentStreak}-day streak 🔥`
    }

    return "Let's crush your goals today"
  }

  const contextMessage = getContextMessage()

  return (
    <div className="pb-2">
      <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em] text-foreground">
        {greeting} 👋
      </h1>
      <p className="text-sm md:text-base text-muted-foreground mt-1">
        {contextMessage}
      </p>
    </div>
  )
}
