'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore, type ActivityLevel } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const ACTIVITY_LEVELS = [
  {
    id: 'sedentary' as ActivityLevel,
    emoji: '🛋️',
    label: 'Sedentary',
    description: 'Little to no exercise',
  },
  {
    id: 'lightly' as ActivityLevel,
    emoji: '🚶',
    label: 'Lightly Active',
    description: '1-3 days/week',
  },
  {
    id: 'moderately' as ActivityLevel,
    emoji: '🏃',
    label: 'Moderately Active',
    description: '3-5 days/week',
  },
  {
    id: 'very' as ActivityLevel,
    emoji: '🏋️',
    label: 'Very Active',
    description: '6-7 days/week',
  },
  {
    id: 'extremely' as ActivityLevel,
    emoji: '💪',
    label: 'Extremely Active',
    description: '2x per day + physical job',
  },
]

export default function ActivityLevelPage() {
  const router = useRouter()
  const { activityLevel, setActivityLevel, markStepComplete, completedSteps } = useOnboardingStore()

  const handleContinue = () => {
    if (activityLevel) {
      markStepComplete(3)
      router.push('/onboarding/4')
    }
  }

  const handleBack = () => {
    router.push('/onboarding/2')
  }

  return (
    <StepContainer
      step={3}
      title="How active are you?"
      subtitle="This helps us calculate your daily calorie needs."
      onBack={handleBack}
      onContinue={handleContinue}
      continueDisabled={!activityLevel}
      completedSteps={completedSteps}
    >
      <div className="flex flex-col gap-3">
        {ACTIVITY_LEVELS.map((level) => (
          <Card
            key={level.id}
            className={cn(
              'flex items-center gap-4 p-4 cursor-pointer transition-all',
              'border-2',
              activityLevel === level.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => setActivityLevel(level.id)}
          >
            <span className="text-3xl">{level.emoji}</span>
            <div className="flex-1">
              <p className="text-base font-medium text-charcoal">{level.label}</p>
              <p className="text-sm text-[#9e5e47]">{level.description}</p>
            </div>
            {activityLevel === level.id && (
              <div className="flex items-center justify-center size-5 rounded-full border-2 border-primary bg-primary">
                <div className="size-2 rounded-full bg-white" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </StepContainer>
  )
}
