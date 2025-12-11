'use client'

import { RecipeInstruction } from '@/lib/types/recipe'

interface RecipeInstructionsProps {
  instructions: RecipeInstruction[]
}

export function RecipeInstructions({ instructions }: RecipeInstructionsProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-foreground text-xl font-bold">
        Instructions
      </h2>
      <ol className="space-y-4 list-inside">
        {instructions.map((step) => (
          <li key={step.id} className="flex gap-4">
            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
              {step.step_number}
            </span>
            <p className="text-foreground leading-relaxed pt-1 font-medium">
              {step.instruction}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
