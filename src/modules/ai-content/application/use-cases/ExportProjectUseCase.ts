
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
                const result = await service.export(input.project, input.selectedContent, input.options);
                if (result.isFailure) {
                    return Result.fail(AIContentError.internal(result.error?.message || 'Synthesis failed'));
                }
                return Result.ok(result.getValue());
            } else if (input.markdown && input.fileName) {
                // Handle direct markdown export
                const result = await service.exportFromMarkdown(input.markdown, input.fileName, input.options);
                if (result.isFailure) {
                    return Result.fail(AIContentError.internal(result.error?.message || 'Transformation failed'));
                }
                return Result.ok(result.getValue());
            }

            return Result.fail(AIContentError.validation("Invalid export input: missing project/content or markdown/fileName"));
        } catch (error: any) {
            console.error(`ExportProjectUseCase Error (${input.format}):`, error);
            return Result.fail(AIContentError.internal(`Export pipeline failure: ${error.message}`));
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
