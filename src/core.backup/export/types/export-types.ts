/**
 * أنواع التصدير الأساسية
 */

export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'html' | 'markdown';

export type ContentType =
    | 'proposal'
    | 'report'
    | 'presentation'
    | 'diagram'
    | 'academic-solution'
    | 'project-plan'
    | 'document';

export interface ExportOptions {
    format: ExportFormat;
    contentType: ContentType;
    templateId?: string;
    includeImages?: boolean;
    includeDiagrams?: boolean;
    customStyles?: Record<string, any>;
    metadata?: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string[];
        language?: string;
    };
}

export interface ExportResult {
    success: boolean;
    fileName?: string;
    blob?: Blob;
    error?: string;
    metadata?: {
        fileSize: number;
        pages?: number;
        slides?: number;
        sections?: number;
    };
}

export interface TemplateInfo {
    id: string;
    name: string;
    description: string;
    format: ExportFormat;
    contentType: ContentType;
    isDefault: boolean;
    preview?: string;
    styles: Record<string, any>;
}

export interface ExportProgress {
    stage: 'preparing' | 'processing' | 'generating' | 'finalizing' | 'complete';
    progress: number; // 0-100
    message: string;
}

export interface ExportContext {
    content: any;
    options: ExportOptions;
    template?: TemplateInfo;
    progress?: ExportProgress;
}
