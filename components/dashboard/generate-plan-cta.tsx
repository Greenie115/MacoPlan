'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface GeneratePlanCTAProps {
  onClick?: () => void
}

export function GeneratePlanCTA({ onClick }: GeneratePlanCTAProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push('/plans/generate')
    }
  }

  return (
    <div className="px-4 md:px-6 lg:px-8">
      <div className="rounded-xl bg-primary p-5 text-white space-y-4">
        <div className="space-y-1">
          <p className="text-base font-bold leading-tight">
            ✨ Generate New Meal Plan
          </p>
          <p className="text-base font-normal leading-normal text-white/80">
            Create a new macro-perfect plan in 3 seconds
          </p>
        </div>

        <Button
          onClick={handleClick}
          className="w-full bg-white text-primary hover:bg-white/90 font-bold sm:w-auto"
          aria-label="Generate new meal plan"
        >
          Generate Now →
        </Button>
      </div>
    </div>
  )
}
