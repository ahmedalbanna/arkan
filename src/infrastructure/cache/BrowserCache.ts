
'use client';

const CACHE_PREFIX = 'arkan-cache-';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

import { injectable } from 'tsyringe';
import { ICacheService } from './ICacheService';

@injectable()
export class BrowserCache implements ICacheService {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const entry = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!entry) return null;

    try {
      const parsed: CacheEntry<T> = JSON.parse(entry);
      if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }
      return parsed.data;
    } catch (error) {
      console.error('Failed to parse cache entry:', error);
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
  }

  set<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return;
    const entry: CacheEntry<T> = {
      timestamp: Date.now(),
      data,
    };
    try {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }

  invalidate(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  }
}
