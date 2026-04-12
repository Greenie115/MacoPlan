import type { Meal } from '@/lib/types/batch-prep'

export function MealCard({ meal }: { meal: Meal }) {
  const m = meal.total_macros
  return (
    <div className="rounded-lg border p-4 space-y-2">
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
    </div>
  )
}
