/**
 * أنواع API Routes المحسنة لتحسين Type Safety
 *
 * هذا الملف يحتوي على أنواع محسنة لـ API Routes مع استبدال `any`
 * بأنواع محددة ومفصلة
 */

import { z } from 'zod';
import { NetworkError, TypedError, ValidationError } from './improved-types';

// ==================== أنواع الاستجابة الموحدة ====================

/**
 * استجابة API موحدة للنجاح
 */
export interface UnifiedApiResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
    timestamp: string;
    requestId: string;
}

/**
 * استجابة API موحدة للخطأ
 */
export interface UnifiedApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    timestamp: string;
    requestId: string;
}

/**
 * طلب API موحد
 */
export interface UnifiedApiRequest<T = unknown> {
    data: T;
    timestamp: string;
    requestId: string;
}

// ==================== أنواع المصادقة المحسنة ====================

/**
 * سياق المصادقة محسن
 */
export interface AuthContext {
    user: {
        id: string;
        email: string;
        role: 'user' | 'admin';
        teams?: string[];
    };
    token: string;
}

/**
 * خطأ المصادقة محسن
 */
export interface AuthError {
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INVALID_TOKEN';
    message: string;
}

/**
 * خطأ الأعمال محسن
 */
export interface BusinessError {
    code: 'INSUFFICIENT_CREDITS' | 'RATE_LIMIT_EXCEEDED' | 'RESOURCE_NOT_FOUND';
    message: string;
    details?: Record<string, unknown>;
}

// ==================== أنواع Middleware المحسنة ====================

/**
 * خيارات Middleware محسنة
 */
export interface ApiMiddlewareOptions {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    rateLimit?: {
        windowMs: number;
        maxRequests: number;
    };
    creditCost?: number;
    logging?: boolean;
}

/**
 * سياق معالج API محسن
 */
export interface ApiHandlerContext {
    request: Request;
    user: AuthContext['user'];
    params?: Record<string, string>;
    searchParams?: URLSearchParams;
}

/**
 * نوع معالج API محسن
 */
export type UnifiedApiHandler = (context: ApiHandlerContext) => Promise<Response>;

// ==================== أنواع التحقق من صحة البيانات ====================

/**
 * Schema لمعرف الطلب
 */
export const RequestIdSchema = z.string().uuid();

/**
 * Schema للطابع الزمني
 */
export const TimestampSchema = z.string().datetime();

/**
 * Schema أساسي لطلب API
 */
export const BaseApiRequestSchema = z.object({
    requestId: RequestIdSchema.optional(),
    timestamp: TimestampSchema.optional(),
});

/**
 * Schema أساسي لاستجابة API
 */
export const BaseApiResponseSchema = z.object({
    success: z.boolean(),
    timestamp: TimestampSchema,
    requestId: RequestIdSchema,
});

// ==================== أنواع الخدمات المحسنة ====================

/**
 * تكوين الخدمة محسن
 */
export interface ServiceConfig {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    requiresAuth: boolean;
    timeout?: number;
}

/**
 * استجابة الخدمة محسنة
 */
export interface ServiceResponse<T = unknown> {
    data: T;
    success: boolean;
    message?: string;
}

// ==================== أنواع التسجيل المحسنة ====================

/**
 * إدخال تسجيل API محسن
 */
export interface ApiLogEntry {
    requestId: string;
    userId: string;
    endpoint: string;
    method: string;
    timestamp: string;
    duration: number;
    statusCode: number;
    error?: string;
}

// ==================== أنواع Rate Limiting المحسنة ====================

/**
 * معلومات الحد من معدل الطلبات محسنة
 */
export interface RateLimitInfo {
    userId: string;
    windowStart: number;
    requestCount: number;
    maxRequests: number;
    windowMs: number;
}

// ==================== أنواع إدارة الائتمانات المحسنة ====================

/**
 * معاملة الائتمانات محسنة
 */
