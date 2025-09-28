/**
 * الخادم - Server-side Module
 *
 * هذا الملف يحتوي على جميع المكونات التي تعمل على الخادم فقط
 * ويشمل مكتبات Firebase Admin و Google Cloud
 */

// Constants
export * from '../constants';

// Types
export * from '../types';

// Utils
// export * from '../utils';

// Error Handling (Server-side)
export * from '../error-handling';

// Server-side Firebase
export * from '../firebase/server-init';

// API (Server-side)
// export * from '../api';

// Auth (Server-side)
export * from '../auth';

// Integration (Server-side)
export * from '../integration';

// Performance (Server-side)
export * from '../performance';

// Re-export commonly used types
export type {
    ErrorState, LoadingState, ProcessResult
} from '../types/common';

export type {
    HttpError, HttpHeaders, HttpMethod, HttpRequestOptions,
    HttpResponse
} from '../types/api';

export type {
    AuthResult,
    LoginCredentials,
    RegisterCredentials
} from '../auth/auth-service';

export type {
    AuthState
} from '../auth/auth-hooks';

export type {
    ExtendedUser,
    PermissionCheckResult, UserPermission, UserRole
} from '../auth/auth-utils';

export type {
    BundleStats
} from '../performance/bundle-analyzer';

export type {
    PerformanceEvent, PerformanceMetrics
} from '../performance/performance-monitor';

export type {
    AdvancedCacheOptions, CacheStats
} from '../performance/cache-optimizer';

export type {
    ApiBatch, ApiOptimizationOptions,
    ApiRequest
} from '../performance/api-optimizer';

export type {
    AnalyticsEvent, AnalyticsEventType, AppMetrics, UserMetrics
} from '../performance/analytics';

export type {
    IntegrationConfig
} from '../performance/integration';

