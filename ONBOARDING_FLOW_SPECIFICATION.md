# MacroPlan Onboarding Flow - Technical Specification

## Executive Summary

This document provides a comprehensive technical specification for implementing the MacroPlan onboarding flow. The onboarding flow collects user fitness goals and personal statistics to calculate personalized macro targets.

**Goal**: Create a seamless 6-step onboarding experience that captures user data, calculates macronutrient targets, and transitions users into the application.

---

## 1. Overall Architecture

### 1.1 Multi-Step Form Pattern

**Approach**: Progressive Multi-Page Form with URL-based state

- **Pattern**: Each step is a separate route under `/onboarding/[step]`
- **Progress Tracking**: 6 steps total (visible as dot indicators)
- **Navigation**: Linear progression with back button support
- **State Persistence**: Combination of URL params, localStorage, and database

**Rationale**:
- URL-based routing provides shareable links and browser history support
- Allows users to bookmark specific steps
- Enables deep linking for returning users
- Better for analytics tracking

### 1.2 State Management Strategy

**Hybrid Approach**:

1. **Local State (React Hook Form)**: Form inputs within current step
2. **Persistent State (Zustand + localStorage)**: Cross-step data
3. **Server State (Supabase)**: Authenticated user data

```typescript
// stores/onboarding-store.ts
interface OnboardingState {
  // Step 1: Goal Selection
  goal: 'cut' | 'bulk' | 'maintain' | 'recomp' | null

  // Step 2: Personal Stats
  age: number | null
  weight: number | null
  weightUnit: 'lbs' | 'kg'
  heightFeet: number | null
  heightInches: number | null
  sex: 'male' | 'female' | null

  // Step 3: Activity Level
  activityLevel: 'sedentary' | 'lightly' | 'moderately' | 'very' | 'extremely' | null

  // Step 4-5: Additional preferences (to be defined)

  // Step 6: Calculated Results
  bmr: number | null
  tdee: number | null
  targetCalories: number | null
  proteinGrams: number | null
  carbGrams: number | null
  fatGrams: number | null

  // Meta
  currentStep: number
  completedSteps: number[]

  // Actions
  setGoal: (goal: OnboardingState['goal']) => void
  setPersonalStats: (stats: PersonalStats) => void
  setActivityLevel: (level: OnboardingState['activityLevel']) => void
  calculateMacros: () => void
  resetOnboarding: () => void
  markStepComplete: (step: number) => void
}
```

**Persistence Strategy**:
- **localStorage**: Store onboarding state for guest users
- **Supabase**: Sync to `user_profiles` table for authenticated users
- **Hydration**: On mount, check both localStorage and Supabase

### 1.3 Progress Tracking

