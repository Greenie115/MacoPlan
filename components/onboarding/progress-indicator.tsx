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
    <div className="flex w-full flex-row items-center justify-center gap-3 py-5">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = completedSteps.includes(stepNumber)

        return (
          <div
            key={stepNumber}
            className={cn(
              'h-2 w-2 rounded-full transition-all duration-200',
              isActive || isCompleted
                ? 'bg-primary'
                : 'bg-primary/20'
            )}
            aria-label={`Step ${stepNumber} of ${totalSteps}${isActive ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
          />
        )
      })}
    </div>
  )
}
