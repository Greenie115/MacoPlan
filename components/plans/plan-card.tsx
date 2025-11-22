'use client'

import { MoreHorizontal, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Plan } from '@/lib/types/plan'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { macroColors } from '@/lib/design-tokens'

interface PlanCardProps {
  plan: Plan
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="relative flex flex-col items-stretch justify-start rounded-2xl bg-white shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Context Menu */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-white hover:text-gray-900 transition-colors">
              <MoreHorizontal className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Plan</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-2 pr-8">
        {plan.images.slice(0, 4).map((image, index) => (
          <div
            key={index}
            className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100"
          >
            <Image
              src={image}
              alt={`Plan image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold leading-tight text-gray-900">
            {plan.title}
          </h2>
          <p className="text-sm font-medium text-gray-500">{plan.dateRange}</p>
          <p className="text-sm font-medium text-gray-500">
            📊 {plan.calories.toLocaleString()} cal/day avg
          </p>
        </div>

        {/* Macros */}
        <div className="flex items-center gap-4 text-sm text-gray-600 pt-1">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="text-lg">{macroColors.protein.emoji}</span>
            {plan.macros.protein}g
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="text-lg">{macroColors.carbs.emoji}</span>
            {plan.macros.carbs}g
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="text-lg">{macroColors.fat.emoji}</span>
            {plan.macros.fat}g
          </span>
        </div>

        {/* Action Button */}
        <button className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-primary/10 bg-primary/5 text-sm font-bold text-primary hover:bg-primary/10 transition-colors">
          <span className="truncate">View Plan</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
