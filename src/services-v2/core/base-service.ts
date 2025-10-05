/**
 * Base Service - Enhanced v2.0
 *
 * خدمة أساسية محسنة تدعم قابلية التوسع والمرونة
 * توفر بنية موحدة لجميع الخدمات مع دعم متقدم للأخطاء والتسجيل
 */

import { z } from 'zod';

// أنواع محسنة للخدمات
export interface ServiceConfig {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    requiresAuth: boolean;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

export interface ServiceMetadata {
    name: string;
    version: string;
    description: string;
    category: 'core' | 'infrastructure' | 'business' | 'intelligent';
    dependencies: string[];
    performance: {
        averageResponseTime: number;
        successRate: number;
        lastHealthCheck: Date;
    };
}

export interface ServiceHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    errorRate: number;
    lastChecked: Date;
    issues: string[];
}

/**
 * خدمة أساسية محسنة مع دعم مراقبة الأداء والأخطاء
 */
export abstract class BaseServiceV2 {
    protected config: ServiceConfig;
    protected metadata: ServiceMetadata;
    protected healthStatus: ServiceHealth;

    constructor(config: ServiceConfig, metadata: ServiceMetadata) {
        this.config = config;
        this.metadata = metadata;
        this.healthStatus = {
            status: 'healthy',
            responseTime: 0,
            errorRate: 0,
            lastChecked: new Date(),
            issues: []
        };
    }

    /**
     * استدعاء API مع مراقبة الأداء والأخطاء
     */
    async call<TInput = unknown, TOutput = unknown>(
        data: TInput,
        token?: string,
        options?: {
            skipValidation?: boolean;
            skipRetry?: boolean;
            timeout?: number;
        }
    ): Promise<TOutput> {
        const startTime = Date.now();

        try {
            // التحقق من صحة البيانات إذا لم يتم تخطيه
            const validatedData = options?.skipValidation ? data : this.validateInput(data);

            // إعداد الطلب مع مراقبة الوقت
            const requestConfig = this.prepareRequest(validatedData, token);

            // تنفيذ الطلب مع إعادة المحاولة إذا لزم الأمر
            const response = await this.executeRequest(requestConfig, options);

            // قياس وقت الاستجابة
            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);

            // معالجة الاستجابة
            return await this.handleResponse(response);
        } catch (error) {
            // قياس وقت الاستجابة حتى في حالة الخطأ
            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, false);

            // معالجة الأخطاء مع إعادة المحاولة إذا لزم الأمر
            if (!options?.skipRetry) {
                return await this.handleErrorWithRetry(error, data, token, options);
            }

