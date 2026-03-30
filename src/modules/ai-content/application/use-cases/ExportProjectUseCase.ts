
import { inject, injectable } from "tsyringe";
import { 
    type IExportService, 
    IDocxExportServiceToken, 
    IPdfExportServiceToken, 
    IPptxExportServiceToken,
    type ExportOptions
} from "../../domain/services/IExportService";
import { Project, ProjectContent } from "@/modules/projects/domain/entities/Project";
import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";

export type ExportFormat = 'docx' | 'pdf' | 'pptx';

export interface ExportProjectInput {
    format: ExportFormat;
    project?: Project;
    selectedContent?: ProjectContent;
    markdown?: string;
    fileName?: string;
    options: ExportOptions;
}

@injectable()
export class ExportProjectUseCase {
    constructor(
        @inject(IDocxExportServiceToken)
        private docxService: IExportService,
        @inject(IPdfExportServiceToken)
        private pdfService: IExportService,
        @inject(IPptxExportServiceToken)
        private pptxService: IExportService
    ) {}

    async execute(input: ExportProjectInput): Promise<Result<Blob | Buffer, AIContentError>> {
        try {
            const service = this.getService(input.format);
            
            if (input.project && input.selectedContent) {
                // Handle project-based export
                const buffer = await service.export(input.project, input.selectedContent, input.options);
                return Result.ok(buffer);
            } else if (input.markdown && input.fileName) {
                // Handle direct markdown export
                // Note: Only docxService currently has exportFromMarkdown, others might need it too
                if (input.format === 'docx' && 'exportFromMarkdown' in (this.docxService as any)) {
                    const buffer = await (this.docxService as any).exportFromMarkdown(input.markdown, input.fileName, input.options);
                    return Result.ok(buffer);
                }
                
                // Fallback for others (might need implementation)
                return Result.fail(AIContentError.validation(`Direct markdown export not yet implemented for ${input.format}`));
            }

            return Result.fail(AIContentError.validation("Invalid export input: missing project/content or markdown/fileName"));
        } catch (error: any) {
            console.error(`ExportProjectUseCase Error (${input.format}):`, error);
            return Result.fail(AIContentError.internal(`Export failed: ${error.message}`));
        }
    }

    private getService(format: ExportFormat): IExportService {
        switch (format) {
            case 'docx': return this.docxService;
            case 'pdf': return this.pdfService;
            case 'pptx': return this.pptxService;
            default: throw new Error(`Unsupported export format: ${format}`);
        }
    }
}
