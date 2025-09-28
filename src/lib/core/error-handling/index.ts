/**
 * تصدير موحد لجميع أدوات معالجة الأخطاء
 *
 * هذا الملف يحتوي على تصدير جميع أدوات معالجة الأخطاء
 * لسهولة الاستيراد والاستخدام
 */

// أنواع الأخطاء
export * from './error-types';

// معالجة أخطاء العميل
export * from './client-errors';

// معالجة أخطاء الخادم
export * from './server-errors';

// Re-export error types with corrected names
export {
    isAPIErrorType as isAPIError, isAuthenticationErrorType as isAuthenticationError,
    isAuthorizationErrorType as isAuthorizationError, isClientErrorType as isClientError, isDatabaseErrorType as isDatabaseError, isFileErrorType as isFileError, isNetworkErrorType as isNetworkError,
    isServerErrorType as isServerError, isUnknownErrorType as isUnknownError, isValidationErrorType as isValidationError
} from './error-types';

