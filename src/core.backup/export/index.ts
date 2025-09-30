/**
 * تصدير نظام التصدير الشامل
 */

// الأنواع الأساسية
export * from './types/export-types';

// Hook الأساسي لإدارة التصدير
export * from './base/use-export-manager';

// Export Factories
export * from './factories/use-academic-export-factory';
export * from './factories/use-presentation-export-factory';
export * from './factories/use-proposal-export-factory';
export * from './factories/use-report-export-factory';

// تصدير الأنواع
export type {
    ContentType, ExportContext, ExportFormat, ExportOptions, ExportProgress, ExportResult,
    TemplateInfo
} from './types/export-types';

export type {
    ExportManagerOptions,
    ExportManagerResult
} from './base/use-export-manager';

export type {
    ProposalExportConfig,
    ProposalExportResult
} from './factories/use-proposal-export-factory';

export type {
    ReportData, ReportExportConfig, ReportExportResult
} from './factories/use-report-export-factory';

export type {
    PresentationData, PresentationExportConfig, PresentationExportResult
} from './factories/use-presentation-export-factory';

export type {
    AcademicData, AcademicExportConfig, AcademicExportResult
} from './factories/use-academic-export-factory';

