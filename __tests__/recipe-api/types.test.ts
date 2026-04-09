import { describe, it, expect } from 'vitest'
import { parseISODuration } from '@/lib/types/recipe-api'

describe('parseISODuration', () => {
  it('parses PT30M to 30 minutes', () => {
    expect(parseISODuration('PT30M')).toBe(30)
  })

  it('parses PT1H30M to 90 minutes', () => {
    expect(parseISODuration('PT1H30M')).toBe(90)
  })

  it('parses PT2H to 120 minutes', () => {
    expect(parseISODuration('PT2H')).toBe(120)
  })

  it('parses PT1H to 60 minutes', () => {
    expect(parseISODuration('PT1H')).toBe(60)
  })

  it('returns null for null/undefined', () => {
    expect(parseISODuration(null)).toBeNull()
    expect(parseISODuration(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseISODuration('')).toBeNull()
  })

  it('parses PT0M to null (zero duration)', () => {
    expect(parseISODuration('PT0M')).toBeNull()
  })
})
