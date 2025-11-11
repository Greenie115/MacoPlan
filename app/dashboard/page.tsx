'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useDashboardData } from '@/lib/hooks/use-dashboard-data'
import { DUMMY_MEAL_PLANS } from '@/lib/data/dummy-dashboard-data'
import { TopAppBar } from '@/components/layout/top-app-bar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { GreetingHeader } from '@/components/dashboard/greeting-header'
import { MacroTargetCard } from '@/components/dashboard/macro-target-card'
import { GeneratePlanCTA } from '@/components/dashboard/generate-plan-cta'
import { RecentPlansCarousel } from '@/components/dashboard/recent-plans-carousel'
import { StatsGrid } from '@/components/dashboard/stats-grid'

export default function DashboardPage() {
  const router = useRouter()
  const onboardingStore = useOnboardingStore()
  const dashboardStore = useDashboardStore()
  const { macros, progress, stats, recentPlans } = useDashboardData()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize dummy data on first load
  useEffect(() => {
    // Only run once
    if (isInitialized) return

    // Check if user has completed onboarding
    if (!onboardingStore.targetCalories) {
      router.replace('/onboarding/1')
      return
    }

    // Initialize dummy data if not already set
    if (recentPlans.length === 0) {
      dashboardStore.setRecentPlans(DUMMY_MEAL_PLANS)
    }

    if (stats.currentStreak === 0) {
      dashboardStore.setStats({
        currentStreak: 7,
        daysLoggedThisWeek: 5,
        macroAccuracy: 94,
        plansCreated: 12,
        mealsLogged: 45,
        monthlyTrend: 3,
      })
    }

    if (progress.caloriesEaten === 0) {
      // Set progress to 60% of targets
      dashboardStore.setProgress(
        Math.round(macros.targetCalories * 0.6),
        Math.round(macros.proteinGrams * 0.6),
        Math.round(macros.carbGrams * 0.6),
        Math.round(macros.fatGrams * 0.6)
      )
    }

    setIsInitialized(true)
  }, [isInitialized, onboardingStore.targetCalories, router, recentPlans.length, stats.plansCreated, stats.mealsLogged, progress.caloriesEaten, dashboardStore, macros])

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top App Bar */}
      <TopAppBar />

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto">
        {/* Greeting */}
        <GreetingHeader
          currentStreak={stats.currentStreak}
          currentGoal={onboardingStore.goal || undefined}
          activePlanName={recentPlans.find((p) => p.isActive)?.name}
          activePlanDay={recentPlans.find((p) => p.isActive)?.daysCompleted}
          activePlanTotalDays={recentPlans.find((p) => p.isActive)?.totalDays}
        />

        {/* Today's Macro Target */}
        <div className="px-4 pb-4 md:px-6 lg:px-8">
          <MacroTargetCard
            targetCalories={macros.targetCalories}
            proteinGrams={macros.proteinGrams}
            carbGrams={macros.carbGrams}
            fatGrams={macros.fatGrams}
            caloriesEaten={progress.caloriesEaten}
            proteinEaten={progress.proteinEaten}
            carbsEaten={progress.carbsEaten}
            fatEaten={progress.fatEaten}
            mealsLogged={2}
            totalMealsPlanned={4}
          />
        </div>

        {/* Generate New Meal Plan CTA */}
        <div className="pb-4">
          <GeneratePlanCTA hasActivePlan={recentPlans.some((p) => p.isActive)} />
        </div>

        {/* Recent Plans Section */}
        <div className="pt-3">
          <h2 className="text-xl font-bold leading-tight tracking-tight text-charcoal px-4 pb-3 md:px-6 lg:px-8">
            Recent Plans
          </h2>
          <RecentPlansCarousel plans={recentPlans} />
        </div>

        {/* Quick Stats Section */}
        <div className="pt-3">
          <h2 className="text-xl font-bold leading-tight tracking-tight text-charcoal px-4 pb-3 md:px-6 lg:px-8">
            Quick Stats
          </h2>
          <StatsGrid
            currentStreak={stats.currentStreak}
            daysLoggedThisWeek={stats.daysLoggedThisWeek}
            macroAccuracy={stats.macroAccuracy}
            plansCreated={stats.plansCreated}
            monthlyTrend={stats.monthlyTrend}
          />
        </div>

        {/* Bottom spacing for fixed nav */}
        <div className="h-4" />
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  )
}
