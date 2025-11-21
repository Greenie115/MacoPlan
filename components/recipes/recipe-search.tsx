'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useState, useEffect } from 'react'

export function RecipeSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }

    const newUrl = `/recipes?${params.toString()}`
    const currentUrl = `/recipes?${searchParams.toString()}`

    // Only push if URL actually changed (prevents infinite loop)
    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false })
    }
  }, [debouncedSearch, router, searchParams])

  return (
    <div className="px-4 py-2">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="search"
          className="block w-full h-12 rounded-xl border border-gray-300 py-2 pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  )
}
