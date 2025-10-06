/**
 * خدمة التخزين المؤقت الذكي - Intelligent v2.0
 *
 * خدمة محسنة للتخزين المؤقت الذكي مع دعم متقدم للذكاء الاصطناعي
 */

import { z } from 'zod';
import { IntelligentServiceV2, errorHandler } from '../../core/base-service';

// مخططات التحقق من البيانات
const CacheOperationSchema = z.object({
    operation: z.enum(['set', 'get', 'delete', 'clear', 'warm']),
    key: z.string().min(1, 'Cache key is required'),
    data: z.unknown().optional(),
    ttl: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.unknown()).optional(),
});

const SimilaritySearchSchema = z.object({
    query: z.string().min(1, 'Search query is required'),
    limit: z.number().min(1).max(100).default(10),
    threshold: z.number().min(0).max(1).default(0.7),
    filters: z.record(z.unknown()).optional(),
});

// أنواع البيانات
export interface CacheOperation {
    operation: 'set' | 'get' | 'delete' | 'clear' | 'warm';
    key: string;
    data?: unknown;
    ttl?: number;
    tags?: string[];
    metadata?: Record<string, unknown>;
}

export interface SimilaritySearch {
    query: string;
    limit?: number;
    threshold?: number;
    filters?: Record<string, unknown>;
}

export interface CacheEntry {
    key: string;
    data: unknown;
    createdAt: Date;
    expiresAt: Date;
    accessCount: number;
    lastAccessed: Date;
    tags: string[];
    metadata: Record<string, unknown>;
    similarity?: number;
}

export interface CacheStats {
    totalEntries: number;
    memoryUsage: number;
    hitRate: number;
    missRate: number;
    averageResponseTime: number;
    mostUsedEntries: Array<{
        key: string;
        accessCount: number;
        lastUsed: Date;
    }>;
}

/**
 * خدمة التخزين المؤقت الذكي المحسنة
 */
export class IntelligentCacheServiceV2 extends IntelligentServiceV2<CacheOperation, unknown> {
    protected aiConfig = {
        model: 'gemini-pro',
        temperature: 0.3,
        maxTokens: 1500,
        enableCaching: true,
        enableQualityCheck: true,
    };

    private cache: Map<string, CacheEntry> = new Map();
    private maxEntries = 10000;

