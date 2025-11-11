'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { PageTransition } from '@/components/onboarding/page-transition'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth/auth-modal'
import { MacroCustomizer } from '@/components/onboarding/macro-customizer'

export default function MacroResultsPage() {
  const router = useRouter()
  const store = useOnboardingStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isCustomizing, setIsCustomizing] = useState(false)

  useEffect(() => {
    // Route guard: Must have all required data
    const hasRequiredData =
      store.goal &&
      store.age &&
      store.weight &&
      store.heightFeet !== null &&
      store.heightInches !== null &&
      store.sex &&
      store.activityLevel

    if (!hasRequiredData) {
      // Redirect to first incomplete step
      const firstIncompleteStep = store.completedSteps.length > 0
        ? Math.max(...store.completedSteps) + 1
        : 1
      router.replace(`/onboarding/${Math.min(firstIncompleteStep, 5)}`)
      return
    }

    setIsValidating(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = () => {
    store.markStepComplete(6)
    // Show auth modal instead of navigating directly
    setShowAuthModal(true)
  }

  const handleBack = () => {
    router.push('/onboarding/5')
  }

  const handleCustomizeClick = () => {
    setIsCustomizing(true)
  }

  const handleSaveCustom = (macros: { protein: number; carbs: number; fat: number }) => {
    store.setCustomMacros(macros)
    setIsCustomizing(false)
  }

  const handleResetToCalculated = () => {
    store.resetToCalculated()
    setIsCustomizing(false)
  }

  const handleCancelCustomization = () => {
    setIsCustomizing(false)
  }

  // Get displayed macros (custom or calculated)
  const displayProtein = store.isCustomMacros && store.customProteinGrams
    ? store.customProteinGrams
    : store.proteinGrams || 0

  const displayCarbs = store.isCustomMacros && store.customCarbGrams
    ? store.customCarbGrams
    : store.carbGrams || 0

  const displayFat = store.isCustomMacros && store.customFatGrams
    ? store.customFatGrams
    : store.fatGrams || 0

  // Weight in kg for minimum calculations
  const weightKg = store.weightUnit === 'kg'
    ? store.weight || 0
    : (store.weight || 0) * 0.453592

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Display error if calculation failed
  if (store.calculationError) {
    return (
      <PageTransition step={6}>
        <StepContainer
          step={6}
          title="Calculation Error"
          emoji="⚠️"
          onBack={handleBack}
          onContinue={() => {
            store.clearError()
            router.push('/onboarding/1')
          }}
          completedSteps={store.completedSteps}
        >
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-medium">
              {store.calculationError}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Please go back and verify all your information is correct.
          </p>
        </div>
      </StepContainer>
      </PageTransition>
    )
  }

  if (!store.targetCalories) {
    return (
      <PageTransition step={6}>
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
      </PageTransition>
    )
  }

  return (
    <PageTransition step={6}>
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
        {!isCustomizing ? (
          <>
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
              <Card className="p-4 text-center border-2 border-protein/20">
                <div className="size-12 mx-auto mb-2 rounded-full bg-protein/10 flex items-center justify-center">
                  <span className="text-xl">🥩</span>
                </div>
                <p className="text-2xl font-bold text-protein">{displayProtein}g</p>
                <p className="text-xs text-muted-foreground mt-1">Protein</p>
                {store.isCustomMacros && (
                  <p className="text-xs text-primary mt-1 font-medium">Custom</p>
                )}
              </Card>

              {/* Carbs */}
              <Card className="p-4 text-center border-2 border-carb/20">
                <div className="size-12 mx-auto mb-2 rounded-full bg-carb/10 flex items-center justify-center">
                  <span className="text-xl">🍞</span>
                </div>
                <p className="text-2xl font-bold text-carb">{displayCarbs}g</p>
                <p className="text-xs text-muted-foreground mt-1">Carbs</p>
                {store.isCustomMacros && (
                  <p className="text-xs text-primary mt-1 font-medium">Custom</p>
                )}
              </Card>

              {/* Fat */}
              <Card className="p-4 text-center border-2 border-fat/20">
                <div className="size-12 mx-auto mb-2 rounded-full bg-fat/10 flex items-center justify-center">
                  <span className="text-xl">🥑</span>
                </div>
                <p className="text-2xl font-bold text-fat">{displayFat}g</p>
                <p className="text-xs text-muted-foreground mt-1">Fat</p>
                {store.isCustomMacros && (
                  <p className="text-xs text-primary mt-1 font-medium">Custom</p>
                )}
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

            <div className="pt-4 space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                These targets are personalized based on your profile and will help you achieve your {store.goal} goals.
              </p>

              {/* Customize Button */}
              <Button
                variant="outline"
                onClick={handleCustomizeClick}
                className="w-full"
              >
                {store.isCustomMacros ? 'Edit Custom Macros' : 'Customize Macros'}
              </Button>
            </div>
          </>
        ) : (
          <MacroCustomizer
            targetCalories={store.targetCalories}
            calculatedProtein={store.proteinGrams || 0}
            calculatedCarbs={store.carbGrams || 0}
            calculatedFat={store.fatGrams || 0}
            currentProtein={displayProtein}
            currentCarbs={displayCarbs}
            currentFat={displayFat}
            isCustom={store.isCustomMacros}
            weightKg={weightKg}
            onSave={handleSaveCustom}
            onReset={handleResetToCalculated}
            onCancel={handleCancelCustomization}
          />
        )}
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </StepContainer>
    </PageTransition>
  )
}
