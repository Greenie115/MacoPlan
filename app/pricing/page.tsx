'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Utensils,
  Check,
  X,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createCheckoutSession } from '@/app/actions/stripe'
import { toast } from 'sonner'

const freeTierFeatures = [
  { feature: 'Batch prep plans', value: '3 lifetime', included: true },
  { feature: 'Shopping list', value: true, included: true },
  { feature: 'Recipe browsing', value: 'Unlimited', included: true },
  { feature: 'Macro calculations', value: true, included: true },
  { feature: 'Training / rest day split', value: false, included: false },
  { feature: 'Cooking timeline', value: false, included: false },
  { feature: 'PDF export', value: false, included: false },
  { feature: 'Priority support', value: false, included: false },
]

const premiumFeatures = [
  { feature: 'Batch prep plans', value: 'Unlimited', included: true },
  { feature: 'Shopping list', value: true, included: true },
  { feature: 'Recipe browsing', value: 'Unlimited', included: true },
  { feature: 'Macro calculations', value: true, included: true },
  { feature: 'Training / rest day split', value: true, included: true },
  { feature: 'Cooking timeline', value: true, included: true },
  { feature: 'PDF export', value: true, included: true },
  { feature: 'Priority support', value: true, included: true },
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-background/95 backdrop-blur-md border-b border-border-strong">
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
              <Utensils className="w-8 h-8 text-primary" />
              <span>Macro Plan</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link>
              <Link href="/#testimonials" className="text-muted-foreground hover:text-primary transition-colors">Testimonials</Link>
              <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              <Link href="/pricing" className="text-primary font-medium">Pricing</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Login
              </Link>
              <Link href="/signup" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30">
                Sign Up Now
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-6 text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 tracking-tight">
            Simple, transparent <span className="text-primary">pricing</span>
          </h1>
          <p className="text-lg text-subtle-foreground max-w-2xl mx-auto">
            Start for free and upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="relative flex flex-col">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Free</CardTitle>
                <p className="text-subtle-foreground mt-2">Perfect for getting started</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <div className="text-center mb-8">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-subtle-foreground">/forever</span>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>3 batch prep plans</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Shopping list</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Unlimited recipe browsing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Macro calculations</span>
                  </li>
                  <li className="flex items-center gap-3 text-subtle-foreground">
                    <X className="w-5 h-5 shrink-0" />
                    <span>Training / rest day split</span>
                  </li>
                  <li className="flex items-center gap-3 text-subtle-foreground">
                    <X className="w-5 h-5 shrink-0" />
                    <span>Cooking timeline</span>
                  </li>
                  <li className="flex items-center gap-3 text-subtle-foreground">
                    <X className="w-5 h-5 shrink-0" />
                    <span>PDF export</span>
                  </li>
                </ul>

                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link href="/signup">Get Started Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Monthly */}
            <Card className="relative flex flex-col">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Premium Monthly</CardTitle>
                <p className="text-subtle-foreground mt-2">Flexible, cancel anytime</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <div className="text-center mb-8">
                  <span className="text-5xl font-bold">$9.99</span>
                  <span className="text-subtle-foreground">/month</span>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span><strong>Unlimited</strong> batch prep plans</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Training / rest day split</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Cooking timeline</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Shopping list</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>PDF export</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Unlimited recipe browsing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => handleSubscribe('monthly')}
                  disabled={isPending}
                >
                  {loadingPlan === 'monthly' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Start Monthly'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Premium Annual - Best Value */}
            <Card className="relative flex flex-col border-2 border-primary md:col-span-2 lg:col-span-1">
              {/* Best Value Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <ShieldCheck className="w-4 h-4" />
                BEST VALUE
              </div>

              <CardHeader className="text-center pb-4 pt-8">
                <CardTitle className="text-2xl">Premium Annual</CardTitle>
                <p className="text-subtle-foreground mt-2">Save 33% with annual billing</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <div className="text-center mb-2">
                  <span className="text-5xl font-bold">$79.99</span>
                  <span className="text-subtle-foreground">/year</span>
                </div>
                <p className="text-center text-sm text-primary font-medium mb-8">
                  Just $6.67/month — save $40/year
                </p>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span><strong>Unlimited</strong> batch prep plans</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Training / rest day split</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Cooking timeline</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Shopping list</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>PDF export</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Unlimited recipe browsing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>

                <Button
                  size="lg"
                  className="w-full shadow-lg shadow-primary/25"
                  onClick={() => handleSubscribe('annual')}
                  disabled={isPending}
                >
                  {loadingPlan === 'annual' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get Premium Annual
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-subtle-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span>7-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span>Secure payment via Stripe</span>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare plans</h2>
              <p className="text-lg text-subtle-foreground">
                See exactly what you get with each plan
              </p>
            </div>

            <div className="max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full bg-card rounded-2xl border border-border-strong overflow-hidden">
                <thead>
                  <tr className="border-b border-border-strong">
                    <th className="text-left p-6 font-semibold">Feature</th>
                    <th className="text-center p-6 font-semibold">Free</th>
                    <th className="text-center p-6 font-semibold bg-primary/5">
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Premium
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-strong/50">
                    <td className="p-6">Batch prep plans</td>
                    <td className="text-center p-6 text-subtle-foreground">3 lifetime</td>
                    <td className="text-center p-6 font-semibold bg-primary/5">Unlimited</td>
                  </tr>
                  <tr className="border-b border-border-strong/50">
                    <td className="p-6">Training / rest day split</td>
                    <td className="text-center p-6">
                      <X className="w-5 h-5 text-subtle-foreground mx-auto" />
                    </td>
                    <td className="text-center p-6 bg-primary/5">
                      <Check className="w-5 h-5 text-success mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border-strong/50">
                    <td className="p-6">Cooking timeline</td>
                    <td className="text-center p-6">
                      <X className="w-5 h-5 text-subtle-foreground mx-auto" />
                    </td>
                    <td className="text-center p-6 bg-primary/5">
                      <Check className="w-5 h-5 text-success mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border-strong/50">
                    <td className="p-6">Shopping list</td>
                    <td className="text-center p-6">
                      <Check className="w-5 h-5 text-success mx-auto" />
                    </td>
                    <td className="text-center p-6 bg-primary/5">
                      <Check className="w-5 h-5 text-success mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border-strong/50">
                    <td className="p-6">PDF export</td>
                    <td className="text-center p-6">
                      <Check className="w-5 h-5 text-success mx-auto" />
                    </td>
                    <td className="text-center p-6 bg-primary/5">
                      <Check className="w-5 h-5 text-success mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6">Priority support</td>
                    <td className="text-center p-6">
                      <X className="w-5 h-5 text-subtle-foreground mx-auto" />
                    </td>
                    <td className="text-center p-6 bg-primary/5">
                      <Check className="w-5 h-5 text-success mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing FAQ</h2>
            </div>

            <div className="space-y-4">
              <details className="group bg-card p-6 rounded-xl border border-border-strong [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-lg list-none">
                  Can I try Macro Plan for free?
                  <ChevronDown className="w-5 h-5 text-icon transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-subtle-foreground mt-4 leading-relaxed">
                  Yes! Our Free plan lets you generate up to 3 batch prep plans with shopping lists included. It&apos;s a great way to experience MacroPlan before deciding to upgrade.
                </p>
              </details>

              <details className="group bg-card p-6 rounded-xl border border-border-strong [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-lg list-none">
                  What happens after I use my free batch prep plans?
                  <ChevronDown className="w-5 h-5 text-icon transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-subtle-foreground mt-4 leading-relaxed">
                  Once you&apos;ve used your 3 free batch prep plans, you can still browse recipes, view your existing plans, and use all the basic features. To generate new prep plans, you&apos;ll need to upgrade to Premium.
                </p>
              </details>

              <details className="group bg-card p-6 rounded-xl border border-border-strong [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-lg list-none">
                  Can I cancel my subscription anytime?
                  <ChevronDown className="w-5 h-5 text-icon transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-subtle-foreground mt-4 leading-relaxed">
                  Absolutely. You can cancel your Premium subscription at any time from your account settings. You'll continue to have access to Premium features until the end of your current billing period.
                </p>
              </details>

              <details className="group bg-card p-6 rounded-xl border border-border-strong [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-lg list-none">
                  Is there a money-back guarantee?
                  <ChevronDown className="w-5 h-5 text-icon transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-subtle-foreground mt-4 leading-relaxed">
                  Yes! We offer a 7-day money-back guarantee. If you're not satisfied with Premium for any reason within the first 7 days, contact us and we'll issue a full refund.
                </p>
              </details>

              <details className="group bg-card p-6 rounded-xl border border-border-strong [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-lg list-none">
                  What payment methods do you accept?
                  <ChevronDown className="w-5 h-5 text-icon transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-subtle-foreground mt-4 leading-relaxed">
                  We accept all major credit cards (Visa, MasterCard, American Express) through our secure payment processor, Stripe. We also support Apple Pay and Google Pay.
                </p>
              </details>

              <details className="group bg-card p-6 rounded-xl border border-border-strong [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-lg list-none">
                  Can I switch between monthly and annual plans?
                  <ChevronDown className="w-5 h-5 text-icon transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-subtle-foreground mt-4 leading-relaxed">
                  Yes! You can switch from monthly to annual billing at any time to save 33%. If you switch from annual to monthly, the change will take effect at the end of your current annual period.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="bg-primary text-primary-foreground rounded-3xl p-10 md:p-20 text-center shadow-2xl shadow-primary/20 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:20px_20px]"></div>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to hit your macros?</h2>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto relative z-10">
                Cook once, eat all week. AI-generated batch prep plans that hit your exact macros.
              </p>
              <Link href="/signup" className="inline-block bg-white text-primary font-bold py-4 px-10 rounded-xl hover:bg-white/90 transition-colors shadow-lg relative z-10">
                Start Free Today
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-muted border-t border-border-strong">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground">© 2026 Macro Plan. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/help" className="hover:text-primary transition-colors">Help</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
