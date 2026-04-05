
import type { Project, ProjectContent } from '@/modules/projects/domain/entities/Project';
import { Result } from '@/infrastructure/utils/result';

export interface ExportOptions {
    template?: string;
    isRtl?: boolean;
    includeToc?: boolean;
    pageNumbers?: boolean;
    styles?: unknown;
    customStyles?: unknown;
}

export interface IExportService {
    export(project: Project, content: ProjectContent, options: ExportOptions): Promise<Result<Blob | Buffer, Error>>;
    exportFromMarkdown(markdown: string, fileName: string, options: ExportOptions): Promise<Result<Blob | Buffer, Error>>;
}

export const IDocxExportServiceToken = Symbol('IDocxExportService');
export const IPdfExportServiceToken = Symbol('IPdfExportService');
export const IPptxExportServiceToken = Symbol('IPptxExportService');
