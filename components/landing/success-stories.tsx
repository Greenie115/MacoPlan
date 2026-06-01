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
    <section className="py-20 md:py-28 bg-muted/30 border-y border-border-strong" id="why-it-works">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-4">
          <p className="text-primary font-semibold uppercase tracking-wide text-sm">Why it works</p>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Numbers you can actually trust
        </h2>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-14">
          No fad diets, no made-up rules. MacroPlan turns proven nutrition science into a prep plan
          you can follow without thinking about it.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-card border border-border-strong rounded-2xl p-6 flex gap-4"
            >
              <div className="w-12 h-12 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center">
                <pillar.icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
