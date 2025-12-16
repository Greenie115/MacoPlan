'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

interface GeneratePlanCTAProps {
  hasActivePlan?: boolean
  onClick?: () => void
}

export function GeneratePlanCTA({
  hasActivePlan = false,
  onClick,
}: GeneratePlanCTAProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push('/meal-plans/generate')
    }
  }

  // If user has active plan, make this more subtle
  if (hasActivePlan) {
    return (
      <div className="p-4 md:p-5 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm md:text-base font-semibold text-foreground">
              Need a new plan?
            </p>
            <p className="text-sm text-muted-foreground">
              Generate a fresh macro-balanced meal plan
            </p>
          </div>
          <Button
            onClick={handleClick}
            variant="outline"
            className="font-semibold w-full sm:w-auto"
          >
            Generate
          </Button>
        </div>
      </div>
    )
  }

  // No active plan - show prominent CTA
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary p-5 md:p-6 text-white shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 flex-shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base md:text-lg font-bold leading-tight">
            Generate New Meal Plan
          </p>
          <p className="text-sm md:text-base font-normal leading-normal text-white/80">
            Create a new macro-perfect plan in 3 seconds
          </p>
        </div>
      </div>
      <button
        onClick={handleClick}
        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 md:h-12 px-5 bg-white text-primary text-sm md:text-base font-bold leading-normal hover:bg-white/90 transition-colors"
      >
        <span className="truncate">Generate Now →</span>
      </button>
    </div>
  )
}
