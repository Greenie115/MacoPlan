'use client'

/**
 * Meal Plan View Component (Stitch Design)
 *
 * Matches the Stitch generated_meal_plan_view design exactly
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, MoreVertical, RefreshCw, Heart, Clock, Archive, Trash2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { generateShoppingListFromMealPlan } from '@/app/actions/shopping-lists'
import { toggleMealPlanFavorite, deleteMealPlan, archiveMealPlan } from '@/app/actions/meal-plans'
import { cn } from '@/lib/utils'
import { resizeSpoonacularImage } from '@/lib/utils/spoonacular-image'
import { SwapMealModal } from './swap-meal-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { MealPlan, MealPlanMeal } from '@/lib/types/database'

interface MealPlanViewProps {
  plan: MealPlan
  meals: MealPlanMeal[]
}

export default function MealPlanView({ plan, meals }: MealPlanViewProps) {
  const router = useRouter()
  const [isGeneratingList, setIsGeneratingList] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(plan.is_favorite)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)

  // State for swap meal modal
  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [mealToSwap, setMealToSwap] = useState<MealPlanMeal | null>(null)

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Handle save/favorite toggle
  async function handleSave() {
    setIsSaving(true)
    try {
      const result = await toggleMealPlanFavorite(plan.id)
      if (result.success) {
        setIsSaved(result.isFavorite ?? !isSaved)
        toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites')
      } else {
        toast.error(result.error || 'Failed to save plan')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle swap meal click
  function handleSwapMeal(meal: MealPlanMeal) {
    setMealToSwap(meal)
    setSwapModalOpen(true)
  }

  // Handle swap complete - refresh router to get new data
  function handleSwapComplete() {
    setSwapModalOpen(false)
    setMealToSwap(null)
    router.refresh()
  }

  // Handle delete plan
  function handleDeletePlan() {
    setDeleteDialogOpen(true)
  }

  async function confirmDelete() {
    startTransition(async () => {
      const result = await deleteMealPlan(plan.id)
      if (result.success) {
        toast.success('Meal plan deleted')
        router.push('/meal-plans')
      } else {
        toast.error(result.error || 'Failed to delete plan')
      }
      setDeleteDialogOpen(false)
    })
  }

  // Handle archive plan
  async function handleArchivePlan() {
    startTransition(async () => {
      const result = await archiveMealPlan(plan.id)
      if (result.success) {
        toast.success('Meal plan archived')
        router.push('/meal-plans')
      } else {
        toast.error(result.error || 'Failed to archive plan')
      }
    })
  }

  // Handle duplicate/copy plan link
  function handleCopyLink() {
    const url = `${window.location.origin}/meal-plans/${plan.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  // Group meals by day
  const mealsByDay = meals.reduce((acc, meal) => {
    if (!acc[meal.day_index]) {
      acc[meal.day_index] = []
    }
    acc[meal.day_index].push(meal)
    return acc
  }, {} as Record<number, MealPlanMeal[]>)

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  async function handleGenerateShoppingList() {
    setIsGeneratingList(true)
    setError(null)

    try {
      const result = await generateShoppingListFromMealPlan(plan.id)

      if (!result.success) {
        setError(result.error || 'Failed to generate shopping list')
        setIsGeneratingList(false)
        return
      }

      // Navigate to shopping list
      router.push(`/meal-plans/${plan.id}/shopping-list`)
    } catch (err) {
      setError('An unexpected error occurred')
      setIsGeneratingList(false)
    }
  }

  // Calculate totals
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0) * meal.serving_multiplier, 0)
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein_grams || 0) * meal.serving_multiplier, 0)
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carb_grams || 0) * meal.serving_multiplier, 0)
  const totalFat = meals.reduce((sum, meal) => sum + (meal.fat_grams || 0) * meal.serving_multiplier, 0)

  const avgCalories = Math.round(totalCalories / plan.total_days)

  // Get selected day meals
  const selectedDayMeals = mealsByDay[selectedDay] || []
  const dayCalories = selectedDayMeals.reduce((sum, meal) => sum + (meal.calories || 0) * meal.serving_multiplier, 0)
  const dayProtein = selectedDayMeals.reduce((sum, meal) => sum + (meal.protein_grams || 0) * meal.serving_multiplier, 0)
  const dayCarbs = selectedDayMeals.reduce((sum, meal) => sum + (meal.carb_grams || 0) * meal.serving_multiplier, 0)
  const dayFat = selectedDayMeals.reduce((sum, meal) => sum + (meal.fat_grams || 0) * meal.serving_multiplier, 0)

  // Helper: Get meal type icon and label
  const getMealTypeLabel = (mealType: string, calories?: number) => {
    const labels = {
      breakfast: { icon: '🌅', label: 'Breakfast' },
      lunch: { icon: '☀️', label: 'Lunch' },
      dinner: { icon: '🌙', label: 'Dinner' },
      snack: { icon: '💪', label: 'Snack' },
    }
    const data = labels[mealType as keyof typeof labels] || labels.snack
    return `${data.icon} ${data.label}${calories ? ` - ${Math.round(calories)} cal` : ''}`
  }

  // Check if within targets
  const isWithinTargets = Math.abs(avgCalories - plan.target_calories) <= plan.target_calories * 0.1

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="mx-auto max-w-7xl p-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex size-12 shrink-0 items-center justify-center -ml-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="size-6 text-icon" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
            className={cn(
              'flex min-w-[48px] cursor-pointer items-center justify-center gap-1.5 rounded-lg h-12 px-3 text-base font-semibold transition-colors disabled:opacity-50',
              isSaved
                ? 'text-red-500 bg-red-50'
                : 'text-primary hover:bg-primary/10'
            )}
          >
            <Heart className={cn('size-5', isSaved && 'fill-current')} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="More options"
                aria-haspopup="menu"
                className="flex size-12 shrink-0 items-center justify-center hover:bg-muted rounded-lg transition-colors"
              >
                <MoreVertical className="size-6 text-icon" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="size-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchivePlan} disabled={isPending}>
                <Archive className="size-4 mr-2" />
                Archive Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeletePlan}
                disabled={isPending}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="size-4 mr-2" />
                Delete Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="mx-auto max-w-7xl">
        {/* Large Screen: Two-column layout with sticky sidebar */}
        <div className="lg:flex lg:gap-8 lg:p-6">
          {/* Sidebar - Summary & Controls (sticky on large screens) */}
          <aside className="lg:w-80 lg:shrink-0">
            <div className="lg:sticky lg:top-[76px]">
              {/* Page Title */}
              <header className="px-4 pt-2 pb-4 lg:px-0 lg:pt-0">
                <h1 className="text-foreground tracking-tight text-[28px] font-semibold leading-tight">
                  {plan.name}
                </h1>
                <p className="text-muted-foreground text-base font-normal leading-normal pt-1">
                  {new Date(plan.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                  {new Date(plan.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </header>

              {/* Daily Totals Summary Card */}
              <div className="px-4 pb-4 lg:px-0">
                <div className="flex flex-col rounded-2xl shadow-sm bg-card p-4 border border-border-strong">
                  <div className="flex items-center justify-between">
                    <p className="text-foreground text-lg font-semibold leading-tight tracking-[-0.015em]">
                      {plan.total_days === 1
                        ? `Today: ${Math.round(dayCalories).toLocaleString()} cal`
                        : `Daily Average: ${avgCalories.toLocaleString()} cal`}
                    </p>
                    <span className="text-sm text-muted-foreground">
                      Target: {plan.target_calories.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar toward target */}
                  <div className="flex items-center gap-3 pt-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          isWithinTargets ? 'bg-success' : avgCalories > plan.target_calories ? 'bg-warning' : 'bg-primary'
                        )}
                        style={{ width: `${Math.min(100, (avgCalories / plan.target_calories) * 100)}%` }}
                      />
                    </div>
                    <span className={cn(
                      'text-sm font-medium min-w-[45px] text-right',
                      isWithinTargets ? 'text-success' : 'text-muted-foreground'
                    )}>
                      {Math.round((avgCalories / plan.target_calories) * 100)}%
                    </span>
                  </div>

                  {/* Macro breakdown */}
                  <div className="flex items-center gap-4 pt-3">
                    <span className="text-base font-normal text-protein">
                      🥩 {Math.round(plan.total_days === 1 ? dayProtein : totalProtein / plan.total_days)}g
                    </span>
                    <span className="text-base font-normal text-carb">
                      🍚 {Math.round(plan.total_days === 1 ? dayCarbs : totalCarbs / plan.total_days)}g
                    </span>
                    <span className="text-base font-normal text-fat">
                      🥑 {Math.round(plan.total_days === 1 ? dayFat : totalFat / plan.total_days)}g
                    </span>
                  </div>

                  {isWithinTargets && (
                    <p className="text-success text-base font-normal leading-normal pt-2">
                      ✅ Within your targets
                    </p>
                  )}
                </div>
              </div>

              {/* Generate Grocery List Button */}
              <div className="flex px-4 pb-4 lg:px-0">
                <button
                  onClick={handleGenerateShoppingList}
                  disabled={isGeneratingList}
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 text-primary bg-card text-base font-semibold leading-normal border-2 border-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  {isGeneratingList ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="size-4 animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    <span className="truncate">📋 Generate Grocery List</span>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mx-4 mb-4 lg:mx-0 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Day Selector Pills (for weekly plans) - Vertical on large screens */}
              {plan.total_days > 1 && (
                <>
                  <div className="h-px bg-border mx-4 lg:mx-0 mb-4"></div>
                  <div className="px-4 pb-4 lg:px-0">
                    {/* Horizontal scroll on mobile */}
                    <div className="flex space-x-2 overflow-x-auto pb-2 lg:hidden scrollbar-hide">
                      {Object.keys(mealsByDay).map((dayIndex) => {
                        const dayNum = Number(dayIndex)
                        const isActive = selectedDay === dayNum
                        return (
                          <button
                            key={dayIndex}
                            onClick={() => setSelectedDay(dayNum)}
                            className={cn(
                              'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold h-10 transition-colors',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                          >
                            {dayNames[dayNum % 7]}{isActive && ' ●'}
                          </button>
                        )
                      })}
                    </div>
                    {/* Vertical list on large screens */}
                    <div className="hidden lg:flex lg:flex-col lg:gap-2">
                      {Object.keys(mealsByDay).map((dayIndex) => {
                        const dayNum = Number(dayIndex)
                        const isActive = selectedDay === dayNum
                        const dayMeals = mealsByDay[dayNum] || []
                        const dayTotalCal = dayMeals.reduce((sum, m) => sum + (m.calories || 0) * m.serving_multiplier, 0)
                        return (
                          <button
                            key={dayIndex}
                            onClick={() => setSelectedDay(dayNum)}
                            className={cn(
                              'flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors text-left',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground hover:bg-muted/80'
                            )}
                          >
                            <span>{fullDayNames[dayNum % 7]}</span>
                            <span className={cn(
                              'text-xs',
                              isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            )}>
                              {Math.round(dayTotalCal)} cal
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* Main Content - Meals */}
          <main className="flex-1 min-w-0">
            {/* Day Header */}
            <header className="px-4 pt-2 pb-4 lg:px-0 lg:pt-0">
              <h2 className="text-xl font-bold text-foreground">
                {plan.total_days === 1
                  ? 'Today\'s Meals'
                  : `${fullDayNames[selectedDay % 7]}'s Meals`}
              </h2>
              <p className="text-sm text-muted-foreground pt-1">
                {Math.round(dayCalories)} calories ・ {Math.round(dayProtein)}g P, {Math.round(dayCarbs)}g C, {Math.round(dayFat)}g F
              </p>
            </header>

            {/* Meal Cards - Grid on large screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-4 pb-8 lg:px-0">
              {selectedDayMeals
                .sort((a, b) => a.meal_order - b.meal_order)
                .map((meal) => (
                  <div
                    key={meal.id}
                    className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm border border-border-strong"
                  >
                    {/* Hero Image - Using high-quality 636x393 (watermark-free) */}
                    {meal.recipe_image_url && (
                      <div className="relative h-[180px] w-full bg-muted">
                        <Image
                          src={resizeSpoonacularImage(meal.recipe_image_url, '636x393')}
                          alt={meal.recipe_title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover"
                          quality={90}
                          priority={meal.meal_order === 0}
                        />
                        {/* Meal Type Badge */}
                        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-foreground">
                          {getMealTypeLabel(meal.meal_type).split(' - ')[0]}
                        </div>
                      </div>
                    )}

                    {/* Meal Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
                        {meal.recipe_title}
                      </h3>

                      {/* Calories and Prep Time */}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        {meal.calories != null && (
                          <span className="font-medium text-foreground">
                            {Math.round((meal.calories || 0) * meal.serving_multiplier)} cal
                          </span>
                        )}
                        {meal.ready_in_minutes != null && (
                          <>
                            <span className="text-border">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-4 text-icon" />
                              {meal.ready_in_minutes} min
                            </span>
                          </>
                        )}
                      </div>

                      {/* Macro Row */}
                      <div className="flex items-center gap-3 mb-4 text-sm">
                        <span className="font-normal text-protein">
                          🥩 {Math.round((meal.protein_grams || 0) * meal.serving_multiplier)}g
                        </span>
                        <span className="font-normal text-carb">
                          🍚 {Math.round((meal.carb_grams || 0) * meal.serving_multiplier)}g
                        </span>
                        <span className="font-normal text-fat">
                          🥑 {Math.round((meal.fat_grams || 0) * meal.serving_multiplier)}g
                        </span>
                      </div>

                      {/* Action Buttons - pushed to bottom */}
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (meal.spoonacular_id) {
                              router.push(`/recipes/spoonacular/${meal.spoonacular_id}`)
                            } else if (meal.recipe_id) {
                              router.push(`/recipes/${meal.recipe_id}`)
                            }
                          }}
                          className="flex h-10 flex-1 items-center justify-center rounded-xl border-2 border-primary bg-card text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSwapMeal(meal)
                          }}
                          className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl border-2 border-primary bg-card text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                          <RefreshCw className="size-4" />
                          Swap
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </main>
        </div>
      </div>

      {/* Swap Meal Modal */}
      {swapModalOpen && mealToSwap && (
        <SwapMealModal
          isOpen={swapModalOpen}
          onClose={() => {
            setSwapModalOpen(false)
            setMealToSwap(null)
          }}
          meal={mealToSwap}
          targetCalories={plan.target_calories}
          onSwapComplete={handleSwapComplete}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{plan.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
