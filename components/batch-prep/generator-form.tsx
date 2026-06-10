'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { TrainingProfileSchema, type TrainingProfile } from '@/lib/types/batch-prep'
import { generateBatchPrepPlanAction } from '@/app/actions/batch-prep'

const PROGRESS_MESSAGES = [
  'Designing your batch recipes…',
  'Balancing training and rest day macros…',
  'Picking ingredients that overlap across meals…',
  'Sequencing the prep timeline…',
  'Writing cooking instructions…',
  'Building your shopping list…',
  'Almost there — final checks…',
]

interface Props {
  defaults: TrainingProfile
  userDietType?: string
  userExclusions: string[]
}

export function GeneratorForm({ defaults, userDietType, userExclusions }: Props) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [progressIndex, setProgressIndex] = useState(0)
  const [mealVariety, setMealVariety] = useState<'low' | 'medium' | 'high'>('medium')
  const router = useRouter()

  useEffect(() => {
    if (!isPending) {
      setProgressIndex(0)
      return
    }
    const interval = setInterval(() => {
      setProgressIndex((i) => Math.min(i + 1, PROGRESS_MESSAGES.length - 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [isPending])

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<TrainingProfile>({
      resolver: zodResolver(TrainingProfileSchema),
      defaultValues: defaults,
    })

  const onSubmit = (data: TrainingProfile) => {
    setServerError(null)
    setLimitReached(false)
    startTransition(async () => {
      const result = await generateBatchPrepPlanAction(data, {
        diet_type: userDietType,
        exclusions: userExclusions,
        meal_variety: mealVariety,
      })
      if (result.success) {
        router.push(`/meal-plans/${result.planId}`)
      } else if (result.code === 'free_tier_limit') {
        setLimitReached(true)
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="training_days_per_week">Training days per week</Label>
          <Input
            id="training_days_per_week"
            type="number"
            min={0}
            max={7}
            {...register('training_days_per_week', { valueAsNumber: true })}
          />
          {errors.training_days_per_week && (
            <p className="text-sm text-destructive">{errors.training_days_per_week.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="prep_day">Prep day</Label>
          <Select
            defaultValue={defaults.prep_day}
            onValueChange={(v) => setValue('prep_day', v as TrainingProfile['prep_day'])}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].map((d) => (
                <SelectItem key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="containers_per_week">Containers to fill</Label>
          <Input
            id="containers_per_week"
            type="number"
            min={3}
            max={21}
            {...register('containers_per_week', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="max_prep_time_mins">Max prep time (minutes)</Label>
          <Input
            id="max_prep_time_mins"
            type="number"
            min={30}
            {...register('max_prep_time_mins', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="meal_variety">Meal variety</Label>
          <Select
            defaultValue="medium"
            onValueChange={(v) => setMealVariety(v as 'low' | 'medium' | 'high')}
          >
            <SelectTrigger id="meal_variety"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low — 3–4 recipes (less shopping, more repetition)</SelectItem>
              <SelectItem value="medium">Medium — 5–6 recipes (balanced)</SelectItem>
              <SelectItem value="high">High — 7–8 recipes (maximum variety)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <details className="rounded border p-4">
        <summary className="cursor-pointer font-medium">Macro targets (click to override)</summary>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold mb-2">Training days</p>
            <div className="space-y-2">
              <Input type="number" placeholder="calories" {...register('training_day_macros.calories', { valueAsNumber: true })} />
              <Input type="number" placeholder="protein (g)" {...register('training_day_macros.protein_g', { valueAsNumber: true })} />
              <Input type="number" placeholder="carbs (g)" {...register('training_day_macros.carbs_g', { valueAsNumber: true })} />
              <Input type="number" placeholder="fat (g)" {...register('training_day_macros.fat_g', { valueAsNumber: true })} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Rest days</p>
            <div className="space-y-2">
              <Input type="number" placeholder="calories" {...register('rest_day_macros.calories', { valueAsNumber: true })} />
              <Input type="number" placeholder="protein (g)" {...register('rest_day_macros.protein_g', { valueAsNumber: true })} />
              <Input type="number" placeholder="carbs (g)" {...register('rest_day_macros.carbs_g', { valueAsNumber: true })} />
              <Input type="number" placeholder="fat (g)" {...register('rest_day_macros.fat_g', { valueAsNumber: true })} />
            </div>
          </div>
        </div>
      </details>

      {limitReached && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
          <p className="font-semibold text-foreground">You&apos;ve used all 3 free batch prep plans</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Premium gives you unlimited plans, training/rest day splits, and PDF export.
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-block rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Upgrade to Premium
          </Link>
        </div>
      )}

      {serverError && <p className="text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {PROGRESS_MESSAGES[progressIndex]}
          </span>
        ) : (
          'Generate my prep plan \u2192'
        )}
      </Button>
      {isPending && (
        <p className="text-center text-xs text-muted-foreground">
          This usually takes 20–40 seconds. Don&apos;t close this tab.
        </p>
      )}
    </form>
  )
}
