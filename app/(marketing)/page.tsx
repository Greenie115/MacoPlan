import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { FAQSection } from '@/components/landing/faq-section'
import { Footer } from '@/components/landing/footer'
import { MarketingHeader } from '@/components/landing/marketing-header'
import { SuccessStories } from '@/components/landing/success-stories'
import { PrepTicket } from '@/components/landing/prep-ticket'

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
  { value: '500+', label: 'batch-tested recipes' },
  { value: '15+', label: 'diet styles covered' },
  { value: '3s', label: 'to a full week of meals' },
  { value: '100%', label: 'macro-calculated' },
] as const

const STEPS = [
  {
    title: 'Set your macros and training days',
    copy: 'Training 5x/week? We calculate your training day and rest day targets automatically.',
  },
  {
    title: 'Generate your prep plan',
    copy: 'AI builds a batch-cook plan optimised for cooking once, eating all week. 3-4 recipes, one shopping list, one prep session.',
  },
  {
    title: 'Cook, container, crush it',
    copy: 'Follow the step-by-step cooking timeline. Fill your containers. Hit your macros every day without thinking.',
  },
] as const

const FEATURES = [
  {
    title: 'Batch-optimised recipes',
    copy: 'Every meal designed for bulk cooking and 5-day refrigeration.',
  },
  {
    title: 'Cooking timeline',
    copy: 'Oven first, rice cooker second, stovetop third. We tell you what to do and when.',
  },
  {
    title: 'Training day / rest day macros',
    copy: 'Different targets for different days, automatically.',
  },
  {
    title: 'One-tap shopping list',
    copy: 'Every plan generates a consolidated grocery list. Buy once, prep once.',
  },
] as const

