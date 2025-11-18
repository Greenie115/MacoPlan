'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { MealPlanCard } from './meal-plan-card'
import { cn } from '@/lib/utils'
import type { MealPlan } from '@/stores/dashboard-store'

interface RecentPlansCarouselProps {
  plans: MealPlan[]
}

export function RecentPlansCarousel({ plans }: RecentPlansCarouselProps) {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftGradient, setShowLeftGradient] = useState(false)
  const [showRightGradient, setShowRightGradient] = useState(false)

  // Check scroll position to show/hide gradients
  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container

    // Show left gradient if scrolled past start
    setShowLeftGradient(scrollLeft > 10)

    // Show right gradient if not at end
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()

    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      container.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [plans.length])

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
      {/* Left gradient indicator */}
      {showLeftGradient && (
        <div className="absolute left-0 top-0 bottom-4 w-8 md:w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      )}

      {/* Right gradient indicator */}
      {showRightGradient && (
        <div className="absolute right-0 top-0 bottom-4 w-8 md:w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide scroll-smooth md:px-6 lg:px-8"
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex-shrink-0 w-[300px] snap-center sm:w-[340px] md:w-[360px] lg:w-[380px]"
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
