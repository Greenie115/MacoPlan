'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Search, Heart } from 'lucide-react'

export function RecipeTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Default to 'popular' instead of 'all'
  const activeTab = searchParams.get('tab') || 'popular'

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (tab === 'popular') {
      // 'popular' is the default, so remove tab param
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
            value="popular"
            className="flex-1 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            Popular
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="flex-1 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none gap-1.5"
          >
            <Search className="w-4 h-4" />
            All Recipes
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="flex-1 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none gap-1.5"
          >
            <Heart className="w-4 h-4" />
            Favorites
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
