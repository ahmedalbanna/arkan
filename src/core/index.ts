/**
 * نقطة الدخول الرئيسية لمجلد core
 * يوفر تصدير موحد لجميع العناصر الأساسية القابلة لإعادة الاستخدام
 */

// ===== النظام الأساسي الموحد =====

// الثوابت
export * from './constants/validation-rules';
export * from './constants/file-types';

// الأنواع الأساسية
export * from './types/common';
export * from './types/writing-tools';

// الأدوات المساعدة
export * from './utils/error-handling';

// نظام API الموحد
export * from './api';

// نظام المصادقة المتقدم
export * from './auth';

// نظام الأداء والتحليل
export * from './performance';

// نظام التكامل
export * from './integration';

// نظام معالجة الأخطاء المتقدم
export * from './error-handling';

// نظام التخزين المؤقت
export * from './cache';

// مفاتيح الاستعلام
export * from './query-keys';

// ===== نظام الـ Hooks الموحد =====

// Hooks الأساسية
export * from './hooks';

// Hooks الأساسية
export * from './hooks/base/use-copy-toast';
export * from './hooks/base/use-file-upload';
export * from './hooks/base/use-form-handler';
export * from './hooks/base/use-processing-state';

// Hooks أدوات الكتابة
export * from './hooks/writing-tools/use-text-processor';

// Hooks مولدات المحتوى
export * from './hooks/content-generators/use-content-generator-factory';

// Hooks أدوات المقترحات
export * from './hooks/proposal-tools/use-proposal-factory';

// Hooks أدوات التقارير
export * from './hooks/report-tools/use-report-factory';

// Hooks أدوات المخططات
export * from './hooks/diagram-tools/use-diagram-factory';

// Hooks أدوات العروض التقديمية
export * from './hooks/presentation-tools/use-presentation-factory';

// Hooks أدوات تخطيط المشاريع
export * from './hooks/project-plan-tools/use-project-plan-factory';

// Hooks أدوات الحل الأكاديمي
export * from './hooks/academic-solver-tools/use-academic-solver-factory';

// Hooks الأدوات المتخصصة
export * from './hooks/specialized-tools/use-specialized-factory';

// Hooks UI/UX
export * from './ui/use-ui-factory';

// ===== أنظمة التصدير والقوالب =====

// نظام التصدير الشامل
export * from './export';

// نظام إدارة القوالب الشامل
export * from './templates';

// ===== الأمثلة (للتطوير فقط) =====
export * from './examples/use-paraphraser-refactored';

// ===== تصدير الأنواع =====

// أنواع النظام الأساسي الموحد
export type {
    ErrorState, LoadingState, ProcessResult
} from './types/common';

export type {
    HttpError, HttpHeaders, HttpMethod, HttpRequestOptions,
    HttpResponse
} from './types-lib-core/api';

export type {
    AuthResult,
    LoginCredentials,
    RegisterCredentials
} from './auth/auth-service';

export type {
    AuthState
} from './auth/auth-hooks';

export type {
    ExtendedUser,
    PermissionCheckResult, UserPermission, UserRole
} from './auth/auth-utils';

export type {
    BundleStats
} from './performance/bundle-analyzer';

export type {
    PerformanceEvent, PerformanceMetrics
} from './performance/performance-monitor';

export type {
    AdvancedCacheOptions,
    CacheStats
} from './performance/cache-optimizer';

export type {
    ApiBatch, ApiOptimizationOptions,
    ApiRequest
} from './performance/api-optimizer';

export type {
    AnalyticsEvent, AnalyticsEventType, AppMetrics, UserMetrics
} from './performance/analytics';

export type {
    IntegrationConfig
} from './performance/integration';

// أنواع نظام الـ Hooks الموحد
export type { AcademicSolverToolConfig } from './hooks/academic-solver-tools/use-academic-solver-factory';
export type { CopyToastOptions, CopyToastResult } from './hooks/base/use-copy-toast';
export type { FileUploadOptions, FileUploadResult } from './hooks/base/use-file-upload';
export type { FormHandlerOptions, FormHandlerResult } from './hooks/base/use-form-handler';
export type { ProcessingStateOptions, ProcessingStateResult } from './hooks/base/use-processing-state';
export type { PresentationToolConfig } from './hooks/presentation-tools/use-presentation-factory';
export type { ProjectPlanToolConfig } from './hooks/project-plan-tools/use-project-plan-factory';
export type { TextProcessorOptions, TextProcessorResult } from './hooks/writing-tools/use-text-processor';

