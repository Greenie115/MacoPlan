import type { MealPlan } from '@/stores/dashboard-store'

/**
 * ⚠️ DEPRECATED: This file contains dummy data for testing only
 *
 * Real meal plan data should be fetched from Supabase using:
 * - `getRecentPlansWithProgress()` from @/app/actions/plans
 *
 * This dummy data is no longer used in the dashboard and should be removed
 * once all references are confirmed to be replaced with real data.
 *
 * @deprecated Use getRecentPlansWithProgress() instead
 * @see app/actions/plans.ts
 */

// Generate consistent dummy UUIDs (v4 format)
const DUMMY_UUID_1 = '00000000-0000-4000-8000-000000000001'
const DUMMY_UUID_2 = '00000000-0000-4000-8000-000000000002'
const DUMMY_UUID_3 = '00000000-0000-4000-8000-000000000003'
const DUMMY_UUID_4 = '00000000-0000-4000-8000-000000000004'
const DUMMY_UUID_5 = '00000000-0000-4000-8000-000000000005'
const DUMMY_UUID_6 = '00000000-0000-4000-8000-000000000006'

export const DUMMY_MEAL_PLANS: MealPlan[] = [
  {
    id: DUMMY_UUID_1,
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
    id: DUMMY_UUID_2,
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
    id: DUMMY_UUID_3,
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
  {
    id: DUMMY_UUID_4,
    name: 'Cutting Phase',
    dateRange: 'Oct 14-20, 2025',
    caloriesPerDay: 2200,
    proteinGrams: 190,
    carbGrams: 200,
    fatGrams: 60,
    daysCompleted: 7,
    totalDays: 7,
    images: [],
    createdAt: new Date('2025-10-14'),
  },
  {
    id: DUMMY_UUID_5,
    name: 'Maintenance Plan',
    dateRange: 'Oct 7-13, 2025',
    caloriesPerDay: 2500,
    proteinGrams: 175,
    carbGrams: 275,
    fatGrams: 70,
    daysCompleted: 7,
    totalDays: 7,
    images: [],
    createdAt: new Date('2025-10-07'),
  },
  {
    id: DUMMY_UUID_6,
    name: 'Performance Week',
    dateRange: 'Sep 30-Oct 6, 2025',
    caloriesPerDay: 2900,
    proteinGrams: 185,
    carbGrams: 360,
    fatGrams: 85,
    daysCompleted: 7,
    totalDays: 7,
    images: [],
    createdAt: new Date('2025-09-30'),
  },
]
