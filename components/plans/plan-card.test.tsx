import { expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { PlanCard } from './plan-card'
import { Plan } from '@/lib/types/plan'

const MOCK_PLAN: Plan = {
  id: '1',
  title: 'Test Plan',
  dateRange: 'Jan 1-7, 2025',
  calories: 2000,
  macros: {
    protein: 150,
    carbs: 200,
    fat: 60,
  },
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
    'https://example.com/image4.jpg',
  ],
}

test('PlanCard renders correctly', () => {
  const { container } = render(<PlanCard plan={MOCK_PLAN} />)
  expect(container).toMatchSnapshot()
})
