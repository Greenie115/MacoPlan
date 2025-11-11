'use client'

import { useRouter } from 'next/navigation'
import { MealPlanCard } from './meal-plan-card'
import { cn } from '@/lib/utils'
import type { MealPlan } from '@/stores/dashboard-store'

interface RecentPlansCarouselProps {
  plans: MealPlan[]
}

export function RecentPlansCarousel({ plans }: RecentPlansCarouselProps) {
  const router = useRouter()

  if (plans.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted-foreground">No meal plans yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first plan to get started
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide md:px-6 lg:px-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex-shrink-0 w-[85%] snap-center md:w-[45%] lg:w-[30%]"
          >
            <MealPlanCard
              {...plan}
              onClick={() => router.push(`/plans/${plan.id}`)}
            />
          </div>
        ))}
      </div>

      {/* Scroll Indicators */}
      {plans.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {plans.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === 0 ? 'bg-primary w-4' : 'bg-muted'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
