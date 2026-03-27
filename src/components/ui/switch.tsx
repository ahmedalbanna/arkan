"use client"

import * as SwitchPrimitives from "@radix-ui/react-switch"
import * as React from "react"

import { cn } from "@/infrastructure/utils/cn"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:shadow-lg data-[state=checked]:shadow-primary/20 data-[state=unchecked]:bg-muted/40 data-[state=unchecked]:shadow-inner active:scale-95",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-xl ring-0 transition-transform duration-500 ease-in-out data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 border border-border/10"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

