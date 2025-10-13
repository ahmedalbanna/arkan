import { cn } from "@/lib/utils"
import * as React from "react"

// Mobile-optimized Container
export interface MobileContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'default' | 'lg'
}

const MobileContainer = React.forwardRef<HTMLDivElement, MobileContainerProps>(
  ({ className, children, maxWidth = 'lg', padding = 'default', ...props }, ref) => {
    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full',
    }

    const paddingClasses = {
      none: '',
      sm: 'px-2 py-4',
      default: 'px-4 py-6',
      lg: 'px-6 py-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'container mx-auto',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          'mobile-optimized',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileContainer.displayName = "MobileContainer"

// Mobile-optimized Grid
export interface MobileGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'default' | 'lg'
}

const MobileGrid = React.forwardRef<HTMLDivElement, MobileGridProps>(
  ({ className, children, cols = { mobile: 1, tablet: 2, desktop: 3 }, gap = 'default', ...props }, ref) => {
    const gapClasses = {
      sm: 'gap-2',
      default: 'gap-4',
      lg: 'gap-6',
    }

    const gridClasses = cn(
      'grid',
      `grid-cols-${cols.mobile || 1}`,
      `sm:grid-cols-${cols.tablet || cols.mobile || 2}`,
      `lg:grid-cols-${cols.desktop || cols.tablet || 3}`,
      gapClasses[gap],
      className
    )

    return (
      <div ref={ref} className={gridClasses} {...props}>
        {children}
      </div>
    )
  }
)
MobileGrid.displayName = "MobileGrid"

// Mobile-optimized Button
export interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  size?: 'sm' | 'default' | 'lg'
  fullWidth?: boolean
  touchOptimized?: boolean
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, children, size = 'default', fullWidth = false, touchOptimized = true, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs',
      default: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          sizeClasses[size],
          fullWidth && 'w-full',
          touchOptimized && 'min-h-[44px]', // iOS touch target minimum
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
MobileButton.displayName = "MobileButton"

// Mobile-optimized Card
export interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'default' | 'lg'
  interactive?: boolean
}

const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
  ({ className, children, padding = 'default', interactive = false, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      default: 'p-4',
      lg: 'p-6',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          paddingClasses[padding],
          interactive && 'hover:shadow-md transition-shadow cursor-pointer',
          'mobile-optimized',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileCard.displayName = "MobileCard"

// Mobile-optimized Input
export interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  touchOptimized?: boolean
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, label, error, touchOptimized = true, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            touchOptimized && 'min-h-[44px] text-base', // iOS touch target and larger text
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
MobileInput.displayName = "MobileInput"

// Mobile-optimized Modal
export interface MobileModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  fullScreen?: boolean
}

const MobileModal = React.forwardRef<HTMLDivElement, MobileModalProps>(
  ({ className, isOpen, onClose, children, title, fullScreen = false, ...props }, ref) => {
    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen])

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          'bg-background/80 backdrop-blur-sm',
          fullScreen && 'items-start p-0',
          className
        )}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        {...props}
      >
        <div
          className={cn(
            'relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300',
            fullScreen && 'max-w-full h-full rounded-none',
            'mobile-optimized'
          )}
        >
          {title && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="overflow-y-auto max-h-[70vh]">
            {children}
          </div>
        </div>
      </div>
    )
  }
)
MobileModal.displayName = "MobileModal"

// Mobile-optimized Navigation
export interface MobileNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  position?: 'top' | 'bottom'
  fixed?: boolean
}

const MobileNavigation = React.forwardRef<HTMLDivElement, MobileNavigationProps>(
  ({ className, children, position = 'bottom', fixed = true, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'flex items-center justify-around bg-background border-t',
          position === 'top' && 'border-b border-t-0',
          fixed && 'fixed left-0 right-0 z-40',
          position === 'bottom' && 'bottom-0',
          position === 'top' && 'top-0',
          'mobile-optimized',
          className
        )}
        {...props}
      >
        {children}
      </nav>
    )
  }
)
MobileNavigation.displayName = "MobileNavigation"

// Mobile-optimized Tab
export interface MobileTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  active?: boolean
  icon?: React.ReactNode
  label?: string
}

const MobileTab = React.forwardRef<HTMLButtonElement, MobileTabProps>(
  ({ className, children, active = false, icon, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center p-2 min-h-[60px] w-full',
          'transition-colors hover:bg-accent hover:text-accent-foreground',
          active && 'text-primary bg-primary/10',
          'mobile-optimized',
          className
        )}
        {...props}
      >
        {icon && <span className="mb-1">{icon}</span>}
        {label && <span className="text-xs font-medium">{label}</span>}
        {children}
      </button>
    )
  }
)
MobileTab.displayName = "MobileTab"

export {
  MobileButton,
  MobileCard, MobileContainer,
  MobileGrid, MobileInput,
  MobileModal,
  MobileNavigation,
  MobileTab
}

