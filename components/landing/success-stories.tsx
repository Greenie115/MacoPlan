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
    <section className="py-20 md:py-28 bg-muted/40 border-y border-border-strong relative overflow-hidden" id="why-it-works">
      {/* Ambient glow */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(255,107,92,0.06),transparent_60%)]" />
      <div className="container mx-auto px-6 max-w-5xl relative">
        <h2 className="text-display-lg font-extrabold tracking-tight text-center mb-4 [font-family:var(--font-display)] [text-wrap:balance]">
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
              className="bg-card border border-border-strong rounded-2xl p-6 flex gap-4 shadow-sm transition-all duration-[var(--duration-base)] ease-out-quint hover:-translate-y-0.5 hover:shadow-lg hover:border-coral-200"
            >
              <div className="w-12 h-12 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center">
                <pillar.icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 [font-family:var(--font-display)]">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
