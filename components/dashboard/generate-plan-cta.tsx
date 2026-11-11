'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

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
      <div className="p-4 md:p-5 border border-dashed border-border-strong rounded-2xl bg-card">
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

  // No active plan: the one loud thing on the dashboard
  return (
    <div className="relative overflow-hidden rounded-2xl bg-charcoal p-6 text-white md:p-7">
      <div aria-hidden="true" className="premium-mesh" />
      <div className="relative">
        <h2 className="text-2xl font-bold">Plan this week&apos;s prep</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">
          3-4 batch recipes, a cooking timeline and one shopping list, built around your macros in about 3 seconds.
        </p>
        <Button onClick={handleClick} size="lg" className="mt-6 w-full sm:w-auto">
          Generate my plan
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
