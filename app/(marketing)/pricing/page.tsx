'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Check,
  X,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  Lock,
} from 'lucide-react'
import { MarketingHeader } from '@/components/landing/marketing-header'
import { Footer } from '@/components/landing/footer'
import { createCheckoutSession } from '@/app/actions/stripe'
import { toast } from 'sonner'

const freeFeatures = [
  '3 batch prep plans, free forever',
  'Shopping list included',
  'Unlimited recipe browsing',
  'Macro calculations',
]

const premiumFeatures = [
  '100 batch prep plans a month',
  'Training / rest day split',
  'Cooking timeline',
  'PDF export',
  'Priority support',
]

const comparisonRows: Array<{
  feature: string
  free: string | boolean
  premium: string | boolean
}> = [
  { feature: 'Batch prep plans', free: '3 lifetime', premium: '100 / month' },
  { feature: 'Shopping list', free: true, premium: true },
  { feature: 'Recipe browsing', free: 'Unlimited', premium: 'Unlimited' },
  { feature: 'Macro calculations', free: true, premium: true },
  { feature: 'Training / rest day split', free: false, premium: true },
  { feature: 'Cooking timeline', free: false, premium: true },
  { feature: 'PDF export', free: false, premium: true },
  { feature: 'Priority support', free: false, premium: true },
]

const faqs = [
  {
    question: 'Can I try MacroPlan for free?',
    answer:
      "Yes. The Free plan includes 3 batch prep plans with shopping lists, no card required. It's enough to see whether the plans actually fit how you eat before you pay for anything.",
  },
  {
    question: 'What happens after I use my free batch prep plans?',
    answer:
      'You keep everything you already generated: recipes, shopping lists, and your saved plans. Generating new prep plans requires Premium.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      "Yes, from your account settings, no email or call required. You keep Premium access until the end of the billing period you already paid for.",
  },
  {
    question: 'Is there a money-back guarantee?',
    answer:
      "Yes. If Premium isn't working for you in the first 7 days, contact us and we'll refund it in full.",
  },
  {
    question: 'Monthly or annual — can I switch?',
    answer:
      'Switch to annual anytime and the 33% discount applies immediately. Switching back to monthly takes effect at the end of your current annual term.',
  },
]

