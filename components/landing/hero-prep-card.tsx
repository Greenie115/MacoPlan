/**
 * Hero product mockup: an in-progress Sunday prep session.
 * Pure CSS animations (staggered ticks, filling macro bars) so it renders
 * and animates even before/without JS hydration.
 */

const TIMELINE = [
  { time: '5:00', task: 'Oven on — chicken thighs + sweet potato tray', done: true },
  { time: '5:10', task: 'Rice cooker — 4 cups jasmine', done: true },
  { time: '5:25', task: 'Stovetop — turkey chili simmering', done: true },
  { time: '5:50', task: 'Portion into 10 containers', done: false },
] as const

const MACROS = [
  { label: 'Protein', grams: '180g', width: '92%', barClass: 'bg-protein', trackClass: 'bg-protein/15' },
  { label: 'Carbs', grams: '220g', width: '84%', barClass: 'bg-carb', trackClass: 'bg-carb/15' },
  { label: 'Fat', grams: '65g', width: '76%', barClass: 'bg-fat', trackClass: 'bg-fat/15' },
] as const

export function HeroPrepCard() {
  return (
    <div className="relative max-w-md mx-auto lg:mx-0 lg:ml-auto">
      {/* Calorie badge — floating accent stat */}
      <div
        className="float-slow absolute -top-5 -right-3 sm:-right-6 z-20 bg-coral-600 text-primary-foreground text-sm font-bold px-4 py-2 rounded-full shadow-coral ring-1 ring-white/20 [--float-rot:3deg]"
        style={{ animationDelay: '0.2s' }}
      >
        2,150 kcal / day
      </div>

      {/* Main prep card — layered depth + inner top highlight for a genuine screenshot feel */}
      <div className="relative z-10 rounded-3xl p-[1px] bg-gradient-to-b from-white/40 to-transparent shadow-2xl shadow-charcoal/40">
        <div className="relative overflow-hidden bg-white text-charcoal rounded-[calc(1.5rem-1px)] p-6 sm:p-7 ring-1 ring-charcoal/[0.04]">
          {/* Inner top highlight */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />

          {/* Header */}
          <div className="relative flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral-700">Sunday prep plan</p>
              <h3 className="text-xl font-extrabold tracking-tight mt-0.5">Cook once, eat 5 days</h3>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 bg-charcoal text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-full">
              <span className="pulse-dot inline-block size-1.5 rounded-full bg-primary" />
              generated in 3s
            </span>
          </div>

          {/* Cooking timeline */}
          <div className="relative space-y-2.5 mb-6">
            {TIMELINE.map((step, i) => (
              <div key={step.time} className="flex items-center gap-3">
                <span
                  className={`tick-in flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    step.done ? 'bg-success text-white' : 'border-2 border-dashed border-charcoal/25 text-transparent'
                  }`}
                  style={{ animationDelay: `${0.5 + i * 0.25}s` }}
                >
                  ✓
                </span>
                <span className="text-xs font-bold tabular-nums text-charcoal/40 w-9 shrink-0">{step.time}</span>
                <span className={`text-sm leading-snug ${step.done ? 'text-charcoal/80' : 'text-charcoal/50'}`}>
                  {step.task}
                </span>
              </div>
            ))}
          </div>

          {/* Macro bars */}
          <div className="relative space-y-3 mb-6">
            {MACROS.map((macro, i) => (
              <div key={macro.label} className="flex items-center gap-3">
                <span className="text-xs font-semibold w-14 shrink-0 text-charcoal/60">{macro.label}</span>
                <div className={`h-2.5 flex-1 rounded-full overflow-hidden ${macro.trackClass}`}>
                  <div
                    className={`bar-fill h-full rounded-full ${macro.barClass}`}
                    style={{ width: macro.width, animationDelay: `${0.7 + i * 0.15}s` }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums w-10 text-right">{macro.grams}</span>
              </div>
            ))}
          </div>

          {/* Footer chips */}
          <div className="relative flex flex-wrap gap-2 text-[11px] font-semibold text-charcoal/60">
            <span className="bg-muted rounded-full px-3 py-1.5">10 containers</span>
            <span className="bg-muted rounded-full px-3 py-1.5">4 recipes</span>
            <span className="bg-muted rounded-full px-3 py-1.5">1 shopping list</span>
          </div>
        </div>
      </div>

      {/* Floating shopping list chip */}
      <div
        className="float-slow absolute -bottom-7 -left-2 sm:-left-8 z-20 bg-white text-charcoal rounded-2xl px-4 py-3 shadow-xl shadow-charcoal/25 ring-1 ring-charcoal/5 [--float-rot:-3deg]"
        style={{ animationDelay: '1.2s' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal/45">Shopping list</p>
        <p className="text-sm font-bold">
          18 items <span className="text-success">· sorted by aisle ✓</span>
        </p>
      </div>

      {/* Coral glow behind the card */}
      <div aria-hidden="true" className="absolute -inset-8 -z-10 rounded-[3rem] bg-primary/20 blur-3xl" />
    </div>
  )
}
