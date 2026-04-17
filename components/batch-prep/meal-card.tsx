import Image from 'next/image'
import type { Meal } from '@/lib/types/batch-prep'
import { MealPlaceholder } from '@/components/meal-plans/meal-placeholder'

export interface MealImage {
  url: string
  smallUrl: string
  photographerName: string
  photographerUrl: string
}

export function MealCard({ meal, image }: { meal: Meal; image?: MealImage }) {
  const m = meal.total_macros
  return (
    <div className="rounded-lg border overflow-hidden space-y-0">
      <div className="relative aspect-[16/9] w-full bg-muted">
        {image ? (
          <>
            <Image
              src={image.smallUrl}
              alt={meal.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
            <a
              href={`${image.photographerUrl}?utm_source=macroplan&utm_medium=referral`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-1 right-1 text-[10px] text-white/90 bg-black/40 px-1.5 py-0.5 rounded"
            >
              Photo by {image.photographerName}
            </a>
          </>
        ) : (
          <MealPlaceholder mealType={meal.meal_slot} className="absolute inset-0" />
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{meal.name}</h3>
            <p className="text-xs text-muted-foreground uppercase">{meal.meal_slot}</p>
          </div>
          <div className="text-right text-sm">
            <p>{meal.servings_to_prep} servings</p>
            <p className="text-muted-foreground">{meal.storage_days} days</p>
          </div>
        </div>
        <div className="flex gap-3 text-sm">
          <span><strong>{m.calories}</strong> cal</span>
          <span><strong>{m.protein_g}</strong>g P</span>
          <span><strong>{m.carbs_g}</strong>g C</span>
          <span><strong>{m.fat_g}</strong>g F</span>
        </div>
        <details>
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Ingredients
          </summary>
          <ul className="mt-2 text-sm space-y-1">
            {meal.ingredients.map((i, idx) => (
              <li key={idx}>
                {i.quantity_g}g {i.name}
              </li>
            ))}
          </ul>
        </details>
        {meal.cooking_instructions.length > 0 && (
          <details open>
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Cooking instructions
            </summary>
            <ol className="mt-2 text-sm space-y-1 list-decimal list-inside">
              {meal.cooking_instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </details>
        )}
      </div>
    </div>
  )
}
