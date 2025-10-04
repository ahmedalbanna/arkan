/**
 * الخدمة الأساسية المحسنة مع أنواع محددة
 *
 * هذا الملف يحتوي على الخدمة الأساسية مع تحسينات Type Safety
 * واستبدال جميع استخدامات `any` بأنواع محددة
 */

import { ProcessOptions, ProcessResult } from './improved-types';

// أنواع البيانات الأساسية للخدمات
export interface ServiceConfig {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    requiresAuth: boolean;
    timeout?: number;
    retries?: number;
}

export interface ServiceContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    metadata?: Record<string, unknown>;
}

// أنواع البيانات المحسنة
export interface ServiceData {
    id: string;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, unknown>;
}

export interface ServiceResponse<T = unknown> {
    data: T;
    success: boolean;
    message?: string;
    metadata?: Record<string, unknown>;
}

// أنواع الأخطاء المحسنة
export interface ServiceError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
    timestamp: string;
}

// أنواع التحقق من الصحة
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
    code?: string;
}

// أنواع التخزين المؤقت
export interface CacheEntry<T = unknown> {
    key: string;
    value: T;
    expiresAt: string;
    metadata?: Record<string, unknown>;
}

export interface CacheOptions {
    ttl?: number;
    maxSize?: number;
    strategy?: 'lru' | 'fifo' | 'lfu';
    persistent?: boolean;
}

// أنواع المعالجة
export interface ProcessingOptions extends ProcessOptions {
    validate?: boolean;
    cache?: boolean;
    log?: boolean;
    retry?: boolean;
}

export interface ProcessingResult<T = unknown, E = ServiceError> extends ProcessResult<T, E> {
    metadata?: Record<string, unknown>;
    duration?: number;
}

/**
 * الخدمة الأساسية المحسنة
 */
export abstract class BaseService<TInput = unknown, TOutput = unknown> {
    protected config: ServiceConfig;
    protected context?: ServiceContext;
    protected cache?: Map<string, CacheEntry<TOutput>>;

    constructor(config: ServiceConfig, context?: ServiceContext) {
        this.config = config;
        this.context = context;
        this.cache = new Map();
    }

    /**
     * تنفيذ العملية الأساسية
     */
    protected abstract execute(input: TInput): Promise<TOutput>;

    /**
     * التحقق من صحة البيانات
     */
    protected abstract validate(input: TInput): ValidationResult;

    /**
     * معالجة البيانات قبل التنفيذ
     */
    protected preProcess(input: TInput): TInput {
        return input;
    }

    /**
     * معالجة البيانات بعد التنفيذ
     */
    protected postProcess(output: TOutput): TOutput {
        return output;
    }

    /**
     * معالجة الأخطاء
     */
    protected handleError(error: unknown, context: string): ServiceError {
        const serviceError: ServiceError = {
            code: 'SERVICE_ERROR',
            message: 'حدث خطأ في الخدمة',
            timestamp: new Date().toISOString(),
        };

        if (error instanceof Error) {
            serviceError.message = error.message;
            serviceError.stack = error.stack;
        }

        if (typeof error === 'object' && error !== null) {
            serviceError.details = error as Record<string, unknown>;
        }

        return serviceError;
    }

