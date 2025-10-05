/**
 * Error Handler - Enhanced v2.0
 *
 * نظام معالجة الأخطاء المركزي المحسن مع مراقبة متقدمة
 */

export interface ErrorContext {
    service?: string;
    operation?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    timestamp: Date;
    userAgent?: string;
    url?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
    tags?: Record<string, string>;
    metadata?: Record<string, unknown>;
}

export interface ErrorReport {
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    stack?: string;
    context: ErrorContext;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'network' | 'validation' | 'authentication' | 'authorization' | 'business' | 'system' | 'unknown';
    resolved: boolean;
    resolution?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ErrorMetrics {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    errorsByService: Record<string, number>;
    averageResolutionTime: number;
    resolutionRate: number;
    recentErrors: ErrorReport[];
}

/**
 * نظام معالجة الأخطاء المركزي المحسن
 */
export class ErrorHandlerV2 {
    private static instance: ErrorHandlerV2;
    private errors: Map<string, ErrorReport> = new Map();
    private errorQueue: ErrorReport[] = [];
    private maxErrors = 10000;
    private maxQueueSize = 1000;

    private constructor() {
        // تهيئة مراقبة الأخطاء غير المعالجة
        this.setupGlobalErrorHandlers();
    }

    static getInstance(): ErrorHandlerV2 {
        if (!ErrorHandlerV2.instance) {
            ErrorHandlerV2.instance = new ErrorHandlerV2();
        }
        return ErrorHandlerV2.instance;
    }

    /**
     * معالجة خطأ مع سياق كامل
     */
    handle(
        error: unknown,
        context: Partial<ErrorContext> = {},
        options: {
            severity?: 'low' | 'medium' | 'high' | 'critical';
            category?: ErrorReport['category'];
            tags?: Record<string, string>;
            metadata?: Record<string, unknown>;
            rethrow?: boolean;
            silent?: boolean;
        } = {}
    ): string {
        const errorId = this.generateErrorId();
        const errorReport = this.createErrorReport(error, context, options);

        // حفظ الخطأ
        this.storeError(errorReport);

        // إضافة إلى قائمة الانتظار للمعالجة
        this.addToQueue(errorReport);

        // تسجيل الخطأ حسب الإعدادات
        if (!options.silent) {
            this.logError(errorReport);
        }

        // إعادة رمي الخطأ إذا طُلب ذلك
        if (options.rethrow) {
            throw this.createErrorForRethrow(error, errorReport);
        }

        return errorId;
    }

    /**
     * معالجة خطأ مع إعادة المحاولة التلقائية
     */
    async handleWithRetry<T>(
        operation: () => Promise<T>,
        context: Partial<ErrorContext> = {},
        options: {
            maxRetries?: number;
            retryDelay?: number;
            backoffMultiplier?: number;
            retryCondition?: (error: unknown) => boolean;
            severity?: 'low' | 'medium' | 'high' | 'critical';
            category?: ErrorReport['category'];
        } = {}
    ): Promise<T> {
        const maxRetries = options.maxRetries || 3;
        const retryDelay = options.retryDelay || 1000;
        const backoffMultiplier = options.backoffMultiplier || 2;

        let lastError: unknown;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                // التحقق من شرط إعادة المحاولة
                if (attempt < maxRetries && (!options.retryCondition || options.retryCondition(error))) {
                    const delay = retryDelay * Math.pow(backoffMultiplier, attempt);

                    // تسجيل محاولة إعادة المحاولة
                    this.handle(error, {
                        ...context,
                        operation: `${context.operation}_retry_${attempt + 1}`,
                    }, {
                        severity: 'low',
                        category: 'system',
                        metadata: { attempt: attempt + 1, maxRetries, delay },
                        silent: true,
                    });

                    await this.delay(delay);
                    continue;
                }

                // معالجة الخطأ النهائي
                this.handle(error, context, options);
                throw error;
            }
        }

