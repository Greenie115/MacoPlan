import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MealPlan {
  id: string
  name: string
  dateRange: string
  caloriesPerDay: number
  images: string[]
  createdAt: Date
}

interface DashboardState {
  // Progress tracking (dummy data for MVP)
  caloriesEaten: number
  proteinEaten: number
  carbsEaten: number
  fatEaten: number

  // Stats (dummy data for MVP)
  plansCreated: number
  mealsLogged: number

  // Recent plans (dummy data for MVP)
  recentPlans: MealPlan[]

  // Actions
  setProgress: (
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  ) => void
  setStats: (plans: number, meals: number) => void
  setRecentPlans: (plans: MealPlan[]) => void
  reset: () => void
}

const initialState = {
  caloriesEaten: 0,
  proteinEaten: 0,
  carbsEaten: 0,
  fatEaten: 0,
  plansCreated: 0,
  mealsLogged: 0,
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

      setStats: (plans, meals) =>
        set({
          plansCreated: plans,
          mealsLogged: meals,
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