            throw this.handleError(error);
        }
    }

    /**
     * التحقق من صحة البيانات المدخلة
     */
    protected abstract validateInput(data: unknown): unknown;

    /**
     * إعداد الطلب
     */
    protected prepareRequest(data: unknown, token?: string): RequestInit {
        const config: RequestInit = {
            method: this.config.method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // إضافة المصادقة إذا كانت مطلوبة
        if (this.config.requiresAuth && token) {
            config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${token}`,
            };
        }

        // إضافة البيانات للطلب
        if (this.config.method !== 'GET' && data) {
            config.body = JSON.stringify(data);
        }

        return config;
    }

    /**
     * تنفيذ الطلب مع إعادة المحاولة
     */
    protected async executeRequest(
        requestConfig: RequestInit,
        options?: { timeout?: number }
    ): Promise<Response> {
        const controller = new AbortController();
        const timeout = options?.timeout || this.config.timeout || 30000;

        // إعداد مهلة الطلب
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(this.config.endpoint, {
                ...requestConfig,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Request timeout after ${timeout}ms`);
            }
            throw error;
        }
    }

    /**
     * معالجة الاستجابة مع دعم أفضل للأخطاء
     */
    protected async handleResponse(response: Response): Promise<unknown> {
        // معالجة أكواد الحالة المختلفة
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // تصنيف الأخطاء حسب كود الحالة
            switch (response.status) {
                case 400:
                    throw new Error(`Bad Request: ${errorData.message || 'Invalid input data'}`);
                case 401:
                    throw new Error('Unauthorized: Authentication required');
                case 403:
                    throw new Error('Forbidden: Access denied');
                case 404:
                    throw new Error('Not Found: Resource does not exist');
                case 429:
                    throw new Error('Too Many Requests: Rate limit exceeded');
                case 500:
                    throw new Error('Internal Server Error: Server error occurred');
                default:
                    throw new Error(errorData.message || `API call failed with status ${response.status}`);
            }
        }

        const result = await response.json();

        // استخراج البيانات من هيكل الاستجابة المحسن
        return result.data || result;
    }

    /**
     * معالجة الأخطاء مع إعادة المحاولة
     */
    protected async handleErrorWithRetry<TInput>(
        error: unknown,
        data: TInput,
        token?: string,
        options?: { skipRetry?: boolean }
    ): Promise<unknown> {
        const maxRetries = this.config.retries || 3;
        const retryDelay = this.config.retryDelay || 1000;

        // تحديد ما إذا كان الخطأ قابلاً لإعادة المحاولة
        if (!this.isRetryableError(error) || options?.skipRetry) {
            throw this.handleError(error);
        }

        // إعادة المحاولة مع تأخير متزايد
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            await this.delay(retryDelay * attempt);

            try {
                return await this.call(data, token, { ...options, skipRetry: true });
            } catch (retryError) {
                if (attempt === maxRetries) {
                    throw this.handleError(retryError);
                }
            }
        }

        throw this.handleError(error);
    }

    /**
     * تحديد ما إذا كان الخطأ قابلاً لإعادة المحاولة
     */
    protected isRetryableError(error: unknown): boolean {
        if (error instanceof Error) {
            // الأخطاء التي يمكن إعادة المحاولة عليها
            const retryableErrors = [
                'Network Error',
                'Timeout',
                'ECONNRESET',
                'ENOTFOUND',
                '500',
                '502',
                '503',
                '504'
            ];

            return retryableErrors.some(retryableError =>
                error.message.includes(retryableError)
            );
        }

        return false;
    }

    /**
     * تحديث مقاييس الأداء
     */
    protected updatePerformanceMetrics(responseTime: number, success: boolean): void {
        // تحديث مقاييس الأداء البسيطة
        this.healthStatus.responseTime = responseTime;
        this.healthStatus.lastChecked = new Date();

        if (success) {
            this.healthStatus.status = 'healthy';
        } else {
            // تحديث معدل الأخطاء
            this.healthStatus.errorRate = Math.min(this.healthStatus.errorRate + 0.1, 1);
            if (this.healthStatus.errorRate > 0.5) {
                this.healthStatus.status = 'degraded';
            }
        }
    }

    /**
     * معالجة الأخطاء العامة
     */
    protected handleError(error: unknown): Error {
        // تسجيل الخطأ للمراقبة
        console.error(`Service ${this.metadata.name} error:`, error);

        if (error instanceof Error) {
            return error;
        }

        return new Error('Unknown error occurred');
    }

    /**
     * تأخير لإعادة المحاولة
     */
    protected delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * الحصول على حالة صحة الخدمة
     */
    getHealthStatus(): ServiceMetadata & ServiceHealth {
        return {
            ...this.metadata,
            ...this.healthStatus
        };
    }

    /**
     * فحص صحة الخدمة
     */
    async checkHealth(): Promise<ServiceHealth> {
        try {
            const startTime = Date.now();
            // فحص بسيط - يمكن تخصيصه حسب نوع الخدمة
            const response = await fetch(`${this.config.endpoint.replace(/\/[^\/]*$/, '')}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const responseTime = Date.now() - startTime;
            this.healthStatus = {
                status: response.ok ? 'healthy' : 'unhealthy',
                responseTime,
                errorRate: response.ok ? 0 : 1,
                lastChecked: new Date(),
                issues: response.ok ? [] : ['Health check failed']
            };
        } catch (error) {
            this.healthStatus = {
                status: 'unhealthy',
                responseTime: 0,
                errorRate: 1,
                lastChecked: new Date(),
                issues: ['Health check error']
            };
        }

        return this.healthStatus;
    }
}

/**
 * خدمة بسيطة للعمليات GET
 */
export abstract class SimpleServiceV2<TOutput = unknown> extends BaseServiceV2 {
    protected method: 'GET' = 'GET';

    protected validateInput(data: unknown): unknown {
        // العمليات البسيطة لا تحتاج عادة إلى التحقق من البيانات
        return data;
    }
}

/**
 * خدمة معقدة للعمليات CRUD
 */
export abstract class ComplexServiceV2<TInput = unknown, TOutput = unknown> extends BaseServiceV2 {
    protected method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST';
    protected abstract inputSchema?: z.ZodSchema<TInput>;

    protected validateInput(data: unknown): TInput {
        if (!this.inputSchema) {
            return data as TInput;
        }

        const result = this.inputSchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }

        return result.data;
    }
}

/**
 * خدمة ذكية مع دعم متقدم للذكاء الاصطناعي
 */
export abstract class IntelligentServiceV2<TInput = unknown, TOutput = unknown> extends ComplexServiceV2<TInput, TOutput> {
    protected abstract aiConfig: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        enableCaching?: boolean;
        enableQualityCheck?: boolean;
    };

    /**
     * استدعاء ذكي مع تحسينات الذكاء الاصطناعي
     */
    async intelligentCall<TInput, TOutput>(
        data: TInput,
        token?: string,
        aiOptions?: {
            model?: string;
            temperature?: number;
            maxTokens?: number;
            enableCaching?: boolean;
            enableQualityCheck?: boolean;
        }
    ): Promise<TOutput> {
        const startTime = Date.now();

        try {
            // دمج خيارات الذكاء الاصطناعي
            const mergedOptions = { ...this.aiConfig, ...aiOptions };

            // إضافة معالجة ذكية للبيانات
            const processedData = await this.preprocessData(data, mergedOptions);

            // استدعاء الخدمة الأساسية
            const result = await this.call(processedData, token);

            // معالجة ما بعد الاستدعاء
            const finalResult = await this.postprocessResult(result, mergedOptions);

            // قياس وقت الاستجابة
            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);

            return finalResult;
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, false);
            throw this.handleError(error);
        }
    }

    /**
     * معالجة البيانات قبل الاستدعاء
     */
    protected abstract preprocessData(data: TInput, options: any): Promise<TInput>;

    /**
     * معالجة النتائج بعد الاستدعاء
     */
    protected abstract postprocessResult(result: TOutput, options: any): Promise<TOutput>;
}

/**
 * خدمة مراقبة الأداء
 */
export class ServiceMonitor {
    private static instance: ServiceMonitor;
    private services: Map<string, BaseServiceV2> = new Map();

    static getInstance(): ServiceMonitor {
        if (!ServiceMonitor.instance) {
            ServiceMonitor.instance = new ServiceMonitor();
        }
        return ServiceMonitor.instance;
    }

    registerService(service: BaseServiceV2): void {
        this.services.set(service.metadata.name, service);
    }

    async checkAllServices(): Promise<Map<string, ServiceHealth>> {
        const results = new Map<string, ServiceHealth>();

        for (const [name, service] of this.services) {
            results.set(name, await service.checkHealth());
        }

        return results;
    }

    getServiceHealth(serviceName: string): ServiceHealth | undefined {
        const service = this.services.get(serviceName);
        return service?.getHealthStatus();
    }
}