**Visual Progress Indicators**:
- 6 dots at top of each screen
- Current step: Solid orange (#FF6B35)
- Completed steps: Solid orange
- Upcoming steps: 20% opacity orange

**Implementation**:
```typescript
// components/onboarding/progress-indicator.tsx
interface ProgressIndicatorProps {
  totalSteps: number
  currentStep: number
  completedSteps: number[]
}
```

### 1.4 Back Button Navigation

**Behavior**:
- Back arrow in top-left allows return to previous step
- Data is preserved when navigating backward
- URL updates to reflect current step
- Browser back button also works

**Implementation**:
```typescript
const handleBack = () => {
  if (currentStep > 1) {
    router.push(`/onboarding/${currentStep - 1}`)
  } else {
    router.push('/') // Return to landing page
  }
}
```

---

## 2. Component Structure

### 2.1 File Structure

```
app/
├── (auth)/
│   └── onboarding/
│       ├── layout.tsx              # Shared layout with progress indicator
│       ├── page.tsx                # Redirect to step 1
│       ├── [step]/
│       │   └── page.tsx            # Dynamic step router
│       ├── 1/
│       │   └── page.tsx            # Goal Selection
│       ├── 2/
│       │   └── page.tsx            # Personal Stats
│       ├── 3/
│       │   └── page.tsx            # Activity Level
│       ├── 4/
│       │   └── page.tsx            # TBD
│       ├── 5/
│       │   └── page.tsx            # TBD
│       └── 6/
│           └── page.tsx            # Macro Results
│
components/
├── onboarding/
│   ├── progress-indicator.tsx      # Step progress dots
│   ├── onboarding-layout.tsx       # Wrapper with back button
│   ├── step-container.tsx          # Standard padding/spacing
│   ├── goal-card.tsx               # Radio card for goal selection
│   ├── activity-card.tsx           # Radio card for activity level
│   └── macro-results-card.tsx      # Display calculated macros
│
├── ui/                             # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── radio-group.tsx
│   ├── select.tsx
│   ├── card.tsx
│   └── label.tsx
│
lib/
├── calculations/
│   ├── bmr.ts                      # Basal Metabolic Rate calculations
│   ├── tdee.ts                     # Total Daily Energy Expenditure
│   └── macros.ts                   # Macro distribution logic
│
stores/
└── onboarding-store.ts             # Zustand store
```

### 2.2 Shared Components

#### OnboardingLayout
```typescript
// app/(auth)/onboarding/layout.tsx
interface OnboardingLayoutProps {
  children: React.ReactNode
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {children}
    </div>
  )
}
```

#### StepContainer
```typescript
// components/onboarding/step-container.tsx
interface StepContainerProps {
  step: number
  title: string
  subtitle?: string
  emoji?: string
  onBack: () => void
  onContinue: () => void
  continueDisabled?: boolean
  children: React.ReactNode
}

export function StepContainer({
  step,
  title,
  subtitle,
  emoji,
  onBack,
  onContinue,
  continueDisabled,
  children
}: StepContainerProps) {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onBack} className="flex items-center justify-center size-10">
          <ArrowLeft className="size-6" />
        </button>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator totalSteps={6} currentStep={step} />

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto">
        <div className="mt-8">
          <h1 className="text-[32px] font-bold leading-tight text-charcoal">
            {emoji && <span className="mr-2">{emoji}</span>}
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-base text-[#9e5e47]">{subtitle}</p>
          )}
        </div>

        <div className="mt-8">
          {children}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 w-full p-4 bg-background">
        <Button
          onClick={onContinue}
          disabled={continueDisabled}
          className="w-full h-12"
          size="lg"
        >
          Continue <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}
```

### 2.3 Individual Step Components

#### Step 1: Goal Selection
```typescript
// app/(auth)/onboarding/1/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { GoalCard } from '@/components/onboarding/goal-card'

const GOALS = [
  { id: 'cut', emoji: '🔥', label: 'Lose Fat (Cut)' },
  { id: 'bulk', emoji: '💪', label: 'Build Muscle (Bulk)' },
  { id: 'maintain', emoji: '⚖️', label: 'Maintain Weight' },
  { id: 'recomp', emoji: '🎯', label: 'Body Recomposition' }
] as const

export default function GoalSelectionPage() {
  const router = useRouter()
  const { goal, setGoal, markStepComplete } = useOnboardingStore()

  const handleContinue = () => {
    if (goal) {
      markStepComplete(1)
      router.push('/onboarding/2')
    }
  }

  return (
    <StepContainer
      step={1}
      title="Hey there!"
      emoji="👋"
      subtitle="What's your main goal?"
      onBack={() => router.push('/')}
      onContinue={handleContinue}
      continueDisabled={!goal}
    >
      <div className="flex flex-col gap-3">
        {GOALS.map((goalOption) => (
          <GoalCard
            key={goalOption.id}
            emoji={goalOption.emoji}
            label={goalOption.label}
            selected={goal === goalOption.id}
            onClick={() => setGoal(goalOption.id)}
          />
        ))}
      </div>
    </StepContainer>
  )
}
```

#### Step 2: Personal Stats
```typescript
// app/(auth)/onboarding/2/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'

const personalStatsSchema = z.object({
  age: z.number().min(13).max(120),
  weight: z.number().min(50).max(500),
  weightUnit: z.enum(['lbs', 'kg']),
  heightFeet: z.number().min(3).max(8),
  heightInches: z.number().min(0).max(11),
  sex: z.enum(['male', 'female'])
})

type PersonalStatsForm = z.infer<typeof personalStatsSchema>

export default function PersonalStatsPage() {
  const router = useRouter()
  const {
    age,
    weight,
    weightUnit,
    heightFeet,
    heightInches,
    sex,
    setPersonalStats,
    markStepComplete
  } = useOnboardingStore()

  const form = useForm<PersonalStatsForm>({
    resolver: zodResolver(personalStatsSchema),
    defaultValues: {
      age: age || 25,
      weight: weight || 180,
      weightUnit: weightUnit || 'lbs',
      heightFeet: heightFeet || 5,
      heightInches: heightInches || 10,
      sex: sex || 'male'
    }
  })

  const handleContinue = () => {
    const isValid = form.trigger()
    if (isValid) {
      setPersonalStats(form.getValues())
      markStepComplete(2)
      router.push('/onboarding/3')
    }
  }

  return (
    <StepContainer
      step={2}
      title="Tell us about yourself"
      onBack={() => router.push('/onboarding/1')}
      onContinue={handleContinue}
    >
      <Form {...form}>
        <div className="flex flex-col gap-4">
          {/* Age Input */}
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <div className="relative">
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    className="pr-20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a15d45]">
                    years
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Weight Input */}
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight</FormLabel>
                <div className="relative flex items-center">
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    className="pr-24"
                  />
                  <Select
                    value={form.watch('weightUnit')}
                    onValueChange={(value) => form.setValue('weightUnit', value as 'lbs' | 'kg')}
                  >
                    <SelectTrigger className="absolute right-0 w-20 border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Height Input */}
          <FormItem>
            <FormLabel>Height</FormLabel>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="heightFeet"
                render={({ field }) => (
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a15d45]">
                      ft
                    </span>
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="heightInches"
                render={({ field }) => (
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a15d45]">
                      in
                    </span>
                  </div>
                )}
              />
            </div>
          </FormItem>

          {/* Sex Toggle */}
          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sex</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={field.value === 'male' ? 'default' : 'outline'}
                    onClick={() => field.onChange('male')}
                    className="h-14"
                  >
                    Male
                    {field.value === 'male' && <Check className="ml-2 size-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === 'female' ? 'default' : 'outline'}
                    onClick={() => field.onChange('female')}
                    className="h-14"
                  >
                    Female
                    {field.value === 'female' && <Check className="ml-2 size-4" />}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </StepContainer>
  )
}
```

#### Step 3: Activity Level
```typescript
// app/(auth)/onboarding/3/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { ActivityCard } from '@/components/onboarding/activity-card'

const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    emoji: '🛋️',
    label: 'Sedentary',
    description: 'Little to no exercise',
    multiplier: 1.2
  },
  {
    id: 'lightly',
    emoji: '🚶',
    label: 'Lightly Active',
    description: '1-3 days/week',
    multiplier: 1.375
  },
  {
    id: 'moderately',
    emoji: '🏃',
    label: 'Moderately Active',
    description: '3-5 days/week',
    multiplier: 1.55
  },
  {
    id: 'very',
    emoji: '🏋️',
    label: 'Very Active',
    description: '6-7 days/week',
    multiplier: 1.725
  },
  {
    id: 'extremely',
    emoji: '💪',
    label: 'Extremely Active',
    description: '2x per day + physical job',
    multiplier: 1.9
  }
] as const

export default function ActivityLevelPage() {
  const router = useRouter()
  const { activityLevel, setActivityLevel, markStepComplete } = useOnboardingStore()

  const handleContinue = () => {
    if (activityLevel) {
      markStepComplete(3)
      router.push('/onboarding/4')
    }
  }

  return (
    <StepContainer
      step={3}
      title="How active are you?"
      subtitle="This helps us calculate your daily calorie needs."
      onBack={() => router.push('/onboarding/2')}
      onContinue={handleContinue}
      continueDisabled={!activityLevel}
    >
      <div className="flex flex-col gap-3">
        {ACTIVITY_LEVELS.map((level) => (
          <ActivityCard
            key={level.id}
            emoji={level.emoji}
            label={level.label}
            description={level.description}
            selected={activityLevel === level.id}
            onClick={() => setActivityLevel(level.id)}
          />
        ))}
      </div>
    </StepContainer>
  )
}
```

---

## 3. Data Flow & Validation

### 3.1 Form State Management

**Pattern**: React Hook Form + Zod for each step

**Benefits**:
- Type-safe validation
- Automatic error handling
- Performance optimization (fewer re-renders)
- Easy integration with shadcn/ui form components

### 3.2 Validation Schemas

```typescript
// lib/validations/onboarding.ts
import { z } from 'zod'

export const goalSchema = z.object({
  goal: z.enum(['cut', 'bulk', 'maintain', 'recomp'])
})

export const personalStatsSchema = z.object({
  age: z.number()
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Please enter a valid age'),
  weight: z.number()
    .min(50, 'Please enter a valid weight')
    .max(500, 'Please enter a valid weight'),
  weightUnit: z.enum(['lbs', 'kg']),
  heightFeet: z.number()
    .min(3, 'Please enter a valid height')
    .max(8, 'Please enter a valid height'),
  heightInches: z.number()
    .min(0, 'Inches must be between 0-11')
    .max(11, 'Inches must be between 0-11'),
  sex: z.enum(['male', 'female'])
})

export const activityLevelSchema = z.object({
  activityLevel: z.enum(['sedentary', 'lightly', 'moderately', 'very', 'extremely'])
})

// Combined schema for final submission
export const completeOnboardingSchema = goalSchema
  .merge(personalStatsSchema)
  .merge(activityLevelSchema)
```

### 3.3 Macro Calculation Logic

```typescript
// lib/calculations/bmr.ts

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * More accurate than Harris-Benedict for modern populations
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  sex: 'male' | 'female',
  unit: 'metric' | 'imperial'
): number {
  let weightKg: number
  let heightCm: number

  if (unit === 'imperial') {
    weightKg = weight * 0.453592 // lbs to kg
    heightCm = height * 2.54 // inches to cm
  } else {
    weightKg = weight
    heightCm = height
  }

  // Mifflin-St Jeor Equation
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age

  // Sex adjustment
  return sex === 'male' ? baseBMR + 5 : baseBMR - 161
}
```

```typescript
// lib/calculations/tdee.ts

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly: 1.375,
  moderately: 1.55,
  very: 1.725,
  extremely: 1.9
} as const

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}
```

```typescript
// lib/calculations/macros.ts

export type Goal = 'cut' | 'bulk' | 'maintain' | 'recomp'

interface MacroCalculation {
  targetCalories: number
  protein: number
  carbs: number
  fat: number
}

/**
 * Calculate target calories based on goal
 */
function calculateTargetCalories(tdee: number, goal: Goal): number {
  switch (goal) {
    case 'cut':
      return Math.round(tdee * 0.8) // 20% deficit
    case 'bulk':
      return Math.round(tdee * 1.1) // 10% surplus
    case 'maintain':
      return tdee
    case 'recomp':
      return tdee // Maintenance with specific macro ratios
  }
}

/**
 * Calculate macronutrient distribution
 */
export function calculateMacros(
  tdee: number,
  goal: Goal,
  weight: number,
  weightUnit: 'lbs' | 'kg'
): MacroCalculation {
  const weightKg = weightUnit === 'lbs' ? weight * 0.453592 : weight
  const targetCalories = calculateTargetCalories(tdee, goal)

  // Protein: 0.8-1g per lb bodyweight (higher for cutting)
  const proteinMultiplier = goal === 'cut' ? 1.0 : 0.8
  const proteinGrams = Math.round(weight * proteinMultiplier)
  const proteinCalories = proteinGrams * 4

  // Fat: 25-30% of total calories
  const fatPercentage = goal === 'bulk' ? 0.25 : 0.3
  const fatCalories = Math.round(targetCalories * fatPercentage)
  const fatGrams = Math.round(fatCalories / 9)

  // Carbs: Remaining calories
  const carbCalories = targetCalories - proteinCalories - fatCalories
  const carbGrams = Math.round(carbCalories / 4)

  return {
    targetCalories,
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams
  }
}
```

---

## 4. Authentication Integration

### 4.1 Authentication Flow Decision

**Recommended Approach**: Guest Onboarding → Auth Prompt → Account Creation

**Flow**:
1. User completes onboarding steps 1-3 (or all 6)
2. Onboarding data stored in localStorage
3. After viewing macro results (step 6), show auth modal
4. Options:
   - Sign up with Google (OAuth)
   - Sign up with Email/Password
   - Continue as Guest (limited features)
5. After auth, migrate localStorage data to Supabase

**Rationale**:
- Reduces friction in onboarding
- Users see value before creating account
- Higher conversion rate
- Data is preserved regardless of auth choice

### 4.2 Authentication Modal

```typescript
// components/auth/auth-modal.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  allowGuestMode?: boolean
}

export function AuthModal({
  open,
  onClose,
  onSuccess,
  allowGuestMode = true
}: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('OAuth error:', error)
    }
    setIsLoading(false)
  }

  const handleEmailSignUp = async () => {
    if (!agreedToTerms) {
      alert('Please agree to Terms & Privacy')
      return
    }

    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('Sign up error:', error)
    } else {
      onSuccess()
    }
    setIsLoading(false)
  }

  const handleGuestMode = () => {
    onClose()
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to MacroPlan</h2>
          <p className="text-muted-foreground mb-6">Create your free account</p>

          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              {/* Google icon SVG */}
            </svg>
            Sign up with Google
          </Button>

          <div className="relative w-full my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />

          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm">
              I agree to{' '}
              <a href="/terms" className="text-primary hover:underline">
                Terms & Privacy
              </a>
            </label>
          </div>

          <Button
            className="w-full mb-4"
            onClick={handleEmailSignUp}
            disabled={!email || !password || !agreedToTerms || isLoading}
          >
            Create Account →
          </Button>

          <p className="text-sm text-muted-foreground mb-2">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Login
            </a>
          </p>

          {allowGuestMode && (
            <Button
              variant="ghost"
              onClick={handleGuestMode}
              className="text-sm"
            >
              Skip - Continue as Guest
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### 4.3 Data Migration Strategy

```typescript
// lib/utils/migrate-onboarding-data.ts
import { createClient } from '@/lib/supabase/client'
import { OnboardingState } from '@/stores/onboarding-store'

export async function migrateOnboardingDataToProfile(
  userId: string,
  onboardingData: OnboardingState
) {
  const supabase = createClient()

  // Calculate height in cm
  const totalInches = (onboardingData.heightFeet || 0) * 12 + (onboardingData.heightInches || 0)
  const heightCm = Math.round(totalInches * 2.54)

  // Convert weight to kg if needed
  const weightKg = onboardingData.weightUnit === 'lbs'
    ? Math.round((onboardingData.weight || 0) * 0.453592)
    : onboardingData.weight

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      goal: onboardingData.goal,
      age: onboardingData.age,
      weight_kg: weightKg,
      height_cm: heightCm,
      sex: onboardingData.sex,
      activity_level: onboardingData.activityLevel,
      bmr: onboardingData.bmr,
      tdee: onboardingData.tdee,
      target_calories: onboardingData.targetCalories,
      protein_grams: onboardingData.proteinGrams,
      carb_grams: onboardingData.carbGrams,
      fat_grams: onboardingData.fatGrams,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error migrating onboarding data:', error)
    throw error
  }

  // Clear localStorage after successful migration
  localStorage.removeItem('onboarding-storage')
}
```

---

## 5. Database Schema

### 5.1 User Profiles Table

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Onboarding Data
  goal TEXT CHECK (goal IN ('cut', 'bulk', 'maintain', 'recomp')),
  age INTEGER,
  weight_kg DECIMAL(5, 2),
  height_cm INTEGER,
  sex TEXT CHECK (sex IN ('male', 'female')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly', 'moderately', 'very', 'extremely')),

  -- Calculated Metrics
  bmr INTEGER,
  tdee INTEGER,
  target_calories INTEGER,
  protein_grams INTEGER,
  carb_grams INTEGER,
  fat_grams INTEGER,

  -- Metadata
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 Guest Users Handling

For guest users:
- Store onboarding data in localStorage only
- No database record created
- Limited app functionality (no saved meal plans, etc.)
- Prompt to create account for full features
- Data persists in localStorage for 30 days

---

## 6. Routing Strategy

### 6.1 URL Structure

```
/onboarding          → Redirect to /onboarding/1
/onboarding/1        → Goal Selection
/onboarding/2        → Personal Stats
/onboarding/3        → Activity Level
/onboarding/4        → TBD (Dietary Preferences?)
/onboarding/5        → TBD (Experience Level?)
/onboarding/6        → Macro Results

