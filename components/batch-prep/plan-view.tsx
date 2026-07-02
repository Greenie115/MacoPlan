'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MealCard, type MealImage } from './meal-card'
import { ShoppingListPanel } from './shopping-list-panel'
import { macroColors } from '@/lib/design-tokens'
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
  const currentDay = dayType === 'training' ? trainingDay : restDay

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your prep plan</h1>
          <p className="text-muted-foreground">
            {totalContainers} containers &middot; ~{estimatedPrepTimeMins} min prep
          </p>
        </div>
        <Link href={`/meal-plans/${planId}/prep-day`}>
          <Button className="rounded-xl font-bold">
            Start prep day
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </header>

      <div className="flex gap-2">
        <Button
          variant={dayType === 'training' ? 'default' : 'outline'}
          onClick={() => setDayType('training')}
          className="rounded-xl font-bold"
        >
          Training day
        </Button>
        <Button
          variant={dayType === 'rest' ? 'default' : 'outline'}
          onClick={() => setDayType('rest')}
          className="rounded-xl font-bold"
        >
          Rest day
        </Button>
      </div>

      <Tabs defaultValue="meals">
        <TabsList>
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="shopping">Shopping list</TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl bg-card shadow-sm border border-border-strong p-4 text-sm">
            <span className="font-bold text-foreground">{currentDay.daily_totals.calories} cal</span>
            <span className="flex items-center gap-1.5 font-medium text-protein">
              <span>{macroColors.protein.emoji}</span>
              {currentDay.daily_totals.protein_g}g
            </span>
            <span className="flex items-center gap-1.5 font-medium text-carb">
              <span>{macroColors.carbs.emoji}</span>
              {currentDay.daily_totals.carbs_g}g
            </span>
            <span className="flex items-center gap-1.5 font-medium text-fat">
              <span>{macroColors.fat.emoji}</span>
              {currentDay.daily_totals.fat_g}g
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDay.meals.map((m, i) => (
              <MealCard key={i} meal={m} image={mealImages?.[m.name]} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shopping">
          <ShoppingListPanel items={shoppingList} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
