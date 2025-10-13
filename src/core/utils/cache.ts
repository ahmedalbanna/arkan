/**
 * نظام Cache موحد
 *
 * هذا الملف يحتوي على نظام cache موحد
 * مع دعم TTL والتشفير
 */

'use client';

import { createHash } from './crypto-utils';

/**
 * خيارات Cache
 */
export interface CacheOptions {
    /** مدة انتهاء الصلاحية بالميللي ثانية */
    ttl?: number;
    /** هل يجب تشفير البيانات */
    encrypt?: boolean;
    /** مفتاح التشفير */
    encryptionKey?: string;
}

/**
 * عنصر Cache
 */
interface CacheItem<T> {
    data: T;
    expiresAt: number;
    createdAt: number;
    encrypted?: boolean;
}

/**
 * إعدادات Cache الافتراضية
 */
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
    ttl: 24 * 60 * 60 * 1000, // 24 ساعة
    encrypt: false,
};

/**
 * بادئة Cache
 */
const CACHE_PREFIX = 'arkan-cache-';

/**
 * الحصول على البيانات من Cache
 */
export function getFromCache<T>(key: string): T | null {
    try {
        const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
        if (!item) return null;

        const parsed: CacheItem<T> = JSON.parse(item);
        const now = Date.now();

        // التحقق من انتهاء الصلاحية
        if (now > parsed.expiresAt) {
            localStorage.removeItem(`${CACHE_PREFIX}${key}`);
            return null;
        }

        return parsed.data;
    } catch (error) {
        console.error('Cache Get Error:', error);
        return null;
    }
}

/**
 * حفظ البيانات في Cache
 */
export function saveToCache<T>(key: string, data: T, options: CacheOptions = {}): void {
    try {
        const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
        const now = Date.now();

        const item: CacheItem<T> = {
            data,
            expiresAt: now + (opts.ttl || DEFAULT_CACHE_OPTIONS.ttl!),
            createdAt: now,
            encrypted: opts.encrypt,
        };

        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
    } catch (error) {
        console.error('Cache Save Error:', error);
    }
}

/**
 * حذف البيانات من Cache
 */
export function removeFromCache(key: string): void {
    try {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
        console.error('Cache Remove Error:', error);
    }
}

/**
 * مسح جميع البيانات من Cache
 */
export function clearCache(): void {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error('Cache Clear Error:', error);
    }
}

/**
 * إنشاء مفتاح Cache
 */
export async function generateCacheKey(data: object): Promise<string> {
    try {
        const jsonString = JSON.stringify(data);
        const hash = await createHash(jsonString, 'SHA-256');
        return hash.substring(0, 16); // استخدام أول 16 حرف
    } catch (error) {
        console.error('Cache Key Generation Error:', error);
        return Math.random().toString(36).substring(2, 18);
    }
}

/**
 * التحقق من وجود البيانات في Cache
 */
export function hasInCache(key: string): boolean {
    try {
        const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
        if (!item) return false;

        const parsed: CacheItem<any> = JSON.parse(item);
        const now = Date.now();

        // التحقق من انتهاء الصلاحية
        if (now > parsed.expiresAt) {
            localStorage.removeItem(`${CACHE_PREFIX}${key}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Cache Has Error:', error);
        return false;
    }
}

/**
 * الحصول على معلومات Cache
 */
export function getCacheInfo(key: string): {
    exists: boolean;
    expiresAt: number | null;
    createdAt: number | null;
    ttl: number | null;
} | null {
    try {
        const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
        if (!item) return null;

        const parsed: CacheItem<any> = JSON.parse(item);
        const now = Date.now();

        return {
            exists: now <= parsed.expiresAt,
            expiresAt: parsed.expiresAt,
            createdAt: parsed.createdAt,
            ttl: parsed.expiresAt - now,
        };
    } catch (error) {
        console.error('Cache Info Error:', error);
        return null;
    }
}

/**
 * الحصول على إحصائيات Cache
 */
export function getCacheStats(): {
    totalItems: number;
    totalSize: number;
    expiredItems: number;
    validItems: number;
} {
    try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

        let totalSize = 0;
        let expiredItems = 0;
        let validItems = 0;
        const now = Date.now();

        cacheKeys.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                totalSize += item.length;

                try {
                    const parsed: CacheItem<any> = JSON.parse(item);
                    if (now > parsed.expiresAt) {
                        expiredItems++;
                    } else {
                        validItems++;
                    }
                } catch {
                    expiredItems++;
                }
            }
        });

        return {
            totalItems: cacheKeys.length,
            totalSize,
            expiredItems,
            validItems,
        };
    } catch (error) {
        console.error('Cache Stats Error:', error);
        return {
            totalItems: 0,
            totalSize: 0,
            expiredItems: 0,
            validItems: 0,
        };
    }
}

/**
 * تنظيف Cache المنتهي الصلاحية
 */
export function cleanupExpiredCache(): number {
    try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
        let cleanedCount = 0;
        const now = Date.now();

        cacheKeys.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                try {
                    const parsed: CacheItem<any> = JSON.parse(item);
                    if (now > parsed.expiresAt) {
                        localStorage.removeItem(key);
                        cleanedCount++;
                    }
                } catch {
                    localStorage.removeItem(key);
                    cleanedCount++;
                }
            }
        });

        return cleanedCount;
    } catch (error) {
        console.error('Cache Cleanup Error:', error);
        return 0;
    }
}
