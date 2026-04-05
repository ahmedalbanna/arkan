import { injectable } from "tsyringe";
import { 
    IExportService, 
    ExportOptions 
} from "@/modules/ai-content/domain/services/IExportService";
import { Project, ProjectContent } from "@/modules/projects/domain/entities/Project";
import { Result } from "@/infrastructure/utils/result";

/**
 * PdfExportService — Document synthesis for PDF formats.
 * Currently serves as a placeholder for server-side PDF generation logic.
 * 
 * DEFENSIVE MEASURES:
 * 1. Result Pattern: Complies with IExportService result vectors.
 * 2. Fallback Logic: Explicitly directs consumers to client-side rendering for PDF.
 */

@injectable()
export class PdfExportService implements IExportService {
    async export(project: Project, content: ProjectContent, options: ExportOptions): Promise<Result<Blob | Buffer, Error>> {
        return Result.fail(new Error("PDF export currently requires client-side element-based rendering."));
    }

    async exportFromMarkdown(markdown: string, fileName: string, options: ExportOptions): Promise<Result<Blob | Buffer, Error>> {
        return Result.fail(new Error("PDF export currently requires client-side element-based rendering."));
    }

    async exportFromElement(element: HTMLElement, filename: string): Promise<void> {
        const { default: html2canvas } = await import('html2canvas');
        const { default: jsPDF } = await import('jspdf');

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;

            let newCanvasWidth = pdfWidth;
            let newCanvasHeight = newCanvasWidth / ratio;

            if (newCanvasHeight > pdfHeight) {
                newCanvasHeight = pdfHeight;
                newCanvasWidth = newCanvasHeight * ratio;
            }

            const x = (pdfWidth - newCanvasWidth) / 2;
            const y = (pdfHeight - newCanvasHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, newCanvasWidth, newCanvasHeight);
            pdf.save(filename);
        } catch (error) {
            console.error("[Export:PDF] Client-side generation failed:", error);
            throw error;
        }
    }
}
