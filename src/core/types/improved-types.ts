/**
 * أنواع TypeScript محسنة لتحسين Type Safety
 *
 * هذا الملف يحتوي على أنواع محسنة ومحددة بدقة لاستبدال استخدام `any`
 * وتحسين Type Safety في جميع أنحاء المشروع
 */

// ==================== أنواع البيانات الأساسية ====================

/**
 * أنواع البيانات البدائية
 */
export type PrimitiveType = string | number | boolean | null | undefined;

/**
 * أنواع البيانات القابلة للتسلسل
 */
export type SerializableType =
    | PrimitiveType
    | SerializableType[]
    | { [key: string]: SerializableType };

/**
 * أنواع البيانات المعقدة
 */
export interface ComplexData {
    [key: string]: SerializableType | ComplexData;
}

// ==================== أنواع API المحسنة ====================

/**
 * استجابة API محسنة مع أنواع محددة
 */
export interface TypedApiResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
    timestamp: string;
    requestId: string;
}

/**
 * طلب API محسن مع أنواع محددة
 */
export interface TypedApiRequest<T = unknown> {
    data: T;
    timestamp: string;
    requestId: string;
}

/**
 * طلب البحث محسن
 */
export interface TypedSearchRequest<T = unknown> {
    query?: string;
    filters?: Record<string, unknown>;
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    pagination?: {
        page: number;
        limit: number;
    };
    data?: T;
}

/**
 * استجابة البحث محسنة
 */
export interface TypedSearchResponse<T = unknown> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// ==================== أنواع الملفات المحسنة ====================

/**
 * بيانات الملف محسنة
 */
export interface TypedFileData {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: string;
    metadata?: Record<string, unknown>;
}

/**
 * طلب رفع الملف محسن
 */
export interface TypedFileUploadRequest {
    file: File;
    folder?: string;
    metadata?: Record<string, unknown>;
    onProgress?: (progress: number) => void;
}

/**
 * استجابة رفع الملف محسنة
 */
export interface TypedFileUploadResponse {
    file: TypedFileData;
    success: boolean;
    message?: string;
}

// ==================== أنواع التصدير المحسنة ====================

/**
 * طلب التصدير محسن
 */
export interface TypedExportRequest {
    content: string;
    format: 'docx' | 'pptx' | 'pdf' | 'markdown';
    metadata?: Record<string, unknown>;
    options?: ExportOptions;
}

/**
 * خيارات التصدير محسنة
 */
export interface ExportOptions {
    includeImages?: boolean;
    includeCharts?: boolean;
    watermark?: string;
    password?: string;
    template?: string;
    style?: Record<string, unknown>;
}

/**
 * استجابة التصدير محسنة
 */
export interface TypedExportResponse {
    fileUrl: string;
    filename: string;
    size: number;
    format: string;
    success: boolean;
    message?: string;
}

// ==================== أنواع AI المحسنة ====================

/**
 * طلب AI محسن
 */
export interface TypedAIRequest {
    prompt: string;
    context?: string;
    options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        stream?: boolean;
    };
    metadata?: Record<string, unknown>;
}

/**
 * استجابة AI محسنة
 */
export interface TypedAIResponse {
    content: string;
    metadata?: {
        model: string;
        tokens: number;
        duration: number;
        confidence?: number;
    };
    success: boolean;
    message?: string;
}

// ==================== أنواع المشاريع المحسنة ====================

/**
 * بيانات المشروع محسنة
 */
export interface TypedProjectData {
    id: string;
    name: string;
    description?: string;
    type: 'proposal' | 'report' | 'presentation' | 'academic';
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    content: ProjectContent;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

/**
 * محتوى المشروع محسن
 */
export interface ProjectContent {
    sections: ProjectSection[];
    externalContext?: string[];
    files?: TypedFileData[];
    settings?: Record<string, unknown>;
}

/**
 * قسم المشروع محسن
 */
export interface ProjectSection {
    id: string;
    title: string;
    content: string;
    type: string;
    order: number;
    metadata?: Record<string, unknown>;
}

// ==================== أنواع الأخطاء المحسنة ====================

/**
 * خطأ محسن مع أنواع محددة
 */
export interface TypedError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
    timestamp: string;
}

