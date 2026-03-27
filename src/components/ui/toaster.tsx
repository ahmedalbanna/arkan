"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks"

import { Info, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-4">
                <div className="mt-0.5">
                    {variant === 'destructive' ? (
                        <ShieldAlert className="h-5 w-5 text-white animate-pulse" />
                    ) : (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                </div>
                <div className="grid gap-1.5 flex-1 min-w-0">
                    {title && <ToastTitle>{title}</ToastTitle>}
                    {description && (
                        <ToastDescription>{description}</ToastDescription>
                    )}
                </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
