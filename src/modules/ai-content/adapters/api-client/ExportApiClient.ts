import { injectable } from "tsyringe";
import { 
    IExportService, 
    ExportOptions 
} from "@/modules/ai-content/domain/services/IExportService";
import { Project, ProjectContent } from "@/modules/projects/domain/entities/Project";
import { Result } from "@/infrastructure/utils/result";
import { apiService } from "@/infrastructure/api/ApiService";

/**
 * ExportApiClient — Client-side implementation of IExportService.
 * Delegates document synthesis to the server-side export API nodes.
 * 
 * DEFENSIVE MEASURES:
 * 1. Result Pattern: Transitions API responses into structured success/failure vectors.
 * 2. Network Containment: Wraps fetch operations in try-catch blocks.
 * 3. Type Safety: Ensures project metadata is correctly serialized for transmission.
 */

@injectable()
export class ExportApiClient implements IExportService {
    constructor(private format: 'docx' | 'pptx') {}

    async export(project: Project, content: ProjectContent, options: ExportOptions): Promise<Result<Blob | Buffer, Error>> {
        try {
            const response = await apiService({
                endpoint: `/api/export/${this.format}`,
                method: 'POST',
                data: {
                    project: project.toProperties(),
                    selectedContent: content.map(item => item.toProperties()),
                    options
                },
                responseType: 'blob'
            });

            if (!response) {
                throw new Error(`The ${this.format.toUpperCase()} export pipeline returned an empty payload.`);
            }

            return Result.ok(response as Blob);
        } catch (error) {
            console.error(`[ExportApiClient:${this.format.toUpperCase()}] Transmission failure:`, error);
            return Result.fail(error instanceof Error ? error : new Error(`Failed to initialize ${this.format.toUpperCase()} synthesis.`));
        }
    }

    async exportFromMarkdown(markdown: string, fileName: string, options: ExportOptions): Promise<Result<Blob | Buffer, Error>> {
        try {
            const response = await apiService({
                endpoint: `/api/export/${this.format}`,
                method: 'POST',
                data: {
                    markdown,
                    fileName,
                    options
                },
                responseType: 'blob'
            });

            if (!response) {
                throw new Error(`The ${this.format.toUpperCase()} markdown transformation returned an empty payload.`);
            }

            return Result.ok(response as Blob);
        } catch (error) {
            console.error(`[ExportApiClient:${this.format.toUpperCase()}] Markdown transformation failure:`, error);
            return Result.fail(error instanceof Error ? error : new Error(`Failed to transform markdown to ${this.format.toUpperCase()}.`));
        }
    }
}

@injectable()
export class DocxExportApiClient extends ExportApiClient {
    constructor() {
        super('docx');
    }
}

@injectable()
export class PptxExportApiClient extends ExportApiClient {
    constructor() {
        super('pptx');
    }
}
