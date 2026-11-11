'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MealCard, type MealImage } from './meal-card'
import { ShoppingListPanel } from './shopping-list-panel'
import { MacroSplit } from '@/components/ui/macro-split'
import { cn } from '@/lib/utils'
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
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your prep plan</h1>
          <p className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
            {totalContainers} containers &middot; ~{estimatedPrepTimeMins} min prep
          </p>
        </div>
        <Button asChild size="lg">
          <Link href={`/meal-plans/${planId}/prep-day`}>
            Start prep day
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </header>

      <div className="grid gap-5 rounded-2xl border border-border-strong bg-card p-5 shadow-xs sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
        <div>
          <div role="tablist" aria-label="Day type" className="inline-flex rounded-lg bg-muted p-1">
            {(['training', 'rest'] as const).map((type) => (
              <button
                key={type}
                role="tab"
                aria-selected={dayType === type}
                onClick={() => setDayType(type)}
                className={cn(
                  'rounded-md px-3.5 py-1.5 text-sm font-medium capitalize transition-colors duration-fast',
                  dayType === type ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {type} day
              </button>
            ))}
          </div>
          <p className="mt-4 font-display text-4xl font-extrabold tabular-nums tracking-tight">
            {currentDay.daily_totals.calories.toLocaleString()}
            <span className="ml-2 font-sans text-base font-medium tracking-normal text-muted-foreground">kcal</span>
          </p>
        </div>
        <MacroSplit
          protein={currentDay.daily_totals.protein_g}
          carbs={currentDay.daily_totals.carbs_g}
          fat={currentDay.daily_totals.fat_g}
          className="[&_dl]:text-sm [&>div]:h-2"
        />
      </div>

      <Tabs defaultValue="meals">
        <TabsList>
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="shopping">Shopping list</TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="pt-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
