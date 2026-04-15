import type { Metadata } from 'next'
import Link from 'next/link'
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Checkout Cancelled - Macro Plan',
  description: 'Your checkout was cancelled. No charges were made.',
}

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Cancel Icon */}
        <div className="mb-8">
          <div className="size-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <XCircle className="size-12 text-muted-foreground" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            Checkout Cancelled
          </h1>

          <p className="text-muted-foreground text-lg">
            No worries! Your checkout was cancelled and no charges were made.
          </p>
        </div>

        {/* Reassurance */}
        <div className="bg-card rounded-2xl border border-border-strong p-6 mb-8 text-left">
          <h2 className="font-bold text-lg mb-4">Still on the fence?</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>You can try the free tier with 3 meal plans</li>
            <li>7-day money-back guarantee on all plans</li>
            <li>Cancel your subscription anytime</li>
            <li>Questions? We&apos;re here to help</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            <ArrowLeft className="size-5" />
            Back to Pricing
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full bg-muted hover:bg-muted/80 text-foreground font-semibold py-4 px-6 rounded-xl transition-all"
          >
            Continue with Free Plan
          </Link>

          <a
            href="mailto:support@macroplan.app"
            className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-4"
          >
            <MessageCircle className="size-4" />
            Have questions? Contact support
          </a>
        </div>
      </div>
    </div>
  )
}
