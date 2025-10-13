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
export * from '../../core/types';

// Utils
// export * from './utils';

// Error Handling
export * from '../../core/error-handling';

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
} from '../../core/types/api';

export type {
    AuthResult,
    LoginCredentials,
    RegisterCredentials
} from '../../core/auth/auth-service';

export type {
    AuthState
} from '../../core/auth/auth-hooks';

export type {
    ExtendedUser,
    PermissionCheckResult, UserPermission, UserRole
} from '../../core/auth/auth-utils';

export type {
    BundleStats
} from '../../core/performance/bundle-analyzer';

export type {
    PerformanceEvent, PerformanceMetrics
} from '../../core/performance/performance-monitor';

export type {
    AdvancedCacheOptions,
    CacheStats
} from '../../core/performance/cache-optimizer';

export type {
    ApiBatch, ApiOptimizationOptions,
    ApiRequest
} from '../../core/performance/api-optimizer';

export type {
    AnalyticsEvent, AnalyticsEventType, AppMetrics, UserMetrics
} from '../../core/performance/analytics';

export type {
    IntegrationConfig
} from '../../core/performance/integration';

export type * from './query-keys';

