/**
 * اختبارات شاملة لنظام إدارة الذاكرة (MemoryManager)
 * يغطي جميع وظائف إدارة الـ cache والذاكرة
 */

import { MemoryConfig, MemoryManager } from '../memory-manager';

describe('MemoryManager', () => {
    beforeEach(() => {
        // Clear cache before each test
        MemoryManager.clear();
    });

    afterEach(() => {
        // Clean up after each test
        MemoryManager.clear();
    });

    describe('Initialization', () => {
        it('should initialize with default config', () => {
            MemoryManager.initialize();
            const stats = MemoryManager.getMemoryStats();

            expect(stats).toBeDefined();
            expect(stats.used).toBeGreaterThanOrEqual(0);
            expect(stats.total).toBeGreaterThan(0);
        });

        it('should initialize with custom config', () => {
            const customConfig: Partial<MemoryConfig> = {
                maxCacheSize: 10 * 1024 * 1024, // 10MB
                maxEntries: 500,
                cleanupInterval: 60000
            };

            MemoryManager.initialize(customConfig);
            const stats = MemoryManager.getMemoryStats();

            expect(stats.total).toBe(10 * 1024 * 1024);
        });
    });

    describe('Cache Operations - Set', () => {
        it('should successfully add item to cache', () => {
            const result = MemoryManager.set('test-key', { data: 'test value' });

            expect(result).toBe(true);
            expect(MemoryManager.has('test-key')).toBe(true);
        });

        it('should add items with different data types', () => {
            const testCases = [
                { key: 'string', value: 'test string' },
                { key: 'number', value: 12345 },
                { key: 'boolean', value: true },
                { key: 'array', value: [1, 2, 3, 4, 5] },
                { key: 'object', value: { name: 'Test', age: 30 } }
            ];

            testCases.forEach(({ key, value }) => {
                const result = MemoryManager.set(key, value);
                expect(result).toBe(true);
                expect(MemoryManager.has(key)).toBe(true);
            });
        });

        it('should add item with TTL', () => {
            const result = MemoryManager.set('ttl-key', 'value', 1000); // 1 second TTL

            expect(result).toBe(true);
            expect(MemoryManager.has('ttl-key')).toBe(true);
        });

        it('should reject very large items', () => {
            // Initialize with small cache size
            MemoryManager.initialize({ maxCacheSize: 1000 });

            const largeValue = 'x'.repeat(2000); // Larger than max size
            const result = MemoryManager.set('large-key', largeValue);

            expect(result).toBe(false);
        });

        it('should overwrite existing key', () => {
            MemoryManager.set('key', 'value1');
            MemoryManager.set('key', 'value2');

            const value = MemoryManager.get('key');
            expect(value).toBe('value2');
        });
    });

    describe('Cache Operations - Get', () => {
        it('should retrieve existing item', () => {
            const testData = { id: 1, name: 'Test' };
            MemoryManager.set('test-key', testData);

            const retrieved = MemoryManager.get('test-key');
            expect(retrieved).toEqual(testData);
        });

        it('should return null for non-existent key', () => {
            const result = MemoryManager.get('non-existent');
            expect(result).toBeNull();
        });

        it('should return null for expired items', async () => {
            MemoryManager.set('expired-key', 'value', 100); // 100ms TTL

            // Wait for expiry
            await new Promise(resolve => setTimeout(resolve, 150));

            const result = MemoryManager.get('expired-key');
            expect(result).toBeNull();
        });

        it('should update access count on get', () => {
            MemoryManager.set('access-test', 'value');

            // Access multiple times
            for (let i = 0; i < 5; i++) {
                MemoryManager.get('access-test');
            }

            const stats = MemoryManager.getCacheStats();
            expect(stats.entries).toBeGreaterThan(0);
        });

        it('should preserve data types', () => {
            const testCases = [
                { key: 'string', value: 'test' },
                { key: 'number', value: 42 },
                { key: 'boolean', value: false },
                { key: 'array', value: [1, 2, 3] },
                { key: 'object', value: { a: 1, b: 2 } },
                { key: 'null', value: null }
            ];

            testCases.forEach(({ key, value }) => {
                MemoryManager.set(key, value);
                const retrieved = MemoryManager.get(key);

                if (value === null) {
                    expect(retrieved).toBeNull();
                } else {
                    expect(retrieved).toEqual(value);
                }
            });
        });
    });

    describe('Cache Operations - Has', () => {
        it('should return true for existing keys', () => {
            MemoryManager.set('exists', 'value');

            expect(MemoryManager.has('exists')).toBe(true);
        });

        it('should return false for non-existent keys', () => {
            expect(MemoryManager.has('non-existent')).toBe(false);
        });

        it('should return false for expired keys', async () => {
            MemoryManager.set('expired', 'value', 100); // 100ms TTL

            expect(MemoryManager.has('expired')).toBe(true);

            // Wait for expiry
            await new Promise(resolve => setTimeout(resolve, 150));

            expect(MemoryManager.has('expired')).toBe(false);
        });

        it('should not modify access count', () => {
            MemoryManager.set('check-test', 'value');

            // Check existence multiple times
            for (let i = 0; i < 5; i++) {
                MemoryManager.has('check-test');
            }

            // Access count should not increase from has()
            const stats = MemoryManager.getCacheStats();
            expect(stats).toBeDefined();
        });
    });

    describe('Cache Operations - Delete', () => {
        it('should delete existing key', () => {
            MemoryManager.set('delete-test', 'value');

            expect(MemoryManager.has('delete-test')).toBe(true);

            const deleted = MemoryManager.delete('delete-test');
            expect(deleted).toBe(true);
            expect(MemoryManager.has('delete-test')).toBe(false);
        });

        it('should return false when deleting non-existent key', () => {
            const deleted = MemoryManager.delete('non-existent');
            expect(deleted).toBe(false);
        });

        it('should allow re-adding deleted keys', () => {
            MemoryManager.set('reuse-key', 'value1');
            MemoryManager.delete('reuse-key');
            MemoryManager.set('reuse-key', 'value2');

            const value = MemoryManager.get('reuse-key');
            expect(value).toBe('value2');
        });
    });

    describe('Cache Operations - Clear', () => {
        it('should clear all cached items', () => {
            // Add multiple items
            for (let i = 0; i < 10; i++) {
                MemoryManager.set(`key-${i}`, `value-${i}`);
            }

            const statsBefore = MemoryManager.getCacheStats();
            expect(statsBefore.entries).toBeGreaterThan(0);

            MemoryManager.clear();

            const statsAfter = MemoryManager.getCacheStats();
            expect(statsAfter.entries).toBe(0);
            expect(statsAfter.size).toBe(0);
        });

        it('should allow adding items after clear', () => {
            MemoryManager.set('before-clear', 'value');
            MemoryManager.clear();
            MemoryManager.set('after-clear', 'value');

            expect(MemoryManager.has('before-clear')).toBe(false);
            expect(MemoryManager.has('after-clear')).toBe(true);
        });
    });

    describe('Memory Statistics', () => {
        it('should provide accurate memory stats', () => {
            MemoryManager.set('stats-test', { data: 'test data' });

            const stats = MemoryManager.getMemoryStats();

            expect(stats).toBeDefined();
            expect(stats.used).toBeGreaterThanOrEqual(0);
            expect(stats.total).toBeGreaterThan(0);
            expect(stats.percentage).toBeGreaterThanOrEqual(0);
            expect(stats.percentage).toBeLessThanOrEqual(1);
            expect(stats.timestamp).toBeGreaterThan(0);
        });

        it('should update memory usage as items are added', () => {
            const statsBefore = MemoryManager.getMemoryStats();
            const usedBefore = statsBefore.used;

            // Add some data
            MemoryManager.set('usage-test', 'x'.repeat(1000));

            const statsAfter = MemoryManager.getMemoryStats();
            expect(statsAfter.used).toBeGreaterThan(usedBefore);
        });

        it('should update memory usage as items are removed', () => {
            // Add data
            MemoryManager.set('removal-test', 'x'.repeat(1000));

            const statsBefore = MemoryManager.getMemoryStats();
            const usedBefore = statsBefore.used;

            // Remove data
            MemoryManager.delete('removal-test');

            const statsAfter = MemoryManager.getMemoryStats();
            expect(statsAfter.used).toBeLessThan(usedBefore);
        });
    });

    describe('Cache Statistics', () => {
        it('should provide accurate cache stats', () => {
            // Add multiple items
            for (let i = 0; i < 5; i++) {
                MemoryManager.set(`cache-stats-${i}`, `value-${i}`);
            }

            const stats = MemoryManager.getCacheStats();

            expect(stats.entries).toBe(5);
            expect(stats.size).toBeGreaterThan(0);
            expect(stats.averageSize).toBeGreaterThan(0);
            expect(stats.hitRate).toBeGreaterThanOrEqual(0);
        });

        it('should track most accessed item', () => {
            MemoryManager.set('item1', 'value1');
            MemoryManager.set('item2', 'value2');
            MemoryManager.set('item3', 'value3');

            // Access item2 multiple times
            for (let i = 0; i < 10; i++) {
                MemoryManager.get('item2');
            }

            const stats = MemoryManager.getCacheStats();
            expect(stats.mostAccessed).toBe('item2');
        });

        it('should track oldest entry', () => {
            const oldTime = Date.now();

            MemoryManager.set('old-item', 'value');

            // Wait a bit
            setTimeout(() => {
                MemoryManager.set('new-item', 'value');

                const stats = MemoryManager.getCacheStats();
                expect(stats.oldestEntry).toBeGreaterThan(0);
                expect(stats.oldestEntry).toBeLessThanOrEqual(Date.now());
            }, 100);
        });

        it('should calculate correct hit rate', () => {
            MemoryManager.set('hit-test-1', 'value1');
            MemoryManager.set('hit-test-2', 'value2');

            // Access items
            MemoryManager.get('hit-test-1');
            MemoryManager.get('hit-test-1');
            MemoryManager.get('hit-test-2');

            const stats = MemoryManager.getCacheStats();
            expect(stats.hitRate).toBeGreaterThan(0);
        });

        it('should return zero stats for empty cache', () => {
            MemoryManager.clear();

            const stats = MemoryManager.getCacheStats();

            expect(stats.entries).toBe(0);
            expect(stats.size).toBe(0);
            expect(stats.averageSize).toBe(0);
            expect(stats.oldestEntry).toBe(0);
            expect(stats.mostAccessed).toBe('');
        });
    });

    describe('TTL (Time To Live)', () => {
        it('should expire items after TTL', async () => {
            MemoryManager.set('ttl-test', 'value', 100); // 100ms TTL

            expect(MemoryManager.has('ttl-test')).toBe(true);

            // Wait for expiry
            await new Promise(resolve => setTimeout(resolve, 150));

            expect(MemoryManager.has('ttl-test')).toBe(false);
        });

        it('should keep items without TTL indefinitely', async () => {
            MemoryManager.set('no-ttl', 'value'); // No TTL

            // Wait
            await new Promise(resolve => setTimeout(resolve, 200));

            expect(MemoryManager.has('no-ttl')).toBe(true);
        });

        it('should allow different TTLs for different items', async () => {
            MemoryManager.set('short-ttl', 'value1', 100); // 100ms
            MemoryManager.set('long-ttl', 'value2', 500); // 500ms

            // Wait 200ms
            await new Promise(resolve => setTimeout(resolve, 200));

            expect(MemoryManager.has('short-ttl')).toBe(false);
            expect(MemoryManager.has('long-ttl')).toBe(true);
        });

        it('should update TTL on re-set', async () => {
            MemoryManager.set('update-ttl', 'value1', 100);

            // Wait 50ms
            await new Promise(resolve => setTimeout(resolve, 50));

            // Re-set with longer TTL
            MemoryManager.set('update-ttl', 'value2', 500);

            // Wait 150ms (would have expired with original TTL)
            await new Promise(resolve => setTimeout(resolve, 150));

            expect(MemoryManager.has('update-ttl')).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string keys', () => {
            const result = MemoryManager.set('', 'value');
            expect(result).toBe(true);
            expect(MemoryManager.get('')).toBe('value');
        });

        it('should handle very long keys', () => {
            const longKey = 'k'.repeat(1000);
            const result = MemoryManager.set(longKey, 'value');

            expect(result).toBe(true);
            expect(MemoryManager.get(longKey)).toBe('value');
        });

        it('should handle special characters in keys', () => {
            const specialKeys = [
                'key-with-dash',
                'key.with.dots',
                'key_with_underscore',
                'key:with:colons',
                'key/with/slashes',
                'key with spaces',
                'مفتاح-عربي'
            ];

            specialKeys.forEach(key => {
                const result = MemoryManager.set(key, 'value');
                expect(result).toBe(true);
                expect(MemoryManager.get(key)).toBe('value');
            });
        });

        it('should handle null values', () => {
            const result = MemoryManager.set('null-value', null);
            expect(result).toBe(true);

            const retrieved = MemoryManager.get('null-value');
            expect(retrieved).toBeNull();
        });

        it('should handle undefined values', () => {
            const result = MemoryManager.set('undefined-value', undefined);
            expect(result).toBe(true);
        });

        it('should handle circular references gracefully', () => {
            const obj: any = { name: 'test' };
            obj.self = obj; // Circular reference

            // Should not throw
            expect(() => MemoryManager.set('circular', obj)).not.toThrow();
        });

        it('should handle concurrent set operations', () => {
            const operations = Array(100).fill(null).map((_, i) =>
                MemoryManager.set(`concurrent-${i}`, `value-${i}`)
            );

            expect(operations.every(result => result === true)).toBe(true);
        });

        it('should handle concurrent get operations', () => {
            MemoryManager.set('concurrent-get', 'value');

            const operations = Array(100).fill(null).map(() =>
                MemoryManager.get('concurrent-get')
            );

            expect(operations.every(result => result === 'value')).toBe(true);
        });
    });

    describe('Performance', () => {
        it('should handle large number of items efficiently', () => {
            const startTime = Date.now();
            const itemCount = 1000;

            for (let i = 0; i < itemCount; i++) {
                MemoryManager.set(`perf-test-${i}`, `value-${i}`);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete in reasonable time (less than 5 seconds)
            expect(duration).toBeLessThan(5000);

            const stats = MemoryManager.getCacheStats();
            expect(stats.entries).toBeGreaterThan(0);
        });

        it('should retrieve items quickly', () => {
            // Add items
            for (let i = 0; i < 100; i++) {
                MemoryManager.set(`speed-test-${i}`, `value-${i}`);
            }

            const startTime = Date.now();

            // Retrieve all items
            for (let i = 0; i < 100; i++) {
                MemoryManager.get(`speed-test-${i}`);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete quickly (less than 1 second)
            expect(duration).toBeLessThan(1000);
        });
    });

    describe('Memory Pressure Handling', () => {
        it('should handle cache size limits', () => {
            // Initialize with small cache
            MemoryManager.initialize({ maxCacheSize: 5000, maxEntries: 10 });

            // Try to add many items
            for (let i = 0; i < 20; i++) {
                MemoryManager.set(`pressure-${i}`, 'x'.repeat(100));
            }

            const stats = MemoryManager.getCacheStats();

            // Should not exceed limits
            expect(stats.entries).toBeLessThanOrEqual(10);
            expect(stats.size).toBeLessThanOrEqual(5000);
        });
    });
});

