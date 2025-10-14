/**
 * Advanced Caching Strategies
 * Implements multiple caching strategies for optimal performance
 */

export interface CacheStrategy {
  name: string;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  size(): Promise<number>;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
  evictions: number;
}

// LRU Cache Strategy
export class LRUCacheStrategy implements CacheStrategy {
  name = 'lru';
  private cache = new Map<string, CacheEntry<any>>();
  private accessOrder: string[] = [];
  private maxSize: number;
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.metrics.misses++;
      return null;
    }

    // Update access order
    this.updateAccessOrder(key);
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    this.metrics.hits++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 300000): Promise<void> {
    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      this.removeFromAccessOrder(key);
    }

    // Evict if necessary
    if (this.cache.size >= this.maxSize) {
      await this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.removeFromAccessOrder(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder = [];
    this.metrics = { hits: 0, misses: 0, evictions: 0 };
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return false;
    }

    return true;
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  getMetrics(): CacheMetrics {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate: total > 0 ? this.metrics.hits / total : 0,
      size: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
      evictions: this.metrics.evictions
    };
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private async evictLRU(): Promise<void> {
    if (this.accessOrder.length === 0) return;

    const lruKey = this.accessOrder[0];
    this.cache.delete(lruKey);
    this.removeFromAccessOrder(lruKey);
    this.metrics.evictions++;
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, entry] of this.cache) {
      totalSize += key.length * 2; // UTF-16 characters
      totalSize += JSON.stringify(entry.value).length * 2;
      totalSize += 32; // Entry overhead
    }
    return totalSize;
  }
}

// LFU Cache Strategy
export class LFUCacheStrategy implements CacheStrategy {
  name = 'lfu';
  private cache = new Map<string, CacheEntry<any>>();
  private frequencyMap = new Map<string, number>();
  private maxSize: number;
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.frequencyMap.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Update frequency
    const currentFreq = this.frequencyMap.get(key) || 0;
    this.frequencyMap.set(key, currentFreq + 1);
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    this.metrics.hits++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 300000): Promise<void> {
    // Evict if necessary
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      await this.evictLFU();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);
    this.frequencyMap.set(key, 0);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.frequencyMap.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.frequencyMap.clear();
    this.metrics = { hits: 0, misses: 0, evictions: 0 };
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.frequencyMap.delete(key);
      return false;
    }

    return true;
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  getMetrics(): CacheMetrics {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate: total > 0 ? this.metrics.hits / total : 0,
      size: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
      evictions: this.metrics.evictions
    };
  }

  private async evictLFU(): Promise<void> {
    if (this.frequencyMap.size === 0) return;

    // Find key with minimum frequency
    let minFreq = Infinity;
    let lfuKey = '';

    for (const [key, freq] of this.frequencyMap) {
      if (freq < minFreq) {
        minFreq = freq;
        lfuKey = key;
      }
    }

    if (lfuKey) {
      this.cache.delete(lfuKey);
      this.frequencyMap.delete(lfuKey);
      this.metrics.evictions++;
    }
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, entry] of this.cache) {
      totalSize += key.length * 2;
      totalSize += JSON.stringify(entry.value).length * 2;
      totalSize += 32;
    }
    return totalSize;
  }
}

