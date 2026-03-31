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
}

export const BuilderCanvas = React.forwardRef<any, BuilderCanvasProps>(({
    children,
    zoomLevel,
    onZoomIn,
    onZoomOut,
    onZoomReset
}, ref) => {
    return (
        <ResizablePanel 
            ref={ref}
            defaultSize={50} 
            className="flex flex-col min-h-0 bg-muted/10 relative overflow-hidden group/canvas"
        >
            {/* Background Texture & Depth */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)', backgroundSize: '48px 48px' }} />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/40 to-transparent pointer-events-none z-10" />

            <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-20">
                <Suspense fallback={<BuilderPageSkeleton />}>
                    <div className="flex-1 overflow-auto custom-scrollbar transition-all duration-700 ease-in-out">
                        {children}
                    </div>
                </Suspense>
            </main>

            {/* Contextual Zoom HUD */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover/canvas:opacity-100 transition-all duration-500 translate-y-4 group-hover/canvas:translate-y-0">
                <div className="flex items-center gap-1 p-1.5 bg-background/60 backdrop-blur-xl border border-primary/10 rounded-2xl shadow-2xl shadow-primary/5">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    onClick={onZoomOut}
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[10px] font-black uppercase tracking-widest bg-background/95 backdrop-blur-md border-primary/20">Zoom Out</TooltipContent>
                        </Tooltip>

                        <div className="px-3 min-w-[4rem] text-center select-none">
                            <span className="text-[10px] font-black tracking-[0.2em] text-foreground tabular-nums">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                        </div>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    onClick={onZoomIn}
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[10px] font-black uppercase tracking-widest bg-background/95 backdrop-blur-md border-primary/20">Zoom In</TooltipContent>
                        </Tooltip>

                        <div className="w-px h-4 bg-primary/10 mx-1" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    onClick={onZoomReset}
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[10px] font-black uppercase tracking-widest bg-background/95 backdrop-blur-md border-primary/20">Reset Focus</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </ResizablePanel>
    );
});

BuilderCanvas.displayName = 'BuilderCanvas';
