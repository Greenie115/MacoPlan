import { cn } from '@/lib/utils'

const MACROS = {
  protein: { label: 'Protein', bar: 'bg-protein' },
  carbs: { label: 'Carbs', bar: 'bg-carb' },
  fat: { label: 'Fat', bar: 'bg-fat' },
} as const

/** One macro as a gauge: eaten over target, a slim bar, and what's left. */
export function MacroProgressBar({ type, eaten, target }: { type: keyof typeof MACROS; eaten: number; target: number }) {
  const { label, bar } = MACROS[type]
  const percent = target > 0 ? (eaten / target) * 100 : 0
  const left = Math.round(target - eaten)

  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono tabular-nums">
        <span className="text-xl font-semibold text-foreground">{Math.round(eaten)}</span>
        <span className="text-xs text-muted-foreground"> / {Math.round(target)}g</span>
      </p>
      <div className="mt-2 h-1.5 rounded-full bg-muted" role="progressbar" aria-label={label} aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out-quint', bar)}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <p className={cn('mt-1.5 font-mono text-xs tabular-nums', left < 0 ? 'text-warning' : 'text-muted-foreground')}>
        {left < 0 ? `${-left}g over` : `${left}g left`}
      </p>
    </div>
  )
}