    /**
     * التحقق من التخزين المؤقت
     */
    protected getFromCache(key: string): TOutput | null {
        if (!this.cache) return null;

        const entry = this.cache.get(key);
        if (!entry) return null;

        if (new Date(entry.expiresAt) < new Date()) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * حفظ في التخزين المؤقت
     */
    protected setCache(key: string, value: TOutput, ttl: number = 300): void {
        if (!this.cache) return;

        const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
        this.cache.set(key, {
            key,
            value,
            expiresAt,
            metadata: {
                createdAt: new Date().toISOString(),
                ttl,
            },
        });
    }

    /**
     * إنشاء مفتاح التخزين المؤقت
     */
    protected createCacheKey(input: TInput): string {
        const inputStr = JSON.stringify(input);
        const contextStr = this.context ? JSON.stringify(this.context) : '';
        return `${this.config.endpoint}:${Buffer.from(inputStr + contextStr).toString('base64')}`;
    }

    /**
     * تنفيذ الخدمة مع معالجة شاملة
     */
    async process(input: TInput, options: ProcessingOptions = {}): Promise<ProcessingResult<TOutput, ServiceError>> {
        const startTime = Date.now();
        const requestId = this.context?.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            // التحقق من التخزين المؤقت
            if (options.cache !== false) {
                const cacheKey = this.createCacheKey(input);
                const cachedResult = this.getFromCache(cacheKey);
                if (cachedResult) {
                    return {
                        success: true,
                        data: cachedResult,
                        message: 'تم استرجاع البيانات من التخزين المؤقت',
                        metadata: {
                            requestId,
                            cached: true,
                            duration: Date.now() - startTime,
                        },
                    };
                }
            }

            // التحقق من صحة البيانات
            if (options.validate !== false) {
                const validation = this.validate(input);
                if (!validation.isValid) {
                    return {
                        success: false,
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'فشل في التحقق من صحة البيانات',
                            details: { errors: validation.errors },
                            timestamp: new Date().toISOString(),
                        },
                        message: 'فشل في التحقق من صحة البيانات',
                        metadata: {
                            requestId,
                            duration: Date.now() - startTime,
                        },
                    };
                }
            }

            // معالجة البيانات قبل التنفيذ
            const processedInput = this.preProcess(input);

            // تنفيذ العملية
            const result = await this.execute(processedInput);

            // معالجة البيانات بعد التنفيذ
            const processedResult = this.postProcess(result);

            // حفظ في التخزين المؤقت
            if (options.cache !== false) {
                const cacheKey = this.createCacheKey(input);
                this.setCache(cacheKey, processedResult);
            }

            return {
                success: true,
                data: processedResult,
                message: 'تم تنفيذ العملية بنجاح',
                metadata: {
                    requestId,
                    duration: Date.now() - startTime,
                },
            };

        } catch (error) {
            const serviceError = this.handleError(error, 'process');

            return {
                success: false,
                error: serviceError,
                message: 'فشل في تنفيذ العملية',
                metadata: {
                    requestId,
                    duration: Date.now() - startTime,
                },
            };
        }
    }

    /**
     * تنظيف التخزين المؤقت
     */
    clearCache(): void {
        if (this.cache) {
            this.cache.clear();
        }
    }

    /**
     * الحصول على إحصائيات التخزين المؤقت
     */
    getCacheStats(): { size: number; entries: string[] } {
        if (!this.cache) {
            return { size: 0, entries: [] };
        }

        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()),
        };
    }
}

// أنواع المساعدات
export type ServiceFactory<T extends BaseService> = (config: ServiceConfig, context?: ServiceContext) => T;

export interface ServiceRegistry {
    [key: string]: ServiceFactory<BaseService>;
}

// دالة المساعدة لإنشاء الخدمات
export function createService<T extends BaseService>(
    ServiceClass: new (config: ServiceConfig, context?: ServiceContext) => T,
    config: ServiceConfig,
    context?: ServiceContext
): T {
    return new ServiceClass(config, context);
}

// دالة المساعدة للتحقق من صحة البيانات
export function validateInput<T>(
    input: unknown,
    validator: (value: unknown) => value is T
): ValidationResult {
    if (validator(input)) {
        return {
            isValid: true,
            errors: [],
        };
    }

    return {
        isValid: false,
        errors: [
            {
                field: 'input',
                message: 'نوع البيانات غير صحيح',
                value: input,
                code: 'INVALID_TYPE',
            },
        ],
    };
}

// دالة المساعدة لإنشاء خطأ الخدمة
export function createServiceError(
    code: string,
    message: string,
    details?: Record<string, unknown>
): ServiceError {
    return {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
    };
}

// جميع الأنواع مُصدَّرة بالفعل في بداية الملف
