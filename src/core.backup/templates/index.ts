/**
 * تصدير نظام إدارة القوالب الشامل
 */

// الأنواع الأساسية
export * from './types/template-types';

// Hook الأساسي لإدارة القوالب
export * from './managers/use-template-manager';

// Template Factories
export * from './factories/use-docx-template-factory';
export * from './factories/use-pptx-template-factory';

// تصدير الأنواع
export type {
    Template, TemplateCategory, TemplateConfig, TemplateFormat, TemplateManagerOptions,
    TemplateManagerResult, TemplateMetadata, TemplateStyle
} from './types/template-types';

export type {
    DocxTemplateConfig,
    DocxTemplateResult
} from './factories/use-docx-template-factory';

export type {
    PptxTemplateConfig,
    PptxTemplateResult
} from './factories/use-pptx-template-factory';

