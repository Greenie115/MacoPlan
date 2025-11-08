'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  useOnboardingStore,
  type ExperienceLevel,
  type TrackingExperience,
  type MealPrepLevel,
} from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const FITNESS_LEVELS = [
  {
    id: 'beginner' as ExperienceLevel,
    emoji: '🌱',
    label: 'Beginner',
    description: 'New to fitness and nutrition tracking',
  },
  {
    id: 'intermediate' as ExperienceLevel,
    emoji: '💪',
    label: 'Intermediate',
    description: 'I work out regularly and track occasionally',
  },
  {
    id: 'advanced' as ExperienceLevel,
    emoji: '🏆',
    label: 'Advanced',
    description: "I'm experienced with fitness and macro tracking",
  },
]

const TRACKING_LEVELS = [
  {
    id: 'never' as TrackingExperience,
    emoji: '❌',
    label: 'Never tracked',
    description: 'This is my first time tracking macros',
  },
  {
    id: 'some' as TrackingExperience,
    emoji: '📊',
    label: 'Some experience',
    description: "I've tracked before but need guidance",
  },
  {
    id: 'experienced' as TrackingExperience,
    emoji: '✅',
    label: 'Experienced',
    description: "I'm comfortable with macro tracking",
  },
]

const MEAL_PREP_LEVELS = [
  {
    id: 'beginner' as MealPrepLevel,
    emoji: '🍕',
    label: 'Beginner',
    description: 'I rarely cook or meal prep',
  },
  {
    id: 'intermediate' as MealPrepLevel,
    emoji: '🥘',
    label: 'Intermediate',
    description: 'I cook occasionally',
  },
  {
    id: 'advanced' as MealPrepLevel,
    emoji: '👨‍🍳',
    label: 'Advanced',
    description: 'I meal prep regularly',
  },
]

export default function ExperienceLevelPage() {
  const router = useRouter()
  const {
    fitnessExperience,
    trackingExperience,
    mealPrepSkills,
    setExperienceLevel,
    markStepComplete,
    completedSteps,
  } = useOnboardingStore()

  const [localFitnessExperience, setLocalFitnessExperience] =
    useState<ExperienceLevel | null>(fitnessExperience)
  const [localTrackingExperience, setLocalTrackingExperience] =
    useState<TrackingExperience | null>(trackingExperience)
  const [localMealPrepSkills, setLocalMealPrepSkills] = useState<MealPrepLevel | null>(
    mealPrepSkills
  )

  // Check if all required fields are filled
  const canContinue =
    localFitnessExperience !== null &&
    localTrackingExperience !== null &&
    localMealPrepSkills !== null

  const handleContinue = () => {
    if (!canContinue) return

    // Save to store
    setExperienceLevel({
      fitnessExperience: localFitnessExperience!,
      trackingExperience: localTrackingExperience!,
      mealPrepSkills: localMealPrepSkills!,
    })

    markStepComplete(5)
    router.push('/onboarding/6')
  }

  const handleBack = () => {
    router.push('/onboarding/4')
  }

  return (
    <StepContainer
      step={5}
      title="Experience Level"
      emoji="📊"
      subtitle="Help us tailor the app to your needs"
      onBack={handleBack}
      onContinue={handleContinue}
      continueDisabled={!canContinue}
      completedSteps={completedSteps}
    >
      <div className="space-y-6">
        {/* Fitness Experience */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Fitness Experience</Label>
          <div className="flex flex-col gap-3">
            {FITNESS_LEVELS.map((level) => (
              <Card
                key={level.id}
                className={cn(
                  'p-4 cursor-pointer transition-all',
                  'border-2',
                  localFitnessExperience === level.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => setLocalFitnessExperience(level.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{level.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal">{level.label}</p>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Macro Tracking Experience */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Macro Tracking Experience</Label>
          <div className="flex flex-col gap-3">
            {TRACKING_LEVELS.map((level) => (
              <Card
                key={level.id}
                className={cn(
                  'p-4 cursor-pointer transition-all',
                  'border-2',
                  localTrackingExperience === level.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => setLocalTrackingExperience(level.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{level.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal">{level.label}</p>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Meal Prep Skills */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Meal Prep Skills</Label>
          <div className="flex flex-col gap-3">
            {MEAL_PREP_LEVELS.map((level) => (
              <Card
                key={level.id}
                className={cn(
                  'p-4 cursor-pointer transition-all',
                  'border-2',
                  localMealPrepSkills === level.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => setLocalMealPrepSkills(level.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{level.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal">{level.label}</p>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </StepContainer>
  )
}
