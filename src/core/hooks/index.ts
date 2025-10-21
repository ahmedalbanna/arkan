/**
 * تصدير موحد لجميع الـ hooks الأساسية
 * يوفر نقطة دخول واحدة لجميع الـ hooks القابلة لإعادة الاستخدام
 */

// Hooks الأساسية
export { useCopyToast } from '../../hooks/base/use-copy-toast';
export { useFileUpload } from '../../hooks/base/use-file-upload';
export { useFormHandler } from '../../hooks/base/use-form-handler';
export { useProcessingState } from '../../hooks/base/use-processing-state';

// Hooks أدوات الكتابة
export { useTextProcessor } from '../../hooks/base/use-text-processor';

// Hooks أدوات العروض التقديمية
export { createAdvancedPresentationToolHook, createPresentationToolHook } from './presentation-tools/use-presentation-factory';

// Hooks أدوات تخطيط المشاريع
export { createAdvancedProjectPlanToolHook, createProjectPlanToolHook } from './project-plan-tools/use-project-plan-factory';

// Hooks أدوات الحل الأكاديمي
export { createAcademicSolverToolHook, createAdvancedAcademicSolverToolHook } from './academic-solver-tools/use-academic-solver-factory';


// تصدير الأنواع
export type { CopyToastOptions, CopyToastResult } from '../../hooks/base/use-copy-toast';
export type { FileUploadOptions, FileUploadResult } from '../../hooks/base/use-file-upload';
export type { FormHandlerOptions, FormHandlerResult } from '../../hooks/base/use-form-handler';
export type { ProcessingStateOptions, ProcessingStateResult } from '../../hooks/base/use-processing-state';
export type { TextProcessorOptions, TextProcessorResult } from '../../hooks/base/use-text-processor';
export type { AcademicSolverToolConfig } from './academic-solver-tools/use-academic-solver-factory';
export type { PresentationToolConfig } from './presentation-tools/use-presentation-factory';
export type { ProjectPlanToolConfig } from './project-plan-tools/use-project-plan-factory';


