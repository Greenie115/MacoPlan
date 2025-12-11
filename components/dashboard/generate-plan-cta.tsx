'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChefHat } from 'lucide-react'

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
      <div className="px-4 md:px-6 lg:px-8">
        <div className="p-4 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Need a new plan?
              </p>
              <p className="text-sm text-muted-foreground">
                Generate a fresh macro-balanced meal plan
              </p>
            </div>
            <Button
              onClick={handleClick}
              variant="outline"
              className="font-semibold"
            >
              Generate
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // No active plan - show prominent CTA
  return (
    <div className="px-4 pb-4">
      <div className="flex flex-1 flex-col items-start justify-between gap-4 rounded-2xl bg-primary p-5 text-white shadow-lg">
        <div className="flex flex-col gap-1">
          <p className="text-base font-bold leading-tight">✨ Generate New Meal Plan</p>
          <p className="text-base font-normal leading-normal text-white/80">
            Create a new macro-perfect plan in 3 seconds
          </p>
        </div>
        <button
          onClick={handleClick}
          className="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-5 bg-white text-primary text-sm font-bold leading-normal hover:bg-white/90 transition-colors"
        >
          <span className="truncate">Generate Now →</span>
        </button>
      </div>
    </div>
  )
}
