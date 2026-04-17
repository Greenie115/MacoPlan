'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MealCard, type MealImage } from './meal-card'
import { ShoppingListPanel } from './shopping-list-panel'
import type { DayPlan, ShoppingItem, ContainerAssignment } from '@/lib/types/batch-prep'

interface Props {
  planId: string
  trainingDay: DayPlan
  restDay: DayPlan
  shoppingList: ShoppingItem[]
  containerAssignments: ContainerAssignment[]
  totalContainers: number
  estimatedPrepTimeMins: number
  mealImages?: Record<string, MealImage>
}

export function PlanView({
  planId,
  trainingDay,
  restDay,
  shoppingList,
  totalContainers,
  estimatedPrepTimeMins,
  mealImages,
}: Props) {
  const [dayType, setDayType] = useState<'training' | 'rest'>('training')
  const [tab, setTab] = useState<'meals' | 'shopping'>('meals')
  const currentDay = dayType === 'training' ? trainingDay : restDay

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your prep plan</h1>
          <p className="text-muted-foreground">
            {totalContainers} containers &middot; ~{estimatedPrepTimeMins} min prep
          </p>
        </div>
        <Link href={`/meal-plans/${planId}/prep-day`}>
          <Button>Start prep day &rarr;</Button>
        </Link>
      </header>

      <div className="flex gap-2">
        <Button
          variant={dayType === 'training' ? 'default' : 'outline'}
          onClick={() => setDayType('training')}
        >
          Training day
        </Button>
        <Button
          variant={dayType === 'rest' ? 'default' : 'outline'}
          onClick={() => setDayType('rest')}
        >
          Rest day
        </Button>
      </div>

      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 ${tab === 'meals' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setTab('meals')}
        >
          Meals
        </button>
        <button
          className={`px-4 py-2 ${tab === 'shopping' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setTab('shopping')}
        >
          Shopping list
        </button>
      </div>

      {tab === 'meals' && (
        <>
          <div className="flex gap-4 text-sm">
            <span><strong>{currentDay.daily_totals.calories}</strong> cal</span>
            <span><strong>{currentDay.daily_totals.protein_g}</strong>g P</span>
            <span><strong>{currentDay.daily_totals.carbs_g}</strong>g C</span>
            <span><strong>{currentDay.daily_totals.fat_g}</strong>g F</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDay.meals.map((m, i) => (
              <MealCard key={i} meal={m} image={mealImages?.[m.name]} />
            ))}
          </div>
        </>
      )}

      {tab === 'shopping' && <ShoppingListPanel items={shoppingList} />}
    </main>
  )
}
