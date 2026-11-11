/**
 * Free batch-prep builder: no model call. Picks recipes from the self-hosted
 * library with plain filters and text matching, then sizes each portion with
 * simple arithmetic so both day types land on the macro targets.
 *
 * `pickRecipes` and `buildPlan` are pure; `generatePlanFromLibrary` does
 * the Supabase reads around it.
 */
import { createClient } from '@/lib/supabase/server'
import {
  BatchPrepPlanSchema,
  BatchPrepValidationError,
  type BatchPrepPlan,
  type DietaryPreferences,
  type Equipment,
  type Macros,
  type Meal,
  type MealSlot,
  type TrainingProfile,
} from '@/lib/types/batch-prep'

export interface LibraryRecipe {
  id: string
  name: string
  calories: number
  protein_grams: number
  carb_grams: number
  fat_grams: number
  cuisine: string | null
  total_time_minutes: number | null
  servings: number
  storage_fridge_days: number | null
}

export interface RecipeDetails {
  ingredients: string[]
  instructions: string[]
}

const COLUMNS =
  'id, name, calories, protein_grams, carb_grams, fat_grams, cuisine, total_time_minutes, servings, storage_fridge_days'

// Same meals-per-day meaning the form's "meal variety" has always had.
const SLOTS: Record<string, MealSlot[]> = {
  low: ['breakfast', 'lunch', 'dinner'],
  medium: ['breakfast', 'lunch', 'dinner', 'snack'],
  high: ['breakfast', 'lunch', 'dinner', 'snack', 'snack', 'snack'],
}
const PORTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5]
const BREAKFAST = /breakfast|oat|egg|omelet|frittata|pancake|waffle|granola|yogurt|quiche|hash/i
const ASIAN = /thai|korean|japanese|chinese|vietnamese/i
const DIET_FLAGS = ['vegetarian', 'vegan', 'keto', 'paleo', 'gluten-free', 'dairy-free']
const MEATS = ['chicken', 'beef', 'pork', 'turkey', 'bacon', 'sausage', 'ham', 'lamb', 'steak']

const macrosOf = (r: LibraryRecipe, portion: number): Macros => ({
  calories: Math.round(r.calories * portion),
  protein_g: Math.round(r.protein_grams * portion),
  carbs_g: Math.round(r.carb_grams * portion),
  fat_g: Math.round(r.fat_grams * portion),
})

