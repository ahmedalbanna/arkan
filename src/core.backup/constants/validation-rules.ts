/**
 * قواعد التحقق المشتركة
 * يوفر قواعد موحدة للتحقق من البيانات في جميع أنحاء التطبيق
 */

// قواعد التحقق الأساسية للنصوص
export const TEXT_VALIDATION_RULES = {
    MIN_LENGTH: 5,
    MAX_LENGTH: 10000,
    MIN_LENGTH_FOR_PROCESSING: 10,
    MAX_LENGTH_FOR_PROCESSING: 50000,
} as const;

// قواعد التحقق للملفات
export const FILE_VALIDATION_RULES = {
    MAX_SIZE_PDF: 10 * 1024 * 1024, // 10MB
    MAX_SIZE_TEXT: 5 * 1024 * 1024, // 5MB
    MAX_SIZE_MARKDOWN: 5 * 1024 * 1024, // 5MB
    ACCEPTED_TYPES: ['application/pdf', 'text/plain', 'text/markdown'],
} as const;

// قواعد التحقق للمستخدمين
export const USER_VALIDATION_RULES = {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MIN_EMAIL_LENGTH: 5,
    MAX_EMAIL_LENGTH: 100,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
} as const;

// قواعد التحقق للمشاريع
export const PROJECT_VALIDATION_RULES = {
    MIN_TITLE_LENGTH: 3,
    MAX_TITLE_LENGTH: 200,
    MIN_DESCRIPTION_LENGTH: 10,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_SECTIONS: 20,
} as const;

// رسائل الخطأ المشتركة
export const VALIDATION_MESSAGES = {
    REQUIRED: 'هذا الحقل مطلوب',
    MIN_LENGTH: (min: number) => `يجب أن يكون على الأقل ${min} أحرف`,
    MAX_LENGTH: (max: number) => `يجب أن يكون أقل من ${max} أحرف`,
    INVALID_EMAIL: 'عنوان البريد الإلكتروني غير صحيح',
    INVALID_URL: 'رابط غير صحيح',
    INVALID_PHONE: 'رقم الهاتف غير صحيح',
    FILE_TOO_LARGE: (maxSize: number) => `حجم الملف كبير جداً. الحد الأقصى ${maxSize / (1024 * 1024)}MB`,
    FILE_TYPE_NOT_SUPPORTED: 'نوع الملف غير مدعوم',
    INVALID_FILE_FORMAT: 'تنسيق الملف غير صحيح',
} as const;

// أنماط التحقق
export const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    ARABIC_TEXT: /^[\u0600-\u06FF\s]+$/,
    ENGLISH_TEXT: /^[a-zA-Z\s]+$/,
} as const;
