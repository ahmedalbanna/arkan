/**
 * API Client - Enhanced v2.0
 *
 * عميل API موحد محسن مع دعم متقدم للتخزين المؤقت والمراقبة
 */


// أنواع محسنة لعميل API
export interface ApiConfig {
    baseURL: string;
    timeout: number;
    retries: number;
    retryDelay: number;
    enableCaching: boolean;
    cacheTTL: number;
    enableMetrics: boolean;
}

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
    skipCache?: boolean;
    cacheKey?: string;
    retries?: number;
    retryDelay?: number;
}

export interface ApiResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    cached?: boolean;
    responseTime: number;
    timestamp: Date;
}

export interface CacheEntry<T = unknown> {
    key: string;
    data: T;
    status: number;
    headers: Record<string, string>;
    timestamp: Date;
    expiresAt: Date;
    accessCount: number;
    lastAccessed: Date;
}

/**
 * عميل API محسن مع دعم التخزين المؤقت والمراقبة
 */
export class ApiClientV2 {
    private config: ApiConfig;
    private cache: Map<string, CacheEntry> = new Map();
    private metrics: {
        totalRequests: number;
        cacheHits: number;
        cacheMisses: number;
        errors: number;
        averageResponseTime: number;
    };

    constructor(config: Partial<ApiConfig> = {}) {
        this.config = {
            baseURL: config.baseURL || process.env.NEXT_PUBLIC_API_URL || '/api',
            timeout: config.timeout || 30000,
            retries: config.retries || 3,
            retryDelay: config.retryDelay || 1000,
            enableCaching: config.enableCaching ?? true,
            cacheTTL: config.cacheTTL || 5 * 60 * 1000, // 5 minutes
            enableMetrics: config.enableMetrics ?? true,
        };

        this.metrics = {
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            averageResponseTime: 0,
        };
    }

    /**
     * طلب عام مع دعم كامل للتخزين المؤقت والمراقبة
     */
    async request<T = unknown>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const startTime = Date.now();
        this.metrics.totalRequests++;

        try {
            // التحقق من التخزين المؤقت
            if (this.config.enableCaching && !options.skipCache && options.method === 'GET') {
                const cachedResponse = this.getFromCache<T>(endpoint, options.cacheKey);
                if (cachedResponse) {
                    this.metrics.cacheHits++;
                    return {
                        ...cachedResponse,
                        cached: true,
                        responseTime: Date.now() - startTime,
                    };
                }
            }

            this.metrics.cacheMisses++;

            // تنفيذ الطلب مع إعادة المحاولة
            const response = await this.executeRequest(endpoint, options);

            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, true);

