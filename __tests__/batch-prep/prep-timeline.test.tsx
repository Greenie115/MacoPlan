import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrepTimeline } from '@/components/batch-prep/prep-timeline'
import type { PrepStep } from '@/lib/types/batch-prep'

const steps: PrepStep[] = [
  { step: 1, time: '0:00', action: 'Preheat oven', duration_mins: 5, equipment: 'oven' },
  { step: 2, time: '0:05', action: 'Put rice on', duration_mins: 0, equipment: 'rice_cooker' },
  { step: 3, time: '0:10', action: 'Brown beef', duration_mins: 20, equipment: 'stovetop' },
]

describe('PrepTimeline', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders all steps', () => {
    render(<PrepTimeline planId="test-plan" steps={steps} />)
    expect(screen.getByText('Preheat oven')).toBeDefined()
    expect(screen.getByText('Put rice on')).toBeDefined()
    expect(screen.getByText('Brown beef')).toBeDefined()
  })

  it('persists checkbox state to localStorage', () => {
    render(<PrepTimeline planId="test-plan" steps={steps} />)
    const firstCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(firstCheckbox)
    expect(localStorage.getItem('prep-timeline:test-plan')).toContain('1')
  })

  it('restores checkbox state from localStorage on mount', () => {
    localStorage.setItem('prep-timeline:test-plan', JSON.stringify({ 1: true }))
    render(<PrepTimeline planId="test-plan" steps={steps} />)
    const firstCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement
    expect(firstCheckbox.checked).toBe(true)
  })
})
