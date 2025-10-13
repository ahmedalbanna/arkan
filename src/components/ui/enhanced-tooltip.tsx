import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const tooltipVariants = cva(
  "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default: "bg-popover text-popover-foreground border",
        dark: "bg-gray-900 text-white border-gray-700",
        light: "bg-white text-gray-900 border-gray-200",
        glass: "bg-glass-light backdrop-blur-md border-glass-border text-foreground",
        gradient: "bg-gradient-to-r from-primary to-primary-600 text-primary-foreground border-primary/20",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EnhancedTooltipProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof tooltipVariants> {
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delayDuration?: number
  disableHoverableContent?: boolean
  children: React.ReactElement
}

const EnhancedTooltip = React.forwardRef<HTMLDivElement, EnhancedTooltipProps>(
  ({
    className,
    content,
    side = "top",
    align = "center",
    delayDuration = 700,
    disableHoverableContent = false,
    variant,
    size,
    children,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const timeoutRef = React.useRef<NodeJS.Timeout>()

    const handleMouseEnter = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setIsOpen(true)
      }, delayDuration)
    }

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsOpen(false)
    }

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return (
      <div
        ref={ref}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
        {isOpen && (
          <div
            className={cn(
              tooltipVariants({ variant, size, className }),
              "absolute z-50",
              side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
              side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
              side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
              side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
              align === "start" && side === "top" && "left-0 translate-x-0",
              align === "end" && side === "top" && "right-0 translate-x-0",
              align === "start" && side === "bottom" && "left-0 translate-x-0",
              align === "end" && side === "bottom" && "right-0 translate-x-0",
              align === "start" && side === "left" && "top-0 translate-y-0",
              align === "end" && side === "left" && "bottom-0 translate-y-0",
              align === "start" && side === "right" && "top-0 translate-y-0",
              align === "end" && side === "right" && "bottom-0 translate-y-0"
            )}
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-2 h-2 rotate-45",
                side === "top" && "top-full left-1/2 -translate-x-1/2 -mt-1",
                side === "bottom" && "bottom-full left-1/2 -translate-x-1/2 -mb-1",
                side === "left" && "left-full top-1/2 -translate-y-1/2 -ml-1",
                side === "right" && "right-full top-1/2 -translate-y-1/2 -mr-1",
                variant === "default" && "bg-popover border-r border-b",
                variant === "dark" && "bg-gray-900 border-r border-b border-gray-700",
                variant === "light" && "bg-white border-r border-b border-gray-200",
                variant === "glass" && "bg-glass-light border-r border-b border-glass-border",
                variant === "gradient" && "bg-primary border-r border-b border-primary/20"
              )}
            />
          </div>
        )}
      </div>
    )
  }
)
EnhancedTooltip.displayName = "EnhancedTooltip"

// Multi-line Tooltip Component
export interface MultiLineTooltipProps {
  content: string[]
  children: React.ReactElement
  variant?: VariantProps<typeof tooltipVariants>["variant"]
  size?: VariantProps<typeof tooltipVariants>["size"]
}

const MultiLineTooltip = React.forwardRef<HTMLDivElement, MultiLineTooltipProps>(
  ({ content, children, variant, size }, ref) => {
    return (
      <EnhancedTooltip
        ref={ref}
        content={
          <div className="space-y-1">
            {content.map((line, index) => (
              <div key={index} className="text-center">
                {line}
              </div>
            ))}
          </div>
        }
        variant={variant}
        size={size}
      >
        {children}
      </EnhancedTooltip>
    )
  }
)
MultiLineTooltip.displayName = "MultiLineTooltip"

export { EnhancedTooltip, MultiLineTooltip }

