import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/infrastructure/utils/cn"

const alertVariants = cva(
  "relative w-full rounded-2xl border p-5 [&>svg~*]:pl-9 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-5 [&>svg]:top-5 [&>svg]:h-4.5 [&>svg]:w-4.5 transition-all duration-300 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-primary/[0.03] border-primary/20 text-primary [&>svg]:text-primary",
        destructive:
          "bg-destructive/[0.03] border-destructive/20 text-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("text-[10px] font-bold uppercase tracking-[0.3em] leading-none mb-2", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs leading-relaxed italic font-serif opacity-80 [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription, AlertTitle }

