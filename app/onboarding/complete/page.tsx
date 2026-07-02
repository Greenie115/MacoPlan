'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OnboardingCompletePage() {
  const [error, setError] = useState<string | null>(null)
  const [noPlan, setNoPlan] = useState(false)
  const [migrating, setMigrating] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function handleMigration() {
      try {
        // Import migration function dynamically to avoid SSR issues
        const { migrateOnboardingData } = await import('@/lib/migration/localStorage-to-supabase')

        // Migrate localStorage data to Supabase
        await migrateOnboardingData()

        // Redirect to dashboard
        router.push('/dashboard')
      } catch (err) {
        console.error('Migration error:', err)
        // No pending plan in this browser — usually means they confirmed the
        // email on a different device. Explain it instead of showing an error.
        if (err instanceof Error && err.message.includes('Incomplete onboarding data')) {
          setNoPlan(true)
        } else {
          setError(err instanceof Error ? err.message : 'Migration failed')
        }
        setMigrating(false)
      }
    }

    handleMigration()
  }, [router])

  if (noPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">Let&apos;s rebuild your plan</h1>
          <p className="text-muted-foreground">
            Looks like you opened this on a new device, so your answers aren&apos;t here. It only
            takes a minute to redo — your account is all set.
          </p>
          <Button onClick={() => router.push('/onboarding/1')}>
            Start onboarding
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Continue to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h1 className="text-2xl font-bold">Setting up your account...</h1>
        <p className="text-muted-foreground">
          We're saving your personalized macro plan
        </p>
      </div>
    </div>
  )
}
