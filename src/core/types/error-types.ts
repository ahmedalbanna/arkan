/**
 * أنواع الأخطاء المحسنة مع رسائل واضحة للمستخدم
 * يوفر تصنيفاً شاملاً للأخطاء مع إرشادات التعافي
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorCategory =
    | 'network'           // أخطاء الشبكة
    | 'authentication'     // أخطاء المصادقة
    | 'validation'         // أخطاء التحقق من صحة البيانات
    | 'ai_generation'     // أخطاء توليد الذكاء الاصطناعي
    | 'file_upload'       // أخطاء رفع الملفات
    | 'export'            // أخطاء التصدير
    | 'database'          // أخطاء قاعدة البيانات
    | 'permission'        // أخطاء الصلاحيات
    | 'rate_limit'        // أخطاء حد المعدل
    | 'system'            // أخطاء النظام العامة
    | 'user_input'        // أخطاء إدخال المستخدم
    | 'external_service'; // أخطاء الخدمات الخارجية

export interface EnhancedError {
    // معلومات أساسية
    code: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;

    // معلومات المستخدم
    userMessage: string;           // رسالة واضحة للمستخدم
    userGuidance: string;           // إرشادات للمستخدم
    suggestedActions: string[];     // إجراءات مقترحة

    // معلومات تقنية
    technicalDetails?: string;      // تفاصيل تقنية للمطورين
    context?: Record<string, any>;  // سياق الخطأ

    // معلومات التعافي
    isRetryable: boolean;           // هل يمكن إعادة المحاولة؟
    retryAfter?: number;           // وقت الانتظار قبل إعادة المحاولة (بالثواني)
    fallbackAvailable: boolean;     // هل يوجد حل احتياطي؟

    // معلومات التتبع
    timestamp: string;
    sessionId?: string;
    userId?: string;
    requestId?: string;
}

export interface ErrorRecoveryOptions {
    // خيارات إعادة المحاولة
    maxRetries: number;
    retryDelay: number;            // تأخير بين المحاولات (بالثواني)
    backoffMultiplier: number;     // مضاعف التأخير

    // خيارات الحل الاحتياطي
    fallbackStrategy?: 'simplified' | 'cached' | 'offline' | 'manual';
    fallbackMessage?: string;

    // خيارات المستخدم
    showRetryButton: boolean;
    showFallbackButton: boolean;
    allowManualRetry: boolean;
}

// رسائل الأخطاء المحسنة
export const ERROR_MESSAGES = {
    // أخطاء الشبكة
    NETWORK_TIMEOUT: {
        userMessage: 'انتهت مهلة الاتصال بالخادم',
        userGuidance: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
        suggestedActions: ['تحقق من اتصال الإنترنت', 'أعد المحاولة', 'اتصل بالدعم الفني إذا استمرت المشكلة']
    },

    NETWORK_ERROR: {
        userMessage: 'فشل في الاتصال بالخادم',
        userGuidance: 'قد تكون هناك مشكلة في الشبكة أو الخادم',
        suggestedActions: ['تحقق من اتصال الإنترنت', 'أعد المحاولة', 'جرب لاحقاً']
    },

    // أخطاء المصادقة
    AUTH_EXPIRED: {
        userMessage: 'انتهت صلاحية جلسة العمل',
        userGuidance: 'يرجى تسجيل الدخول مرة أخرى',
        suggestedActions: ['تسجيل الدخول مرة أخرى', 'تحديث الصفحة']
    },

    AUTH_INVALID: {
        userMessage: 'بيانات الدخول غير صحيحة',
        userGuidance: 'تحقق من اسم المستخدم وكلمة المرور',
        suggestedActions: ['تحقق من البيانات المدخلة', 'استخدم نسيت كلمة المرور']
    },

    // أخطاء التحقق من صحة البيانات
    VALIDATION_REQUIRED: {
        userMessage: 'يرجى ملء جميع الحقول المطلوبة',
        userGuidance: 'تحقق من الحقول المميزة باللون الأحمر',
        suggestedActions: ['املأ الحقول المطلوبة', 'تحقق من صحة البيانات']
    },

    VALIDATION_FORMAT: {
        userMessage: 'تنسيق البيانات غير صحيح',
        userGuidance: 'تحقق من تنسيق البيانات المدخلة',
        suggestedActions: ['تحقق من التنسيق المطلوب', 'راجع الأمثلة المعروضة']
    },

    // أخطاء الذكاء الاصطناعي
    AI_GENERATION_FAILED: {
        userMessage: 'فشل في توليد المحتوى',
        userGuidance: 'قد تكون هناك مشكلة مؤقتة في خدمة الذكاء الاصطناعي',
        suggestedActions: ['أعد المحاولة', 'جرب محتوى أبسط', 'اتصل بالدعم الفني']
    },

    AI_QUALITY_LOW: {
        userMessage: 'جودة المحتوى المولد منخفضة',
        userGuidance: 'يمكننا تحسين المحتوى أو إعادة توليده',
        suggestedActions: ['تحسين المحتوى', 'إعادة التوليد', 'تعديل المتطلبات']
    },

    // أخطاء رفع الملفات
    FILE_TOO_LARGE: {
        userMessage: 'حجم الملف كبير جداً',
        userGuidance: 'يرجى اختيار ملف أصغر أو ضغط الملف',
        suggestedActions: ['اختر ملف أصغر', 'اضغط الملف', 'استخدم خدمة ضغط الملفات']
    },

    FILE_TYPE_INVALID: {
        userMessage: 'نوع الملف غير مدعوم',
        userGuidance: 'يرجى اختيار نوع ملف مدعوم',
        suggestedActions: ['اختر نوع ملف مدعوم', 'راجع قائمة الأنواع المدعومة']
    },

    // أخطاء التصدير
    EXPORT_FAILED: {
        userMessage: 'فشل في تصدير الملف',
        userGuidance: 'قد تكون هناك مشكلة في معالجة البيانات',
        suggestedActions: ['أعد المحاولة', 'تحقق من البيانات', 'جرب تنسيق آخر']
    },

    // أخطاء قاعدة البيانات
    DATABASE_ERROR: {
        userMessage: 'مشكلة في حفظ البيانات',
        userGuidance: 'قد تكون هناك مشكلة مؤقتة في الخادم',
        suggestedActions: ['أعد المحاولة', 'حفظ البيانات محلياً', 'اتصل بالدعم الفني']
    },

    // أخطاء الصلاحيات
    PERMISSION_DENIED: {
        userMessage: 'ليس لديك صلاحية للقيام بهذا الإجراء',
        userGuidance: 'يرجى التواصل مع المدير للحصول على الصلاحيات المطلوبة',
        suggestedActions: ['اتصل بالمدير', 'تحقق من الصلاحيات', 'اطلب الصلاحيات المطلوبة']
    },

    // أخطاء حد المعدل
    RATE_LIMIT_EXCEEDED: {
        userMessage: 'تم تجاوز الحد المسموح من الطلبات',
        userGuidance: 'يرجى الانتظار قليلاً قبل إعادة المحاولة',
        suggestedActions: ['انتظر قليلاً', 'أعد المحاولة لاحقاً', 'فكر في ترقية الخطة']
    },

    // أخطاء النظام العامة
    SYSTEM_ERROR: {
        userMessage: 'حدث خطأ غير متوقع',
        userGuidance: 'نعتذر عن الإزعاج، فريقنا يعمل على حل المشكلة',
        suggestedActions: ['أعد المحاولة', 'تحديث الصفحة', 'اتصل بالدعم الفني']
    },

    // أخطاء إدخال المستخدم
    USER_INPUT_INVALID: {
        userMessage: 'البيانات المدخلة غير صحيحة',
        userGuidance: 'يرجى مراجعة البيانات المدخلة والتأكد من صحتها',
        suggestedActions: ['راجع البيانات المدخلة', 'تحقق من التنسيق', 'استخدم الأمثلة المعروضة']
    },

    // أخطاء الخدمات الخارجية
    EXTERNAL_SERVICE_ERROR: {
        userMessage: 'مشكلة في خدمة خارجية',
        userGuidance: 'قد تكون هناك مشكلة مؤقتة في إحدى الخدمات المستخدمة',
        suggestedActions: ['أعد المحاولة', 'جرب لاحقاً', 'اتصل بالدعم الفني']
    }
} as const;

// إعدادات التعافي للأخطاء المختلفة
export const ERROR_RECOVERY_CONFIG: Record<ErrorCategory, ErrorRecoveryOptions> = {
    network: {
        maxRetries: 3,
        retryDelay: 2,
        backoffMultiplier: 2,
        fallbackStrategy: 'offline',
        showRetryButton: true,
        showFallbackButton: true,
        allowManualRetry: true
    },

    authentication: {
        maxRetries: 1,
        retryDelay: 0,
        backoffMultiplier: 1,
        fallbackStrategy: 'manual',
        fallbackMessage: 'يرجى تسجيل الدخول مرة أخرى',
        showRetryButton: false,
        showFallbackButton: true,
        allowManualRetry: false
    },

    validation: {
        maxRetries: 0,
        retryDelay: 0,
        backoffMultiplier: 1,
        showRetryButton: false,
        showFallbackButton: false,
        allowManualRetry: false
    },

    ai_generation: {
        maxRetries: 2,
        retryDelay: 5,
        backoffMultiplier: 1.5,
        fallbackStrategy: 'simplified',
        fallbackMessage: 'يمكننا تجربة توليد أبسط',
        showRetryButton: true,
        showFallbackButton: true,
        allowManualRetry: true
    },

    file_upload: {
        maxRetries: 2,
        retryDelay: 3,
        backoffMultiplier: 1.5,
        showRetryButton: true,
        showFallbackButton: false,
        allowManualRetry: true
    },

    export: {
        maxRetries: 2,
        retryDelay: 3,
        backoffMultiplier: 1.5,
        fallbackStrategy: 'cached',
        showRetryButton: true,
        showFallbackButton: true,
        allowManualRetry: true
    },

    database: {
        maxRetries: 3,
        retryDelay: 2,
        backoffMultiplier: 2,
        fallbackStrategy: 'cached',
        showRetryButton: true,
        showFallbackButton: true,
        allowManualRetry: true
    },

    permission: {
        maxRetries: 0,
        retryDelay: 0,
        backoffMultiplier: 1,
        showRetryButton: false,
        showFallbackButton: false,
        allowManualRetry: false
    },

    rate_limit: {
        maxRetries: 0,
        retryDelay: 60,
        backoffMultiplier: 1,
        showRetryButton: true,
        showFallbackButton: false,
        allowManualRetry: true
    },

    system: {
        maxRetries: 2,
        retryDelay: 5,
        backoffMultiplier: 2,
        fallbackStrategy: 'manual',
        showRetryButton: true,
        showFallbackButton: true,
        allowManualRetry: true
    },

    user_input: {
        maxRetries: 0,
        retryDelay: 0,
        backoffMultiplier: 1,
        showRetryButton: false,
        showFallbackButton: false,
        allowManualRetry: false
    },

    external_service: {
        maxRetries: 2,
        retryDelay: 5,
        backoffMultiplier: 1.5,
        fallbackStrategy: 'manual',
        showRetryButton: true,
        showFallbackButton: true,
        allowManualRetry: true
    }
};

// دالة مساعدة لإنشاء خطأ محسن
export function createEnhancedError(
    code: keyof typeof ERROR_MESSAGES,
    category: ErrorCategory,
    severity: ErrorSeverity = 'medium',
    context?: Record<string, any>
): EnhancedError {
    const errorInfo = ERROR_MESSAGES[code];
    const recoveryConfig = ERROR_RECOVERY_CONFIG[category];

    return {
        code,
        message: errorInfo.userMessage,
        category,
        severity,
        userMessage: errorInfo.userMessage,
        userGuidance: errorInfo.userGuidance,
        suggestedActions: [...errorInfo.suggestedActions],
        isRetryable: recoveryConfig.maxRetries > 0,
        retryAfter: recoveryConfig.retryDelay,
        fallbackAvailable: !!recoveryConfig.fallbackStrategy,
        timestamp: new Date().toISOString(),
        context
    };
}
