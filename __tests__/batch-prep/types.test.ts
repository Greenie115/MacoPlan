import { describe, it, expect } from 'vitest'
import {
  BatchPrepPlanSchema,
  MacrosSchema,
  MealSchema,
  PrepStepSchema,
  TrainingProfileSchema,
} from '@/lib/types/batch-prep'

describe('batch-prep types', () => {
  describe('MacrosSchema', () => {
    it('accepts valid macros', () => {
      const result = MacrosSchema.parse({ calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 })
      expect(result.calories).toBe(2600)
    })

    it('rejects negative values', () => {
      expect(() => MacrosSchema.parse({ calories: -100, protein_g: 200, carbs_g: 280, fat_g: 70 })).toThrow()
    })
  })

  describe('PrepStepSchema', () => {
    it('accepts valid equipment', () => {
      const result = PrepStepSchema.parse({
        step: 1,
        time: '0:00',
        action: 'Preheat oven to 200°C',
        duration_mins: 5,
        equipment: 'oven',
      })
      expect(result.equipment).toBe('oven')
    })

    it('rejects invalid equipment', () => {
      expect(() =>
        PrepStepSchema.parse({
          step: 1,
          time: '0:00',
          action: 'Do a thing',
          duration_mins: 5,
          equipment: 'microwave',
        })
      ).toThrow()
    })
  })

  describe('BatchPrepPlanSchema', () => {
    it('requires 2-5 meals per day', () => {
      const planWithOneMeal = {
        training_day: {
          meals: [{ name: 'x', meal_slot: 'breakfast', ingredients: [{ name: 'chicken', quantity_g: 200, macros: { calories: 330, protein_g: 62, carbs_g: 0, fat_g: 7 } }], total_macros: { calories: 330, protein_g: 62, carbs_g: 0, fat_g: 7 }, equipment: 'oven', servings_to_prep: 5, storage_days: 5 }],
          daily_totals: { calories: 330, protein_g: 62, carbs_g: 0, fat_g: 7 },
        },
        rest_day: { meals: [], daily_totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 } },
        prep_timeline: [],
        shopping_list: [],
        container_assignments: [],
        total_containers: 10,
        estimated_prep_time_mins: 90,
      }
      expect(() => BatchPrepPlanSchema.parse(planWithOneMeal)).toThrow()
    })
  })

  describe('TrainingProfileSchema', () => {
    it('accepts valid profile', () => {
      const result = TrainingProfileSchema.parse({
        training_days_per_week: 5,
        training_day_macros: { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
        rest_day_macros: { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 },
        prep_day: 'sunday',
        containers_per_week: 10,
        max_prep_time_mins: 120,
      })
      expect(result.prep_day).toBe('sunday')
    })

    it('rejects training_days_per_week > 7', () => {
      expect(() =>
        TrainingProfileSchema.parse({
          training_days_per_week: 8,
          training_day_macros: { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
          rest_day_macros: { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 },
          prep_day: 'sunday',
          containers_per_week: 10,
          max_prep_time_mins: 120,
        })
      ).toThrow()
    })
  })
})
