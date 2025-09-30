/**
 * العميل الأساسي للـ API
 *
 * هذا الملف يحتوي على العميل الأساسي الموحد
 * لجميع استدعاءات API في التطبيق
 */

'use client';

import { handleClientError } from '../../error-handling';
import {
    ApiClientConfig,
    AuthContext,
    HttpError,
    HttpRequestOptions,
    HttpResponse
} from '../../types-lib-core';

/**
 * إعدادات العميل الافتراضية
 */
const DEFAULT_CONFIG: ApiClientConfig = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    defaultHeaders: {
        'Content-Type': 'application/json',
    },
};

/**
 * فئة العميل الأساسي للـ API
 */
export class BaseApiClient {
    private config: ApiClientConfig;
    private authContext: AuthContext | null = null;

    constructor(config: Partial<ApiClientConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * تعيين سياق المصادقة
     */
    setAuthContext(authContext: AuthContext | null): void {
        this.authContext = authContext;
    }

    /**
     * الحصول على الرؤوس الافتراضية
     */
    private getDefaultHeaders(): Record<string, string> {
        const headers = { ...this.config.defaultHeaders };

        if (this.authContext?.token) {
            headers['Authorization'] = `Bearer ${this.authContext.token}`;
        }

        return headers;
    }

    /**
     * تنفيذ طلب HTTP
     */
    private async executeRequest<T = any>(
        url: string,
        options: HttpRequestOptions
    ): Promise<HttpResponse<T>> {
        const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;

        const requestOptions: RequestInit = {
            method: options.method,
            headers: {
                ...this.getDefaultHeaders(),
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        };

        // إضافة timeout
        if (this.config.timeout) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
            requestOptions.signal = controller.signal;

            try {
                const response = await fetch(fullUrl, requestOptions);
                clearTimeout(timeoutId);
                return await this.handleResponse<T>(response, options);
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        } else {
            const response = await fetch(fullUrl, requestOptions);
            return await this.handleResponse<T>(response, options);
        }
    }

    /**
     * معالجة الاستجابة
     */
    private async handleResponse<T>(
        response: Response,
        options: HttpRequestOptions
    ): Promise<HttpResponse<T>> {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error: HttpError = {
                message: data.message || response.statusText,
                status: response.status,
                code: data.code,
                details: data.details,
                response: {
                    data,
                    status: response.status,
                    statusText: response.statusText,
                    headers: this.responseHeadersToObject(response.headers),
                    config: options,
                },
            };
            throw error;
        }

        return {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: this.responseHeadersToObject(response.headers),
            config: options,
        };
    }

    /**
     * تحويل Headers إلى كائن
     */
    private responseHeadersToObject(headers: Headers): Record<string, string> {
        const result: Record<string, string> = {};
        headers.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    /**
     * تنفيذ الطلب مع إعادة المحاولة
     */
    private async executeWithRetry<T = any>(
        url: string,
        options: HttpRequestOptions
    ): Promise<HttpResponse<T>> {
        let lastError: HttpError | null = null;

        for (let attempt = 0; attempt <= this.config.retries!; attempt++) {
            try {
                return await this.executeRequest<T>(url, options);
            } catch (error) {
                lastError = error as HttpError;

                // عدم إعادة المحاولة للأخطاء التي لا تحتاج إعادة محاولة
                if (this.shouldNotRetry(lastError)) {
                    throw lastError;
                }

                // انتظار قبل إعادة المحاولة
                if (attempt < this.config.retries!) {
                    await this.delay(this.config.retryDelay! * Math.pow(2, attempt));
                }
            }
        }

        throw lastError!;
    }

    /**
     * تحديد ما إذا كان يجب عدم إعادة المحاولة
     */
    private shouldNotRetry(error: HttpError): boolean {
        // عدم إعادة المحاولة للأخطاء 4xx (باستثناء 408, 429)
        if (error.status && error.status >= 400 && error.status < 500) {
            return error.status !== 408 && error.status !== 429;
        }

        return false;
    }

    /**
     * تأخير
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * تنفيذ interceptor للطلب
     */
    private interceptRequest(options: HttpRequestOptions): HttpRequestOptions {
        if (this.config.interceptors?.request) {
            return this.config.interceptors.request(options);
        }
        return options;
    }

    /**
     * تنفيذ interceptor للاستجابة
     */
    private interceptResponse<T>(response: HttpResponse<T>): HttpResponse<T> {
        if (this.config.interceptors?.response) {
            return this.config.interceptors.response(response);
        }
        return response;
    }

    /**
     * تنفيذ interceptor للخطأ
     */
    private interceptError(error: HttpError): HttpError {
        if (this.config.interceptors?.error) {
            return this.config.interceptors.error(error);
        }
        return error;
    }

    /**
     * طلب GET
     */
    async get<T = any>(url: string, options: Partial<HttpRequestOptions> = {}): Promise<HttpResponse<T>> {
        const requestOptions = this.interceptRequest({
            method: 'GET',
            ...options,
        });

        try {
            const response = await this.executeWithRetry<T>(url, requestOptions);
            return this.interceptResponse(response);
        } catch (error) {
            const httpError = this.interceptError(error as HttpError);
            handleClientError(httpError, { context: 'API GET Request' });
            throw httpError;
        }
    }

    /**
     * طلب POST
     */
    async post<T = any>(url: string, data?: any, options: Partial<HttpRequestOptions> = {}): Promise<HttpResponse<T>> {
        const requestOptions = this.interceptRequest({
            method: 'POST',
            body: data,
            ...options,
        });

        try {
            const response = await this.executeWithRetry<T>(url, requestOptions);
            return this.interceptResponse(response);
        } catch (error) {
            const httpError = this.interceptError(error as HttpError);
            handleClientError(httpError, { context: 'API POST Request' });
            throw httpError;
        }
    }

    /**
     * طلب PUT
     */
    async put<T = any>(url: string, data?: any, options: Partial<HttpRequestOptions> = {}): Promise<HttpResponse<T>> {
        const requestOptions = this.interceptRequest({
            method: 'PUT',
            body: data,
            ...options,
        });

        try {
            const response = await this.executeWithRetry<T>(url, requestOptions);
            return this.interceptResponse(response);
        } catch (error) {
            const httpError = this.interceptError(error as HttpError);
            handleClientError(httpError, { context: 'API PUT Request' });
            throw httpError;
        }
    }

    /**
     * طلب PATCH
     */
    async patch<T = any>(url: string, data?: any, options: Partial<HttpRequestOptions> = {}): Promise<HttpResponse<T>> {
        const requestOptions = this.interceptRequest({
            method: 'PATCH',
            body: data,
            ...options,
        });

        try {
            const response = await this.executeWithRetry<T>(url, requestOptions);
            return this.interceptResponse(response);
        } catch (error) {
            const httpError = this.interceptError(error as HttpError);
            handleClientError(httpError, { context: 'API PATCH Request' });
            throw httpError;
        }
    }

    /**
     * طلب DELETE
     */
    async delete<T = any>(url: string, options: Partial<HttpRequestOptions> = {}): Promise<HttpResponse<T>> {
        const requestOptions = this.interceptRequest({
            method: 'DELETE',
            ...options,
        });

        try {
            const response = await this.executeWithRetry<T>(url, requestOptions);
            return this.interceptResponse(response);
        } catch (error) {
            const httpError = this.interceptError(error as HttpError);
            handleClientError(httpError, { context: 'API DELETE Request' });
            throw httpError;
        }
    }

    /**
     * رفع ملف
     */
    async uploadFile<T = any>(
        url: string,
        file: File,
        onProgress?: (progress: number) => void,
        options: Partial<HttpRequestOptions> = {}
    ): Promise<HttpResponse<T>> {
        const formData = new FormData();
        formData.append('file', file);

        const requestOptions = this.interceptRequest({
            method: 'POST',
            body: formData,
            headers: {
                // إزالة Content-Type للسماح للمتصفح بتعيينه
                ...options.headers,
            },
            ...options,
        });

        // إزالة Content-Type من الرؤوس الافتراضية
        delete requestOptions.headers?.['Content-Type'];

        try {
            const response = await this.executeWithRetry<T>(url, requestOptions);
            return this.interceptResponse(response);
        } catch (error) {
            const httpError = this.interceptError(error as HttpError);
            handleClientError(httpError, { context: 'API File Upload' });
            throw httpError;
        }
    }

    /**
     * تحميل ملف
     */
    async downloadFile(url: string, filename?: string): Promise<void> {
        try {
            const response = await this.get(url, {
                headers: {
                    'Accept': 'application/octet-stream',
                },
            });

            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            const httpError = this.interceptError(error as HttpError);
            handleClientError(httpError, { context: 'API File Download' });
            throw httpError;
        }
    }

    /**
     * تحديث الإعدادات
     */
    updateConfig(newConfig: Partial<ApiClientConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * الحصول على الإعدادات الحالية
     */
    getConfig(): ApiClientConfig {
        return { ...this.config };
    }
}
