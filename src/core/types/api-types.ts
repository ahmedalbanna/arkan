/**
 * أنواع API Routes المحسنة لتحسين Type Safety
 *
 * هذا الملف يحتوي على أنواع محسنة لـ API Routes مع استبدال `any`
 * بأنواع محددة ومفصلة
 */

import { NetworkError, TypedError, ValidationError } from './improved-types';

// ==================== أنواع الطلبات والاستجابات الأساسية ====================

/**
 * طلب API محسن
 */
export interface ApiRequest<T = unknown> {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    data?: T;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    query?: Record<string, string>;
    timeout?: number;
    retries?: number;
}

/**
 * استجابة API محسنة
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: TypedError;
    message?: string;
    status: number;
    headers?: Record<string, string>;
    timestamp: string;
    requestId: string;
}

/**
 * طلب API محسن مع أنواع محددة
 */
export interface TypedApiRequest<TInput = unknown, TOutput = unknown> {
    input: TInput;
    output?: TOutput;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    query?: Record<string, string>;
    timeout?: number;
    retries?: number;
    validate?: boolean;
    cache?: boolean;
}

/**
 * استجابة API محسنة مع أنواع محددة
 */
export interface TypedApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: TypedError;
    message?: string;
    status: number;
    headers?: Record<string, string>;
    timestamp: string;
    requestId: string;
    metadata?: Record<string, unknown>;
}

// ==================== أنواع الأخطاء المحسنة ====================

/**
 * خطأ API محسن
 */
export interface ApiError extends TypedError {
    endpoint: string;
    method: string;
    status: number;
    retryable: boolean;
    retryAfter?: number;
    details?: Record<string, unknown>;
}

/**
 * خطأ التحقق من صحة API محسن
 */
export interface ApiValidationError extends ValidationError {
    endpoint: string;
    field: string;
    value?: unknown;
    expected?: string;
    received?: string;
    schema?: Record<string, unknown>;
}

/**
 * خطأ الشبكة للـ API محسن
 */
export interface ApiNetworkError extends NetworkError {
    endpoint: string;
    method: string;
    retryable: boolean;
    retryCount?: number;
    maxRetries?: number;
}

// ==================== أنواع المعالجة المحسنة ====================

/**
 * معالج API محسن
 */
export interface ApiHandler<TInput = unknown, TOutput = unknown> {
    handle: (input: TInput) => Promise<TypedApiResponse<TOutput>>;
    validate?: (input: TInput) => boolean | string;
    authorize?: (input: TInput) => boolean | string;
    log?: (input: TInput, output: TypedApiResponse<TOutput>) => void;
}

/**
 * خيارات معالجة API محسنة
 */
export interface ApiProcessingOptions {
    timeout?: number;
    retries?: number;
    validate?: boolean;
    authorize?: boolean;
    log?: boolean;
    cache?: boolean;
    rateLimit?: {
        max: number;
        window: number;
    };
}

/**
 * نتيجة معالجة API محسنة
 */
export interface ApiProcessingResult<T = unknown, E = ApiError> {
    success: boolean;
    data?: T;
    error?: E;
    message?: string;
    metadata?: Record<string, unknown>;
    processingTime?: number;
    cacheHit?: boolean;
    rateLimited?: boolean;
}

// ==================== أنواع العمليات المحسنة ====================

/**
 * عملية API محسنة
 */
