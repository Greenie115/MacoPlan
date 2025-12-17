'use client'

/**
 * Meal Plans List Client Component
 *
 * Matches the Stitch saved_plans_screen design with:
 * - Sticky header with back button
 * - Tab navigation (All, This Week, Favorites)
 * - Plan cards with 2x2 image grid
 * - Quota footer for free users
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, MoreHorizontal, Plus, ChefHat, Heart, Archive, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MealPlaceholder } from '@/components/meal-plans/meal-placeholder'
import { PaywallModal, type PaywallTrigger } from '@/components/monetization/paywall-modal'
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
import { deleteMealPlan, toggleMealPlanFavorite, archiveMealPlan, type MealPlanWithPreviews } from '@/app/actions/meal-plans'

type TabFilter = 'all' | 'this_week' | 'favorites'

interface MealPlansClientProps {
  initialPlans: MealPlanWithPreviews[]
  quotaInfo: {
    tier: 'free' | 'paid'
    remaining: number
    total: number
    used: number
  } | null
}

export function MealPlansClient({ initialPlans, quotaInfo }: MealPlansClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallTrigger, setPaywallTrigger] = useState<PaywallTrigger>('meal_plan_limit')
  const [plans, setPlans] = useState(initialPlans)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<MealPlanWithPreviews | null>(null)
  const [isPending, startTransition] = useTransition()

  // Filter plans based on active tab
  const filteredPlans = plans.filter((plan) => {
    if (activeTab === 'favorites') {
      return plan.is_favorite
    }
    if (activeTab === 'this_week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(plan.created_at) > weekAgo
    }
    return true
  })

  const handleDeletePlan = (plan: MealPlanWithPreviews) => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!planToDelete) return

    startTransition(async () => {
      const result = await deleteMealPlan(planToDelete.id)
      if (result.success) {
        setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id))
      }
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
    })
  }

  const handleToggleFavorite = async (planId: string) => {
    startTransition(async () => {
      const result = await toggleMealPlanFavorite(planId)
      if (result.success) {
        setPlans((prev) =>
          prev.map((p) =>
            p.id === planId ? { ...p, is_favorite: result.isFavorite ?? !p.is_favorite } : p
          )
        )
      }
    })
  }

  const handleArchivePlan = async (planId: string) => {
    startTransition(async () => {
      const result = await archiveMealPlan(planId)
      if (result.success) {
        setPlans((prev) => prev.filter((p) => p.id !== planId))
      }
    })
  }

  const handleGenerateNew = () => {
    if (quotaInfo && quotaInfo.tier === 'free' && quotaInfo.remaining <= 0) {
      setPaywallTrigger('meal_plan_limit')
      setShowPaywall(true)
    } else {
      router.push('/meal-plans/generate')
    }
  }

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'this_week', label: 'This Week' },
    { key: 'favorites', label: 'Favorites' },
  ]

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sub-header with back button, title, and actions */}
      <div className="bg-background border-b border-border-strong">
        <div className="mx-auto max-w-5xl">
          <div className="flex h-14 items-center px-4">
            <div className="flex size-10 shrink-0 items-center justify-start">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex h-10 w-10 items-center justify-center hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="size-5 text-foreground" />
              </button>
            </div>
            <h1 className="flex-1 text-center text-lg font-semibold leading-tight tracking-[-0.015em] text-foreground">
              Saved Plans
            </h1>
            <div className="flex w-10 shrink-0 items-center justify-end">
              <button
                onClick={handleGenerateNew}
                aria-label="Generate new plan"
                className="flex h-10 w-10 items-center justify-center text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Plus className="size-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-4">
            <div className="flex border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex flex-1 flex-col items-center justify-center border-b-[3px] py-3 transition-colors md:flex-none md:px-6',
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <p className="text-sm font-semibold leading-normal">{tab.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-5xl p-4">
        {filteredPlans.length === 0 ? (
          <EmptyState activeTab={activeTab} onGenerate={handleGenerateNew} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map((plan) => (
              <MealPlanCard
                key={plan.id}
                plan={plan}
                onDelete={handleDeletePlan}
                onToggleFavorite={handleToggleFavorite}
                onArchive={handleArchivePlan}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </main>

      {/* Quota Footer (Free tier only) */}
      {quotaInfo && quotaInfo.tier === 'free' && (
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-card/95 backdrop-blur-sm p-4 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            <p>Free: {quotaInfo.used} of {quotaInfo.total} plans generated</p>
            <button
              onClick={() => {
                setPaywallTrigger('meal_plan_limit')
                setShowPaywall(true)
              }}
              className="font-semibold text-primary hover:underline"
            >
              Upgrade for unlimited plans
            </button>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger={paywallTrigger}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{planToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 focus:ring-destructive"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/**
 * Empty state component
 */
function EmptyState({
  activeTab,
  onGenerate,
}: {
  activeTab: TabFilter
  onGenerate: () => void
}) {
  const messages: Record<TabFilter, { title: string; subtitle: string }> = {
    all: {
      title: 'No meal plans yet',
      subtitle: 'Generate your first personalized meal plan to get started!',
    },
    this_week: {
      title: 'No plans this week',
      subtitle: 'Generate a new meal plan to start tracking your nutrition.',
    },
    favorites: {
      title: 'No favorites yet',
      subtitle: 'Save meal plans you love by tapping the heart icon.',
    },
  }

  const { title, subtitle } = messages[activeTab]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <ChefHat className="size-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2 text-center">{title}</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-xs">{subtitle}</p>
      {activeTab !== 'favorites' && (
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-5" />
          Generate Meal Plan
        </button>
      )}
    </div>
  )
}

/**
 * Individual meal plan card matching Stitch design
 * Optimized for responsive grid layout
 */
function MealPlanCard({
  plan,
  onDelete,
  onToggleFavorite,
  onArchive,
  isPending,
}: {
  plan: MealPlanWithPreviews
  onDelete: (plan: MealPlanWithPreviews) => void
  onToggleFavorite: (planId: string) => void
  onArchive: (planId: string) => void
  isPending: boolean
}) {
  // Meal types for placeholder grid positions
  const GRID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

  // Build preview images array - use actual images when available, fallback otherwise
  const previewImages = Array.from({ length: 4 }, (_, index) => {
    const preview = plan.preview_images?.[index]
    if (preview?.image_url) {
      // Use direct image URL if available
      return {
        src: preview.image_url,
        key: `url-${preview.fatsecret_id || index}`,
        hasImage: true,
      }
    } else {
      // Fall back to placeholder
      return {
        src: null,
        key: `fallback-${index}`,
        hasImage: false,
        mealType: GRID_MEAL_TYPES[index],
      }
    }
  })

  return (
    <Link href={`/meal-plans/${plan.id}`}>
      <div className="relative flex h-full flex-col items-stretch justify-start rounded-2xl bg-card shadow-sm border border-border-strong p-4 hover:shadow-md transition-shadow">
        {/* More Options Button */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                aria-label="More options"
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              >
                <MoreHorizontal className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleFavorite(plan.id)
                }}
                disabled={isPending}
              >
                <Heart className={cn("size-4 mr-2", plan.is_favorite && "fill-destructive text-destructive")} />
                {plan.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onArchive(plan.id)
                }}
                disabled={isPending}
              >
                <Archive className="size-4 mr-2" />
                Archive Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(plan)
                }}
                disabled={isPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4 mr-2" />
                Delete Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 2x2 Image Grid - using actual meal images */}
        <div className="grid grid-cols-2 gap-1.5 mb-4 max-w-[200px]">
          {previewImages.map((image, index) => (
            <div
              key={image.key}
              className="aspect-square rounded-lg overflow-hidden bg-muted relative"
            >
              {image.hasImage && image.src ? (
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="100px"
                  className="object-cover"
                  quality={90}
                  unoptimized
                />
              ) : (
                <MealPlaceholder
                  mealType={image.mealType || GRID_MEAL_TYPES[index]}
                  className="w-full h-full"
                  compact
                />
              )}
            </div>
          ))}
        </div>

        {/* Plan Info */}
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold leading-tight tracking-[-0.015em] text-foreground pr-8 line-clamp-2">
              {plan.name}
            </h2>
            <p className="text-sm font-normal leading-normal text-muted-foreground">
              {formatDateRange(plan.start_date, plan.end_date)}
            </p>
            <p className="text-sm font-normal leading-normal text-muted-foreground">
              {plan.target_calories.toLocaleString()} cal/day avg
            </p>
          </div>

          {/* Macro Display */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="text-protein">🥩</span>
              {plan.protein_grams}g
            </span>
            <span className="flex items-center gap-1">
              <span className="text-carb">🍚</span>
              {plan.carb_grams}g
            </span>
            <span className="flex items-center gap-1">
              <span className="text-fat">🥑</span>
              {plan.fat_grams}g
            </span>
          </div>

          {/* View Plan Button - pushed to bottom */}
          <div className="mt-auto pt-2">
            <button className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-primary bg-card text-sm font-semibold leading-normal text-primary hover:bg-primary/10 transition-colors">
              <span className="truncate">View Plan</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

/**
 * Format date range for display
 */
function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  const endDay = end.getDate()
  const year = end.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
}
