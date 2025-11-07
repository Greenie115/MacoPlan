'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore, type Goal } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const GOALS = [
  { id: 'cut' as Goal, emoji: '🔥', label: 'Lose Fat (Cut)' },
  { id: 'bulk' as Goal, emoji: '💪', label: 'Build Muscle (Bulk)' },
  { id: 'maintain' as Goal, emoji: '⚖️', label: 'Maintain Weight' },
  { id: 'recomp' as Goal, emoji: '🎯', label: 'Body Recomposition' },
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
    <StepContainer
      step={1}
      title="Hey there!"
      emoji="👋"
      subtitle="What's your main goal?"
      onBack={handleBack}
      onContinue={handleContinue}
      continueDisabled={!goal}
      completedSteps={completedSteps}
    >
      <div className="flex flex-col gap-3">
        {GOALS.map((goalOption) => (
          <Card
            key={goalOption.id}
            className={cn(
              'flex items-center gap-4 p-4 cursor-pointer transition-all',
              'border-2',
              goal === goalOption.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => setGoal(goalOption.id)}
          >
            <span className="text-2xl">{goalOption.emoji}</span>
            <p className="flex-1 text-base font-medium text-charcoal">
              {goalOption.label}
            </p>
            {goal === goalOption.id && (
              <div className="flex items-center justify-center size-6 rounded-full bg-primary text-white">
                <Check className="size-4" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </StepContainer>
  )
}
