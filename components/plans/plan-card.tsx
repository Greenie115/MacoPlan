'use client'

import { MoreHorizontal, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Plan } from '@/lib/types/plan'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { macroColors } from '@/lib/design-tokens'
import { MealPlaceholder } from '@/components/meal-plans/meal-placeholder'

interface PlanCardProps {
  plan: Plan
}

// Meal types for placeholder grid positions
const GRID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export function PlanCard({ plan }: PlanCardProps) {
  // Take first 4 images (or fewer if not available)
  const gridImages = plan.images.slice(0, 4)

  return (
    <div className="relative flex flex-col items-stretch justify-start rounded-2xl bg-card shadow-sm border border-border-strong p-4 space-y-4 transition-shadow duration-[var(--duration-base)] ease-out-quint hover:shadow-md">
      {/* Context Menu */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm text-icon hover:bg-card hover:text-foreground transition-colors">
              <MoreHorizontal className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Plan</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-2 pr-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted"
          >
            {gridImages[i] ? (
              <Image
                src={gridImages[i]}
                alt={`Plan image ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <MealPlaceholder
                mealType={GRID_MEAL_TYPES[i]}
                className="w-full h-full"
                compact
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold leading-tight text-foreground">
            {plan.title}
          </h2>
          <p className="text-sm font-medium text-muted-foreground">{plan.dateRange}</p>
          <p className="text-sm font-medium text-muted-foreground">
            <span className="font-mono tabular-nums">{plan.calories.toLocaleString()}</span> cal/day avg
          </p>
        </div>

        {/* Macros */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5 font-medium text-protein">
            <span className="text-lg">{macroColors.protein.emoji}</span>
            <span className="font-mono tabular-nums">{plan.macros.protein}g</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-carb">
            <span className="text-lg">{macroColors.carbs.emoji}</span>
            <span className="font-mono tabular-nums">{plan.macros.carbs}g</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-fat">
            <span className="text-lg">{macroColors.fat.emoji}</span>
            <span className="font-mono tabular-nums">{plan.macros.fat}g</span>
          </span>
        </div>

        {/* Action Button */}
        <Link
          href={`/meal-plans/${plan.id}`}
          className="group flex h-10 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-primary bg-primary/5 text-sm font-bold text-coral-700 transition-colors duration-[var(--duration-fast)] ease-out-quint hover:bg-primary/10 dark:text-primary"
        >
          <span className="truncate">View Plan</span>
          <ArrowRight className="size-4 transition-transform duration-[var(--duration-fast)] ease-out-quint group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
