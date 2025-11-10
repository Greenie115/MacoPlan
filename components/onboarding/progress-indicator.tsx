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
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep} of ${totalSteps}`}
      className="flex w-full flex-row items-center justify-center gap-3 py-5"
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = completedSteps.includes(stepNumber)

        return (
          <div
            key={stepNumber}
            className={cn(
              'rounded-full transition-all duration-300',
              isActive
                ? 'h-3 w-3 bg-primary scale-125'
                : isCompleted
                ? 'h-2 w-2 bg-primary'
                : 'h-2 w-2 bg-primary/20'
            )}
            aria-label={`Step ${stepNumber} of ${totalSteps}${isActive ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
          />
        )
      })}
    </div>
  )
}
