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
  continueLabel?: string
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
  continueLabel = 'Continue',
  children,
  completedSteps = [],
}: StepContainerProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Max-width wrapper for larger screens */}
      <div className="w-full max-w-[560px] mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center size-11 -ml-1.5 rounded-full text-icon transition-colors duration-[var(--duration-fast)] hover:bg-accent hover:text-foreground active:scale-95"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="size-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          totalSteps={6}
          currentStep={step}
          completedSteps={completedSteps}
        />

        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 overflow-y-auto pb-28">
          <div className="mt-6">
            <h1 className="text-2xl sm:text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground text-balance">
              {emoji && (
                <span className="mr-2" aria-hidden="true">
                  {emoji}
                </span>
              )}
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-base leading-relaxed text-muted-foreground text-pretty">
                {subtitle}
              </p>
            )}
          </div>

          <div className="mt-8">{children}</div>
        </div>

        {/* Bottom CTA - constrained within max-width */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] px-4 sm:px-6 lg:px-8 py-4 bg-background/95 backdrop-blur-sm border-t border-border-strong">
          <Button
            onClick={onContinue}
            disabled={continueDisabled}
            className="w-full h-12 text-base"
            size="lg"
            aria-label="Continue to next step"
          >
            {continueLabel} <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
