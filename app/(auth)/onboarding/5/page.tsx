'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'

export default function Step5Page() {
  const router = useRouter()
  const { markStepComplete, completedSteps } = useOnboardingStore()

  const handleContinue = () => {
    markStepComplete(5)
    router.push('/onboarding/6')
  }

  const handleBack = () => {
    router.push('/onboarding/4')
  }

  return (
    <StepContainer
      step={5}
      title="Step 5 - Coming Soon"
      subtitle="Experience level and preferences"
      onBack={handleBack}
      onContinue={handleContinue}
      completedSteps={completedSteps}
    >
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Fitness and tracking experience level</p>
      </div>
    </StepContainer>
  )
}
