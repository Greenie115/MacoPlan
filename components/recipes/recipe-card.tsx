'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { toggleRecipeFavorite } from '@/app/actions/recipes'
import { useOptimistic, useState, useTransition } from 'react'
import { getSafeImageUrl } from '@/lib/utils/image-validation'
import { MacroSplit } from '@/components/ui/macro-split'
import { RecipeImageFallback } from './recipe-image-fallback'

/** Favorites store nullable macros; library rows always have them. */
export interface RecipeCardData {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  calories?: number | null
  protein?: number | null
  carbs?: number | null
  fat?: number | null
}

export function RecipeCard({ recipe, isFavorite }: { recipe: RecipeCardData; isFavorite: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite)
  const [imageFailed, setImageFailed] = useState(false)

  const calories = Math.round(recipe.calories ?? 0)
  const protein = Math.round(recipe.protein ?? 0)
  const carbs = Math.round(recipe.carbs ?? 0)
  const fat = Math.round(recipe.fat ?? 0)
  const imageUrl = imageFailed ? null : getSafeImageUrl(recipe.imageUrl ?? null)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault() // the card is a link
    startTransition(async () => {
      setOptimisticFavorite(!optimisticFavorite)
      await toggleRecipeFavorite(
        recipe.id,
        optimisticFavorite
          ? undefined
          : { title: recipe.title, description: recipe.description ?? undefined, imageUrl, calories, protein, carbs, fat }
      )
    })
  }

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      prefetch={false}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-strong bg-card shadow-xs transition-[box-shadow,transform,border-color] duration-base ease-out-quint hover:-translate-y-0.5 hover:border-coral-200 hover:shadow-lg dark:hover:border-coral-800"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-slow ease-out-quint group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <RecipeImageFallback title={recipe.title} />
        )}
        <button
          onClick={handleFavoriteClick}
          disabled={isPending}
          aria-label={optimisticFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={optimisticFavorite}
          className="absolute right-2 top-2 rounded-full bg-card/90 p-2 shadow-sm backdrop-blur-sm transition-transform duration-fast hover:scale-110 active:scale-95"
        >
          <Heart className={`size-4 ${optimisticFavorite ? 'fill-primary text-primary' : 'text-foreground'}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <p className="line-clamp-2 min-h-[2.6em] text-[0.9375rem] font-semibold leading-snug text-foreground">
          {recipe.title}
        </p>
        <p className="font-mono text-xs tabular-nums text-muted-foreground">{calories} kcal per serving</p>
        <MacroSplit protein={protein} carbs={carbs} fat={fat} className="mt-auto" />
      </div>
    </Link>
  )
}
