/**
 * إدارة التخزين المؤقت الذكية - Cache Manager v2.0
 *
 * نظام تخزين مؤقت متقدم مع دعم عدة مستويات ومراقبة الأداء
 */

export interface CacheEntry<T = any> {
    key: string;
    data: T;
    metadata: {
        size: number;
        compressed: boolean;
        createdAt: Date;
        lastAccessed: Date;
        accessCount: number;
        ttl?: number;
        tags: string[];
        priority: 'low' | 'medium' | 'high' | 'critical';
    };
}

export interface CacheStats {
    totalEntries: number;
    totalSize: number;
    memoryUsage: number;
    hitRate: number;
    missRate: number;
    averageAccessTime: number;
    compressionRatio: number;
    cleanupStats: {
        lastCleanup: Date;
        entriesRemoved: number;
        sizeFreed: number;
    };
}

export interface CacheConfig {
    maxSize: number; // الحد الأقصى لعدد المدخلات
    maxMemoryMB: number; // الحد الأقصى للذاكرة بالميغابايت
    defaultTTL: number; // وقت الحياة الافتراضي بالثواني
    enableCompression: boolean; // تفعيل الضغط
    enablePersistence: boolean; // تفعيل الحفظ على القرص
    cleanupInterval: number; // فترة التنظيف بالثواني
    storagePath?: string; // مسار حفظ الملفات
}

export class IntelligentCacheManager {
    private cache = new Map<string, CacheEntry>();
    private config: Required<CacheConfig>;
    private accessLog: Array<{ key: string; timestamp: Date; hit: boolean }> = [];
    private cleanupTimer?: NodeJS.Timeout;
    private compressionEnabled: boolean;

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = {
            maxSize: config.maxSize || 1000,
            maxMemoryMB: config.maxMemoryMB || 100,
            defaultTTL: config.defaultTTL || 3600, // ساعة واحدة
            enableCompression: config.enableCompression ?? true,
            enablePersistence: config.enablePersistence ?? false,
            cleanupInterval: config.cleanupInterval || 300, // 5 دقائق
            storagePath: config.storagePath || './cache'
        };

