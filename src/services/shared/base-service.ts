/**
 * Base Service
 *
 * هذا الملف يحتوي على الخدمة الأساسية لجميع الخدمات
 * يوفر بنية موحدة لاستدعاء API endpoints
 */

import { z } from 'zod';

export abstract class BaseService<TInput = any, TOutput = any> {
    protected abstract endpoint: string;
    protected abstract method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    protected abstract inputSchema?: z.ZodSchema<TInput>;
    protected abstract requiresAuth: boolean;

    /**
     * استدعاء API endpoint
     */
    async call(data: TInput, token: string): Promise<TOutput> {
        try {
            // التحقق من صحة البيانات
            const validatedData = this.inputSchema ? this.validateInput(data) : data;

            // إعداد الطلب
            const requestConfig = this.prepareRequest(validatedData, token);

            // تنفيذ الطلب
            const response = await fetch(this.endpoint, requestConfig);

            // معالجة الاستجابة
            return await this.handleResponse(response);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * التحقق من صحة البيانات المدخلة
     */
    protected validateInput(data: TInput): TInput {
        if (!this.inputSchema) {
            return data;
        }

        const result = this.inputSchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }

        return result.data;
    }

    /**
     * إعداد الطلب
     */
    protected prepareRequest(data: TInput, token: string): RequestInit {
        const config: RequestInit = {
            method: this.method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // إضافة المصادقة إذا كانت مطلوبة
        if (this.requiresAuth && token) {
            config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${token}`,
            };
        }

        // إضافة البيانات للطلب
        if (this.method !== 'GET' && data) {
            config.body = JSON.stringify(data);
        }

        return config;
    }

    /**
     * معالجة الاستجابة
     */
    protected async handleResponse(response: Response): Promise<TOutput> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API call failed with status ${response.status}`);
        }

        const result = await response.json();

        // استخراج البيانات من هيكل الاستجابة المحسن
        return result.data || result;
    }

    /**
     * معالجة الأخطاء
     */
    protected handleError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }

        return new Error('Unknown error occurred');
    }
}

/**
 * خدمة للعمليات البسيطة (GET)
 */
export abstract class SimpleService<TOutput = any> {
    protected abstract endpoint: string;
    protected abstract requiresAuth: boolean;

    async call(token: string): Promise<TOutput> {
        try {
            const requestConfig: RequestInit = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (this.requiresAuth && token) {
                requestConfig.headers = {
                    ...requestConfig.headers,
                    'Authorization': `Bearer ${token}`,
                };
            }

            const response = await fetch(this.endpoint, requestConfig);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API call failed with status ${response.status}`);
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Unknown error occurred');
        }
    }
}

/**
 * خدمة للعمليات المعقدة (POST/PUT/DELETE)
 */
export abstract class ComplexService<TInput = any, TOutput = any> extends BaseService<TInput, TOutput> {
    protected method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST';
}

/**
 * خدمة للعمليات التي تتطلب ائتمانات
 */
export abstract class CreditBasedService<TInput = any, TOutput = any> extends ComplexService<TInput, TOutput> {
    protected abstract creditCost: number;

    async call(data: TInput, token: string): Promise<TOutput> {
        // يمكن إضافة منطق التحقق من الائتمانات هنا
        console.log(`This operation costs ${this.creditCost} credits`);
        return super.call(data, token);
    }
}

/**
 * خدمة للعمليات الإدارية
 */
export abstract class AdminService<TInput = any, TOutput = any> extends ComplexService<TInput, TOutput> {
    protected requiresAuth = true;

    async call(data: TInput, token: string): Promise<TOutput> {
        // يمكن إضافة منطق التحقق من الصلاحيات الإدارية هنا
        console.log('Admin operation requested');
        return super.call(data, token);
    }
}

/**
 * خدمة للعمليات العامة (بدون مصادقة)
 */
export abstract class PublicService<TInput = any, TOutput = any> extends BaseService<TInput, TOutput> {
    protected requiresAuth = false;
}

/**
 * خدمة للعمليات المحدودة
 */
export abstract class RateLimitedService<TInput = any, TOutput = any> extends ComplexService<TInput, TOutput> {
    protected abstract rateLimit: {
        windowMs: number;
        maxRequests: number;
    };

    async call(data: TInput, token: string): Promise<TOutput> {
        // يمكن إضافة منطق Rate Limiting هنا
        console.log(`Rate limit: ${this.rateLimit.maxRequests} requests per ${this.rateLimit.windowMs}ms`);
        return super.call(data, token);
    }
}
