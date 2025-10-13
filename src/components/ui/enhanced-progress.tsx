import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const progressVariants = cva(
    "relative w-full overflow-hidden rounded-full bg-secondary",
    {
        variants: {
            size: {
                sm: "h-2",
                default: "h-3",
                lg: "h-4",
                xl: "h-6",
            },
            variant: {
                default: "bg-secondary",
                gradient: "bg-gradient-to-r from-primary/20 to-primary/10",
                glass: "bg-glass-light backdrop-blur-sm",
            },
        },
        defaultVariants: {
            size: "default",
            variant: "default",
        },
    }
)

const progressIndicatorVariants = cva(
    "h-full w-full flex-1 transition-all duration-500 ease-out",
    {
        variants: {
            variant: {
                default: "bg-primary",
                gradient: "bg-gradient-to-r from-primary to-primary-600",
                rainbow: "bg-gradient-to-r from-red-500 via-yellow-500 to-green-500",
                glow: "bg-primary shadow-glow",
                shimmer: "bg-gradient-to-r from-primary via-primary-400 to-primary bg-[length:200%_100%] animate-shimmer",
            },
            animation: {
                none: "",
                pulse: "animate-pulse",
                bounce: "animate-bounce",
                shimmer: "animate-shimmer",
            },
        },
        defaultVariants: {
            variant: "default",
            animation: "none",
        },
    }
)

export interface EnhancedProgressProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
    value?: number
    max?: number
    showValue?: boolean
    showPercentage?: boolean
    label?: string
    indicatorVariant?: VariantProps<typeof progressIndicatorVariants>["variant"]
    indicatorAnimation?: VariantProps<typeof progressIndicatorVariants>["animation"]
}

const EnhancedProgress = React.forwardRef<HTMLDivElement, EnhancedProgressProps>(
    ({
        className,
        value = 0,
        max = 100,
        showValue = false,
        showPercentage = false,
        label,
        size,
        variant,
        indicatorVariant,
        indicatorAnimation,
        ...props
    }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

        return (
            <div className="w-full space-y-2">
                {(label || showValue || showPercentage) && (
                    <div className="flex justify-between items-center text-sm">
                        {label && <span className="text-muted-foreground">{label}</span>}
                        <div className="flex items-center gap-2">
                            {showValue && (
                                <span className="font-medium">
                                    {value}/{max}
                                </span>
                            )}
                            {showPercentage && (
                                <span className="text-muted-foreground">
                                    {Math.round(percentage)}%
                                </span>
                            )}
                        </div>
                    </div>
                )}
                <div
                    ref={ref}
                    className={cn(progressVariants({ size, variant, className }))}
                    {...props}
                >
                    <div
                        className={cn(
                            progressIndicatorVariants({
                                variant: indicatorVariant,
                                animation: indicatorAnimation,
                            })
                        )}
                        style={{ transform: `translateX(-${100 - percentage}%)` }}
                    />
                </div>
            </div>
        )
    }
)
EnhancedProgress.displayName = "EnhancedProgress"

// Circular Progress Component
const circularProgressVariants = cva(
    "relative inline-flex items-center justify-center",
    {
        variants: {
            size: {
                sm: "w-8 h-8",
                default: "w-12 h-12",
                lg: "w-16 h-16",
                xl: "w-20 h-20",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
)

export interface CircularProgressProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof circularProgressVariants> {
    value?: number
    max?: number
    showValue?: boolean
    strokeWidth?: number
    variant?: "default" | "gradient" | "glow"
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
    ({
        className,
        value = 0,
        max = 100,
        showValue = false,
        strokeWidth = 2,
        size,
        variant = "default",
        ...props
    }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
        const radius = size === "sm" ? 12 : size === "lg" ? 28 : size === "xl" ? 36 : 20
        const circumference = 2 * Math.PI * radius
        const strokeDasharray = circumference
        const strokeDashoffset = circumference - (percentage / 100) * circumference

        const strokeColor = variant === "gradient"
            ? "url(#gradient)"
            : variant === "glow"
                ? "#3b82f6"
                : "currentColor"

        return (
            <div
                ref={ref}
                className={cn(circularProgressVariants({ size, className }))}
                {...props}
            >
                <svg
                    className="transform -rotate-90"
                    width={radius * 2 + strokeWidth * 2}
                    height={radius * 2 + strokeWidth * 2}
                >
                    {variant === "gradient" && (
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    )}
                    <circle
                        cx={radius + strokeWidth}
                        cy={radius + strokeWidth}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="opacity-20"
                    />
                    <circle
                        cx={radius + strokeWidth}
                        cy={radius + strokeWidth}
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={cn(
                            "transition-all duration-500 ease-out",
                            variant === "glow" && "drop-shadow-glow"
                        )}
                    />
                </svg>
                {showValue && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium">
                            {Math.round(percentage)}%
                        </span>
                    </div>
                )}
            </div>
        )
    }
)
CircularProgress.displayName = "CircularProgress"

export { CircularProgress, EnhancedProgress }

