import { Calculator, FlaskConical, ShieldCheck, Soup } from 'lucide-react'

const pillars = [
  {
    icon: Calculator,
    title: 'Targets from real equations',
    body: 'Your calories come from Mifflin-St Jeor and your activity level, then split into protein, carbs and fat for your goal. Nothing invented.',
  },
  {
    icon: FlaskConical,
    title: 'Your goal changes the plan',
    body: 'Cutting, bulking, maintaining and recomp each get their own calorie and protein strategy. Training and rest days are worked out separately.',
  },
  {
    icon: Soup,
    title: 'Sized for one prep session',
    body: 'A few recipes, one shop, one cook. If it doesn\u2019t fit a real Sunday you won\u2019t do it, so it fits.',
  },
  {
    icon: ShieldCheck,
    title: 'See it before you pay',
    body: 'Your first plans are free, no card. Check the numbers, then decide.',
  },
]

export function SuccessStories() {
  return (
    <section className="py-24 md:py-32" id="why-it-works">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-2xl text-display-lg font-extrabold">You shouldn&apos;t have to double-check the maths.</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Guessing portions is how a cut stalls and a bulk turns sloppy. Every number in your plan traces back to
          your targets.
        </p>

        <div className="mt-14 grid gap-x-16 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="flex gap-4 border-t border-border-strong py-7">
              <pillar.icon className="mt-1 size-5 shrink-0 text-coral-700" aria-hidden="true" />
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight">{pillar.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{pillar.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
