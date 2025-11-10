'use client'

import { useRouter } from 'next/navigation'
import { MealPlanCard } from './meal-plan-card'
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
    <div className="relative w-full overflow-hidden">
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide md:px-6 lg:px-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex-shrink-0 w-[75%] snap-center md:w-[45%] lg:w-[30%]"
          >
            <MealPlanCard
              {...plan}
              onClick={() => router.push(`/plans/${plan.id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
