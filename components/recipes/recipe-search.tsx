'use client'

import { Search, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useState, useEffect, useRef } from 'react'
import { searchRecipes } from '@/app/actions/recipe-search'
import { Input } from '@/components/ui/input'

interface AutocompleteResult {
  id: string
  title: string
}

export function RecipeSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const isInitialMount = useRef(true)
  const lastSearchRef = useRef(initialSearch)
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
      searchRecipes({ q: debouncedAutocomplete, per_page: 5 })
        .then((response) => {
          if (response.success && response.data) {
            setAutocompleteResults(
              response.data.recipes.map(r => ({ id: r.id, title: r.title }))
            )
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
    // Skip initial mount to avoid resetting page on navigation
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Only update if search query actually changed
    if (debouncedSearch === lastSearchRef.current) {
      return
    }

    lastSearchRef.current = debouncedSearch

    const params = new URLSearchParams(searchParams.toString())

    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }

    params.delete('page') // Reset to page 1 on new search

    const newUrl = `/recipes?${params.toString()}`
    router.push(newUrl, { scroll: false })
  }, [debouncedSearch, router, searchParams])

  const handleSelectSuggestion = (suggestion: AutocompleteResult) => {
    setSearchQuery(suggestion.title)
    setShowAutocomplete(false)
    // Update the ref so the useEffect doesn't trigger another navigation
    lastSearchRef.current = suggestion.title
    // Search for the suggestion term
    const params = new URLSearchParams(searchParams.toString())
    params.set('search', suggestion.title)
    params.delete('page') // Reset to page 1
    router.push(`/recipes?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="px-4 py-2 relative">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10">
          <Search className="h-5 w-5 text-icon" />
        </div>
        <Input
          ref={inputRef}
          type="search"
          className="h-12 pl-12 pr-4"
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
