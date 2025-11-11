'use client'

import { useGreeting } from '@/lib/hooks/use-greeting'
import { typography } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

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

  return (
    <div className="px-4 pt-2 pb-4 md:px-6 lg:px-8">
      <h1 className={cn(typography.h1, 'text-charcoal')}>{greeting}</h1>
      <p className="text-base text-muted-foreground mt-1 font-medium">
        {getContextMessage()}
      </p>
    </div>
  )
}
