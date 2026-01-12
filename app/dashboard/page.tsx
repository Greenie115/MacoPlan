'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useDashboardData } from '@/lib/hooks/use-dashboard-data'
import { useUserProfile } from '@/lib/hooks/use-user-profile'
import { getRecentPlansWithProgress, archiveOldCompletedPlans } from '@/app/actions/plans'
import { BottomNav } from '@/components/layout/bottom-nav'
import { GreetingHeader } from '@/components/dashboard/greeting-header'
import { MacroTargetCard } from '@/components/dashboard/macro-target-card'
import { GeneratePlanCTA } from '@/components/dashboard/generate-plan-cta'
import { RecentPlansCarousel } from '@/components/dashboard/recent-plans-carousel'
import { LogMealModal } from '@/components/meals/log-meal-modal'
import { getMealsForDate, getDailyTotals, deleteMealLog } from '@/app/actions/meal-logs'
import { toast } from 'sonner'
import type { LoggedMeal, DailyTotals } from '@/lib/types/meal-log'

export default function DashboardPage() {
  const router = useRouter()
  const dashboardStore = useDashboardStore()
  const { profile, userName } = useUserProfile()
  const { macros, progress, stats, recentPlans } = useDashboardData({ profile })
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

  // Fetch meal data
  const fetchMealData = async () => {
    const mealsResult = await getMealsForDate()
    if (mealsResult.success && mealsResult.data) {
      setTodaysMeals(mealsResult.data)
    }

    const totalsResult = await getDailyTotals()
    if (totalsResult.success && totalsResult.data) {
      setDailyTotals(totalsResult.data)
    }
  }

  // Initialize data
  useEffect(() => {
    async function initializeDashboard() {
      if (isInitialized) return

      // Check if user has completed onboarding
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()

        if (!profileData || !profileData.onboarding_completed) {
          // No profile or incomplete -> Redirect to onboarding
          router.replace('/onboarding/1')
          return
        }
      }

      // Fetch real plans data from Supabase
      const plansResult = await getRecentPlansWithProgress()
      if (plansResult.success && plansResult.data) {
        dashboardStore.setRecentPlans(plansResult.data)
      }

      // Archive old completed plans (runs in background)
      await archiveOldCompletedPlans()

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

      // Fetch real meal data instead of using dummy data
      await fetchMealData()

      setIsInitialized(true)
    }

    initializeDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        {/* Header with Greeting */}
        <div className="mb-2">
          <GreetingHeader userName={userName} />
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
      <BottomNav activeTab="home" />

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
