'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface RecipeNutritionFactsProps {
  servingSize?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  cholesterol?: number
  saturatedFat?: number
}

export function RecipeNutritionFacts({
  servingSize = '1 serving',
  calories,
  protein,
  carbs,
  fat,
  fiber,
  sugar,
  sodium,
  cholesterol,
  saturatedFat,
}: RecipeNutritionFactsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="px-4 py-6 border-t border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={isOpen}
      >
        <h2 className="text-xl font-bold text-foreground">Nutrition Facts</h2>
        <ChevronDown
          className={`h-5 w-5 text-icon transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-4 rounded-2xl border border-border-strong bg-card p-6">
          {/* Serving Size */}
          <div className="border-b-4 border-foreground pb-2 mb-2">
            <p className="text-sm font-semibold text-foreground">
              Serving Size: {servingSize}
            </p>
          </div>

          {/* Calories */}
          <div className="border-b-4 border-foreground py-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">
                Calories
              </span>
              <span className="text-2xl font-bold text-foreground">
                {calories}
              </span>
            </div>
          </div>

          {/* Daily Value Header */}
          <div className="border-b border-border-strong py-1">
            <p className="text-xs font-semibold text-right text-muted-foreground">
              % Daily Value*
            </p>
          </div>

          {/* Macronutrients */}
          <div className="space-y-1 py-2">
            {/* Total Fat */}
            <div className="flex justify-between border-b border-border pb-1">
              <span className="font-semibold text-sm text-foreground">
                Total Fat <span className="font-normal">{fat}g</span>
              </span>
              <span className="font-semibold text-sm text-foreground">
                {Math.round((fat / 78) * 100)}%
              </span>
            </div>

            {saturatedFat !== undefined && (
              <div className="flex justify-between border-b border-border pb-1 pl-4">
                <span className="text-sm text-muted-foreground">
                  Saturated Fat {saturatedFat}g
                </span>
                <span className="font-semibold text-sm text-foreground">
                  {Math.round((saturatedFat / 20) * 100)}%
                </span>
              </div>
            )}

            {cholesterol !== undefined && (
              <div className="flex justify-between border-b border-border pb-1">
                <span className="font-semibold text-sm text-foreground">
                  Cholesterol <span className="font-normal">{cholesterol}mg</span>
                </span>
                <span className="font-semibold text-sm text-foreground">
                  {Math.round((cholesterol / 300) * 100)}%
                </span>
              </div>
            )}

            {sodium !== undefined && (
              <div className="flex justify-between border-b border-border pb-1">
                <span className="font-semibold text-sm text-foreground">
                  Sodium <span className="font-normal">{sodium}mg</span>
                </span>
                <span className="font-semibold text-sm text-foreground">
                  {Math.round((sodium / 2300) * 100)}%
                </span>
              </div>
            )}

            {/* Total Carbohydrate */}
            <div className="flex justify-between border-b border-border pb-1">
              <span className="font-semibold text-sm text-foreground">
                Total Carbohydrate <span className="font-normal">{carbs}g</span>
              </span>
              <span className="font-semibold text-sm text-foreground">
                {Math.round((carbs / 275) * 100)}%
              </span>
            </div>

            {fiber !== undefined && (
              <div className="flex justify-between border-b border-border pb-1 pl-4">
                <span className="text-sm text-muted-foreground">
                  Dietary Fiber {fiber}g
                </span>
                <span className="font-semibold text-sm text-foreground">
                  {Math.round((fiber / 28) * 100)}%
                </span>
              </div>
            )}

            {sugar !== undefined && (
              <div className="flex justify-between border-b border-border pb-1 pl-4">
                <span className="text-sm text-muted-foreground">
                  Total Sugars {sugar}g
                </span>
              </div>
            )}

            {/* Protein */}
            <div className="flex justify-between border-b-4 border-foreground pb-2">
              <span className="font-semibold text-sm text-foreground">
                Protein <span className="font-normal">{protein}g</span>
              </span>
              <span className="font-semibold text-sm text-foreground">
                {Math.round((protein / 50) * 100)}%
              </span>
            </div>
          </div>

          {/* Footnote */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              * Percent Daily Values are based on a 2,000 calorie diet. Your
              daily values may be higher or lower depending on your calorie
              needs.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
