
import type { Project, ProjectContent } from '@/modules/projects/domain/entities/Project';

export interface ExportOptions {
    template?: string;
    isRtl?: boolean;
    includeToc?: boolean;
    pageNumbers?: boolean;
    styles?: unknown;
    customStyles?: unknown;
}

export interface IExportService {
    export(project: Project, content: ProjectContent, options: ExportOptions): Promise<Blob | Buffer>;
    exportFromMarkdown(markdown: string, fileName: string, options: ExportOptions): Promise<Blob | Buffer>;
}

export const IDocxExportServiceToken = Symbol('IDocxExportService');
export const IPdfExportServiceToken = Symbol('IPdfExportService');
export const IPptxExportServiceToken = Symbol('IPptxExportService');
