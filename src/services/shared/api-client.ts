/**
 * API Client الموحد
 *
 * هذا الملف يحتوي على العميل الموحد لجميع استدعاءات API
 */


export interface ApiClientConfig {
    baseUrl?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

export class ApiClient {
    private config: Required<ApiClientConfig>;

    constructor(config: ApiClientConfig = {}) {
        this.config = {
            baseUrl: config.baseUrl || '',
            timeout: config.timeout || 30000,
            retries: config.retries || 3,
            retryDelay: config.retryDelay || 1000,
        };
    }

    /**
     * استدعاء API endpoint
     */
    async call<TInput = any, TOutput = any>(
        endpoint: string,
        options: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
            data?: TInput;
            token?: string;
            headers?: Record<string, string>;
            timeout?: number;
        } = {}
    ): Promise<TOutput> {
        const {
            method = 'GET',
            data,
            token,
            headers = {},
            timeout = this.config.timeout,
        } = options;

        const url = `${this.config.baseUrl}${endpoint}`;

        const requestConfig: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        // إضافة المصادقة
        if (token) {
            requestConfig.headers = {
                ...requestConfig.headers,
                'Authorization': `Bearer ${token}`,
            };
        }

        // إضافة البيانات
        if (data && method !== 'GET') {
            requestConfig.body = JSON.stringify(data);
        }

        // تنفيذ الطلب مع إعادة المحاولة
        return this.executeWithRetry(url, requestConfig, timeout);
    }

    /**
     * تنفيذ الطلب مع إعادة المحاولة
     */
    private async executeWithRetry(
        url: string,
        config: RequestInit,
        timeout: number
    ): Promise<any> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.config.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `API call failed with status ${response.status}`);
                }

                const result = await response.json();
                return result.data || result;
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');

                // إذا كان هذا آخر محاولة، أرمي الخطأ
                if (attempt === this.config.retries) {
                    throw lastError;
                }

                // انتظار قبل إعادة المحاولة
                await this.delay(this.config.retryDelay * Math.pow(2, attempt));
            }
        }

        throw lastError;
    }

    /**
     * تأخير
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * GET request
     */
    async get<TOutput = any>(
        endpoint: string,
        options: {
            token?: string;
            headers?: Record<string, string>;
            timeout?: number;
        } = {}
    ): Promise<TOutput> {
        return this.call(endpoint, { method: 'GET', ...options });
    }

    /**
     * POST request
     */
    async post<TInput = any, TOutput = any>(
        endpoint: string,
        data: TInput,
        options: {
            token?: string;
            headers?: Record<string, string>;
            timeout?: number;
        } = {}
    ): Promise<TOutput> {
        return this.call(endpoint, { method: 'POST', data, ...options });
    }

    /**
     * PUT request
     */
    async put<TInput = any, TOutput = any>(
        endpoint: string,
        data: TInput,
        options: {
            token?: string;
            headers?: Record<string, string>;
            timeout?: number;
        } = {}
    ): Promise<TOutput> {
        return this.call(endpoint, { method: 'PUT', data, ...options });
    }

    /**
     * DELETE request
     */
    async delete<TOutput = any>(
        endpoint: string,
        options: {
            token?: string;
            headers?: Record<string, string>;
            timeout?: number;
        } = {}
    ): Promise<TOutput> {
        return this.call(endpoint, { method: 'DELETE', ...options });
    }

    /**
     * PATCH request
     */
    async patch<TInput = any, TOutput = any>(
        endpoint: string,
        data: TInput,
        options: {
            token?: string;
            headers?: Record<string, string>;
            timeout?: number;
        } = {}
    ): Promise<TOutput> {
        return this.call(endpoint, { method: 'PATCH', data, ...options });
    }
}

/**
 * عميل API افتراضي
 */
export const apiClient = new ApiClient({
    baseUrl: '',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
});

/**
 * عميل API للإدارة
 */
export const adminApiClient = new ApiClient({
    baseUrl: '',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
});

/**
 * عميل API للعمليات العامة
 */
export const publicApiClient = new ApiClient({
    baseUrl: '',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
});
