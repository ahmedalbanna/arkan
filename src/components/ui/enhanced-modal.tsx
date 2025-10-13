import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import * as React from "react"

const modalVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center p-4",
  {
    variants: {
      variant: {
        default: "",
        glass: "backdrop-blur-md bg-black/20",
        dark: "bg-black/50",
        light: "bg-white/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const modalContentVariants = cva(
  "relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        default: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-full mx-4",
      },
      variant: {
        default: "bg-background border",
        glass: "bg-glass-light backdrop-blur-md border-glass-border shadow-glass",
        gradient: "bg-gradient-to-br from-background to-background/80 border-primary/20",
        elevated: "bg-background border shadow-hard",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface EnhancedModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof modalVariants> {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  children: React.ReactNode
  contentSize?: VariantProps<typeof modalContentVariants>["size"]
  contentVariant?: VariantProps<typeof modalContentVariants>["variant"]
}

const EnhancedModal = React.forwardRef<HTMLDivElement, EnhancedModalProps>(
  ({
    className,
    isOpen,
    onClose,
    title,
    description,
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    children,
    variant,
    contentSize,
    contentVariant,
    ...props
  }, ref) => {
    const modalRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (!isOpen) return

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && closeOnEscape) {
          onClose()
        }
      }

      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"

      return () => {
        document.removeEventListener("keydown", handleEscape)
        document.body.style.overflow = "unset"
      }
    }, [isOpen, closeOnEscape, onClose])

    const handleOverlayClick = (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && closeOnOverlayClick) {
        onClose()
      }
    }

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(modalVariants({ variant, className }))}
        onClick={handleOverlayClick}
        {...props}
      >
        <div
          ref={modalRef}
          className={cn(modalContentVariants({ size: contentSize, variant: contentVariant }))}
        >
          {(title || description || showCloseButton) && (
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                {title && (
                  <h2 className="text-lg font-semibold text-foreground">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              )}
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
EnhancedModal.displayName = "EnhancedModal"

// Confirmation Modal Component
export interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning"
  loading?: boolean
}

const ConfirmationModal = React.forwardRef<HTMLDivElement, ConfirmationModalProps>(
  ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    loading = false,
  }, ref) => {
    const handleConfirm = () => {
      onConfirm()
      onClose()
    }

    return (
      <EnhancedModal
        ref={ref}
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        contentSize="sm"
        showCloseButton={false}
        closeOnOverlayClick={!loading}
        closeOnEscape={!loading}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={cn(
                "px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50",
                variant === "destructive" && "bg-destructive hover:bg-destructive/90",
                variant === "warning" && "bg-yellow-500 hover:bg-yellow-600",
                variant === "default" && "bg-primary hover:bg-primary/90"
              )}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </EnhancedModal>
    )
  }
)
ConfirmationModal.displayName = "ConfirmationModal"

export { ConfirmationModal, EnhancedModal }

