/**
 * قواعد التحقق المشتركة
 * يوفر قواعد موحدة للتحقق من البيانات في جميع أنحاء التطبيق
 */

/**
 * قواعد التحقق من البيانات الموحدة
 *
 * هذا الملف يحتوي على جميع قواعد التحقق المستخدمة في التطبيق
 * لضمان الاتساق في التحقق من صحة البيانات
 */

/**
 * قواعد التحقق من النصوص
 */
export const TEXT_VALIDATION_RULES = {
    // أطوال النصوص الأساسية
    MIN_LENGTH: 1,
    MAX_LENGTH: 10000,
    MIN_LENGTH_FOR_PROCESSING: 10,
    MAX_LENGTH_FOR_PROCESSING: 50000,

    // أطوال النصوص المتدرجة
    SHORT_TEXT_MAX: 100,
    MEDIUM_TEXT_MAX: 500,
    LONG_TEXT_MAX: 2000,
    VERY_LONG_TEXT_MAX: 10000,

    // أطوال خاصة
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 128,
    USERNAME_MIN: 3,
    USERNAME_MAX: 30,
    EMAIL_MAX: 254,
    PHONE_MAX: 20,

    // أطوال المحتوى
    TITLE_MIN: 5,
    TITLE_MAX: 200,
    DESCRIPTION_MIN: 10,
    DESCRIPTION_MAX: 1000,
    CONTENT_MIN: 20,
    CONTENT_MAX: 50000,
} as const;

/**
 * قواعد التحقق من الأرقام
 */
export const NUMBER_VALIDATION_RULES = {
    // أطوال الأرقام
    MIN_VALUE: 0,
    MAX_VALUE: 999999999,

    // قيم خاصة
    CREDITS_MIN: 0,
    CREDITS_MAX: 1000000,
    PRICE_MIN: 0,
    PRICE_MAX: 100000,
    PERCENTAGE_MIN: 0,
    PERCENTAGE_MAX: 100,

    // أطوال الصفحات والشرائح
    PAGES_MIN: 1,
    PAGES_MAX: 1000,
    SLIDES_MIN: 1,
    SLIDES_MAX: 100,
    QUESTIONS_MIN: 1,
    QUESTIONS_MAX: 50,
} as const;

/**
 * قواعد التحقق من الملفات
 */
export const FILE_VALIDATION_RULES = {
    // أحجام الملفات الأساسية
    MAX_SIZE_PDF: 10 * 1024 * 1024, // 10MB
    MAX_SIZE_TEXT: 5 * 1024 * 1024, // 5MB
    MAX_SIZE_MARKDOWN: 5 * 1024 * 1024, // 5MB
    ACCEPTED_TYPES: ['application/pdf', 'text/plain', 'text/markdown'],

    // أحجام الملفات المتدرجة (بالبايت)
    MAX_SIZE_SMALL: 1024 * 1024, // 1MB
    MAX_SIZE_MEDIUM: 5 * 1024 * 1024, // 5MB
    MAX_SIZE_LARGE: 10 * 1024 * 1024, // 10MB
    MAX_SIZE_HUGE: 50 * 1024 * 1024, // 50MB
    MAX_SIZE_MASSIVE: 100 * 1024 * 1024, // 100MB,

    // عدد الملفات
    MAX_FILES_PER_UPLOAD: 10,
    MAX_FILES_PER_PROJECT: 50,

    // أسماء الملفات
    FILENAME_MIN: 1,
    FILENAME_MAX: 255,
    FILENAME_PATTERN: /^[a-zA-Z0-9._-]+$/,
} as const;

/**
 * قواعد التحقق من URLs
 */
