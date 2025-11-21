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
    <div className="px-4 py-6 border-t border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={isOpen}
      >
        <h2 className="text-xl font-bold text-gray-900">Nutrition Facts</h2>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
          {/* Serving Size */}
          <div className="border-b-4 border-gray-900 pb-2 mb-2">
            <p className="text-sm font-semibold text-gray-900">
              Serving Size: {servingSize}
            </p>
          </div>

          {/* Calories */}
          <div className="border-b-4 border-gray-900 py-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900">
                Calories
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {calories}
              </span>
            </div>
          </div>

          {/* Daily Value Header */}
          <div className="border-b border-gray-400 py-1">
            <p className="text-xs font-semibold text-right text-gray-700">
              % Daily Value*
            </p>
          </div>

          {/* Macronutrients */}
          <div className="space-y-1 py-2">
            {/* Total Fat */}
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span className="font-semibold text-sm text-gray-900">
                Total Fat <span className="font-normal">{fat}g</span>
              </span>
              <span className="font-semibold text-sm text-gray-900">
                {Math.round((fat / 78) * 100)}%
              </span>
            </div>

            {saturatedFat !== undefined && (
              <div className="flex justify-between border-b border-gray-300 pb-1 pl-4">
                <span className="text-sm text-gray-700">
                  Saturated Fat {saturatedFat}g
                </span>
                <span className="font-semibold text-sm text-gray-900">
                  {Math.round((saturatedFat / 20) * 100)}%
                </span>
              </div>
            )}

            {cholesterol !== undefined && (
              <div className="flex justify-between border-b border-gray-300 pb-1">
                <span className="font-semibold text-sm text-gray-900">
                  Cholesterol <span className="font-normal">{cholesterol}mg</span>
                </span>
                <span className="font-semibold text-sm text-gray-900">
                  {Math.round((cholesterol / 300) * 100)}%
                </span>
              </div>
            )}

            {sodium !== undefined && (
              <div className="flex justify-between border-b border-gray-300 pb-1">
                <span className="font-semibold text-sm text-gray-900">
                  Sodium <span className="font-normal">{sodium}mg</span>
                </span>
                <span className="font-semibold text-sm text-gray-900">
                  {Math.round((sodium / 2300) * 100)}%
                </span>
              </div>
            )}

            {/* Total Carbohydrate */}
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span className="font-semibold text-sm text-gray-900">
                Total Carbohydrate <span className="font-normal">{carbs}g</span>
              </span>
              <span className="font-semibold text-sm text-gray-900">
                {Math.round((carbs / 275) * 100)}%
              </span>
            </div>

            {fiber !== undefined && (
              <div className="flex justify-between border-b border-gray-300 pb-1 pl-4">
                <span className="text-sm text-gray-700">
                  Dietary Fiber {fiber}g
                </span>
                <span className="font-semibold text-sm text-gray-900">
                  {Math.round((fiber / 28) * 100)}%
                </span>
              </div>
            )}

            {sugar !== undefined && (
              <div className="flex justify-between border-b border-gray-300 pb-1 pl-4">
                <span className="text-sm text-gray-700">
                  Total Sugars {sugar}g
                </span>
              </div>
            )}

            {/* Protein */}
            <div className="flex justify-between border-b-4 border-gray-900 pb-2">
              <span className="font-semibold text-sm text-gray-900">
                Protein <span className="font-normal">{protein}g</span>
              </span>
              <span className="font-semibold text-sm text-gray-900">
                {Math.round((protein / 50) * 100)}%
              </span>
            </div>
          </div>

          {/* Footnote */}
          <div className="pt-2">
            <p className="text-xs text-gray-600">
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
