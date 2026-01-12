'use client'

/**
 * Paywall Modal Component
 *
 * Displays when free users hit their limits (meal plans, swaps, etc.)
 * Integrates with Stripe for subscription checkout
 */

import { useEffect, useState, useTransition } from 'react'
import { X, Lock, CheckCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react'
import { createCheckoutSession } from '@/app/actions/stripe'

export type PaywallTrigger =
  | 'meal_plan_limit'
  | 'swap_limit'
  | 'premium_feature'
  | 'export_pdf'
  | 'favorites_limit'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  /** Context for why the paywall is shown */
  trigger?: PaywallTrigger
  /** Called when user clicks subscribe (optional override) */
  onSubscribe?: (plan: 'monthly' | 'annual') => void
}

const triggerMessages: Record<PaywallTrigger, { headline: string; subtitle: string }> = {
  meal_plan_limit: {
    headline: "You've reached your limit",
    subtitle: "You've used all 3 free meal plans. Upgrade to Premium for unlimited plans and more features.",
  },
  swap_limit: {
    headline: 'Swap limit reached',
    subtitle: "You've used all 3 free meal swaps. Upgrade to Premium for unlimited swaps.",
  },
  premium_feature: {
    headline: 'Premium Feature',
    subtitle: 'This feature is available with Premium. Upgrade to unlock.',
  },
  export_pdf: {
    headline: 'Export to PDF',
    subtitle: 'PDF export is a Premium feature. Upgrade to download your meal plans and shopping lists.',
  },
  favorites_limit: {
    headline: 'Favorites limit reached',
    subtitle: "You've saved 10 favorites. Upgrade to Premium for unlimited favorites.",
  },
}

export function PaywallModal({ isOpen, onClose, trigger = 'meal_plan_limit', onSubscribe }: PaywallModalProps) {
  const { headline, subtitle } = triggerMessages[trigger]
  const [isPending, startTransition] = useTransition()
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Close on escape key and prevent body scroll
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Reset error when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setLoadingPlan(null)
    }
  }, [isOpen])

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    // Allow custom handler override
    if (onSubscribe) {
      onSubscribe(plan)
      return
    }

    // Use Stripe checkout
    setError(null)
    setLoadingPlan(plan)

    startTransition(async () => {
      const result = await createCheckoutSession(plan)

      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url
      } else {
        setError(result.error || 'Failed to start checkout')
        setLoadingPlan(null)
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="size-6" />
        </button>

        <div className="p-6 flex flex-col items-center text-center">
          {/* Icon & Header */}
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Lock className="size-8" />
          </div>

          <h2 id="paywall-title" className="text-2xl font-bold text-gray-900 mb-2">{headline}</h2>
          <p className="text-gray-600 mb-4">{subtitle}</p>

          {/* Error Message */}
          {error && (
            <div className="w-full bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="w-full h-px bg-gray-100 mb-6" />

          {/* Features */}
          <div className="w-full space-y-4 mb-8 text-left">
            <h3 className="font-bold text-gray-900 text-lg">What You Get with Premium:</h3>
            <ul className="space-y-3">
              {[
                'Unlimited meal plan generation',
                'Unlimited meal swaps',
                'Export plans as PDF',
                'Priority support'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="size-5 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full h-px bg-gray-100 mb-6" />

          {/* Plans */}
          <div className="w-full space-y-4 mb-8 text-left">
            <h3 className="font-bold text-gray-900 text-lg">Choose Your Plan:</h3>
            
            {/* Annual Plan */}
            <div className="relative w-full border-2 border-primary bg-primary/5 rounded-xl p-4">
              <div className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="size-3" />
                BEST VALUE
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-900 text-lg">Annual</span>
                <span className="font-bold text-gray-900 text-lg">$79.99/year</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Save 33% ($6.67/month)</p>
              <button
                onClick={() => handleSubscribe('annual')}
                disabled={isPending}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPlan === 'annual' ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Subscribe Annual
                    <ArrowRight className="size-5" />
                  </>
                )}
              </button>
            </div>

            {/* Monthly Plan */}
            <div className="w-full border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-900 text-lg">Monthly</span>
                <span className="font-bold text-gray-900 text-lg">$9.99/month</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Billed monthly</p>
              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={isPending}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPlan === 'monthly' ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Subscribe Monthly'
                )}
              </button>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="size-4" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="size-4" />
              <span>7-day money-back guarantee</span>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100 my-6" />

          <button 
            onClick={onClose}
            className="text-gray-500 font-bold hover:text-gray-900 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
