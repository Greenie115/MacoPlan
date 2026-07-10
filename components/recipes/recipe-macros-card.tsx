'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

interface RecipeMacrosCardProps {
  initialMacros: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  initialServings: number
}

export function RecipeMacrosCard({
  initialMacros,
  initialServings,
}: RecipeMacrosCardProps) {
  const [servings, setServings] = useState(initialServings)

  const multiplier = servings / initialServings

  const macros = {
    calories: Math.round(initialMacros.calories * multiplier),
    protein: Math.round(initialMacros.protein * multiplier),
    carbs: Math.round(initialMacros.carbs * multiplier),
    fat: Math.round(initialMacros.fat * multiplier),
  }

  const handleIncrement = () => setServings((s) => s + 1)
  const handleDecrement = () => setServings((s) => Math.max(1, s - 1))

  // Calculate percentages for progress bars (assuming standard macro split for visualization)
  const totalGrams = macros.protein + macros.carbs + macros.fat
  const proteinPct = totalGrams > 0 ? Math.round((macros.protein / totalGrams) * 100) : 0
  const carbsPct = totalGrams > 0 ? Math.round((macros.carbs / totalGrams) * 100) : 0
  const fatPct = totalGrams > 0 ? Math.round((macros.fat / totalGrams) * 100) : 0

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border-strong p-5 flex flex-col gap-5">
      <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight">
        Macros Per Serving
      </h2>

      <div className="text-center">
        <span className="text-5xl font-bold text-foreground font-mono tabular-nums">
          {macros.calories}
        </span>
        <span className="text-lg text-muted-foreground ml-1 font-medium">cal</span>
      </div>

      <div className="flex flex-col gap-4">
        {/* Protein */}
        <div className="flex-grow">
          <div className="flex justify-between items-baseline mb-1">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="size-2.5 rounded-full bg-protein shrink-0" aria-hidden="true" />
              Protein
            </span>
            <span className="text-sm font-bold text-protein font-mono tabular-nums">
              {macros.protein}g
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full transition-[width] duration-slow ease-out-quint bg-protein"
              style={{ width: `${proteinPct}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="flex-grow">
          <div className="flex justify-between items-baseline mb-1">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="size-2.5 rounded-full bg-carb shrink-0" aria-hidden="true" />
              Carbs
            </span>
            <span className="text-sm font-bold text-carb font-mono tabular-nums">
              {macros.carbs}g
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full transition-[width] duration-slow ease-out-quint bg-carb"
              style={{ width: `${carbsPct}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="flex-grow">
          <div className="flex justify-between items-baseline mb-1">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="size-2.5 rounded-full bg-fat shrink-0" aria-hidden="true" />
              Fat
            </span>
            <span className="text-sm font-bold text-fat font-mono tabular-nums">
              {macros.fat}g
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full transition-[width] duration-slow ease-out-quint bg-fat"
              style={{ width: `${fatPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-2" />

      <div className="flex justify-between items-center">
        <span className="text-base font-semibold text-foreground">
          Servings
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDecrement}
            className="flex items-center justify-center size-8 rounded-full bg-muted text-icon hover:bg-border transition-colors duration-fast"
            aria-label="Decrease servings"
          >
            <Minus className="size-4" />
          </button>
          <span className="text-lg font-bold w-4 text-center text-foreground font-mono tabular-nums">
            {servings}
          </span>
          <button
            onClick={handleIncrement}
            className="flex items-center justify-center size-8 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors duration-fast"
            aria-label="Increase servings"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
