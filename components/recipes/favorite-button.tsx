'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleRecipeFavorite } from '@/app/actions/recipes'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PaywallModal } from '@/components/monetization/paywall-modal'
import { cn } from '@/lib/utils'

interface RecipeMetadata {
  title: string
  description?: string
  imageUrl?: string | null
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}

interface FavoriteButtonProps {
  recipeId: string
  initialIsFavorited: boolean
  /** Recipe metadata required for adding to favorites */
  metadata: RecipeMetadata
  variant?: 'icon' | 'button'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FavoriteButton({
  recipeId,
  initialIsFavorited,
  metadata,
  variant = 'icon',
  size = 'md',
  className,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isLoading, setIsLoading] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if button is inside a link
    e.stopPropagation()

    setIsLoading(true)

    // Optimistic update
    const previousState = isFavorited
    setIsFavorited(!isFavorited)

    // Pass metadata when adding to favorites
    const result = await toggleRecipeFavorite(recipeId, !previousState ? metadata : undefined)

    if (result.error) {
      // Rollback on error
      setIsFavorited(previousState)
      // Hit the free-tier favorites cap → show the upgrade paywall (→ Stripe)
      if ('limitReached' in result && result.limitReached) {
        setShowPaywall(true)
      } else {
        toast.error(result.error)
      }
    } else {
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
    }

    setIsLoading(false)
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const paywall = (
    <PaywallModal
      isOpen={showPaywall}
      onClose={() => setShowPaywall(false)}
      trigger="favorites_limit"
    />
  )

  if (variant === 'button') {
    return (
      <>
        <Button
          variant="outline"
          onClick={handleToggle}
          disabled={isLoading}
          className={cn('gap-2', className)}
        >
          <Heart
            className={cn(
              iconSizeClasses[size],
              'transition-colors',
              isFavorited ? 'fill-primary text-primary' : 'text-icon'
            )}
          />
          {isFavorited ? 'Favorited' : 'Add to Favorites'}
        </Button>
        {paywall}
      </>
    )
  }

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          'p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50',
          className
        )}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={cn(
            iconSizeClasses[size],
            'transition-all duration-200',
            isFavorited
              ? 'fill-primary text-primary scale-110'
              : 'text-icon hover:text-primary'
          )}
        />
      </button>
      {paywall}
    </>
  )
}
