/**
 * الأنواع الأساسية المشتركة
 *
 * هذا الملف يحتوي على الأنواع الأساسية المستخدمة في جميع أنحاء التطبيق
 */

/**
 * حالة العملية العامة
 */
export type ProcessStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * نتيجة العملية
 */
export interface ProcessResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * حالة التحميل
 */
export interface LoadingState {
    isLoading: boolean;
    progress?: number;
    message?: string;
}

/**
 * حالة الخطأ
 */
export interface ErrorState {
    hasError: boolean;
    error?: string;
    code?: string;
    details?: Record<string, any>;
}

/**
 * حالة النموذج
 */
export interface FormState<T = any> {
    data: T;
    errors: Record<keyof T, string>;
    isDirty: boolean;
    isValid: boolean;
    isSubmitting: boolean;
}

/**
 * خيارات التصفية
 */
export interface FilterOptions {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    dateFrom?: Date;
    dateTo?: Date;
}

/**
 * نتيجة الصفحات
 */
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * خيارات التصدير
 */
export interface ExportOptions {
    format: 'pdf' | 'docx' | 'pptx' | 'txt' | 'json';
    includeImages?: boolean;
    includeCharts?: boolean;
    watermark?: string;
    password?: string;
}

/**
 * إعدادات الملف
 */
export interface FileSettings {
    name: string;
    size: number;
    type: string;
    lastModified: Date;
    path?: string;
    url?: string;
}

/**
 * إعدادات المستخدم
 */
export interface UserSettings {
    theme: 'light' | 'dark' | 'auto';
    language: 'ar' | 'en';
    timezone: string;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
}

/**
 * إعدادات التطبيق
 */
export interface AppSettings {
    version: string;
    environment: 'development' | 'staging' | 'production';
    features: Record<string, boolean>;
    limits: {
        maxFileSize: number;
        maxFilesPerUpload: number;
        maxProjectsPerUser: number;
    };
}

/**
 * نوع الحدث
 */
export type EventType =
    | 'user.created'
    | 'user.updated'
    | 'user.deleted'
    | 'project.created'
    | 'project.updated'
    | 'project.deleted'
    | 'file.uploaded'
    | 'file.downloaded'
    | 'export.completed'
    | 'error.occurred';

/**
 * بيانات الحدث
 */
export interface EventData {
    type: EventType;
    timestamp: Date;
    userId?: string;
    data: Record<string, any>;
    metadata?: Record<string, any>;
}

/**
 * نوع الإشعار
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * بيانات الإشعار
 */
export interface NotificationData {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        handler: () => void;
    };
    dismissible?: boolean;
}

/**
 * نوع المهمة
 */
export type TaskType = 'export' | 'import' | 'process' | 'generate' | 'convert';

/**
 * حالة المهمة
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * بيانات المهمة
 */
export interface TaskData {
    id: string;
    type: TaskType;
    status: TaskStatus;
    progress: number;
    message?: string;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    metadata?: Record<string, any>;
}

/**
 * نوع التخزين المؤقت
 */
export type CacheType = 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';

/**
 * إعدادات التخزين المؤقت
 */
export interface CacheSettings {
    type: CacheType;
    ttl: number; // Time to live in milliseconds
    maxSize?: number;
    compression?: boolean;
}

/**
 * بيانات التخزين المؤقت
 */
export interface CacheData<T = any> {
    key: string;
    value: T;
    timestamp: number;
    ttl: number;
    compressed?: boolean;
}

/**
 * نوع التكامل
 */
export type IntegrationType = 'firebase' | 'ai' | 'storage' | 'email' | 'sms';

/**
 * حالة التكامل
 */
export interface IntegrationStatus {
    type: IntegrationType;
    connected: boolean;
    lastSync?: Date;
    error?: string;
    config?: Record<string, any>;
}

/**
 * نوع التصدير
 */
export type ExportType = 'document' | 'presentation' | 'spreadsheet' | 'image' | 'archive';

/**
 * إعدادات التصدير المتقدمة
 */
export interface AdvancedExportOptions extends ExportOptions {
    template?: string;
    styles?: Record<string, any>;
    layout?: {
        orientation: 'portrait' | 'landscape';
        margins: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
    };
    metadata?: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string[];
    };
}

/**
 * نوع التحويل
 */
export type ConversionType = 'markdown-to-docx' | 'markdown-to-pptx' | 'docx-to-pdf' | 'pptx-to-pdf';

/**
 * إعدادات التحويل
 */
export interface ConversionOptions {
    type: ConversionType;
    input: FileSettings;
    output: Partial<FileSettings>;
    options: Record<string, any>;
    progress?: (percent: number) => void;
}

// أنواع الحالة الأساسية
export type LoadingStateType = 'idle' | 'loading' | 'success' | 'error';

export type ProcessingState = 'idle' | 'processing' | 'completed' | 'failed';

// أنواع الملفات
export type FileType = 'pdf' | 'txt' | 'md' | 'docx' | 'doc';

export type AcceptedFileTypes = {
    'application/pdf': string[];
    'text/plain': string[];
    'text/markdown': string[];
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': string[];
};

// أنواع النصوص
export type TextProcessingMode = 'standard' | 'creative' | 'formal' | 'casual';

export type TextLength = 'short' | 'medium' | 'long';

// أنواع الاستجابة
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// أنواع الأخطاء
export interface AppError {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
}

// أنواع الإشعارات
export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

export interface ToastOptions {
    title: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
}

// أنواع النماذج
export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
}

export interface FormConfig {
    fields: FormField[];
    submitText: string;
    resetText?: string;
}

// أنواع الأدوات
export type ToolCategory = 'writing' | 'analysis' | 'generation' | 'conversion';

export interface ToolConfig {
    id: string;
    name: string;
    description: string;
    category: ToolCategory;
    icon?: string;
    enabled: boolean;
    requiresAuth: boolean;
}

/**
 * مساعد للتحقق من نوع العملية
 */
export const isProcessResult = <T>(value: any): value is ProcessResult<T> => {
    return typeof value === 'object' &&
        value !== null &&
        typeof value.success === 'boolean';
};

/**
 * مساعد للتحقق من نوع المهمة
 */
export const isTaskData = (value: any): value is TaskData => {
    return typeof value === 'object' &&
        value !== null &&
        typeof value.id === 'string' &&
        typeof value.type === 'string' &&
        typeof value.status === 'string';
};

/**
 * مساعد للتحقق من نوع الإشعار
 */
export const isNotificationData = (value: any): value is NotificationData => {
    return typeof value === 'object' &&
        value !== null &&
        typeof value.id === 'string' &&
        typeof value.type === 'string' &&
        typeof value.title === 'string' &&
        typeof value.message === 'string';
};
