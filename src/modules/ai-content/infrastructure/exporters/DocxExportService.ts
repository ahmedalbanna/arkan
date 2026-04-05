import { injectable } from "tsyringe";
import { 
    IExportService, 
    ExportOptions 
} from "@/modules/ai-content/domain/services/IExportService";
import { Project, ProjectContent } from "@/modules/projects/domain/entities/Project";
import type { ConversionOptions } from "@/modules/ai-content/domain/types/export-types";
import { convertMarkdownToWord } from "./MarkdownToWordConverter";
import { Result } from "@/infrastructure/utils/result";

/**
 * DocxExportService — Production-grade document synthesis for Microsoft Word.
 * Orchestrates the conversion of project AST nodes into professional DOCX manifests.
 * 
 * DEFENSIVE MEASURES:
 * 1. Result Pattern: Transitions return types to structured success/failure vectors.
 * 2. Containment: Wraps the AST-to-Docx pipeline in try-catch blocks.
 * 3. Validation: Ensures only valid domain entities are passed to the converter.
 */

@injectable()
export class DocxExportService implements IExportService {
    async export(project: Project, content: ProjectContent, options: ExportOptions): Promise<Result<Blob | Buffer, Error>> {
        try {
            // Defensive: Validate project and content integrity
            if (!project || !Array.isArray(content) || content.length === 0) {
                return Result.fail(new Error("Document manifest contains zero valid content nodes."));
            }

            const docxOptions: ConversionOptions & { selectedContent?: ProjectContent } = {
                ...(options as ConversionOptions),
                selectedContent: content,
            };

            const result = await convertMarkdownToWord(project, docxOptions);
            return Result.ok(result);
        } catch (error) {
            console.error('[Export:DOCX] Generation pipeline failure:', error);
            return Result.fail(error instanceof Error ? error : new Error('Unknown DOCX synthesis failure'));
        }
    }

    async exportFromMarkdown(markdown: string, fileName: string, options: ExportOptions): Promise<Result<Blob | Buffer, Error>> {
        try {
            if (!markdown || !markdown.trim()) {
                return Result.fail(new Error("Markdown vector is empty."));
            }

            const result = await convertMarkdownToWord(markdown, fileName, options as ConversionOptions);
            return Result.ok(result);
        } catch (error) {
            console.error('[Export:DOCX] Markdown-to-Docx transformation failed:', error);
            return Result.fail(error instanceof Error ? error : new Error('Unrecoverable AST transformation error'));
        }
    }
}
