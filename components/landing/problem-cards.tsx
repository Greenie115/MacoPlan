import { Clock, Calculator, CalendarX } from 'lucide-react'

export function ProblemCards() {
  return (
    <section className="py-24 bg-background" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Sound familiar?</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-2xl border border-border-strong hover:shadow-lg transition-shadow">
            <div className="bg-warning/10 text-warning w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Meal prep takes your whole Sunday</h3>
            <p className="text-muted-foreground leading-relaxed">
              You spend hours cooking, portioning, and cleaning—only to eat the same boring chicken and rice all week.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border-strong hover:shadow-lg transition-shadow">
            <div className="bg-warning/10 text-warning w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Calculator className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Tracking macros is exhausting</h3>
            <p className="text-muted-foreground leading-relaxed">
              Logging every meal, scanning barcodes, guessing portions... it feels like a second job you didn&apos;t sign up for.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border-strong hover:shadow-lg transition-shadow">
            <div className="bg-warning/10 text-warning w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <CalendarX className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">You start strong, then life happens</h3>
            <p className="text-muted-foreground leading-relaxed">
              By Wednesday, work gets busy, the plan falls apart, and you&apos;re back to takeout and guilt.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
