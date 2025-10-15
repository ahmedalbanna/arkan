/**
 * نظام التسجيل الشامل - Logger v2.0
 *
 * نظام تسجيل متقدم مع دعم عدة مستويات ومراقبة الأداء
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogTransport = 'console' | 'file' | 'database' | 'remote';

export interface LogContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    service?: string;
    operation?: string;
    metadata?: Record<string, any>;
}

export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    context?: LogContext;
    error?: Error;
    stack?: string;
    tags?: string[];
    duration?: number;
    memory?: number;
    correlationId?: string;
}

export interface LoggerConfig {
    level: LogLevel;
    transports: LogTransport[];
    enableConsole: boolean;
    enableFile: boolean;
    enableDatabase: boolean;
    enableRemote: boolean;
    filePath?: string;
    remoteEndpoint?: string;
    maxFileSize?: number; // بالميغابايت
    maxFiles?: number;
    bufferSize?: number; // عدد الرسائل في الذاكرة المؤقتة
    enableCorrelationId: boolean;
    enablePerformanceTracking: boolean;
    maskSensitiveData: boolean;
    sensitiveFields: string[];
}

export class AdvancedLogger {
    private config: Required<LoggerConfig>;
    private buffer: LogEntry[] = [];
    private fileStreams: Map<string, any> = new Map();
    private correlationIds = new Set<string>();

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = {
            level: config.level || 'info',
            transports: config.transports || ['console'],
            enableConsole: config.enableConsole ?? true,
            enableFile: config.enableFile ?? false,
            enableDatabase: config.enableDatabase ?? false,
            enableRemote: config.enableRemote ?? false,
            filePath: config.filePath || './logs',
            remoteEndpoint: config.remoteEndpoint || '',
            maxFileSize: config.maxFileSize || 10,
            maxFiles: config.maxFiles || 5,
            bufferSize: config.bufferSize || 100,
            enableCorrelationId: config.enableCorrelationId ?? true,
            enablePerformanceTracking: config.enablePerformanceTracking ?? true,
            maskSensitiveData: config.maskSensitiveData ?? true,
            sensitiveFields: config.sensitiveFields || ['password', 'token', 'secret', 'key']
        };

        this.setupPerformanceTracking();
        this.startBufferFlushTimer();
    }

    /**
     * تسجيل رسالة في المستوى debug
     */
    debug(message: string, context?: LogContext, tags?: string[]): void {
        this.log('debug', message, context, undefined, tags);
    }

    /**
     * تسجيل رسالة في المستوى info
     */
    info(message: string, context?: LogContext, tags?: string[]): void {
        this.log('info', message, context, undefined, tags);
    }

    /**
     * تسجيل رسالة في المستوى warn
     */
    warn(message: string, context?: LogContext, tags?: string[]): void {
        this.log('warn', message, context, undefined, tags);
    }

    /**
     * تسجيل رسالة في المستوى error
     */
    error(message: string, error?: Error, context?: LogContext, tags?: string[]): void {
        this.log('error', message, context, error, tags);
    }

    /**
     * تسجيل رسالة في المستوى fatal
     */
    fatal(message: string, error?: Error, context?: LogContext, tags?: string[]): void {
        this.log('fatal', message, context, error, tags);
    }

    /**
     * بدء قياس أداء عملية
     */
    startTimer(name: string, context?: LogContext): string {
        const correlationId = this.generateCorrelationId();
        const startTime = performance.now();
        const startMemory = this.getMemoryUsage();

        this.debug(`Started operation: ${name}`, {
            ...context,
            operation: name,
            correlationId,
            startTime,
            startMemory
        }, ['performance', 'timer']);

        return correlationId;
    }

    /**
     * إنهاء قياس أداء عملية
     */
    endTimer(correlationId: string, name: string, context?: LogContext): number {
        const endTime = performance.now();
        const endMemory = this.getMemoryUsage();

        // البحث عن وقت البداية من السجلات السابقة
        const startTime = this.findStartTime(correlationId) || 0;
        const duration = endTime - startTime;
        const memoryDelta = endMemory - (this.findStartMemory(correlationId) || 0);

        this.info(`Completed operation: ${name}`, {
            ...context,
            operation: name,
            correlationId,
            duration,
            memoryDelta,
            endTime,
            endMemory
        }, ['performance', 'timer']);

        return duration;
    }

    /**
     * تسجيل حدث مع قياس الوقت
     */
    async logWithTimer<T>(
        level: LogLevel,
        message: string,
        operation: () => Promise<T>,
        context?: LogContext,
        tags?: string[]
    ): Promise<T> {
        const correlationId = this.startTimer(message, context);
        const startTime = Date.now();

        try {
            const result = await operation();

            if (this.shouldLog(level)) {
                const duration = Date.now() - startTime;
                this.log(level, `${message} - completed`, {
                    ...context,
                    correlationId,
                    duration
                }, undefined, [...(tags || []), 'timed']);
            }

            return result;
        } catch (error) {
            if (this.shouldLog(level)) {
                const duration = Date.now() - startTime;
                this.log(level, `${message} - failed`, {
                    ...context,
                    correlationId,
                    duration
                }, error as Error, [...(tags || []), 'timed', 'error']);
            }

            throw error;
        }
    }

    /**
     * إنشاء سجل جديد
     */
    private log(level: LogLevel, message: string, context?: LogContext, error?: Error, tags?: string[]): void {
        if (!this.shouldLog(level)) {
            return;
        }

        const entry: LogEntry = {
            timestamp: new Date(),
            level,
            message: this.maskSensitiveData(message),
            context: context ? this.maskSensitiveDataInContext(context) : undefined,
            error,
            stack: error?.stack,
            tags,
            correlationId: context?.correlationId || this.generateCorrelationId(),
            duration: context?.duration,
            memory: this.getMemoryUsage()
        };

        // إضافة إلى الذاكرة المؤقتة
        this.buffer.push(entry);

        // تطبيق النقل الفوري إذا لزم الأمر
        if (level === 'fatal' || level === 'error') {
            this.flushBuffer();
        }

        // تطبيق النقل حسب الإعدادات
        this.applyTransports(entry);
    }

    /**
     * تطبيق طرق النقل المختلفة
     */
    private applyTransports(entry: LogEntry): void {
        if (this.config.enableConsole) {
            this.logToConsole(entry);
        }

        if (this.config.enableFile) {
            this.logToFile(entry);
        }

        if (this.config.enableDatabase) {
            this.logToDatabase(entry);
        }

        if (this.config.enableRemote) {
            this.logToRemote(entry);
        }
    }

    /**
     * تسجيل في وحدة التحكم
     */
    private logToConsole(entry: LogEntry): void {
        const timestamp = entry.timestamp.toISOString();
        const level = entry.level.toUpperCase();
        const contextStr = entry.context ? ` [${JSON.stringify(entry.context)}]` : '';
        const errorStr = entry.error ? ` Error: ${entry.error.message}` : '';

        const logMessage = `${timestamp} [${level}] ${entry.message}${contextStr}${errorStr}`;

        switch (entry.level) {
            case 'debug':
                console.debug(logMessage, entry.tags);
                break;
            case 'info':
                console.info(logMessage, entry.tags);
                break;
            case 'warn':
                console.warn(logMessage, entry.tags);
                break;
            case 'error':
            case 'fatal':
                console.error(logMessage, entry.error, entry.tags);
                break;
        }
    }

    /**
     * تسجيل في الملف
     */
    private logToFile(entry: LogEntry): void {
        // في التطبيق الحقيقي، سنستخدم نظام الملفات
        // هنا سنستخدم localStorage كبديل للمثال
        if (typeof window !== 'undefined') {
            const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
            logs.push(entry);

            // الاحتفاظ بآخر 1000 سجل فقط
            if (logs.length > 1000) {
                logs.splice(0, logs.length - 1000);
            }

            localStorage.setItem('app_logs', JSON.stringify(logs));
        }
    }

    /**
     * تسجيل في قاعدة البيانات
     */
    private async logToDatabase(entry: LogEntry): Promise<void> {
        try {
            // في التطبيق الحقيقي، سنستخدم قاعدة البيانات
            // هنا سنستخدم localStorage كبديل
            const dbLogs = JSON.parse(localStorage.getItem('db_logs') || '[]');
            dbLogs.push(entry);

            if (dbLogs.length > 100) {
                dbLogs.splice(0, dbLogs.length - 100);
            }

            localStorage.setItem('db_logs', JSON.stringify(dbLogs));
        } catch (error) {
            console.error('Failed to log to database:', error);
        }
    }

    /**
     * تسجيل في خدمة خارجية
     */
    private async logToRemote(entry: LogEntry): Promise<void> {
        if (!this.config.remoteEndpoint) return;

        try {
            await fetch(this.config.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entry)
            });
        } catch (error) {
            console.error('Failed to log to remote service:', error);
        }
    }

    /**
     * إفراغ الذاكرة المؤقتة
     */
    private flushBuffer(): void {
        if (this.buffer.length === 0) return;

        const entries = [...this.buffer];
        this.buffer = [];

        entries.forEach(entry => this.applyTransports(entry));
    }

    /**
     * بدء مؤقت إفراغ الذاكرة المؤقتة
     */
    private startBufferFlushTimer(): void {
        setInterval(() => {
            this.flushBuffer();
        }, 5000); // إفراغ كل 5 ثواني
    }

    /**
     * فحص ما إذا كان يجب تسجيل الرسالة حسب المستوى
     */
    private shouldLog(level: LogLevel): boolean {
        const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
        const configLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);

        return messageLevelIndex >= configLevelIndex;
    }

    /**
     * إخفاء البيانات الحساسة
     */
    private maskSensitiveData(text: string): string {
        if (!this.config.maskSensitiveData) return text;

        let maskedText = text;

        this.config.sensitiveFields.forEach(field => {
            const regex = new RegExp(`"${field}":\\s*"[^"]*"`, 'gi');
            maskedText = maskedText.replace(regex, `"${field}": "***"`);
        });

        return maskedText;
    }

    /**
     * إخفاء البيانات الحساسة في السياق
     */
    private maskSensitiveDataInContext(context: LogContext): LogContext {
        if (!this.config.maskSensitiveData || !context.metadata) {
            return context;
        }

        const maskedMetadata = { ...context.metadata };

        this.config.sensitiveFields.forEach(field => {
            if (maskedMetadata[field]) {
                maskedMetadata[field] = '***';
            }
        });

        return {
            ...context,
            metadata: maskedMetadata
        };
    }

    /**
     * إنشاء معرف ارتباط فريد
     */
    private generateCorrelationId(): string {
        if (!this.config.enableCorrelationId) {
            return '';
        }

        let correlationId: string;
        do {
            correlationId = `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        } while (this.correlationIds.has(correlationId));

        this.correlationIds.add(correlationId);

        // تنظيف المعرفات القديمة
        if (this.correlationIds.size > 1000) {
            this.correlationIds.clear();
        }

        return correlationId;
    }

    /**
     * البحث عن وقت بداية العملية
     */
    private findStartTime(correlationId: string): number | null {
        // في التطبيق الحقيقي، سنبحث في السجلات المحفوظة
        // هنا سنستخدم بحث بسيط في الذاكرة المؤقتة
        const entry = this.buffer.find(e => e.correlationId === correlationId);
        return entry?.context?.startTime || null;
    }

    /**
     * البحث عن استخدام الذاكرة في بداية العملية
     */
    private findStartMemory(correlationId: string): number | null {
        const entry = this.buffer.find(e => e.correlationId === correlationId);
        return entry?.context?.startMemory || null;
    }

    /**
     * الحصول على استخدام الذاكرة الحالي
     */
    private getMemoryUsage(): number {
        if (typeof window !== 'undefined' && 'memory' in performance) {
            return (performance as any).memory.usedJSHeapSize || 0;
        }
        return 0;
    }

    /**
     * إعداد تتبع الأداء
     */
    private setupPerformanceTracking(): void {
        if (!this.config.enablePerformanceTracking) return;

        // مراقبة استخدام الذاكرة كل 30 ثانية
        setInterval(() => {
            const memoryUsage = this.getMemoryUsage();
            if (memoryUsage > 50 * 1024 * 1024) { // أكثر من 50MB
                this.warn('High memory usage detected', {
                    memoryUsage,
                    threshold: 50 * 1024 * 1024
                }, ['performance', 'memory']);
            }
        }, 30000);
    }

    /**
     * الحصول على إحصائيات التسجيل
     */
    getStats(): {
        bufferSize: number;
        totalLogged: number;
        errorsLogged: number;
        performanceWarnings: number;
        lastFlush: Date;
    } {
        return {
            bufferSize: this.buffer.length,
            totalLogged: this.buffer.length,
            errorsLogged: this.buffer.filter(e => e.level === 'error' || e.level === 'fatal').length,
            performanceWarnings: this.buffer.filter(e => e.tags?.includes('performance')).length,
            lastFlush: new Date()
        };
    }

    /**
     * تصدير السجلات
     */
    async exportLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
        const allLogs = [
            ...this.buffer,
            ...(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('app_logs') || '[]') : [])
        ];

        if (format === 'csv') {
            const headers = ['timestamp', 'level', 'message', 'context', 'error', 'tags'];
            const rows = allLogs.map(log => [
                log.timestamp.toISOString(),
                log.level,
                log.message,
                JSON.stringify(log.context || {}),
                log.error?.message || '',
                JSON.stringify(log.tags || [])
            ]);

            return [headers, ...rows].map(row => row.join(',')).join('\n');
        }

        return JSON.stringify(allLogs, null, 2);
    }

    /**
     * تنظيف السجلات القديمة
     */
    async cleanup(maxAge: number = 24 * 60 * 60 * 1000): Promise<number> { // يوم واحد افتراضياً
        const cutoffDate = new Date(Date.now() - maxAge);
        let cleanedCount = 0;

        // تنظيف الذاكرة المؤقتة
        this.buffer = this.buffer.filter(entry => {
            if (entry.timestamp < cutoffDate) {
                cleanedCount++;
                return false;
            }
            return true;
        });

        // تنظيف localStorage
        if (typeof window !== 'undefined') {
            const appLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
            const filteredLogs = appLogs.filter((log: LogEntry) => new Date(log.timestamp) >= cutoffDate);
            localStorage.setItem('app_logs', JSON.stringify(filteredLogs));
            cleanedCount += appLogs.length - filteredLogs.length;
        }

        return cleanedCount;
    }

    /**
     * إغلاق نظام التسجيل
     */
    close(): void {
        this.flushBuffer();

        // إغلاق تدفقات الملفات
        this.fileStreams.forEach(stream => {
            if (stream && typeof stream.close === 'function') {
                stream.close();
            }
        });
        this.fileStreams.clear();
    }
}

/**
 * مثيل عام لنظام التسجيل
 */
export const logger = new AdvancedLogger({
    level: 'info',
    enableConsole: true,
    enablePerformanceTracking: true,
    enableCorrelationId: true,
    maskSensitiveData: true,
    sensitiveFields: ['password', 'token', 'secret', 'key', 'email']
});

/**
 * دالة مساعدة للحصول على نظام التسجيل
 */
export function getLogger(): AdvancedLogger {
    return logger;
}

/**
 * دوال مساعدة للتسجيل السريع
 */
export const log = {
    debug: (message: string, context?: LogContext, tags?: string[]) => logger.debug(message, context, tags),
    info: (message: string, context?: LogContext, tags?: string[]) => logger.info(message, context, tags),
    warn: (message: string, context?: LogContext, tags?: string[]) => logger.warn(message, context, tags),
    error: (message: string, error?: Error, context?: LogContext, tags?: string[]) => logger.error(message, error, context, tags),
    fatal: (message: string, error?: Error, context?: LogContext, tags?: string[]) => logger.fatal(message, error, context, tags),
};