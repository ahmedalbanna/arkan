'use client';

import React, { Suspense } from 'react';
import { BuilderPageSkeleton } from '@/app/builder/loading';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BuilderCanvasProps {
    children: React.ReactNode;
    zoomLevel: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
    toolbar?: React.ReactNode;
    className?: string;
    containerRef?: React.RefObject<HTMLDivElement>;
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
    },
    ref
) => {
    return (
        <div
            ref={ref}
            className={cn(
                "flex flex-col h-full w-full bg-[#f8fafc] dark:bg-[#0f172a] relative overflow-hidden transition-all duration-700 ease-[0.22,1,0.36,1] z-10",
                className
            )}
        >
            {/* Subtle dot-grid atmosphere — Aligned with Intelligence Suite standard */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* Ambient gradients for depth */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/40 to-transparent pointer-events-none z-[15]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/15 to-transparent pointer-events-none z-[15]" />

            {/* Inner vignette viewport framing */}
            <div
                className="absolute inset-0 pointer-events-none z-[15] rounded-[inherit]"
                style={{ boxShadow: 'inset 0 0 80px 0 hsl(var(--background) / 0.35)' }}
            />

            {toolbar && (
                <div className="flex-shrink-0 border-b border-border/40 bg-background/70 backdrop-blur-xl">
                    {toolbar}
                </div>
            )}

            {/* Primary content area with unified scroll and zoom handling */}
            <main ref={containerRef} className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-20">
                <Suspense fallback={<BuilderPageSkeleton />}>
                    <ScrollArea className="flex-1 w-full h-full relative scroll-smooth transition-all duration-700 ease-[0.22,1,0.36,1]">
                        <div className="py-24 px-8 flex justify-center min-h-full">
                            <div
                                className="w-full max-w-5xl transition-all duration-700 ease-[0.22,1,0.36,1] origin-top"
                                style={{ transform: `scale(${zoomLevel})` }}
                            >
                                {children}
                            </div>
                        </div>
                    </ScrollArea>
                </Suspense>
            </main>

            {/* Zoom HUD — Unified control at the bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 opacity-60 hover:opacity-100 focus-within:opacity-100">
                <TooltipProvider delayDuration={200}>
                    <div
                        className="flex items-center gap-1 px-2 py-1.5 bg-background/70 backdrop-blur-3xl border border-primary/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/10"
                        role="toolbar"
                        aria-label="Zoom controls"
                    >
                        {/* Zoom Out */}
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
                            <TooltipContent
                                side="top"
                                className="text-[10px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mb-3"
                            >
                                Zoom Out <span className="opacity-50 ml-1.5 font-normal normal-case tracking-normal">Ctrl −</span>
                            </TooltipContent>
                        </Tooltip>

                        {/* Zoom percentage HUD — Technical typography */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={onZoomReset}
                                    aria-label={`Current zoom: ${Math.round(zoomLevel * 100)}%. Click to reset.`}
                                    className="px-4 min-w-[4rem] text-center select-none border-x border-primary/10 mx-1 cursor-pointer rounded-lg hover:bg-primary/5 transition-colors focus:outline-none"
                                >
                                    <span className="text-[10px] font-black tracking-[0.25em] text-primary/80 tabular-nums">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="top"
                                className="text-[10px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mb-3"
                            >
                                Reset Zoom <span className="opacity-50 ml-1.5 font-normal normal-case tracking-normal">Ctrl 0</span>
                            </TooltipContent>
                        </Tooltip>

                        {/* Zoom In */}
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
                            <TooltipContent
                                side="top"
                                className="text-[10px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mb-3"
                            >
                                Zoom In <span className="opacity-50 ml-1.5 font-normal normal-case tracking-normal">Ctrl +</span>
                            </TooltipContent>
                        </Tooltip>

                        {/* Divider */}
                        <div className="w-px h-5 bg-primary/10 mx-1" aria-hidden />

                        {/* Hard Reset Icon */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Reset zoom to 100%"
                                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:rotate-180 duration-500"
                                    onClick={onZoomReset}
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="top"
                                className="text-[10px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mb-3"
                            >
                                Reset to 100%
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
        </div>
    );
});

BuilderCanvas.displayName = 'BuilderCanvas';
