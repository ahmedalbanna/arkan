
import { injectable } from "tsyringe";
import { 
    IExportService, 
    ExportOptions 
} from "@/modules/ai-content/domain/services/IExportService";
import { Project, ProjectContent } from "@/modules/projects/domain/entities/Project";

@injectable()
export class PdfExportService implements IExportService {
    async export(project: Project, content: ProjectContent, options: ExportOptions): Promise<Blob | Buffer> {
        throw new Error("Method not implemented. PDF export currently uses element-based rendering on client.");
    }

    async exportFromMarkdown(markdown: string, fileName: string, options: ExportOptions): Promise<Blob | Buffer> {
        throw new Error("Method not implemented. PDF export currently uses element-based rendering on client.");
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
            console.error("Error generating PDF:", error);
            throw error;
        }
    }
}
