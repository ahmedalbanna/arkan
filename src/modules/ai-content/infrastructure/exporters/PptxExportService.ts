
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
        const markdown = this.generateMarkdownFromContent(content);
        
        // Extract footnotes from full project content
        const fullMarkdown = project.fullMarkdownContent || '';
        const footnoteRegex = /^\[\^.+?\]:.+$/gm;
        const footnoteDefinitions = fullMarkdown.match(footnoteRegex);

        let finalMarkdown = markdown;
        if (footnoteDefinitions) {
            finalMarkdown += '\n\n' + footnoteDefinitions.join('\n');
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
