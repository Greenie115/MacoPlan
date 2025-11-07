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
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4">
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
      <div className="flex-1 px-4 overflow-y-auto pb-24">
        <div className="mt-8">
          <h1 className="text-[32px] font-bold leading-tight text-charcoal">
            {emoji && <span className="mr-2">{emoji}</span>}
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-base text-[#9e5e47]">{subtitle}</p>
          )}
        </div>

        <div className="mt-8">{children}</div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 w-full p-4 bg-background border-t border-border">
        <Button
          onClick={onContinue}
          disabled={continueDisabled}
          className="w-full h-12 text-base font-bold"
          size="lg"
        >
          Continue <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}
