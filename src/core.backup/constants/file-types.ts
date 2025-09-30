/**
 * أنواع الملفات المدعومة
 * يوفر معلومات شاملة عن أنواع الملفات المدعومة في التطبيق
 */

export interface FileTypeConfig {
    extension: string;
    mimeType: string;
    maxSize: number; // بالبايت
    description: string;
    icon: string;
    category: 'document' | 'text' | 'image' | 'archive';
}

// أنواع الملفات المدعومة
export const SUPPORTED_FILE_TYPES: Record<string, FileTypeConfig> = {
    pdf: {
        extension: '.pdf',
        mimeType: 'application/pdf',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'ملفات PDF',
        icon: 'file-text',
        category: 'document',
    },
    txt: {
        extension: '.txt',
        mimeType: 'text/plain',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'ملفات نصية',
        icon: 'file-text',
        category: 'text',
    },
    md: {
        extension: '.md',
        mimeType: 'text/markdown',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'ملفات Markdown',
        icon: 'file-text',
        category: 'text',
    },
    docx: {
        extension: '.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        maxSize: 15 * 1024 * 1024, // 15MB
        description: 'ملفات Word',
        icon: 'file-text',
        category: 'document',
    },
    doc: {
        extension: '.doc',
        mimeType: 'application/msword',
        maxSize: 15 * 1024 * 1024, // 15MB
        description: 'ملفات Word القديمة',
        icon: 'file-text',
        category: 'document',
    },
};

// أنواع الملفات المدعومة لرفع الملفات
export const UPLOAD_ACCEPTED_TYPES = {
    documents: {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/msword': ['.doc'],
    },
    text: {
        'text/plain': ['.txt'],
        'text/markdown': ['.md'],
    },
    all: {
        'application/pdf': ['.pdf'],
        'text/plain': ['.txt'],
        'text/markdown': ['.md'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/msword': ['.doc'],
    },
};

// رسائل الخطأ الخاصة بالملفات
export const FILE_ERROR_MESSAGES = {
    TOO_LARGE: (maxSize: number) =>
        `حجم الملف كبير جداً. الحد الأقصى ${Math.round(maxSize / (1024 * 1024))}MB`,
    TYPE_NOT_SUPPORTED: 'نوع الملف غير مدعوم',
    CORRUPTED: 'الملف تالف أو غير قابل للقراءة',
    EMPTY: 'الملف فارغ',
    PROCESSING_FAILED: 'فشل في معالجة الملف',
    UPLOAD_FAILED: 'فشل في رفع الملف',
    EXTRACTION_FAILED: 'فشل في استخراج النص من الملف',
} as const;

// إعدادات رفع الملفات الافتراضية
export const DEFAULT_UPLOAD_CONFIG = {
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: UPLOAD_ACCEPTED_TYPES.all,
    showPreview: true,
    showProgress: true,
    autoUpload: false,
} as const;
