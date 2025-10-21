/**
 * تصدير موحد لجميع الـ hooks الأساسية
 * يوفر نقطة دخول واحدة لجميع الـ hooks القابلة لإعادة الاستخدام
 */

// Hooks الأساسية
export { useCopyToast } from './base/use-copy-toast';
export { useFileUpload } from './base/use-file-upload';
export { useFormHandler } from './base/use-form-handler';
export { useProcessingState } from './base/use-processing-state';

// Hooks أدوات الكتابة
export { useTextProcessor } from './writing-tools/use-text-processor';

// Hooks أدوات العروض التقديمية
export { createAdvancedPresentationToolHook, createPresentationToolHook } from './presentation-tools/use-presentation-factory';

// Hooks أدوات تخطيط المشاريع
export { createAdvancedProjectPlanToolHook, createProjectPlanToolHook } from './project-plan-tools/use-project-plan-factory';

// Hooks أدوات الحل الأكاديمي
export { createAcademicSolverToolHook, createAdvancedAcademicSolverToolHook } from './academic-solver-tools/use-academic-solver-factory';


// تصدير الأنواع
export type { AcademicSolverToolConfig } from './academic-solver-tools/use-academic-solver-factory';
export type { CopyToastOptions, CopyToastResult } from './base/use-copy-toast';
export type { FileUploadOptions, FileUploadResult } from './base/use-file-upload';
export type { FormHandlerOptions, FormHandlerResult } from './base/use-form-handler';
export type { ProcessingStateOptions, ProcessingStateResult } from './base/use-processing-state';
export type { PresentationToolConfig } from './presentation-tools/use-presentation-factory';
export type { ProjectPlanToolConfig } from './project-plan-tools/use-project-plan-factory';
export type { TextProcessorOptions, TextProcessorResult } from './writing-tools/use-text-processor';