export interface CreditTransaction {
    userId: string;
    amount: number;
    type: 'deduct' | 'add';
    reason: string;
    timestamp: string;
    requestId: string;
}

// ==================== أنواع التحقق من الصلاحيات المحسنة ====================

/**
 * فحص الصلاحيات محسن
 */
export interface PermissionCheck {
    userId: string;
    resource: string;
    action: 'read' | 'write' | 'delete' | 'admin';
    context?: Record<string, unknown>;
}

/**
 * نتيجة الصلاحيات محسنة
 */
export interface PermissionResult {
    allowed: boolean;
    reason?: string;
}

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
export interface TypedApiHandler<TInput = unknown, TOutput = unknown> {
    handle: (context: ApiHandlerContext) => Promise<Response>;
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

// ==================== دوال التحقق من صحة البيانات المحسنة ====================

/**
 * دالة المساعدة للتحقق من صحة استجابة API موحدة
 */
export function isValidUnifiedApiResponse(response: unknown): response is UnifiedApiResponse {
    return (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        'data' in response &&
        'timestamp' in response &&
        'requestId' in response &&
        (response as UnifiedApiResponse).success === true &&
        typeof (response as UnifiedApiResponse).timestamp === 'string' &&
        typeof (response as UnifiedApiResponse).requestId === 'string'
    );
}

/**
 * دالة المساعدة للتحقق من صحة خطأ API موحد
 */
export function isValidUnifiedApiError(error: unknown): error is UnifiedApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'success' in error &&
        'error' in error &&
        'timestamp' in error &&
        'requestId' in error &&
        (error as UnifiedApiError).success === false &&
        typeof (error as UnifiedApiError).timestamp === 'string' &&
        typeof (error as UnifiedApiError).requestId === 'string' &&
        typeof (error as UnifiedApiError).error === 'object' &&
        (error as UnifiedApiError).error !== null &&
        'code' in (error as UnifiedApiError).error &&
        'message' in (error as UnifiedApiError).error &&
        typeof (error as UnifiedApiError).error.code === 'string' &&
        typeof (error as UnifiedApiError).error.message === 'string'
    );
}

/**
 * دالة المساعدة للتحقق من صحة سياق المصادقة
 */
export function isValidAuthContext(context: unknown): context is AuthContext {
    return (
        typeof context === 'object' &&
        context !== null &&
        'user' in context &&
        'token' in context &&
        typeof (context as AuthContext).token === 'string' &&
        typeof (context as AuthContext).user === 'object' &&
        (context as AuthContext).user !== null &&
        'id' in (context as AuthContext).user &&
        'email' in (context as AuthContext).user &&
        'role' in (context as AuthContext).user &&
        typeof (context as AuthContext).user.id === 'string' &&
        typeof (context as AuthContext).user.email === 'string' &&
        typeof (context as AuthContext).user.role === 'string'
    );
}

/**
 * دالة المساعدة للتحقق من صحة سياق معالج API
 */
export function isValidApiHandlerContext(context: unknown): context is ApiHandlerContext {
    return (
        typeof context === 'object' &&
        context !== null &&
        'request' in context &&
        'user' in context &&
        (context as ApiHandlerContext).request instanceof Request &&
        typeof (context as ApiHandlerContext).user === 'object' &&
        (context as ApiHandlerContext).user !== null &&
        'id' in (context as ApiHandlerContext).user &&
        'email' in (context as ApiHandlerContext).user &&
        'role' in (context as ApiHandlerContext).user
    );
}

/**
 * دالة المساعدة للتحقق من صحة تكوين الخدمة
 */
export function isValidServiceConfig(config: unknown): config is ServiceConfig {
    return (
        typeof config === 'object' &&
        config !== null &&
        'endpoint' in config &&
        'method' in config &&
        'requiresAuth' in config &&
        typeof (config as ServiceConfig).endpoint === 'string' &&
        typeof (config as ServiceConfig).method === 'string' &&
        typeof (config as ServiceConfig).requiresAuth === 'boolean' &&
        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes((config as ServiceConfig).method)
    );
}

