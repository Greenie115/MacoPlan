'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MealPlanCard } from './meal-plan-card'
import { cn } from '@/lib/utils'
import type { MealPlan } from '@/stores/dashboard-store'

interface RecentPlansCarouselProps {
  plans: MealPlan[]
}

export function RecentPlansCarousel({ plans }: RecentPlansCarouselProps) {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // Check scroll position to show/hide arrows and update active index
  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container

    // Show arrows based on scroll position
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)

    // Calculate active index based on scroll position
    const cardWidth = container.firstElementChild?.clientWidth || 280
    const gap = 16 // gap-4 = 16px
    const newIndex = Math.round(scrollLeft / (cardWidth + gap))
    setActiveIndex(Math.min(newIndex, plans.length - 1))
  }, [plans.length])

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
  }, [plans.length, checkScroll])

  // Scroll to specific index
  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current
    if (!container) return

    const cardWidth = container.firstElementChild?.clientWidth || 280
    const gap = 16
    container.scrollTo({
      left: index * (cardWidth + gap),
      behavior: 'smooth',
    })
  }

  // Scroll by one card
  const scrollBy = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left'
      ? Math.max(0, activeIndex - 1)
      : Math.min(plans.length - 1, activeIndex + 1)
    scrollToIndex(newIndex)
  }

  if (plans.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No meal plans yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first plan to get started
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Left Arrow Button - Desktop only */}
      {showLeftArrow && (
        <button
          onClick={() => scrollBy('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border-strong shadow-md hover:bg-accent transition-colors -ml-2"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      )}

      {/* Right Arrow Button - Desktop only */}
      {showRightArrow && (
        <button
          onClick={() => scrollBy('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border-strong shadow-md hover:bg-accent transition-colors -mr-2"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      )}

      {/* Left gradient indicator - Mobile */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-4 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none md:hidden" />
      )}

      {/* Right gradient indicator - Mobile */}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-4 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none md:hidden" />
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {plans.map((plan) => (
          <MealPlanCard
            key={plan.id}
            {...plan}
            onClick={() => router.push(`/meal-plans/${plan.id}`)}
            className="w-[280px] min-w-[280px] flex-shrink-0 snap-start shadow-sm hover:shadow-md transition-shadow"
          />
        ))}
      </div>

      {/* Scroll Indicators - Clickable dots */}
      {plans.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {plans.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === activeIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted w-2 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to plan ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
