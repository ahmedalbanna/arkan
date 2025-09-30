/**
 * أنواع الأخطاء الموحدة
 *
 * هذا الملف يحتوي على جميع أنواع الأخطاء المستخدمة في التطبيق
 */

/**
 * نوع الخطأ
 */
export type ErrorType =
    | 'VALIDATION_ERROR'
    | 'AUTHENTICATION_ERROR'
    | 'AUTHORIZATION_ERROR'
    | 'NETWORK_ERROR'
    | 'SERVER_ERROR'
    | 'CLIENT_ERROR'
    | 'FILE_ERROR'
    | 'DATABASE_ERROR'
    | 'API_ERROR'
    | 'UNKNOWN_ERROR';

/**
 * مستوى الخطأ
 */
export type ErrorLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * مصدر الخطأ
 */
export type ErrorSource =
    | 'client'
    | 'server'
    | 'database'
    | 'api'
    | 'file'
    | 'network'
    | 'validation'
    | 'authentication'
    | 'authorization'
    | 'unknown';

/**
 * كود الخطأ
 */
export type ErrorCode =
    | 'VALIDATION_FAILED'
    | 'REQUIRED_FIELD_MISSING'
    | 'INVALID_FORMAT'
    | 'INVALID_EMAIL'
    | 'INVALID_PHONE'
    | 'INVALID_PASSWORD'
    | 'INVALID_URL'
    | 'INVALID_FILE_TYPE'
    | 'INVALID_FILE_SIZE'
    | 'AUTHENTICATION_FAILED'
    | 'TOKEN_EXPIRED'
    | 'TOKEN_INVALID'
    | 'USER_NOT_FOUND'
    | 'INSUFFICIENT_PERMISSIONS'
    | 'ACCESS_DENIED'
    | 'NETWORK_TIMEOUT'
    | 'NETWORK_UNAVAILABLE'
    | 'SERVER_UNAVAILABLE'
    | 'DATABASE_CONNECTION_FAILED'
    | 'DATABASE_QUERY_FAILED'
    | 'FILE_NOT_FOUND'
    | 'FILE_READ_ERROR'
    | 'FILE_WRITE_ERROR'
    | 'FILE_UPLOAD_FAILED'
    | 'API_RATE_LIMIT_EXCEEDED'
    | 'API_ENDPOINT_NOT_FOUND'
    | 'API_INVALID_RESPONSE'
    | 'UNKNOWN_ERROR';

/**
 * واجهة الخطأ الأساسية
 */
export interface BaseError {
    type: ErrorType;
    code: ErrorCode;
    message: string;
    level: ErrorLevel;
    source: ErrorSource;
    timestamp: Date;
    context?: Record<string, any>;
    stack?: string;
    originalError?: Error;
}

/**
 * خطأ التحقق من البيانات
 */
export interface ValidationError extends BaseError {
    type: 'VALIDATION_ERROR';
    code: 'VALIDATION_FAILED' | 'REQUIRED_FIELD_MISSING' | 'INVALID_FORMAT' | 'INVALID_EMAIL' | 'INVALID_PHONE' | 'INVALID_PASSWORD' | 'INVALID_URL';
    field?: string;
    value?: any;
    expected?: any;
}

/**
 * خطأ المصادقة
 */
export interface AuthenticationError extends BaseError {
    type: 'AUTHENTICATION_ERROR';
    code: 'AUTHENTICATION_FAILED' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'USER_NOT_FOUND';
    userId?: string;
    token?: string;
}

/**
 * خطأ التفويض
 */
export interface AuthorizationError extends BaseError {
    type: 'AUTHORIZATION_ERROR';
    code: 'INSUFFICIENT_PERMISSIONS' | 'ACCESS_DENIED';
    userId?: string;
    resource?: string;
    action?: string;
}

/**
 * خطأ الشبكة
 */
export interface NetworkError extends BaseError {
    type: 'NETWORK_ERROR';
    code: 'NETWORK_TIMEOUT' | 'NETWORK_UNAVAILABLE';
    url?: string;
    method?: string;
    statusCode?: number;
}

/**
 * خطأ الخادم
 */
export interface ServerError extends BaseError {
    type: 'SERVER_ERROR';
    code: 'SERVER_UNAVAILABLE';
    endpoint?: string;
    statusCode?: number;
    response?: any;
}

/**
 * خطأ العميل
 */
export interface ClientError extends BaseError {
    type: 'CLIENT_ERROR';
    code: 'API_RATE_LIMIT_EXCEEDED' | 'API_ENDPOINT_NOT_FOUND' | 'API_INVALID_RESPONSE';
    endpoint?: string;
    statusCode?: number;
    response?: any;
}

/**
 * خطأ الملف
 */
export interface FileError extends BaseError {
    type: 'FILE_ERROR';
    code: 'FILE_NOT_FOUND' | 'FILE_READ_ERROR' | 'FILE_WRITE_ERROR' | 'FILE_UPLOAD_FAILED' | 'INVALID_FILE_TYPE' | 'INVALID_FILE_SIZE';
    filename?: string;
    filepath?: string;
    filesize?: number;
    filetype?: string;
}

/**
 * خطأ قاعدة البيانات
 */
