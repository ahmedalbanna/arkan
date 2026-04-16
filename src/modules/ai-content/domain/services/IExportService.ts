
import { Result } from '@/infrastructure/utils/result';

export interface ExportProject {
    id: string;
    name: string;
    projectDescription?: string;
    projectType?: string;
    specialization?: string;
    university?: string;
    supervisor?: string;
    course?: string;
    educationalLevel?: string;
    teamMembers?: readonly string[];
    logoUrl?: string;
    universityLogoUrl?: string;
    tableOfContentsMarkdown?: string;
    markdown?: string;
}

export type ExportProjectContent = readonly unknown[];

export interface ExportOptions {
    template?: string;
    isRtl?: boolean;
    includeToc?: boolean;
    pageNumbers?: boolean;
    styles?: unknown;
    customStyles?: unknown;
}

export interface IExportService {
    export(project: ExportProject, content: ExportProjectContent, options: ExportOptions): Promise<Result<Blob | Buffer, Error>>;
    exportFromMarkdown(markdown: string, fileName: string, options: ExportOptions): Promise<Result<Blob | Buffer, Error>>;
}

export const IDocxExportServiceToken = Symbol('IDocxExportService');
export const IPdfExportServiceToken = Symbol('IPdfExportService');
export const IPptxExportServiceToken = Symbol('IPptxExportService');
