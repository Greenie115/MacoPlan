'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, ChefHat } from 'lucide-react'

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
      router.push('/plans/generate')
    }
  }

  // If user has active plan, make this more subtle
  if (hasActivePlan) {
    return (
      <div className="px-4 md:px-6 lg:px-8">
        <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-charcoal">
                Need a new plan?
              </p>
              <p className="text-sm text-muted-foreground">
                Generate a fresh macro-balanced meal plan
              </p>
            </div>
            <Button
              onClick={handleClick}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white font-medium"
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
    <div className="px-4 md:px-6 lg:px-8">
      <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-5 text-white space-y-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <ChefHat className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold leading-tight">
              Generate Your First Meal Plan
            </p>
            <p className="text-sm font-normal leading-normal text-white/90 mt-1">
              AI-powered plans tailored to your macros
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleClick}
            className="flex-1 bg-white text-primary hover:bg-white/90 font-bold"
            size="lg"
          >
            Get Started
          </Button>
          <Button
            onClick={() => router.push('/plans/learn-more')}
            variant="ghost"
            className="text-white hover:bg-white/20 font-medium"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}
