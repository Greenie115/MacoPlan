import { describe, it, expect } from 'vitest'
import { calculateBMR } from '@/lib/calculations/bmr'

describe('BMR Calculation (Mifflin-St Jeor)', () => {
  describe('Imperial units', () => {
    it('calculates correctly for 30yr male, 180lbs, 5\'10"', () => {
      // 5'10" = 70 inches total
      const result = calculateBMR(180, 70, 30, 'male', 'imperial')

      // Expected: ~1783 calories/day
      expect(result).toBeGreaterThan(1775)
      expect(result).toBeLessThan(1790)
    })

    it('calculates correctly for 25yr female, 150lbs, 5\'5"', () => {
      // 5'5" = 65 inches total
      const result = calculateBMR(150, 65, 25, 'female', 'imperial')

      // Expected: ~1426 calories/day
      expect(result).toBeGreaterThan(1420)
      expect(result).toBeLessThan(1432)
    })

    it('calculates correctly for 40yr male, 200lbs, 6\'0"', () => {
      // 6'0" = 72 inches total
      const result = calculateBMR(200, 72, 40, 'male', 'imperial')

      // Expected: ~1855 calories/day
      expect(result).toBeGreaterThan(1850)
      expect(result).toBeLessThan(1862)
    })

    it('calculates correctly for 35yr female, 130lbs, 5\'3"', () => {
      // 5'3" = 63 inches total
      const result = calculateBMR(130, 63, 35, 'female', 'imperial')

      // Expected: ~1254 calories/day
      expect(result).toBeGreaterThan(1248)
      expect(result).toBeLessThan(1260)
    })
  })

  describe('Metric units', () => {
    it('calculates correctly for 81.6kg male, 178cm, 30yr', () => {
      const result = calculateBMR(81.6, 178, 30, 'male', 'metric')

      // Should be close to imperial equivalent
      expect(result).toBeGreaterThan(1778)
      expect(result).toBeLessThan(1790)
    })

    it('calculates correctly for 68kg female, 165cm, 25yr', () => {
      const result = calculateBMR(68, 165, 25, 'female', 'metric')

      expect(result).toBeGreaterThan(1420)
      expect(result).toBeLessThan(1430)
    })
  })

  describe('Edge cases', () => {
    it('handles minimum age (13)', () => {
      // 5'0" = 60 inches
      const result = calculateBMR(100, 60, 13, 'male', 'imperial')

      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(3000) // Reasonable upper bound
    })

    it('handles maximum age (120)', () => {
      // 5'6" = 66 inches
      const result = calculateBMR(150, 66, 120, 'female', 'imperial')

      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(2000)
    })

    it('handles minimum weight (50lbs)', () => {
      // 4'0" = 48 inches
      const result = calculateBMR(50, 48, 13, 'female', 'imperial')

      expect(result).toBeGreaterThan(0)
    })

    it('handles maximum weight (500lbs)', () => {
      // 6'6" = 78 inches
      const result = calculateBMR(500, 78, 30, 'male', 'imperial')

      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(5000)
    })
  })

  describe('Sex differences', () => {
    it('male BMR is higher than female for same stats', () => {
      // 5'8" = 68 inches
      const maleBMR = calculateBMR(150, 68, 30, 'male', 'imperial')
      const femaleBMR = calculateBMR(150, 68, 30, 'female', 'imperial')

      // Male should be ~166 calories higher (+5 vs -161 in formula)
      expect(maleBMR - femaleBMR).toBeGreaterThan(160)
      expect(maleBMR - femaleBMR).toBeLessThan(170)
    })
  })
})