/**
 * خطأ التحقق من الصحة محسن
 */
export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
    code?: string;
}

/**
 * خطأ الشبكة محسن
 */
export interface NetworkError {
    code: 'NETWORK_ERROR' | 'TIMEOUT' | 'CONNECTION_FAILED';
    message: string;
    url?: string;
    status?: number;
}

// ==================== أنواع الأحداث المحسنة ====================

/**
 * حدث محسن مع أنواع محددة
 */
export interface TypedEvent<T = unknown> {
    type: string;
    data: T;
    metadata: EventMetadata;
    timestamp: string;
}

/**
 * بيانات الحدث محسنة
 */
export interface EventMetadata {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    source?: string;
    version?: string;
}

// ==================== أنواع التخزين المؤقت المحسنة ====================

/**
 * إدخال التخزين المؤقت محسن
 */
export interface TypedCacheEntry<T = unknown> {
    key: string;
    value: T;
    expiresAt: string;
    metadata?: Record<string, unknown>;
}

/**
 * خيارات التخزين المؤقت محسنة
 */
export interface CacheOptions {
    ttl?: number; // Time to live in seconds
    maxSize?: number;
    strategy?: 'lru' | 'fifo' | 'lfu';
    persistent?: boolean;
}

// ==================== أنواع المكونات المحسنة ====================

/**
 * خصائص المكون الأساسية محسنة
 */
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
    id?: string;
    'data-testid'?: string;
}

/**
 * حالة المكون محسنة
 */
export interface ComponentState {
    loading: boolean;
    error?: TypedError;
    data?: unknown;
}

// ==================== أنواع النماذج المحسنة ====================

/**
 * حالة النموذج محسنة
 */
export interface FormState<T = Record<string, unknown>> {
    values: T;
    errors: Record<keyof T, string>;
    touched: Record<keyof T, boolean>;
    isSubmitting: boolean;
    isValid: boolean;
}

/**
 * خيارات النموذج محسنة
 */
export interface FormOptions {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    validateOnSubmit?: boolean;
    debounceMs?: number;
}

// ==================== أنواع المساعدات ====================

/**
 * دالة التحقق من النوع
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * دالة التحويل
 */
export type Transformer<T, U> = (value: T) => U;

/**
 * دالة التحقق من الصحة
 */
export type Validator<T> = (value: T) => boolean | string;

/**
 * دالة المعالج
 */
export type Handler<T = unknown> = (value: T) => void | Promise<void>;

// ==================== أنواع Generic محسنة ====================

/**
 * نتيجة العملية محسنة
 */
export interface ProcessResult<T = unknown, E = TypedError> {
    success: boolean;
    data?: T;
    error?: E;
    message?: string;
}

/**
 * خيارات العملية محسنة
 */
export interface ProcessOptions {
    timeout?: number;
    retries?: number;
    validate?: boolean;
    log?: boolean;
}

// ==================== أنواع الأدوات المساعدة ====================

/**
 * دالة المساعدة للتحقق من النوع
 */
export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

/**
 * دالة المساعدة للتحقق من الرقم
 */
export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
}

/**
 * دالة المساعدة للتحقق من الكائن
 */
export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * دالة المساعدة للتحقق من المصفوفة
 */
export function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

/**
 * دالة المساعدة للتحقق من الدالة
 */
export function isFunction(value: unknown): value is Function {
    return typeof value === 'function';
}

/**
 * دالة المساعدة للتحقق من القيمة الفارغة
 */
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (isString(value)) return value.trim() === '';
    if (isArray(value)) return value.length === 0;
    if (isObject(value)) return Object.keys(value).length === 0;
    return false;
}

/**
 * دالة المساعدة للتحقق من القيمة المليئة
 */
export function isNotEmpty(value: unknown): boolean {
    return !isEmpty(value);
}

// جميع الأنواع مُصدَّرة بالفعل في بداية الملف