        this.compressionEnabled = this.config.enableCompression;
        this.startCleanupTimer();
    }

    /**
     * تخزين عنصر في الذاكرة المؤقتة
     */
    async set<T>(key: string, data: T, options: {
        ttl?: number;
        tags?: string[];
        priority?: 'low' | 'medium' | 'high' | 'critical';
        compress?: boolean;
    } = {}): Promise<void> {
        const {
            ttl = this.config.defaultTTL,
            tags = [],
            priority = 'medium',
            compress = this.compressionEnabled
        } = options;

        // فحص الحد الأقصى للحجم
        if (this.cache.size >= this.config.maxSize && priority !== 'critical') {
            await this.evictLeastValuable();
        }

        // ضغط البيانات إذا لزم الأمر
        let processedData = data;
        let compressed = false;
        let size = this.calculateSize(data);

        if (compress && size > 1024) { // ضغط البيانات الأكبر من 1KB
            processedData = await this.compressData(data);
            compressed = true;
            size = this.calculateSize(processedData);
        }

        // فحص الحد الأقصى للذاكرة
        const currentMemoryUsage = this.getCurrentMemoryUsage();
        if (currentMemoryUsage + size > this.config.maxMemoryMB * 1024 * 1024) {
            await this.freeMemory(size);
        }

        const entry: CacheEntry<T> = {
            key,
            data: processedData,
            metadata: {
                size,
                compressed,
                createdAt: new Date(),
                lastAccessed: new Date(),
                accessCount: 0,
                ttl: ttl > 0 ? ttl * 1000 : undefined, // تحويل إلى مللي ثانية
                tags,
                priority
            }
        };

        this.cache.set(key, entry);
        this.logAccess(key, true);

        // حفظ في الملف إذا كان مفعلاً
        if (this.config.enablePersistence) {
            await this.persistToDisk(key, entry);
        }
    }

    /**
     * استرجاع عنصر من الذاكرة المؤقتة
     */
    async get<T>(key: string): Promise<T | null> {
        const entry = this.cache.get(key);

        if (!entry) {
            this.logAccess(key, false);
            return null;
        }

        // فحص تاريخ الانتهاء
        if (entry.metadata.ttl && Date.now() > entry.metadata.createdAt.getTime() + entry.metadata.ttl) {
            await this.delete(key);
            this.logAccess(key, false);
            return null;
        }

        // فك الضغط إذا لزم الأمر
        let data = entry.data;
        if (entry.metadata.compressed) {
            data = await this.decompressData(data);
        }

        // تحديث إحصائيات الوصول
        entry.metadata.lastAccessed = new Date();
        entry.metadata.accessCount++;

        this.logAccess(key, true);
        return data as T;
    }

    /**
     * حذف عنصر من الذاكرة المؤقتة
     */
    async delete(key: string): Promise<boolean> {
        const deleted = this.cache.delete(key);

        if (deleted && this.config.enablePersistence) {
            await this.removeFromDisk(key);
        }

        return deleted;
    }

    /**
     * حذف عدة عناصر حسب العلامات
     */
    async deleteByTags(tags: string[]): Promise<number> {
        let deletedCount = 0;

        for (const [key, entry] of this.cache) {
            if (tags.some(tag => entry.metadata.tags.includes(tag))) {
                await this.delete(key);
                deletedCount++;
            }
        }

        return deletedCount;
    }

    /**
     * البحث عن عناصر حسب العلامات
     */
    findByTags(tags: string[]): CacheEntry[] {
        const results: CacheEntry[] = [];

        for (const entry of this.cache.values()) {
            if (tags.every(tag => entry.metadata.tags.includes(tag))) {
                results.push(entry);
            }
        }

        return results;
    }

    /**
     * البحث عن عناصر مشابهة
     */
    async findSimilar<T>(query: string, threshold: number = 0.7): Promise<Array<{
        entry: CacheEntry;
        similarity: number;
    }>> {
        const results: Array<{ entry: CacheEntry; similarity: number }> = [];

        for (const entry of this.cache.values()) {
            const similarity = await this.calculateSimilarity(query, entry);
            if (similarity >= threshold) {
                results.push({ entry, similarity });
            }
        }

        return results.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * الحصول على إحصائيات الذاكرة المؤقتة
     */
    getStats(): CacheStats {
        const entries = Array.from(this.cache.values());
        const totalSize = entries.reduce((sum, entry) => sum + entry.metadata.size, 0);
        const accessLog = this.accessLog.slice(-1000); // آخر 1000 عملية

        const hits = accessLog.filter(log => log.hit).length;
        const total = accessLog.length;
        const hitRate = total > 0 ? hits / total : 0;
        const missRate = 1 - hitRate;

        const accessTimes = accessLog.filter(log => log.hit).map(log => {
            const entry = this.cache.get(log.key);
            return entry ? Date.now() - entry.metadata.lastAccessed.getTime() : 0;
        });

        const averageAccessTime = accessTimes.length > 0
            ? accessTimes.reduce((sum, time) => sum + time, 0) / accessTimes.length
            : 0;

        // حساب نسبة الضغط
        const originalSize = entries.reduce((sum, entry) => {
            return sum + (entry.metadata.compressed ? entry.metadata.size * 2 : entry.metadata.size);
        }, 0);
        const compressionRatio = originalSize > 0 ? totalSize / originalSize : 0;

        return {
            totalEntries: this.cache.size,
            totalSize,
            memoryUsage: totalSize / (1024 * 1024), // بالميغابايت
            hitRate,
            missRate,
            averageAccessTime,
            compressionRatio,
            cleanupStats: {
                lastCleanup: new Date(), // سيتم تحديثه في التنظيف الفعلي
                entriesRemoved: 0,
                sizeFreed: 0
            }
        };
    }

    /**
     * تنظيف الذاكرة المؤقتة
     */
    async cleanup(): Promise<{ removedEntries: number; freedSize: number }> {
        let removedEntries = 0;
        let freedSize = 0;

        const now = Date.now();

        // حذف العناصر منتهية الصلاحية
        for (const [key, entry] of this.cache) {
            if (entry.metadata.ttl && now > entry.metadata.createdAt.getTime() + entry.metadata.ttl) {
                freedSize += entry.metadata.size;
                this.cache.delete(key);
                removedEntries++;
            }
        }

        // حذف العناصر الأقل أهمية إذا تجاوز الحد الأقصى
        if (this.cache.size > this.config.maxSize) {
            const entries = Array.from(this.cache.entries())
                .sort((a, b) => this.getEntryValue(a[1]) - this.getEntryValue(b[1]));

            const toRemove = entries.slice(0, this.cache.size - this.config.maxSize);

            for (const [key] of toRemove) {
                const entry = this.cache.get(key);
                if (entry) {
                    freedSize += entry.metadata.size;
                    this.cache.delete(key);
                    removedEntries++;
                }
            }
        }

        // تنظيف سجل الوصول
        this.accessLog = this.accessLog.slice(-5000); // الاحتفاظ بآخر 5000 عملية فقط

        return { removedEntries, freedSize };
    }

    /**
     * تصدير الذاكرة المؤقتة إلى ملف
     */
    async exportToFile(filePath?: string): Promise<void> {
        const data = {
            entries: Array.from(this.cache.entries()),
            stats: this.getStats(),
            exportedAt: new Date()
        };

        // في بيئة Node.js الحقيقية، سنستخدم fs.writeFile
        // هنا سنستخدم localStorage كبديل للمثال
        if (typeof window !== 'undefined') {
            localStorage.setItem('cache_export', JSON.stringify(data));
        }
    }

    /**
     * استيراد الذاكرة المؤقتة من ملف
     */
    async importFromFile(filePath?: string): Promise<void> {
        // في بيئة Node.js الحقيقية، سنستخدم fs.readFile
        // هنا سنستخدم localStorage كبديل للمثال
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem('cache_export');
            if (data) {
                const parsed = JSON.parse(data);
                this.cache.clear();

                for (const [key, entry] of parsed.entries) {
                    this.cache.set(key, {
                        ...entry,
                        metadata: {
                            ...entry.metadata,
                            createdAt: new Date(entry.metadata.createdAt),
                            lastAccessed: new Date(entry.metadata.lastAccessed)
                        }
                    });
                }
            }
        }
    }

    /**
     * إفراغ الذاكرة المؤقتة بالكامل
     */
    async clear(): Promise<void> {
        this.cache.clear();
        this.accessLog = [];

        if (this.config.enablePersistence) {
            await this.clearDiskStorage();
        }
    }

    /**
     * تحديث إعدادات الذاكرة المؤقتة
     */
    updateConfig(newConfig: Partial<CacheConfig>): void {
        this.config = { ...this.config, ...newConfig };

        if (newConfig.cleanupInterval) {
            this.restartCleanupTimer();
        }
    }

    // الطرق المساعدة الخاصة

    private startCleanupTimer(): void {
        this.cleanupTimer = setInterval(async () => {
            await this.cleanup();
        }, this.config.cleanupInterval * 1000);
    }

    private restartCleanupTimer(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.startCleanupTimer();
    }

    private async evictLeastValuable(): Promise<void> {
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => this.getEntryValue(a[1]) - this.getEntryValue(b[1]));

        const toRemove = entries.slice(0, Math.ceil(this.config.maxSize * 0.1)); // إزالة 10% من الأقل قيمة

        for (const [key] of toRemove) {
            await this.delete(key);
        }
    }

    private getEntryValue(entry: CacheEntry): number {
        const age = Date.now() - entry.metadata.lastAccessed.getTime();
        const ageScore = Math.max(0, 100 - (age / (24 * 60 * 60 * 1000)) * 100); // انخفاض القيمة مع التقادم

        const accessScore = Math.min(100, entry.metadata.accessCount * 10); // زيادة القيمة مع الوصول

        const priorityScore = {
            'low': 25,
            'medium': 50,
            'high': 75,
            'critical': 100
        }[entry.metadata.priority];

        return (ageScore * 0.3) + (accessScore * 0.4) + (priorityScore * 0.3);
    }

    private calculateSize(data: any): number {
        return new Blob([JSON.stringify(data)]).size;
    }

    private async compressData(data: any): Promise<any> {
        // في التطبيق الحقيقي، سنستخدم مكتبة ضغط حقيقية
        // هنا سنقوم بتمثيل بسيط للضغط
        const jsonString = JSON.stringify(data);
        return {
            compressed: true,
            originalSize: jsonString.length,
            data: jsonString // في الحقيقة ستكون مضغوطة
        };
    }

    private async decompressData(data: any): Promise<any> {
        if (data.compressed) {
            // في الحقيقة سنقوم بفك الضغط
            return JSON.parse(data.data);
        }
        return data;
    }

    private async calculateSimilarity(query: string, entry: CacheEntry): Promise<number> {
        // حساب التشابه البسيط بناءً على الكلمات المشتركة
        const queryWords = query.toLowerCase().split(/\s+/);
        const contentStr = JSON.stringify(entry.data).toLowerCase();
        const contentWords = contentStr.split(/\s+/);

        const commonWords = queryWords.filter(word => contentWords.includes(word));
        return commonWords.length / Math.max(queryWords.length, 1);
    }

    private logAccess(key: string, hit: boolean): void {
        this.accessLog.push({ key, timestamp: new Date(), hit });

        // الاحتفاظ بآخر 10000 عملية فقط
        if (this.accessLog.length > 10000) {
            this.accessLog = this.accessLog.slice(-10000);
        }
    }

    private getCurrentMemoryUsage(): number {
        return Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.metadata.size, 0);
    }

    private async freeMemory(requiredSize: number): Promise<void> {
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => this.getEntryValue(a[1]) - this.getEntryValue(b[1]));

        let freedSize = 0;

        for (const [key] of entries) {
            if (freedSize >= requiredSize) break;

            const entry = this.cache.get(key);
            if (entry) {
                freedSize += entry.metadata.size;
                await this.delete(key);
            }
        }
    }

    private async persistToDisk(key: string, entry: CacheEntry): Promise<void> {
        // في التطبيق الحقيقي، سنستخدم نظام الملفات
        // هنا سنستخدم localStorage كبديل
        if (typeof window !== 'undefined') {
            localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
        }
    }

    private async removeFromDisk(key: string): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(`cache_${key}`);
        }
    }

    private async clearDiskStorage(): Promise<void> {
        if (typeof window !== 'undefined') {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
            keys.forEach(key => localStorage.removeItem(key));
        }
    }

    /**
     * إغلاق مدير الذاكرة المؤقتة
     */
    close(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
    }
}

/**
 * مثيل عام لمدير الذاكرة المؤقتة
 */
export const cacheManager = new IntelligentCacheManager();

/**
 * دالة مساعدة للحصول على مدير الذاكرة المؤقتة
 */
export function getCacheManager(): IntelligentCacheManager {
    return cacheManager;
}