/**
 * نظام API الموحد
 *
 * هذا الملف يحتوي على جميع مكونات نظام API الموحد
 * بما في ذلك العميل والـ middleware والمعالجات
 */

// API Client
export * from './client';

// Middleware
export * from './middleware';

// Handlers
export * from './handlers';

// Legacy API Utils (for backward compatibility)
export {
    createApiResponseEnhanced, createApiResponse as createApiResponseLegacy,
    handleApiErrorEnhanced, handleApiError as handleApiErrorLegacy, withAuth as withAuthLegacy
} from './legacy-api-utils';
// Enhanced API Utils (new system)
export {
    createApiResponseEnhanced as createApiResponseEnhancedNew, handleApiErrorEnhanced as handleApiErrorEnhancedNew, withEnhancedAuth
} from './enhanced-api-utils';

// Types
export type { ApiClientConfig, HttpError, HttpHeaders, HttpMethod, HttpRequestOptions, HttpResponse } from '../types/api';
export type { ApiHandler, ApiHandlerOptions } from './handlers/base-handler';
export type { AuthContext, AuthMiddlewareOptions } from './middleware/auth-middleware';
export type { CorsOptions } from './middleware/cors-middleware';
export type { LoggingOptions } from './middleware/logging-middleware';
export type { RateLimitOptions } from './middleware/rate-limit-middleware';
export type { ValidatedApiHandler, ValidationMiddlewareOptions } from './middleware/validation-middleware';

