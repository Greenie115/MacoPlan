'use client'

import { useOnboardingStore } from '@/stores/onboarding-store'
import { useDashboardStore } from '@/stores/dashboard-store'

export function useDashboardData() {
  const onboardingStore = useOnboardingStore()
  const dashboardStore = useDashboardStore()

  // Pull real macro targets from onboarding
  const macros = {
    targetCalories: onboardingStore.targetCalories || 2450,
    proteinGrams: onboardingStore.proteinGrams || 180,
    carbGrams: onboardingStore.carbGrams || 280,
    fatGrams: onboardingStore.fatGrams || 68,
  }

  // Get progress (dummy data for MVP)
  const progress = {
    caloriesEaten: dashboardStore.caloriesEaten,
    proteinEaten: dashboardStore.proteinEaten,
    carbsEaten: dashboardStore.carbsEaten,
    fatEaten: dashboardStore.fatEaten,
  }

  // Get stats (dummy data for MVP)
  const stats = {
    plansCreated: dashboardStore.plansCreated,
    mealsLogged: dashboardStore.mealsLogged,
  }

  // Get recent plans (dummy data for MVP)
  const recentPlans = dashboardStore.recentPlans

  return {
    macros,
    progress,
    stats,
    recentPlans,
  }
}