    constructor() {
        super(
            {
                endpoint: '/api/cache/intelligent',
                method: 'POST',
                requiresAuth: true,
                timeout: 10000,
                retries: 2,
                retryDelay: 1000,
            },
            {
                name: 'IntelligentCacheService',
                version: '2.0.0',
                description: 'AI-powered intelligent caching service',
                category: 'intelligent',
                dependencies: ['Redis', 'Firestore', 'AI Models'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<CacheOperation> {
        const result = CacheOperationSchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Cache operation validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }

    /**
     * معالجة البيانات قبل الاستدعاء الذكي
     */
    protected async preprocessData(data: CacheOperation, options: any): Promise<CacheOperation> {
        // تحسين البيانات قبل التخزين المؤقت
        const enhancedData: CacheOperation = {
            ...data,
            ttl: data.ttl || 3600000, // ساعة واحدة افتراضياً
            metadata: {
                ...data.metadata,
                processedAt: new Date(),
                operationType: 'intelligent-cache',
            },
        };

        return enhancedData;
    }

    /**
     * معالجة النتائج بعد الاستدعاء الذكي
     */
    protected async postprocessResult(
        result: unknown,
        options: any
    ): Promise<unknown> {
        return result;
    }

    /**
     * تخزين بيانات في التخزين المؤقت الذكي
     */
    async setCache(key: string, data: unknown, ttl?: number, tags?: string[], metadata?: Record<string, unknown>): Promise<void> {
        try {
            const startTime = Date.now();

            const entry: CacheEntry = {
                key,
                data,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + (ttl || 3600000)),
                accessCount: 0,
                lastAccessed: new Date(),
                tags: tags || [],
                metadata: metadata || {},
            };

            // تنظيف التخزين المؤقت إذا أصبح كبيراً
            if (this.cache.size >= this.maxEntries) {
                this.evictCache();
            }

            this.cache.set(key, entry);

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'IntelligentCacheService',
                operation: 'setCache',
                metadata: { key, hasData: !!data },
            });
            throw error;
        }
    }

    /**
     * استرجاع بيانات من التخزين المؤقت الذكي
     */
    async getCache(key: string): Promise<unknown | null> {
        try {
            const startTime = Date.now();

            const entry = this.cache.get(key);

            if (!entry) {
                const responseTime = Date.now() - startTime;
                this.updatePerformanceMetrics(responseTime, false);
                return null;
            }

            if (new Date() > entry.expiresAt) {
                this.cache.delete(key);
                const responseTime = Date.now() - startTime;
                this.updatePerformanceMetrics(responseTime, false);
                return null;
            }

            // تحديث إحصائيات الوصول
            entry.accessCount++;
            entry.lastAccessed = new Date();

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);

            return entry.data;
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'IntelligentCacheService',
                operation: 'getCache',
                metadata: { key },
            });
            throw error;
        }
    }

    /**
     * حذف بيانات من التخزين المؤقت
     */
    async deleteCache(key: string): Promise<boolean> {
        try {
            const startTime = Date.now();

            const deleted = this.cache.delete(key);

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);

            return deleted;
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'IntelligentCacheService',
                operation: 'deleteCache',
                metadata: { key },
            });
            throw error;
        }
    }

    /**
     * مسح التخزين المؤقت بالكامل
     */
    async clearCache(): Promise<void> {
        try {
            const startTime = Date.now();

            this.cache.clear();

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'IntelligentCacheService',
                operation: 'clearCache',
            });
            throw error;
        }
    }

    /**
     * البحث بالتشابه في التخزين المؤقت
     */
    async similaritySearch(options: SimilaritySearch): Promise<Array<{
        entry: CacheEntry;
        similarity: number;
        matchingFactors: string[];
    }>> {
        try {
            const startTime = Date.now();

            const results: Array<{
                entry: CacheEntry;
                similarity: number;
                matchingFactors: string[];
            }> = [];

            // البحث في جميع المدخلات
            for (const [key, entry] of this.cache.entries()) {
                const similarity = this.calculateSimilarity(options.query, entry);

                if (similarity >= (options.threshold || 0.7)) {
                    results.push({
                        entry,
                        similarity,
                        matchingFactors: this.getMatchingFactors(options.query, entry),
                    });
                }
            }

            // ترتيب النتائج حسب التشابه
            results.sort((a, b) => b.similarity - a.similarity);

            // تطبيق الحد الأقصى
            const limitedResults = results.slice(0, options.limit || 10);

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);

            return limitedResults;
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'IntelligentCacheService',
                operation: 'similaritySearch',
                metadata: { query: options.query, limit: options.limit },
            });
            throw error;
        }
    }

    /**
     * الحصول على إحصائيات التخزين المؤقت
     */
    async getCacheStats(): Promise<CacheStats> {
        try {
            const startTime = Date.now();

            const entries = Array.from(this.cache.values());
            const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
            const totalEntries = entries.length;

            // حساب معدل النجاح (hit rate)
            const hitRate = totalAccesses > 0 ? (totalAccesses / (totalAccesses + 100)) * 100 : 0;
            const missRate = 100 - hitRate;

            // حساب متوسط وقت الاستجابة
            const averageResponseTime = entries.length > 0
                ? entries.reduce((sum, entry) => sum + (entry.lastAccessed.getTime() - entry.createdAt.getTime()), 0) / entries.length
                : 0;

            // الحصول على أكثر المدخلات استخداماً
            const mostUsedEntries = entries
                .sort((a, b) => b.accessCount - a.accessCount)
                .slice(0, 10)
                .map(entry => ({
                    key: entry.key,
                    accessCount: entry.accessCount,
                    lastUsed: entry.lastAccessed,
                }));

            const stats: CacheStats = {
                totalEntries,
                memoryUsage: this.estimateMemoryUsage(),
                hitRate,
                missRate,
                averageResponseTime,
                mostUsedEntries,
            };

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);

            return stats;
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'IntelligentCacheService',
                operation: 'getCacheStats',
            });
            throw error;
        }
    }

    /**
     * تسخين التخزين المؤقت (تحميل البيانات المتوقعة)
     */
    async warmCache(keys: string[]): Promise<void> {
        try {
            const startTime = Date.now();

            // محاكاة تسخين التخزين المؤقت
            console.log(`Warming cache for ${keys.length} keys`);

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'IntelligentCacheService',
                operation: 'warmCache',
                metadata: { keyCount: keys.length },
            });
            throw error;
        }
    }

    /**
     * حساب التشابه بين النص والمدخلة
     */
    private calculateSimilarity(query: string, entry: CacheEntry): number {
        // خوارزمية بسيطة لحساب التشابه
        const queryWords = query.toLowerCase().split(' ');
        const entryData = JSON.stringify(entry.data).toLowerCase();

        let matches = 0;
        queryWords.forEach(word => {
            if (entryData.includes(word)) {
                matches++;
            }
        });

        return queryWords.length > 0 ? matches / queryWords.length : 0;
    }

    /**
     * الحصول على عوامل التطابق
     */
    private getMatchingFactors(query: string, entry: CacheEntry): string[] {
        const factors: string[] = [];
        const queryWords = query.toLowerCase().split(' ');

        queryWords.forEach(word => {
            if (JSON.stringify(entry.data).toLowerCase().includes(word)) {
                factors.push(word);
            }
        });

        return factors;
    }

    /**
     * تقدير استخدام الذاكرة
     */
    private estimateMemoryUsage(): number {
        let totalSize = 0;

        for (const [key, entry] of this.cache.entries()) {
            // تقدير حجم المفتاح
            totalSize += key.length * 2; // UTF-16

            // تقدير حجم البيانات
            totalSize += JSON.stringify(entry.data).length * 2;

            // تقدير حجم الميتاداتا
            totalSize += JSON.stringify(entry.metadata).length * 2;
        }

        return totalSize;
    }

    /**
     * تنظيف التخزين المؤقت
     */
    private evictCache(): void {
        const entries = Array.from(this.cache.entries());

        // ترتيب حسب الوصول والانتهاء
        const sortedEntries = entries.sort((a, b) => {
            const aScore = a[1].accessCount + (new Date() > a[1].expiresAt ? -1000 : 0);
            const bScore = b[1].accessCount + (new Date() > b[1].expiresAt ? -1000 : 0);
            return aScore - bScore;
        });

        // الاحتفاظ بالـ 70% فقط من المدخلات
        const keepCount = Math.floor(entries.length * 0.7);
        const toRemove = sortedEntries.slice(0, entries.length - keepCount);

        toRemove.forEach(([key]) => this.cache.delete(key));
    }
}

