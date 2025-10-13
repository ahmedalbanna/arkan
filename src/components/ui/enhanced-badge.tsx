import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        gradient:
          "border-transparent bg-gradient-to-r from-primary to-primary-600 text-primary-foreground",
        glass:
          "border-glass-border bg-glass-light backdrop-blur-md text-foreground",
        glow:
          "border-transparent bg-primary text-primary-foreground shadow-glow",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        wiggle: "animate-wiggle",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface EnhancedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

const EnhancedBadge = React.forwardRef<HTMLDivElement, EnhancedBadgeProps>(
  ({ className, variant, size, animation, icon, removable, onRemove, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, animation, className }))}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
        {removable && (
          <button
            onClick={onRemove}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
            aria-label="Remove badge"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
EnhancedBadge.displayName = "EnhancedBadge"

// Status Badge Component
export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending'
  text?: string
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, text, ...props }, ref) => {
    const statusConfig = {
      success: { variant: 'success' as const, icon: '✓', text: text || 'Success' },
      warning: { variant: 'warning' as const, icon: '⚠', text: text || 'Warning' },
      error: { variant: 'destructive' as const, icon: '✕', text: text || 'Error' },
      info: { variant: 'info' as const, icon: 'ℹ', text: text || 'Info' },
      pending: { variant: 'secondary' as const, icon: '⏳', text: text || 'Pending' },
    }

    const config = statusConfig[status]

    return (
      <EnhancedBadge
        ref={ref}
        variant={config.variant}
        icon={config.icon}
        className={className}
        {...props}
      >
        {config.text}
      </EnhancedBadge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

// Count Badge Component
export interface CountBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  count: number
  max?: number
  variant?: VariantProps<typeof badgeVariants>["variant"]
  showZero?: boolean
}

const CountBadge = React.forwardRef<HTMLDivElement, CountBadgeProps>(
  ({ className, count, max, variant = 'destructive', showZero = false, ...props }, ref) => {
    if (count === 0 && !showZero) return null

    const displayCount = max && count > max ? `${max}+` : count.toString()

    return (
      <EnhancedBadge
        ref={ref}
        variant={variant}
        size="sm"
        className={cn("min-w-[1.25rem] h-5 flex items-center justify-center", className)}
        {...props}
      >
        {displayCount}
      </EnhancedBadge>
    )
  }
)
CountBadge.displayName = "CountBadge"

// Notification Badge Component
export interface NotificationBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  count: number
  max?: number
  pulse?: boolean
}

const NotificationBadge = React.forwardRef<HTMLDivElement, NotificationBadgeProps>(
  ({ className, count, max, pulse = true, ...props }, ref) => {
    if (count === 0) return null

    const displayCount = max && count > max ? `${max}+` : count.toString()

    return (
      <CountBadge
        ref={ref}
        count={parseInt(displayCount)}
        variant="destructive"
        animation={pulse ? "pulse" : "none"}
        className={cn("absolute -top-1 -right-1", className)}
        {...props}
      />
    )
  }
)
NotificationBadge.displayName = "NotificationBadge"

export { CountBadge, EnhancedBadge, NotificationBadge, StatusBadge }

