/**
 * محسن API
 *
 * هذا الملف يحتوي على نظام تحسين API calls
 * مع deduplication وbatching وcaching
 */

import { CacheOptimizer } from './cache-optimizer';
import { PerformanceMonitor } from './performance-monitor';

/**
 * خيارات تحسين API
 */
export interface ApiOptimizationOptions {
    /** هل يجب استخدام Cache */
    useCache?: boolean;
    /** مدة Cache بالميللي ثانية */
    cacheTtl?: number;
    /** هل يجب استخدام Deduplication */
    useDeduplication?: boolean;
    /** هل يجب استخدام Batching */
    useBatching?: boolean;
    /** مدة انتظار Batching بالميللي ثانية */
    batchDelay?: number;
    /** الحد الأقصى لحجم Batch */
    maxBatchSize?: number;
    /** عدد المحاولات */
    retryCount?: number;
    /** تأخير المحاولة بالميللي ثانية */
    retryDelay?: number;
    /** timeout بالميللي ثانية */
    timeout?: number;
}

/**
 * طلب API
 */
export interface ApiRequest {
    /** المعرف الفريد */
    id: string;
    /** URL */
    url: string;
    /** الطريقة */
    method: string;
    /** البيانات */
    data?: any;
    /** Headers */
    headers?: Record<string, string>;
    /** خيارات التحسين */
    options?: ApiOptimizationOptions;
    /** Promise resolver */
    resolve: (value: any) => void;
    /** Promise rejecter */
    reject: (error: any) => void;
    /** الطابع الزمني */
    timestamp: number;
}

/**
 * Batch من الطلبات
 */
export interface ApiBatch {
    /** المعرف الفريد */
    id: string;
    /** الطلبات */
    requests: ApiRequest[];
    /** الطابع الزمني */
    timestamp: number;
    /** Timer */
    timer?: NodeJS.Timeout;
}

/**
 * محسن API
 */
export class ApiOptimizer {
    private static pendingRequests = new Map<string, ApiRequest>();
    private static batches = new Map<string, ApiBatch>();
    private static requestQueue: ApiRequest[] = [];
    private static isProcessing = false;

    private static defaultOptions: ApiOptimizationOptions = {
        useCache: true,
        cacheTtl: 5 * 60 * 1000, // 5 دقائق
        useDeduplication: true,
        useBatching: false,
        batchDelay: 100, // 100ms
        maxBatchSize: 10,
        retryCount: 3,
        retryDelay: 1000, // 1 ثانية
        timeout: 30000, // 30 ثانية
    };

    /**
     * تنفيذ طلب API محسن
     */
    static async request<T>(
        url: string,
        method: string = 'GET',
        data?: any,
        headers?: Record<string, string>,
        options: ApiOptimizationOptions = {}
    ): Promise<T> {
        const opts = { ...this.defaultOptions, ...options };
        const requestId = this.generateRequestId(url, method, data);
        const startTime = performance.now();

        try {
            // التحقق من Cache
            if (opts.useCache) {
                const cached = await CacheOptimizer.get<T>(requestId, {
                    ttl: opts.cacheTtl,
                });

                if (cached !== null) {
                    PerformanceMonitor.measureApiCall(url, method, startTime, performance.now(), true);
                    return cached;
                }
            }

            // التحقق من Deduplication
            if (opts.useDeduplication && this.pendingRequests.has(requestId)) {
                return new Promise((resolve, reject) => {
                    const pendingRequest = this.pendingRequests.get(requestId)!;
                    pendingRequest.resolve = resolve;
                    pendingRequest.reject = reject;
                });
            }

            // إنشاء الطلب
            const request: ApiRequest = {
                id: requestId,
                url,
                method,
                data,
                headers,
                options: opts,
                resolve: () => { },
                reject: () => { },
                timestamp: Date.now(),
            };

            // إضافة الطلب إلى قائمة الانتظار
            this.pendingRequests.set(requestId, request);

            // تنفيذ الطلب
            const result = await this.executeRequest<T>(request);

            // حفظ النتيجة في Cache
            if (opts.useCache) {
                await CacheOptimizer.set(requestId, result, {
                    ttl: opts.cacheTtl,
                });
            }

            // إزالة الطلب من قائمة الانتظار
            this.pendingRequests.delete(requestId);

            // تسجيل الأداء
            PerformanceMonitor.measureApiCall(url, method, startTime, performance.now(), true);

            return result;

        } catch (error) {
            // إزالة الطلب من قائمة الانتظار
            this.pendingRequests.delete(requestId);

            // تسجيل الخطأ
            PerformanceMonitor.measureApiCall(url, method, startTime, performance.now(), false);

            throw error;
        }
    }

    /**
     * تنفيذ طلب API
     */
    private static async executeRequest<T>(request: ApiRequest): Promise<T> {
        const { url, method, data, headers, options } = request;
        const opts = options || this.defaultOptions;

        // إعداد Headers
        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers,
        };

