/**
 * أنواع الملفات المدعومة في التطبيق
 *
 * هذا الملف يحتوي على جميع أنواع الملفات المدعومة
 * مع أحجامها القصوى وخصائصها
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
    /** هل الملف مدعوم للرفع */
    supported: boolean;
}

export const SUPPORTED_FILE_TYPES = {
    // مستندات النص
    PDF: {
        mimeType: 'application/pdf',
        extension: '.pdf',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'PDF Document',
        supported: true,
    },
    DOC: {
        mimeType: 'application/msword',
        extension: '.doc',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'Microsoft Word Document',
        supported: true,
    },
    DOCX: {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extension: '.docx',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'Microsoft Word Document (OpenXML)',
        supported: true,
    },
    TXT: {
        mimeType: 'text/plain',
        extension: '.txt',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'Plain Text File',
        supported: true,
    },
    RTF: {
        mimeType: 'application/rtf',
        extension: '.rtf',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'Rich Text Format',
        supported: true,
    },

    // العروض التقديمية
    PPT: {
        mimeType: 'application/vnd.ms-powerpoint',
        extension: '.ppt',
        maxSize: 50 * 1024 * 1024, // 50MB
        description: 'Microsoft PowerPoint Presentation',
        supported: true,
    },
    PPTX: {
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        extension: '.pptx',
        maxSize: 50 * 1024 * 1024, // 50MB
        description: 'Microsoft PowerPoint Presentation (OpenXML)',
        supported: true,
    },

    // جداول البيانات
    XLS: {
        mimeType: 'application/vnd.ms-excel',
        extension: '.xls',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'Microsoft Excel Spreadsheet',
        supported: true,
    },
    XLSX: {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: '.xlsx',
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'Microsoft Excel Spreadsheet (OpenXML)',
        supported: true,
    },

    // الصور
    JPG: {
        mimeType: 'image/jpeg',
        extension: '.jpg',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'JPEG Image',
        supported: true,
    },
    PNG: {
        mimeType: 'image/png',
        extension: '.png',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'PNG Image',
        supported: true,
    },
    GIF: {
        mimeType: 'image/gif',
        extension: '.gif',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'GIF Image',
        supported: true,
    },
    WEBP: {
        mimeType: 'image/webp',
        extension: '.webp',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'WebP Image',
        supported: true,
    },

    // الأرشيف
    ZIP: {
        mimeType: 'application/zip',
        extension: '.zip',
        maxSize: 100 * 1024 * 1024, // 100MB
        description: 'ZIP Archive',
        supported: true,
    },
    RAR: {
        mimeType: 'application/x-rar-compressed',
        extension: '.rar',
        maxSize: 100 * 1024 * 1024, // 100MB
        description: 'RAR Archive',
        supported: false, // غير مدعوم حالياً
    },

    // ملفات البرمجة
    JSON: {
        mimeType: 'application/json',
        extension: '.json',
        maxSize: 1 * 1024 * 1024, // 1MB
        description: 'JSON File',
        supported: true,
    },
    XML: {
        mimeType: 'application/xml',
        extension: '.xml',
        maxSize: 1 * 1024 * 1024, // 1MB
        description: 'XML File',
        supported: true,
    },
    CSV: {
        mimeType: 'text/csv',
        extension: '.csv',
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'CSV File',
        supported: true,
    },
} as const satisfies Record<string, FileTypeConfig>;

/**
 * أنواع الملفات المقبولة للرفع حسب الفئة
 */
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

/**
 * قواعد التحقق من الملفات
 */
export const FILE_VALIDATION_RULES = {
    // أحجام الملفات القصوى
    MAX_SIZE_PDF: SUPPORTED_FILE_TYPES.PDF.maxSize,
    MAX_SIZE_DOC: SUPPORTED_FILE_TYPES.DOC.maxSize,
    MAX_SIZE_DOCX: SUPPORTED_FILE_TYPES.DOCX.maxSize,
    MAX_SIZE_TXT: SUPPORTED_FILE_TYPES.TXT.maxSize,
    MAX_SIZE_IMAGE: SUPPORTED_FILE_TYPES.JPG.maxSize,
    MAX_SIZE_PRESENTATION: SUPPORTED_FILE_TYPES.PPTX.maxSize,

    // أحجام افتراضية
    DEFAULT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    LARGE_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    HUGE_FILE_SIZE: 100 * 1024 * 1024, // 100MB
} as const;

/**
 * مساعد للتحقق من نوع الملف
 */
export const getFileTypeByMime = (mimeType: string): FileTypeConfig | null => {
    return Object.values(SUPPORTED_FILE_TYPES).find(type => type.mimeType === mimeType) || null;
};

/**
 * مساعد للتحقق من امتداد الملف
 */
export const getFileTypeByExtension = (extension: string): FileTypeConfig | null => {
    const normalizedExt = extension.startsWith('.') ? extension : `.${extension}`;
    return Object.values(SUPPORTED_FILE_TYPES).find(type => type.extension === normalizedExt) || null;
};

/**
 * مساعد للتحقق من صحة حجم الملف
 */
export const isValidFileSize = (file: File, maxSize?: number): boolean => {
    const fileType = getFileTypeByMime(file.type);
    const allowedSize = maxSize || fileType?.maxSize || FILE_VALIDATION_RULES.DEFAULT_MAX_SIZE;
    return file.size <= allowedSize;
};

/**
 * مساعد للتحقق من صحة نوع الملف
 */
export const isValidFileType = (file: File, acceptedTypes?: string[]): boolean => {
    const types = acceptedTypes || UPLOAD_ACCEPTED_TYPES.all;
    return types.includes(file.type);
};
