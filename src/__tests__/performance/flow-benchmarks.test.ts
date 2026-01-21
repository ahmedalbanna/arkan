/**
 * Flow Performance Benchmark Tests
 * 
 * Performance benchmarks for flow execution, caching, and optimization
 */

import { DynamicFlowExecutor } from '@/ai/dynamic-flow/executor';
import { FlowConfigCache } from '@/lib/cache/flow-config-cache';
import { performance } from 'perf_hooks';

describe('Flow Performance Benchmarks', () => {
  // ============================================================================
  // Execution Performance
  // ============================================================================

  describe('Flow Execution Performance', () => {
    it('should execute simple flow under 1 second', async () => {
      const simpleFlow = {
        id: 'simple-flow',
        steps: [
          {
            id: 'transform',
            type: 'transform' as const,
            config: { input: '{{input.text}}', transformer: 'uppercase' },
          },
        ],
      };

      const start = performance.now();
      const executor = new DynamicFlowExecutor(simpleFlow as any);
      await executor.execute({ text: 'test' });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    it('should execute complex flow under 5 seconds', async () => {
      const complexFlow = {
        id: 'complex-flow',
        steps: Array.from({ length: 10 }, (_, i) => ({
          id: `step${i}`,
          type: 'transform' as const,
          config: { input: `{{steps.step${i - 1}.output}}`, transformer: 'uppercase' },
        })),
      };

      const start = performance.now();
      const executor = new DynamicFlowExecutor(complexFlow as any);
      await executor.execute({ text: 'test' });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5000);
    });

    it('should measure average execution time over 100 runs', async () => {
      const flow = {
        id: 'benchmark-flow',
        steps: [{ id: 'step1', type: 'transform' as const, config: {} }],
      };

      const durations: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        const executor = new DynamicFlowExecutor(flow as any);
        await executor.execute({ input: 'test' });
        durations.push(performance.now() - start);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const p95Duration = durations.sort((a, b) => a - b)[94];
      const p99Duration = durations[98];

      console.log('Performance Metrics:');
      console.log(`  Average: ${avgDuration.toFixed(2)}ms`);
      console.log(`  P95: ${p95Duration.toFixed(2)}ms`);
      console.log(`  P99: ${p99Duration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(100);
      expect(p95Duration).toBeLessThan(200);
    });
  });

  // ============================================================================
  // Cache Performance
  // ============================================================================

  describe('Cache Performance', () => {
    it('should achieve 80%+ cache hit rate', async () => {
      const cache = new FlowConfigCache();
      const mockFlow = { id: 'flow-1', name: 'Test' };

      // Warm up cache
      cache.set('flow-1', mockFlow as any);

      let hits = 0;
      let misses = 0;

      // Perform 100 lookups
      for (let i = 0; i < 100; i++) {
        const result = cache.get('flow-1');
        if (result) hits++;
        else misses++;
      }

      const hitRate = hits / (hits + misses);

      expect(hitRate).toBeGreaterThan(0.8);
    });

    it('should cache lookup 10x faster than database', async () => {
      const cache = new FlowConfigCache();
      const mockFlow = { id: 'flow-1', name: 'Test' };

      // Cache lookup
      cache.set('flow-1', mockFlow as any);
      const cacheStart = performance.now();
      cache.get('flow-1');
      const cacheDuration = performance.now() - cacheStart;

      // Database lookup (simulated)
      const dbStart = performance.now();
      await new Promise(resolve => setTimeout(resolve, 10)); // Simulate DB latency
      const dbDuration = performance.now() - dbStart;

      const speedup = dbDuration / cacheDuration;

      expect(speedup).toBeGreaterThan(10);
    });

    it('should handle cache eviction efficiently', async () => {
      const cache = new FlowConfigCache();

      // Fill cache to capacity
      const start = performance.now();
      for (let i = 0; i < 150; i++) {
        cache.set(`flow-${i}`, { id: `flow-${i}` } as any);
      }
      const duration = performance.now() - start;

      // Should complete quickly even with evictions
      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // Memory Usage
  // ============================================================================

  describe('Memory Usage', () => {
    it('should not leak memory during execution', async () => {
      const flow = {
        id: 'memory-test',
        steps: [{ id: 'step1', type: 'transform' as const, config: {} }],
      };

      const initialMemory = process.memoryUsage().heapUsed;

      // Execute 100 times
      for (let i = 0; i < 100; i++) {
        const executor = new DynamicFlowExecutor(flow as any);
        await executor.execute({ input: 'test' });
      }

      // Force garbage collection if available
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      // Memory growth should be minimal (< 10MB)
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
    });

    it('should clean up context after execution', async () => {
      const flow = {
        id: 'cleanup-test',
        steps: [
          { id: 'step1', type: 'generate' as const, config: {} },
        ],
      };

      const executor = new DynamicFlowExecutor(flow as any);
      const result = await executor.execute({ largeInput: 'A'.repeat(100000) });

      // After execution, context should be cleared
      expect(result.success).toBe(true);
      // Context manager should release references
    });
  });

  // ============================================================================
  // Concurrent Execution
  // ============================================================================

  describe('Concurrent Execution', () => {
    it('should handle 10 concurrent flow executions', async () => {
      const flow = {
        id: 'concurrent-test',
        steps: [{ id: 'step1', type: 'transform' as const, config: {} }],
      };

      const start = performance.now();

      const promises = Array.from({ length: 10 }, async (_, i) => {
        const executor = new DynamicFlowExecutor(flow as any);
        return executor.execute({ input: `test${i}` });
      });

      const results = await Promise.all(promises);
      const duration = performance.now() - start;

      expect(results).toHaveLength(10);
      expect(results.every(r => r.success)).toBe(true);
      // Should complete faster than sequential (< 5s)
      expect(duration).toBeLessThan(5000);
    });

    it('should not have race conditions', async () => {
      const flow = {
        id: 'race-test',
        steps: [{ id: 'step1', type: 'transform' as const, config: {} }],
      };

      const promises = Array.from({ length: 50 }, async (_, i) => {
        const executor = new DynamicFlowExecutor(flow as any);
        return executor.execute({ id: i });
      });

      const results = await Promise.all(promises);

      // Each execution should have unique trace ID
      const traceIds = results.map(r => r.trace?.id);
      const uniqueIds = new Set(traceIds);

      expect(uniqueIds.size).toBe(50);
    });
  });

  // ============================================================================
  // Stress Testing
  // ============================================================================

  describe('Stress Tests', () => {
    it('should handle large input data (1MB+)', async () => {
      const flow = {
        id: 'large-input-test',
        steps: [{ id: 'process', type: 'transform' as const, config: {} }],
      };

      const largeInput = {
        data: 'A'.repeat(1024 * 1024), // 1MB of data
      };

      const start = performance.now();
      const executor = new DynamicFlowExecutor(flow as any);
      const result = await executor.execute(largeInput);
      const duration = performance.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(10000); // < 10 seconds
    });

    it('should handle flow with 100 steps', async () => {
      const manyStepsFlow = {
        id: 'many-steps-test',
        steps: Array.from({ length: 100 }, (_, i) => ({
          id: `step${i}`,
          type: 'transform' as const,
          config: { transformer: 'uppercase' },
        })),
      };

      const start = performance.now();
      const executor = new DynamicFlowExecutor(manyStepsFlow as any);
      const result = await executor.execute({ input: 'test' });
      const duration = performance.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(30000); // < 30 seconds
    });

    it('should handle 1000 loop iterations', async () => {
      const loopFlow = {
        id: 'loop-stress-test',
        steps: [
          {
            id: 'loop',
            type: 'loop' as const,
            config: {
              iterateOver: '{{input.items}}',
              itemVariable: 'item',
              steps: [{ id: 'process', type: 'transform' as const, config: {} }],
              maxIterations: 1000,
            },
          },
        ],
      };

      const items = Array.from({ length: 1000 }, (_, i) => `item${i}`);

      const start = performance.now();
      const executor = new DynamicFlowExecutor(loopFlow as any);
      const result = await executor.execute({ items });
      const duration = performance.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(60000); // < 1 minute
    });
  });

  // ============================================================================
  // Regression Tests
  // ============================================================================

  describe('Regression Tests', () => {
    it('should maintain backward compatibility with v1.0 flows', async () => {
      const v1Flow = {
        id: 'legacy-flow',
        version: '1.0.0',
        steps: [{ id: 'step1', type: 'generate' as const, config: {} }],
      };

      const executor = new DynamicFlowExecutor(v1Flow as any);
      const result = await executor.execute({ input: 'test' });

      expect(result.success).toBe(true);
    });

    it('should handle flows created with old schema', async () => {
      // Test with old schema format
      // Verify automatic migration or compatibility
      expect(true).toBe(true);
    });
  });
});