const sum = (list: Macros[]): Macros =>
  list.reduce(
    (a, m) => ({
      calories: a.calories + m.calories,
      protein_g: a.protein_g + m.protein_g,
      carbs_g: a.carbs_g + m.carbs_g,
      fat_g: a.fat_g + m.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

/** Relative miss against the target; calories and protein count double. */
function miss(actual: Macros, target: Macros): number {
  const off = (k: keyof Macros) => Math.abs(actual[k] - target[k]) / Math.max(target[k], 1)
  return 2 * off('calories') + 2 * off('protein_g') + off('carbs_g') + off('fat_g')
}

/** Best portion per recipe for one day's target (coordinate descent over PORTIONS). */
function fitPortions(recipes: LibraryRecipe[], target: Macros): { portions: number[]; miss: number } {
  const portions = recipes.map(() => 1)
  const score = () => miss(sum(recipes.map((r, i) => macrosOf(r, portions[i]))), target)
  let best = score()
  for (let round = 0; round < 4; round++) {
    for (let i = 0; i < recipes.length; i++) {
      for (const p of PORTIONS) {
        const previous = portions[i]
        portions[i] = p
        const s = score()
        if (s < best) best = s
        else portions[i] = previous
      }
    }
  }
  return { portions, miss: best }
}

function matchesCuisine(r: LibraryRecipe, wanted: string): boolean {
  const hay = `${r.cuisine ?? ''} ${r.name}`.toLowerCase()
  const words = wanted.toLowerCase().split(/[\s/-]+/).filter((w) => w.length > 2)
  return words.some((w) => hay.includes(w)) || (ASIAN.test(wanted) && r.cuisine === 'asian')
}

/** Use the preferred subset when it leaves enough choice, else everything. */
const prefer = <T>(list: T[], test: (item: T) => boolean): T[] => {
  const hits = list.filter(test)
  return hits.length >= 3 ? hits : list
}

/** Choose one recipe per meal slot and the portions that best hit both day targets. */
export function pickRecipes(
  pool: LibraryRecipe[],
  profile: TrainingProfile,
  preferences: DietaryPreferences,
  avoidNames: string[] = []
) {
  const slots = SLOTS[preferences.meal_variety ?? 'medium']
  if (pool.length < slots.length) {
    throw new BatchPrepValidationError(`Only ${pool.length} library recipes match; ${slots.length} are needed.`)
  }

  const avoid = new Set(avoidNames.map((n) => n.toLowerCase()))
  const fresh = prefer(pool, (r) => !avoid.has(r.name.toLowerCase()))
  const slotPools = slots.map((slot) => {
    const cuisine = preferences.meal_cuisines?.[slot]
    let list = slot === 'breakfast' ? prefer(fresh, (r) => BREAKFAST.test(r.name)) : fresh
    if (cuisine) list = prefer(list, (r) => matchesCuisine(r, cuisine))
    return list
  })

  let best: { recipes: LibraryRecipe[]; training: number[]; rest: number[]; miss: number } | null = null
  for (let attempt = 0; attempt < 400; attempt++) {
    const recipes: LibraryRecipe[] = []
    for (const list of slotPools) {
      // Fall back to the whole pool when a slot's shortlist is used up.
      const open = [list, pool].map((l) => l.filter((r) => !recipes.includes(r))).find((l) => l.length > 0)!
      recipes.push(open[Math.floor(Math.random() * open.length)])
    }
    const training = fitPortions(recipes, profile.training_day_macros)
    const rest = fitPortions(recipes, profile.rest_day_macros)
    const total = training.miss + rest.miss
    if (!best || total < best.miss) {
      best = { recipes, training: training.portions, rest: rest.portions, miss: total }
    }
  }
  return { slots, ...best! }
}

function equipmentFor(text: string): Equipment {
  if (/oven|bake|roast|broil|sheet pan|casserole/i.test(text)) return 'oven'
  if (/rice cooker/i.test(text)) return 'rice_cooker'
  if (/slow cooker|crock|instant pot|no.cook|overnight/i.test(text)) return 'none'
  return 'stovetop'
}

const clock = (mins: number) => `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`

/** Turn the picked recipes into the plan shape the rest of the app consumes. */
export function buildPlan(
  { slots, recipes, training, rest }: ReturnType<typeof pickRecipes>,
  details: Record<string, RecipeDetails>,
  profile: TrainingProfile
): BatchPrepPlan {

  // One container per portion: training days first, then rest days, cycling
  // through the day's meals until the week's containers are used up.
  const dayTypes = Array.from({ length: 7 }, (_, d) =>
    d < profile.training_days_per_week ? ('training' as const) : ('rest' as const)
  )
  const container_assignments = Array.from({ length: profile.containers_per_week }, (_, n) => {
    const i = n % slots.length
    return {
      container_num: n + 1,
      day_type: dayTypes[Math.floor(n / slots.length) % 7],
      meal_slot: slots[i],
      recipe_name: recipes[i].name,
    }
  })

  const batchNotes = recipes.map((r, i) => {
    const mine = container_assignments.filter((c) => (c.container_num - 1) % slots.length === i)
    const servings = mine.reduce((t, c) => t + (c.day_type === 'training' ? training[i] : rest[i]), 0)
    const batches = Math.max(1, Math.ceil(servings / Math.max(r.servings, 1)))
    return { containers: Math.max(mine.length, 1), batches }
  })

  const day = (portions: number[]) => {
    const meals: Meal[] = recipes.map((r, i) => {
      const d = details[r.id]
      const { batches, containers } = batchNotes[i]
      return {
        name: r.name,
        meal_slot: slots[i],
        ingredients: d.ingredients.map((name) => ({ name })),
        cooking_instructions: [
          `Cook ${batches === 1 ? 'one batch' : `${batches} batches`} (one batch makes ${r.servings} servings).`,
          ...d.instructions,
          `Portion ${portions[i]} serving${portions[i] === 1 ? '' : 's'} into each container.`,
        ],
        total_macros: macrosOf(r, portions[i]),
        equipment: equipmentFor(`${r.name} ${d.instructions.join(' ')}`),
        servings_to_prep: containers,
        storage_days: Math.min(7, Math.max(1, r.storage_fridge_days ?? 4)),
        prep_time_mins: r.total_time_minutes ?? undefined,
      }
    })
    return { meals, daily_totals: sum(meals.map((m) => m.total_macros)) }
  }
  const training_day = day(training)
  const rest_day = day(rest)

  // Longest cook goes on first; start the next recipe every 10 minutes.
  const order = recipes
    .map((r, i) => ({ r, meal: training_day.meals[i], duration: r.total_time_minutes ?? 30 }))
    .sort((a, b) => b.duration - a.duration)
  const finish = Math.max(...order.map((o, n) => n * 10 + o.duration))
  const prep_timeline = [
    ...order.map((o, n) => ({
      step: n + 1,
      time: clock(n * 10),
      action: `Start ${o.r.name}`,
      duration_mins: o.duration,
      equipment: o.meal.equipment,
    })),
    {
      step: order.length + 1,
      time: clock(finish),
      action: `Portion everything into ${profile.containers_per_week} containers`,
      duration_mins: 15,
      equipment: 'none' as const,
    },
  ]

  return BatchPrepPlanSchema.parse({
    training_day,
    rest_day,
    prep_timeline,
    shopping_list: recipes.flatMap((r, i) =>
      details[r.id].ingredients.map((ingredient) => ({
        ingredient,
        category: batchNotes[i].batches > 1 ? `${r.name} (x${batchNotes[i].batches})` : r.name,
      }))
    ),
    container_assignments,
    total_containers: profile.containers_per_week,
    estimated_prep_time_mins: finish + 15,
  })
}

export async function generatePlanFromLibrary(
  profile: TrainingProfile,
  preferences: DietaryPreferences,
  avoidNames: string[] = []
): Promise<BatchPrepPlan> {
  const supabase = await createClient()
  const diet = preferences.diet_type?.toLowerCase().replace(/\s+/g, '-') ?? ''
  const banned = [...preferences.exclusions, ...(diet === 'pescatarian' ? MEATS : [])]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  const allowed = (text: string) => !banned.some((b) => text.toLowerCase().includes(b))

  // ponytail: best 1000 by prep score; add a random window if the library outgrows that.
  let query = supabase
    .from('recipes')
    .select(COLUMNS)
    .gt('calories', 0)
    .or(`total_time_minutes.is.null,total_time_minutes.lte.${profile.max_prep_time_mins}`)
    .order('batch_prep_score', { ascending: false, nullsFirst: false })
    .limit(1000)
  if (DIET_FLAGS.includes(diet)) query = query.contains('dietary_flags', [diet])

  const { data, error } = await query
  if (error) throw new Error('Could not read the recipe library')
  let pool = ((data ?? []) as LibraryRecipe[]).filter((r) => allowed(r.name))

  // Ingredients are only loaded for the picked recipes, so a pick that turns
  // out to contain an excluded ingredient (or has no method) is dropped and
  // the pick is repeated.
  for (let attempt = 0; attempt < 6; attempt++) {
    const pick = pickRecipes(pool, profile, preferences, avoidNames)
    const picked = pick.recipes
    const ids = picked.map((r) => r.id)
    const [ingredients, instructions] = await Promise.all([
      supabase.from('recipe_ingredients').select('recipe_id, ingredient').in('recipe_id', ids).order('order_index'),
      supabase.from('recipe_instructions').select('recipe_id, instruction').in('recipe_id', ids).order('step_number'),
    ])
    const details: Record<string, RecipeDetails> = Object.fromEntries(
      ids.map((id) => [
        id,
        {
          ingredients: (ingredients.data ?? []).filter((r) => r.recipe_id === id).map((r) => r.ingredient as string),
          instructions: (instructions.data ?? []).filter((r) => r.recipe_id === id).map((r) => r.instruction as string),
        },
      ])
    )
    const bad = picked.filter((r) => {
      const d = details[r.id]
      return d.ingredients.length === 0 || d.instructions.length === 0 || !d.ingredients.every(allowed)
    })
    if (bad.length === 0) return buildPlan(pick, details, profile)
    pool = pool.filter((r) => !bad.includes(r))
  }
  throw new BatchPrepValidationError('Could not find enough library recipes that fit these preferences.')
}
