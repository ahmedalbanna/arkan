'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { RotateCcw, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';

interface BuilderCanvasProps {
  children: React.ReactNode;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  toolbar?: React.ReactNode;
  className?: string;
  containerRef?: React.RefObject<HTMLDivElement>;
  isProcessing?: boolean;
}

/**
 * BuilderCanvas — Desktop-only document canvas with zoom controls.
 * Supports Ctrl+scroll zoom. No mobile conditionals.
 */
export const BuilderCanvas = React.forwardRef<HTMLDivElement, BuilderCanvasProps>(
  (
    {
      children,
      zoomLevel,
      onZoomIn,
      onZoomOut,
      onZoomReset,
      toolbar,
      className,
      containerRef,
      isProcessing = false,
    },
    ref
  ) => {
    const canvasTransform = useMemo(() => `scale(${zoomLevel})`, [zoomLevel]);

    // Ctrl+scroll zoom
    useEffect(() => {
      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (e.deltaY < 0) onZoomIn();
          else if (e.deltaY > 0) onZoomOut();
        }
      };

      const container = containerRef?.current;
      if (container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
      }
    }, [onZoomIn, onZoomOut, containerRef]);

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full w-full bg-[#f1f5f9] dark:bg-[#090c10] relative overflow-hidden z-10 transform-gpu',
          className
        )}
      >
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-[35] pointer-events-none bg-primary/[0.01] animate-in fade-in duration-1000">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:14px_14px] opacity-[0.05] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 px-6 py-3 rounded-2xl bg-background/90 backdrop-blur-sm border border-primary/20 shadow-lg">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
                Processing
              </span>
            </div>
          </div>
        )}

        {/* Toolbar */}
        {toolbar && (
          <div className="flex-shrink-0 border-b border-border/40 bg-background relative z-30">
            {toolbar}
          </div>
        )}

        {/* Scroll & Zoom Area */}
        <main
          ref={containerRef}
          className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-20"
        >
          <ScrollArea className="flex-1 w-full h-full relative scroll-smooth [&>[data-radix-scroll-area-viewport]]:scroll-smooth">
            <div className="py-24 px-20 flex justify-center min-h-full relative">
              {/* Crop Marks */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none opacity-[0.06]">
                <div className="absolute top-0 left-0 w-12 h-px bg-primary/40" />
                <div className="absolute top-0 left-0 w-px h-12 bg-primary/40" />
                <div className="absolute top-0 right-0 w-12 h-px bg-primary/40" />
                <div className="absolute top-0 right-0 w-px h-12 bg-primary/40" />
                <div className="absolute bottom-0 left-0 w-12 h-px bg-primary/40" />
                <div className="absolute bottom-0 left-0 w-px h-12 bg-primary/40" />
                <div className="absolute bottom-0 right-0 w-12 h-px bg-primary/40" />
                <div className="absolute bottom-0 right-0 w-px h-12 bg-primary/40" />
              </div>

              <div
                className="w-full max-w-5xl origin-top will-change-transform transition-transform duration-500 ease-[0.22,1,0.36,1]"
                style={{ transform: canvasTransform }}
              >
                {children}
              </div>
            </div>
          </ScrollArea>
        </main>

        {/* Zoom Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[40] opacity-60 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          <TooltipProvider delayDuration={200}>
            <div
              className="flex items-center gap-1 px-2 py-1.5 bg-background/80 backdrop-blur-sm border border-primary/20 rounded-full shadow-lg hover:bg-background/95 transition-colors"
              role="toolbar"
              aria-label="Zoom controls"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Zoom out"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                    onClick={onZoomOut}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Zoom Out</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onZoomReset}
                    aria-label="Reset zoom to 100%"
                    className="px-4 min-w-[4rem] text-center select-none border-x border-primary/10 mx-1 cursor-pointer rounded-lg hover:bg-primary/5 transition-colors focus:outline-none group/reset"
                  >
                    <span className="text-[10px] font-black tracking-[0.25em] text-primary/80 tabular-nums group-hover/reset:text-primary">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Reset Zoom</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Zoom in"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                    onClick={onZoomIn}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Zoom In</TooltipContent>
              </Tooltip>

              <div className="w-px h-5 bg-primary/10 mx-1" aria-hidden />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Reset viewport"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:rotate-180 duration-500"
                    onClick={onZoomReset}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Reset Viewport</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>
    );
  }
);

BuilderCanvas.displayName = 'BuilderCanvas';
