'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { useDashboardStore } from '@/stores/dashboard-store'
import { DUMMY_MEAL_PLANS } from '@/lib/data/dummy-dashboard-data'
import { Button } from '@/components/ui/button'
import { SkipForward } from 'lucide-react'

/**
 * DEV ONLY: Skip onboarding button for testing
 * Pre-fills stores with test data and redirects to dashboard
 */
export function SkipOnboardingDev() {
  const router = useRouter()
  const onboardingStore = useOnboardingStore()
  const dashboardStore = useDashboardStore()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleSkipOnboarding = () => {
    // Pre-fill onboarding data with test values
    onboardingStore.setGoal('bulk')
    onboardingStore.setPersonalStats({
      age: 28,
      sex: 'male',
      weight: 180,
      weightUnit: 'lbs',
      heightFeet: 5,
      heightInches: 11,
    })
    onboardingStore.setActivityLevel('moderately')

    // This will trigger BMR/TDEE/macro calculations
    onboardingStore.calculateMacros()

    // Mark all steps complete
    for (let i = 1; i <= 6; i++) {
      onboardingStore.markStepComplete(i)
    }

    // Pre-fill dashboard with dummy data
    dashboardStore.setRecentPlans(DUMMY_MEAL_PLANS)
    dashboardStore.setStats({
      currentStreak: 7,
      daysLoggedThisWeek: 5,
      macroAccuracy: 94,
      plansCreated: 12,
      mealsLogged: 45,
      monthlyTrend: 3,
    })

    // Set some progress (60% of targets)
    const targetCalories = onboardingStore.targetCalories || 2450
    const proteinGrams = onboardingStore.proteinGrams || 180
    const carbGrams = onboardingStore.carbGrams || 280
    const fatGrams = onboardingStore.fatGrams || 68

    dashboardStore.setProgress(
      Math.round(targetCalories * 0.6),
      Math.round(proteinGrams * 0.6),
      Math.round(carbGrams * 0.6),
      Math.round(fatGrams * 0.6)
    )

    // Redirect to dashboard
    router.push('/dashboard')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleSkipOnboarding}
        variant="outline"
        size="sm"
        className="bg-yellow-100 border-yellow-400 text-yellow-900 hover:bg-yellow-200 shadow-lg"
      >
        <SkipForward className="size-4 mr-2" />
        Skip (Dev Only)
      </Button>
    </div>
  )
}
