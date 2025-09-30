// /**
//  * النظام الأساسي الموحد
//  *
//  * هذا الملف يحتوي على جميع مكونات النظام الأساسي الموحد
//  * بما في ذلك الثوابت والأنواع والأدوات ومعالجة الأخطاء
//  *
//  * ملاحظة: هذا الملف للاستخدام العام. للاستخدام المحدد:
//  * - استخدم './client' للعميل
//  * - استخدم './server' للخادم
//  */

// Constants
export * from './constants';

// Types
export * from './types';

// Utils
// export * from './utils';

// Error Handling
export * from './error-handling';

// Client-side components (safe for browser)
// export * from './client';

// Server-side components (Node.js only)
// export * from './server';

// Re-export commonly used types
export type {
    ErrorState, LoadingState, ProcessResult
} from './types/common';

export type {
    HttpError, HttpHeaders, HttpMethod, HttpRequestOptions,
    HttpResponse
} from './types/api';

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

export type * from './query-keys';
