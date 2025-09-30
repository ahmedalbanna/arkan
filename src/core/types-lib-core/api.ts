/**
 * أنواع API المشتركة
 *
 * هذا الملف يحتوي على الأنواع المستخدمة في API calls
 * والاستجابات والطلبات
 */


/**
 * نوع طلب HTTP
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * رؤوس HTTP
 */
export interface HttpHeaders {
    [key: string]: string;
}

/**
 * خيارات طلب HTTP
 */
export interface HttpRequestOptions {
    method: HttpMethod;
    headers?: HttpHeaders;
    body?: any;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

/**
 * استجابة HTTP
 */
export interface HttpResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: HttpHeaders;
    config: HttpRequestOptions;
}

/**
 * خطأ HTTP
 */
export interface HttpError {
    message: string;
    status?: number;
    code?: string;
    details?: any;
    response?: HttpResponse;
}

/**
 * إعدادات العميل API
 */
export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    defaultHeaders?: HttpHeaders;
    interceptors?: {
        request?: (config: HttpRequestOptions) => HttpRequestOptions;
        response?: (response: HttpResponse) => HttpResponse;
        error?: (error: HttpError) => HttpError;
    };
}

/**
 * نوع المصادقة
 */
export type AuthType = 'bearer' | 'basic' | 'api-key' | 'oauth';

/**
 * بيانات المصادقة
 */
export interface AuthData {
    type: AuthType;
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
}

/**
 * سياق المصادقة
 */
export interface AuthContext {
    user: {
        id: string;
        email: string;
        role: string;
        permissions: string[];
    };
    token: string;
    expiresAt: Date;
    refreshToken?: string;
}

/**
 * طلب المصادقة
 */
export interface AuthRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
    captcha?: string;
}

/**
 * استجابة المصادقة
 */
export interface AuthResponse {
    user: AuthContext['user'];
    token: string;
    refreshToken?: string;
    expiresIn: number;
    message?: string;
}

/**
 * طلب تحديث البيانات
 */
export interface UpdateRequest<T = any> {
    id: string;
    data: Partial<T>;
    version?: number;
}

/**
 * استجابة تحديث البيانات
 */
export interface UpdateResponse<T = any> {
    data: T;
    message: string;
    version: number;
}

/**
 * طلب حذف البيانات
 */
export interface DeleteRequest {
    id: string;
    force?: boolean;
    reason?: string;
}

/**
 * استجابة حذف البيانات
 */
export interface DeleteResponse {
    success: boolean;
    message: string;
    deletedAt: Date;
}

/**
 * طلب البحث
 */
export interface SearchRequest {
    query: string;
    filters?: Record<string, any>;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    pagination?: {
        page: number;
        limit: number;
    };
}

/**
 * استجابة البحث
 */
export interface SearchResponse<T = any> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    query: string;
    filters: Record<string, any>;
}

/**
 * طلب رفع الملف
 */
export interface FileUploadRequest {
    file: File;
    folder?: string;
    metadata?: Record<string, any>;
    onProgress?: (progress: number) => void;
}

/**
 * استجابة رفع الملف
 */
export interface FileUploadResponse {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    path: string;
    uploadedAt: Date;
    metadata?: Record<string, any>;
}

/**
 * طلب تحميل الملف
 */
export interface FileDownloadRequest {
    id: string;
    format?: string;
    quality?: 'low' | 'medium' | 'high';
    watermark?: string;
}

/**
 * استجابة تحميل الملف
 */
export interface FileDownloadResponse {
    url: string;
    filename: string;
    size: number;
    type: string;
    expiresAt: Date;
}

/**
 * طلب التصدير
 */
export interface ExportRequest {
    data: any;
    format: 'pdf' | 'docx' | 'pptx' | 'txt' | 'json';
    options?: Record<string, any>;
    template?: string;
}

/**
 * استجابة التصدير
 */
export interface ExportResponse {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    error?: string;
    progress?: number;
    estimatedTime?: number;
}

/**
 * طلب التحويل
 */
export interface ConvertRequest {
    input: {
        type: string;
        data: any;
    };
    output: {
        type: string;
        options?: Record<string, any>;
    };
}

/**
 * استجابة التحويل
 */
export interface ConvertResponse {
    data: any;
    format: string;
    size: number;
    metadata?: Record<string, any>;
}

/**
 * طلب AI
 */
export interface AIRequest {
    prompt: string;
    model?: string;
    parameters?: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
    };
    context?: any;
}

/**
 * استجابة AI
 */
export interface AIResponse {
    content: string;
    model: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    finishReason: string;
    metadata?: Record<string, any>;
}

/**
 * طلب WebSocket
 */
export interface WebSocketRequest {
    type: string;
    data: any;
    id?: string;
}

/**
 * استجابة WebSocket
 */
export interface WebSocketResponse {
    type: string;
    data: any;
    id?: string;
    error?: string;
}

/**
 * إعدادات WebSocket
 */
export interface WebSocketConfig {
    url: string;
    protocols?: string[];
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeat?: {
        interval: number;
        message: string;
    };
}

/**
 * مساعد للتحقق من نوع الاستجابة
 */
export const isHttpResponse = <T>(value: any): value is HttpResponse<T> => {
    return typeof value === 'object' &&
        value !== null &&
        typeof value.data !== 'undefined' &&
        typeof value.status === 'number';
};

/**
 * مساعد للتحقق من نوع الخطأ
 */
export const isHttpError = (value: any): value is HttpError => {
    return typeof value === 'object' &&
        value !== null &&
        typeof value.message === 'string';
};

/**
 * مساعد للتحقق من نوع المصادقة
 */
export const isAuthContext = (value: any): value is AuthContext => {
    return typeof value === 'object' &&
        value !== null &&
        typeof value.user === 'object' &&
        typeof value.token === 'string';
};