        throw lastError;
    }

    /**
     * حل خطأ محدد
     */
    resolve(errorId: string, resolution: string): boolean {
        const errorReport = this.errors.get(errorId);
        if (!errorReport) {
            return false;
        }

        errorReport.resolved = true;
        errorReport.resolution = resolution;
        errorReport.updatedAt = new Date();

        return true;
    }

    /**
     * الحصول على مقاييس الأخطاء
     */
    getMetrics(): ErrorMetrics {
        const errors = Array.from(this.errors.values());
        const recentErrors = errors
            .filter(e => e.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) // آخر 24 ساعة
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 100);

        const errorsByCategory = this.groupBy(errors, 'category');
        const errorsBySeverity = this.groupBy(errors, 'severity');
        const errorsByService = this.groupBy(errors, (e) => e.context.service || 'unknown');

        const resolvedErrors = errors.filter(e => e.resolved);
        const resolutionRate = errors.length > 0 ? (resolvedErrors.length / errors.length) * 100 : 0;

        const averageResolutionTime = resolvedErrors.length > 0
            ? resolvedErrors.reduce((sum, e) => {
                return sum + (e.updatedAt.getTime() - e.createdAt.getTime());
            }, 0) / resolvedErrors.length
            : 0;

        return {
            totalErrors: errors.length,
            errorsByCategory,
            errorsBySeverity,
            errorsByService,
            averageResolutionTime,
            resolutionRate,
            recentErrors,
        };
    }

    /**
     * مسح الأخطاء القديمة
     */
    cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): number {
        const cutoffDate = new Date(Date.now() - maxAge);
        let removedCount = 0;

        for (const [id, errorReport] of this.errors.entries()) {
            if (errorReport.createdAt < cutoffDate) {
                this.errors.delete(id);
                removedCount++;
            }
        }

        return removedCount;
    }

    /**
     * إنشاء تقرير خطأ مفصل
     */
    private createErrorReport(
        error: unknown,
        context: Partial<ErrorContext>,
        options: any
    ): ErrorReport {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        // تصنيف الخطأ حسب نوعه
        const category = options.category || this.categorizeError(error, errorMessage);
        const severity = options.severity || this.determineSeverity(error, category);

        return {
            id: this.generateErrorId(),
            type: severity === 'critical' ? 'error' : 'warning',
            message: errorMessage,
            stack: errorStack,
            context: {
                timestamp: new Date(),
                ...context,
            },
            severity,
            category,
            resolved: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    /**
     * حفظ الخطأ في التخزين
     */
    private storeError(errorReport: ErrorReport): void {
        // تنظيف التخزين إذا أصبح كبيراً
        if (this.errors.size >= this.maxErrors) {
            this.evictErrors();
        }

        this.errors.set(errorReport.id, errorReport);
    }

    /**
     * إضافة الخطأ إلى قائمة الانتظار
     */
    private addToQueue(errorReport: ErrorReport): void {
        this.errorQueue.push(errorReport);

        // معالجة قائمة الانتظار في الخلفية
        if (this.errorQueue.length >= this.maxQueueSize) {
            this.processErrorQueue();
        }
    }

    /**
     * معالجة قائمة انتظار الأخطاء
     */
    private async processErrorQueue(): Promise<void> {
        const errorsToProcess = this.errorQueue.splice(0, 100);

        // يمكن إضافة منطق معالجة الأخطاء هنا مثل:
        // - إرسال إشعارات
        // - تحليل الأنماط
        // - إنشاء تقارير تلقائية

        console.log(`Processed ${errorsToProcess.length} errors from queue`);
    }

    /**
     * تصنيف الخطأ حسب نوعه
     */
    private categorizeError(error: unknown, message: string): ErrorReport['category'] {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
            return 'network';
        }

        if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('schema')) {
            return 'validation';
        }

        if (lowerMessage.includes('unauthorized') || lowerMessage.includes('authentication') || lowerMessage.includes('login')) {
            return 'authentication';
        }

        if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission') || lowerMessage.includes('access denied')) {
            return 'authorization';
        }

        if (lowerMessage.includes('business') || lowerMessage.includes('logic') || lowerMessage.includes('rule')) {
            return 'business';
        }

        return 'unknown';
    }

    /**
     * تحديد مستوى خطورة الخطأ
     */
    private determineSeverity(error: unknown, category: ErrorReport['category']): ErrorReport['severity'] {
        // الأخطاء الحرجة
        if (category === 'authentication' || category === 'authorization') {
            return 'high';
        }

        if (error instanceof Error) {
            // الأخطاء الناتجة عن استثناءات في النظام
            if (error.name === 'TypeError' || error.name === 'ReferenceError') {
                return 'high';
            }

            // أخطاء الشبكة المتكررة
            if (category === 'network' && error.message.includes('500')) {
                return 'high';
            }
        }

        return 'medium';
    }

    /**
     * تسجيل الخطأ
     */
    private logError(errorReport: ErrorReport): void {
        const logData = {
            id: errorReport.id,
            message: errorReport.message,
            severity: errorReport.severity,
            category: errorReport.category,
            service: errorReport.context.service,
            operation: errorReport.context.operation,
            timestamp: errorReport.context.timestamp,
            stack: errorReport.stack,
        };

        switch (errorReport.severity) {
            case 'critical':
                console.error('🚨 Critical Error:', logData);
                break;
            case 'high':
                console.error('❌ High Severity Error:', logData);
                break;
            case 'medium':
                console.warn('⚠️ Medium Severity Error:', logData);
                break;
            case 'low':
                console.info('ℹ️ Low Severity Error:', logData);
                break;
        }
    }

    /**
     * إنشاء خطأ لإعادة الرمي
     */
    private createErrorForRethrow(originalError: unknown, errorReport: ErrorReport): Error {
        const error = originalError instanceof Error ? originalError : new Error(String(originalError));

        // إضافة معرف الخطأ إلى الخطأ الأصلي
        (error as any).errorId = errorReport.id;
        (error as any).context = errorReport.context;

        return error;
    }

    /**
     * توليد معرف فريد للخطأ
     */
    private generateErrorId(): string {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * تنظيف الأخطاء القديمة
     */
    private evictErrors(): void {
        const errors = Array.from(this.errors.entries());
        const sortedErrors = errors.sort((a, b) => b[1].createdAt.getTime() - a[1].createdAt.getTime());

        // الاحتفاظ بالأخطاء الأحدث فقط
        const keepCount = Math.floor(this.maxErrors * 0.8);
        const toRemove = sortedErrors.slice(keepCount);

        toRemove.forEach(([id]) => this.errors.delete(id));
    }

    /**
     * تجميع البيانات حسب مفتاح
     */
    private groupBy<T>(items: T[], keyFn: keyof T | ((item: T) => string)): Record<string, number> {
        const groups: Record<string, number> = {};

        items.forEach(item => {
            const key = typeof keyFn === 'function' ? keyFn(item) : String(item[keyFn]);
            groups[key] = (groups[key] || 0) + 1;
        });

        return groups;
    }

    /**
     * تأخير لإعادة المحاولة
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * إعداد معالجات الأخطاء العامة
     */
    private setupGlobalErrorHandlers(): void {
        // معالجة الأخطاء غير المعالجة في المتصفح
        if (typeof window !== 'undefined') {
            window.addEventListener('error', (event) => {
                this.handle(event.error, {
                    operation: 'window_error',
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                }, {
                    severity: 'high',
                    category: 'system',
                    silent: true,
                });
            });

            window.addEventListener('unhandledrejection', (event) => {
                this.handle(event.reason, {
                    operation: 'unhandled_promise_rejection',
                    url: window.location.href,
                }, {
                    severity: 'medium',
                    category: 'system',
                    silent: true,
                });
            });
        }
    }
}

// معالج الأخطاء الافتراضي
export const errorHandler = ErrorHandlerV2.getInstance();

// دوال مساعدة للاستخدام السريع
export const handleError = (error: unknown, context?: Partial<ErrorContext>) => {
    return errorHandler.handle(error, context);
};

export const handleErrorWithRetry = <T>(
    operation: () => Promise<T>,
    context?: Partial<ErrorContext>,
    options?: Parameters<typeof errorHandler.handleWithRetry>[2]
) => {
    return errorHandler.handleWithRetry(operation, context, options);
};
