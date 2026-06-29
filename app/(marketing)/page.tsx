import type { Metadata } from 'next'
import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import {
  Utensils,
  ArrowRight,
  ArrowDown,
  Target,
  Zap,
  TrendingUp,
  Clock,
  CalendarCheck,
  RefreshCw,
  Check,
} from 'lucide-react'
import { FAQSection } from '@/components/landing/faq-section'
import { Footer } from '@/components/landing/footer'
import { Logo } from '@/components/brand/logo'
import { SuccessStories } from '@/components/landing/success-stories'
import { Reveal } from '@/components/landing/reveal'
import { HeroPrepCard } from '@/components/landing/hero-prep-card'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
})

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

// JSON-LD structured data for SEO (static content, < escaped for safe inlining)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MacroPlan',
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

const jsonLdScript = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

const PROOF_STATS = [
  { value: '500+', label: 'batch-tested recipes', accent: 'text-protein' },
  { value: '15+', label: 'diet styles covered', accent: 'text-carb' },
  { value: '3s', label: 'to a full week of meals', accent: 'text-fat' },
  { value: '100%', label: 'macro-calculated', accent: 'text-primary' },
] as const

const STEPS = [
  {
    number: '01',
    icon: Target,
    title: 'Set your macros + training days',
    copy: 'Training 5x/week? We calculate your training day and rest day targets automatically.',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Generate your prep plan',
    copy: 'AI builds a batch-cook plan optimised for cooking once, eating all week. 3-4 recipes, one shopping list, one prep session.',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Cook, container, crush it',
    copy: 'Follow the step-by-step cooking timeline. Fill your containers. Hit your macros every day without thinking.',
  },
] as const

const FEATURES = [
  {
    icon: Utensils,
    title: 'Batch-optimised recipes',
    copy: 'Every meal designed for bulk cooking and 5-day refrigeration.',
  },
  {
    icon: Clock,
    title: 'Cooking timeline',
    copy: 'Oven first, rice cooker second, stovetop third. We tell you what to do and when.',
  },
  {
    icon: CalendarCheck,
    title: 'Training day / rest day macros',
    copy: 'Different targets for different days, automatically.',
  },
  {
    icon: RefreshCw,
    title: 'One-tap shopping list',
    copy: 'Every plan generates a consolidated grocery list — buy once, prep once.',
  },
] as const

