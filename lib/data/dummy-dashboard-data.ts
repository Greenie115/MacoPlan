import type { MealPlan } from '@/stores/dashboard-store'

export const DUMMY_MEAL_PLANS: MealPlan[] = [
  {
    id: '1',
    name: '7-Day Muscle Plan',
    dateRange: 'Nov 1-7, 2025',
    caloriesPerDay: 2450,
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', // grilled chicken
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop', // salmon
      'https://images.unsplash.com/photo-1467453678174-768ec283a940?w=400&h=400&fit=crop', // asparagus
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop', // rice
    ],
    createdAt: new Date('2025-11-01'),
  },
  {
    id: '2',
    name: 'High-Protein Week',
    dateRange: 'Oct 25-31, 2025',
    caloriesPerDay: 2600,
    images: [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop', // salmon
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', // chicken
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=400&fit=crop', // pancakes
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop', // salad
    ],
    createdAt: new Date('2025-10-25'),
  },
  {
    id: '3',
    name: 'Lean Bulk Cycle',
    dateRange: 'Oct 18-24, 2025',
    caloriesPerDay: 2800,
    images: [
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop', // salad
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', // chicken
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop', // salmon
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop', // rice
    ],
    createdAt: new Date('2025-10-18'),
  },
]
