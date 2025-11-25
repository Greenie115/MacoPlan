'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { LogRecipeModal } from './log-recipe-modal'
import { deleteMealLog } from '@/app/actions/meal-logs'
import { toast } from 'sonner'

interface Recipe {
  id: string
  name: string
  calories: number
  protein_grams: number
  carb_grams: number
  fat_grams: number
  servings?: number
}

interface LogRecipeButtonProps {
  recipe: Recipe
  loggedMealId?: string | null
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function LogRecipeButton({
  recipe,
  loggedMealId,
  variant = 'default',
  size = 'default',
  className,
}: LogRecipeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleRemove = async () => {
    if (!loggedMealId) return

    setIsDeleting(true)
    const result = await deleteMealLog(loggedMealId)
    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Removed from logged meals')
      router.refresh() // Refresh to update the button state
    }
  }

  // If already logged, show remove button
  if (loggedMealId) {
    return (
      <Button
        onClick={handleRemove}
        disabled={isDeleting}
        variant="outline"
        size={size}
        className={className}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {isDeleting ? 'Removing...' : 'Remove from Logged Meals'}
      </Button>
    )
  }

  // Otherwise show log button
  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Plus className="mr-2 h-4 w-4" />
        Log This Meal
      </Button>

      <LogRecipeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipe={recipe}
        onSuccess={() => {
          // Refresh the page to update the button state
          router.refresh()
        }}
      />
    </>
  )
}
