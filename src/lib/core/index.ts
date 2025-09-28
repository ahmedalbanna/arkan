/**
 * النظام الأساسي الموحد
 *
 * هذا الملف يحتوي على جميع مكونات النظام الأساسي الموحد
 * بما في ذلك الثوابت والأنواع والأدوات ومعالجة الأخطاء
 */

// Constants
export * from './constants';

// Types
export * from './types';

// Utils
export * from './utils';

// Error Handling
export * from './error-handling';

// API
export * from './api';

// Auth
export * from './auth';

// Integration
export * from './integration';

// Firebase
export * from './firebase/client-init';

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
