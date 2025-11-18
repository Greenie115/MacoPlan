import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MealPlan {
  id: string
  name: string
  dateRange: string
  caloriesPerDay: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  isActive?: boolean
  daysCompleted?: number
  totalDays?: number
  images: string[] // Keep for backwards compatibility, but won't be used
  createdAt: Date
}

export interface DashboardStats {
  currentStreak: number
  daysLoggedThisWeek: number
  macroAccuracy: number // 0-100
  plansCreated: number
  mealsLogged: number
  monthlyTrend?: number
}

interface DashboardState {
  // Progress tracking (dummy data for MVP)
  caloriesEaten: number
  proteinEaten: number
  carbsEaten: number
  fatEaten: number

  // Stats (dummy data for MVP)
  stats: DashboardStats

  // Recent plans (dummy data for MVP)
  recentPlans: MealPlan[]

  // Actions
  setProgress: (
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  ) => void
  setStats: (stats: DashboardStats) => void
  setRecentPlans: (plans: MealPlan[]) => void
  reset: () => void
}

const initialState = {
  caloriesEaten: 0,
  proteinEaten: 0,
  carbsEaten: 0,
  fatEaten: 0,
  stats: {
    currentStreak: 0,
    daysLoggedThisWeek: 0,
    macroAccuracy: 0,
    plansCreated: 0,
    mealsLogged: 0,
    monthlyTrend: 0,
  },
  recentPlans: [],
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      ...initialState,

      setProgress: (calories, protein, carbs, fat) =>
        set({
          caloriesEaten: calories,
          proteinEaten: protein,
          carbsEaten: carbs,
          fatEaten: fat,
        }),

      setStats: (stats) =>
        set({
          stats,
        }),

      setRecentPlans: (plans) =>
        set({
          recentPlans: plans,
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'dashboard-storage',
    }
  )
)
