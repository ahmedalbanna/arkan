/**
 * Tests for retry utility functions
 */

import { withRetry, withRetryParallel, DEFAULT_RETRY_CONFIG } from '../retry-utils';

// Mock logger to avoid console output during tests
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Retry Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await withRetry(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce('success');

      const config = {
        ...DEFAULT_RETRY_CONFIG,
        initialDelayMs: 10, // Speed up tests
      };

      const result = await withRetry(mockFn, config);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should throw immediately on non-retryable error', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValue(new Error('Validation error'));

      await expect(withRetry(mockFn)).rejects.toThrow('Validation error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should exhaust all retry attempts', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValue(new Error('Network timeout'));

      const config = {
        maxAttempts: 3,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
      };

      await expect(withRetry(mockFn, config)).rejects.toThrow('Network timeout');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Rate limit'))
        .mockRejectedValueOnce(new Error('Rate limit'))
        .mockResolvedValueOnce('success');

      const config = {
        maxAttempts: 3,
        initialDelayMs: 100,
        maxDelayMs: 1000,
        backoffMultiplier: 2,
      };

      const startTime = Date.now();
      const result = await withRetry(mockFn, config);
      const duration = Date.now() - startTime;

      expect(result).toBe('success');
      // Should have delays: 100ms + 200ms = 300ms minimum
      expect(duration).toBeGreaterThanOrEqual(290);
    });

    it('should respect max delay', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValueOnce('success');

      const config = {
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 500, // Max is less than initial * backoff
        backoffMultiplier: 10,
      };

      const startTime = Date.now();
      const result = await withRetry(mockFn, config);
      const duration = Date.now() - startTime;

      expect(result).toBe('success');
      // Delays should be capped at maxDelayMs
      expect(duration).toBeLessThan(2000); // Should not reach 1000 + 10000
    });

    it('should handle context parameter for logging', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      await withRetry(mockFn, DEFAULT_RETRY_CONFIG, 'test-section');

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Classification', () => {
    it('should retry on network errors', async () => {
      const errors = [
        new Error('Network error occurred'),
        new Error('Connection timeout'),
        new Error('ECONNREFUSED'),
        new Error('ECONNRESET'),
      ];

      for (const error of errors) {
        const mockFn = jest
          .fn()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        const result = await withRetry(mockFn, {
          ...DEFAULT_RETRY_CONFIG,
          initialDelayMs: 10,
        });

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(2);
        jest.clearAllMocks();
      }
    });

    it('should retry on rate limit errors', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockRejectedValueOnce(new Error('Too many requests'))
        .mockResolvedValueOnce('success');

      const result = await withRetry(mockFn, {
        ...DEFAULT_RETRY_CONFIG,
        initialDelayMs: 10,
      });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should retry on service unavailable', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('503 Service unavailable'))
        .mockResolvedValueOnce('success');

      const result = await withRetry(mockFn, {
        ...DEFAULT_RETRY_CONFIG,
        initialDelayMs: 10,
      });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should retry on model loading', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Model is loading'))
        .mockResolvedValueOnce('success');

      const result = await withRetry(mockFn, {
        ...DEFAULT_RETRY_CONFIG,
        initialDelayMs: 10,
      });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on validation errors', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Invalid input'));

      await expect(
        withRetry(mockFn, {
          ...DEFAULT_RETRY_CONFIG,
          initialDelayMs: 10,
        })
      ).rejects.toThrow('Invalid input');

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on auth errors', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Unauthorized'));

      await expect(
        withRetry(mockFn, {
          ...DEFAULT_RETRY_CONFIG,
          initialDelayMs: 10,
        })
      ).rejects.toThrow('Unauthorized');

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('withRetryParallel', () => {
    it('should execute all functions in parallel', async () => {
      const mockFn1 = jest.fn().mockResolvedValue('result1');
      const mockFn2 = jest.fn().mockResolvedValue('result2');
      const mockFn3 = jest.fn().mockResolvedValue('result3');

      const results = await withRetryParallel([mockFn1, mockFn2, mockFn3]);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ success: true, result: 'result1' });
      expect(results[1]).toEqual({ success: true, result: 'result2' });
      expect(results[2]).toEqual({ success: true, result: 'result3' });
    });

    it('should return partial results when some fail', async () => {
      const mockFn1 = jest.fn().mockResolvedValue('success');
      const mockFn2 = jest.fn().mockRejectedValue(new Error('Failed'));
      const mockFn3 = jest.fn().mockResolvedValue('success');

      const results = await withRetryParallel(
        [mockFn1, mockFn2, mockFn3],
        { ...DEFAULT_RETRY_CONFIG, initialDelayMs: 10 }
      );

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });

    it('should use contexts for each function', async () => {
      const mockFn1 = jest.fn().mockResolvedValue('r1');
      const mockFn2 = jest.fn().mockResolvedValue('r2');

      await withRetryParallel(
        [mockFn1, mockFn2],
        DEFAULT_RETRY_CONFIG,
        ['section1', 'section2']
      );

      expect(mockFn1).toHaveBeenCalled();
      expect(mockFn2).toHaveBeenCalled();
    });
  });
});