            // حفظ في التخزين المؤقت إذا كان مناسباً
            if (this.config.enableCaching && options.method === 'GET' && response.status === 200) {
                this.setCache(endpoint, response, options.cacheKey);
            }

            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                cached: false,
                responseTime,
                timestamp: new Date(),
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, false);
            this.metrics.errors++;

            throw this.handleError(error);
        }
    }

    /**
     * طلب GET محسن
     */
    async get<T = unknown>(
        endpoint: string,
        options: Omit<RequestOptions, 'method' | 'body'> = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    /**
     * طلب POST محسن
     */
    async post<T = unknown, TBody = unknown>(
        endpoint: string,
        body?: TBody,
        options: Omit<RequestOptions, 'method'> = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body,
        });
    }

    /**
     * طلب PUT محسن
     */
    async put<T = unknown, TBody = unknown>(
        endpoint: string,
        body?: TBody,
        options: Omit<RequestOptions, 'method'> = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body,
        });
    }

    /**
     * طلب DELETE محسن
     */
    async delete<T = unknown>(
        endpoint: string,
        options: Omit<RequestOptions, 'method' | 'body'> = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }

    /**
     * تنفيذ الطلب مع إعادة المحاولة
     */
    private async executeRequest(
        endpoint: string,
        options: RequestOptions
    ): Promise<{
        data: unknown;
        status: number;
        statusText: string;
        headers: Record<string, string>;
    }> {
        const url = `${this.config.baseURL}${endpoint}`;
        const maxRetries = options.retries ?? this.config.retries;
        const retryDelay = options.retryDelay ?? this.config.retryDelay;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);

                const response = await fetch(url, {
                    method: options.method || 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                    body: options.body ? JSON.stringify(options.body) : undefined,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    // محاولة إعادة المحاولة للأخطاء القابلة للتكرار
                    if (attempt < maxRetries && this.isRetryableError(response.status)) {
                        await this.delay(retryDelay * (attempt + 1));
                        continue;
                    }

                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                return {
                    data,
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                };
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }

                // محاولة إعادة المحاولة للأخطاء القابلة للتكرار
                if (this.isRetryableError(error)) {
                    await this.delay(retryDelay * (attempt + 1));
                    continue;
                }

                throw error;
            }
        }

        throw new Error('Max retries exceeded');
    }

    /**
     * التحقق من التخزين المؤقت
     */
    private getFromCache<T>(endpoint: string, customKey?: string): ApiResponse<T> | null {
        const key = customKey || this.generateCacheKey(endpoint, 'GET');
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (new Date() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // تحديث إحصائيات الوصول
        entry.accessCount++;
        entry.lastAccessed = new Date();

        return {
            data: entry.data as T,
            status: entry.status,
            statusText: 'OK',
            headers: entry.headers,
            cached: true,
            responseTime: 0,
            timestamp: entry.timestamp,
        };
    }

    /**
     * حفظ في التخزين المؤقت
     */
    private setCache(
        endpoint: string,
        response: { data: unknown; status: number; headers: Record<string, string> },
        customKey?: string
    ): void {
        const key = customKey || this.generateCacheKey(endpoint, 'GET');
        const entry: CacheEntry = {
            key,
            data: response.data,
            status: response.status,
            headers: response.headers,
            timestamp: new Date(),
            expiresAt: new Date(Date.now() + this.config.cacheTTL),
            accessCount: 0,
            lastAccessed: new Date(),
        };

        // تنظيف التخزين المؤقت إذا أصبح كبيراً جداً
        if (this.cache.size >= 1000) {
            this.evictCache();
        }

        this.cache.set(key, entry);
    }

    /**
     * توليد مفتاح التخزين المؤقت
     */
    private generateCacheKey(endpoint: string, method: string): string {
        return `${method}:${endpoint}`;
    }

    /**
     * تنظيف التخزين المؤقت
     */
    private evictCache(): void {
        // إزالة المدخلات الأقل استخداماً والمنتهية الصلاحية
        const entries = Array.from(this.cache.entries());
        const sortedEntries = entries.sort((a, b) => {
            // ترتيب حسب الوصول والانتهاء
            const aScore = a[1].accessCount + (new Date() > a[1].expiresAt ? -1000 : 0);
            const bScore = b[1].accessCount + (new Date() > b[1].expiresAt ? -1000 : 0);
            return aScore - bScore;
        });

        // الاحتفاظ بالـ 70% فقط من المدخلات
        const keepCount = Math.floor(entries.length * 0.7);
        const toRemove = sortedEntries.slice(0, entries.length - keepCount);

        toRemove.forEach(([key]) => this.cache.delete(key));
    }

    /**
     * تحديد ما إذا كان الخطأ قابلاً لإعادة المحاولة
     */
    private isRetryableError(error: unknown): boolean {
        if (typeof error === 'number') {
            // أكواد الحالة القابلة لإعادة المحاولة
            return [408, 429, 500, 502, 503, 504].includes(error);
        }

        if (error instanceof Error) {
            // رسائل الخطأ القابلة لإعادة المحاولة
            const retryableMessages = [
                'network error',
                'timeout',
                'ECONNRESET',
                'ENOTFOUND',
                'fetch timeout',
            ];

            return retryableMessages.some(msg =>
                error.message.toLowerCase().includes(msg)
            );
        }

        return false;
    }

    /**
     * تحديث مقاييس الأداء
     */
    private updateMetrics(responseTime: number, success: boolean): void {
        if (this.config.enableMetrics) {
            const total = this.metrics.totalRequests;
            const currentAvg = this.metrics.averageResponseTime;

            // حساب المتوسط المتحرك
            this.metrics.averageResponseTime = (currentAvg * (total - 1) + responseTime) / total;
        }
    }

    /**
     * معالجة الأخطاء
     */
    private handleError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }

        return new Error('Unknown API error occurred');
    }

    /**
     * تأخير لإعادة المحاولة
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * الحصول على مقاييس الأداء
     */
    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * مسح التخزين المؤقت
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * الحصول على حجم التخزين المؤقت
     */
    getCacheSize(): number {
        return this.cache.size;
    }

    /**
     * الحصول على معلومات التخزين المؤقت
     */
    getCacheInfo(): Array<{ key: string; accessCount: number; expiresAt: Date }> {
        return Array.from(this.cache.entries()).map(([key, entry]) => ({
            key,
            accessCount: entry.accessCount,
            expiresAt: entry.expiresAt,
        }));
    }
}

// عميل API افتراضي
export const apiClient = new ApiClientV2();
