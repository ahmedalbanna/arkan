/**
 * أنواع الخدمات المحسنة لتحسين Type Safety
 *
 * هذا الملف يحتوي على أنواع محسنة للخدمات مع استبدال `any`
 * بأنواع محددة ومفصلة
 */

import { NetworkError, TypedError, ValidationError } from './improved-types';

// ==================== أنواع الخدمات الأساسية ====================

/**
 * تكوين الخدمة محسن
 */
export interface ServiceConfig {
    name: string;
    version: string;
    baseUrl?: string;
    timeout?: number;
    retries?: number;
    cache?: boolean;
    logging?: boolean;
    metadata?: Record<string, unknown>;
}

/**
 * سياق الخدمة محسن
 */
export interface ServiceContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

/**
 * بيانات الخدمة محسنة
 */
export interface ServiceData<T = unknown> {
    id: string;
    type: string;
    data: T;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

// ==================== أنواع الأخطاء المحسنة ====================

/**
 * خطأ الخدمة محسن
 */
export interface ServiceError extends TypedError {
    service: string;
    operation: string;
    context?: ServiceContext;
    retryable: boolean;
    retryAfter?: number;
}

/**
 * خطأ التحقق من صحة الخدمة محسن
 */
export interface ServiceValidationError extends ValidationError {
    service: string;
    field: string;
    value?: unknown;
    expected?: string;
    received?: string;
}

/**
 * خطأ الشبكة للخدمة محسن
 */
export interface ServiceNetworkError extends NetworkError {
    service: string;
    endpoint: string;
    method: string;
    retryable: boolean;
}

// ==================== أنواع التخزين المؤقت المحسنة ====================

/**
 * إدخال التخزين المؤقت للخدمة محسن
 */
export interface ServiceCacheEntry<T = unknown> {
    key: string;
    value: T;
    service: string;
    expiresAt: string;
    metadata?: Record<string, unknown>;
}

/**
 * خيارات التخزين المؤقت للخدمة محسنة
 */
export interface ServiceCacheOptions {
    ttl?: number;
    maxSize?: number;
    strategy?: 'lru' | 'fifo' | 'lfu';
    persistent?: boolean;
    service?: string;
}

// ==================== أنواع المعالجة المحسنة ====================

/**
 * خيارات المعالجة للخدمة محسنة
 */
export interface ServiceProcessingOptions {
    timeout?: number;
    retries?: number;
    validate?: boolean;
    log?: boolean;
    cache?: boolean;
    parallel?: boolean;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * نتيجة المعالجة للخدمة محسنة
 */
export interface ServiceProcessingResult<T = unknown, E = ServiceError> {
    success: boolean;
    data?: T;
    error?: E;
    message?: string;
    metadata?: Record<string, unknown>;
    processingTime?: number;
    cacheHit?: boolean;
}

// ==================== أنواع العمليات المحسنة ====================

/**
 * عملية الخدمة محسنة
 */
export interface ServiceOperation<TInput = unknown, TOutput = unknown> {
    id: string;
    name: string;
    input: TInput;
    output?: TOutput;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    error?: ServiceError;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

/**
 * طلب العملية محسن
 */
export interface ServiceOperationRequest<T = unknown> {
    operation: string;
    data: T;
    options?: ServiceProcessingOptions;
    context?: ServiceContext;
    metadata?: Record<string, unknown>;
}

/**
 * استجابة العملية محسنة
 */
export interface ServiceOperationResponse<T = unknown> {
    operationId: string;
    data?: T;
    error?: ServiceError;
    success: boolean;
    message?: string;
    metadata?: Record<string, unknown>;
}

// ==================== أنواع الخدمات المتخصصة ====================

/**
 * خدمة المستخدم محسنة
 */
export interface UserServiceData {
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
 * خدمة المشروع محسنة
 */
export interface ProjectServiceData {
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
 * خدمة الفريق محسنة
 */
export interface TeamServiceData {
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
 * خدمة الوكلاء محسنة
 */
export interface AgentServiceData {
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

// ==================== أنواع الخدمات المتقدمة ====================

/**
 * خدمة التخزين المؤقت المتقدمة محسنة
 */
export interface AdvancedCacheServiceData {
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
 * خدمة المعالجة المتقدمة محسنة
 */
export interface AdvancedProcessingServiceData {
    id: string;
    type: string;
    input: unknown;
    output?: unknown;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    error?: ServiceError;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

/**
 * خدمة المراقبة محسنة
 */
export interface MonitoringServiceData {
    service: string;
    operation: string;
    status: 'success' | 'error' | 'warning';
    duration: number;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

// ==================== أنواع المساعدات ====================

/**
 * دالة التحقق من صحة الخدمة
 */
export type ServiceValidator<T> = (data: T) => boolean | string;

/**
 * دالة معالجة الخدمة
 */
export type ServiceProcessor<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

/**
 * دالة معالجة الخطأ للخدمة
 */
export type ServiceErrorHandler = (error: ServiceError) => void | Promise<void>;

/**
 * دالة تسجيل الخدمة
 */
export type ServiceLogger = (message: string, metadata?: Record<string, unknown>) => void;

// ==================== أنواع Generic محسنة ====================

/**
 * نتيجة العملية للخدمة محسنة
 */
export interface ServiceResult<T = unknown, E = ServiceError> {
    success: boolean;
    data?: T;
    error?: E;
    message?: string;
    metadata?: Record<string, unknown>;
    processingTime?: number;
}

/**
 * خيارات العملية للخدمة محسنة
 */
export interface ServiceOptions {
    timeout?: number;
    retries?: number;
    validate?: boolean;
    log?: boolean;
    cache?: boolean;
    context?: ServiceContext;
}

// ==================== أنواع الأدوات المساعدة ====================

/**
 * دالة المساعدة للتحقق من صحة الخدمة
 */
export function isValidServiceConfig(config: unknown): config is ServiceConfig {
    return (
        typeof config === 'object' &&
        config !== null &&
        'name' in config &&
        'version' in config &&
        typeof (config as ServiceConfig).name === 'string' &&
        typeof (config as ServiceConfig).version === 'string'
    );
}

/**
 * دالة المساعدة للتحقق من صحة سياق الخدمة
 */
export function isValidServiceContext(context: unknown): context is ServiceContext {
    return (
        typeof context === 'object' &&
        context !== null &&
        'timestamp' in context &&
        typeof (context as ServiceContext).timestamp === 'string'
    );
}

/**
 * دالة المساعدة للتحقق من صحة بيانات الخدمة
 */
export function isValidServiceData(data: unknown): data is ServiceData {
    return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'type' in data &&
        'data' in data &&
        'createdAt' in data &&
        'updatedAt' in data &&
        typeof (data as ServiceData).id === 'string' &&
        typeof (data as ServiceData).type === 'string' &&
        typeof (data as ServiceData).createdAt === 'string' &&
        typeof (data as ServiceData).updatedAt === 'string'
    );
}

/**
 * دالة المساعدة للتحقق من صحة خطأ الخدمة
 */
export function isValidServiceError(error: unknown): error is ServiceError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error &&
        'service' in error &&
        'operation' in error &&
        'retryable' in error &&
        typeof (error as ServiceError).code === 'string' &&
        typeof (error as ServiceError).message === 'string' &&
        typeof (error as ServiceError).service === 'string' &&
        typeof (error as ServiceError).operation === 'string' &&
        typeof (error as ServiceError).retryable === 'boolean'
    );
}

// جميع الأنواع مُصدَّرة بالفعل في بداية الملف
