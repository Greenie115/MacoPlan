'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
    <div className="px-4 pt-4 pb-2">
      <Tabs value={activeTab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full h-12 p-1 bg-muted rounded-xl">
          <TabsTrigger
            value="all"
            className="flex-1 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
          >
            All Recipes
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="flex-1 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none gap-2"
          >
            <span>❤️</span>
            Favorites
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