export interface DatabaseError extends BaseError {
    type: 'DATABASE_ERROR';
    code: 'DATABASE_CONNECTION_FAILED' | 'DATABASE_QUERY_FAILED';
    query?: string;
    table?: string;
    operation?: string;
}

/**
 * خطأ API
 */
export interface APIError extends BaseError {
    type: 'API_ERROR';
    code: 'API_RATE_LIMIT_EXCEEDED' | 'API_ENDPOINT_NOT_FOUND' | 'API_INVALID_RESPONSE';
    endpoint?: string;
    method?: string;
    statusCode?: number;
    response?: any;
}

/**
 * خطأ غير معروف
 */
export interface UnknownError extends BaseError {
    type: 'UNKNOWN_ERROR';
    code: 'UNKNOWN_ERROR';
    originalError?: Error;
}

/**
 * اتحاد جميع أنواع الأخطاء
 */
export type AppError =
    | ValidationError
    | AuthenticationError
    | AuthorizationError
    | NetworkError
    | ServerError
    | ClientError
    | FileError
    | DatabaseError
    | APIError
    | UnknownError;

/**
 * خيارات إنشاء الخطأ
 */
export interface CreateErrorOptions {
    type: ErrorType;
    code: ErrorCode;
    message: string;
    level?: ErrorLevel;
    source?: ErrorSource;
    context?: Record<string, any>;
    originalError?: Error;
    field?: string;
    value?: any;
    expected?: any;
    userId?: string;
    token?: string;
    resource?: string;
    action?: string;
    url?: string;
    method?: string;
    statusCode?: number;
    response?: any;
    filename?: string;
    filepath?: string;
    filesize?: number;
    filetype?: string;
    query?: string;
    table?: string;
    operation?: string;
    endpoint?: string;
}

/**
 * خيارات معالجة الخطأ
 */
export interface HandleErrorOptions {
    showToast?: boolean;
    logError?: boolean;
    reportError?: boolean;
    context?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
}

/**
 * نتيجة معالجة الخطأ
 */
export interface ErrorHandlingResult {
    handled: boolean;
    message: string;
    level: ErrorLevel;
    action?: 'retry' | 'redirect' | 'reload' | 'none';
    retryAfter?: number;
}

/**
 * إحصائيات الأخطاء
 */
export interface ErrorStats {
    total: number;
    byType: Record<ErrorType, number>;
    byLevel: Record<ErrorLevel, number>;
    bySource: Record<ErrorSource, number>;
    byCode: Record<ErrorCode, number>;
    last24Hours: number;
    last7Days: number;
    last30Days: number;
}

/**
 * مساعد للتحقق من نوع الخطأ
 */
export const isValidationErrorType = (error: AppError): error is ValidationError => {
    return error.type === 'VALIDATION_ERROR';
};

export const isAuthenticationErrorType = (error: AppError): error is AuthenticationError => {
    return error.type === 'AUTHENTICATION_ERROR';
};

export const isAuthorizationErrorType = (error: AppError): error is AuthorizationError => {
    return error.type === 'AUTHORIZATION_ERROR';
};

export const isNetworkErrorType = (error: AppError): error is NetworkError => {
    return error.type === 'NETWORK_ERROR';
};

export const isServerErrorType = (error: AppError): error is ServerError => {
    return error.type === 'SERVER_ERROR';
};

export const isClientErrorType = (error: AppError): error is ClientError => {
    return error.type === 'CLIENT_ERROR';
};

export const isFileErrorType = (error: AppError): error is FileError => {
    return error.type === 'FILE_ERROR';
};

export const isDatabaseErrorType = (error: AppError): error is DatabaseError => {
    return error.type === 'DATABASE_ERROR';
};

export const isAPIErrorType = (error: AppError): error is APIError => {
    return error.type === 'API_ERROR';
};

export const isUnknownErrorType = (error: AppError): error is UnknownError => {
    return error.type === 'UNKNOWN_ERROR';
};

/**
 * مساعد للتحقق من مستوى الخطأ
 */
export const isCriticalError = (error: AppError): boolean => {
    return error.level === 'critical';
};

export const isHighError = (error: AppError): boolean => {
    return error.level === 'high';
};

export const isMediumError = (error: AppError): boolean => {
    return error.level === 'medium';
};

export const isLowError = (error: AppError): boolean => {
    return error.level === 'low';
};

/**
 * مساعد للتحقق من مصدر الخطأ
 */
export const isClientSideError = (error: AppError): boolean => {
    return error.source === 'client';
};

export const isServerSideError = (error: AppError): boolean => {
    return error.source === 'server';
};

export const isDatabaseError = (error: AppError): boolean => {
    return error.source === 'database';
};

export const isAPIError = (error: AppError): boolean => {
    return error.source === 'api';
};

export const isFileError = (error: AppError): boolean => {
    return error.source === 'file';
};

export const isNetworkError = (error: AppError): boolean => {
    return error.source === 'network';
};

export const isValidationError = (error: AppError): boolean => {
    return error.source === 'validation';
};

export const isAuthenticationError = (error: AppError): boolean => {
    return error.source === 'authentication';
};

export const isAuthorizationError = (error: AppError): boolean => {
    return error.source === 'authorization';
};
