'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore, type DietaryStyle, type Allergy } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const {
    dietaryStyle,
    allergies,
    foodsToAvoid,
    setDietaryPreferences,
    markStepComplete,
    completedSteps,
  } = useOnboardingStore()

  const [localDietaryStyle, setLocalDietaryStyle] = useState<DietaryStyle | null>(
    dietaryStyle
  )
  const [localAllergies, setLocalAllergies] = useState<Allergy[]>(allergies || [])
  const [localFoodsToAvoid, setLocalFoodsToAvoid] = useState<string>(foodsToAvoid || '')

  const handleContinue = () => {
    // Save preferences to store
    setDietaryPreferences({
      dietaryStyle: localDietaryStyle ?? undefined,
      allergies: localAllergies.length > 0 ? localAllergies : undefined,
      foodsToAvoid: localFoodsToAvoid || undefined,
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

  return (
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
          <div className="flex flex-col gap-3">
            {DIETARY_STYLES.map((style) => (
              <Card
                key={style.id}
                className={cn(
                  'flex items-center gap-4 p-4 cursor-pointer transition-all',
                  'border-2',
                  localDietaryStyle === style.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => setLocalDietaryStyle(style.id)}
              >
                <span className="text-2xl">{style.emoji}</span>
                <p className="flex-1 text-base font-medium text-charcoal">
                  {style.label}
                </p>
                {localDietaryStyle === style.id && (
                  <div className="flex items-center justify-center size-6 rounded-full bg-primary text-white">
                    <Check className="size-4" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Common Allergies */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Common Allergies</Label>
          <div className="flex flex-col gap-2">
            {ALLERGIES.map((allergy) => (
              <div key={allergy.id} className="flex items-center gap-3 p-2">
                <Checkbox
                  id={allergy.id}
                  checked={localAllergies.includes(allergy.id)}
                  onCheckedChange={() => toggleAllergy(allergy.id)}
                />
                <label
                  htmlFor={allergy.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  {allergy.label}
                </label>
              </div>
            ))}
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
  )
}
