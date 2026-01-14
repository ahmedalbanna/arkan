/**
 * Flow Configuration Cache
 * 
 * Implements caching layer for flow configurations to improve performance
 * and reduce database queries.
 */

import type { FlowConfig } from '@/lib/models/flow-config';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class FlowConfigCache {
  private cache: Map<string, CacheEntry<FlowConfig>>;
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get flow config from cache
   */
  get(flowName: string): FlowConfig | null {
    const entry = this.cache.get(flowName);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(flowName);
      return null;
    }

    return entry.data;
  }

  /**
   * Set flow config in cache
   */
  set(flowName: string, config: FlowConfig, ttl?: number): void {
    this.cache.set(flowName, {
      data: config,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Delete flow config from cache
   */
  delete(flowName: string): void {
    this.cache.delete(flowName);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const flowConfigCache = new FlowConfigCache();

// Clean expired entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    flowConfigCache.cleanExpired();
  }, 60 * 1000);
}