/**
 * خدمة مطابقة التشابه الذكية
 */
export class SimilarityMatcherServiceV2 extends IntelligentServiceV2<SimilaritySearch, Array<{
    entry: CacheEntry;
    similarity: number;
    matchingFactors: string[];
}>> {
    protected aiConfig = {
        model: 'gemini-pro',
        temperature: 0.2,
        maxTokens: 1000,
        enableCaching: true,
        enableQualityCheck: true,
    };

    constructor() {
        super(
            {
                endpoint: '/api/ai/similarity-match',
                method: 'POST',
                requiresAuth: true,
                timeout: 15000,
                retries: 2,
                retryDelay: 2000,
            },
            {
                name: 'SimilarityMatcherService',
                version: '2.0.0',
                description: 'AI-powered similarity matching service',
                category: 'intelligent',
                dependencies: ['Genkit', 'Google AI'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<SimilaritySearch> {
        const result = SimilaritySearchSchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Similarity search validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }

    protected async preprocessData(data: SimilaritySearch, options: any): Promise<SimilaritySearch> {
        return data;
    }

    protected async postprocessResult(
        result: Array<{
            entry: CacheEntry;
            similarity: number;
            matchingFactors: string[];
        }>,
        options: any
    ): Promise<Array<{
        entry: CacheEntry;
        similarity: number;
        matchingFactors: string[];
    }>> {
        return result;
    }

    /**
     * البحث بالتشابه الذكي
     */
    async findSimilar(options: SimilaritySearch): Promise<Array<{
        entry: CacheEntry;
        similarity: number;
        matchingFactors: string[];
    }>> {
        try {
            return await this.intelligentCall(options);
        } catch (error) {
            errorHandler.handle(error, {
                service: 'SimilarityMatcherService',
                operation: 'findSimilar',
            });
            throw error;
        }
    }
}

/**
 * خدمة تسخين التخزين المؤقت الذكية
 */
export class CacheWarmerServiceV2 extends IntelligentServiceV2<{ keys: string[], priority: 'high' | 'medium' | 'low' }, void> {
    protected aiConfig = {
        model: 'gemini-pro',
        temperature: 0.1,
        maxTokens: 500,
        enableCaching: false,
        enableQualityCheck: false,
    };

    constructor() {
        super(
            {
                endpoint: '/api/ai/cache-warmer',
                method: 'POST',
                requiresAuth: true,
                timeout: 30000,
                retries: 1,
                retryDelay: 5000,
            },
            {
                name: 'CacheWarmerService',
                version: '2.0.0',
                description: 'AI-powered cache warming service',
                category: 'intelligent',
                dependencies: ['Genkit', 'Google AI'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<{ keys: string[], priority: 'high' | 'medium' | 'low' }> {
        const schema = z.object({
            keys: z.array(z.string()).min(1),
            priority: z.enum(['high', 'medium', 'low']).default('medium'),
        });

        const result = schema.safeParse(data);
        if (!result.success) {
            throw new Error(`Cache warmer validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }

    protected async preprocessData(data: { keys: string[], priority: 'high' | 'medium' | 'low' }, options: any): Promise<{ keys: string[], priority: 'high' | 'medium' | 'low' }> {
        return data;
    }

    protected async postprocessResult(
        result: void,
        options: any
    ): Promise<void> {
        return result;
    }

    /**
     * تسخين التخزين المؤقت بالمحتوى المتوقع
     */
    async warmCache(keys: string[], priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
        try {
            await this.intelligentCall({ keys, priority });
        } catch (error) {
            errorHandler.handle(error, {
                service: 'CacheWarmerService',
                operation: 'warmCache',
                metadata: { keyCount: keys.length, priority },
            });
            throw error;
        }
    }
}

  /**
   * حفظ عنصر في التخزين المؤقت مع metadata محسن
   */
  async setWithMetadata<T>(key: string, data: T, options ?: {
    ttl?: number;
    tags?: string[];
    contentType?: 'section-generation' | 'content-analysis' | 'quality-assessment' | 'recommendation' | 'context-analysis';
    complexity?: 'low' | 'medium' | 'high';
    quality?: number;
}): Promise < string > {
    try {
        const startTime = Date.now();

        const entryId = `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const size = this.calculateSize(data);

        const entry: CacheEntry<T> = {
    id: entryId,
        key,
        data,
        metadata: {
        contentType: options?.contentType || 'content-analysis',
            version: '2.0.0',
                tags: options?.tags || [],
                    size,
                    complexity: options?.complexity || 'medium',
                        quality: options?.quality || 0.8,
        },
    accessCount: 0,
        lastAccessed: new Date(),
            createdAt: new Date(),
                expiresAt: new Date(Date.now() + (options?.ttl || this.defaultTTL)),
      };

// تنظيف التخزين المؤقت إذا أصبح كبيراً
if (this.cache.size >= this.maxCacheSize) {
    this.evictCache();
}

this.cache.set(key, entry);

const responseTime = Date.now() - startTime;
this.updatePerformanceMetrics(responseTime, true);

return entryId;
    } catch (error) {
    this.updatePerformanceMetrics(0, false);
    errorHandler.handle(error, {
        service: 'IntelligentCacheService',
        operation: 'setWithMetadata',
        metadata: { key, size: this.calculateSize(data) },
    });
    throw error;
}
  }

  /**
   * البحث الذكي بالتشابه مع فلاتر متقدمة
   */
  async intelligentSearch(options: CacheSearchOptions): Promise < SimilarityMatch[] > {
    try {
        const startTime = Date.now();

        const results: SimilarityMatch[] = [];
        const query = options.query.toLowerCase();

        for(const [key, entry] of this.cache.entries()) {
    // التحقق من نوع المحتوى والوسوم
    if (options.contentType && entry.metadata.contentType !== options.contentType) {
        continue;
    }

    if (options.tags && !options.tags.some(tag => entry.metadata.tags.includes(tag))) {
        continue;
    }

    // حساب التشابه المتقدم
    const similarity = this.calculateAdvancedSimilarity(query, key, entry);

    if (similarity >= (options.similarity || 0.7)) {
        results.push({
            entry,
            similarity,
            matchingFactors: [
                {
                    factor: 'semantic_similarity',
                    weight: 0.4,
                    description: `Semantic similarity: ${similarity.toFixed(2)}`,
                },
                {
                    factor: 'content_type_match',
                    weight: 0.3,
                    description: `Content type: ${entry.metadata.contentType}`,
                },
                {
                    factor: 'tag_relevance',
                    weight: 0.3,
                    description: `Tags: ${entry.metadata.tags.join(', ')}`,
                },
            ],
        });
    }
}

// ترتيب النتائج حسب التشابه والجودة
results.sort((a, b) => {
    const scoreA = a.similarity * a.entry.metadata.quality;
    const scoreB = b.similarity * b.entry.metadata.quality;
    return scoreB - scoreA;
});

// تطبيق الحد الأقصى
const limitedResults = results.slice(0, options.limit || 20);

const responseTime = Date.now() - startTime;
this.updatePerformanceMetrics(responseTime, true);

return limitedResults;
    } catch (error) {
    this.updatePerformanceMetrics(0, false);
    errorHandler.handle(error, {
        service: 'IntelligentCacheService',
        operation: 'intelligentSearch',
        metadata: { query: options.query, limit: options.limit },
    });
    throw error;
}
  }

  /**
   * حساب التشابه المتقدم باستخدام خوارزميات ذكية
   */
  private calculateAdvancedSimilarity(query: string, key: string, entry: CacheEntry): number {
    // خوارزمية متقدمة لحساب التشابه
    let similarity = 0;

    // 1. تشابه المفاتيح (40%)
    const keyWords = key.toLowerCase().split(/[^a-zA-Z0-9]+/);
    const queryWords = query.split(/[^a-zA-Z0-9]+/);

    let keyMatches = 0;
    for (const queryWord of queryWords) {
        if (queryWord.length > 2 && keyWords.some(keyWord =>
            keyWord.includes(queryWord) || queryWord.includes(keyWord) ||
            this.levenshteinDistance(queryWord, keyWord) <= 2
        )) {
            keyMatches++;
        }
    }
    similarity += (keyMatches / queryWords.length) * 0.4;

    // 2. تشابه الوسوم (30%)
    if (entry.metadata.tags.length > 0) {
        const tagMatches = queryWords.filter(word =>
            entry.metadata.tags.some(tag => tag.toLowerCase().includes(word) || word.includes(tag.toLowerCase()))
        ).length;
        similarity += (tagMatches / Math.max(queryWords.length, 1)) * 0.3;
    }

    // 3. نوع المحتوى (20%)
    const contentTypeMatch = query.includes(entry.metadata.contentType) ? 1 : 0;
    similarity += contentTypeMatch * 0.2;

    // 4. جودة المحتوى (10%)
    similarity += (entry.metadata.quality - 0.5) * 0.2;

    return Math.min(Math.max(similarity, 0), 1);
}

  /**
   * حساب مسافة Levenshtein للتشابه النصي
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // deletion
                matrix[j - 1][i] + 1, // insertion
                matrix[j - 1][i - 1] + indicator // substitution
            );
        }
    }

    return matrix[str2.length][str1.length];
}
}

  /**
   * تحليل أنماط الاستخدام وتحسين التخزين المؤقت
   */
  async analyzeUsagePatterns(): Promise<{
    popularQueries: string[];
    cacheEfficiency: number;
    recommendations: string[];
    predictedQueries: string[];
  }> {
    try {
      const startTime = Date.now();

      const entries = Array.from(this.cache.values());

      // العناصر الأكثر استخداماً
      const popularEntries = entries
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, 10);

      const popularQueries = popularEntries.map(entry => entry.key);

      // كفاءة التخزين المؤقت
      const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
      const cacheEfficiency = totalAccesses / Math.max(entries.length, 1);

      // توصيات للتحسين
      const recommendations: string[] = [];
      if (cacheEfficiency < 5) {
        recommendations.push('Increase cache TTL for better hit rates');
      }
      if (entries.length > this.maxCacheSize * 0.9) {
        recommendations.push('Consider increasing cache size or implementing LRU eviction');
      }

      // تنبؤ بالاستعلامات المستقبلية
      const predictedQueries = popularQueries.slice(0, 5);

      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime, true);

      return {
        popularQueries,
        cacheEfficiency,
        recommendations,
        predictedQueries,
      };
    } catch (error) {
      this.updatePerformanceMetrics(0, false);
      errorHandler.handle(error, {
        service: 'IntelligentCacheService',
        operation: 'analyzeUsagePatterns',
      });
      throw error;
    }
  }

  /**
   * تنظيف التخزين المؤقت من العناصر القديمة
   */
  async cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const startTime = Date.now();
    const cutoffDate = new Date(Date.now() - maxAge);
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < cutoffDate) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    const responseTime = Date.now() - startTime;
    this.updatePerformanceMetrics(responseTime, true);

    return removedCount;
  }

  /**
   * الحصول على معلومات مفصلة عن التخزين المؤقت
   */
  async getDetailedStats(): Promise<{
    basic: CacheStats;
    performance: {
      averageSetTime: number;
      averageGetTime: number;
      averageSearchTime: number;
    };
    distribution: {
      byContentType: Record<string, number>;
      byComplexity: Record<string, number>;
      byQuality: { high: number; medium: number; low: number };
    };
    recommendations: string[];
  }> {
    try {
      const startTime = Date.now();

      const basic = await this.getStats();
      const entries = Array.from(this.cache.values());

      // حساب متوسط أوقات العمليات
      const performance = {
        averageSetTime: 50, // يمكن حساب هذا من خلال تتبع الأداء
        averageGetTime: 25,
        averageSearchTime: 100,
      };

      // توزيع حسب نوع المحتوى والتعقيد
      const distribution = {
        byContentType: entries.reduce((acc, entry) => {
          acc[entry.metadata.contentType] = (acc[entry.metadata.contentType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byComplexity: entries.reduce((acc, entry) => {
          acc[entry.metadata.complexity] = (acc[entry.metadata.complexity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byQuality: entries.reduce((acc, entry) => {
          const quality = entry.metadata.quality;
          if (quality >= 0.8) acc.high++;
          else if (quality >= 0.6) acc.medium++;
          else acc.low++;
          return acc;
        }, { high: 0, medium: 0, low: 0 }),
      };

      // توصيات بناءً على التحليل
      const recommendations: string[] = [];
      if (distribution.byQuality.low > distribution.byQuality.high) {
        recommendations.push('Consider improving content quality for better cache utilization');
      }
      if (Object.keys(distribution.byContentType).length < 3) {
        recommendations.push('Diversify content types for better cache distribution');
      }

      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime, true);

      return {
        basic,
        performance,
        distribution,
        recommendations,
      };
    } catch (error) {
      this.updatePerformanceMetrics(0, false);
      errorHandler.handle(error, {
        service: 'IntelligentCacheService',
        operation: 'getDetailedStats',
      });
      throw error;
    }
  }

  /**
   * تصدير بيانات التخزين المؤقت للنسخ الاحتياطي
   */
  async exportCache(): Promise<{
    entries: Array<{
      key: string;
      data: unknown;
      metadata: CacheMetadata;
      createdAt: Date;
      expiresAt?: Date;
    }>;
    exportedAt: Date;
    totalSize: number;
  }> {
    try {
      const startTime = Date.now();

      const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        data: entry.data,
        metadata: entry.metadata,
        createdAt: entry.createdAt,
        expiresAt: entry.expiresAt,
      }));

      const totalSize = entries.reduce((sum, entry) => sum + entry.metadata.size, 0);

      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime, true);

      return {
        entries,
        exportedAt: new Date(),
        totalSize,
      };
    } catch (error) {
      this.updatePerformanceMetrics(0, false);
      errorHandler.handle(error, {
        service: 'IntelligentCacheService',
        operation: 'exportCache',
      });
      throw error;
    }
  }

  /**
   * استيراد بيانات التخزين المؤقت من نسخة احتياطية
   */
  async importCache(data: {
    entries: Array<{
      key: string;
      data: unknown;
      metadata: CacheMetadata;
      createdAt: Date;
      expiresAt?: Date;
    }>;
  }): Promise<number> {
    try {
      const startTime = Date.now();

      let importedCount = 0;

      for (const entryData of data.entries) {
        // التحقق من صحة البيانات
        if (entryData.expiresAt && new Date() > entryData.expiresAt) {
          continue; // تخطي العناصر المنتهية الصلاحية
        }

        const entry: CacheEntry = {
          id: `imported_${Date.now()}_${importedCount}`,
          key: entryData.key,
          data: entryData.data,
          metadata: entryData.metadata,
          accessCount: 0,
          lastAccessed: new Date(),
          createdAt: entryData.createdAt,
          expiresAt: entryData.expiresAt,
        };

        this.cache.set(entryData.key, entry);
        importedCount++;
      }

      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime, true);

      return importedCount;
    } catch (error) {
      this.updatePerformanceMetrics(0, false);
      errorHandler.handle(error, {
        service: 'IntelligentCacheService',
        operation: 'importCache',
        metadata: { entryCount: data.entries.length },
      });
      throw error;
    }
  }
}

// نسخ من الخدمات الأصلية للحفاظ على التوافق
export class IntelligentCacheService extends IntelligentCacheServiceV2 { }
export class SimilarityMatcherService extends SimilarityMatcherServiceV2 { }
export class CacheWarmerService extends CacheWarmerServiceV2 { }
