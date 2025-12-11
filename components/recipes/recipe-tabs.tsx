'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export function RecipeTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'all'

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (tab === 'all') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }

    // Reset to first page when changing tabs
    params.delete('page')

    router.push(`/recipes?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex gap-2 px-4 pt-4 pb-2">
      <button
        onClick={() => setTab('all')}
        className={cn(
          'flex-1 h-10 rounded-lg font-semibold text-sm transition-colors',
          activeTab === 'all'
            ? 'bg-primary text-white'
            : 'bg-card text-muted-foreground border-2 border-border hover:bg-muted'
        )}
      >
        All Recipes
      </button>
      <button
        onClick={() => setTab('favorites')}
        className={cn(
          'flex-1 h-10 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2',
          activeTab === 'favorites'
            ? 'bg-primary text-white'
            : 'bg-card text-muted-foreground border-2 border-border hover:bg-muted'
        )}
      >
        <span>❤️</span>
        Favorites
      </button>
    </div>
  )
}
