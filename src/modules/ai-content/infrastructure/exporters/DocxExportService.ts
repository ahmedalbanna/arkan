
import { injectable } from "tsyringe";
import { 
    IExportService, 
    ExportOptions 
} from "@/modules/ai-content/domain/services/IExportService";
import { Project, ProjectContent } from "@/modules/projects/domain/entities/Project";
import type { ConversionOptions } from "@/modules/ai-content/domain/types/export-types";
import { convertMarkdownToWord } from "./MarkdownToWordConverter";

@injectable()
export class DocxExportService implements IExportService {
    async export(project: Project, content: ProjectContent, options: ExportOptions): Promise<Blob | Buffer> {
        const docxOptions: ConversionOptions & { selectedContent?: ProjectContent } = {
            ...(options as ConversionOptions),
            selectedContent: content,
        };

        return convertMarkdownToWord(project, docxOptions);
    }

    async exportFromMarkdown(markdown: string, fileName: string, options: ExportOptions): Promise<Blob | Buffer> {
        return convertMarkdownToWord(markdown, fileName, options as ConversionOptions);
    }
}
