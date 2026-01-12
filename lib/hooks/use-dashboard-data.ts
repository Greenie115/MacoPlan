'use client'

import { useDashboardStore } from '@/stores/dashboard-store'
import type { UserProfile } from '@/lib/types/database'

interface UseDashboardDataParams {
  profile?: UserProfile | null
}

export function useDashboardData(params?: UseDashboardDataParams) {
  const dashboardStore = useDashboardStore()
  const profile = params?.profile

  // Use profile macros directly (authoritative source - same as settings page)
  // Fall back to default values only if profile is not available yet
  const macros = {
    targetCalories: profile?.target_calories || 2000,
    proteinGrams: profile?.protein_grams || 150,
    carbGrams: profile?.carb_grams || 200,
    fatGrams: profile?.fat_grams || 65,
  }

  // Get progress (dummy data for MVP)
  const progress = {
    caloriesEaten: dashboardStore.caloriesEaten,
    proteinEaten: dashboardStore.proteinEaten,
    carbsEaten: dashboardStore.carbsEaten,
    fatEaten: dashboardStore.fatEaten,
  }

  // Get stats (dummy data for MVP)
  const stats = dashboardStore.stats

  // Get recent plans (dummy data for MVP)
  const recentPlans = dashboardStore.recentPlans

  return {
    macros,
    progress,
    stats,
    recentPlans,
  }
}