const CTA_CLASS =
  'inline-flex items-center gap-2 rounded-full bg-coral-600 px-7 py-3.5 text-base font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] transition-[background-color,box-shadow,transform] duration-base ease-out-quint hover:-translate-y-0.5 hover:bg-coral-700 hover:shadow-coral active:scale-[0.97]'

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript }} />
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
        <MarketingHeader />

        <main id="main-content">
          {/* ==================== HERO ==================== */}
          <section className="relative overflow-hidden bg-charcoal pt-28 text-white md:pt-36" aria-labelledby="hero-heading">
            <div aria-hidden="true" className="premium-mesh" />
            <div aria-hidden="true" className="grain-overlay" />

            <div className="relative mx-auto max-w-6xl px-6">
              <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
                <div>
                  <p className="landing-rise font-mono text-xs uppercase tracking-[0.16em] text-white/55" style={{ animationDelay: '0.05s' }}>
                    <span className="pulse-dot mr-2 inline-block size-1.5 rounded-full bg-primary align-middle" />
                    Batch-cook planner for lifters
                  </p>

                  <h1
                    id="hero-heading"
                    className="landing-rise mt-6 text-display-2xl font-extrabold leading-[0.95] tracking-tight"
                    style={{ animationDelay: '0.12s' }}
                  >
                    Cook once.
                    <span className="block text-primary">Hit your macros all&nbsp;week.</span>
                  </h1>

                  <p className="landing-rise mt-7 max-w-xl text-lg leading-relaxed text-white/65 md:text-xl" style={{ animationDelay: '0.2s' }}>
                    Tell MacroPlan your targets and your prep day. It hands back 3-4 batch recipes, a cooking
                    timeline, and a shopping list that fills every container, in 3 seconds.
                  </p>

                  <div className="landing-rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ animationDelay: '0.28s' }}>
                    <Link href="/onboarding/1" className={CTA_CLASS}>
                      Generate my prep plan free
                      <ArrowRight className="size-5" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/#how-it-works"
                      className="font-medium text-white/70 underline decoration-white/25 underline-offset-4 transition-colors duration-base hover:text-white hover:decoration-white"
                    >
                      See how it works
                    </Link>
                  </div>

                  <ul className="landing-rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50" style={{ animationDelay: '0.36s' }}>
                    {['No credit card', 'Free plan included', 'Cancel anytime'].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="size-4 text-primary" aria-hidden="true" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="landing-rise" style={{ animationDelay: '0.25s' }}>
                  <PrepTicket />
                </div>
              </div>

              <dl className="landing-rise mt-20 grid grid-cols-2 border-t border-white/10 md:grid-cols-4" style={{ animationDelay: '0.45s' }}>
                {PROOF_STATS.map((stat) => (
                  <div key={stat.label} className="border-white/10 py-7 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0">
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="font-display text-4xl font-extrabold tabular-nums tracking-tight">{stat.value}</dd>
                    <dd className="mt-1 font-mono text-xs uppercase tracking-wider text-white/45">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* ==================== HOW IT WORKS ==================== */}
          <section className="py-24 md:py-32" id="how-it-works" aria-labelledby="how-heading">
            <div className="mx-auto max-w-6xl px-6">
              <h2 id="how-heading" className="max-w-2xl text-display-xl font-extrabold leading-[1.05]">
                Three steps to a stocked fridge.
              </h2>
              <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="border-t border-foreground pt-6 md:pr-10">
                    <span className="font-mono text-sm tabular-nums text-coral-700">Step {i + 1}</span>
                    <h3 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight">{step.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{step.copy}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ==================== DIFFERENTIATOR ==================== */}
          <section className="border-y border-border-strong bg-card py-24 md:py-32" aria-labelledby="diff-heading">
            <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-2 lg:gap-20">
              <div>
                <h2 id="diff-heading" className="text-display-lg font-extrabold leading-[1.05]">
                  Other apps plan 28 different meals. <span className="text-coral-700">You&apos;re cooking on Sunday.</span>
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  You&apos;re not cooking 28 meals. You&apos;re cooking once and eating from containers all week.
                  MacroPlan is the only planner built around that.
                </p>

                {/* The whole argument as a picture: 28 one-off meals vs 4 batches */}
                <div className="mt-10 grid grid-cols-2 gap-8" aria-hidden="true">
                  <div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: 28 }, (_, i) => (
                        <span key={i} className="aspect-square rounded-[3px] border border-border-strong" />
                      ))}
                    </div>
                    <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">28 meals to cook</p>
                  </div>
                  <div>
                    <div className="grid h-[calc(100%-1.75rem)] grid-cols-4 gap-1.5">
                      {['bg-protein', 'bg-carb', 'bg-fat', 'bg-foreground'].map((c) => (
                        <span key={c} className={`rounded-[3px] ${c}`} />
                      ))}
                    </div>
                    <p className="mt-3 font-mono text-xs uppercase tracking-wider text-foreground">4 batches, 1 session</p>
                  </div>
                </div>
              </div>

              <dl className="self-center">
                {FEATURES.map((feature) => (
                  <div key={feature.title} className="border-t border-border-strong py-6 last:border-b">
                    <dt className="font-display text-xl font-bold tracking-tight">{feature.title}</dt>
                    <dd className="mt-1.5 text-muted-foreground">{feature.copy}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <SuccessStories />

          {/* ==================== CTA ==================== */}
          <section className="px-6 pb-24 md:pb-32" aria-labelledby="cta-heading">
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-charcoal px-8 py-16 text-white md:px-16 md:py-20">
              <div aria-hidden="true" className="premium-mesh" />
              <div aria-hidden="true" className="grain-overlay" />
              <div className="relative max-w-2xl">
                <h2 id="cta-heading" className="text-display-lg font-extrabold leading-[1.05]">
                  Your next prep day is already planned.
                </h2>
                <p className="mt-5 text-lg text-white/65">
                  Replace endless calorie counting with one smart prep session a week. Your first plan is free.
                </p>
                <Link href="/signup" className={`${CTA_CLASS} mt-9`}>
                  Start for free
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
                <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
                  {['No credit card', 'Cancel anytime', 'Secure checkout via Stripe'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="size-4 text-primary" aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <FAQSection />
        </main>

        <Footer />
      </div>
    </>
  )
}
