'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useDashboardData } from '@/lib/hooks/use-dashboard-data'
import { useUserProfile } from '@/lib/hooks/use-user-profile'
import { getRecentPlansWithProgress, archiveOldCompletedPlans } from '@/app/actions/plans'
import { TopAppBar } from '@/components/layout/top-app-bar'
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
  const onboardingStore = useOnboardingStore()
  const dashboardStore = useDashboardStore()
  const { macros, progress, stats, recentPlans } = useDashboardData()
  const { userName, avatarUrl } = useUserProfile()
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

      // 1. Check if we have local data
      if (onboardingStore.targetCalories === null || onboardingStore.targetCalories === undefined) {
        // No local data, check Supabase profile
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (profile && profile.onboarding_completed) {
            // Hydrate store from profile
            // Convert height cm -> feet/inches
            const totalInches = profile.height_cm / 2.54
            const feet = Math.floor(totalInches / 12)
            const inches = Math.round(totalInches % 12)

            onboardingStore.setGoal(profile.goal)
            onboardingStore.setPersonalStats({
              age: profile.age,
              weight: profile.weight_kg,
              weightUnit: 'kg', // Default to kg from DB
              heightFeet: feet,
              heightInches: inches,
              sex: profile.sex,
            })
            onboardingStore.setActivityLevel(profile.activity_level)
            onboardingStore.setDietaryPreferences({
              dietaryStyle: profile.dietary_style,
              allergies: profile.allergies,
              foodsToAvoid: profile.foods_to_avoid,
            })
            onboardingStore.setExperienceLevel({
              fitnessExperience: profile.fitness_experience,
              trackingExperience: profile.tracking_experience,
              mealPrepSkills: profile.meal_prep_skills,
            })

            // Recalculate macros to ensure consistency
            onboardingStore.calculateMacros()
          } else {
            // No profile or incomplete -> Redirect to onboarding
            router.replace('/onboarding/1')
            return
          }
        }
      }

      // 2. Fetch real plans data from Supabase
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
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background group/design-root overflow-x-hidden pb-24 font-display items-center">
      <div className="w-full max-w-md">
        {/* Top App Bar */}
        <TopAppBar userName={userName} avatarUrl={avatarUrl} />

        {/* Greeting */}
        <GreetingHeader
          userName={userName}
          currentStreak={stats.currentStreak}
          currentGoal={onboardingStore.goal || undefined}
          activePlanName={recentPlans.find((p) => p.isActive)?.name}
          activePlanDay={recentPlans.find((p) => p.isActive)?.daysCompleted}
          activePlanTotalDays={recentPlans.find((p) => p.isActive)?.totalDays}
        />

        {/* Today's Macro Target */}
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

        {/* Generate New Meal Plan CTA */}
        <GeneratePlanCTA hasActivePlan={recentPlans.some((p) => p.isActive)} />

        {/* Recent Plans Section */}
        {recentPlans.length > 0 && (
          <>
            <h2 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-3">
              Recent Plans
            </h2>
            <RecentPlansCarousel plans={recentPlans} />
          </>
        )}

        {/* Bottom spacing for fixed nav */}
        <div className="h-4" />
      </div>

      {/* Bottom Navigation */}
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
