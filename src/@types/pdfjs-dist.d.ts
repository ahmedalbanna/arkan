// src/@types/pdfjs-dist.d.ts
declare module 'pdfjs-dist' {
    export interface GlobalWorkerOptions {
        workerSrc: string;
    }

    export interface PDFDocumentProxy {
        numPages: number;
        getPage(pageNumber: number): Promise<PDFPageProxy>;
    }

    export interface PDFPageProxy {
        getViewport(params: { scale: number }): PDFViewport;
        render(params: {
            canvasContext: CanvasRenderingContext2D;
            viewport: PDFViewport;
        }): { promise: Promise<void> };
    }

    export interface PDFViewport {
        width: number;
        height: number;
    }

    export interface PDFLoadingTask {
        promise: Promise<PDFDocumentProxy>;
    }

    export const GlobalWorkerOptions: GlobalWorkerOptions;
    export function getDocument(src: string): PDFLoadingTask;
}

declare module 'pdfjs-dist/build/pdf' {
    export * from 'pdfjs-dist';
}

declare module 'pdfjs-dist/legacy/build/pdf.worker.mjs';
