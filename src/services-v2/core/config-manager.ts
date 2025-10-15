/**
 * إدارة التكوين المركزية - Config Manager v2.0
 *
 * نظام إدارة تكوين متقدم مع دعم عدة مصادر والتحقق من الصحة
 */

export interface ConfigSource {
    type: 'environment' | 'file' | 'database' | 'remote' | 'memory';
    priority: number; // أولوية أعلى = أولوية أكبر
    path?: string;
    endpoint?: string;
    refreshInterval?: number; // بالثواني
}

export interface ConfigSchema {
    [key: string]: {
        type: 'string' | 'number' | 'boolean' | 'object' | 'array';
        required?: boolean;
        default?: any;
        validator?: (value: any) => boolean;
        description?: string;
        sensitive?: boolean; // للإخفاء في السجلات
    };
}

export interface ConfigValue {
    value: any;
    source: string;
    lastUpdated: Date;
    version?: string;
}

export interface ConfigValidationResult {
    isValid: boolean;
    errors: Array<{
        key: string;
        message: string;
        value?: any;
    }>;
    warnings: Array<{
        key: string;
        message: string;
        suggestion?: string;
    }>;
}

export interface ConfigManagerConfig {
    schema: ConfigSchema;
    sources: ConfigSource[];
    enableValidation: boolean;
    enableHotReload: boolean;
    enableEncryption: boolean;
    cacheTimeout: number; // بالثواني
    maxRetries: number;
}

export class AdvancedConfigManager {
    private config: Map<string, ConfigValue> = new Map();
    private schema: ConfigSchema;
    private sources: ConfigSource[];
    private config: Required<ConfigManagerConfig>;
    private watchers: Map<string, Set<(value: any, oldValue: any) => void>> = new Map();
    private refreshTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor(config: Partial<ConfigManagerConfig>) {
        this.schema = config.schema || {};
        this.sources = config.sources || [
            { type: 'environment', priority: 1 },
            { type: 'memory', priority: 0 }
        ];

        this.config = {
            schema: config.schema || {},
            sources: config.sources || [],
            enableValidation: config.enableValidation ?? true,
            enableHotReload: config.enableHotReload ?? true,
            enableEncryption: config.enableEncryption ?? false,
            cacheTimeout: config.cacheTimeout || 300, // 5 دقائق
            maxRetries: config.maxRetries || 3
        };

        this.initialize();
    }

    /**
     * تهيئة مدير التكوين
     */
    private async initialize(): Promise<void> {
        // ترتيب المصادر حسب الأولوية
        this.sources.sort((a, b) => b.priority - a.priority);

        // تحميل التكوين من جميع المصادر
        for (const source of this.sources) {
            await this.loadFromSource(source);
        }

        // إعداد المراقبة للتحديث التلقائي
        if (this.config.enableHotReload) {
            this.setupHotReload();
        }

        // التحقق من صحة التكوين
        if (this.config.enableValidation) {
            this.validateConfig();
        }
    }

    /**
     * الحصول على قيمة تكوين
     */
    get<T = any>(key: string): T | null {
        const configValue = this.config.get(key);
        return configValue ? configValue.value : null;
    }

    /**
     * الحصول على قيمة تكوين مع قيمة افتراضية
     */
    getWithDefault<T = any>(key: string, defaultValue: T): T {
        const value = this.get<T>(key);
        return value !== null ? value : defaultValue;
    }

    /**
     * تعيين قيمة تكوين
     */
    async set(key: string, value: any, source: string = 'memory'): Promise<void> {
        const oldValue = this.get(key);

        const configValue: ConfigValue = {
            value,
            source,
            lastUpdated: new Date()
        };

        this.config.set(key, configValue);

        // إشعار المراقبين
        this.notifyWatchers(key, value, oldValue);

        // حفظ في المصدر إذا لزم الأمر
        await this.saveToSource(key, value, source);
    }

    /**
     * تعيين عدة قيم تكوين
     */
    async setMany(values: Record<string, any>, source: string = 'memory'): Promise<void> {
        for (const [key, value] of Object.entries(values)) {
            await this.set(key, value, source);
        }
    }