After completion:
/dashboard           → Main app dashboard
```

### 6.2 Route Protection

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: '', ...options })
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Allow onboarding pages for everyone
  if (request.nextUrl.pathname.startsWith('/onboarding')) {
    return NextResponse.next()
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      // Check if guest mode enabled in localStorage via cookie
      const guestMode = request.cookies.get('guest_mode')?.value === 'true'

      if (!guestMode) {
        return NextResponse.redirect(new URL('/onboarding/1', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/onboarding/:path*',
    '/dashboard/:path*'
  ]
}
```

### 6.3 Redirect Logic

```typescript
// app/(auth)/onboarding/6/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { createClient } from '@/lib/supabase/client'
import { migrateOnboardingDataToProfile } from '@/lib/utils/migrate-onboarding-data'

export default function MacroResultsPage() {
  const router = useRouter()
  const onboardingData = useOnboardingStore()
  const supabase = createClient()

  useEffect(() => {
    // Calculate macros when component mounts
    onboardingData.calculateMacros()
  }, [])

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Authenticated user - migrate data to database
      await migrateOnboardingDataToProfile(user.id, onboardingData)
      router.push('/dashboard')
    } else {
      // Guest user - set cookie and redirect
      document.cookie = 'guest_mode=true; path=/; max-age=2592000' // 30 days
      router.push('/dashboard')
    }
  }

  return (
    <StepContainer
      step={6}
      title="Your Macro Targets"
      subtitle="Based on your goals and activity level"
      onBack={() => router.push('/onboarding/5')}
      onContinue={handleComplete}
    >
      {/* Display calculated macros */}
      <MacroResultsCard
        calories={onboardingData.targetCalories}
        protein={onboardingData.proteinGrams}
        carbs={onboardingData.carbGrams}
        fat={onboardingData.fatGrams}
      />
    </StepContainer>
  )
}
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal**: Set up core infrastructure

**Tasks**:
1. Install required shadcn/ui components
   ```bash
   npx shadcn@latest add button input label card radio-group select checkbox dialog form
   ```

2. Create Zustand onboarding store
   - Define state interface
   - Implement actions
   - Add localStorage persistence
   - Add hydration logic

3. Create shared layout components
   - OnboardingLayout
   - StepContainer
   - ProgressIndicator

4. Set up routing structure
   - Create `/onboarding/[step]` directories
   - Add middleware for route protection

**Deliverables**:
- ✅ Zustand store with persistence
- ✅ Shared layout components
- ✅ Route structure in place
- ✅ Basic styling with Tailwind

---

### Phase 2: Onboarding Steps 1-3 (Week 1-2)

**Goal**: Implement core onboarding flow

**Tasks**:
1. **Step 1: Goal Selection**
   - Create GoalCard component
   - Implement selection logic
   - Add validation
   - Connect to store

2. **Step 2: Personal Stats**
   - Set up React Hook Form
   - Create Zod validation schema
   - Build form UI with custom inputs
   - Implement unit conversion (lbs/kg, ft/in)

3. **Step 3: Activity Level**
   - Create ActivityCard component
   - Implement selection logic
   - Add descriptions and multipliers

**Deliverables**:
- ✅ Functional steps 1-3
- ✅ Form validation working
- ✅ Data persisting to store
- ✅ Navigation between steps

---

### Phase 3: Macro Calculations (Week 2)

**Goal**: Implement calculation logic

**Tasks**:
1. Create calculation utilities
   - BMR calculation (Mifflin-St Jeor)
   - TDEE calculation
   - Macro distribution logic

2. Add unit tests for calculations
   ```typescript
   // __tests__/calculations.test.ts
   describe('BMR Calculations', () => {
     it('should calculate BMR correctly for male', () => {
       const bmr = calculateBMR(180, 70, 30, 'male', 'imperial')
       expect(bmr).toBeCloseTo(1850, 0)
     })
   })
   ```

3. Integrate calculations into store
   - Add `calculateMacros` action
   - Update state with results

**Deliverables**:
- ✅ Calculation utilities with tests
- ✅ Calculations integrated into flow
- ✅ Results displayed correctly

---

### Phase 4: Results Display (Week 2)

**Goal**: Create macro results screen

**Tasks**:
1. Design MacroResultsCard component
   - Calorie target
   - Protein/Carb/Fat breakdown
   - Visual progress rings (optional)
   - Explanation text

2. Implement Step 6 page
   - Display calculated results
   - Add "Get Started" CTA
   - Trigger auth modal

**Deliverables**:
- ✅ Step 6 complete
- ✅ Macro results displayed
- ✅ Smooth transition to auth

---

### Phase 5: Authentication (Week 3)

**Goal**: Integrate Supabase authentication

**Tasks**:
1. Set up Supabase Auth
   - Configure Google OAuth
   - Set up email/password auth
   - Create auth callback route

2. Create AuthModal component
   - Google sign-in button
   - Email/password form
   - Guest mode option
   - Terms & Privacy checkbox

3. Implement data migration
   - Create migration utility
   - Test localStorage → Supabase flow
   - Handle edge cases (network errors, etc.)

**Deliverables**:
- ✅ Auth modal functional
- ✅ Google OAuth working
- ✅ Data migration working
- ✅ Guest mode functional

---

### Phase 6: Database Integration (Week 3)

**Goal**: Set up database schema and RLS

**Tasks**:
1. Create user_profiles table
   - Run SQL migration
   - Set up RLS policies
   - Create indexes

2. Create Supabase service functions
   - getUserProfile
   - createUserProfile
   - updateUserProfile

3. Add profile sync logic
   - Sync on login
   - Sync on onboarding complete
   - Handle conflicts

**Deliverables**:
- ✅ Database schema deployed
- ✅ RLS policies tested
- ✅ Profile CRUD operations working

---

### Phase 7: Polish & Testing (Week 4)

**Goal**: Refinement and quality assurance

**Tasks**:
1. Add loading states
   - Skeleton loaders
   - Spinner for calculations
   - Transition animations

2. Implement error handling
   - Form validation errors
   - Network error handling
   - Fallback UI

3. Add accessibility features
   - Keyboard navigation
   - ARIA labels
   - Focus management
   - Screen reader support

4. Mobile testing
   - Test on various screen sizes
   - Test on iOS Safari
   - Test on Android Chrome
   - Fix layout issues

5. End-to-end testing
   - Test complete onboarding flow
   - Test auth flows
   - Test guest mode
   - Test data persistence

**Deliverables**:
- ✅ Loading states implemented
- ✅ Error handling complete
- ✅ Accessibility improved
- ✅ Mobile-responsive
- ✅ E2E tests passing

---

### Phase 8: Additional Steps (Week 4-5)

**Goal**: Implement steps 4-5 (TBD)

**Potential Step Ideas**:

**Step 4: Dietary Preferences**
- Dietary restrictions (vegan, vegetarian, etc.)
- Allergies
- Foods to avoid

**Step 5: Experience Level**
- Fitness experience
- Tracking experience
- Meal prep skills

**Implementation**:
- Follow same patterns as steps 1-3
- Add validation schemas
- Update store interface
- Integrate with macro calculations if needed

---

## 8. UI/UX Considerations

### 8.1 Mobile-First Design

**Breakpoints**:
```typescript
// tailwind.config.ts
theme: {
  screens: {
    'sm': '640px',   // Mobile landscape
    'md': '768px',   // Tablet
    'lg': '1024px',  // Desktop
    'xl': '1280px',  // Large desktop
  }
}
```

**Mobile Optimization**:
- Touch-friendly tap targets (min 44x44px)
- Large, readable text (min 16px base)
- Sticky bottom CTAs for easy thumb reach
- Minimal scrolling per step
- Auto-scroll to validation errors

### 8.2 Loading States

```typescript
// components/onboarding/loading-skeleton.tsx
export function OnboardingStepSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-8" />

      <div className="space-y-3">
        <div className="h-20 bg-gray-200 rounded-xl" />
        <div className="h-20 bg-gray-200 rounded-xl" />
        <div className="h-20 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}
