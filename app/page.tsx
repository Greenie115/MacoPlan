import type { Metadata } from 'next'
import Link from 'next/link'
import { Utensils, ArrowRight } from 'lucide-react'
import { BrowserMockup } from '@/components/landing/browser-mockup'
import { RatingsCarousel } from '@/components/landing/ratings-carousel'
import { HowItWorksV2 } from '@/components/landing/how-it-works-v2'
import { RecipeDatabaseCallout } from '@/components/landing/recipe-database-callout'
import { SuccessStories } from '@/components/landing/success-stories'
import { QuizCTA } from '@/components/landing/quiz-cta'
import { BlogPreview } from '@/components/landing/blog-preview'
import { FAQSection } from '@/components/landing/faq-section'
import { Footer } from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'MacroPlan - Meal Planning for Real Life',
  description: 'Stop wasting hours on meal prep. MacroPlan generates personalized meal plans that hit your exact macros instantly. Join 10,000+ users eating better with less effort.',
  keywords: ['meal planning', 'macro calculator', 'nutrition', 'diet', 'fitness', 'personalized meal plans', 'healthy eating'],
  openGraph: {
    title: 'MacroPlan - Meal Planning for Real Life',
    description: 'Stop wasting hours on meal prep. MacroPlan generates personalized meal plans that hit your exact macros instantly.',
    type: 'website',
    siteName: 'MacroPlan',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MacroPlan - Meal Planning for Real Life',
    description: 'Stop wasting hours on meal prep. MacroPlan generates personalized meal plans that hit your exact macros instantly.',
  },
  alternates: {
    canonical: '/',
  },
}

// JSON-LD structured data for SEO
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
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '10000',
    bestRating: '5',
    worstRating: '1',
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
              <Link href="/" className="flex items-center gap-2 text-2xl font-bold" aria-label="MacroPlan - Home">
                <Utensils className="w-8 h-8 text-primary" aria-hidden="true" />
                <span>MacroPlan</span>
              </Link>

              <div className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Page sections">
                <a href="/#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link>
                <a href="/#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/login" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Log In
                </Link>
                <Link href="/signup" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30">
                  Start Today
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main className="pt-20" role="main">
          {/* Hero Section */}
          <section className="pt-16 pb-12 md:pt-24 md:pb-16" aria-labelledby="hero-heading">
            <div className="container mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Copy */}
                <div className="text-center lg:text-left">
                  <div className="inline-block bg-primary/10 text-primary font-semibold text-sm px-4 py-2 rounded-full mb-6">
                    #1 macro meal planner
                  </div>

                  <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
                    Meal planning{' '}
                    <span className="block">for <span className="text-primary">real life</span></span>
                  </h1>

                  <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Make progress with personalized meal plans that hit your macros, fit your schedule, and taste amazing.
                  </p>

                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                  >
                    <span>Start Today</span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </Link>
                </div>

                {/* Right Column - Browser Mockup */}
                <div className="animate-in fade-in slide-in-from-right-8 duration-1000">
                  <BrowserMockup />
                </div>
              </div>
            </div>
          </section>

          {/* Ratings Carousel - Hidden until we have real reviews */}
          {/* <RatingsCarousel /> */}

          {/* How It Works */}
          <HowItWorksV2 />

          {/* Recipe Database Callout */}
          <RecipeDatabaseCallout />

          {/* Success Stories / Testimonials - Hidden until we have real testimonials */}
          {/* <SuccessStories /> */}

          {/* Quiz CTA */}
          <QuizCTA />

          {/* Blog Preview */}
          <BlogPreview />

          {/* FAQ */}
          <FAQSection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}
