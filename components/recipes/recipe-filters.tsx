'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RECIPE_LIMITS, RECIPE_SORTS, RECIPE_TAGS } from '@/lib/utils/filter-validation'

const TABS = [
  ['all', 'All recipes'],
  ['popular', 'Popular'],
  ['favorites', 'Favorites'],
] as const

const KEYS = ['tab', 'search', 'tags', 'sort', ...RECIPE_LIMITS.map((l) => l.key)] as const
const DEFAULTS: Record<string, string> = { tab: 'all', sort: 'prep' }

/**
 * Search, tabs, tags, per-serving limits and sort for /recipes. The URL is the
 * source of truth for the results; this holds the in-progress values and
 * writes them to the URL shortly after the last change, so there is no Apply
 * button and typing never loses focus.
 */
export function RecipeFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<Record<string, string>>(() =>
    Object.fromEntries(KEYS.map((k) => [k, searchParams.get(k) ?? DEFAULTS[k] ?? '']))
  )
  const set = (key: string, value: string) => setState((s) => ({ ...s, [key]: value }))

  const tags = state.tags ? state.tags.split(',') : []
  const active = tags.length + ['search', ...RECIPE_LIMITS.map((l) => l.key)].filter((k) => state[k].trim()).length

  const query = new URLSearchParams(
    KEYS.flatMap((k) => (state[k].trim() && state[k] !== DEFAULTS[k] ? [[k, state[k].trim()]] : []))
  ).toString()
  const current = searchParams.toString()

  useEffect(() => {
    if (query === current) return
    const timer = setTimeout(() => router.replace(query ? `/recipes?${query}` : '/recipes', { scroll: false }), 300)
    return () => clearTimeout(timer)
  }, [query, current, router])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pt-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">Recipes</h1>

      <div role="tablist" className="flex gap-6 border-b border-border-strong">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={state.tab === value}
            onClick={() => set('tab', value)}
            className={cn(
              '-mb-px border-b-2 py-2.5 text-sm font-medium transition-colors duration-fast',
              state.tab === value
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <label className="relative min-w-0 flex-[1_1_15rem]">
          <span className="sr-only">Search recipes</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={state.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search recipes"
            className="h-11 w-full rounded-xl border border-border-strong bg-card pl-10 pr-4 text-base shadow-xs placeholder:text-muted-foreground md:text-sm"
          />
        </label>
        <select
          aria-label="Sort recipes"
          value={state.sort}
          onChange={(e) => set('sort', e.target.value)}
          className="h-11 min-w-0 flex-[0_1_14rem] cursor-pointer rounded-xl border border-border-strong bg-card px-3.5 text-sm font-medium shadow-xs"
        >
          {Object.entries(RECIPE_SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {RECIPE_TAGS.map(({ value, label }) => {
          const on = tags.includes(value)
          return (
            <button
              key={value}
              aria-pressed={on}
              onClick={() => set('tags', (on ? tags.filter((t) => t !== value) : [...tags, value]).join(','))}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-[background-color,border-color,transform] duration-fast active:scale-[0.97]',
                on
                  ? 'border-coral-200 bg-coral-50 text-coral-700 dark:border-coral-800 dark:bg-coral-950 dark:text-coral-300'
                  : 'border-border-strong bg-card hover:border-muted-foreground'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-muted-foreground">
        <span>Per serving</span>
        {RECIPE_LIMITS.map(({ key, label, unit, max }) => (
          <label key={key} className="flex items-center gap-2">
            {label}
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={max}
              value={state[key]}
              onChange={(e) => set(key, e.target.value)}
              className="h-9 w-20 rounded-lg border border-border-strong bg-card px-2.5 font-mono text-sm tabular-nums text-foreground"
            />
            <span className="font-mono text-xs">{unit}</span>
          </label>
        ))}
        {active > 0 && (
          <button
            onClick={() => setState((s) => ({ ...DEFAULTS, ...Object.fromEntries(KEYS.map((k) => [k, ''])), tab: s.tab, sort: s.sort }))}
            className="ml-auto font-medium text-coral-700 hover:underline dark:text-coral-300"
          >
            Clear {active} filter{active > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  )
}