export default function LandingPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript }}
      />
      <div className={`${display.variable} min-h-screen bg-background text-foreground font-sans selection:bg-primary/30`}>
        {/* ==================== HEADER ==================== */}
        <header
          className="fixed top-0 left-0 right-0 z-50 bg-charcoal/90 backdrop-blur-xl border-b border-white/10"
          role="banner"
        >
          <div className="container mx-auto px-6">
            <nav className="flex h-16 items-center justify-between" aria-label="Main navigation">
              <Logo href="/" markSize={30} textClassName="text-xl font-bold tracking-tight text-white" />

              <div className="hidden md:flex items-center gap-8 text-sm font-medium" role="navigation" aria-label="Page sections">
                <Link href="/#how-it-works" className="text-white/60 hover:text-white transition-colors">How it works</Link>
                <Link href="/pricing" className="text-white/60 hover:text-white transition-colors">Pricing</Link>
                <Link href="/blog" className="text-white/60 hover:text-white transition-colors">Blog</Link>
                <Link href="/#faq" className="text-white/60 hover:text-white transition-colors">FAQ</Link>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/login" className="hidden md:block text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-2">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary hover:bg-primary/90 active:scale-[0.97] text-primary-foreground text-sm font-bold py-2.5 px-5 rounded-full transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-px"
                >
                  Start free
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main role="main" id="main-content">
          {/* ==================== HERO (dark) ==================== */}
          <section
            className="relative overflow-hidden bg-charcoal text-white pt-28 pb-20 md:pt-36 md:pb-24"
            aria-labelledby="hero-heading"
          >
            {/* Atmosphere: coral glow + faint grid */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_75%_15%,rgba(255,107,92,0.16),transparent_65%)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:56px_56px]"
            />

            <div className="container mx-auto px-6 relative">
              <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-12 items-center">
                {/* Copy */}
                <div className="text-center lg:text-left">
                  <p
                    className="landing-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/70"
                    style={{ animationDelay: '0.05s' }}
                  >
                    <span className="pulse-dot size-1.5 rounded-full bg-primary" />
                    AI batch-cooking planner
                  </p>

                  <h1
                    id="hero-heading"
                    className="landing-rise mt-6 text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[0.98] tracking-tight [font-family:var(--font-display)] [text-wrap:balance]"
                    style={{ animationDelay: '0.15s' }}
                  >
                    Cook once.
                    <span className="block text-primary">Hit your macros all&nbsp;week.</span>
                  </h1>

                  <p
                    className="landing-rise mt-6 text-lg md:text-xl text-white/65 leading-relaxed max-w-xl mx-auto lg:mx-0"
                    style={{ animationDelay: '0.25s' }}
                  >
                    Tell MacroPlan your targets and your prep day. It hands back 3-4 batch
                    recipes, a cooking timeline, and a shopping list that fills every
                    container — in 3 seconds.
                  </p>

                  <div
                    className="landing-rise mt-9 flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center"
                    style={{ animationDelay: '0.35s' }}
                  >
                    <Link
                      href="/onboarding/1"
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-[0.97] text-primary-foreground font-bold py-4 px-8 rounded-full transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 text-base"
                    >
                      <span>Generate my prep plan — free</span>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/#how-it-works"
                      className="inline-flex items-center gap-2 text-white/70 hover:text-white font-semibold py-4 px-4 transition-colors"
                    >
                      <span>See how it works</span>
                      <ArrowDown className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <ul
                    className="landing-rise mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-white/50"
                    style={{ animationDelay: '0.45s' }}
                  >
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" aria-hidden="true" /> No credit card</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" aria-hidden="true" /> Free plan included</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" aria-hidden="true" /> Cancel anytime</li>
                  </ul>
                </div>

                {/* Product proof */}
                <div className="landing-rise px-2 pt-6 lg:pt-0 sm:px-0" style={{ animationDelay: '0.3s' }}>
                  <HeroPrepCard />
                </div>
              </div>

              {/* Proof strip */}
              <div className="landing-rise mt-24 border-t border-white/10 pt-10" style={{ animationDelay: '0.55s' }}>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 text-center">
                  {PROOF_STATS.map((stat) => (
                    <div key={stat.label}>
                      <dt className="sr-only">{stat.label}</dt>
                      <dd className={`text-4xl md:text-5xl font-extrabold tabular-nums [font-family:var(--font-display)] ${stat.accent}`}>
                        {stat.value}
                      </dd>
                      <dd className="mt-1.5 text-sm text-white/50">{stat.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/* ==================== HOW IT WORKS ==================== */}
          <section className="py-24 md:py-32" id="how-it-works" aria-labelledby="how-heading">
            <div className="container mx-auto px-6 max-w-6xl">
              <Reveal className="max-w-2xl mb-16">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-3">How it works</p>
                <h2 id="how-heading" className="text-4xl md:text-5xl font-extrabold tracking-tight [font-family:var(--font-display)] [text-wrap:balance]">
                  Three steps to a stocked fridge.
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Three steps. Three seconds. A full week of prep.
                </p>
              </Reveal>

              <div className="relative max-w-3xl">
                {/* Vertical connector line */}
                <div aria-hidden="true" className="absolute left-6 top-0 bottom-0 w-px bg-border-strong hidden md:block" />

                <div className="space-y-8 md:space-y-12">
                  {STEPS.map((step, i) => (
                    <Reveal key={step.number} delay={i * 0.12}>
                      <div className="relative flex gap-6 md:gap-8 items-start">
                        {/* Step number circle */}
                        <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-extrabold [font-family:var(--font-display)] shadow-lg shadow-primary/20">
                          {step.number}
                        </div>
                        {/* Content */}
                        <div className="flex-1 bg-card border border-border-strong rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-primary/8 hover:border-primary/20">
                          <div className="flex items-center gap-3 mb-2">
                            <step.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                            <h3 className="text-lg font-bold [font-family:var(--font-display)]">{step.title}</h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed text-[15px]">{step.copy}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ==================== DIFFERENTIATOR ==================== */}
          <section className="pb-24 md:pb-32" aria-labelledby="diff-heading">
            <div className="container mx-auto px-6 max-w-6xl">
              {/* Statement card */}
              <Reveal>
                <div className="relative overflow-hidden bg-charcoal text-white rounded-3xl px-8 py-14 md:px-16 md:py-20 text-center">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_120%,rgba(255,107,92,0.22),transparent_70%)]"
                  />
                  <div className="relative max-w-3xl mx-auto">
                    <h2 id="diff-heading" className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.08] [font-family:var(--font-display)] [text-wrap:balance]">
                      Other apps plan 28 different meals.{' '}
                      <span className="text-primary">You&apos;re cooking on Sunday.</span>
                    </h2>
                    <p className="mt-6 text-lg text-white/60 leading-relaxed">
                      You&apos;re not cooking 28 meals — you&apos;re cooking once and eating from
                      containers all week. MacroPlan is the only planner built around that.
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Feature grid — 2×2 with breathing room */}
              <div className="grid sm:grid-cols-2 gap-5 mt-6">
                {FEATURES.map((feature, i) => (
                  <Reveal key={feature.title} delay={i * 0.08}>
                    <div className="h-full bg-card border border-border-strong rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/8 hover:border-primary/25 group">
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/15">
                        <feature.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                      </div>
                      <h3 className="text-base font-bold mb-2 [font-family:var(--font-display)]">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.copy}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ==================== WHY IT WORKS ==================== */}
          <SuccessStories />

          {/* ==================== CTA ==================== */}
          <section className="py-24 md:py-28" aria-labelledby="cta-heading">
            <div className="container mx-auto px-6 max-w-6xl">
              <Reveal>
                <div className="relative overflow-hidden bg-primary text-primary-foreground rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:48px_48px]"
                  />
                  <div className="relative max-w-2xl mx-auto">
                    <h2 id="cta-heading" className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05] [font-family:var(--font-display)] [text-wrap:balance]">
                      Your next prep day is already planned.
                    </h2>
                    <p className="mt-5 text-lg text-white/85">
                      Replace endless calorie counting with one smart prep session a week.
                      Your first plan is free.
                    </p>
                    <Link
                      href="/signup"
                      className="mt-9 inline-flex items-center gap-2 bg-charcoal text-white hover:bg-charcoal/90 active:scale-[0.97] font-bold py-4 px-9 rounded-full transition-all shadow-xl shadow-charcoal/30 hover:-translate-y-0.5"
                    >
                      <span>Start for free</span>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </Link>
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80">
                      <span className="flex items-center gap-2"><Check className="w-4 h-4" aria-hidden="true" /> No credit card</span>
                      <span className="flex items-center gap-2"><Check className="w-4 h-4" aria-hidden="true" /> Cancel anytime</span>
                      <span className="flex items-center gap-2"><Check className="w-4 h-4" aria-hidden="true" /> Secure checkout via Stripe</span>
                    </div>
                  </div>
                </div>
              </Reveal>
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
