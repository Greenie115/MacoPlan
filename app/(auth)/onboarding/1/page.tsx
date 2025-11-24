'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useOnboardingStore, type Goal } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { PageTransition } from '@/components/onboarding/page-transition'
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
    <PageTransition step={1}>
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
                  ? 'border-primary bg-primary text-white'
                  : 'border-border hover:border-primary/50'
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
              aria-pressed={goal === goalOption.id}
              aria-label={goalOption.label}
            >
              <span className="text-2xl">{goalOption.emoji}</span>
              <p className={cn(
                "flex-1 text-base font-medium",
                goal === goalOption.id ? "text-white" : "text-charcoal"
              )}>
                {goalOption.label}
              </p>
              {goal === goalOption.id && (
                <div className="flex items-center justify-center size-6 rounded-full bg-white text-primary">
                  <Check className="size-4" />
                </div>
              )}
            </Card>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-primary transition-colors">
            Already have an account? <span className="font-bold">Log in</span>
          </Link>
        </div>
      </StepContainer>
    </PageTransition>
  )
}
