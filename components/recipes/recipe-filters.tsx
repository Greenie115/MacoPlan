'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { RecipeFilterTag } from '@/lib/types/recipe'
import { cn } from '@/lib/utils'

const FILTER_OPTIONS: { id: RecipeFilterTag; label: string }[] = [
  { id: 'high-protein', label: 'High-Protein' },
  { id: 'low-carb', label: 'Low-Carb' },
  { id: 'quick', label: 'Quick' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
]

export function RecipeFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeFilters =
    searchParams.get('filters')?.split(',').filter(Boolean) || []

  const toggleFilter = (filterId: RecipeFilterTag) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentFilters =
      params.get('filters')?.split(',').filter(Boolean) || []

    let newFilters: string[]
    if (currentFilters.includes(filterId)) {
      // Remove filter
      newFilters = currentFilters.filter((f) => f !== filterId)
    } else {
      // Add filter
      newFilters = [...currentFilters, filterId]
    }

    if (newFilters.length > 0) {
      params.set('filters', newFilters.join(','))
    } else {
      params.delete('filters')
    }

    router.push(`/recipes?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="px-4 pt-2 pb-4">
      {/* Scrollable filter buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {FILTER_OPTIONS.map((filter) => {
          const isActive = activeFilters.includes(filter.id)

          return (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={cn(
                'flex h-12 shrink-0 cursor-pointer items-center justify-center gap-x-2 rounded-xl px-4 transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary text-white'
                  : 'border-2 border-primary bg-white text-primary hover:bg-primary/10'
              )}
            >
              <p className="text-base font-semibold leading-normal">
                {filter.label}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
