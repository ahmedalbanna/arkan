/**
 * Service Cache Layer
 * Week 2 - Day 3: Caching Layer
 * 
 * Provides caching functionality for services with:
 * - Memory cache (fast, limited)
 * - TTL support
 * - Cache invalidation
 * - Statistics tracking
 */

// ============================================================================
// Service Cache
// ============================================================================

export class ServiceCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  constructor(
    private ttl: number = 5 * 60 * 1000, // 5 minutes default
    private maxSize: number = 1000
  ) {}

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    entry.accessCount++;
    entry.lastAccess = Date.now();
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, customTtl?: number): void {
    // Evict old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      lastAccess: Date.now(),
      accessCount: 0,
      ttl: customTtl || this.ttl
    };

    this.cache.set(key, entry);
    this.stats.sets++;
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits + this.stats.misses > 0
        ? this.stats.hits / (this.stats.hits + this.stats.misses)
        : 0
    };
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet(
    key: string,
    fetcher: () => Promise<T>,
    customTtl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, customTtl);
    return value;
  }

  /**
   * Invalidate multiple keys by pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict oldest entries
   */
  private evictOldest(): void {
    // Find entries to evict (either expired or least recently used)
    const entries = Array.from(this.cache.entries());
    
    // First, try to evict expired entries
    const expired = entries.filter(([_, entry]) => this.isExpired(entry));
    if (expired.length > 0) {
      expired.forEach(([key]) => this.cache.delete(key));
      return;
    }

    // If no expired entries, evict least recently used
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    const toEvict = Math.ceil(this.maxSize * 0.1); // Evict 10%
    
    for (let i = 0; i < toEvict && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        removed++;
      }
    }
    return removed;
  }
}

// ============================================================================
// Multi-Level Cache (Memory + Redis simulation)
// ============================================================================

export class MultiLevelCache<T> {
  private l1Cache: ServiceCache<T>;
  private l2Enabled: boolean = false;

  constructor(
    l1Ttl: number = 60 * 1000,      // 1 minute for L1
    l1MaxSize: number = 100,
    _l2Ttl: number = 5 * 60 * 1000,  // 5 minutes for L2 (reserved for future use)
    enableL2: boolean = false
  ) {
    this.l1Cache = new ServiceCache<T>(l1Ttl, l1MaxSize);
    this.l2Enabled = enableL2;
  }

  /**
   * Get from cache (checks L1, then L2)
   */
  async get(key: string): Promise<T | null> {
    // Check L1 first
    const l1Value = this.l1Cache.get(key);
    if (l1Value !== null) {
      return l1Value;
    }

    // Check L2 if enabled (would be Redis in production)
    if (this.l2Enabled) {
      // In production, this would query Redis
      // For now, just return null
      return null;
    }

    return null;
  }

  /**
   * Set in cache (L1 and optionally L2)
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    // Set in L1
    this.l1Cache.set(key, value, ttl);

    // Set in L2 if enabled
    if (this.l2Enabled) {
      // In production, this would set in Redis
    }
  }

  /**
   * Delete from all cache levels
   */
  async delete(key: string): Promise<void> {
    this.l1Cache.delete(key);
    
    if (this.l2Enabled) {
      // In production, this would delete from Redis
    }
  }

  /**
   * Clear all cache levels
   */
  async clear(): Promise<void> {
    this.l1Cache.clear();
    
    if (this.l2Enabled) {
      // In production, this would clear Redis
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return this.l1Cache.getStats();
  }
}

// ============================================================================
// Cache Decorators
// ============================================================================

/**
 * Decorator for caching method results
 */
export function Cached(ttl?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = new ServiceCache<any>(ttl);

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, result);
      return result;
    };

    return descriptor;
  };
}

/**
 * Invalidate cache decorator
 */
export function InvalidateCache(cacheKey: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // Invalidate cache after method execution
      if (this.cache && typeof this.cache.delete === 'function') {
        this.cache.delete(cacheKey);
      }

      return result;
    };

    return descriptor;
  };
}

// ============================================================================
// Types and Interfaces
// ============================================================================

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  lastAccess: number;
  accessCount: number;
  ttl: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  hitRate: number;
}

// ============================================================================
// Global Cache Instances
// ============================================================================

export const flowConfigCache = new ServiceCache<any>(5 * 60 * 1000, 100);
export const promptCache = new ServiceCache<any>(5 * 60 * 1000, 200);
export const toolCache = new ServiceCache<any>(10 * 60 * 1000, 50);
export const traceCache = new ServiceCache<any>(1 * 60 * 1000, 50);
