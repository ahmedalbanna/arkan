/**
 * نظام معالجة الأخطاء المحسن مع آليات إعادة المحاولة الذكية
 * يوفر تجربة مستخدم ممتازة مع استراتيجيات التعافي المتقدمة
 */

import { toast } from '@/hooks/use-toast';
import {
    EnhancedError,
    ErrorCategory,
    ErrorSeverity,
    ERROR_MESSAGES,
    ERROR_RECOVERY_CONFIG,
    createEnhancedError
} from '../types/error-types';

export interface RetryContext {
    attempt: number;
    maxAttempts: number;
    delay: number;
    backoffMultiplier: number;
    lastError?: Error;
}

export interface ErrorHandlingResult {
    success: boolean;
    error?: EnhancedError;
    retryContext?: RetryContext;
    fallbackUsed?: boolean;
}

export class EnhancedErrorHandler {
    private static retryContexts = new Map<string, RetryContext>();
    private static errorHistory = new Map<string, EnhancedError[]>();

    /**
     * معالجة شاملة للأخطاء مع إعادة المحاولة الذكية
     */
    static async handleWithRetry<T>(
        operation: () => Promise<T>,
        context: {
            operationId: string;
            category: ErrorCategory;
            severity?: ErrorSeverity;
            customErrorCode?: keyof typeof ERROR_MESSAGES;
            userId?: string;
            sessionId?: string;
            requestId?: string;
        }
    ): Promise<ErrorHandlingResult> {
        const { operationId, category, severity = 'medium', customErrorCode, userId, sessionId, requestId } = context;

        try {
            const result = await operation();

            // نجحت العملية - مسح سياق إعادة المحاولة
            this.clearRetryContext(operationId);

            return { success: true };
        } catch (error) {
            return await this.handleError(error, {
                operationId,
                category,
                severity,
                customErrorCode,
                userId,
                sessionId,
                requestId
            });
        }
    }

    /**
     * معالجة الخطأ مع تحديد استراتيجية التعافي
     */
    private static async handleError(
        error: unknown,
        context: {
            operationId: string;
            category: ErrorCategory;
            severity: ErrorSeverity;
            customErrorCode?: keyof typeof ERROR_MESSAGES;
            userId?: string;
            sessionId?: string;
            requestId?: string;
        }
    ): Promise<ErrorHandlingResult> {
        const { operationId, category, severity, customErrorCode, userId, sessionId, requestId } = context;

        // إنشاء خطأ محسن
        const enhancedError = this.createEnhancedErrorFromException(
            error,
            category,
            severity,
            customErrorCode,
            { userId, sessionId, requestId }
        );

        // تسجيل الخطأ
        this.logError(enhancedError, operationId);

        // تحديد استراتيجية التعافي
        const recoveryConfig = ERROR_RECOVERY_CONFIG[category];
        const retryContext = this.getOrCreateRetryContext(operationId, recoveryConfig);

        // التحقق من إمكانية إعادة المحاولة
        if (this.shouldRetry(enhancedError, retryContext)) {
            return await this.attemptRetry(operationId, retryContext, enhancedError);
        }

        // عرض الخطأ للمستخدم
        this.showErrorToUser(enhancedError, recoveryConfig);

        return {
            success: false,
            error: enhancedError,
            retryContext
        };
    }

    /**
     * إنشاء خطأ محسن من الاستثناء
     */
    private static createEnhancedErrorFromException(
        error: unknown,
        category: ErrorCategory,
        severity: ErrorSeverity,
        customErrorCode?: keyof typeof ERROR_MESSAGES,
        metadata?: { userId?: string; sessionId?: string; requestId?: string }
    ): EnhancedError {
        // تحديد نوع الخطأ
        const errorCode = this.determineErrorCode(error, category, customErrorCode);
        const errorInfo = ERROR_MESSAGES[errorCode];
        const recoveryConfig = ERROR_RECOVERY_CONFIG[category];

        return {
            code: errorCode,
            message: errorInfo.userMessage,
            category,
            severity,
            userMessage: errorInfo.userMessage,
            userGuidance: errorInfo.userGuidance,
            suggestedActions: errorInfo.suggestedActions,
            technicalDetails: error instanceof Error ? error.message : String(error),
            isRetryable: recoveryConfig.maxRetries > 0,
            retryAfter: recoveryConfig.retryDelay,
            fallbackAvailable: !!recoveryConfig.fallbackStrategy,
            timestamp: new Date().toISOString(),
            userId: metadata?.userId,
            sessionId: metadata?.sessionId,
            requestId: metadata?.requestId,
            context: { originalError: error }
        };
    }

