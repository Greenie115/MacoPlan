'use client'

import { useState, useTransition } from 'react'
import { ArrowLeft, MoreVertical, ClipboardList, RefreshCw, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { macroColors } from '@/lib/design-tokens'
import { Plan, PlanDay } from '@/lib/types/plan'
import { PaywallModal } from '@/components/monetization/paywall-modal'
import { generateGroceryList } from '@/app/actions/grocery-lists'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PlanDetailViewProps {
  plan: Plan
  isGenerated?: boolean
  onSave?: () => void
}

export function PlanDetailView({ plan, isGenerated = false, onSave }: PlanDetailViewProps) {
  const router = useRouter()
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Default to empty array if days are missing (e.g. mock list data)
  const days = plan.days || []
  const currentDay = days[selectedDayIndex]

  const handleSave = () => {
    if (onSave) {
      onSave()
    } else {
      setShowPaywall(true)
    }
  }

  const handleGenerateGroceryList = () => {
    startTransition(async () => {
      const result = await generateGroceryList(plan.id)

      if (result.error) {
        toast.error(result.error)
      } else if (result.listId) {
        toast.success('Grocery list generated!')
        router.push(`/grocery-lists/${result.listId}`)
      }
    })
  }

  if (!currentDay) {
    return <div className="p-8 text-center">No details available for this plan.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex h-[60px] items-center px-4 justify-between max-w-3xl mx-auto w-full">
          <Link 
            href={isGenerated ? "/plans/generate" : "/plans"} 
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="size-6 text-gray-900" />
          </Link>
          <div className="flex items-center gap-2">
            {isGenerated && (
              <button 
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-primary font-semibold hover:bg-primary/5 transition-colors"
              >
                <span className="text-lg">💾</span>
                Save
              </button>
            )}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="size-6 text-gray-900" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Plan Header */}
        <header>
          <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
          <p className="text-gray-500">{plan.dateRange}</p>
        </header>

        {/* Daily Totals Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Daily Totals: {Math.round(plan.calories)} cal avg</h2>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🥩</span>
              <span className="font-medium" style={{ color: macroColors.protein.primary }}>{plan.macros.protein}g</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🍚</span>
              <span className="font-medium" style={{ color: macroColors.carbs.primary }}>{plan.macros.carbs}g</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🥑</span>
              <span className="font-medium" style={{ color: macroColors.fat.primary }}>{plan.macros.fat}g</span>
            </div>
          </div>
          <p className="text-green-600 text-sm font-medium flex items-center gap-1">
            <span className="text-lg">✅</span> Within your targets
          </p>
        </div>

        {/* Actions */}
        <button
          onClick={handleGenerateGroceryList}
          disabled={isPending}
          className="w-full h-12 flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ClipboardList className="size-5" />
          {isPending ? 'Generating...' : 'Generate Grocery List'}
        </button>

        <div className="h-px bg-gray-200" />

        {/* Day Selector */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-2">
            {days.map((day, index) => (
              <button
                key={day.date}
                onClick={() => setSelectedDayIndex(index)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  selectedDayIndex === index
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day.dayOfWeek}
                {selectedDayIndex === index && <span className="text-[10px]">●</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Day Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">{currentDay.dayOfWeek}, {currentDay.date}</h2>
          <p className="text-sm text-gray-500">
            {Math.round(currentDay.calories)} calories • {currentDay.macros.protein}g P, {currentDay.macros.carbs}g C, {currentDay.macros.fat}g F
          </p>
        </div>

        {/* Meals List */}
        <div className="space-y-4">
          {currentDay.meals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <p className="text-sm text-gray-500 capitalize">
                  {meal.type === 'breakfast' ? '🌅' : meal.type === 'lunch' ? '☀️' : meal.type === 'dinner' ? '🌙' : '💪'} {meal.type} - {Math.round(meal.calories)} cal
                </p>
              </div>
              
              <div className="relative h-48 w-full bg-gray-100">
                <Image
                  src={meal.image}
                  alt={meal.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{meal.name}</h3>
                
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium" style={{ color: macroColors.protein.primary }}>🥩 {meal.macros.protein}g</span>
                  <span className="text-sm font-medium" style={{ color: macroColors.carbs.primary }}>🍚 {meal.macros.carbs}g</span>
                  <span className="text-sm font-medium" style={{ color: macroColors.fat.primary }}>🥑 {meal.macros.fat}g</span>
                </div>

                <div className="flex gap-3">
                  <Link 
                    href={meal.recipeId ? `/recipes/${meal.recipeId}` : '#'}
                    className="flex-1 h-10 flex items-center justify-center rounded-lg border border-primary text-primary font-semibold hover:bg-primary/5 transition-colors text-sm"
                  >
                    View Recipe
                  </Link>
                  {isGenerated && (
                    <button className="flex-1 h-10 flex items-center justify-center gap-1 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/5 transition-colors text-sm">
                      <RefreshCw className="size-4" />
                      Swap Meal
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
