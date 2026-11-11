/**
 * Recipe browse filters: the URL contract (`/recipes?tags=…&minProtein=…`),
 * parsed and clamped in one place so the page, the filter bar and the query
 * all agree. Every filter narrows the list (AND).
 */

/** Each tag is one PostgREST condition on the recipes row. */
export const RECIPE_TAGS = [
  { value: 'high-protein', label: 'High protein', condition: 'protein_grams.gte.30' },
  { value: 'low-carb', label: 'Low carb', condition: 'carb_grams.lte.20' },
  { value: 'meal-prep', label: 'Meal-prep friendly', condition: 'batch_prep_score.gte.4' },
  { value: 'vegetarian', label: 'Vegetarian', condition: 'dietary_flags.cs.{vegetarian}' },
  { value: 'vegan', label: 'Vegan', condition: 'dietary_flags.cs.{vegan}' },
  { value: 'gluten-free', label: 'Gluten-free', condition: 'dietary_flags.cs.{gluten-free}' },
  { value: 'dairy-free', label: 'Dairy-free', condition: 'dietary_flags.cs.{dairy-free}' },
  { value: 'keto', label: 'Keto', condition: 'dietary_flags.cs.{keto}' },
  { value: 'paleo', label: 'Paleo', condition: 'dietary_flags.cs.{paleo}' },
] as const

export const RECIPE_SORTS = {
  prep: 'Best for meal prep',
  protein: 'Protein, high to low',
  caloriesAsc: 'Calories, low to high',
  caloriesDesc: 'Calories, high to low',
  fastest: 'Fastest to cook',
} as const

export type RecipeSort = keyof typeof RECIPE_SORTS

/** Per-serving limits: URL param, label, unit and upper clamp. */
export const RECIPE_LIMITS = [
  { key: 'minProtein', label: 'Protein at least', unit: 'g', max: 300 },
  { key: 'maxCalories', label: 'Calories up to', unit: 'kcal', max: 3000 },
  { key: 'maxCarbs', label: 'Carbs up to', unit: 'g', max: 500 },
  { key: 'maxTime', label: 'Ready in', unit: 'min', max: 480 },
] as const

type LimitKey = (typeof RECIPE_LIMITS)[number]['key']

export type RecipeFilterParams = Partial<Record<'search' | 'tags' | 'sort' | 'tab' | LimitKey, string>>

export type RecipeFilters = Partial<Record<LimitKey, number>> & {
  q?: string
  tags: string[]
  sort: RecipeSort
}

export function parseRecipeFilters(params: RecipeFilterParams): RecipeFilters {
  // Drop characters that are wildcards in ILIKE or markup; cap the length.
  const q = params.search?.replace(/[<>%_]/g, '').trim().slice(0, 100)
  const filters: RecipeFilters = {
    q: q || undefined,
    tags: (params.tags ?? '').split(',').filter((t) => RECIPE_TAGS.some((tag) => tag.value === t)),
    sort: params.sort && params.sort in RECIPE_SORTS ? (params.sort as RecipeSort) : 'prep',
  }
  for (const { key, max } of RECIPE_LIMITS) {
    const n = parseInt(params[key] ?? '', 10)
    if (!isNaN(n)) filters[key] = Math.max(0, Math.min(max, n))
  }
  return filters
}

/** True when anything narrows the list (sort alone does not). */
export function hasActiveFilters(filters: RecipeFilters): boolean {
  return Boolean(filters.q) || filters.tags.length > 0 || RECIPE_LIMITS.some(({ key }) => filters[key] !== undefined)
}
