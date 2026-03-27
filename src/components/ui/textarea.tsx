import * as React from "react"

import { cn } from "@/infrastructure/utils/cn"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-2xl border border-border/40 bg-muted/5 p-4 text-sm font-medium leading-relaxed shadow-inner ring-offset-background transition-all duration-300 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-background focus-visible:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 custom-scrollbar",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