export interface ApiOperation<TInput = unknown, TOutput = unknown> {
    id: string;
    name: string;
    input: TInput;
    output?: TOutput;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    error?: ApiError;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

/**
 * طلب العملية محسن
 */
export interface ApiOperationRequest<T = unknown> {
    operation: string;
    data: T;
    options?: ApiProcessingOptions;
    metadata?: Record<string, unknown>;
}

/**
 * استجابة العملية محسنة
 */
export interface ApiOperationResponse<T = unknown> {
    operationId: string;
    data?: T;
    error?: ApiError;
    success: boolean;
    message?: string;
    metadata?: Record<string, unknown>;
}

// ==================== أنواع API المتخصصة ====================

/**
 * API المستخدم محسن
 */
export interface UserApiData {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin' | 'moderator';
    status: 'active' | 'inactive' | 'suspended';
    preferences?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

/**
 * API المشروع محسن
 */
export interface ProjectApiData {
    id: string;
    name: string;
    description?: string;
    type: 'proposal' | 'report' | 'presentation' | 'academic';
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    ownerId: string;
    teamIds: string[];
    content?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

/**
 * API الفريق محسن
 */
export interface TeamApiData {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    memberIds: string[];
    permissions: Record<string, string[]>;
    settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

/**
 * API الوكلاء محسن
 */
export interface AgentApiData {
    id: string;
    name: string;
    description?: string;
    type: 'ai' | 'automation' | 'integration';
    status: 'active' | 'inactive' | 'maintenance';
    capabilities: string[];
    configuration?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

// ==================== أنواع API المتقدمة ====================

/**
 * API التخزين المؤقت المتقدم محسن
 */
export interface AdvancedCacheApiData {
    key: string;
    value: unknown;
    ttl: number;
    tags: string[];
    priority: 'low' | 'normal' | 'high';
    metadata?: Record<string, unknown>;
    createdAt: string;
    expiresAt: string;
}

/**
 * API المعالجة المتقدمة محسن
 */
export interface AdvancedProcessingApiData {
    id: string;
    type: string;
    input: unknown;
    output?: unknown;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    error?: ApiError;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

/**
 * API المراقبة محسن
 */
export interface MonitoringApiData {
    endpoint: string;
    method: string;
    status: 'success' | 'error' | 'warning';
    duration: number;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

// ==================== أنواع المساعدات ====================

/**
 * دالة التحقق من صحة API
 */
export type ApiValidator<T> = (data: T) => boolean | string;

/**
 * دالة معالجة API
 */
export type ApiProcessor<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

/**
 * دالة معالجة الخطأ للـ API
 */
export type ApiErrorHandler = (error: ApiError) => void | Promise<void>;

/**
 * دالة تسجيل API
 */
export type ApiLogger = (message: string, metadata?: Record<string, unknown>) => void;

// ==================== أنواع Generic محسنة ====================

/**
 * نتيجة العملية للـ API محسنة
 */
export interface ApiResult<T = unknown, E = ApiError> {
    success: boolean;
    data?: T;
    error?: E;
    message?: string;
    metadata?: Record<string, unknown>;
    processingTime?: number;
}

/**
 * خيارات العملية للـ API محسنة
 */
export interface ApiOptions {
    timeout?: number;
    retries?: number;
    validate?: boolean;
    log?: boolean;
    cache?: boolean;
    rateLimit?: {
        max: number;
        window: number;
    };
}

// ==================== أنواع الأدوات المساعدة ====================

/**
 * دالة المساعدة للتحقق من صحة طلب API
 */
export function isValidApiRequest(request: unknown): request is ApiRequest {
    return (
        typeof request === 'object' &&
        request !== null &&
        'method' in request &&
        'url' in request &&
        typeof (request as ApiRequest).method === 'string' &&
        typeof (request as ApiRequest).url === 'string'
    );
}

/**
 * دالة المساعدة للتحقق من صحة استجابة API
 */
export function isValidApiResponse(response: unknown): response is ApiResponse {
    return (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        'status' in response &&
        'timestamp' in response &&
        'requestId' in response &&
        typeof (response as ApiResponse).success === 'boolean' &&
        typeof (response as ApiResponse).status === 'number' &&
        typeof (response as ApiResponse).timestamp === 'string' &&
        typeof (response as ApiResponse).requestId === 'string'
    );
}

/**
 * دالة المساعدة للتحقق من صحة خطأ API
 */
export function isValidApiError(error: unknown): error is ApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error &&
        'endpoint' in error &&
        'method' in error &&
        'status' in error &&
        'retryable' in error &&
        typeof (error as ApiError).code === 'string' &&
        typeof (error as ApiError).message === 'string' &&
        typeof (error as ApiError).endpoint === 'string' &&
        typeof (error as ApiError).method === 'string' &&
        typeof (error as ApiError).status === 'number' &&
        typeof (error as ApiError).retryable === 'boolean'
    );
}

/**
 * دالة المساعدة للتحقق من صحة عملية API
 */
export function isValidApiOperation(operation: unknown): operation is ApiOperation {
    return (
        typeof operation === 'object' &&
        operation !== null &&
        'id' in operation &&
        'name' in operation &&
        'input' in operation &&
        'status' in operation &&
        'createdAt' in operation &&
        'updatedAt' in operation &&
        typeof (operation as ApiOperation).id === 'string' &&
        typeof (operation as ApiOperation).name === 'string' &&
        typeof (operation as ApiOperation).status === 'string' &&
        typeof (operation as ApiOperation).createdAt === 'string' &&
        typeof (operation as ApiOperation).updatedAt === 'string'
    );
}

// جميع الأنواع مُصدَّرة بالفعل في بداية الملف
