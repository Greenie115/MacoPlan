'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { macroColors } from '@/lib/design-tokens'
import { RecipeMacros } from '@/lib/types/recipe'

interface RecipeMacrosCardProps {
  initialMacros: RecipeMacros
  initialServings?: number
}

export function RecipeMacrosCard({
  initialMacros,
  initialServings = 1,
}: RecipeMacrosCardProps) {
  const [servings, setServings] = useState(initialServings)

  // Calculate macros based on servings
  const currentMacros = {
    calories: Math.round(initialMacros.calories * servings),
    protein: Math.round(initialMacros.protein * servings),
    carbs: Math.round(initialMacros.carbs * servings),
    fat: Math.round(initialMacros.fat * servings),
  }

  const handleDecrement = () => {
    if (servings > 1) {
      setServings(servings - 1)
    }
  }

  const handleIncrement = () => {
    setServings(servings + 1)
  }

  return (
    <div className="px-4 py-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Servings Counter */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">Servings</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDecrement}
              disabled={servings <= 1}
              className="flex items-center justify-center size-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease servings"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-lg font-semibold text-gray-900 w-8 text-center">
              {servings}
            </span>
            <button
              onClick={handleIncrement}
              className="flex items-center justify-center size-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              aria-label="Increase servings"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Total Calories */}
        <div className="text-center mb-6">
          <p className="text-5xl font-bold text-gray-900">
            {currentMacros.calories}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Calories</p>
        </div>

        {/* Macros Breakdown */}
        <div className="space-y-4">
          {/* Protein */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-medium"
                style={{ color: macroColors.protein.primary }}
              >
                {macroColors.protein.emoji} Protein
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {currentMacros.protein}g
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: '100%',
                  backgroundColor: macroColors.protein.primary,
                }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-medium"
                style={{ color: macroColors.carbs.primary }}
              >
                {macroColors.carbs.emoji} Carbs
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {currentMacros.carbs}g
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: '100%',
                  backgroundColor: macroColors.carbs.primary,
                }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-medium"
                style={{ color: macroColors.fat.primary }}
              >
                {macroColors.fat.emoji} Fat
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {currentMacros.fat}g
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: '100%',
                  backgroundColor: macroColors.fat.primary,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
