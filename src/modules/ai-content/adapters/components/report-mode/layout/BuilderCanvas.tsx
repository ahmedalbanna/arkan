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

export const BuilderCanvas = React.forwardRef<any, BuilderCanvasProps>(({
    children,
    zoomLevel,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    floatingElements
}, ref) => {
    return (
        <ResizablePanel 
            ref={ref}
            defaultSize={50}
            minSize={30}
            className="flex flex-col min-h-0 bg-muted/5 relative overflow-hidden group/canvas transition-all duration-700 ease-[0.22,1,0.36,1] z-10"
        >
            {/* Immersive Matrix Layer */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/60 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/20 to-transparent pointer-events-none z-10" />

            <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-20">
                <Suspense fallback={<BuilderPageSkeleton />}>
                    <div className="flex-1 overflow-auto custom-scrollbar transition-all duration-700 ease-[0.22,1,0.36,1]">
                        {children}
                    </div>
                </Suspense>
            </main>

            {/* Floating Contextual Layers */}
            {floatingElements}

            {/* Contextual Zoom HUD */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 opacity-0 group-hover/canvas:opacity-100 transition-all duration-700 translate-y-4 group-hover/canvas:translate-y-0">
                <div className="flex items-center gap-1.5 p-1.5 bg-background/40 backdrop-blur-2xl border border-border/40 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] ring-1 ring-white/10">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group/zoom-btn"
                                    onClick={onZoomOut}
                                >
                                    <ZoomOut className="h-4 w-4 transition-transform group-active/zoom-btn:scale-90" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mb-2">Reduce Scale</TooltipContent>
                        </Tooltip>

                        <div className="px-4 min-w-[4.5rem] text-center select-none border-x border-primary/5 mx-1">
                            <span className="text-[10px] font-black tracking-[0.3em] text-foreground/80 tabular-nums">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                        </div>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group/zoom-btn"
                                    onClick={onZoomIn}
                                >
                                    <ZoomIn className="h-4 w-4 transition-transform group-active/zoom-btn:scale-90" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mb-2">Increase Scale</TooltipContent>
                        </Tooltip>

                        <div className="w-px h-4 bg-primary/10 mx-1.5" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group/zoom-btn"
                                    onClick={onZoomReset}
                                >
                                    <RotateCcw className="h-3.5 w-3.5 transition-transform group-active/zoom-btn:rotate-180 duration-500" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mb-2">Normalize View</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </ResizablePanel>
    );
});

BuilderCanvas.displayName = 'BuilderCanvas';