export const URL_VALIDATION_RULES = {
    // أطوال URLs
    URL_MIN: 10,
    URL_MAX: 2048,

    // أنماط URLs
    HTTP_PATTERN: /^https?:\/\/.+/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
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

/**
 * رسائل التحقق الموحدة
 */
export const VALIDATION_MESSAGES = {
    // رسائل الأطوال
    REQUIRED: 'هذا الحقل مطلوب',
    MIN_LENGTH: (min: number) => `يجب أن يكون النص ${min} أحرف على الأقل`,
    MAX_LENGTH: (max: number) => `يجب أن يكون النص ${max} أحرف على الأكثر`,
    LENGTH_RANGE: (min: number, max: number) => `يجب أن يكون النص بين ${min} و ${max} أحرف`,

    // رسائل الأرقام
    MIN_VALUE: (min: number) => `يجب أن تكون القيمة ${min} على الأقل`,
    MAX_VALUE: (max: number) => `يجب أن تكون القيمة ${max} على الأكثر`,
    VALUE_RANGE: (min: number, max: number) => `يجب أن تكون القيمة بين ${min} و ${max}`,

    // رسائل الملفات
    FILE_TOO_LARGE: (maxSize: string) => `حجم الملف كبير جداً. الحد الأقصى ${maxSize}`,
    INVALID_FILE_TYPE: (types: string[]) => `نوع الملف غير مدعوم. الأنواع المدعومة: ${types.join(', ')}`,
    TOO_MANY_FILES: (max: number) => `عدد الملفات كبير جداً. الحد الأقصى ${max} ملف`,

    // رسائل عامة
    INVALID_FORMAT: 'تنسيق غير صحيح',
    INVALID_EMAIL: 'عنوان بريد إلكتروني غير صحيح',
    INVALID_PHONE: 'رقم هاتف غير صحيح',
    INVALID_URL: 'رابط غير صحيح',
    PASSWORDS_NOT_MATCH: 'كلمات المرور غير متطابقة',
    INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
    ACCOUNT_NOT_FOUND: 'الحساب غير موجود',
    ACCOUNT_ALREADY_EXISTS: 'الحساب موجود بالفعل',
    INSUFFICIENT_CREDITS: 'رصيد غير كافي',
    ACCESS_DENIED: 'الوصول مرفوض',
    OPERATION_FAILED: 'فشلت العملية',
    NETWORK_ERROR: 'خطأ في الشبكة',
    SERVER_ERROR: 'خطأ في الخادم',
    UNKNOWN_ERROR: 'خطأ غير معروف',

    // رسائل الملفات القديمة (للتوافق مع الإصدار السابق)
    FILE_TYPE_NOT_SUPPORTED: 'نوع الملف غير مدعوم',
    INVALID_FILE_FORMAT: 'تنسيق الملف غير صحيح',
} as const;

/**
 * أنماط التحقق الشائعة
 */
export const VALIDATION_PATTERNS = {
    // أنماط النصوص
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]+$/,
    ALPHANUMERIC_WITH_DASHES: /^[a-zA-Z0-9_-]+$/,
    ARABIC_TEXT: /^[\u0600-\u06FF\s]+$/,
    ENGLISH_TEXT: /^[a-zA-Z\s]+$/,
    MIXED_TEXT: /^[\u0600-\u06FFa-zA-Z0-9\s.,!?]+$/,

    // أنماط الأرقام
    POSITIVE_INTEGER: /^[1-9]\d*$/,
    NON_NEGATIVE_INTEGER: /^\d+$/,
    DECIMAL: /^\d+\.\d+$/,
    PERCENTAGE: /^(100(\.0+)?|[1-9]?\d(\.\d+)?)$/,

    // أنماط خاصة
    IBAN: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/,
    CREDIT_CARD: /^[0-9]{13,19}$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

    // أنماط الاتصال
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

/**
 * مساعد للتحقق من طول النص
 */
export const validateTextLength = (text: string, min: number, max: number): boolean => {
    return text.length >= min && text.length <= max;
};

/**
 * مساعد للتحقق من صحة البريد الإلكتروني
 */
export const validateEmail = (email: string): boolean => {
    return URL_VALIDATION_RULES.EMAIL_PATTERN.test(email);
};

/**
 * مساعد للتحقق من صحة رقم الهاتف
 */
export const validatePhone = (phone: string): boolean => {
    return URL_VALIDATION_RULES.PHONE_PATTERN.test(phone);
};

/**
 * مساعد للتحقق من صحة URL
 */
export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return URL_VALIDATION_RULES.HTTP_PATTERN.test(url);
    } catch {
        return false;
    }
};

/**
 * مساعد للتحقق من صحة كلمة المرور
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < TEXT_VALIDATION_RULES.PASSWORD_MIN) {
        errors.push(VALIDATION_MESSAGES.MIN_LENGTH(TEXT_VALIDATION_RULES.PASSWORD_MIN));
    }

    if (password.length > TEXT_VALIDATION_RULES.PASSWORD_MAX) {
        errors.push(VALIDATION_MESSAGES.MAX_LENGTH(TEXT_VALIDATION_RULES.PASSWORD_MAX));
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('يجب أن تحتوي كلمة المرور على رقم واحد على الأقل');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * مساعد للتحقق من صحة اسم المستخدم
 */
export const validateUsername = (username: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (username.length < TEXT_VALIDATION_RULES.USERNAME_MIN) {
        errors.push(VALIDATION_MESSAGES.MIN_LENGTH(TEXT_VALIDATION_RULES.USERNAME_MIN));
    }

    if (username.length > TEXT_VALIDATION_RULES.USERNAME_MAX) {
        errors.push(VALIDATION_MESSAGES.MAX_LENGTH(TEXT_VALIDATION_RULES.USERNAME_MAX));
    }

    if (!VALIDATION_PATTERNS.ALPHANUMERIC_WITH_DASHES.test(username)) {
        errors.push('يجب أن يحتوي اسم المستخدم على أحرف وأرقام وشرطات وشرطات سفلية فقط');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};
