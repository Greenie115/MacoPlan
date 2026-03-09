import Link from 'next/link'
import { Check, ArrowRight, Sparkles } from 'lucide-react'

export function PricingPreview() {
  return (
    <section className="py-24 bg-muted/30" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground">
            Start free. Upgrade when you're ready for unlimited access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-card p-8 rounded-2xl border border-border-strong">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-2">$0</div>
              <p className="text-sm text-muted-foreground">Forever free</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success shrink-0" />
                <span>3 meal plan generations</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success shrink-0" />
                <span>3 meal swaps</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success shrink-0" />
                <span>10 favorite recipes</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success shrink-0" />
                <span>Unlimited recipe browsing</span>
              </li>
            </ul>

            <Link
              href="/signup"
              className="block w-full text-center bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 px-6 rounded-xl transition-colors border border-border-strong"
            >
              Get Started Free
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="bg-card p-8 rounded-2xl border-2 border-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              MOST POPULAR
            </div>

            <div className="text-center mb-8 pt-2">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="text-4xl font-bold mb-2">
                $9.99<span className="text-lg font-normal text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-primary font-medium">or $79.99/year (save 33%)</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success shrink-0" />
                <span><strong>Unlimited</strong> meal plans</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success shrink-0" />
                <span><strong>Unlimited</strong> meal swaps</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success shrink-0" />
                <span><strong>Unlimited</strong> favorites</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success shrink-0" />
                <span>PDF export & priority support</span>
              </li>
            </ul>

            <Link
              href="/pricing"
              className="block w-full text-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              View Pricing
              <ArrowRight className="inline w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            Compare all features →
          </Link>
        </div>
      </div>
    </section>
  )
}
