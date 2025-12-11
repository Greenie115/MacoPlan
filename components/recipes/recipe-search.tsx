'use client'

import { Search, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useState, useEffect, useRef } from 'react'
import { autocompleteRecipes } from '@/app/actions/spoonacular-recipes'

interface AutocompleteResult {
  id: number
  title: string
  imageType: string
}

export function RecipeSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )
  const [autocompleteResults, setAutocompleteResults] = useState<
    AutocompleteResult[]
  >([])
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Increased debounce times for cost optimization
  const debouncedSearch = useDebounce(searchQuery, 600) // Search: 600ms
  const debouncedAutocomplete = useDebounce(searchQuery, 300) // Autocomplete: 300ms

  // Fetch autocomplete suggestions (only for 3+ characters)
  useEffect(() => {
    if (debouncedAutocomplete.length >= 3 && showAutocomplete) {
      setIsLoadingAutocomplete(true)
      autocompleteRecipes(debouncedAutocomplete)
        .then((response) => {
          if (response.success && response.data) {
            setAutocompleteResults(response.data)
          }
          setIsLoadingAutocomplete(false)
        })
        .catch((error) => {
          console.error('Autocomplete error:', error)
          setIsLoadingAutocomplete(false)
        })
    } else {
      setAutocompleteResults([])
    }
  }, [debouncedAutocomplete, showAutocomplete])

  // Update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }

    params.delete('page') // Reset to page 1 on new search

    const newUrl = `/recipes?${params.toString()}`
    const currentUrl = `/recipes?${searchParams.toString()}`

    // Only push if URL actually changed (prevents infinite loop)
    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false })
    }
  }, [debouncedSearch, router, searchParams])

  const handleSelectSuggestion = (suggestion: AutocompleteResult) => {
    setSearchQuery(suggestion.title)
    setShowAutocomplete(false)
    // Navigate to Spoonacular recipe detail page
    router.push(`/recipes/spoonacular/${suggestion.id}`)
  }

  return (
    <div className="px-4 py-2 relative">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-icon" />
        </div>
        <input
          ref={inputRef}
          type="search"
          className="block w-full h-12 rounded-xl border border-border py-2 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 bg-card"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowAutocomplete(true)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
        />
      </div>

      {/* Autocomplete Dropdown */}
      {showAutocomplete && searchQuery.length >= 3 && (
        <div className="absolute left-4 right-4 top-16 bg-card border border-border-strong rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {isLoadingAutocomplete ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading suggestions...
              </span>
            </div>
          ) : autocompleteResults.length > 0 ? (
            <ul>
              {autocompleteResults.map((result) => (
                <li
                  key={result.id}
                  className="px-4 py-3 hover:bg-muted cursor-pointer transition-colors border-b border-border last:border-b-0"
                  onMouseDown={() => handleSelectSuggestion(result)}
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-icon flex-shrink-0" />
                    <span className="text-sm text-foreground">{result.title}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