    /**
     * تحديد نوع الخطأ
     */
    private static determineErrorCode(
        error: unknown,
        category: ErrorCategory,
        customErrorCode?: keyof typeof ERROR_MESSAGES
    ): keyof typeof ERROR_MESSAGES {
        if (customErrorCode) {
            return customErrorCode;
        }

        // تحديد نوع الخطأ بناءً على الاستثناء والفئة
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

            if (message.includes('timeout') || message.includes('timed out')) {
                return 'NETWORK_TIMEOUT';
            }

            if (message.includes('network') || message.includes('fetch')) {
                return 'NETWORK_ERROR';
            }

            if (message.includes('unauthorized') || message.includes('forbidden')) {
                return 'AUTH_INVALID';
            }

            if (message.includes('validation') || message.includes('invalid')) {
                return 'VALIDATION_FORMAT';
            }

            if (message.includes('rate limit') || message.includes('too many requests')) {
                return 'RATE_LIMIT_EXCEEDED';
            }
        }

        // تحديد نوع الخطأ بناءً على الفئة
        switch (category) {
            case 'network':
                return 'NETWORK_ERROR';
            case 'authentication':
                return 'AUTH_EXPIRED';
            case 'validation':
                return 'VALIDATION_REQUIRED';
            case 'ai_generation':
                return 'AI_GENERATION_FAILED';
            case 'file_upload':
                return 'FILE_TOO_LARGE';
            case 'export':
                return 'EXPORT_FAILED';
            case 'database':
                return 'DATABASE_ERROR';
            case 'permission':
                return 'PERMISSION_DENIED';
            case 'rate_limit':
                return 'RATE_LIMIT_EXCEEDED';
            case 'system':
                return 'SYSTEM_ERROR';
            case 'user_input':
                return 'USER_INPUT_INVALID';
            case 'external_service':
                return 'EXTERNAL_SERVICE_ERROR';
            default:
                return 'SYSTEM_ERROR';
        }
    }

    /**
     * التحقق من إمكانية إعادة المحاولة
     */
    private static shouldRetry(error: EnhancedError, retryContext: RetryContext): boolean {
        if (!error.isRetryable) {
            return false;
        }

        if (retryContext.attempt >= retryContext.maxAttempts) {
            return false;
        }

        // عدم إعادة المحاولة للأخطاء الحرجة
        if (error.severity === 'critical') {
            return false;
        }

        return true;
    }

    /**
     * محاولة إعادة المحاولة
     */
    private static async attemptRetry(
        operationId: string,
        retryContext: RetryContext,
        error: EnhancedError
    ): Promise<ErrorHandlingResult> {
        retryContext.attempt++;
        retryContext.delay *= retryContext.backoffMultiplier;
        retryContext.lastError = new Error(error.message);

        // تحديث سياق إعادة المحاولة
        this.retryContexts.set(operationId, retryContext);

        // عرض رسالة إعادة المحاولة
        this.showRetryMessage(error, retryContext);

        // انتظار قبل إعادة المحاولة
        await this.delay(retryContext.delay * 1000);

        return {
            success: false,
            error,
            retryContext,
            fallbackUsed: false
        };
    }

    /**
     * عرض رسالة إعادة المحاولة
     */
    private static showRetryMessage(error: EnhancedError, retryContext: RetryContext): void {
        const remainingAttempts = retryContext.maxAttempts - retryContext.attempt;

        toast({
            title: 'إعادة المحاولة...',
            description: `${error.userMessage} (محاولة ${retryContext.attempt} من ${retryContext.maxAttempts})`,
            variant: 'default',
            duration: 3000
        });
    }

    /**
     * عرض الخطأ للمستخدم
     */
    private static showErrorToUser(error: EnhancedError, recoveryConfig: any): void {
        const actions = error.suggestedActions.slice(0, 2); // عرض أول إجراءين فقط

        toast({
            title: error.userMessage,
            description: (
                <div className= "space-y-2" >
                <p>{ error.userGuidance } </p>
          {
                actions.length > 0 && (
                    <ul className="text-sm text-muted-foreground">
                    {
                        actions.map((action, index) => (
                            <li key= { index } >• { action } </li>
                        ))
    }
            </ul>
          )}
</div>
      ),
variant: error.severity === 'critical' ? 'destructive' : 'default',
    duration: error.severity === 'critical' ? 10000 : 5000
    });
  }

  /**
   * الحصول على أو إنشاء سياق إعادة المحاولة
   */
  private static getOrCreateRetryContext(
        operationId: string,
        recoveryConfig: any
    ): RetryContext {
    let context = this.retryContexts.get(operationId);

    if (!context) {
        context = {
            attempt: 0,
            maxAttempts: recoveryConfig.maxRetries,
            delay: recoveryConfig.retryDelay,
            backoffMultiplier: recoveryConfig.backoffMultiplier
        };
        this.retryContexts.set(operationId, context);
    }

    return context;
}

  /**
   * مسح سياق إعادة المحاولة
   */
  private static clearRetryContext(operationId: string): void {
    this.retryContexts.delete(operationId);
}

  /**
   * تسجيل الخطأ
   */
  private static logError(error: EnhancedError, operationId: string): void {
    // إضافة الخطأ إلى التاريخ
    const history = this.errorHistory.get(operationId) || [];
    history.push(error);
    this.errorHistory.set(operationId, history);

    // تسجيل الخطأ في وحدة التحكم
    console.error(`[${error.category}] ${error.code}:`, {
        message: error.message,
        userMessage: error.userMessage,
        technicalDetails: error.technicalDetails,
        context: error.context,
        timestamp: error.timestamp
    });

    // إرسال الخطأ إلى خدمة المراقبة (إذا كانت متاحة)
    this.reportToMonitoringService(error);
}

  /**
   * إرسال الخطأ إلى خدمة المراقبة
   */
  private static reportToMonitoringService(error: EnhancedError): void {
    // يمكن إضافة تكامل مع خدمات المراقبة مثل Sentry أو Firebase Crashlytics
    if(typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: error.severity === 'critical',
        custom_map: {
            error_code: error.code,
            error_category: error.category,
            error_severity: error.severity
        }
    });
}
  }

  /**
   * تأخير التنفيذ
   */
  private static delay(ms: number): Promise < void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

  /**
   * الحصول على تاريخ الأخطاء
   */
  static getErrorHistory(operationId: string): EnhancedError[] {
    return this.errorHistory.get(operationId) || [];
}

  /**
   * مسح تاريخ الأخطاء
   */
  static clearErrorHistory(operationId: string): void {
    this.errorHistory.delete(operationId);
}

  /**
   * الحصول على إحصائيات الأخطاء
   */
  static getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
} {
    const stats = {
        totalErrors: 0,
        errorsByCategory: {} as Record<ErrorCategory, number>,
        errorsBySeverity: {} as Record<ErrorSeverity, number>
    };

    for (const history of this.errorHistory.values()) {
        for (const error of history) {
            stats.totalErrors++;

            stats.errorsByCategory[error.category] =
                (stats.errorsByCategory[error.category] || 0) + 1;

            stats.errorsBySeverity[error.severity] =
                (stats.errorsBySeverity[error.severity] || 0) + 1;
        }
    }

    return stats;
}

  /**
   * تسجيل خطأ مباشر
   */
  static recordError(error: EnhancedError, operationId: string = 'default'): void {
    // إضافة الخطأ إلى التاريخ
    const history = this.errorHistory.get(operationId) || [];
    history.push(error);
    this.errorHistory.set(operationId, history);

    // تسجيل الخطأ في وحدة التحكم
    console.error(`[${error.category}] ${error.code}:`, {
        message: error.message,
        userMessage: error.userMessage,
        technicalDetails: error.technicalDetails,
        context: error.context,
        timestamp: error.timestamp
    });

    // إرسال الخطأ إلى خدمة المراقبة
    this.reportToMonitoringService(error);
}

  /**
   * إنشاء خطأ محسن من استثناء
   */
  static createEnhancedError(
    error: unknown,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context ?: Record<string, any>
): EnhancedError {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    const errorCode = error instanceof Error ? error.name : 'UNKNOWN_ERROR';

    return {
        code: errorCode,
        message: errorMessage,
        category,
        severity,
        userMessage: this.getUserFriendlyMessage(errorCode, category),
        userGuidance: this.getUserGuidance(errorCode, category),
        suggestedActions: this.getSuggestedActions(errorCode, category),
        technicalDetails: error instanceof Error ? error.stack : undefined,
        context,
        isRetryable: this.isRetryableError(errorCode, category),
        retryAfter: this.getRetryDelay(category),
        fallbackAvailable: this.hasFallbackStrategy(category),
        timestamp: new Date().toISOString()
    };
}

  /**
   * الحصول على رسالة ودية للمستخدم
   */
  private static getUserFriendlyMessage(errorCode: string, category: ErrorCategory): string {
    const messages: Record<string, string> = {
        'NETWORK_ERROR': 'مشكلة في الاتصال بالإنترنت',
        'AUTHENTICATION_ERROR': 'مشكلة في تسجيل الدخول',
        'VALIDATION_ERROR': 'البيانات المدخلة غير صحيحة',
        'AI_GENERATION_ERROR': 'مشكلة في توليد المحتوى',
        'FILE_UPLOAD_ERROR': 'مشكلة في رفع الملف',
        'EXPORT_ERROR': 'مشكلة في تصدير الملف',
        'DATABASE_ERROR': 'مشكلة في حفظ البيانات',
        'PERMISSION_ERROR': 'ليس لديك صلاحية للقيام بهذا الإجراء',
        'RATE_LIMIT_ERROR': 'تم تجاوز الحد المسموح من الطلبات',
        'SYSTEM_ERROR': 'حدث خطأ غير متوقع',
        'UNKNOWN_ERROR': 'حدث خطأ غير معروف'
    };

    return messages[errorCode] || messages['UNKNOWN_ERROR'];
}

  /**
   * الحصول على إرشادات للمستخدم
   */
  private static getUserGuidance(errorCode: string, category: ErrorCategory): string {
    const guidance: Record<string, string> = {
        'NETWORK_ERROR': 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
        'AUTHENTICATION_ERROR': 'يرجى تسجيل الدخول مرة أخرى',
        'VALIDATION_ERROR': 'تحقق من البيانات المدخلة والتأكد من صحتها',
        'AI_GENERATION_ERROR': 'يمكننا تجربة توليد أبسط أو إعادة المحاولة',
        'FILE_UPLOAD_ERROR': 'تحقق من حجم ونوع الملف وحاول مرة أخرى',
        'EXPORT_ERROR': 'تحقق من البيانات وحاول تصدير تنسيق آخر',
        'DATABASE_ERROR': 'أعد المحاولة أو اتصل بالدعم الفني',
        'PERMISSION_ERROR': 'اتصل بالمدير للحصول على الصلاحيات المطلوبة',
        'RATE_LIMIT_ERROR': 'انتظر قليلاً قبل إعادة المحاولة',
        'SYSTEM_ERROR': 'أعد المحاولة أو اتصل بالدعم الفني',
        'UNKNOWN_ERROR': 'أعد المحاولة أو اتصل بالدعم الفني'
    };

    return guidance[errorCode] || guidance['UNKNOWN_ERROR'];
}

  /**
   * الحصول على الإجراءات المقترحة
   */
  private static getSuggestedActions(errorCode: string, category: ErrorCategory): string[] {
    const actions: Record<string, string[]> = {
        'NETWORK_ERROR': ['تحقق من اتصال الإنترنت', 'أعد المحاولة', 'اتصل بالدعم الفني'],
        'AUTHENTICATION_ERROR': ['تسجيل الدخول مرة أخرى', 'تحديث الصفحة'],
        'VALIDATION_ERROR': ['راجع البيانات المدخلة', 'تحقق من التنسيق'],
        'AI_GENERATION_ERROR': ['أعد المحاولة', 'جرب محتوى أبسط', 'اتصل بالدعم الفني'],
        'FILE_UPLOAD_ERROR': ['اختر ملف أصغر', 'تحقق من نوع الملف', 'أعد المحاولة'],
        'EXPORT_ERROR': ['أعد المحاولة', 'جرب تنسيق آخر', 'تحقق من البيانات'],
        'DATABASE_ERROR': ['أعد المحاولة', 'حفظ البيانات محلياً', 'اتصل بالدعم الفني'],
        'PERMISSION_ERROR': ['اتصل بالمدير', 'تحقق من الصلاحيات'],
        'RATE_LIMIT_ERROR': ['انتظر قليلاً', 'أعد المحاولة لاحقاً'],
        'SYSTEM_ERROR': ['أعد المحاولة', 'تحديث الصفحة', 'اتصل بالدعم الفني'],
        'UNKNOWN_ERROR': ['أعد المحاولة', 'اتصل بالدعم الفني']
    };

    return actions[errorCode] || actions['UNKNOWN_ERROR'];
}

  /**
   * التحقق من إمكانية إعادة المحاولة
   */
  private static isRetryableError(errorCode: string, category: ErrorCategory): boolean {
    const nonRetryableErrors = ['AUTHENTICATION_ERROR', 'PERMISSION_ERROR', 'VALIDATION_ERROR'];
    return !nonRetryableErrors.includes(errorCode);
}

  /**
   * الحصول على تأخير إعادة المحاولة
   */
  private static getRetryDelay(category: ErrorCategory): number {
    const delays: Record<ErrorCategory, number> = {
        'network': 2,
        'authentication': 0,
        'validation': 0,
        'ai_generation': 5,
        'file_upload': 3,
        'export': 3,
        'database': 2,
        'permission': 0,
        'rate_limit': 60,
        'system': 5,
        'user_input': 0,
        'external_service': 5
    };

    return delays[category] || 2;
}

  /**
   * التحقق من وجود استراتيجية احتياطية
   */
  private static hasFallbackStrategy(category: ErrorCategory): boolean {
    const fallbackCategories: ErrorCategory[] = [
        'ai_generation',
        'export',
        'database',
        'system',
        'external_service'
    ];

    return fallbackCategories.includes(category);
}
}
