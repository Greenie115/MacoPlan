import { describe, it, expect, vi, afterEach } from 'vitest'
import { getGreetingSubline } from '@/lib/utils/time-utils'

describe('getGreetingSubline', () => {
  afterEach(() => vi.useRealTimers())

  it('returns null without a protein target', () => {
    expect(getGreetingSubline(0, 0, 0)).toBeNull()
  })

  it('celebrates a hit protein target', () => {
    expect(getGreetingSubline(150, 155, 4)).toContain('day won')
  })

  it('nudges when close to target', () => {
    expect(getGreetingSubline(150, 130, 3)).toContain('20g protein to go')
  })

  it('shows remaining protein mid-day', () => {
    expect(getGreetingSubline(150, 50, 1)).toContain('100g protein left')
  })

  it('frames an untouched morning as the day ahead', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-02T09:00:00'))
    expect(getGreetingSubline(150, 0, 0)).toContain('150g protein on the plan')
  })

  it('nudges an untouched evening', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-02T20:00:00'))
    expect(getGreetingSubline(150, 0, 0)).toContain('still time')
  })
})
