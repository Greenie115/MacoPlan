'use client'

import { useState } from 'react'
import { RecipeIngredient } from '@/lib/types/recipe'

interface RecipeIngredientsProps {
  ingredients: RecipeIngredient[]
}

export function RecipeIngredients({ ingredients }: RecipeIngredientsProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  const toggleCheck = (index: number) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedItems(newChecked)
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
      <div className="space-y-3">
        {ingredients.map((ingredient, index) => {
          const isChecked = checkedItems.has(index)
          const ingredientText = [
            ingredient.amount,
            ingredient.unit,
            ingredient.ingredient,
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <label
              key={ingredient.id}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleCheck(index)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span
                className={`text-base leading-relaxed transition-colors ${
                  isChecked
                    ? 'text-gray-400 line-through'
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}
              >
                {ingredientText}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