    /**
     * مراقبة تغييرات قيمة تكوين
     */
    watch(key: string, callback: (value: any, oldValue: any) => void): () => void {
        if (!this.watchers.has(key)) {
            this.watchers.set(key, new Set());
        }

        this.watchers.get(key)!.add(callback);

        // إرجاع دالة لإلغاء المراقبة
        return () => {
            const watchers = this.watchers.get(key);
            if (watchers) {
                watchers.delete(callback);
            }
        };
    }

    /**
     * الحصول على جميع قيم التكوين
     */
    getAll(): Record<string, any> {
        const result: Record<string, any> = {};

        for (const [key, configValue] of this.config) {
            result[key] = configValue.value;
        }

        return result;
    }

    /**
     * التحقق من صحة التكوين
     */
    validateConfig(): ConfigValidationResult {
        const errors: ConfigValidationResult['errors'] = [];
        const warnings: ConfigValidationResult['warnings'] = [];

        for (const [key, schema] of Object.entries(this.schema)) {
            const value = this.get(key);

            // فحص الحقول المطلوبة
            if (schema.required && (value === null || value === undefined)) {
                errors.push({
                    key,
                    message: `Required field '${key}' is missing`
                });
                continue;
            }

            // فحص نوع البيانات
            if (value !== null && value !== undefined) {
                const isValidType = this.validateType(value, schema.type);
                if (!isValidType) {
                    errors.push({
                        key,
                        message: `Field '${key}' has invalid type. Expected ${schema.type}, got ${typeof value}`,
                        value
                    });
                }

                // فحص المخصص
                if (schema.validator && !schema.validator(value)) {
                    errors.push({
                        key,
                        message: `Field '${key}' failed custom validation`,
                        value
                    });
                }
            }

            // فحص القيم الافتراضية
            if (value === null && schema.default !== undefined) {
                warnings.push({
                    key,
                    message: `Field '${key}' is using default value`,
                    suggestion: 'Consider setting an explicit value'
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * إعادة تحميل التكوين من المصادر
     */
    async reload(): Promise<void> {
        this.config.clear();

        for (const source of this.sources) {
            await this.loadFromSource(source);
        }

        if (this.config.enableValidation) {
            this.validateConfig();
        }
    }

    /**
     * تصدير التكوين إلى ملف
     */
    exportToFile(filePath?: string): string {
        const config = this.getAll();
        return JSON.stringify({
            config,
            schema: this.schema,
            exportedAt: new Date(),
            version: '2.0'
        }, null, 2);
    }

    /**
     * استيراد التكوين من ملف
     */
    async importFromFile(filePath?: string): Promise<void> {
        // في التطبيق الحقيقي، سنقرأ من نظام الملفات
        // هنا سنستخدم مثال بسيط
        const configData = this.getAll();
        await this.setMany(configData, 'file');
    }

    /**
     * الحصول على مصدر قيمة تكوين
     */
    getSource(key: string): string | null {
        const configValue = this.config.get(key);
        return configValue ? configValue.source : null;
    }

    /**
     * الحصول على تاريخ آخر تحديث لقيمة تكوين
     */
    getLastUpdated(key: string): Date | null {
        const configValue = this.config.get(key);
        return configValue ? configValue.lastUpdated : null;
    }

    /**
     * فحص ما إذا كانت قيمة تكوين موجودة
     */
    has(key: string): boolean {
        return this.config.has(key);
    }

    /**
     * حذف قيمة تكوين
     */
    async delete(key: string): Promise<boolean> {
        const deleted = this.config.delete(key);

        if (deleted) {
            this.notifyWatchers(key, null, this.get(key));
        }

        return deleted;
    }

    // الطرق المساعدة الخاصة

    private async loadFromSource(source: ConfigSource): Promise<void> {
        try {
            let values: Record<string, any> = {};

            switch (source.type) {
                case 'environment':
                    values = this.loadFromEnvironment();
                    break;
                case 'file':
                    if (source.path) {
                        values = await this.loadFromFile(source.path);
                    }
                    break;
                case 'database':
                    values = await this.loadFromDatabase();
                    break;
                case 'remote':
                    if (source.endpoint) {
                        values = await this.loadFromRemote(source.endpoint);
                    }
                    break;
                case 'memory':
                    values = this.loadFromMemory();
                    break;
            }

            // تطبيق القيم من هذا المصدر
            for (const [key, value] of Object.entries(values)) {
                if (!this.config.has(key)) {
                    this.config.set(key, {
                        value,
                        source: source.type,
                        lastUpdated: new Date()
                    });
                }
            }

            // إعداد المراقبة للتحديث التلقائي
            if (source.refreshInterval && source.refreshInterval > 0) {
                this.setupSourceRefresh(source);
            }

        } catch (error) {
            console.error(`Failed to load config from ${source.type}:`, error);
        }
    }

    private loadFromEnvironment(): Record<string, any> {
        const values: Record<string, any> = {};

        for (const [key, schema] of Object.entries(this.schema)) {
            const envKey = key.toUpperCase();
            const envValue = process.env[envKey];

            if (envValue !== undefined) {
                values[key] = this.parseValue(envValue, schema.type);
            }
        }

        return values;
    }

    private async loadFromFile(filePath: string): Promise<Record<string, any>> {
        // في التطبيق الحقيقي، سنقرأ من نظام الملفات
        // هنا سنستخدم مثال بسيط مع localStorage
        if (typeof window !== 'undefined') {
            const fileData = localStorage.getItem(`config_${filePath}`);
            if (fileData) {
                return JSON.parse(fileData);
            }
        }

        return {};
    }

    private async loadFromDatabase(): Promise<Record<string, any>> {
        // في التطبيق الحقيقي، سنقرأ من قاعدة البيانات
        return {};
    }

    private async loadFromRemote(endpoint: string): Promise<Record<string, any>> {
        try {
            const response = await fetch(endpoint);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to load config from remote endpoint:', error);
        }

        return {};
    }

    private loadFromMemory(): Record<string, any> {
        // إرجاع القيم المحفوظة في الذاكرة
        const values: Record<string, any> = {};

        for (const [key, configValue] of this.config) {
            if (configValue.source === 'memory') {
                values[key] = configValue.value;
            }
        }

        return values;
    }

    private async saveToSource(key: string, value: any, source: string): Promise<void> {
        const sourceConfig = this.sources.find(s => s.type === source);
        if (!sourceConfig) return;

        switch (source) {
            case 'file':
                if (sourceConfig.path && typeof window !== 'undefined') {
                    const fileData = JSON.parse(localStorage.getItem(`config_${sourceConfig.path}`) || '{}');
                    fileData[key] = value;
                    localStorage.setItem(`config_${sourceConfig.path}`, JSON.stringify(fileData));
                }
                break;
            case 'database':
                await this.saveToDatabase(key, value);
                break;
            case 'remote':
                if (sourceConfig.endpoint) {
                    await this.saveToRemote(key, value, sourceConfig.endpoint);
                }
                break;
        }
    }

    private async saveToDatabase(key: string, value: any): Promise<void> {
        // في التطبيق الحقيقي، سنحفظ في قاعدة البيانات
    }

    private async saveToRemote(key: string, value: any, endpoint: string): Promise<void> {
        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key, value })
            });
        } catch (error) {
            console.error('Failed to save config to remote endpoint:', error);
        }
    }

