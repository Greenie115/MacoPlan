'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { recalculateMacros } from '@/app/actions/profile'
import { toast } from 'sonner'
import { useState } from 'react'
import { Calculator } from 'lucide-react'

interface MacroWarningModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRecalculate?: () => void
}

export function MacroWarningModal({ open, onOpenChange, onRecalculate }: MacroWarningModalProps) {
  const [recalculating, setRecalculating] = useState(false)

  const handleRecalculate = async () => {
    setRecalculating(true)

    try {
      const result = await recalculateMacros()

      if (result.error) {
        toast.error(result.error)
      } else if (result.macros) {
        toast.success('Macros recalculated successfully!')
        onRecalculate?.()
        onOpenChange(false)
      }
    } catch (error) {
      toast.error('Failed to recalculate macros')
    } finally {
      setRecalculating(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/20">
              <Calculator className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <AlertDialogTitle>Recalculate Your Macros?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            You've updated profile data that affects your macro calculations (weight, height, age, activity level, or goal).
            <br />
            <br />
            Would you like to recalculate your macros now to reflect these changes across the app?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={recalculating}>Later</AlertDialogCancel>
          <AlertDialogAction onClick={handleRecalculate} disabled={recalculating} className="bg-primary">
            {recalculating ? 'Recalculating...' : 'Recalculate Now'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
