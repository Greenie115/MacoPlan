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
  description: 'You know your macros. MacroPlan works out what to cook to hit them: batch recipes, portions, cooking order and a shopping list for one prep session, in seconds.',
  keywords: ['meal prep', 'batch cooking', 'macro calculator', 'nutrition', 'fitness', 'meal prep planner', 'lifting', 'bodybuilding meal prep'],
  openGraph: {
    title: 'MacroPlan - Your Meal Prep, Planned',
    description: 'You know your macros. MacroPlan works out what to cook to hit them: batch recipes, portions, cooking order and a shopping list for one prep session, in seconds.',
    type: 'website',
    siteName: 'MacroPlan',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MacroPlan - Your Meal Prep, Planned',
    description: 'You know your macros. MacroPlan works out what to cook to hit them: batch recipes, portions, cooking order and a shopping list for one prep session, in seconds.',
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
  description: 'Meal prep planner for lifters. Turns your macro targets and prep day into a batch-cook plan with portions, a cooking order and a shopping list.',
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
  { value: '1', label: 'prep session a week' },
  { value: '3-6', label: 'recipes, not 28' },
  { value: '2', label: 'day types: training and rest' },
  { value: '0', label: 'macro maths left for you' },
] as const

const STEPS = [
  {
    title: 'Tell it how you train',
    copy: 'Lifting days and rest days need different fuel. Set both once and stop recalculating every week.',
  },
  {
    title: 'Get a plan, not homework',
    copy: 'MacroPlan picks batch recipes and sizes every portion to your targets. No spreadsheet. No guessing.',
  },
  {
    title: 'Cook once, then stop thinking',
    copy: 'Follow the cooking order, fill the containers, shut the fridge. On Wednesday you just open a lid.',
  },
] as const

const FEATURES = [
  {
    title: 'Food that survives Thursday',
    copy: 'Recipes picked for bulk cooking and days in the fridge, so day four still tastes like dinner.',
  },
  {
    title: 'A cooking order, not chaos',
    copy: 'The longest cook goes on first. You always know what to start next.',
  },
  {
    title: 'Training and rest days, handled',
    copy: 'Bigger portions when you lift, smaller when you don\u2019t. Same food, no second plan.',
  },
  {
    title: 'One shopping list',
    copy: 'Everything for the week, grouped by recipe. One trip, nothing forgotten.',
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
                    Stop winging
                    <span className="block text-primary">your meal&nbsp;prep.</span>
                  </h1>

                  <p className="landing-rise mt-7 max-w-xl text-lg leading-relaxed text-white/65 md:text-xl" style={{ animationDelay: '0.2s' }}>
                    You know your macros. Working out what to cook to hit them is what eats your Sunday.
                    MacroPlan hands you the recipes, the portions, the cooking order and the shopping list, in
                    seconds.
                  </p>

                  <div className="landing-rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ animationDelay: '0.28s' }}>
                    <Link href="/onboarding/1" className={CTA_CLASS}>
                      Sort my prep, free
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
                From &ldquo;what do I cook?&rdquo; to a stocked fridge.
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
                  Nobody preps 28 recipes. You cook a few things in bulk and eat them all week. MacroPlan plans
                  for that, because that is what you will actually do.
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
                  Skip the Sunday scramble and the 9pm protein panic. Your first plan is free.
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
