
"use client"

import { GripVertical } from "lucide-react"
import { PanelResizeHandle, type PanelResizeHandleProps } from "react-resizable-panels"

import { cn } from "@/infrastructure/utils/cn"

import {
  Panel as ResizablePanel,
  PanelGroup as ResizablePanelGroup,
} from "react-resizable-panels"

const ResizableHandle = ({
  className,
  withHandle,
  ...props
}: PanelResizeHandleProps & { withHandle?: boolean }) => (
  <PanelResizeHandle
    className={cn(
      "relative flex w-1 items-center justify-center bg-transparent transition-all duration-300 hover:bg-primary/10 data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-6 w-4 items-center justify-center rounded-lg border border-border/40 bg-background shadow-xl ring-1 ring-black/5 dark:ring-white/10 group">
        <GripVertical className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>
    )}
    
    {/* Line Indicator */}
    <div className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-border/40 group-hover:bg-primary/40 transition-colors" />
  </PanelResizeHandle>
)

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }

