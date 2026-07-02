import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import type { Meal } from '@/lib/types/batch-prep'
import { MealPlaceholder } from '@/components/meal-plans/meal-placeholder'
import { macroColors } from '@/lib/design-tokens'

export interface MealImage {
  url: string
  smallUrl: string
  photographerName: string
  photographerUrl: string
}

export function MealCard({ meal, image }: { meal: Meal; image?: MealImage }) {
  const m = meal.total_macros
  return (
    <div className="rounded-2xl bg-card shadow-sm border border-border-strong overflow-hidden">
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
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg text-foreground">{meal.name}</h3>
            <p className="text-xs text-muted-foreground uppercase">{meal.meal_slot}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-foreground">{meal.servings_to_prep} servings</p>
            <p className="text-muted-foreground">{meal.storage_days} days</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium">{m.calories} cal</span>
          <span className="flex items-center gap-1 font-medium text-protein">
            <span>{macroColors.protein.emoji}</span>
            {m.protein_g}g
          </span>
          <span className="flex items-center gap-1 font-medium text-carb">
            <span>{macroColors.carbs.emoji}</span>
            {m.carbs_g}g
          </span>
          <span className="flex items-center gap-1 font-medium text-fat">
            <span>{macroColors.fat.emoji}</span>
            {m.fat_g}g
          </span>
        </div>
        <details className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground list-none">
            Ingredients
            <ChevronDown className="size-4 text-icon transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-2 text-sm text-muted-foreground space-y-1">
            {meal.ingredients.map((i, idx) => (
              <li key={idx}>
                {i.quantity_g}g {i.name}
              </li>
            ))}
          </ul>
        </details>
        {meal.cooking_instructions.length > 0 && (
          <details open className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground list-none">
              Cooking instructions
              <ChevronDown className="size-4 text-icon transition-transform group-open:rotate-180" />
            </summary>
            <ol className="mt-2 text-sm text-muted-foreground space-y-1 list-decimal list-inside">
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
