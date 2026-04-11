'use client';

import { AtmosphericGrid } from '@/components/shared/AtmosphericGrid';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { RotateCcw, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

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
  isDesktop?: boolean;
}

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
      isDesktop = false,
    },
    ref
  ) => {
    const canvasTransform = useMemo(() => `scale(${zoomLevel})`, [zoomLevel]);
    const [isHoveringZoom, setIsHoveringZoom] = useState(false);

    // Desktop zoom wheel support
    useEffect(() => {
      if (!isDesktop) return;

      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (e.deltaY < 0) {
            onZoomIn();
          } else if (e.deltaY > 0) {
            onZoomOut();
          }
        }
      };

      const container = containerRef?.current;
      if (container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
      }
    }, [isDesktop, onZoomIn, onZoomOut, containerRef]);

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full w-full bg-[#f1f5f9] dark:bg-[#090c10] relative overflow-hidden transition-all duration-700 ease-[0.22,1,0.36,1] z-10',
          // Desktop optimizations
          isDesktop && 'transform-gpu will-change-transform',
          className
        )}
      >
        {/* Background Grid - Reduced detail for desktop performance */}
        <AtmosphericGrid opacity={isDesktop ? 0.02 : 0.03} size={isDesktop ? 32 : 28} />

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-[35] pointer-events-none bg-primary/[0.01] animate-in fade-in duration-1000">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:14px_14px] opacity-[0.05] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 px-6 py-3 rounded-2xl bg-background/90 backdrop-blur-sm border border-primary/20 shadow-lg">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
                Processing Active
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
          <ScrollArea
            className={cn(
              "flex-1 w-full h-full relative scroll-smooth transition-all duration-700 ease-[0.22,1,0.36,1]",
              // Desktop optimizations
              isDesktop && "[&>[data-radix-scroll-area-viewport]]:scroll-smooth"
            )}
          >
            <div className={cn(
              "py-24 flex justify-center min-h-full relative",
              isDesktop ? "px-20" : "px-12 md:px-20"
            )}>
              {/* Visual Crop Marks - Only show on desktop */}
              {isDesktop && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none opacity-[0.08]">
                  <div className="absolute top-0 left-0 w-12 h-px bg-primary/40" />
                  <div className="absolute top-0 left-0 w-px h-12 bg-primary/40" />
                  <div className="absolute top-0 right-0 w-12 h-px bg-primary/40" />
                  <div className="absolute top-0 right-0 w-px h-12 bg-primary/40" />
                  <div className="absolute bottom-0 left-0 w-12 h-px bg-primary/40" />
                  <div className="absolute bottom-0 left-0 w-px h-12 bg-primary/40" />
                  <div className="absolute bottom-0 right-0 w-12 h-px bg-primary/40" />
                  <div className="absolute bottom-0 right-0 w-px h-12 bg-primary/40" />
                </div>
              )}

              <div
                className={cn(
                  "w-full max-w-5xl transition-all duration-700 ease-[0.22,1,0.36,1] origin-top will-change-transform",
                  // Smoother zoom on desktop
                  isDesktop && "backface-visibility-hidden"
                )}
                style={{ transform: canvasTransform }}
              >
                {children}
              </div>
            </div>
          </ScrollArea>
        </main>

        {/* Zoom Controls HUD - Enhanced for desktop */}
        <div
          className={cn(
            "absolute bottom-8 left-1/2 -translate-x-1/2 z-[40] transition-all duration-500 ease-[0.22,1,0.36,1]",
            isDesktop && [
              "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
              "hover:opacity-100",
              isHoveringZoom && "opacity-100"
            ],
            !isDesktop && "opacity-60 hover:opacity-100 focus-within:opacity-100"
          )}
          onMouseEnter={() => setIsHoveringZoom(true)}
          onMouseLeave={() => setIsHoveringZoom(false)}
        >
          <TooltipProvider delayDuration={200}>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-full shadow-lg",
                isDesktop && "bg-background/80 hover:bg-background/95 transition-colors"
              )}
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
                <TooltipContent side="top" className="text-xs">
                  Zoom Out <kbd className="ml-2 text-[10px]">⌘-</kbd>
                </TooltipContent>
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
                <TooltipContent side="top" className="text-xs">
                  Reset Zoom <kbd className="ml-2 text-[10px]">⌘0</kbd>
                </TooltipContent>
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
                <TooltipContent side="top" className="text-xs">
                  Zoom In <kbd className="ml-2 text-[10px]">⌘=</kbd>
                </TooltipContent>
              </Tooltip>

              <div className="w-px h-5 bg-primary/10 mx-1" aria-hidden />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Reset to default view"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:rotate-180 duration-500"
                    onClick={onZoomReset}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Reset Viewport
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Desktop Keyboard Shortcuts Hint */}
        {isDesktop && !isHoveringZoom && (
          <div className="absolute bottom-4 right-4 z-[40] opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="text-[9px] font-mono text-muted-foreground/40 bg-background/50 backdrop-blur-sm px-2 py-1 rounded">
              ⌘ + scroll to zoom
            </div>
          </div>
        )}
      </div>
    );
  }
);

BuilderCanvas.displayName = 'BuilderCanvas';