```

### 8.3 Animations & Transitions

```typescript
// framer-motion for smooth transitions
import { motion, AnimatePresence } from 'framer-motion'

const stepVariants = {
  enter: {
    x: 300,
    opacity: 0
  },
  center: {
    x: 0,
    opacity: 1
  },
  exit: {
    x: -300,
    opacity: 0
  }
}

export function OnboardingStep({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={stepVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### 8.4 Accessibility

**Keyboard Navigation**:
- Tab order follows visual order
- Enter key submits forms
- Escape key closes modals
- Arrow keys navigate radio groups

**ARIA Labels**:
```typescript
<button
  aria-label="Go back to previous step"
  aria-describedby="step-progress"
>
  <ArrowLeft />
</button>

<div role="progressbar" aria-valuenow={currentStep} aria-valuemax={6}>
  {/* Progress dots */}
</div>
```

**Screen Reader Support**:
```typescript
<div role="status" aria-live="polite" className="sr-only">
  Step {currentStep} of 6: {stepTitle}
</div>
```

### 8.5 Error States

```typescript
// components/ui/error-message.tsx
export function ErrorMessage({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700"
    >
      <AlertCircle className="size-4" />
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  )
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// __tests__/stores/onboarding-store.test.ts
import { renderHook, act } from '@testing-library/react'
import { useOnboardingStore } from '@/stores/onboarding-store'

describe('OnboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.getState().resetOnboarding()
  })

  it('should set goal correctly', () => {
    const { result } = renderHook(() => useOnboardingStore())

    act(() => {
      result.current.setGoal('cut')
    })

    expect(result.current.goal).toBe('cut')
  })

  it('should calculate macros correctly', () => {
    const { result } = renderHook(() => useOnboardingStore())

    act(() => {
      result.current.setGoal('cut')
      result.current.setPersonalStats({
        age: 30,
        weight: 180,
        weightUnit: 'lbs',
        heightFeet: 5,
        heightInches: 10,
        sex: 'male'
      })
      result.current.setActivityLevel('moderately')
      result.current.calculateMacros()
    })

    expect(result.current.targetCalories).toBeGreaterThan(0)
    expect(result.current.proteinGrams).toBeGreaterThan(0)
  })
})
```

### 9.2 Integration Tests

```typescript
// __tests__/onboarding-flow.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import GoalSelectionPage from '@/app/(auth)/onboarding/1/page'

describe('Onboarding Flow', () => {
  it('should allow goal selection and continue', () => {
    render(<GoalSelectionPage />)

    const cutOption = screen.getByText(/Lose Fat/)
    fireEvent.click(cutOption)

    const continueButton = screen.getByText(/Continue/)
    expect(continueButton).not.toBeDisabled()

    fireEvent.click(continueButton)
    // Should navigate to step 2
  })
})
```

### 9.3 E2E Tests (Playwright)

```typescript
// e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test'

test('complete onboarding flow', async ({ page }) => {
  await page.goto('/onboarding/1')

  // Step 1: Select goal
  await page.click('text=Lose Fat (Cut)')
  await page.click('text=Continue')

  // Step 2: Enter personal stats
  await page.fill('input[name="age"]', '30')
  await page.fill('input[name="weight"]', '180')
  await page.selectOption('select[name="weightUnit"]', 'lbs')
  await page.fill('input[name="heightFeet"]', '5')
  await page.fill('input[name="heightInches"]', '10')
  await page.click('text=Male')
  await page.click('text=Continue')

  // Step 3: Select activity level
  await page.click('text=Moderately Active')
  await page.click('text=Continue')

  // ... continue through remaining steps

  // Verify macro results displayed
  await expect(page.locator('text=Your Macro Targets')).toBeVisible()
})
```

---

## 10. Performance Optimization

### 10.1 Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const AuthModal = dynamic(() => import('@/components/auth/auth-modal'), {
  loading: () => <div>Loading...</div>,
  ssr: false
})
```

### 10.2 Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/hero-image.jpg"
  alt="MacroPlan"
  width={1200}
  height={800}
  priority
  quality={85}
/>
```

### 10.3 Debouncing Calculations

```typescript
import { useDebouncedCallback } from 'use-debounce'

const debouncedCalculate = useDebouncedCallback(
  () => calculateMacros(),
  500
)

// Call debouncedCalculate instead of calculateMacros directly
```

---

## 11. Deployment Checklist

### Pre-Launch

- [ ] All 6 onboarding steps implemented
- [ ] Form validation working correctly
- [ ] Macro calculations accurate
- [ ] Auth flows tested (Google OAuth, Email/Password)
- [ ] Guest mode functional
- [ ] Data migration working
- [ ] Database schema deployed
- [ ] RLS policies verified
- [ ] Mobile responsive on iOS/Android
- [ ] Accessibility audit passed
- [ ] Loading states implemented
- [ ] Error handling complete
- [ ] Analytics events added
- [ ] SEO meta tags added

### Post-Launch Monitoring

- Monitor Supabase auth metrics
- Track onboarding completion rates
- Monitor calculation accuracy
- Track form abandonment rates
- Monitor API error rates
- Collect user feedback

---

## 12. Future Enhancements

### V2 Features

1. **Progressive onboarding**
   - Show value earlier
   - Skip optional steps
   - Gamification elements

2. **AI-powered recommendations**
   - Suggest goals based on user profile
   - Personalized macro adjustments

3. **Social proof**
   - Show number of users with similar goals
   - Success stories

4. **A/B testing**
   - Test different onboarding flows
   - Optimize conversion rates

5. **Internationalization**
   - Multi-language support
   - Metric/imperial units

---

## Appendix A: Component Reference

### shadcn/ui Components Required

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add radio-group
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add skeleton
```

### Custom Components to Build

1. **ProgressIndicator** - Step progress dots
2. **StepContainer** - Standard step wrapper
3. **GoalCard** - Selectable goal option
4. **ActivityCard** - Selectable activity level
5. **MacroResultsCard** - Display calculated macros
6. **AuthModal** - Authentication modal
7. **OnboardingStepSkeleton** - Loading skeleton

---

## Appendix B: Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Appendix C: Useful Resources

- **Next.js App Router**: https://nextjs.org/docs/app
- **React Hook Form**: https://react-hook-form.com/
- **Zod Validation**: https://zod.dev/
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Framer Motion**: https://www.framer.com/motion/

---

**Document Version**: 1.0
**Last Updated**: 2025-01-07
**Author**: MacroPlan Development Team
**Status**: Ready for Implementation
