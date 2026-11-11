import { Calculator, FlaskConical, ShieldCheck, Soup } from 'lucide-react'

const pillars = [
  {
    icon: Calculator,
    title: 'Real macro math, not guesswork',
    body: 'Targets come from the Mifflin–St Jeor equation and your activity level — the same method dietitians use — then split into protein, carbs, and fat for your goal.',
  },
  {
    icon: FlaskConical,
    title: 'Goal-aware splits',
    body: 'Cutting, bulking, maintaining, or recomping each get a different calorie and protein strategy. Training and rest days are calculated separately.',
  },
  {
    icon: Soup,
    title: 'Built around batch cooking',
    body: 'Every plan is designed to cook once and eat all week — 3–4 recipes, one shopping list, one prep session that actually fits real life.',
  },
  {
    icon: ShieldCheck,
    title: 'Free to try, no card required',
    body: 'Generate your first prep plan free and see the numbers before you ever think about upgrading. Cancel anytime.',
  },
]

export function SuccessStories() {
  return (
    <section className="py-24 md:py-32" id="why-it-works">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-2xl text-display-lg font-extrabold">Numbers you can actually trust</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          No fad diets, no made-up rules. MacroPlan turns proven nutrition science into a prep plan you can follow
          without thinking about it.
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
