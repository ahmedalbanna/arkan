import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const loadingVariants = cva(
    "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]",
    {
        variants: {
            size: {
                sm: "h-4 w-4",
                default: "h-6 w-6",
                lg: "h-8 w-8",
                xl: "h-12 w-12",
            },
            variant: {
                default: "border-primary",
                secondary: "border-secondary",
                muted: "border-muted-foreground",
                white: "border-white",
            },
        },
        defaultVariants: {
            size: "default",
            variant: "default",
        },
    }
)

export interface LoadingSpinnerProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
    text?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
    ({ className, size, variant, text, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center justify-center", className)}
            {...props}
        >
            <div className={cn(loadingVariants({ size, variant }))} />
            {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
        </div>
    )
)
LoadingSpinner.displayName = "LoadingSpinner"

// Dots Loading Component
const dotsLoadingVariants = cva(
    "inline-block w-2 h-2 rounded-full bg-current animate-pulse",
    {
        variants: {
            size: {
                sm: "w-1 h-1",
                default: "w-2 h-2",
                lg: "w-3 h-3",
            },
            variant: {
                default: "bg-primary",
                secondary: "bg-secondary",
                muted: "bg-muted-foreground",
                white: "bg-white",
            },
        },
        defaultVariants: {
            size: "default",
            variant: "default",
        },
    }
)

export interface DotsLoadingProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dotsLoadingVariants> {
    text?: string
}

const DotsLoading = React.forwardRef<HTMLDivElement, DotsLoadingProps>(
    ({ className, size, variant, text, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center justify-center gap-1", className)}
            {...props}
        >
            <div className={cn(dotsLoadingVariants({ size, variant }))} style={{ animationDelay: '0ms' }} />
            <div className={cn(dotsLoadingVariants({ size, variant }))} style={{ animationDelay: '150ms' }} />
            <div className={cn(dotsLoadingVariants({ size, variant }))} style={{ animationDelay: '300ms' }} />
            {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
        </div>
    )
)
DotsLoading.displayName = "DotsLoading"

// Skeleton Loading Component
export interface SkeletonLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
    lines?: number
    width?: string
    height?: string
}

const SkeletonLoading = React.forwardRef<HTMLDivElement, SkeletonLoadingProps>(
    ({ className, lines = 3, width = "100%", height = "1rem", ...props }, ref) => (
        <div
            ref={ref}
            className={cn("space-y-2", className)}
            {...props}
        >
            {Array.from({ length: lines }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse bg-muted rounded"
                    style={{
                        width: index === lines - 1 ? '75%' : width,
                        height: height,
                    }}
                />
            ))}
        </div>
    )
)
SkeletonLoading.displayName = "SkeletonLoading"

// Pulse Loading Component
export interface PulseLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'default' | 'lg' | 'xl'
    color?: 'primary' | 'secondary' | 'muted' | 'white'
}

const PulseLoading = React.forwardRef<HTMLDivElement, PulseLoadingProps>(
    ({ className, size = 'default', color = 'primary', ...props }, ref) => {
        const sizeClasses = {
            sm: 'h-4 w-4',
            default: 'h-6 w-6',
            lg: 'h-8 w-8',
            xl: 'h-12 w-12',
        }

        const colorClasses = {
            primary: 'bg-primary',
            secondary: 'bg-secondary',
            muted: 'bg-muted-foreground',
            white: 'bg-white',
        }

        return (
            <div
                ref={ref}
                className={cn("flex items-center justify-center", className)}
                {...props}
            >
                <div
                    className={cn(
                        "rounded-full animate-pulse",
                        sizeClasses[size],
                        colorClasses[color]
                    )}
                />
            </div>
        )
    }
)
PulseLoading.displayName = "PulseLoading"

// Shimmer Loading Component
export interface ShimmerLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
    width?: string
    height?: string
}

const ShimmerLoading = React.forwardRef<HTMLDivElement, ShimmerLoadingProps>(
    ({ className, width = "100%", height = "1rem", ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted rounded",
                className
            )}
            style={{ width, height }}
            {...props}
        />
    )
)
ShimmerLoading.displayName = "ShimmerLoading"

// Full Page Loading Component
export interface FullPageLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
    text?: string
    variant?: 'spinner' | 'dots' | 'pulse'
}

const FullPageLoading = React.forwardRef<HTMLDivElement, FullPageLoadingProps>(
    ({ className, text = "Loading...", variant = 'spinner', ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
                className
            )}
            {...props}
        >
            <div className="flex flex-col items-center gap-4">
                {variant === 'spinner' && <LoadingSpinner size="xl" />}
                {variant === 'dots' && <DotsLoading size="lg" />}
                {variant === 'pulse' && <PulseLoading size="xl" />}
                <p className="text-sm text-muted-foreground">{text}</p>
            </div>
        </div>
    )
)
FullPageLoading.displayName = "FullPageLoading"

export {
    DotsLoading, FullPageLoading, LoadingSpinner, PulseLoading,
    ShimmerLoading, SkeletonLoading
}

