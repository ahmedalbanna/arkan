/**
 * أنواع الملفات المدعومة
 * يوفر معلومات شاملة عن أنواع الملفات المدعومة في التطبيق
 */

export interface FileTypeConfig {
    /** نوع MIME للملف */
    mimeType: string;
    /** امتداد الملف */
    extension: string;
    /** الحجم الأقصى بالبايت */
    maxSize: number;
    /** وصف الملف */
    description: string;
    /** أيقونة الملف */
    icon: string;
    /** فئة الملف */
    category: 'document' | 'text' | 'image' | 'archive' | 'presentation' | 'spreadsheet' | 'code';
    /** هل الملف مدعوم للرفع */
    supported: boolean;
}

// أنواع الملفات المدعومة
export const SUPPORTED_FILE_TYPES = {
    // مستندات النص
    PDF: {
        mimeType: 'application/pdf',
        extension: '.pdf',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'ملفات PDF',
        icon: 'file-text',
        category: 'document' as const,
        supported: true,
    },
    DOC: {
        mimeType: 'application/msword',
        extension: '.doc',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'ملفات Word القديمة',
        icon: 'file-text',
        category: 'document' as const,
        supported: true,
    },
    DOCX: {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extension: '.docx',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'ملفات Word',
        icon: 'file-text',
        category: 'document' as const,
        supported: true,
    },
    TXT: {
        mimeType: 'text/plain',
        extension: '.txt',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'ملفات نصية',
        icon: 'file-text',
        category: 'text' as const,
        supported: true,
    },
    MD: {
        mimeType: 'text/markdown',
        extension: '.md',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'ملفات Markdown',
        icon: 'file-text',
        category: 'text' as const,
        supported: true,
    },
    RTF: {
        mimeType: 'application/rtf',
        extension: '.rtf',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'Rich Text Format',
        icon: 'file-text',
        category: 'text' as const,
        supported: true,
    },

    // العروض التقديمية
    PPT: {
        mimeType: 'application/vnd.ms-powerpoint',
        extension: '.ppt',
        maxSize: 50 * 1024 * 1024, // 50MB
        description: 'عروض PowerPoint القديمة',
        icon: 'presentation',
        category: 'presentation' as const,
        supported: true,
    },
    PPTX: {
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        extension: '.pptx',
        maxSize: 50 * 1024 * 1024, // 50MB
        description: 'عروض PowerPoint',
        icon: 'presentation',
        category: 'presentation' as const,
        supported: true,
    },

    // جداول البيانات
    XLS: {
        mimeType: 'application/vnd.ms-excel',
        extension: '.xls',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'جداول Excel القديمة',
        icon: 'table',
        category: 'spreadsheet' as const,
        supported: true,
    },
    XLSX: {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: '.xlsx',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'جداول Excel',
        icon: 'table',
        category: 'spreadsheet' as const,
        supported: true,
    },
    CSV: {
        mimeType: 'text/csv',
        extension: '.csv',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'ملفات CSV',
        icon: 'table',
        category: 'spreadsheet' as const,
        supported: true,
    },

    // الصور
    JPG: {
        mimeType: 'image/jpeg',
        extension: '.jpg',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'صور JPEG',
        icon: 'image',
        category: 'image' as const,
        supported: true,
    },
    PNG: {
        mimeType: 'image/png',
        extension: '.png',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'صور PNG',
        icon: 'image',
        category: 'image' as const,
        supported: true,
    },
    GIF: {
        mimeType: 'image/gif',
        extension: '.gif',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'صور GIF',
        icon: 'image',
        category: 'image' as const,
        supported: true,
    },
    WEBP: {
        mimeType: 'image/webp',
        extension: '.webp',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'صور WebP',
        icon: 'image',
        category: 'image' as const,
        supported: true,
    },

    // الأرشيف
    ZIP: {
        mimeType: 'application/zip',
        extension: '.zip',
        maxSize: 100 * 1024 * 1024, // 100MB
        description: 'أرشيف ZIP',
        icon: 'archive',
        category: 'archive' as const,
        supported: true,
    },
    RAR: {
        mimeType: 'application/x-rar-compressed',
        extension: '.rar',
        maxSize: 100 * 1024 * 1024, // 100MB
        description: 'أرشيف RAR',
        icon: 'archive',
        category: 'archive' as const,
        supported: false, // غير مدعوم حالياً
    },

    // ملفات البرمجة
    JSON: {
        mimeType: 'application/json',
        extension: '.json',
        maxSize: 1 * 1024 * 1024, // 1MB
        description: 'ملفات JSON',
        icon: 'code',
        category: 'code' as const,
        supported: true,
    },
    XML: {
        mimeType: 'application/xml',
        extension: '.xml',
        maxSize: 1 * 1024 * 1024, // 1MB
        description: 'ملفات XML',
        icon: 'code',
        category: 'code' as const,
        supported: true,
    },
} as const satisfies Record<string, FileTypeConfig>;


// أنواع الملفات المدعومة لرفع الملفات
export const UPLOAD_ACCEPTED_TYPES = {
    // المستندات
    documents: [
        SUPPORTED_FILE_TYPES.PDF.mimeType,
        SUPPORTED_FILE_TYPES.DOC.mimeType,
        SUPPORTED_FILE_TYPES.DOCX.mimeType,
        SUPPORTED_FILE_TYPES.TXT.mimeType,
        SUPPORTED_FILE_TYPES.RTF.mimeType,
    ],

    // العروض التقديمية
    presentations: [
        SUPPORTED_FILE_TYPES.PPT.mimeType,
        SUPPORTED_FILE_TYPES.PPTX.mimeType,
    ],

    // جداول البيانات
    spreadsheets: [
        SUPPORTED_FILE_TYPES.XLS.mimeType,
        SUPPORTED_FILE_TYPES.XLSX.mimeType,
        SUPPORTED_FILE_TYPES.CSV.mimeType,
    ],

    // الصور
    images: [
        SUPPORTED_FILE_TYPES.JPG.mimeType,
        SUPPORTED_FILE_TYPES.PNG.mimeType,
        SUPPORTED_FILE_TYPES.GIF.mimeType,
        SUPPORTED_FILE_TYPES.WEBP.mimeType,
    ],

    // جميع الملفات المدعومة
    all: Object.values(SUPPORTED_FILE_TYPES)
        .filter(type => type.supported)
        .map(type => type.mimeType),
} as const;

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

