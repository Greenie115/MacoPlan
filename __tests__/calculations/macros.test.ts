import { describe, it, expect } from 'vitest'
import { calculateMacros, calculateTargetCalories } from '@/lib/calculations/macros'

describe('Macro Calculation', () => {
  describe('Cut (20% deficit)', () => {
    it('calculates correct calorie deficit', () => {
      const tdee = 2868
      const targetCalories = calculateTargetCalories(tdee, 'cut')

      const expected = Math.round(tdee * 0.8) // 2294
      expect(targetCalories).toBe(expected)
    })

    it('sets protein to 1g per lb body weight', () => {
      const targetCalories = 2294
      const result = calculateMacros(targetCalories, 'cut', 180, 'lbs')

      expect(result.protein).toBe(180)
    })

    it('sets fat to ~25% of calories', () => {
      const targetCalories = 2294
      const result = calculateMacros(targetCalories, 'cut', 180, 'lbs')

      const fatCalories = result.fat * 9
      const fatPercentage = (fatCalories / result.targetCalories) * 100

      // Implementation uses 25% fat for cut (ISSN recommendations)
      expect(fatPercentage).toBeGreaterThan(23)
      expect(fatPercentage).toBeLessThan(27)
    })
  })

  describe('Bulk (10% surplus)', () => {
    it('calculates correct calorie surplus', () => {
      const tdee = 2868
      const targetCalories = calculateTargetCalories(tdee, 'bulk')

      const expected = Math.round(tdee * 1.1) // 3155
      expect(targetCalories).toBe(expected)
    })

    it('sets protein based on ISSN recommendations (1.6 g/kg)', () => {
      const targetCalories = 3155
      const result = calculateMacros(targetCalories, 'bulk', 180, 'lbs')

      // 180 lbs = 81.65 kg
      // ISSN bulk protein: 1.6 g/kg * 81.65 kg = 130.6 g ≈ 131 g
      const weightKg = 180 * 0.453592 // 81.65 kg
      const expectedProtein = Math.round(weightKg * 1.6) // ~131g

      expect(result.protein).toBe(expectedProtein)
    })
  })

  describe('Maintain (no deficit/surplus)', () => {
    it('sets target calories to TDEE', () => {
      const tdee = 2500
      const targetCalories = calculateTargetCalories(tdee, 'maintain')

      expect(targetCalories).toBe(tdee)
    })
  })

  describe('Recomp (maintenance calories)', () => {
    it('sets target calories to TDEE', () => {
      const tdee = 2300
      const targetCalories = calculateTargetCalories(tdee, 'recomp')

      expect(targetCalories).toBe(tdee)
    })
  })

  describe('Calorie validation', () => {
    it('ensures macros sum to target calories (within tolerance)', () => {
      const targetCalories = 2500
      const result = calculateMacros(targetCalories, 'maintain', 170, 'lbs')

      const totalCalories =
        (result.protein * 4) +
        (result.carbs * 4) +
        (result.fat * 9)

      // Allow 100 calorie margin of error
      expect(Math.abs(totalCalories - result.targetCalories)).toBeLessThan(100)
    })

    it('all macro values are positive', () => {
      const targetCalories = 1600
      const result = calculateMacros(targetCalories, 'cut', 150, 'lbs')

      expect(result.protein).toBeGreaterThan(0)
      expect(result.carbs).toBeGreaterThan(0)
      expect(result.fat).toBeGreaterThan(0)
    })
  })
})
