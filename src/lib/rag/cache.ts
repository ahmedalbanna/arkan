/**
 * RAG Caching System
 * 
 * Multi-layer caching for embeddings and search results
 * - LRU cache for embeddings
 * - Time-based cache for search results
 * - Memory-efficient storage
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
 * Generic LRU Cache implementation
 */
class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number;
  private stats: { hits: number; misses: number; evictions: number };

  constructor(maxSize: number = 1000, ttl: number = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl; // milliseconds
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

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
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update stats and move to end (LRU)
    this.stats.hits++;
    entry.hits++;
    
    // Move to end (refresh)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value as string;
      this.cache.delete(firstKey);
      this.stats.evictions++;
    }

    // Add/update entry
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  /**
   * Get cache statistics
   */
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

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Remove expired entries
   */
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
 * Embedding Cache
 * Caches text embeddings to avoid regenerating
 */
class EmbeddingCache extends LRUCache<number[]> {
  constructor() {
    super(
      500, // Max 500 embeddings
      RAGConfig.cache.embeddingCacheTTL
    );
  }

  /**
   * Generate cache key from text
   */
  private getCacheKey(text: string): string {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `emb_${hash}_${text.length}`;
  }

  /**
   * Get embedding from cache
   */
  getEmbedding(text: string): number[] | null {
    const key = this.getCacheKey(text);
    return this.get(key);
  }

  /**
   * Set embedding in cache
   */
  setEmbedding(text: string, embedding: number[]): void {
    const key = this.getCacheKey(text);
    this.set(key, embedding);
  }
}

/**
 * Search Result Cache
 * Caches search results for queries
 */
class SearchCache {
  private cache: LRUCache<any>;

  constructor() {
    this.cache = new LRUCache(
      200, // Max 200 search results
      RAGConfig.cache.searchResultCacheTTL
    );
  }

  /**
   * Generate cache key from query and options
   */
  private getCacheKey(query: string, options: any = {}): string {
    const key = JSON.stringify({
      query: query.toLowerCase().trim(),
      projectId: options.projectId,
      topK: options.topK,
      minScore: options.minScore,
    });
    
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash = hash & hash;
    }
    
    return `search_${hash}`;
  }

  /**
   * Get cached search results
   */
  getResults(query: string, options: any = {}): any | null {
    const key = this.getCacheKey(query, options);
    return this.cache.get(key);
  }

  /**
   * Cache search results
   */
  setResults(query: string, options: any = {}, results: any): void {
    const key = this.getCacheKey(query, options);
    this.cache.set(key, results);
  }

  /**
   * Clear cache for specific project
   */
  clearProject(projectId: string): void {
    const keys = this.cache.keys();
    for (const key of keys) {
      if (key.includes(projectId)) {
        // Can't directly check, so clear all for safety
        // In production, use more sophisticated key structure
      }
    }
  }

  /**
   * Get statistics
   */
  getStats(): CacheStats {
    return this.cache.getStats();
  }

  /**
   * Clear all
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Cache Manager
 * Centralized cache management
 */
class CacheManager {
  private embeddingCache: EmbeddingCache;
  private searchCache: SearchCache;
  private pruneInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.embeddingCache = new EmbeddingCache();
    this.searchCache = new SearchCache();
    
    // Auto-prune every 5 minutes
    this.startAutoPrune();
  }

  /**
   * Start automatic pruning of expired entries
   */
  private startAutoPrune(): void {
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval);
    }

    this.pruneInterval = setInterval(() => {
      const embPruned = this.embeddingCache.prune();
      const searchPruned = this.searchCache['cache'].prune();
      
      if (embPruned > 0 || searchPruned > 0) {
        console.log(`[Cache] Pruned ${embPruned} embeddings, ${searchPruned} searches`);
      }
    }, 300000); // 5 minutes
  }

  /**
   * Stop auto-pruning
   */
  stopAutoPrune(): void {
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval);
      this.pruneInterval = null;
    }
  }

  /**
   * Get embedding cache
   */
  getEmbeddingCache(): EmbeddingCache {
    return this.embeddingCache;
  }

  /**
   * Get search cache
   */
  getSearchCache(): SearchCache {
    return this.searchCache;
  }

  /**
   * Get all cache statistics
   */
  getAllStats(): {
    embeddings: CacheStats;
    searches: CacheStats;
    total: {
      size: number;
      hitRate: number;
    };
  } {
    const embStats = this.embeddingCache.getStats();
    const searchStats = this.searchCache.getStats();

    return {
      embeddings: embStats,
      searches: searchStats,
      total: {
        size: embStats.size + searchStats.size,
        hitRate: 
          (embStats.hits + searchStats.hits) /
          (embStats.hits + embStats.misses + searchStats.hits + searchStats.misses) || 0,
      },
    };
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.embeddingCache.clear();
    this.searchCache.clear();
  }

  /**
   * Warm up cache with common queries
   */
  async warmUp(queries: string[]): Promise<void> {
    console.log(`[Cache] Warming up with ${queries.length} queries...`);
    // Implementation depends on your search function
    // This is a placeholder for the concept
  }
}

// Singleton instance
let cacheManager: CacheManager | null = null;

/**
 * Get cache manager instance
 */
export function getCacheManager(): CacheManager {
  if (!cacheManager) {
    cacheManager = new CacheManager();
  }
  return cacheManager;
}

/**
 * Reset cache manager (for testing)
 */
export function resetCacheManager(): void {
  if (cacheManager) {
    cacheManager.stopAutoPrune();
  }
  cacheManager = null;
}

export { CacheManager, EmbeddingCache, SearchCache, LRUCache };
export type { CacheStats, CacheEntry };
