/**
 * دوال مساعدة للخدمات الأساسية - Service Helpers v2.0
 *
 * دوال مساعدة عامة لاستخدام الخدمات وإدارتها
 */

import { BaseServiceV2, ServiceMonitor } from '../core/base-service';

/**
 * تسجيل خدمة في نظام المراقبة
 */
export function registerService(service: BaseServiceV2): void {
    const monitor = ServiceMonitor.getInstance();
    monitor.registerService(service);
}

/**
 * الحصول على حالة خدمة محددة
 */
export function getServiceHealth(serviceName: string) {
    const monitor = ServiceMonitor.getInstance();
    return monitor.getServiceHealth(serviceName);
}

/**
 * فحص صحة جميع الخدمات المسجلة
 */
export async function checkAllServicesHealth() {
    const monitor = ServiceMonitor.getInstance();
    return await monitor.checkAllServices();
}

/**
 * إنشاء خدمة جديدة بطريقة مبسطة
 */
export function createService<TInput, TOutput>(config: {
    name: string;
    category: 'core' | 'infrastructure' | 'business' | 'intelligent';
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    requiresAuth?: boolean;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    handler: (data: TInput) => Promise<TOutput>;
}) {
    console.log(`Service "${config.name}" created in category "${config.category}"`);
    return config;
}

/**
 * دالة مساعدة لقياس وقت تنفيذ العمليات
 */
export async function measureExecutionTime<T>(
    operation: () => Promise<T>,
    operationName?: string
): Promise<{ result: T; executionTime: number }> {
    const startTime = Date.now();

    try {
        const result = await operation();
        const executionTime = Date.now() - startTime;

        if (operationName) {
            console.log(`✅ ${operationName} completed in ${executionTime}ms`);
        }

        return { result, executionTime };
    } catch (error) {
        const executionTime = Date.now() - startTime;

        if (operationName) {
            console.error(`❌ ${operationName} failed after ${executionTime}ms:`, error);
        }

        throw error;
    }
}

/**
 * دالة مساعدة لتنفيذ العمليات مع إعادة المحاولة
 */
export async function executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
        maxRetries?: number;
        retryDelay?: number;
        backoffMultiplier?: number;
        operationName?: string;
    } = {}
): Promise<T> {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        backoffMultiplier = 2,
        operationName,
    } = options;

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                const delay = retryDelay * Math.pow(backoffMultiplier, attempt);

                if (operationName) {
                    console.warn(`${operationName} failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`);
                }

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    if (operationName) {
        console.error(`${operationName} failed after ${maxRetries} attempts`);
    }

    throw lastError;
}

/**
 * دالة مساعدة لتسجيل المقاييس
 */
export function recordMetric(name: string, value: number, tags?: Record<string, string>) {
    // يمكن تطوير هذه الدالة لاحقاً لتسجيل المقاييس في نظام المراقبة
    if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Metric: ${name} = ${value}`, tags ? { tags } : '');
    }
}

/**
 * دالة مساعدة لتسجيل الأحداث
 */
export function recordEvent(eventName: string, data?: Record<string, unknown>) {
    // يمكن تطوير هذه الدالة لاحقاً لتسجيل الأحداث في نظام التتبع
    if (process.env.NODE_ENV === 'development') {
        console.log(`📝 Event: ${eventName}`, data ? { data } : '');
    }
}

/**
 * دالة مساعدة للتحقق من صحة البيانات
 */
export function validateData<T>(data: unknown, validator: (data: unknown) => data is T): data is T {
    try {
        return validator(data);
    } catch {
        return false;
    }
}

/**
 * دالة مساعدة لتنسيق رسائل الخطأ
 */
export function formatError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'Unknown error occurred';
}

/**
 * دالة مساعدة لإنشاء معرف فريد
 */
export function generateId(prefix: string = ''): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}${timestamp}_${random}`;
}

/**
 * دالة مساعدة للتحقق من نوع البيانات
 */
export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * دالة مساعدة للتحقق من نوع المصفوفة
 */
export function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
}

/**
 * دالة مساعدة للتحقق من أن القيمة ليست فارغة
 */
export function isNotEmpty(value: unknown): boolean {
    if (value == null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (isObject(value)) return Object.keys(value).length > 0;
    return true;
}

/**
 * دالة مساعدة لتنظيف النصوص
 */
export function sanitizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
}

/**
 * دالة مساعدة لتقصير النصوص الطويلة
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}
