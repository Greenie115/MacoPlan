import type { MealPlan } from '@/stores/dashboard-store'

export const DUMMY_MEAL_PLANS: MealPlan[] = [
  {
    id: '1',
    name: '7-Day Muscle Plan',
    dateRange: 'Nov 4-10, 2025',
    caloriesPerDay: 2450,
    proteinGrams: 180,
    carbGrams: 280,
    fatGrams: 65,
    isActive: true,
    daysCompleted: 3,
    totalDays: 7,
    images: [], // Empty now, using macro ring instead
    createdAt: new Date('2025-11-04'),
  },
  {
    id: '2',
    name: 'High-Protein Week',
    dateRange: 'Oct 28-Nov 3, 2025',
    caloriesPerDay: 2600,
    proteinGrams: 200,
    carbGrams: 250,
    fatGrams: 80,
    daysCompleted: 7,
    totalDays: 7,
    images: [],
    createdAt: new Date('2025-10-28'),
  },
  {
    id: '3',
    name: 'Lean Bulk Cycle',
    dateRange: 'Oct 21-27, 2025',
    caloriesPerDay: 2800,
    proteinGrams: 170,
    carbGrams: 350,
    fatGrams: 75,
    daysCompleted: 7,
    totalDays: 7,
    images: [],
    createdAt: new Date('2025-10-21'),
  },
]
