
import { injectable } from "tsyringe";
import { 
    IExportService, 
    ExportOptions 
} from "@/modules/ai-content/domain/services/IExportService";
import { Project, ProjectContent } from "@/modules/projects/domain/entities/Project";
import { convertMarkdownToPptx, type PptxConversionOptions } from "@/modules/templates/infrastructure/exporters/pptx/markdown-to-pptx-converter";
import { Chapter } from "@/modules/ai-content/domain/entities/Chapter";

@injectable()
export class PptxExportService implements IExportService {
    async export(project: Project, content: ProjectContent, options: ExportOptions): Promise<Blob | Buffer> {
        const isFullExport = content.length === project.content.length;
        const markdown = isFullExport && project.fullMarkdownContent 
            ? project.fullMarkdownContent 
            : this.generateMarkdownFromContent(content);
        
        // Extract footnotes from full project content
        const fullMarkdown = project.fullMarkdownContent || '';
        const footnoteRegex = /^\[\^.+?\]:.+$/gm;
        const footnoteDefinitions = fullMarkdown.match(footnoteRegex);

        let finalMarkdown = markdown;
        // Only append footnotes if they aren't already in the markdown (to avoid duplicates for full exports)
        if (footnoteDefinitions && footnoteDefinitions.length > 0) {
            const existingFootnotes = (markdown.match(footnoteRegex) || []) as string[];
            const newFootnotes = footnoteDefinitions.filter((fn: string) => !existingFootnotes.includes(fn));
            
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

        return result instanceof Blob ? result : new Blob([result as any], { 
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
        });
    }

    async exportFromMarkdown(markdown: string, fileName: string, options: ExportOptions): Promise<Blob | Buffer> {
        const pptxOptions: PptxConversionOptions = {
            styles: options.styles as PptxConversionOptions['styles'],
            isRtl: options.isRtl,
            includeToc: options.includeToc,
            title: fileName,
        };

        const result = await convertMarkdownToPptx(markdown, fileName, pptxOptions);

        return result instanceof Blob ? result : new Blob([result as any], { 
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
        });
    }

    private generateMarkdownFromContent(content: ProjectContent): string {
        return content.map(item => {
            if (item instanceof Chapter) {
                const chapterContent = `# ${item.title}`;
                const sectionsContent = item.sections.map(section => 
                    `## ${section.title}\n\n${section.content || ''}`
                ).join('\n\n');
                return `${chapterContent}\n\n${sectionsContent}`;
            } else {
                return `# ${item.title}\n\n${item.content || ''}`;
            }
        }).join('\n\n<!-- slide-break -->\n\n');
    }
}