    private setupHotReload(): void {
        this.sources.forEach(source => {
            if (source.refreshInterval && source.refreshInterval > 0) {
                this.setupSourceRefresh(source);
            }
        });
    }

    private setupSourceRefresh(source: ConfigSource): void {
        if (this.refreshTimers.has(source.type)) {
            clearInterval(this.refreshTimers.get(source.type)!);
        }

        const timer = setInterval(async () => {
            await this.loadFromSource(source);
        }, source.refreshInterval! * 1000);

        this.refreshTimers.set(source.type, timer);
    }

    private notifyWatchers(key: string, value: any, oldValue: any): void {
        const watchers = this.watchers.get(key);
        if (watchers) {
            watchers.forEach(callback => {
                try {
                    callback(value, oldValue);
                } catch (error) {
                    console.error('Error in config watcher:', error);
                }
            });
        }
    }

    private validateType(value: any, expectedType: string): boolean {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            case 'array':
                return Array.isArray(value);
            default:
                return true;
        }
    }

    private parseValue(value: string, type: string): any {
        switch (type) {
            case 'string':
                return value;
            case 'number':
                const num = parseFloat(value);
                return isNaN(num) ? null : num;
            case 'boolean':
                return value.toLowerCase() === 'true' || value === '1';
            case 'object':
            case 'array':
                try {
                    return JSON.parse(value);
                } catch {
                    return null;
                }
            default:
                return value;
        }
    }

    /**
     * إغلاق مدير التكوين
     */
    close(): void {
        // إيقاف جميع المؤقتات
        for (const timer of this.refreshTimers.values()) {
            clearInterval(timer);
        }
        this.refreshTimers.clear();
    }

    /**
     * الحصول على إحصائيات مدير التكوين
     */
    getStats(): {
        totalKeys: number;
        sourcesCount: number;
        watchersCount: number;
        lastValidation: Date;
        validationErrors: number;
    } {
        const validationResult = this.validateConfig();

        return {
            totalKeys: this.config.size,
            sourcesCount: this.sources.length,
            watchersCount: Array.from(this.watchers.values()).reduce((sum, set) => sum + set.size, 0),
            lastValidation: new Date(),
            validationErrors: validationResult.errors.length
        };
    }
}

