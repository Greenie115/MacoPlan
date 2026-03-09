'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { StepContainer } from '@/components/onboarding/step-container'
import { PageTransition } from '@/components/onboarding/page-transition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check } from 'lucide-react'

const personalStatsSchema = z.object({
  age: z.number().min(13, 'You must be at least 13 years old').max(120, 'Please enter a valid age'),
  weight: z.number().min(50, 'Please enter a valid weight').max(500, 'Please enter a valid weight'),
  weightUnit: z.enum(['lbs', 'kg']),
  heightFeet: z.number().min(3, 'Please enter a valid height').max(8, 'Please enter a valid height'),
  heightInches: z.number().min(0, 'Inches must be between 0-11').max(11, 'Inches must be between 0-11'),
  sex: z.enum(['male', 'female']),
})

type PersonalStatsForm = z.infer<typeof personalStatsSchema>

export default function PersonalStatsPage() {
  const router = useRouter()
  const store = useOnboardingStore()
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    // Route guard: Must have goal from step 1
    if (!store.goal) {
      router.replace('/onboarding/1')
      return
    }
    setIsValidating(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentional mount-only step guard

  const form = useForm<PersonalStatsForm>({
    resolver: zodResolver(personalStatsSchema),
    defaultValues: {
      age: store.age || 25,
      weight: store.weight || 180,
      weightUnit: store.weightUnit || 'lbs',
      heightFeet: store.heightFeet || 5,
      heightInches: store.heightInches ?? 10,
      sex: store.sex || 'male',
    },
  })

  // Track previous weight unit for conversion
  const [prevWeightUnit, setPrevWeightUnit] = useState<'lbs' | 'kg'>(store.weightUnit || 'lbs')

  // Watch for weight unit changes and convert weight value
  const weightUnit = form.watch('weightUnit')
  useEffect(() => {
    if (weightUnit !== prevWeightUnit) {
      const currentWeight = form.getValues('weight')
      let convertedWeight: number

      if (weightUnit === 'kg' && prevWeightUnit === 'lbs') {
        // Convert lbs to kg
        convertedWeight = currentWeight * 0.453592
      } else if (weightUnit === 'lbs' && prevWeightUnit === 'kg') {
        // Convert kg to lbs
        convertedWeight = currentWeight * 2.20462
      } else {
        convertedWeight = currentWeight
      }

      // Round to 1 decimal place
      convertedWeight = Math.round(convertedWeight * 10) / 10

      form.setValue('weight', convertedWeight)
      setPrevWeightUnit(weightUnit)
    }
  }, [weightUnit, prevWeightUnit, form])

  const handleContinue = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      const values = form.getValues()
      store.setPersonalStats(values)
      store.markStepComplete(2)
      router.push('/onboarding/3')
    }
  }

  const handleBack = () => {
    router.push('/onboarding/1')
  }

  const sex = form.watch('sex')

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <PageTransition step={2}>
      <StepContainer
        step={2}
        title="Tell us about yourself"
        onBack={handleBack}
        onContinue={handleContinue}
        completedSteps={store.completedSteps}
      >
      <div className="flex flex-col gap-4">
        {/* Age Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="age">Age</Label>
          <div className="relative">
            <Input
              id="age"
              type="number"
              {...form.register('age', { valueAsNumber: true })}
              className="pr-20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              years
            </span>
          </div>
          {form.formState.errors.age && (
            <p className="text-sm text-red-600">{form.formState.errors.age.message}</p>
          )}
        </div>

        {/* Weight Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="weight">Weight</Label>
          <div className="relative flex items-center">
            <Input
              id="weight"
              type="number"
              {...form.register('weight', { valueAsNumber: true })}
              className="pr-24"
            />
            <Select
              value={form.watch('weightUnit')}
              onValueChange={(value) => form.setValue('weightUnit', value as 'lbs' | 'kg')}
            >
              <SelectTrigger className="absolute right-0 w-20 h-10 border-l rounded-l-none focus:ring-2 focus:ring-primary focus:ring-offset-0 data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lbs">lbs</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.formState.errors.weight && (
            <p className="text-sm text-red-600">{form.formState.errors.weight.message}</p>
          )}
        </div>

        {/* Height Input */}
        <div className="flex flex-col gap-2">
          <Label>Height</Label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input
                type="number"
                {...form.register('heightFeet', { valueAsNumber: true })}
                className="pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                ft
              </span>
            </div>
            <div className="relative flex-1">
              <Input
                type="number"
                {...form.register('heightInches', { valueAsNumber: true })}
                className="pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                in
              </span>
            </div>
          </div>
          {(form.formState.errors.heightFeet || form.formState.errors.heightInches) && (
            <p className="text-sm text-red-600">
              {form.formState.errors.heightFeet?.message || form.formState.errors.heightInches?.message}
            </p>
          )}
        </div>

        {/* Sex Toggle */}
        <div className="flex flex-col gap-2">
          <Label>Sex</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={sex === 'male' ? 'default' : 'outline'}
              onClick={() => form.setValue('sex', 'male')}
              className="h-14"
            >
              Male
              {sex === 'male' && <Check className="ml-2 size-4" />}
            </Button>
            <Button
              type="button"
              variant={sex === 'female' ? 'default' : 'outline'}
              onClick={() => form.setValue('sex', 'female')}
              className="h-14"
            >
              Female
              {sex === 'female' && <Check className="ml-2 size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </StepContainer>
    </PageTransition>
  )
}
