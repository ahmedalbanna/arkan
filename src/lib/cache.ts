
'use client';

import type { SectionName, DiagramType } from '@/ai/schemas';

const CACHE_PREFIX = 'arkan-api-cache-';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export type CacheResult =
  | { type: 'section'; key: SectionName; content: string }
  | {
      type: 'diagram';
      key: DiagramType;
      plantUmlCode: string;
      imageUrl: string;
    };


interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

export function getFromCache<T>(key: string): T | null {
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
    return null;
  }
}

export function saveToCache<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  const entry: CacheEntry<T> = {
    timestamp: Date.now(),
    data,
  };
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (error) {
    console.error('Failed to save to cache:', error);
    // Handle potential storage full errors
  }
}

export async function generateCacheKey(data: object): Promise<string> {
  const jsonString = JSON.stringify(data);
  // Using SubtleCrypto for a more robust hash than simple string manipulation
  const msgUint8 = new TextEncoder().encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
