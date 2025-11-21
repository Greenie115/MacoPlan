'use client'

import { useState } from 'react'
import { RecipeIngredient } from '@/lib/types/recipe'
import { Checkbox } from '@/components/ui/checkbox'

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
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-gray-900 text-xl font-bold">
        Ingredients
      </h2>
      <ul className="space-y-3">
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
            <li key={ingredient.id} className="flex items-center gap-3">
              <Checkbox
                id={`ingredient-${index}`}
                checked={isChecked}
                onCheckedChange={() => toggleCheck(index)}
                className="size-5 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={`ingredient-${index}`}
                className={`text-base cursor-pointer transition-colors ${
                  isChecked
                    ? 'line-through text-gray-400'
                    : 'text-gray-800 font-medium'
                }`}
              >
                {ingredientText}
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