export default function PricingPage() {
  const [isPending, startTransition] = useTransition()
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | null>(null)

  const handleSubscribe = (plan: 'monthly' | 'annual') => {
    setLoadingPlan(plan)
    startTransition(async () => {
      const result = await createCheckoutSession(plan)
      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        toast.error(result.error || 'Failed to start checkout. Please log in first.')
        setLoadingPlan(null)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <MarketingHeader />

      <main id="main-content" className="pt-40 pb-24">
        {/* Hero */}
        <section className="container mx-auto px-6 text-center mb-20">
          <h1 className="text-display-lg md:text-display-xl font-bold leading-[1.05] tracking-tight mb-6 [text-wrap:balance]">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-subtle-foreground max-w-xl mx-auto [text-wrap:pretty]">
            Start free. Upgrade when you're ready to prep every week. No hidden fees, cancel anytime.
          </p>
        </section>

        {/* Pricing cards */}
        <section className="container mx-auto px-6 mb-16">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-start">
            {/* Free */}
            <div className="flex flex-col h-full rounded-2xl border border-border-strong bg-card p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-1">Free</h2>
              <p className="text-sm text-subtle-foreground mb-6">Perfect for getting started</p>

              <div className="mb-8">
                <span className="text-5xl font-bold tabular-nums">$0</span>
                <span className="text-subtle-foreground"> forever</span>
              </div>

              <ul className="space-y-3.5 mb-8 flex-grow">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-4.5 h-4.5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
                <li className="flex items-start gap-3 text-sm text-subtle-foreground">
                  <X className="w-4.5 h-4.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Training / rest day split</span>
                </li>
              </ul>

              <Link
                href="/onboarding/1"
                className="inline-flex items-center justify-center rounded-xl border border-border-strong bg-transparent py-3 px-6 text-sm font-semibold hover:bg-muted transition-colors"
              >
                Get started free
              </Link>
            </div>

            {/* Premium Monthly */}
            <div className="flex flex-col h-full rounded-2xl border border-border-strong bg-card p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-1">Premium Monthly</h2>
              <p className="text-sm text-subtle-foreground mb-6">Flexible, cancel anytime</p>

              <div className="mb-8">
                <span className="text-5xl font-bold tabular-nums">$9.99</span>
                <span className="text-subtle-foreground">/month</span>
              </div>

              <ul className="space-y-3.5 mb-8 flex-grow">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-4.5 h-4.5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-xl border border-border-strong bg-transparent py-3 px-6 text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {loadingPlan === 'monthly' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Processing...
                  </>
                ) : (
                  'Start monthly'
                )}
              </button>
            </div>

            {/* Premium Annual — recommended, visually anchored */}
            <div className="relative flex flex-col h-full rounded-2xl border-2 border-coral-500 bg-card p-8 shadow-lg md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-coral-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-coral">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Most popular
              </div>

              <h2 className="text-xl font-bold mb-1 pt-2">Premium Annual</h2>
              <p className="text-sm text-coral-700 font-medium mb-6">Save 33% with annual billing</p>

              <div className="mb-1">
                <span className="text-5xl font-bold tabular-nums">$79.99</span>
                <span className="text-subtle-foreground">/year</span>
              </div>
              <p className="text-sm text-subtle-foreground mb-8 tabular-nums">
                Just $6.67/month — save $40/year
              </p>

              <ul className="space-y-3.5 mb-8 flex-grow">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-4.5 h-4.5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe('annual')}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-coral-600 text-white py-3 px-6 text-sm font-semibold hover:bg-coral-700 hover:shadow-coral active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loadingPlan === 'annual' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Processing...
                  </>
                ) : (
                  <>
                    Get Premium Annual
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-14 text-sm text-subtle-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" aria-hidden="true" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" aria-hidden="true" />
              <span>7-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-success" aria-hidden="true" />
              <span>Secure checkout via Stripe</span>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-display-md font-bold tracking-tight [text-wrap:balance]">Compare plans</h2>
            </div>

            <div className="max-w-3xl mx-auto overflow-x-auto rounded-2xl border border-border-strong shadow-sm">
              <table className="w-full bg-card">
                <thead>
                  <tr className="border-b border-border-strong">
                    <th className="text-left p-5 font-semibold text-sm">Feature</th>
                    <th className="text-center p-5 font-semibold text-sm">Free</th>
                    <th className="text-center p-5 font-semibold text-sm bg-coral-50">
                      <span className="inline-flex items-center justify-center gap-1.5 text-coral-700">
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        Premium
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={i < comparisonRows.length - 1 ? 'border-b border-border-strong/50' : ''}
                    >
                      <td className="p-5 text-sm">{row.feature}</td>
                      <td className="text-center p-5 text-sm">
                        {typeof row.free === 'boolean' ? (
                          row.free ? (
                            <Check className="w-4.5 h-4.5 text-success mx-auto" aria-label="Included" />
                          ) : (
                            <X className="w-4.5 h-4.5 text-subtle-foreground mx-auto" aria-label="Not included" />
                          )
                        ) : (
                          <span className="text-subtle-foreground">{row.free}</span>
                        )}
                      </td>
                      <td className="text-center p-5 text-sm bg-coral-50/60 font-medium">
                        {typeof row.premium === 'boolean' ? (
                          row.premium ? (
                            <Check className="w-4.5 h-4.5 text-success mx-auto" aria-label="Included" />
                          ) : (
                            <X className="w-4.5 h-4.5 text-subtle-foreground mx-auto" aria-label="Not included" />
                          )
                        ) : (
                          row.premium
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-14">
              <h2 className="text-display-md font-bold tracking-tight [text-wrap:balance]">Pricing FAQ</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group bg-card p-6 rounded-xl border border-border-strong hover:shadow-md transition-shadow [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex justify-between items-center gap-4 cursor-pointer font-semibold list-none">
                    {faq.question}
                    <ChevronDown
                      className="w-5 h-5 text-icon transition-transform group-open:rotate-180 shrink-0"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="text-subtle-foreground mt-4 leading-relaxed [text-wrap:pretty]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Dark statement / CTA band */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="relative overflow-hidden rounded-3xl bg-charcoal text-white p-10 md:p-20 text-center shadow-2xl">
              <div className="grain-overlay" aria-hidden="true" />
              <div className="premium-mesh" aria-hidden="true" />

              <div className="relative z-10">
                <h2 className="text-display-lg font-bold tracking-tight mb-6 [text-wrap:balance]">
                  Ready to hit your macros?
                </h2>
                <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto [text-wrap:pretty]">
                  Cook once, eat all week. Batch prep plans built around your exact macros.
                </p>
                <Link
                  href="/onboarding/1"
                  className="inline-flex items-center justify-center gap-2 bg-coral-600 text-white font-semibold py-4 px-10 rounded-xl hover:bg-coral-700 hover:shadow-coral active:scale-[0.97] transition-all"
                >
                  Start free today
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
