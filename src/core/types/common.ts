/**
 * الأنواع المشتركة المستخدمة في جميع أنحاء التطبيق
 * يوفر نقطة مرجعية واحدة للأنواع الأساسية
 */

// أنواع الحالة الأساسية
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

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
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
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
    details?: Record<string, unknown>;
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
