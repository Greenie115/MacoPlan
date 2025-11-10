import { describe, it, expect } from 'vitest'
import { calculateTDEE } from '@/lib/calculations/tdee'

describe('TDEE Calculation', () => {
  const bmr = 1850

  it('applies sedentary multiplier (1.2x) correctly', () => {
    const tdee = calculateTDEE(bmr, 'sedentary')
    expect(tdee).toBe(Math.round(1850 * 1.2)) // 2220
  })

  it('applies lightly active multiplier (1.375x) correctly', () => {
    const tdee = calculateTDEE(bmr, 'lightly')
    expect(tdee).toBe(Math.round(1850 * 1.375)) // 2544
  })

  it('applies moderately active multiplier (1.55x) correctly', () => {
    const tdee = calculateTDEE(bmr, 'moderately')
    expect(tdee).toBe(Math.round(1850 * 1.55)) // 2868
  })

  it('applies very active multiplier (1.725x) correctly', () => {
    const tdee = calculateTDEE(bmr, 'very')
    expect(tdee).toBe(Math.round(1850 * 1.725)) // 3191
  })

  it('applies extremely active multiplier (1.9x) correctly', () => {
    const tdee = calculateTDEE(bmr, 'extremely')
    expect(tdee).toBe(Math.round(1850 * 1.9)) // 3515
  })

  it('handles low BMR values', () => {
    const lowBMR = 1200
    const tdee = calculateTDEE(lowBMR, 'sedentary')
    expect(tdee).toBe(Math.round(1200 * 1.2)) // 1440
  })

  it('handles high BMR values', () => {
    const highBMR = 3000
    const tdee = calculateTDEE(highBMR, 'extremely')
    expect(tdee).toBe(Math.round(3000 * 1.9)) // 5700
  })
})
