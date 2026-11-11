import { describe, expect, it } from 'vitest'
import { buildPlan, pickRecipes, type LibraryRecipe } from '@/lib/services/batch-prep-library'
import { checkMacroAccuracy } from '@/lib/services/batch-prep-accuracy'
import type { TrainingProfile } from '@/lib/types/batch-prep'

const recipe = (name: string, calories: number, p: number, c: number, f: number): LibraryRecipe => ({
  id: name,
  name,
  calories,
  protein_grams: p,
  carb_grams: c,
  fat_grams: f,
  cuisine: 'american',
  total_time_minutes: 40,
  servings: 4,
  storage_fridge_days: 4,
})

const pool = [
  recipe('Overnight protein oats', 420, 32, 49, 10),
  recipe('Egg white breakfast wraps', 330, 34, 28, 8),
  recipe('Cottage cheese pancakes', 380, 30, 40, 10),
  recipe('Chicken thigh burrito bowls', 620, 52, 61, 17),
  recipe('Turkey chili with black beans', 480, 44, 38, 14),
  recipe('Beef and broccoli rice', 590, 46, 58, 18),
  recipe('Salmon, quinoa and greens', 560, 42, 34, 27),
  recipe('Lentil dal with spinach', 410, 24, 56, 9),
]

const profile: TrainingProfile = {
  training_days_per_week: 4,
  training_day_macros: { calories: 2400, protein_g: 180, carbs_g: 260, fat_g: 70 },
  rest_day_macros: { calories: 2000, protein_g: 170, carbs_g: 190, fat_g: 65 },
  prep_day: 'sunday',
  containers_per_week: 10,
  max_prep_time_mins: 120,
}
const preferences = { exclusions: [], meal_variety: 'medium' as const }
const details = Object.fromEntries(
  pool.map((r) => [r.id, { ingredients: ['2 lbs chicken thighs'], instructions: ['Roast in the oven for 35 minutes.'] }])
)

describe('library plan builder', () => {
  it('lands both day types within the macro tolerance', () => {
    const plan = buildPlan(pickRecipes(pool, profile, preferences), details, profile)
    expect(checkMacroAccuracy(plan, profile).passed).toBe(true)
  })

  it('uses one distinct recipe per meal and puts a breakfast recipe first', () => {
    const { recipes } = pickRecipes(pool, profile, preferences)
    expect(new Set(recipes).size).toBe(4)
    expect(recipes[0].name).toMatch(/oats|Egg|pancakes/)
  })

  it('assigns exactly the requested number of containers', () => {
    const plan = buildPlan(pickRecipes(pool, profile, preferences), details, profile)
    expect(plan.container_assignments).toHaveLength(10)
    expect(plan.prep_timeline.at(-1)?.action).toContain('10 containers')
  })

  it('refuses when the library is too small for the plan', () => {
    expect(() => pickRecipes(pool.slice(0, 2), profile, preferences)).toThrow(/Only 2/)
  })
})
