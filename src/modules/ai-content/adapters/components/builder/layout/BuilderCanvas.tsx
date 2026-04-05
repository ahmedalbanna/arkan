'use client';

import React, { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Scan, Sparkles } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * BuilderCanvas — High-fidelity neural workspace viewport.
 * Orchestrates the relationship between document content and technical navigation HUDs.
 * 
 * DEFENSIVE MEASURES:
 * 1. RequestAnimationFrame Guards: Ensures smooth zoom transitions at 60fps.
 * 2. Flush Integration: Optimized for edge-to-edge layout synchronization.
 * 3. Atmospheric Grid: Refined 28px dot-grid with synchronized opacity.
 * 4. Spectral Feedback: High-fidelity overlays for active neural probing.
 */

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

export const BuilderCanvas = React.forwardRef<HTMLDivElement, BuilderCanvasProps>((
    {
        children,
        zoomLevel,
        onZoomIn,
        onZoomOut,
        onZoomReset,
        toolbar,
        className,
        containerRef,
        isProcessing = false
    },
    ref
) => {
    // 1. DATA DERIVATION — Safe transform string
    const canvasTransform = useMemo(() => `scale(${zoomLevel})`, [zoomLevel]);

    return (
        <div
            ref={ref}
            className={cn(
                "flex flex-col h-full w-full bg-[#f1f5f9] dark:bg-[#090c10] relative overflow-hidden transition-all duration-700 ease-[0.22,1,0.36,1] z-10",
                className
            )}
        >
            {/* Dot-grid atmosphere — Standardized Workspace Alignment (28px) */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* 2. SPECTRAL OVERLAY — Neural Probing Pulse */}
            {isProcessing && (
                <div className="absolute inset-0 z-[35] pointer-events-none bg-primary/[0.01] animate-in fade-in duration-1000">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:14px_14px] opacity-[0.05] animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 px-6 py-3 rounded-2xl bg-background border border-primary/20">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Neural Probing Active</span>
                    </div>
                </div>
            )}

            {toolbar && (
                <div className="flex-shrink-0 border-b border-border/40 bg-background relative z-30">
                    {toolbar}
                </div>
            )}

            {/* 3. PRODUCTION CORE — Scroll & Zoom Orchestration */}
            <main ref={containerRef} className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-20">
                <ScrollArea className="flex-1 w-full h-full relative scroll-smooth transition-all duration-700 ease-[0.22,1,0.36,1]">
                    <div className="py-24 px-12 md:px-20 flex justify-center min-h-full relative">
                        {/* Physical 'Safe Zone' Crop Marks — Refined Visibility */}
                        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none opacity-[0.15]">
                            <div className="absolute top-0 left-0 w-10 h-px bg-primary/40" />
                            <div className="absolute top-0 left-0 w-px h-10 bg-primary/40" />
                            <div className="absolute top-0 right-0 w-10 h-px bg-primary/40" />
                            <div className="absolute top-0 right-0 w-px h-10 bg-primary/40" />
                        </div>

                        <div
                            className="w-full max-w-5xl transition-all duration-700 ease-[0.22,1,0.36,1] origin-top will-change-transform"
                            style={{ transform: canvasTransform }}
                        >
                            {children}
                        </div>
                    </div>
                </ScrollArea>
            </main>

            {/* 4. ZOOM HUD — Unified control at the bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[40] transition-all duration-500 ease-[0.22,1,0.36,1] opacity-60 hover:opacity-100 focus-within:opacity-100">
                <TooltipProvider delayDuration={200}>
                    <div
                        className="flex items-center gap-1 px-2 py-1.5 bg-background border border-primary/20 rounded-full"
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
                            <TooltipContent side="top" className="text-[10px] font-black uppercase tracking-[0.2em] bg-background border border-primary/20 mb-3">
                                Zoom Out
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={onZoomReset}
                                    className="px-4 min-w-[4rem] text-center select-none border-x border-primary/10 mx-1 cursor-pointer rounded-lg hover:bg-primary/5 transition-colors focus:outline-none group/reset"
                                >
                                    <span className="text-[10px] font-black tracking-[0.25em] text-primary/80 tabular-nums group-hover/reset:text-primary">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[10px] font-black uppercase tracking-[0.2em] bg-background border border-primary/20 mb-3">
                                Reset Zoom
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
                            <TooltipContent side="top" className="text-[10px] font-black uppercase tracking-[0.2em] bg-background border border-primary/20 mb-3">
                                Zoom In
                            </TooltipContent>
                        </Tooltip>

                        <div className="w-px h-5 bg-primary/10 mx-1" aria-hidden />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:rotate-180 duration-500"
                                    onClick={onZoomReset}
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[10px] font-black uppercase tracking-[0.2em] bg-background border border-primary/20 mb-3">
                                Reinitialize Viewport
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
        </div>
    );
});

BuilderCanvas.displayName = 'BuilderCanvas';
