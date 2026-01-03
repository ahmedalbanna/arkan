
'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import { useEffect, useRef, useState } from 'react';

// The worker is now copied to the public static path by next.config.ts
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;


interface PdfPreviewProps {
    fileUri: string;
}

export function PdfPreview({ fileUri }: PdfPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pdf, setPdf] = useState<pdfjs.PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [scale, setScale] = useState(1.5);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadPdf() {
            setIsLoading(true);
            setError(null);
            try {
                const loadingTask = pdfjs.getDocument(fileUri);
                const loadedPdf = await loadingTask.promise;
                setPdf(loadedPdf);
                setNumPages(loadedPdf.numPages);
            } catch (e: any) {
                console.error('Failed to load PDF', e);
                setError('Failed to load PDF. The file may be corrupted.');
            } finally {
                setIsLoading(false);
            }
        }
        loadPdf();
    }, [fileUri]);

    useEffect(() => {
        if (!pdf) return;
        async function renderPage() {
            setIsLoading(true);
            try {
                const page = await pdf.getPage(currentPage);
                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current;
                if (canvas) {
                    const context = canvas.getContext('2d');
                    if (context) {
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        const renderContext = {
                            canvasContext: context,
                            viewport,
                        };
                        await page.render(renderContext).promise;
                    }
                }
            } catch (e: any) {
                console.error('Failed to render page', e);
                setError('Failed to render PDF page.');
            } finally {
                setIsLoading(false);
            }
        }
        renderPage();
    }, [pdf, currentPage, scale]);

    function goToPrevPage() {
        setCurrentPage(prev => Math.max(1, prev - 1));
    }

    function goToNextPage() {
        setCurrentPage(prev => Math.min(numPages, prev + 1));
    }

    if (error) {
        return <div className="p-4 text-center text-destructive">{error}</div>;
    }

    return (
        <div className="flex flex-col h-full items-center gap-2">
            <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-md w-full sticky top-0 z-10">
                <Button variant="outline" size="icon" onClick={goToPrevPage} disabled={currentPage <= 1 || isLoading}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">Page {currentPage} of {numPages}</span>
                <Button variant="outline" size="icon" onClick={goToNextPage} disabled={currentPage >= numPages || isLoading}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="flex-grow" />
                <Button variant="outline" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.2))} disabled={scale <= 0.5 || isLoading}>
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setScale(s => Math.min(3, s + 0.2))} disabled={scale >= 3 || isLoading}>
                    <ZoomIn className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-grow w-full relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                <ScrollArea className="h-full w-full">
                    <canvas ref={canvasRef} className="mx-auto" />
                </ScrollArea>
            </div>
        </div>
    );
}
