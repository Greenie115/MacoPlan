import { MacroSplit } from '@/components/ui/macro-split'

const TIMELINE = [
  { time: '17:00', station: 'Oven', task: 'Chicken thighs + sweet potato tray', done: true },
  { time: '17:10', station: 'Rice', task: '4 cups jasmine', done: true },
  { time: '17:25', station: 'Stove', task: 'Turkey chili, simmering', done: true },
  { time: '17:50', station: 'Pack', task: 'Portion into 10 containers', done: false },
] as const

const RULE = 'border-t border-dashed border-charcoal/25'

/**
 * Hero product proof: an example Sunday prep plan printed as a kitchen
 * ticket, the way a line cook would read it. Example data; CSS-only motion.
 */
export function PrepTicket() {
  return (
    <div className="relative mx-auto max-w-sm lg:ml-auto lg:mr-0">
      <div aria-hidden="true" className="absolute -inset-10 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative -rotate-2 bg-[#FDFCF9] px-6 pb-3 pt-6 font-mono text-[0.8125rem] leading-relaxed text-charcoal drop-shadow-2xl">
        {/* torn bottom edge */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-full h-2.5 bg-[length:20px_10px] bg-repeat-x"
          style={{
            backgroundImage:
              'linear-gradient(135deg, #FDFCF9 50%, transparent 50%), linear-gradient(225deg, #FDFCF9 50%, transparent 50%)',
          }}
        />
        <div className="flex items-baseline justify-between">
          <p className="font-display text-lg font-extrabold tracking-tight">MacroPlan</p>
          <p className="text-charcoal/50">Example plan</p>
        </div>
        <p className="mt-1 uppercase tracking-wider text-charcoal/60">Sunday prep · 5 days · 10 containers</p>

        <ol className={`mt-4 space-y-2 py-4 ${RULE}`}>
          {TIMELINE.map((step, i) => (
            <li key={step.time} className="grid grid-cols-[2.75rem_3rem_1fr_1rem] gap-x-2">
              <span className="tabular-nums text-charcoal/50">{step.time}</span>
              <span className="font-semibold uppercase">{step.station}</span>
              <span className={step.done ? '' : 'text-charcoal/50'}>{step.task}</span>
              <span
                className={`tick-in text-right font-semibold ${step.done ? 'text-success' : 'text-charcoal/30'}`}
                style={{ animationDelay: `${0.6 + i * 0.25}s` }}
              >
                {step.done ? '✓' : '○'}
              </span>
            </li>
          ))}
        </ol>

        <div className={`py-4 ${RULE}`}>
          <div className="mb-3 flex items-baseline justify-between">
            <span className="uppercase tracking-wider text-charcoal/60">Per day</span>
            <span className="font-display text-2xl font-extrabold tabular-nums tracking-tight">2,185 kcal</span>
          </div>
          <MacroSplit protein={180} carbs={220} fat={65} className="[&_dd]:text-charcoal [&_dt]:text-charcoal/50" />
        </div>

        <div className={`flex justify-between py-4 ${RULE}`}>
          <span className="uppercase tracking-wider text-charcoal/60">Shopping list</span>
          <span className="font-semibold">18 items, by aisle</span>
        </div>

        <p className={`pt-4 text-center uppercase tracking-[0.2em] text-charcoal/45 ${RULE}`}>Generated in 3s</p>
      </div>
    </div>
  )
}
