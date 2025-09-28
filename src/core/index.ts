/**
 * نقطة الدخول الرئيسية لمجلد core
 * يوفر تصدير موحد لجميع العناصر الأساسية القابلة لإعادة الاستخدام
 */

// Hooks الأساسية
export * from './hooks';

// الأنواع المشتركة
export * from './types/common';
export * from './types/writing-tools';

// الأدوات المساعدة
export * from './utils/error-handling';

// الثوابت
// export * from './constants/file-types';
export * from './constants/validation-rules';

// الأمثلة (للتطوير فقط)
export * from './examples/use-paraphraser-refactored';

// النظام الأساسي - Core System
// يوفر جميع الـ hooks والأدوات الأساسية للمشروع

// Hooks الأساسية
export * from './hooks/base/use-copy-toast';
export * from './hooks/base/use-file-upload';
export * from './hooks/base/use-form-handler';
export * from './hooks/base/use-processing-state';

// Hooks أدوات الكتابة
export * from './hooks/writing-tools/use-text-processor';
// export * from './hooks/writing-tools/use-writing-tool-factory';

// Hooks مولدات المحتوى
export * from './hooks/content-generators/use-content-generator-factory';

// Hooks أدوات المقترحات
export * from './hooks/proposal-tools/use-proposal-factory';

// Hooks أدوات التقارير
export * from './hooks/report-tools/use-report-factory';

// Hooks أدوات المخططات
export * from './hooks/diagram-tools/use-diagram-factory';

// Hooks الأدوات المتخصصة
export * from './hooks/specialized-tools/use-specialized-factory';

// Hooks UI/UX
export * from './ui/use-ui-factory';

// تصدير الأنواع
export type { CopyToastOptions, CopyToastResult } from './hooks/base/use-copy-toast';
export type { FileUploadOptions, FileUploadResult } from './hooks/base/use-file-upload';
export type { FormHandlerOptions, FormHandlerResult } from './hooks/base/use-form-handler';
export type { ProcessingStateOptions, ProcessingStateResult } from './hooks/base/use-processing-state';
export type { TextProcessorOptions, TextProcessorResult } from './hooks/writing-tools/use-text-processor';

