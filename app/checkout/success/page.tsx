import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Welcome to Premium - MacroPlan',
  description: 'Your subscription is now active. Enjoy unlimited meal plans and premium features.',
}

interface PageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sessionId = params.session_id

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="size-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
            <CheckCircle className="size-12 text-success" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="size-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Welcome to Premium</span>
            <Sparkles className="size-5 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            That&apos;s the last time you&apos;ll wonder what to eat this week.
          </h1>

          <p className="text-muted-foreground text-lg">
            Premium is live — 100 plans a month, PDF export, your prep on autopilot.
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-card rounded-2xl border border-border-strong p-6 mb-8 text-left">
          <h2 className="font-bold text-lg mb-4">What&apos;s unlocked:</h2>
          <ul className="space-y-3">
            {[
              '100 meal plans a month',
              'Training & rest day splits',
              'Export plans as PDF',
              'Priority customer support',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <CheckCircle className="size-5 text-success shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Link
          href="/meal-plans/generate"
          className="inline-flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          Generate this week&apos;s plan
          <ArrowRight className="size-5" />
        </Link>

        <Link
          href="/dashboard"
          className="inline-block mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Go to dashboard instead
        </Link>

        {/* Debug info - hidden in production */}
        {sessionId && process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-muted-foreground mt-4 font-mono">
            Session: {sessionId.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  )
}
