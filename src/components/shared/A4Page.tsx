'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { PROSE_CLASSES } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import {
    BookOpen,
    Eye,
    Layers,
    Layout,
    LayoutGrid,
    Maximize2,
    Minimize2,
    Printer,
    RotateCcw,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface A4PageProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    viewMode?: 'single' | 'continuous' | 'carousel';
    onViewModeChange?: (mode: 'single' | 'continuous' | 'carousel') => void;
    showControls?: boolean;
    defaultZoom?: number;
    pageNumber?: number;
    totalPages?: number;
}

export const A4Page = ({
    children,
    title,
    className,
    viewMode = 'single',
    onViewModeChange,
    showControls = true,
    defaultZoom = 1,
    pageNumber = 1,
    totalPages = 1
}: A4PageProps) => {
    const isMobile = useMobile();
    const isDesktop = !isMobile;
    const [zoomLevel, setZoomLevel] = useState(defaultZoom);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHoveringControls, setIsHoveringControls] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Zoom handlers
    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev + 0.1, 2));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    }, []);

    const handleZoomReset = useCallback(() => {
        setZoomLevel(1);
    }, []);

    // Fullscreen handlers
    const handleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            try {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } catch (err) {
                console.error('Fullscreen error:', err);
            }
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, [isFullscreen]);

    // Listen for fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isDesktop || !showControls) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + + to zoom in
            if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                handleZoomIn();
            }
            // Ctrl/Cmd + - to zoom out
            if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault();
                handleZoomOut();
            }
            // Ctrl/Cmd + 0 to reset zoom
            if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault();
                handleZoomReset();
            }
            // Ctrl/Cmd + Shift + F for fullscreen
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                handleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDesktop, showControls, handleZoomIn, handleZoomOut, handleZoomReset, handleFullscreen]);

    // Handle print
    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    // Zoom scale with fallback
    const zoomScale = zoomLevel;

    // View mode icons
    const viewModeConfig = {
        single: { icon: Layout, label: 'Single Page', shortcut: '1' },
        continuous: { icon: BookOpen, label: 'Continuous Scroll', shortcut: '2' },
        carousel: { icon: LayoutGrid, label: 'Carousel View', shortcut: '3' }
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative",
                isFullscreen && "fixed inset-0 z-50 bg-background",
                viewMode === 'continuous' && "overflow-y-auto"
            )}
        >
            {/* Controls Overlay - Desktop */}
            {isDesktop && showControls && (
                <div
                    className={cn(
                        "fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300",
                        isHoveringControls ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                        "print:hidden"
                    )}
                    onMouseEnter={() => setIsHoveringControls(true)}
                    onMouseLeave={() => setIsHoveringControls(false)}
                >
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-background/90 backdrop-blur-xl border border-primary/20 rounded-full shadow-2xl">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-0.5 px-1 border-r border-primary/10">
                            {Object.entries(viewModeConfig).map(([mode, config]) => (
                                <TooltipProvider key={mode}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onViewModeChange?.(mode as any)}
                                                className={cn(
                                                    "h-8 w-8 rounded-lg transition-all",
                                                    viewMode === mode && "bg-primary/10 text-primary"
                                                )}
                                            >
                                                <config.icon className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-[9px]">
                                            {config.label} • {config.shortcut}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-0.5 px-1 border-r border-primary/10">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleZoomOut}
                                            className="h-8 w-8 rounded-lg"
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[9px]">
                                        Zoom Out • ⌘-
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={handleZoomReset}
                                            className="min-w-[48px] text-center text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                                        >
                                            {Math.round(zoomLevel * 100)}%
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[9px]">
                                        Reset Zoom • ⌘0
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleZoomIn}
                                            className="h-8 w-8 rounded-lg"
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[9px]">
                                        Zoom In • ⌘+
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Utility Controls */}
                        <div className="flex items-center gap-0.5 px-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleFullscreen}
                                            className="h-8 w-8 rounded-lg"
                                        >
                                            {isFullscreen ? (
                                                <Minimize2 className="h-4 w-4" />
                                            ) : (
                                                <Maximize2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[9px]">
                                        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} • ⌘⇧F
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handlePrint}
                                            className="h-8 w-8 rounded-lg"
                                        >
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[9px]">
                                        Print
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                            className="h-8 w-8 rounded-lg"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[9px]">
                                        Scroll to Top
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Container */}
            <div
                ref={pageRef}
                className={cn(
                    "relative group bg-background transition-all duration-500 ease-out",
                    viewMode !== 'carousel' && 'shadow-[0_0_80px_-20px_rgba(0,0,0,0.15),0_0_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_0_100px_-20px_rgba(0,0,0,0.2)] my-8 rounded-sm',
                    viewMode === 'single' && 'w-full max-w-[210mm] min-h-[297mm] box-border border border-border/40 dark:border-border/20 mx-auto',
                    viewMode === 'continuous' && 'w-full max-w-5xl shadow-none border-none rounded-none p-0 mx-auto',
                    viewMode === 'carousel' && 'w-full h-full shadow-2xl box-border border border-border/40 dark:border-border/20',
                    isFullscreen && 'my-0 rounded-none',
                    className
                )}
                style={{
                    transform: viewMode !== 'continuous' ? `scale(${zoomScale})` : 'none',
                    transformOrigin: 'top center',
                }}
            >
                {/* Technical Crop Marks */}
                {viewMode === 'single' && (
                    <>
                        <div className="absolute top-4 left-4 w-8 h-px bg-primary/10" />
                        <div className="absolute top-4 left-4 w-px h-8 bg-primary/10" />
                        <div className="absolute top-4 right-4 w-8 h-px bg-primary/10" />
                        <div className="absolute top-4 right-4 w-px h-8 bg-primary/10" />
                        <div className="absolute bottom-4 left-4 w-8 h-px bg-primary/10" />
                        <div className="absolute bottom-4 left-4 w-px h-8 bg-primary/10" />
                        <div className="absolute bottom-4 right-4 w-8 h-px bg-primary/10" />
                        <div className="absolute bottom-4 right-4 w-px h-8 bg-primary/10" />
                    </>
                )}

                {/* Premium Lighting Gradient */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.02] via-transparent to-black/[0.01] dark:from-white/[0.01] dark:to-transparent" />

                {/* Page Edge Decoration */}
                <div className="absolute inset-0 pointer-events-none border-[0.5px] border-black/5 dark:border-white/5 rounded-sm ring-1 ring-black/[0.02] dark:ring-white/[0.02]" />

                {/* Page Number Indicator - Desktop */}
                {isDesktop && totalPages > 1 && viewMode === 'single' && (
                    <div className="absolute -right-12 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
                        <div className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground/30">
                            <Layers className="h-3 w-3" />
                            <span>{pageNumber} / {totalPages}</span>
                        </div>
                    </div>
                )}

                {/* Title Section */}
                {title && (
                    <div className="relative mb-12 group/title px-8 pt-8">
                        <div className="flex items-center gap-3 mb-2 opacity-40 group-hover/title:opacity-100 transition-opacity duration-500">
                            <div className="h-px w-6 bg-primary/40" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Node Identity</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black font-headline text-foreground tracking-tighter leading-none mb-4">
                            {title}
                        </h2>
                        <div className="h-1.5 w-16 bg-gradient-to-r from-primary via-primary/60 to-transparent rounded-full group-hover/title:w-32 transition-all duration-700 ease-in-out" />
                    </div>
                )}

                {/* Content Area */}
                <div className={cn(
                    PROSE_CLASSES,
                    "flex-grow min-h-0 overflow-visible selection:bg-primary/20",
                    title ? "px-8 pb-8" : "p-8"
                )}>
                    {children || (
                        <div className="flex flex-col items-center justify-center py-32 opacity-20 italic text-[11px] font-medium tracking-widest uppercase">
                            <Eye className="h-12 w-12 mb-4 opacity-30" />
                            Zero payload detected in document core.
                        </div>
                    )}
                </div>

                {/* Page Footer */}
                <div className="mt-8 pt-6 pb-8 px-8 border-t border-border/40 flex justify-between items-end text-[8px] md:text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors duration-500">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(var(--primary),0.4)]" />
                            <span className="tracking-[0.25em]">Arkan Neural Suite</span>
                        </div>
                        <span className="opacity-40 font-bold ml-3.5 tracking-widest text-[7px] md:text-[8px]">
                            Manifest v2.5.0-STABLE
                        </span>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                        <span className="opacity-40 font-bold tracking-widest text-[7px] md:text-[8px]">
                            {viewMode.toUpperCase()} MODE
                        </span>
                        <div className="px-2 md:px-3 py-1 bg-muted/20 border border-border/40 rounded-lg min-w-[40px] md:min-w-[44px] text-center tabular-nums shadow-inner text-[9px] md:text-[10px]">
                            {String(pageNumber).padStart(2, '0')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Zoom Indicator - Desktop */}
            {isDesktop && showControls && zoomLevel !== 1 && !isHoveringControls && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-mono text-muted-foreground/60 border border-primary/10">
                        {Math.round(zoomLevel * 100)}% • Click to reset
                    </div>
                </div>
            )}
        </div>
    );
};

export default A4Page;
