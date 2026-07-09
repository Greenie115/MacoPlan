'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore, type DietaryStyle, type Allergy } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { PageTransition } from '@/components/onboarding/page-transition'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Shared chip classes for the dietary-style and allergy toggle groups. */
function chipClass(isSelected: boolean) {
  return cn(
    'inline-flex h-11 items-center gap-1.5 rounded-full border-2 px-4 text-sm font-medium transition-all duration-[var(--duration-fast)] ease-out-quint',
    isSelected
      ? 'border-primary bg-primary/10 text-foreground'
      : 'border-border-strong text-foreground hover:border-primary/40'
  )
}

const DIETARY_STYLES = [
  { id: 'none' as DietaryStyle, emoji: '🍽️', label: 'None / Flexible' },
  { id: 'vegetarian' as DietaryStyle, emoji: '🥗', label: 'Vegetarian' },
  { id: 'vegan' as DietaryStyle, emoji: '🌱', label: 'Vegan' },
  { id: 'pescatarian' as DietaryStyle, emoji: '🐟', label: 'Pescatarian' },
  { id: 'paleo' as DietaryStyle, emoji: '🥩', label: 'Paleo' },
  { id: 'keto' as DietaryStyle, emoji: '🥑', label: 'Keto' },
  { id: 'mediterranean' as DietaryStyle, emoji: '🫒', label: 'Mediterranean' },
]

const ALLERGIES = [
  { id: 'none' as Allergy, label: 'None' },
  { id: 'peanuts' as Allergy, label: 'Peanuts' },
  { id: 'tree_nuts' as Allergy, label: 'Tree nuts' },
  { id: 'dairy' as Allergy, label: 'Dairy' },
  { id: 'eggs' as Allergy, label: 'Eggs' },
  { id: 'soy' as Allergy, label: 'Soy' },
  { id: 'gluten' as Allergy, label: 'Gluten' },
  { id: 'shellfish' as Allergy, label: 'Shellfish' },
  { id: 'fish' as Allergy, label: 'Fish' },
]

export default function DietaryPreferencesPage() {
  const router = useRouter()
  const store = useOnboardingStore()
  const {
    dietaryStyle,
    allergies,
    foodsToAvoid,
    setDietaryPreferences,
    markStepComplete,
    completedSteps,
  } = store
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    // Route guard: Must have goal, personal stats, and activity level
    if (!store.goal || !store.age || !store.weight || !store.heightFeet ||
        store.heightInches === null || !store.sex || !store.activityLevel) {
      router.replace('/onboarding/3')
      return
    }
    setIsValidating(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentional mount-only step guard

  const [localDietaryStyle, setLocalDietaryStyle] = useState<DietaryStyle | null>(
    dietaryStyle
  )
  const [localAllergies, setLocalAllergies] = useState<Allergy[]>(allergies || [])
  const [localFoodsToAvoid, setLocalFoodsToAvoid] = useState<string>(foodsToAvoid || '')

  const handleContinue = () => {
    // Sanitize foodsToAvoid - strip HTML tags and excessive whitespace
    const sanitizedFoodsToAvoid = localFoodsToAvoid
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')     // Collapse multiple spaces
      .trim()

    // Save preferences to store
    setDietaryPreferences({
      dietaryStyle: localDietaryStyle ?? undefined,
      allergies: localAllergies.length > 0 ? localAllergies : undefined,
      foodsToAvoid: sanitizedFoodsToAvoid || undefined,
    })

    markStepComplete(4)
    router.push('/onboarding/5')
  }

  const handleSkip = () => {
    // Clear any local state and skip
    setDietaryPreferences({
      dietaryStyle: undefined,
      allergies: undefined,
      foodsToAvoid: undefined,
    })
    markStepComplete(4)
    router.push('/onboarding/5')
  }

  const handleBack = () => {
    router.push('/onboarding/3')
  }

  const toggleAllergy = (allergyId: Allergy) => {
    // If selecting "none", clear all other allergies
    if (allergyId === 'none') {
      setLocalAllergies(['none'])
      return
    }

    // If selecting other allergies, remove "none" if present
    const filteredAllergies = localAllergies.filter((a) => a !== 'none')

    if (filteredAllergies.includes(allergyId)) {
      setLocalAllergies(filteredAllergies.filter((a) => a !== allergyId))
    } else {
      setLocalAllergies([...filteredAllergies, allergyId])
    }
  }

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <PageTransition step={4}>
      <StepContainer
        step={4}
        title="Dietary Preferences"
        emoji="🥗"
        subtitle="Help us personalize your meal plans (optional)"
        onBack={handleBack}
        onContinue={handleContinue}
        completedSteps={completedSteps}
      >
      <div className="space-y-6">
        {/* Dietary Style */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Dietary Style</Label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_STYLES.map((style) => {
              const isSelected = localDietaryStyle === style.id
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setLocalDietaryStyle(style.id)}
                  aria-pressed={isSelected}
                  className={chipClass(isSelected)}
                >
                  <span aria-hidden="true">{style.emoji}</span>
                  {style.label}
                  {isSelected && <Check className="size-3.5 text-primary" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Common Allergies */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Common Allergies</Label>
          <div className="flex flex-wrap gap-2">
            {ALLERGIES.map((allergy) => {
              const isSelected = localAllergies.includes(allergy.id)
              return (
                <button
                  key={allergy.id}
                  type="button"
                  onClick={() => toggleAllergy(allergy.id)}
                  aria-pressed={isSelected}
                  className={chipClass(isSelected)}
                >
                  {isSelected && <Check className="size-3.5 text-primary" aria-hidden="true" />}
                  {allergy.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Foods to Avoid */}
        <div className="space-y-2">
          <Label htmlFor="foodsToAvoid" className="text-base font-semibold">
            Other Foods to Avoid (optional)
          </Label>
          <Textarea
            id="foodsToAvoid"
            placeholder="e.g., mushrooms, cilantro, spicy foods..."
            value={localFoodsToAvoid}
            onChange={(e) => setLocalFoodsToAvoid(e.target.value)}
            maxLength={500}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {localFoodsToAvoid.length}/500 characters
          </p>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors underline"
        >
          Skip this step
        </button>
      </div>
    </StepContainer>
    </PageTransition>
  )
}