// TTL Cache Strategy
export class TTLCacheStrategy implements CacheStrategy {
  name = 'ttl';
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout;
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  constructor(cleanupIntervalMs: number = 60000) {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, cleanupIntervalMs);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.metrics.misses++;
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.metrics.hits++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 300000): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.metrics = { hits: 0, misses: 0, evictions: 0 };
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  getMetrics(): CacheMetrics {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate: total > 0 ? this.metrics.hits / total : 0,
      size: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
      evictions: this.metrics.evictions
    };
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    this.metrics.evictions += cleaned;
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, entry] of this.cache) {
      totalSize += key.length * 2;
      totalSize += JSON.stringify(entry.value).length * 2;
      totalSize += 32;
    }
    return totalSize;
  }

  dispose(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Adaptive Cache Strategy
export class AdaptiveCacheStrategy implements CacheStrategy {
  name = 'adaptive';
  private strategies: Map<string, CacheStrategy> = new Map();
  private currentStrategy: CacheStrategy;
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  constructor() {
    this.strategies.set('lru', new LRUCacheStrategy());
    this.strategies.set('lfu', new LFUCacheStrategy());
    this.strategies.set('ttl', new TTLCacheStrategy());

    this.currentStrategy = this.strategies.get('lru')!;

    // Monitor performance and adapt
    setInterval(() => {
      this.adaptStrategy();
    }, 300000); // 5 minutes
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.currentStrategy.get<T>(key);
    if (result) {
      this.metrics.hits++;
    } else {
      this.metrics.misses++;
    }
    return result;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.currentStrategy.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.currentStrategy.delete(key);
  }

  async clear(): Promise<void> {
    await this.currentStrategy.clear();
    this.metrics = { hits: 0, misses: 0, evictions: 0 };
  }

  async has(key: string): Promise<boolean> {
    return this.currentStrategy.has(key);
  }

  async size(): Promise<number> {
    return this.currentStrategy.size();
  }

  getMetrics(): CacheMetrics {
    const strategyMetrics = this.currentStrategy.getMetrics();
    return {
      ...strategyMetrics,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      evictions: this.metrics.evictions
    };
  }

  private adaptStrategy(): void {
    let bestStrategy = this.currentStrategy;
    let bestHitRate = this.currentStrategy.getMetrics().hitRate;

    for (const [name, strategy] of this.strategies) {
      const metrics = strategy.getMetrics();
      if (metrics.hitRate > bestHitRate) {
        bestStrategy = strategy;
        bestHitRate = metrics.hitRate;
      }
    }

    if (bestStrategy !== this.currentStrategy) {
      console.log(`Switching cache strategy from ${this.currentStrategy.name} to ${bestStrategy.name}`);
      this.currentStrategy = bestStrategy;
    }
  }

  dispose(): void {
    for (const strategy of this.strategies.values()) {
      if ('dispose' in strategy && typeof strategy.dispose === 'function') {
        strategy.dispose();
      }
    }
  }
}

// Cache Manager
export class CacheManager {
  private strategies = new Map<string, CacheStrategy>();
  private defaultStrategy: CacheStrategy;

  constructor() {
    this.defaultStrategy = new AdaptiveCacheStrategy();
    this.strategies.set('default', this.defaultStrategy);
    this.strategies.set('lru', new LRUCacheStrategy());
    this.strategies.set('lfu', new LFUCacheStrategy());
    this.strategies.set('ttl', new TTLCacheStrategy());
    this.strategies.set('adaptive', new AdaptiveCacheStrategy());
  }

  getStrategy(name: string = 'default'): CacheStrategy {
    return this.strategies.get(name) || this.defaultStrategy;
  }

  async get<T>(key: string, strategy: string = 'default'): Promise<T | null> {
    return this.getStrategy(strategy).get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number, strategy: string = 'default'): Promise<void> {
    return this.getStrategy(strategy).set(key, value, ttl);
  }

  async delete(key: string, strategy: string = 'default'): Promise<void> {
    return this.getStrategy(strategy).delete(key);
  }

  async clear(strategy: string = 'default'): Promise<void> {
    return this.getStrategy(strategy).clear();
  }

  async has(key: string, strategy: string = 'default'): Promise<boolean> {
    return this.getStrategy(strategy).has(key);
  }

  getMetrics(strategy: string = 'default'): CacheMetrics {
    return this.getStrategy(strategy).getMetrics();
  }

  getAllMetrics(): Record<string, CacheMetrics> {
    const metrics: Record<string, CacheMetrics> = {};
    for (const [name, strategy] of this.strategies) {
      metrics[name] = strategy.getMetrics();
    }
    return metrics;
  }

  dispose(): void {
    for (const strategy of this.strategies.values()) {
      if ('dispose' in strategy && typeof strategy.dispose === 'function') {
        strategy.dispose();
      }
    }
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();
