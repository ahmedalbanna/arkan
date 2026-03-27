import * as React from "react"

import { cn } from "@/infrastructure/utils/cn"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border/40 bg-muted/5 px-4 py-2 text-sm font-medium shadow-inner ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-primary placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-background focus-visible:shadow-sm disabled:cursor-not-allowed disabled:opacity-50",
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
