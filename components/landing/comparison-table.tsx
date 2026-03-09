import { X, Check } from 'lucide-react'
import Link from 'next/link'

export function ComparisonTable() {
  const comparisons = [
    { old: 'Search recipes for hours', new: 'Meals generated instantly' },
    { old: 'Log every bite manually', new: 'Pre-calculated macros' },
    { old: 'Eat the same boring meals', new: 'New recipes every week' },
    { old: 'Guess if you hit your macros', new: 'Know you hit your targets' },
    { old: 'Spend Sundays meal prepping', new: 'Cook fresh when you want' },
    { old: 'Give up when life gets busy', new: 'Swap meals in seconds' },
  ]

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">The old way vs. the MacroPlan way</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border-2 border-border-strong overflow-hidden shadow-xl">
            <div className="grid md:grid-cols-2">
              <div className="bg-muted/50 px-6 py-4 border-b md:border-b-0 md:border-r border-border-strong">
                <h3 className="text-lg font-bold text-center text-muted-foreground">The Old Way</h3>
              </div>
              <div className="bg-primary/5 px-6 py-4 border-b md:border-b-0 border-border-strong">
                <h3 className="text-lg font-bold text-center text-primary">The MacroPlan Way</h3>
              </div>
            </div>

            {comparisons.map((item, index) => (
              <div key={index} className="grid md:grid-cols-2 border-b last:border-b-0 border-border-strong">
                <div className="px-6 py-5 flex items-center gap-3 bg-muted/30 border-b md:border-b-0 md:border-r border-border-strong">
                  <X className="w-5 h-5 text-warning flex-shrink-0" />
                  <span className="text-muted-foreground">{item.old}</span>
                </div>
                <div className="px-6 py-5 flex items-center gap-3 bg-card">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="font-medium">{item.new}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground mb-6">Ready to try the easier way?</p>
            <Link
              href="/signup"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              Start Your Free Plan
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
