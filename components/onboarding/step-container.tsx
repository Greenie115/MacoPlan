'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressIndicator } from './progress-indicator'

interface StepContainerProps {
  step: number
  title: string
  subtitle?: string
  emoji?: string
  onBack: () => void
  onContinue: () => void
  continueDisabled?: boolean
  children: React.ReactNode
  completedSteps?: number[]
}

export function StepContainer({
  step,
  title,
  subtitle,
  emoji,
  onBack,
  onContinue,
  continueDisabled = false,
  children,
  completedSteps = [],
}: StepContainerProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Max-width wrapper for larger screens */}
      <div className="w-full max-w-[560px] mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center size-10 rounded-full hover:bg-muted transition-colors"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="size-6 text-charcoal" />
          </button>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          totalSteps={6}
          currentStep={step}
          completedSteps={completedSteps}
        />

        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 overflow-y-auto pb-24">
          <div className="mt-8">
            <h1 className="text-[32px] font-bold leading-tight text-charcoal">
              {emoji && <span className="mr-2">{emoji}</span>}
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
            )}
          </div>

          <div className="mt-8">{children}</div>
        </div>

        {/* Bottom CTA - constrained within max-width */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] px-4 sm:px-6 lg:px-8 py-4 bg-background border-t border-border">
          <Button
            onClick={onContinue}
            disabled={continueDisabled}
            className="w-full h-12 text-base font-bold"
            size="lg"
            aria-label="Continue to next step"
          >
            Continue <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
