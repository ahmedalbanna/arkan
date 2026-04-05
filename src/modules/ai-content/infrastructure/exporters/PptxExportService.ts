import { injectable } from "tsyringe";
import { 
    IExportService, 
    ExportOptions 
} from "@/modules/ai-content/domain/services/IExportService";
import { Project, ProjectContent } from "@/modules/projects/domain/entities/Project";
import { convertMarkdownToPptx, type PptxConversionOptions } from "@/modules/templates/infrastructure/exporters/pptx/markdown-to-pptx-converter";
import { Chapter } from "@/modules/ai-content/domain/entities/Chapter";
import { Result } from "@/infrastructure/utils/result";
import { cleanAiOutput } from "@/infrastructure/utils/sanitizer";

/**
 * PptxExportService — Production-grade document synthesis for Microsoft PowerPoint.
 * Orchestrates the conversion of project content into high-impact visual slide-decks.
 * 
 * DEFENSIVE MEASURES:
 * 1. Result Pattern: Transitions return types to structured success/failure vectors.
 * 2. Footnote Normalization: Intelligently handles multi-node footnote extraction.
 * 3. Spectral Cleanup: Enforces model-to-markdown purity before slide rendering.
 * 4. AST Containment: Wraps slide generation logic in robust try-catch blocks.
 */

@injectable()
export class PptxExportService implements IExportService {
    async export(project: Project, content: ProjectContent, options: ExportOptions): Promise<Result<Blob | Buffer, Error>> {
        try {
            if (!project || !Array.isArray(content) || content.length === 0) {
                return Result.fail(new Error("Document manifest contains zero valid content nodes."));
            }

            const isFullExport = content.length === project.content.length;
            const markdown = isFullExport && project.fullMarkdownContent 
                ? project.fullMarkdownContent 
                : this.generateMarkdownFromContent(content);
            
            // Extract footnotes from full project content — Safe Utility Pattern
            const footnoteDefinitions = this.extractFootnotes(project.fullMarkdownContent || '');

            let finalMarkdown = markdown;
            // Deduplicate and append footnotes to ensure citation stability across slides
            if (footnoteDefinitions.length > 0) {
                const existingFootnotes = this.extractFootnotes(markdown);
                const newFootnotes = footnoteDefinitions.filter(fn => !existingFootnotes.includes(fn));
                
                if (newFootnotes.length > 0) {
                    finalMarkdown += '\n\n' + newFootnotes.join('\n');
                }
            }

            const pptxOptions: PptxConversionOptions = {
                styles: options.styles as PptxConversionOptions['styles'],
                isRtl: options.isRtl,
                includeToc: options.includeToc,
            };

            const result = await convertMarkdownToPptx(finalMarkdown, project.name, pptxOptions);

            const output = result instanceof Blob ? result : new Blob([result as any], { 
                type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
            });

            return Result.ok(output);
        } catch (error) {
            console.error('[Export:PPTX] Slide synthesis pipeline failure:', error);
            return Result.fail(error instanceof Error ? error : new Error('Unknown PPTX synthesis failure'));
        }
    }

    async exportFromMarkdown(markdown: string, fileName: string, options: ExportOptions): Promise<Result<Blob | Buffer, Error>> {
        try {
            if (!markdown || !markdown.trim()) {
                return Result.fail(new Error("Markdown vector is empty."));
            }

            const pptxOptions: PptxConversionOptions = {
                styles: options.styles as PptxConversionOptions['styles'],
                isRtl: options.isRtl,
                includeToc: options.includeToc,
                title: fileName,
            };

            const result = await convertMarkdownToPptx(markdown, fileName, pptxOptions);

            const output = result instanceof Blob ? result : new Blob([result as any], { 
                type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
            });

            return Result.ok(output);
        } catch (error) {
            console.error('[Export:PPTX] Markdown-to-Slide transformation failed:', error);
            return Result.fail(error instanceof Error ? error : new Error('Unrecoverable slide-deck transformation error'));
        }
    }

    /**
     * Standardized Footnote Extraction Vector
     */
    private extractFootnotes(markdown: string): string[] {
        try {
            const footnoteRegex = /^\[\^.+?\]:.+$/gm;
            return (markdown.match(footnoteRegex) || []) as string[];
        } catch (e) {
            console.warn('[Export:PPTX] Footnote extraction bypassed:', e);
            return [];
        }
    }

    /**
     * High-Fidelity Markdown Aggregation
     * Includes Spectral Cleanup to ensure pure markdown injection.
     */
    private generateMarkdownFromContent(content: ProjectContent): string {
        return content.map(item => {
            if (item instanceof Chapter) {
                const chapterTitle = `# ${item.title}`;
                const sectionsContent = item.sections.map(section => {
                    const cleanContent = cleanAiOutput(section.content || '');
                    return `## ${section.title}\n\n${cleanContent}`;
                }).join('\n\n');
                return `${chapterTitle}\n\n${sectionsContent}`;
            } else {
                const cleanContent = cleanAiOutput(item.content || '');
                return `# ${item.title}\n\n${cleanContent}`;
            }
        }).join('\n\n<!-- slide-break -->\n\n');
    }
}
