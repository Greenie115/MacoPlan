import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import type { Meal } from '@/lib/types/batch-prep'
import { MealPlaceholder } from '@/components/meal-plans/meal-placeholder'
import { MacroSplit } from '@/components/ui/macro-split'

export interface MealImage {
  url: string
  smallUrl: string
  photographerName: string
  photographerUrl: string
}

export function MealCard({ meal, image }: { meal: Meal; image?: MealImage }) {
  const m = meal.total_macros
  return (
    <div className="overflow-hidden rounded-2xl border border-border-strong bg-card shadow-xs">
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
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{meal.meal_slot}</p>
            <h3 className="mt-0.5 font-display text-lg font-bold leading-tight tracking-tight text-foreground">{meal.name}</h3>
          </div>
          <p className="shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
            {meal.servings_to_prep} servings
            <br />
            keeps {meal.storage_days} days
          </p>
        </div>
        <p className="font-mono text-xs tabular-nums text-muted-foreground">{m.calories} kcal per serving</p>
        <MacroSplit protein={m.protein_g} carbs={m.carbs_g} fat={m.fat_g} />
        <details className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground list-none">
            Ingredients
            <ChevronDown className="size-4 text-icon transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-2 text-sm text-muted-foreground space-y-1">
            {meal.ingredients.map((i, idx) => (
              <li key={idx}>
                {i.quantity_g ? `${i.quantity_g}g ` : ''}
                {i.name}
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
