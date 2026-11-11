'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore, type Goal } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { PageTransition } from '@/components/onboarding/page-transition'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const GOALS = [
  { id: 'cut' as Goal, label: 'Lose Fat (Cut)' },
  { id: 'bulk' as Goal, label: 'Build Muscle (Bulk)' },
  { id: 'maintain' as Goal, label: 'Maintain Weight' },
  { id: 'recomp' as Goal, label: 'Body Recomposition' },
]

export default function GoalSelectionPage() {
  const router = useRouter()
  const { goal, setGoal, markStepComplete, completedSteps } = useOnboardingStore()

  const handleContinue = () => {
    if (goal) {
      markStepComplete(1)
      router.push('/onboarding/2')
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <PageTransition step={1}>
      <StepContainer
        step={1}
        title="Hey there!"
        subtitle="What's your main goal?"
        onBack={handleBack}
        onContinue={handleContinue}
        continueDisabled={!goal}
        completedSteps={completedSteps}
      >
        <div className="flex flex-col gap-3">
          {GOALS.map((goalOption) => {
            const isSelected = goal === goalOption.id
            return (
              <Card
                key={goalOption.id}
                className={cn(
                  'flex items-center gap-4 p-4 cursor-pointer border-2 transition-all duration-fast ease-out-quint',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border-strong hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'
                )}
                onClick={() => setGoal(goalOption.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setGoal(goalOption.id)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={goalOption.label}
              >
                <p className="flex-1 text-base font-medium text-foreground">
                  {goalOption.label}
                </p>
                {isSelected && (
                  <div className="flex items-center justify-center size-6 rounded-full bg-coral-600 text-primary-foreground shrink-0">
                    <Check className="size-4" />
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </StepContainer>
    </PageTransition>
  )
}
