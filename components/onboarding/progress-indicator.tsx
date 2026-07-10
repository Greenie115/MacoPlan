import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  totalSteps: number
  currentStep: number
  completedSteps?: number[]
}

export function ProgressIndicator({
  totalSteps,
  currentStep,
  completedSteps = [],
}: ProgressIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-5">
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep} of ${totalSteps}`}
        className="flex w-full flex-row items-center justify-center gap-2"
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = completedSteps.includes(stepNumber)

          return (
            <div
              key={stepNumber}
              className={cn(
                'h-1.5 rounded-full transition-all duration-[var(--duration-base)] ease-out-quint',
                isActive
                  ? 'w-6 bg-primary'
                  : isCompleted
                  ? 'w-1.5 bg-primary'
                  : 'w-1.5 bg-border-strong'
              )}
              aria-label={`Step ${stepNumber} of ${totalSteps}${isActive ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
            />
          )
        })}
      </div>
      <p className="text-xs font-medium text-muted-foreground tabular-nums font-mono">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  )
}