        // إعداد الطلب
        const requestOptions: RequestInit = {
            method,
            headers: requestHeaders,
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            requestOptions.body = JSON.stringify(data);
        }

        // تنفيذ الطلب مع إعادة المحاولة
        return this.executeWithRetry<T>(url, requestOptions, opts);
    }

    /**
     * تنفيذ الطلب مع إعادة المحاولة
     */
    private static async executeWithRetry<T>(
        url: string,
        options: RequestInit,
        apiOptions: ApiOptimizationOptions
    ): Promise<T> {
        let lastError: Error | null = null;
        const retryCount = apiOptions.retryCount || 3;
        const retryDelay = apiOptions.retryDelay || 1000;

        for (let attempt = 0; attempt <= retryCount; attempt++) {
            try {
                // إعداد timeout
                const timeout = apiOptions.timeout || 30000;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                return result;

            } catch (error) {
                lastError = error as Error;

                // إذا لم تكن هذه المحاولة الأخيرة، انتظر قبل المحاولة التالية
                if (attempt < retryCount) {
                    await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
                }
            }
        }

        throw lastError || new Error('Request failed after all retries');
    }

    /**
     * تنفيذ طلبات متعددة في Batch
     */
    static async batchRequest<T>(
        requests: Array<{
            url: string;
            method?: string;
            data?: any;
            headers?: Record<string, string>;
        }>,
        options: ApiOptimizationOptions = {}
    ): Promise<T[]> {
        const opts = { ...this.defaultOptions, ...options };

        if (!opts.useBatching) {
            // تنفيذ الطلبات بشكل منفصل
            return Promise.all(
                requests.map(req =>
                    this.request<T>(req.url, req.method, req.data, req.headers, opts)
                )
            );
        }

        // تنفيذ الطلبات في Batch
        const batchId = this.generateBatchId();
        const batch: ApiBatch = {
            id: batchId,
            requests: [],
            timestamp: Date.now(),
        };

        // إضافة الطلبات إلى Batch
        const promises = requests.map(req => {
            return new Promise<T>((resolve, reject) => {
                const request: ApiRequest = {
                    id: this.generateRequestId(req.url, req.method || 'GET', req.data),
                    url: req.url,
                    method: req.method || 'GET',
                    data: req.data,
                    headers: req.headers,
                    options: opts,
                    resolve,
                    reject,
                    timestamp: Date.now(),
                };

                batch.requests.push(request);
            });
        });

        // حفظ Batch
        this.batches.set(batchId, batch);

        // جدولة تنفيذ Batch
        const timer = setTimeout(() => {
            this.executeBatch(batchId);
        }, opts.batchDelay || 100);

        batch.timer = timer;

        return Promise.all(promises);
    }

    /**
     * تنفيذ Batch
     */
    private static async executeBatch(batchId: string): Promise<void> {
        const batch = this.batches.get(batchId);
        if (!batch) return;

        try {
            // تنفيذ جميع الطلبات في Batch
            const results = await Promise.allSettled(
                batch.requests.map(req => this.executeRequest(req))
            );

            // معالجة النتائج
            results.forEach((result, index) => {
                const request = batch.requests[index];

                if (result.status === 'fulfilled') {
                    request.resolve(result.value);
                } else {
                    request.reject(result.reason);
                }
            });

        } catch (error) {
            // رفض جميع الطلبات في حالة الخطأ
            batch.requests.forEach(req => {
                req.reject(error);
            });
        } finally {
            // تنظيف Batch
            this.batches.delete(batchId);
            if (batch.timer) {
                clearTimeout(batch.timer);
            }
        }
    }

    /**
     * إنشاء معرف فريد للطلب
     */
    private static generateRequestId(url: string, method: string, data?: any): string {
        const dataString = data ? JSON.stringify(data) : '';
        return `${method}:${url}:${dataString}`;
    }

    /**
     * إنشاء معرف فريد للـ Batch
     */
    private static generateBatchId(): string {
        return `batch_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }

    /**
     * تأخير
     */
    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * مسح Cache
     */
    static clearCache(): void {
        CacheOptimizer.clear();
    }

    /**
     * الحصول على إحصائيات
     */
    static getStats(): {
        pendingRequests: number;
        activeBatches: number;
        cacheStats: any;
    } {
        return {
            pendingRequests: this.pendingRequests.size,
            activeBatches: this.batches.size,
            cacheStats: CacheOptimizer.getStats(),
        };
    }

    /**
     * تصدير البيانات
     */
    static exportData(): string {
        return JSON.stringify({
            pendingRequests: Array.from(this.pendingRequests.entries()),
            batches: Array.from(this.batches.entries()),
            cacheData: CacheOptimizer.exportCache(),
            timestamp: Date.now(),
        }, null, 2);
    }
}