/**
 * مثيل عام لمدير التكوين
 */
export const configManager = new AdvancedConfigManager({
    schema: {
        'app.name': { type: 'string', required: true, description: 'اسم التطبيق' },
        'app.version': { type: 'string', required: true, description: 'إصدار التطبيق' },
        'app.environment': { type: 'string', default: 'development', description: 'بيئة التطبيق' },
        'database.url': { type: 'string', required: true, sensitive: true, description: 'رابط قاعدة البيانات' },
        'database.pool.min': { type: 'number', default: 2, description: 'الحد الأدنى لحجم pool قاعدة البيانات' },
        'database.pool.max': { type: 'number', default: 10, description: 'الحد الأقصى لحجم pool قاعدة البيانات' },
        'api.timeout': { type: 'number', default: 30000, description: 'مهلة API بالميلي ثانية' },
        'api.retries': { type: 'number', default: 3, description: 'عدد المحاولات للـ API' },
        'cache.enabled': { type: 'boolean', default: true, description: 'تفعيل التخزين المؤقت' },
        'cache.ttl': { type: 'number', default: 3600, description: 'وقت الحياة للتخزين المؤقت بالثواني' },
        'logging.level': { type: 'string', default: 'info', description: 'مستوى التسجيل' },
        'logging.file.enabled': { type: 'boolean', default: false, description: 'تفعيل تسجيل الملفات' },
        'security.jwt.secret': { type: 'string', required: true, sensitive: true, description: 'سر JWT' },
        'security.jwt.expiry': { type: 'number', default: 3600, description: 'انتهاء صلاحية JWT بالثواني' },
        'ai.model.default': { type: 'string', default: 'gemini-pro', description: 'نموذج الذكاء الاصطناعي الافتراضي' },
        'ai.temperature': { type: 'number', default: 0.7, description: 'درجة حرارة نموذج الذكاء الاصطناعي' },
        'performance.monitoring.enabled': { type: 'boolean', default: true, description: 'تفعيل مراقبة الأداء' },
        'performance.alerts.enabled': { type: 'boolean', default: true, description: 'تفعيل التنبيهات' }
    },
    sources: [
        { type: 'environment', priority: 10 },
        { type: 'file', path: 'config.json', priority: 5, refreshInterval: 60 },
        { type: 'memory', priority: 1 }
    ],
    enableValidation: true,
    enableHotReload: true,
    enableEncryption: false,
    cacheTimeout: 300,
    maxRetries: 3
});

/**
 * دالة مساعدة للحصول على مدير التكوين
 */
export function getConfigManager(): AdvancedConfigManager {
    return configManager;
}

/**
 * دوال مساعدة للوصول السريع للتكوين
 */
export const config = {
    get: <T = any>(key: string): T | null => configManager.get<T>(key),
    getWithDefault: <T = any>(key: string, defaultValue: T): T => configManager.getWithDefault<T>(key, defaultValue),
    set: (key: string, value: any) => configManager.set(key, value),
    watch: (key: string, callback: (value: any, oldValue: any) => void) => configManager.watch(key, callback),
    validate: () => configManager.validateConfig(),
};