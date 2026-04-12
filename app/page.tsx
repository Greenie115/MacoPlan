import type { Metadata } from 'next'
import Link from 'next/link'
import { Utensils, ArrowRight, Target, Zap, TrendingUp, Clock, CalendarCheck, RefreshCw } from 'lucide-react'
import { FAQSection } from '@/components/landing/faq-section'
import { Footer } from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'MacroPlan - The Meal Prep Planner That Actually Understands How Lifters Eat',
  description: 'AI-generated batch cooking plans that hit your exact macros. Tell us your prep day, your macros, and how many containers to fill — done in 3 seconds.',
  keywords: ['meal prep', 'batch cooking', 'macro calculator', 'nutrition', 'fitness', 'meal prep planner', 'lifting', 'bodybuilding meal prep'],
  openGraph: {
    title: 'MacroPlan - Your Meal Prep, Planned',
    description: 'AI-generated batch cooking plans that hit your exact macros. Tell us your prep day, your macros, and how many containers to fill — done in 3 seconds.',
    type: 'website',
    siteName: 'MacroPlan',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MacroPlan - Your Meal Prep, Planned',
    description: 'AI-generated batch cooking plans that hit your exact macros. Tell us your prep day, your macros, and how many containers to fill — done in 3 seconds.',
  },
  alternates: {
    canonical: '/',
  },
}

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Macro Plan',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  description: 'AI-powered meal planning application that generates personalized meal plans based on your macro targets and dietary preferences.',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '0',
    highPrice: '9.99',
    offerCount: '3',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Premium Monthly',
        price: '9.99',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Premium Annual',
        price: '79.99',
        priceCurrency: 'USD',
      },
    ],
  },
}

