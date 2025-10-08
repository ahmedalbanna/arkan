
'use client';

import { AlertCircle, ChevronLeft, ChevronRight, Download, Loader2, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

// Dynamic import for PDF.js to handle potential loading issues
let pdfjs: any = null;

// Initialize PDF.js with error handling
const initializePdfJs = async () => {
    if (pdfjs) return pdfjs;

    try {
        // Try the main import first
        pdfjs = await import('pdfjs-dist');

        // Set up worker with fallback
        const workerSrc = `/_next/static/chunks/pdf.worker.mjs`;
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

        return pdfjs;
    } catch (error) {
        console.warn('Failed to load pdfjs-dist, trying legacy build:', error);

        try {
            // Fallback to legacy build
            pdfjs = await import('pdfjs-dist/build/pdf');
            pdfjs.GlobalWorkerOptions.workerSrc = `/_next/static/chunks/pdf.worker.mjs`;

            return pdfjs;
        } catch (legacyError) {
            console.error('Failed to load PDF.js from both main and legacy builds:', legacyError);
            throw new Error('PDF.js library could not be loaded. Please refresh the page.');
        }
    }
};

interface PdfPreviewProps {
    fileUri: string;
    fileName?: string;
    onError?: (error: string) => void;
    fallbackComponent?: React.ReactNode;
}

interface PdfState {
    pdf: any | null;
    currentPage: number;
    numPages: number;
    isLoading: boolean;
    isInitializing: boolean;
    scale: number;
    error: string | null;
    retryCount: number;
}

const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_SCALE = 1.5;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.2;

export function PdfPreview({
    fileUri,
    fileName = 'document.pdf',
    onError,
    fallbackComponent
}: PdfPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [state, setState] = useState<PdfState>({
        pdf: null,
        currentPage: 1,
        numPages: 0,
        isLoading: true,
        isInitializing: true,
        scale: INITIAL_SCALE,
        error: null,
        retryCount: 0,
    });

    // Error handling utility
    const handleError = useCallback((error: string, isRetryable: boolean = true) => {
        console.error('PDF Preview Error:', error);

        setState(prev => ({
            ...prev,
            error,
            isLoading: false,
            isInitializing: false,
        }));

        onError?.(error);
    }, [onError]);

    // Retry mechanism
    const retry = useCallback(async () => {
        if (state.retryCount >= MAX_RETRY_ATTEMPTS) {
            handleError('Maximum retry attempts reached. Please refresh the page or try a different file.', false);
            return;
        }

        setState(prev => ({
            ...prev,
            error: null,
            isLoading: true,
            retryCount: prev.retryCount + 1,
        }));

        try {
            await loadPdf();
        } catch (error) {
            handleError(`Retry attempt ${state.retryCount + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [state.retryCount]);

    // Load PDF with comprehensive error handling
    const loadPdf = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            // Initialize PDF.js
            const pdfjsLib = await initializePdfJs();

            // Validate file URI
            if (!fileUri) {
                throw new Error('No file URI provided');
            }

            // Create loading task with timeout
            const loadingTask = pdfjsLib.getDocument({
                url: fileUri,
                // Add timeout and other options for better error handling
                timeout: 30000, // 30 seconds timeout
                disableAutoFetch: false,
                disableStream: false,
            });

            // Handle loading progress
            loadingTask.onProgress = (progress: any) => {
                if (progress.total > 0) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`PDF loading progress: ${percent}%`);
                }
            };

            const loadedPdf = await loadingTask.promise;

            if (!loadedPdf || loadedPdf.numPages === 0) {
                throw new Error('Invalid PDF file or empty document');
            }

            setState(prev => ({
                ...prev,
                pdf: loadedPdf,
                numPages: loadedPdf.numPages,
                isLoading: false,
                isInitializing: false,
                error: null,
                retryCount: 0, // Reset retry count on success
            }));

        } catch (error: any) {
            let errorMessage = 'Failed to load PDF';

            if (error.name === 'InvalidPDFException') {
                errorMessage = 'Invalid PDF file format';
            } else if (error.name === 'MissingPDFException') {
                errorMessage = 'PDF file not found';
            } else if (error.name === 'UnexpectedResponseException') {
                errorMessage = 'Network error while loading PDF';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'PDF loading timed out. Please try again.';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'CORS error. Please check file permissions.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            handleError(errorMessage);
        }
    }, [fileUri, handleError]);

    // Render page with error handling
    const renderPage = useCallback(async () => {
        if (!state.pdf || !canvasRef.current) return;

        try {
            setState(prev => ({ ...prev, isLoading: true }));

            const page = await state.pdf.getPage(state.currentPage);
            const viewport = page.getViewport({ scale: state.scale });
            const canvas = canvasRef.current;

            if (!canvas) {
                throw new Error('Canvas element not available');
            }

            const context = canvas.getContext('2d');
            if (!context) {
                throw new Error('Canvas context not available');
            }

            // Set canvas dimensions
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            const renderContext = {
                canvasContext: context,
                viewport,
            };

            await page.render(renderContext).promise;

            setState(prev => ({ ...prev, isLoading: false }));

        } catch (error: any) {
            console.error('Failed to render PDF page:', error);
            handleError(`Failed to render page ${state.currentPage}: ${error.message}`);
        }
    }, [state.pdf, state.currentPage, state.scale, handleError]);

    // Effects
    useEffect(() => {
        loadPdf();
    }, [loadPdf]);

    useEffect(() => {
        if (state.pdf && !state.isInitializing) {
            renderPage();
        }
    }, [state.pdf, state.currentPage, state.scale, renderPage, state.isInitializing]);

    // Navigation handlers
    const goToPrevPage = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentPage: Math.max(1, prev.currentPage - 1)
        }));
    }, []);

    const goToNextPage = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentPage: Math.min(prev.numPages, prev.currentPage + 1)
        }));
    }, []);

    const zoomIn = useCallback(() => {
        setState(prev => ({
            ...prev,
            scale: Math.min(MAX_SCALE, prev.scale + SCALE_STEP)
        }));
    }, []);

    const zoomOut = useCallback(() => {
        setState(prev => ({
            ...prev,
            scale: Math.max(MIN_SCALE, prev.scale - SCALE_STEP)
        }));
    }, []);

    const resetZoom = useCallback(() => {
        setState(prev => ({ ...prev, scale: INITIAL_SCALE }));
    }, []);

    // Download handler
    const handleDownload = useCallback(() => {
        try {
            const link = document.createElement('a');
            link.href = fileUri;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download PDF:', error);
            handleError('Failed to download PDF file');
        }
    }, [fileUri, fileName, handleError]);

    // Error state with retry option
    if (state.error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {state.error}
                    </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                    {state.retryCount < MAX_RETRY_ATTEMPTS && (
                        <Button onClick={retry} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry ({state.retryCount}/{MAX_RETRY_ATTEMPTS})
                        </Button>
                    )}

                    <Button onClick={handleDownload} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
                </div>

                {fallbackComponent && (
                    <div className="mt-4">
                        {fallbackComponent}
                    </div>
                )}
            </div>
        );
    }

    // Loading state
    if (state.isInitializing) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                    {state.retryCount > 0 ? `Retrying... (${state.retryCount}/${MAX_RETRY_ATTEMPTS})` : 'Loading PDF...'}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full items-center gap-2">
            {/* Controls */}
            <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-md w-full sticky top-0 z-10">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPrevPage}
                    disabled={state.currentPage <= 1 || state.isLoading}
                    title="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm font-medium min-w-[120px] text-center">
                    Page {state.currentPage} of {state.numPages}
                </span>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextPage}
                    disabled={state.currentPage >= state.numPages || state.isLoading}
                    title="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                <div className="grow" />

                {/* Zoom controls */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={zoomOut}
                        disabled={state.scale <= MIN_SCALE || state.isLoading}
                        title="Zoom out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>

                    <span className="text-xs text-muted-foreground min-w-[40px] text-center">
                        {Math.round(state.scale * 100)}%
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={zoomIn}
                        disabled={state.scale >= MAX_SCALE || state.isLoading}
                        title="Zoom in"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetZoom}
                        disabled={state.isLoading}
                        title="Reset zoom"
                    >
                        Reset
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDownload}
                    title="Download PDF"
                >
                    <Download className="h-4 w-4" />
                </Button>
            </div>

            {/* PDF Content */}
            <div className="grow w-full relative">
                {state.isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                <ScrollArea className="h-full w-full">
                    <div className="flex justify-center p-4">
                        <canvas
                            ref={canvasRef}
                            className="border border-border rounded shadow-xs"
                            style={{ maxWidth: '100%', height: 'auto' }}
                        />
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
