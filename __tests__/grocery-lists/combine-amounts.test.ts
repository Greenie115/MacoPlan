import { describe, it, expect } from 'vitest'

// Helper functions extracted for testing
function parseFraction(str: string): number | null {
  const match = str.match(/^(\d+)\/(\d+)$/)
  if (match) {
    const numerator = parseInt(match[1])
    const denominator = parseInt(match[2])
    if (denominator !== 0) {
      return numerator / denominator
    }
  }
  return null
}

function combineAmounts(amount1: string, amount2: string): string {
  // Try to parse fractions first (before parseFloat)
  const fraction1 = parseFraction(amount1)
  const fraction2 = parseFraction(amount2)

  if (fraction1 !== null && fraction2 !== null) {
    const sum = fraction1 + fraction2
    return sum.toString()
  }

  // Then try numeric values
  const num1 = parseFloat(amount1)
  const num2 = parseFloat(amount2)

  if (!isNaN(num1) && !isNaN(num2)) {
    return (num1 + num2).toString()
  }

  // If we can't parse, just concatenate with " + "
  return `${amount1} + ${amount2}`
}

describe('Parse Fraction', () => {
  it('parses simple fractions correctly', () => {
    expect(parseFraction('1/2')).toBe(0.5)
    expect(parseFraction('1/4')).toBe(0.25)
    expect(parseFraction('3/4')).toBe(0.75)
    expect(parseFraction('2/3')).toBeCloseTo(0.6667, 4)
    expect(parseFraction('1/8')).toBe(0.125)
  })

  it('handles larger numerators', () => {
    expect(parseFraction('5/4')).toBe(1.25)
    expect(parseFraction('10/3')).toBeCloseTo(3.3333, 4)
  })

  it('returns null for invalid formats', () => {
    expect(parseFraction('1')).toBe(null)
    expect(parseFraction('1.5')).toBe(null)
    expect(parseFraction('abc')).toBe(null)
    expect(parseFraction('1/2/3')).toBe(null)
    expect(parseFraction('/')).toBe(null)
    expect(parseFraction('')).toBe(null)
  })

  it('handles division by zero', () => {
    expect(parseFraction('1/0')).toBe(null)
  })

  it('handles edge cases', () => {
    expect(parseFraction('0/1')).toBe(0)
    expect(parseFraction('1/1')).toBe(1)
  })
})

describe('Combine Amounts', () => {
  describe('Combining decimal numbers', () => {
    it('adds simple integers correctly', () => {
      expect(combineAmounts('1', '2')).toBe('3')
      expect(combineAmounts('5', '10')).toBe('15')
    })

    it('adds decimal numbers correctly', () => {
      expect(combineAmounts('1.5', '2.5')).toBe('4')
      expect(combineAmounts('0.25', '0.75')).toBe('1')
      expect(combineAmounts('3.14', '2.86')).toBe('6')
    })

    it('adds mixed integers and decimals', () => {
      expect(combineAmounts('1', '1.5')).toBe('2.5')
      expect(combineAmounts('2.5', '3')).toBe('5.5')
    })
  })

  describe('Combining fractions', () => {
    it('adds simple fractions correctly', () => {
      expect(combineAmounts('1/2', '1/2')).toBe('1')
      expect(combineAmounts('1/4', '1/4')).toBe('0.5')
      expect(combineAmounts('1/4', '3/4')).toBe('1')
    })

    it('adds different fractions correctly', () => {
      // 1/2 + 1/4 = 0.5 + 0.25 = 0.75
      expect(combineAmounts('1/2', '1/4')).toBe('0.75')
      // 1/3 + 2/3 ≈ 1
      expect(parseFloat(combineAmounts('1/3', '2/3'))).toBeCloseTo(1, 4)
    })
  })

  describe('Combining non-numeric amounts', () => {
    it('concatenates amounts with " + " when cannot parse', () => {
      expect(combineAmounts('to taste', 'pinch')).toBe('to taste + pinch')
      expect(combineAmounts('a handful', 'some')).toBe('a handful + some')
      expect(combineAmounts('', 'some')).toBe(' + some')
    })
  })

  describe('Mixed parsing scenarios', () => {
    it('handles number + non-number', () => {
      // First is parseable, second is not
      expect(combineAmounts('2', 'to taste')).toBe('2 + to taste')
    })

    it('handles fraction + non-fraction', () => {
      expect(combineAmounts('1/2', 'handful')).toBe('1/2 + handful')
    })
  })

  describe('Edge cases', () => {
    it('handles zero amounts', () => {
      expect(combineAmounts('0', '0')).toBe('0')
      expect(combineAmounts('0', '5')).toBe('5')
      expect(combineAmounts('5', '0')).toBe('5')
    })

    it('handles empty strings', () => {
      expect(combineAmounts('', '')).toBe(' + ')
      expect(combineAmounts('5', '')).toBe('5 + ')
      expect(combineAmounts('', '5')).toBe(' + 5')
    })

    it('handles negative numbers', () => {
      expect(combineAmounts('-5', '10')).toBe('5')
      expect(combineAmounts('5', '-3')).toBe('2')
    })
  })
})
