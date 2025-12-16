'use client'

/**
 * Meal Plan Generator Form (Stitch Design)
 *
 * Bottom sheet modal style form matching the Stitch UI design
 * Features pill buttons, macro display with emojis, and brand styling
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { generateMealPlan, getMealPlanQuotaInfo } from '@/app/actions/meal-plans'
import { cn } from '@/lib/utils'
import { macroColors } from '@/lib/design-tokens'

interface MealPlanGeneratorFormProps {
  userProfile: {
    targetCalories: number
    proteinGrams: number
    carbGrams: number
    fatGrams: number
    dietaryStyle: string | null
    allergies: string[]
  }
}

type PlanDuration = '1' | '3' | '7'

export default function MealPlanGeneratorForm({ userProfile }: MealPlanGeneratorFormProps) {
  const router = useRouter()
  const [duration, setDuration] = useState<PlanDuration>('7')
  const [mealsPerDay, setMealsPerDay] = useState(4)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quotaInfo, setQuotaInfo] = useState<{
    tier: 'free' | 'paid'
    remaining: number
    total: number
    used: number
  } | null>(null)

  // Fetch quota info on mount
  useEffect(() => {
    async function fetchQuota() {
      const result = await getMealPlanQuotaInfo()
      if (result.success && result.data) {
        setQuotaInfo(result.data)
      }
    }
    fetchQuota()
  }, [])

  async function handleGenerate() {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateMealPlan({
        timeFrame: duration === '1' ? 'day' : 'week',
        numberOfDays: parseInt(duration, 10),
        mealsPerDay,
      })

      if (!result.success) {
        setError(result.error || 'Failed to generate meal plan')
        setIsGenerating(false)
        return
      }

      // Navigate to the generated meal plan
      if (result.data?.mealPlan) {
        router.push(`/meal-plans/${result.data.mealPlan.id}`)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsGenerating(false)
    }
  }

  // Format dietary preferences for display
  const dietaryPreferences = []
  if (userProfile.dietaryStyle && userProfile.dietaryStyle !== 'none') {
    dietaryPreferences.push(
      userProfile.dietaryStyle.charAt(0).toUpperCase() + userProfile.dietaryStyle.slice(1)
    )
  }
  if (userProfile.allergies.length > 0) {
    dietaryPreferences.push(...userProfile.allergies.map((a) => `No ${a}`))
  }

  const canGenerate = quotaInfo?.remaining !== 0 || quotaInfo?.tier !== 'free'

  return (
    <div className="min-h-screen bg-background">
      {/* Sub-header with back button and title */}
      <div className="bg-background border-b border-border-strong">
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => router.back()}
            className="flex size-10 items-center justify-center rounded-full hover:bg-muted transition-colors -ml-2"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5 text-icon" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Generate Meal Plan</h1>
          <div className="size-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Plan Duration Section */}
        <div>
          <p className="text-foreground text-base font-medium pb-3">Plan Duration</p>
          <div className="flex h-12 items-center rounded-full bg-muted p-1.5">
            {(['1', '3', '7'] as PlanDuration[]).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  'flex h-full flex-1 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200',
                  duration === d
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {d === '1' ? '1 Day' : d === '3' ? '3 Days' : '7 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Meals Per Day Section */}
        <div>
          <p className="text-foreground text-base font-medium pb-3">Meals Per Day</p>
          <div className="flex h-12 items-center rounded-full bg-muted p-1.5">
            {[3, 4, 5, 6].map((m) => (
              <button
                key={m}
                onClick={() => setMealsPerDay(m)}
                className={cn(
                  'flex h-full flex-1 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200',
                  mealsPerDay === m
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Preferences Section */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-foreground text-base font-medium">Dietary Preferences</p>
            <Link
              href="/profile/editprofile"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Edit Preferences
            </Link>
          </div>
          <p className="text-muted-foreground text-sm pt-1">
            {dietaryPreferences.length > 0 ? (
              <>✓ {dietaryPreferences.join(', ')}</>
            ) : (
              <span className="text-muted-foreground/60">No preferences set</span>
            )}
          </p>
        </div>

        {/* Target Macros Section */}
        <div>
          <p className="text-foreground text-base font-medium pb-3">Target Macros (per day)</p>
          <div className="grid grid-cols-4 gap-3">
            {/* Protein */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-protein/10 p-3 text-center">
              <span className="text-2xl">{macroColors.protein.emoji}</span>
              <span className="text-sm font-semibold text-protein mt-1">
                {userProfile.proteinGrams}g
              </span>
            </div>
            {/* Carbs */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-carb/10 p-3 text-center">
              <span className="text-2xl">🍚</span>
              <span className="text-sm font-semibold text-carb mt-1">
                {userProfile.carbGrams}g
              </span>
            </div>
            {/* Fat */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-fat/10 p-3 text-center">
              <span className="text-2xl">{macroColors.fat.emoji}</span>
              <span className="text-sm font-semibold text-fat mt-1">
                {userProfile.fatGrams}g
              </span>
            </div>
            {/* Total Calories */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-muted p-3 text-center">
              <span className="text-sm font-semibold text-foreground">
                {userProfile.targetCalories.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">cal total</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-border" />

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* Status & Actions */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Quota Info */}
          {quotaInfo && (
            <p className="text-center text-sm text-muted-foreground">
              {quotaInfo.tier === 'free' ? (
                <>Free Plan: {quotaInfo.remaining} of {quotaInfo.total} plans remaining</>
              ) : (
                <>Pro Plan: {quotaInfo.remaining} of {quotaInfo.total} plans remaining this month</>
              )}
            </p>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !canGenerate}
            className={cn(
              'flex h-14 w-full items-center justify-center rounded-full text-base font-semibold shadow-lg transition-all active:scale-[0.98]',
              canGenerate
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : !canGenerate ? (
              'Upgrade to Generate More Plans'
            ) : (
              'Generate My Plan'
            )}
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => router.back()}
            className="flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>

          {/* Upgrade Link */}
          {!canGenerate && (
            <p className="text-sm text-center text-muted-foreground">
              You&apos;ve used all your free meal plans.{' '}
              <Link href="/pricing" className="text-primary hover:underline font-semibold">
                Upgrade to Pro
              </Link>{' '}
              for unlimited plans.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
