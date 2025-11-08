'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { Card } from '@/components/ui/card'
import { AuthModal } from '@/components/auth/auth-modal'

export default function MacroResultsPage() {
  const router = useRouter()
  const store = useOnboardingStore()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    // Calculate macros when component mounts
    store.calculateMacros()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = () => {
    store.markStepComplete(6)
    // Show auth modal instead of navigating directly
    setShowAuthModal(true)
  }

  const handleBack = () => {
    router.push('/onboarding/5')
  }

  if (!store.targetCalories) {
    return (
      <StepContainer
        step={6}
        title="Calculating..."
        onBack={handleBack}
        onContinue={handleComplete}
        continueDisabled={true}
        completedSteps={store.completedSteps}
      >
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Calculating your personalized macros...</p>
        </div>
      </StepContainer>
    )
  }

  return (
    <StepContainer
      step={6}
      title="Your Macro Targets"
      emoji="🎯"
      subtitle="Based on your goals and activity level"
      onBack={handleBack}
      onContinue={handleComplete}
      completedSteps={store.completedSteps}
    >
      <div className="space-y-4">
        {/* Daily Calorie Target */}
        <Card className="p-6 bg-primary/5 border-primary">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">Daily Calorie Target</p>
            <p className="text-4xl font-bold text-primary">{store.targetCalories}</p>
            <p className="text-sm text-muted-foreground mt-1">calories per day</p>
          </div>
        </Card>

        {/* Macro Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {/* Protein */}
          <Card className="p-4 text-center border-2 border-[#E63946]/20">
            <div className="size-12 mx-auto mb-2 rounded-full bg-[#E63946]/10 flex items-center justify-center">
              <span className="text-xl">🥩</span>
            </div>
            <p className="text-2xl font-bold text-[#E63946]">{store.proteinGrams}g</p>
            <p className="text-xs text-muted-foreground mt-1">Protein</p>
          </Card>

          {/* Carbs */}
          <Card className="p-4 text-center border-2 border-[#457B9D]/20">
            <div className="size-12 mx-auto mb-2 rounded-full bg-[#457B9D]/10 flex items-center justify-center">
              <span className="text-xl">🍞</span>
            </div>
            <p className="text-2xl font-bold text-[#457B9D]">{store.carbGrams}g</p>
            <p className="text-xs text-muted-foreground mt-1">Carbs</p>
          </Card>

          {/* Fat */}
          <Card className="p-4 text-center border-2 border-[#F4A261]/20">
            <div className="size-12 mx-auto mb-2 rounded-full bg-[#F4A261]/10 flex items-center justify-center">
              <span className="text-xl">🥑</span>
            </div>
            <p className="text-2xl font-bold text-[#F4A261]">{store.fatGrams}g</p>
            <p className="text-xs text-muted-foreground mt-1">Fat</p>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="p-4 bg-muted/50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">BMR (Basal Metabolic Rate)</span>
              <span className="font-medium">{store.bmr} cal/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TDEE (Total Daily Energy)</span>
              <span className="font-medium">{store.tdee} cal/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goal</span>
              <span className="font-medium capitalize">{store.goal?.replace('recomp', 'body recomp')}</span>
            </div>
          </div>
        </Card>

        <div className="pt-4">
          <p className="text-sm text-center text-muted-foreground">
            These targets are personalized based on your profile and will help you achieve your {store.goal} goals.
          </p>
        </div>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </StepContainer>
  )
}
