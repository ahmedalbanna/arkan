
import { injectable } from "tsyringe";
import { 
    IExportService, 
    ExportOptions 
} from "@/modules/ai-content/domain/services/IExportService";
import { Project, ProjectContent } from "@/modules/projects/domain/entities/Project";
import { convertMarkdownToWord } from "./MarkdownToWordConverter";

@injectable()
export class DocxExportService implements IExportService {
    async export(project: Project, content: ProjectContent, options: ExportOptions): Promise<Blob | Buffer> {
        return convertMarkdownToWord(project, {
            ...options,
            selectedContent: content
        });
    }

    async exportFromMarkdown(markdown: string, fileName: string, options: ExportOptions): Promise<Blob | Buffer> {
        return convertMarkdownToWord(markdown, fileName, options);
    }
}
