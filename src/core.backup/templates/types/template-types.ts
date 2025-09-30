/**
 * أنواع القوالب الأساسية
 */

export type TemplateFormat = 'docx' | 'pptx' | 'pdf' | 'html';

export type TemplateCategory =
    | 'proposal'
    | 'report'
    | 'presentation'
    | 'academic'
    | 'project-plan'
    | 'document';

export interface TemplateStyle {
    id: string;
    name: string;
    properties: Record<string, any>;
    category: 'typography' | 'layout' | 'color' | 'spacing' | 'border';
}

export interface TemplateMetadata {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    preview?: string;
    thumbnail?: string;
}

export interface TemplateConfig {
    format: TemplateFormat;
    category: TemplateCategory;
    isDefault: boolean;
    isActive: boolean;
    styles: Record<string, TemplateStyle>;
    customProperties?: Record<string, any>;
}

export interface Template extends TemplateMetadata, TemplateConfig { }

export interface TemplateManagerOptions {
    autoSave?: boolean;
    validateStyles?: boolean;
    onStyleChange?: (templateId: string, styleId: string, changes: any) => void;
    onTemplateChange?: (templateId: string, changes: any) => void;
}

export interface TemplateManagerResult {
    templates: Record<string, Template>;
    activeTemplate: Template | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;

    // إدارة القوالب
    setActiveTemplate: (templateId: string) => void;
    createTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    updateTemplate: (templateId: string, updates: Partial<Template>) => Promise<void>;
    deleteTemplate: (templateId: string) => Promise<void>;
    duplicateTemplate: (templateId: string, newName: string) => Promise<string>;

    // إدارة الأنماط
    updateStyle: (templateId: string, styleId: string, properties: Record<string, any>) => void;
    addStyle: (templateId: string, style: TemplateStyle) => void;
    removeStyle: (templateId: string, styleId: string) => void;

    // الوظائف المساعدة
    getTemplatesByCategory: (category: TemplateCategory) => Template[];
    getTemplatesByFormat: (format: TemplateFormat) => Template[];
    validateTemplate: (template: Template) => boolean;
    exportTemplate: (templateId: string) => Promise<Blob>;
    importTemplate: (file: File) => Promise<string>;
}
