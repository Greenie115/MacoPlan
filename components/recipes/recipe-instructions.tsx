'use client'

import { RecipeInstruction } from '@/lib/types/recipe'

interface RecipeInstructionsProps {
  instructions: RecipeInstruction[]
}

export function RecipeInstructions({ instructions }: RecipeInstructionsProps) {
  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
      <div className="space-y-4">
        {instructions.map((instruction) => (
          <div key={instruction.id} className="flex gap-4">
            {/* Step Number Circle */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary/20 text-primary font-semibold text-sm">
                {instruction.step_number}
              </div>
            </div>

            {/* Instruction Text */}
            <div className="flex-1 pt-1">
              <p className="text-base leading-relaxed text-gray-700">
                {instruction.instruction}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
