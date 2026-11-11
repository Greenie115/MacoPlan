import { cn } from '@/lib/utils'

/**
 * The MacroPlan signature: a thin bar split by where the calories come from
 * (protein 4 kcal/g, carbs 4, fat 9) over the gram figures. Used wherever a
 * meal or recipe is summarised so macros read the same everywhere.
 */
export function MacroSplit({
  protein,
  carbs,
  fat,
  className,
}: {
  protein: number
  carbs: number
  fat: number
  className?: string
}) {
  const parts = [
    { label: 'Protein', short: 'P', grams: protein, kcal: protein * 4, bar: 'bg-protein' },
    { label: 'Carbs', short: 'C', grams: carbs, kcal: carbs * 4, bar: 'bg-carb' },
    { label: 'Fat', short: 'F', grams: fat, kcal: fat * 9, bar: 'bg-fat' },
  ]
  const total = parts.reduce((sum, p) => sum + p.kcal, 0) || 1

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex h-1 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        {parts.map((p) => (
          <span key={p.label} className={cn('rounded-full', p.bar)} style={{ width: `${(p.kcal / total) * 100}%` }} />
        ))}
      </div>
      <dl className="flex justify-between font-mono text-xs tabular-nums">
        {parts.map((p) => (
          <div key={p.label} className="flex gap-1">
            <dt className="text-muted-foreground">
              <abbr title={p.label} className="no-underline">
                {p.short}
              </abbr>
            </dt>
            <dd className="font-semibold text-foreground">{Math.round(p.grams)}g</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
