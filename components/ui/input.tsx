import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-base shadow-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-[border-color,box-shadow] duration-fast",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
