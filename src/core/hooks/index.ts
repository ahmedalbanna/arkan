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
export { createAdvancedWritingToolHook, createWritingToolHook } from './writing-tools/use-writing-tool-factory';

// تصدير الأنواع
export type { CopyToastOptions, CopyToastResult } from './base/use-copy-toast';
export type { FileUploadOptions, FileUploadResult } from './base/use-file-upload';
export type { FormHandlerOptions, FormHandlerResult } from './base/use-form-handler';
export type { ProcessingStateOptions, ProcessingStateResult } from './base/use-processing-state';
export type { TextProcessorOptions, TextProcessorResult } from './writing-tools/use-text-processor';

