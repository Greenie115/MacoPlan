import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock environment
vi.stubEnv('RECIPE_API_KEY', 'rapi_test_key')

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gt: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  }),
}))

import { RecipeApiService } from '@/lib/services/recipe-api'

describe('RecipeApiService', () => {
  let service: RecipeApiService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new RecipeApiService()
  })

  describe('normalizeRecipe', () => {
    it('maps RecipeApiRecipe to NormalizedRecipe correctly', () => {
      const apiRecipe = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Recipe',
        description: 'A test recipe',
        category: 'Main Dishes',
        cuisine: 'Italian',
        difficulty: 'Easy',
        tags: ['quick', 'healthy'],
        meta: {
          active_time: 'PT15M',
          passive_time: 'PT0M',
          total_time: 'PT30M',
          overnight_required: false,
          yields: '4 servings',
          yield_count: 4,
          serving_size_g: null,
        },
        dietary: { flags: ['Gluten-Free'], not_suitable_for: [] },
        storage: null,
        equipment: [],
        ingredients: [{
          group_name: 'Main',
          items: [{
            name: 'Chicken breast',
            quantity: 2,
            unit: 'lbs',
            preparation: 'diced',
            notes: null,
            substitutions: [],
            ingredient_id: 'abc-123',
            nutrition_source: 'USDA',
          }],
        }],
        instructions: [{
          step_number: 1,
          phase: 'prep' as const,
          text: 'Dice the chicken',
          structured: null,
          tips: [],
        }],
        troubleshooting: [],
        chef_notes: [],
        cultural_context: null,
        nutrition: {
          per_serving: {
            calories: 350,
            protein_g: 30,
            carbohydrates_g: 20,
            fat_g: 15,
            saturated_fat_g: null, trans_fat_g: null,
            monounsaturated_fat_g: null, polyunsaturated_fat_g: null,
            fiber_g: 5, sugar_g: 3, sodium_mg: null, cholesterol_mg: null,
            potassium_mg: null, calcium_mg: null, iron_mg: null,
            magnesium_mg: null, phosphorus_mg: null, zinc_mg: null,
            vitamin_a_mcg: null, vitamin_c_mg: null, vitamin_d_mcg: null,
            vitamin_e_mg: null, vitamin_k_mcg: null, vitamin_b6_mg: null,
            vitamin_b12_mcg: null, thiamin_mg: null, riboflavin_mg: null,
            niacin_mg: null, folate_mcg: null, water_g: null,
            alcohol_g: null, caffeine_mg: null,
          },
          sources: ['USDA'],
        },
      }

      const normalized = service.normalizeRecipe(apiRecipe, 'https://images.unsplash.com/test')

      expect(normalized.id).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(normalized.source).toBe('recipe-api')
      expect(normalized.title).toBe('Test Recipe')
      expect(normalized.calories).toBe(350)
      expect(normalized.protein).toBe(30)
      expect(normalized.carbs).toBe(20)
      expect(normalized.fat).toBe(15)
      expect(normalized.fiber).toBe(5)
      expect(normalized.sugar).toBe(3)
      expect(normalized.servings).toBe(4)
      expect(normalized.totalTimeMinutes).toBe(30)
      expect(normalized.imageUrl).toBe('https://images.unsplash.com/test')
      expect(normalized.ingredients).toHaveLength(1)
      expect(normalized.ingredients[0].name).toBe('Chicken breast')
      expect(normalized.instructions).toHaveLength(1)
      expect(normalized.instructions[0].instruction).toBe('Dice the chicken')
    })
  })

  describe('normalizeListItem', () => {
    it('maps RecipeApiListItem to search result format', () => {
      const listItem = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Pasta Dish',
        description: 'Quick pasta',
        category: 'Main Dishes',
        cuisine: 'Italian',
        difficulty: 'Easy',
        tags: [],
        meta: {
          active_time: 'PT20M',
          passive_time: 'PT0M',
          total_time: 'PT20M',
          overnight_required: false,
          yields: '2 servings',
          yield_count: 2,
          serving_size_g: null,
        },
        dietary: { flags: [], not_suitable_for: [] },
        nutrition_summary: {
          calories: 450,
          protein_g: 20,
          carbohydrates_g: 50,
          fat_g: 18,
        },
      }

      const result = service.normalizeListItem(listItem, null)

      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(result.title).toBe('Pasta Dish')
      expect(result.calories).toBe(450)
      expect(result.imageUrl).toBeNull()
    })
  })
})
