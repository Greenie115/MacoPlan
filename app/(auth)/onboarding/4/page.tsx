'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'

export default function Step4Page() {
  const router = useRouter()
  const { markStepComplete, completedSteps } = useOnboardingStore()

  const handleContinue = () => {
    markStepComplete(4)
    router.push('/onboarding/5')
  }

  const handleBack = () => {
    router.push('/onboarding/3')
  }

  return (
    <StepContainer
      step={4}
      title="Step 4 - Coming Soon"
      subtitle="Additional preferences will be added here"
      onBack={handleBack}
      onContinue={handleContinue}
      completedSteps={completedSteps}
    >
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Dietary preferences and restrictions</p>
      </div>
    </StepContainer>
  )
}
