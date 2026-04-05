/**
 * RAG Caching System
 * 
 * Multi-layer caching optimized for high-frequency neural retrieval.
 * Features ultra-fast key generation, deterministic LRU pruning, and hit stats.
 */

import { RAGConfig } from './config';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
}

/**
 * Generic LRU Cache implementation.
 */
class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number;
  private stats: { hits: number; misses: number; evictions: number };

  constructor(maxSize: number = 1000, ttl: number = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    entry.hits++;
    
    // Refresh LRU position
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey) this.cache.delete(firstKey);
      this.stats.evictions++;
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      evictions: this.stats.evictions,
    };
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  prune(): number {
    const now = Date.now();
    let pruned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        pruned++;
      }
    }

    return pruned;
  }
}

/**
 * Embedding Cache — Optimized for raw text vectors.
 */
class EmbeddingCache extends LRUCache<number[]> {
  constructor() {
    super(500, RAGConfig.cache.embeddingCacheTTL);
  }

  /**
   * FASTER KEY GEN — Replaces slow character-loop with simple bitwise string hash.
   */
  private getCacheKey(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0; 
    }
    return `e_${hash}`;
  }

  getEmbedding(text: string): number[] | null {
    return this.get(this.getCacheKey(text));
  }

  setEmbedding(text: string, embedding: number[]): void {
    this.set(this.getCacheKey(text), embedding);
  }
}

/**
 * Search Result Cache — Optimized for project-specific retrieval results.
 */
class SearchCache {
  public cache: LRUCache<any>;

  constructor() {
    this.cache = new LRUCache(200, RAGConfig.cache.searchResultCacheTTL);
  }

  /**
   * DETERMINISTIC FLAT KEY — Replaces deep JSON.stringify with faster flat concatenation.
   */
  private getCacheKey(query: string, options: any = {}): string {
    const q = query.toLowerCase().trim();
    const p = options.projectId || 'global';
    const k = options.topK || 5;
    const s = options.minScore || 0.5;
    
    // Fast flat key
    return `s_${p}_${k}_${s}_${q}`;
  }

  getResults(query: string, options: any = {}): any | null {
    return this.cache.get(this.getCacheKey(query, options));
  }

  setResults(query: string, options: any = {}, results: any): void {
    this.cache.set(this.getCacheKey(query, options), results);
  }

  clearProject(projectId: string): void {
    const prefix = `s_${projectId}_`;
    const keys = this.cache.keys();
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        this.cache['cache'].delete(key);
      }
    }
  }

  getStats(): CacheStats {
    return this.cache.getStats();
  }

  clear(): void {
    this.cache.clear();
  }
}

class CacheManager {
  private embeddingCache: EmbeddingCache;
  private searchCache: SearchCache;
  private pruneInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.embeddingCache = new EmbeddingCache();
    this.searchCache = new SearchCache();
    this.startAutoPrune();
  }

  private startAutoPrune(): void {
    if (this.pruneInterval) clearInterval(this.pruneInterval);

    this.pruneInterval = setInterval(() => {
      this.embeddingCache.prune();
      this.searchCache.cache.prune();
    }, 180000); // More aggressive pruning (3 mins)
  }

  stopAutoPrune(): void {
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval);
      this.pruneInterval = null;
    }
  }

  getEmbeddingCache(): EmbeddingCache { return this.embeddingCache; }
  getSearchCache(): SearchCache { return this.searchCache; }

  getAllStats() {
    const embStats = this.embeddingCache.getStats();
    const searchStats = this.searchCache.getStats();

    return {
      embeddings: embStats,
      searches: searchStats,
      total: {
        size: embStats.size + searchStats.size,
        hitRate: (embStats.hits + searchStats.hits) / (embStats.hits + embStats.misses + searchStats.hits + searchStats.misses) || 0,
      },
    };
  }

  clearAll(): void {
    this.embeddingCache.clear();
    this.searchCache.clear();
  }
}

let cacheManager: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheManager) cacheManager = new CacheManager();
  return cacheManager;
}

export function resetCacheManager(): void {
  if (cacheManager) cacheManager.stopAutoPrune();
  cacheManager = null;
}

export { CacheManager, EmbeddingCache, SearchCache, LRUCache };
export type { CacheStats, CacheEntry };