export default function LandingPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-background/95 backdrop-blur-md border-b border-border-strong" role="banner">
          <div className="container mx-auto px-6">
            <nav className="flex items-center justify-between" aria-label="Main navigation">
              <Link href="/" className="flex items-center gap-2 text-2xl font-bold" aria-label="Macro Plan - Home">
                <Utensils className="w-8 h-8 text-primary" aria-hidden="true" />
                <span>Macro Plan</span>
              </Link>

              <div className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Page sections">
                <a href="/#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a>
                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link>
                <a href="/#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/login" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Log In
                </Link>
                <Link href="/signup" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30">
                  Start Free
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main className="pt-20" role="main">
          {/* ==================== HERO ==================== */}
          <section className="pt-16 pb-12 md:pt-24 md:pb-20" aria-labelledby="hero-heading">
            <div className="container mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left Column - Copy */}
                <div className="text-center lg:text-left">
                  <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
                    Your meal prep,{' '}
                    <span className="text-primary">planned.</span>
                  </h1>

                  <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    AI-generated batch cooking plans that hit your exact macros. Tell us your prep day, your macros, and how many containers to fill — done in 3 seconds.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center">
                    <Link
                      href="/meal-plans/generate"
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                    >
                      <span>Start your first prep — free</span>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </Link>
                    <span className="text-sm text-muted-foreground">No credit card required</span>
                  </div>
                </div>

                {/* Right Column - Simplified Mockup */}
                <div className="hidden lg:block">
                  <div className="bg-card border border-border-strong rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
                    {/* Mockup Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Monday</p>
                        <h3 className="text-lg font-bold">Your Meal Plan</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">2,150</p>
                        <p className="text-xs text-muted-foreground">calories</p>
                      </div>
                    </div>

                    {/* Macro Bars */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="text-center">
                        <div className="h-2 bg-protein/20 rounded-full mb-1.5 overflow-hidden">
                          <div className="h-full bg-protein rounded-full" style={{ width: '85%' }} />
                        </div>
                        <p className="text-xs font-semibold">Protein</p>
                        <p className="text-xs text-muted-foreground">170g</p>
                      </div>
                      <div className="text-center">
                        <div className="h-2 bg-carb/20 rounded-full mb-1.5 overflow-hidden">
                          <div className="h-full bg-carb rounded-full" style={{ width: '75%' }} />
                        </div>
                        <p className="text-xs font-semibold">Carbs</p>
                        <p className="text-xs text-muted-foreground">230g</p>
                      </div>
                      <div className="text-center">
                        <div className="h-2 bg-fat/20 rounded-full mb-1.5 overflow-hidden">
                          <div className="h-full bg-fat rounded-full" style={{ width: '65%' }} />
                        </div>
                        <p className="text-xs font-semibold">Fat</p>
                        <p className="text-xs text-muted-foreground">72g</p>
                      </div>
                    </div>

                    {/* Meal List */}
                    <div className="space-y-3">
                      {[
                        { meal: 'Breakfast', name: 'Greek Yogurt Parfait', cal: 420 },
                        { meal: 'Lunch', name: 'Grilled Chicken Bowl', cal: 650 },
                        { meal: 'Snack', name: 'Protein Smoothie', cal: 280 },
                        { meal: 'Dinner', name: 'Salmon & Sweet Potato', cal: 800 },
                      ].map((item) => (
                        <div key={item.meal} className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-xl">
                          <div>
                            <p className="text-xs text-muted-foreground">{item.meal}</p>
                            <p className="font-medium text-sm">{item.name}</p>
                          </div>
                          <p className="text-sm font-semibold text-muted-foreground">{item.cal} cal</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== PROOF STRIP ==================== */}
          <section className="py-8 border-y border-border-strong bg-muted/30">
            <div className="container mx-auto px-6">
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
                <div>
                  <p className="text-2xl md:text-3xl font-bold">500+</p>
                  <p className="text-sm text-muted-foreground">Recipes</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold">15+</p>
                  <p className="text-sm text-muted-foreground">Diet Types</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold">3s</p>
                  <p className="text-sm text-muted-foreground">Plan Generation</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold">100%</p>
                  <p className="text-sm text-muted-foreground">Macro-Calculated</p>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== HOW IT WORKS ==================== */}
          <section className="py-20 md:py-28" id="how-it-works">
            <div className="container mx-auto px-6 max-w-5xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Three steps. Three seconds. A full week of prep.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-sm font-bold text-primary mb-2">Step 1</div>
                  <h3 className="text-xl font-bold mb-3">Set your macros + training days</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Training 5x/week? We calculate your training day and rest day targets automatically.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-sm font-bold text-primary mb-2">Step 2</div>
                  <h3 className="text-xl font-bold mb-3">Generate your prep plan</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    AI builds a batch-cook plan optimised for cooking once, eating all week. 3-4 recipes, one shopping list, one prep session.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <TrendingUp className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-sm font-bold text-primary mb-2">Step 3</div>
                  <h3 className="text-xl font-bold mb-3">Cook, container, crush it</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Follow the step-by-step cooking timeline. Fill your containers. Hit your macros every day without thinking.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== DIFFERENTIATOR ==================== */}
          <section className="py-20 md:py-28 bg-muted/30 border-y border-border-strong">
            <div className="container mx-auto px-6 max-w-5xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for people who actually meal prep</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Other apps give you 28 different recipes for 28 meals. You&apos;re not cooking 28 meals. You&apos;re cooking on Sunday and eating from containers all week. MacroPlan is the only planner that understands this.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                <div className="bg-card border border-border-strong rounded-2xl p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Utensils className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Batch-optimised recipes</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every meal designed for bulk cooking and 5-day refrigeration
                  </p>
                </div>

                <div className="bg-card border border-border-strong rounded-2xl p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Cooking timeline</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Oven first, rice cooker second, stovetop third. We tell you what to do and when.
                  </p>
                </div>

                <div className="bg-card border border-border-strong rounded-2xl p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <CalendarCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Training day / rest day macros</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Different targets for different days, automatically
                  </p>
                </div>

                <div className="bg-card border border-border-strong rounded-2xl p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <RefreshCw className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Fridge-aware replanning</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    Coming soon
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== CTA ==================== */}
          <section className="py-20 bg-muted/30 border-y border-border-strong">
            <div className="container mx-auto px-6 max-w-2xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to stop guessing?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands who&apos;ve replaced calorie counting with smart meal planning.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
              >
                <span>Start for free</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <p className="text-sm text-muted-foreground mt-4">Free plan available · No credit card required</p>
            </div>
          </section>

          {/* ==================== FAQ ==================== */}
          <FAQSection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}
