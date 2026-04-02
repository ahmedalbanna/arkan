'use client';

import React, { Suspense } from 'react';
import { ResizablePanel } from '@/components/ui/resizable';
import { BuilderPageSkeleton } from '@/app/builder/loading';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface BuilderCanvasProps {
    children: React.ReactNode;
    zoomLevel: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
    floatingElements?: React.ReactNode;
}

export const BuilderCanvas = React.forwardRef<any, BuilderCanvasProps>((
    {
        children,
        zoomLevel,
        onZoomIn,
        onZoomOut,
        onZoomReset,
        floatingElements,
    },
    ref
) => {
    return (
        <ResizablePanel
            ref={ref}
            defaultSize={50}
            minSize={30}
            className="flex flex-col min-h-0 bg-muted/5 relative overflow-hidden transition-all duration-700 ease-[0.22,1,0.36,1] z-10"
        >
            {/* Subtle dot-grid atmosphere */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* Top ambient gradient — frames the top edge softly */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/50 to-transparent pointer-events-none z-10" />

            {/* Bottom ambient gradient — softens the lower edge */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/15 to-transparent pointer-events-none z-10" />

            {/* Inner vignette ring — frames the canvas like a viewport */}
            <div
                className="absolute inset-0 pointer-events-none z-10 rounded-[inherit]"
                style={{ boxShadow: 'inset 0 0 60px 0 hsl(var(--background) / 0.25)' }}
            />

            {/* Primary content area */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-20">
                <Suspense fallback={<BuilderPageSkeleton />}>
                    <div className="flex-1 overflow-auto custom-scrollbar transition-all duration-700 ease-[0.22,1,0.36,1]">
                        {children}
                    </div>
                </Suspense>
            </main>

            {/* Floating contextual layers (e.g. FloatingOutline) */}
            {floatingElements}

            {/* Zoom HUD — always visible at reduced opacity, brightens on hover */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 opacity-50 hover:opacity-100 focus-within:opacity-100">
                <TooltipProvider delayDuration={200}>
                    <div
                        className="flex items-center gap-0.5 px-1.5 py-1.5 bg-background/70 backdrop-blur-2xl border border-border/30 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.10)] ring-1 ring-white/[0.06]"
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
                                    <ZoomOut className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="top"
                                className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mb-2"
                            >
                                Zoom Out <span className="opacity-50 ml-1 font-normal normal-case tracking-normal">Ctrl −</span>
                            </TooltipContent>
                        </Tooltip>

                        {/* Zoom percentage — click to reset */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={onZoomReset}
                                    aria-label={`Current zoom: ${Math.round(zoomLevel * 100)}%. Click to reset.`}
                                    className="px-3.5 min-w-[3.75rem] text-center select-none border-x border-primary/10 mx-0.5 cursor-pointer rounded-sm hover:bg-primary/5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
                                >
                                    <span className="text-[10px] font-black tracking-[0.25em] text-foreground/75 tabular-nums">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="top"
                                className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mb-2"
                            >
                                Reset Zoom <span className="opacity-50 ml-1 font-normal normal-case tracking-normal">Ctrl 0</span>
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
                                    <ZoomIn className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="top"
                                className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mb-2"
                            >
                                Zoom In <span className="opacity-50 ml-1 font-normal normal-case tracking-normal">Ctrl +</span>
                            </TooltipContent>
                        </Tooltip>

                        {/* Divider */}
                        <div className="w-px h-4 bg-border/40 mx-1" aria-hidden />

                        {/* Reset button (explicit icon) */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Reset zoom to 100%"
                                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:rotate-180 duration-500"
                                    onClick={onZoomReset}
                                >
                                    <RotateCcw className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="top"
                                className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mb-2"
                            >
                                Reset to 100%
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
        </ResizablePanel>
    );
});

BuilderCanvas.displayName = 'BuilderCanvas';
