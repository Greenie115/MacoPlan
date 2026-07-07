'use client'

import { useEffect, useState } from 'react'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useDashboardData } from '@/lib/hooks/use-dashboard-data'
import { useUserProfile } from '@/lib/hooks/use-user-profile'
import { getRecentPlansWithProgress, archiveOldCompletedPlans } from '@/app/actions/plans'
import { GreetingHeader } from '@/components/dashboard/greeting-header'
import { MacroTargetCard } from '@/components/dashboard/macro-target-card'
import { GeneratePlanCTA } from '@/components/dashboard/generate-plan-cta'
import { RecentPlansCarousel } from '@/components/dashboard/recent-plans-carousel'
import { LogMealModal } from '@/components/meals/log-meal-modal'
import { getMealsForDate, deleteMealLog } from '@/app/actions/meal-logs'
import { toast } from 'sonner'
import { localToday, type LoggedMeal, type DailyTotals } from '@/lib/types/meal-log'

export default function DashboardPage() {
  const dashboardStore = useDashboardStore()
  const { profile, loading: profileLoading, userName } = useUserProfile()
  const { macros, recentPlans } = useDashboardData({ profile })
  const [isInitialized, setIsInitialized] = useState(false)

  // Meal logging state
  const [isLogMealOpen, setIsLogMealOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<LoggedMeal | undefined>()
  const [todaysMeals, setTodaysMeals] = useState<LoggedMeal[]>([])
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealsLogged: 0,
  })

  // One fetch (browser-local date), totals derived from the same rows
  const fetchMealData = async () => {
    const mealsResult = await getMealsForDate(localToday())
    if (mealsResult.success && mealsResult.data) {
      setTodaysMeals(mealsResult.data)
      setDailyTotals(
        mealsResult.data.reduce(
          (acc, meal) => ({
            calories: acc.calories + meal.calories,
            protein: acc.protein + meal.protein_grams,
            carbs: acc.carbs + meal.carb_grams,
            fat: acc.fat + meal.fat_grams,
            mealsLogged: acc.mealsLogged + 1,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0, mealsLogged: 0 }
        )
      )
    }
  }

  // Initialize data
  useEffect(() => {
    // Wait for useUserProfile to resolve, then run once
    if (profileLoading || isInitialized) return

    async function initializeDashboard() {
      // ponytail: no client-side onboarding redirect — proxy.ts already
      // enforces this server-side for all protected routes.
      if (!profile) return

      // Fire independent reads in parallel instead of one-after-another
      const [plansResult] = await Promise.all([
        getRecentPlansWithProgress(),
        fetchMealData(),
      ])
      if (plansResult.success && plansResult.data) {
        dashboardStore.setRecentPlans(plansResult.data)
      }

      // Background maintenance — fire-and-forget, must not block first render
      archiveOldCompletedPlans()

      setIsInitialized(true)
    }

    initializeDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, profile])

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        {/* Header with Greeting */}
        <div className="mb-2">
          <GreetingHeader
            userName={userName}
            proteinTarget={isInitialized ? macros.proteinGrams : undefined}
            proteinEaten={dailyTotals.protein}
            mealsLogged={dailyTotals.mealsLogged}
          />
        </div>

        {/* Dashboard Grid - Side by side on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Macro Target */}
          <div className="space-y-6">
            <MacroTargetCard
              targetCalories={macros.targetCalories}
              proteinGrams={macros.proteinGrams}
              carbGrams={macros.carbGrams}
              fatGrams={macros.fatGrams}
              caloriesEaten={dailyTotals.calories}
              proteinEaten={dailyTotals.protein}
              carbsEaten={dailyTotals.carbs}
              fatEaten={dailyTotals.fat}
              mealsLogged={dailyTotals.mealsLogged}
              onLogMeal={() => {
                setEditingMeal(undefined)
                setIsLogMealOpen(true)
              }}
              meals={todaysMeals}
              onEditMeal={(meal) => {
                setEditingMeal(meal)
                setIsLogMealOpen(true)
              }}
              onDeleteMeal={async (mealId) => {
                const result = await deleteMealLog(mealId)
                if (result.success) {
                  await fetchMealData()
                  toast.success('Meal deleted')
                } else {
                  toast.error(result.error || 'Failed to delete meal')
                }
              }}
            />
          </div>

          {/* Right Column - CTA and Recent Plans */}
          <div className="space-y-6">
            {/* Generate New Meal Plan CTA */}
            <GeneratePlanCTA hasActivePlan={recentPlans.some((p) => p.isActive)} />

            {/* Recent Plans Section */}
            {recentPlans.length > 0 && (
              <div>
                <h2 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em] pb-3">
                  Recent Plans
                </h2>
                <RecentPlansCarousel plans={recentPlans} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}

      {/* Log Meal Modal */}
      <LogMealModal
        open={isLogMealOpen}
        onClose={() => {
          setIsLogMealOpen(false)
          setEditingMeal(undefined)
        }}
        editMeal={editingMeal}
        onSuccess={fetchMealData}
      />
    </div>
  )
}
