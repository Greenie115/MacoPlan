import { Sparkles, Target, Shuffle } from 'lucide-react'

export function SolutionCards() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">There&apos;s a better way.</h2>
          <p className="text-lg text-muted-foreground">
            MacroPlan does the work so you can enjoy the results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-2xl border border-border-strong hover:shadow-lg transition-shadow">
            <div className="bg-success/10 text-success w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Get your week planned in 3 seconds</h3>
            <p className="text-muted-foreground leading-relaxed">
              No more Sunday meal prep marathons. Tell us your goals, and we&apos;ll generate a full week of delicious meals instantly.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border-strong hover:shadow-lg transition-shadow">
            <div className="bg-success/10 text-success w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Hit your macros without tracking</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every meal is pre-calculated to fit your exact protein, carb, and fat targets. Just eat what&apos;s on the plan.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border-strong hover:shadow-lg transition-shadow">
            <div className="bg-success/10 text-success w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Shuffle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Swap meals when life changes</h3>
            <p className="text-muted-foreground leading-relaxed">
              Not feeling Tuesday&apos;s dinner? One tap swaps it for another meal that fits your macros. Flexibility built in.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