/**
 * دالة المساعدة للتحقق من صحة إدخال تسجيل API
 */
export function isValidApiLogEntry(entry: unknown): entry is ApiLogEntry {
    return (
        typeof entry === 'object' &&
        entry !== null &&
        'requestId' in entry &&
        'userId' in entry &&
        'endpoint' in entry &&
        'method' in entry &&
        'timestamp' in entry &&
        'duration' in entry &&
        'statusCode' in entry &&
        typeof (entry as ApiLogEntry).requestId === 'string' &&
        typeof (entry as ApiLogEntry).userId === 'string' &&
        typeof (entry as ApiLogEntry).endpoint === 'string' &&
        typeof (entry as ApiLogEntry).method === 'string' &&
        typeof (entry as ApiLogEntry).timestamp === 'string' &&
        typeof (entry as ApiLogEntry).duration === 'number' &&
        typeof (entry as ApiLogEntry).statusCode === 'number'
    );
}

/**
 * دالة المساعدة للتحقق من صحة معلومات الحد من معدل الطلبات
 */
export function isValidRateLimitInfo(info: unknown): info is RateLimitInfo {
    return (
        typeof info === 'object' &&
        info !== null &&
        'userId' in info &&
        'windowStart' in info &&
        'requestCount' in info &&
        'maxRequests' in info &&
        'windowMs' in info &&
        typeof (info as RateLimitInfo).userId === 'string' &&
        typeof (info as RateLimitInfo).windowStart === 'number' &&
        typeof (info as RateLimitInfo).requestCount === 'number' &&
        typeof (info as RateLimitInfo).maxRequests === 'number' &&
        typeof (info as RateLimitInfo).windowMs === 'number'
    );
}

/**
 * دالة المساعدة للتحقق من صحة معاملة الائتمانات
 */
export function isValidCreditTransaction(transaction: unknown): transaction is CreditTransaction {
    return (
        typeof transaction === 'object' &&
        transaction !== null &&
        'userId' in transaction &&
        'amount' in transaction &&
        'type' in transaction &&
        'reason' in transaction &&
        'timestamp' in transaction &&
        'requestId' in transaction &&
        typeof (transaction as CreditTransaction).userId === 'string' &&
        typeof (transaction as CreditTransaction).amount === 'number' &&
        typeof (transaction as CreditTransaction).type === 'string' &&
        typeof (transaction as CreditTransaction).reason === 'string' &&
        typeof (transaction as CreditTransaction).timestamp === 'string' &&
        typeof (transaction as CreditTransaction).requestId === 'string' &&
        ['deduct', 'add'].includes((transaction as CreditTransaction).type)
    );
}

/**
 * دالة المساعدة للتحقق من صحة فحص الصلاحيات
 */
export function isValidPermissionCheck(check: unknown): check is PermissionCheck {
    return (
        typeof check === 'object' &&
        check !== null &&
        'userId' in check &&
        'resource' in check &&
        'action' in check &&
        typeof (check as PermissionCheck).userId === 'string' &&
        typeof (check as PermissionCheck).resource === 'string' &&
        typeof (check as PermissionCheck).action === 'string' &&
        ['read', 'write', 'delete', 'admin'].includes((check as PermissionCheck).action)
    );
}

/**
 * دالة المساعدة للتحقق من صحة نتيجة الصلاحيات
 */
export function isValidPermissionResult(result: unknown): result is PermissionResult {
    return (
        typeof result === 'object' &&
        result !== null &&
        'allowed' in result &&
        typeof (result as PermissionResult).allowed === 'boolean' &&
        (!('reason' in result) || typeof (result as PermissionResult).reason === 'string')
    );
}

// جميع الأنواع مُصدَّرة بالفعل في بداية الملف
