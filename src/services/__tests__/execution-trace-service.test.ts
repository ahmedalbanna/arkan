/**
 * Execution Trace Service Tests - ENHANCED
 * 
 * Comprehensive tests for ExecutionTraceService covering:
 * - Trace lifecycle management
 * - Step recording and tracking
 * - Analytics and statistics
 * - Query operations
 * - Error handling
 * - Cleanup operations
 */

import { ExecutionTraceService, type ExecutionTrace, type FlowAnalytics } from '../execution-trace-service';
import { getFirestore } from 'firebase-admin/firestore';

// Mock Firestore
jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn((date) => ({ toDate: () => date }))
  },
  FieldValue: {
    arrayUnion: jest.fn((value) => value)
  }
}));

describe('ExecutionTraceService - Enhanced', () => {
  let service: ExecutionTraceService;
  let mockDb: any;
  let mockDocRef: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDocRef = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          flowId: 'test_flow',
          flowVersion: '1.0.0',
          status: 'running',
          startTime: { toDate: () => new Date('2024-01-01T00:00:00Z') },
          steps: [],
          metrics: { totalTokens: 0, totalCost: 0 }
        })
      }),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDocRef),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [],
        size: 0
      }),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
      runTransaction: jest.fn((callback) => callback({
        get: jest.fn().mockResolvedValue({ 
          exists: false,
          data: () => ({})
        }),
        set: jest.fn(),
        update: jest.fn()
      })),
      batch: jest.fn(() => ({
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      }))
    };

    (getFirestore as jest.Mock).mockReturnValue(mockDb);
    service = new ExecutionTraceService();
  });

  // ============================================================================
  // Trace Lifecycle
  // ============================================================================

  describe('startTrace', () => {
    it('should start a new trace with all required fields', async () => {
      const trace = await service.startTrace('flow_1', '1.0.0', { test: 'input' });

      expect(trace.id).toBeDefined();
      expect(trace.id).toMatch(/^trace_\d+_[a-z0-9]+$/);
      expect(trace.flowId).toBe('flow_1');
      expect(trace.flowVersion).toBe('1.0.0');
      expect(trace.status).toBe('running');
      expect(trace.input).toEqual({ test: 'input' });
      expect(trace.startTime).toBeInstanceOf(Date);
      expect(trace.steps).toEqual([]);
      expect(trace.metrics).toEqual({
        totalTokens: 0,
        totalCost: 0,
        cacheHits: 0,
        cacheMisses: 0
      });
      expect(mockDocRef.set).toHaveBeenCalled();
    });

    it('should include optional user and session info', async () => {
      const trace = await service.startTrace('flow_1', '1.0.0', {}, {
        userId: 'user_123',
        sessionId: 'session_456'
      });

      expect(trace.userId).toBe('user_123');
      expect(trace.sessionId).toBe('session_456');
    });

    it('should work without user and session info', async () => {
      const trace = await service.startTrace('flow_1', '1.0.0', {});

      expect(trace.userId).toBeUndefined();
      expect(trace.sessionId).toBeUndefined();
    });

    it('should generate unique trace IDs', async () => {
      const trace1 = await service.startTrace('flow_1', '1.0.0', {});
      const trace2 = await service.startTrace('flow_1', '1.0.0', {});

      expect(trace1.id).not.toBe(trace2.id);
    });

    it('should handle start trace errors', async () => {
      mockDocRef.set.mockRejectedValue(new Error('Database error'));

      await expect(
        service.startTrace('flow_1', '1.0.0', {})
      ).rejects.toThrow('Failed to start trace');
    });

    it('should handle complex input data', async () => {
      const complexInput = {
        nested: { data: { value: 123 } },
        array: [1, 2, 3],
        text: 'test'
      };

      const trace = await service.startTrace('flow_1', '1.0.0', complexInput);

      expect(trace.input).toEqual(complexInput);
    });
  });

  describe('completeTrace', () => {
    it('should complete trace successfully', async () => {
      await service.completeTrace('trace_1', {
        status: 'success',
        output: { result: 'test' }
      });

      expect(mockDocRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          output: { result: 'test' },
          error: null
        })
      );
    });

    it('should record error on failure', async () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      await service.completeTrace('trace_1', {
        status: 'error',
        error
      });

      expect(mockDocRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          error: expect.objectContaining({
            message: 'Test error',
            stack: 'Error stack trace',
            name: 'Error'
          })
        })
      );
    });

    it('should handle timeout status', async () => {
      await service.completeTrace('trace_1', {
        status: 'timeout'
      });

      expect(mockDocRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'timeout'
        })
      );
    });

    it('should calculate duration correctly', async () => {
      const startTime = new Date('2024-01-01T00:00:00Z');
      mockDocRef.get.mockResolvedValue({
        exists: true,
        data: () => ({
          startTime: { toDate: () => startTime }
        })
      });

      await service.completeTrace('trace_1', {
        status: 'success'
      });

      const callArgs = mockDocRef.update.mock.calls[0][0];
      expect(callArgs.duration).toBeGreaterThan(0);
    });

    it('should include metrics in completion', async () => {
      await service.completeTrace('trace_1', {
        status: 'success',
        metrics: {
          totalTokens: 1500,
          totalCost: 0.05,
          cacheHits: 3,
          cacheMisses: 2
        }
      });

      expect(mockDocRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          metrics: expect.objectContaining({
            totalTokens: 1500,
            totalCost: 0.05
          })
        })
      );
    });

    it('should throw error for non-existent trace', async () => {
      mockDocRef.get.mockResolvedValue({ exists: false });

      await expect(
        service.completeTrace('non_existent', { status: 'success' })
      ).rejects.toThrow('Trace non_existent not found');
    });

    it('should update flow statistics', async () => {
      await service.completeTrace('trace_1', {
        status: 'success',
        output: { result: 'test' }
      });

      expect(mockDb.runTransaction).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Step Recording
  // ============================================================================

  describe('recordStepSuccess', () => {
    it('should record successful step with all details', async () => {
      const startTime = new Date('2024-01-01T00:00:00Z');
      const endTime = new Date('2024-01-01T00:00:05Z');

      await service.recordStepSuccess('trace_1', 'step_1', {
        stepName: 'Test Step',
        startTime,
        endTime,
        duration: 5000,
        input: { data: 'input' },
        output: { result: 'success' },
        metrics: { tokens: 100 }
      });

      expect(mockDocRef.update).toHaveBeenCalled();
    });

    it('should use default values for missing fields', async () => {
      await service.recordStepSuccess('trace_1', 'step_1', {});

      expect(mockDocRef.update).toHaveBeenCalled();
    });

    it('should not throw on record error', async () => {
      mockDocRef.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        service.recordStepSuccess('trace_1', 'step_1', {})
      ).resolves.not.toThrow();
    });
  });

  describe('recordStepError', () => {
    it('should record step error with details', async () => {
      const error = new Error('Step failed');
      error.stack = 'Stack trace';

      await service.recordStepError('trace_1', 'step_1', error);

      expect(mockDocRef.update).toHaveBeenCalled();
    });

    it('should not throw on record error', async () => {
      mockDocRef.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        service.recordStepError('trace_1', 'step_1', new Error('Test'))
      ).resolves.not.toThrow();
    });
  });

  describe('recordSkippedStep', () => {
    it('should record skipped step', async () => {
      await service.recordSkippedStep('trace_1', 'step_1');

      expect(mockDocRef.update).toHaveBeenCalled();
    });

    it('should not throw on record error', async () => {
      mockDocRef.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        service.recordSkippedStep('trace_1', 'step_1')
      ).resolves.not.toThrow();
    });
  });

  describe('recordStepAttempt', () => {
    it('should record retry attempt', async () => {
      const error = new Error('Temporary failure');

      await service.recordStepAttempt('trace_1', 'step_1', 1, error);

      expect(mockDocRef.update).toHaveBeenCalled();
    });

    it('should record multiple attempts', async () => {
      await service.recordStepAttempt('trace_1', 'step_1', 1, new Error('Attempt 1'));
      await service.recordStepAttempt('trace_1', 'step_1', 2, new Error('Attempt 2'));

      expect(mockDocRef.update).toHaveBeenCalledTimes(2);
    });

    it('should not throw on record error', async () => {
      mockDocRef.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        service.recordStepAttempt('trace_1', 'step_1', 1, new Error('Test'))
      ).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // Query Operations
  // ============================================================================

  describe('getTrace', () => {
    it('should retrieve trace by ID', async () => {
      mockDocRef.get.mockResolvedValue({
        exists: true,
        data: () => ({
          id: 'trace_1',
          flowId: 'flow_1',
          flowVersion: '1.0.0',
          status: 'success',
          startTime: { toDate: () => new Date('2024-01-01T00:00:00Z') },
          endTime: { toDate: () => new Date('2024-01-01T00:00:10Z') }
        })
      });

      const trace = await service.getTrace('trace_1');

      expect(trace).toBeDefined();
      expect(trace?.id).toBe('trace_1');
      expect(trace?.flowId).toBe('flow_1');
    });

    it('should return null for non-existent trace', async () => {
      mockDocRef.get.mockResolvedValue({ exists: false });

      const trace = await service.getTrace('non_existent');

      expect(trace).toBeNull();
    });

    it('should handle get errors', async () => {
      mockDocRef.get.mockRejectedValue(new Error('Database error'));

      await expect(
        service.getTrace('trace_1')
      ).rejects.toThrow('Failed to get trace');
    });
  });

  describe('listTraces', () => {
    beforeEach(() => {
      mockCollection.get.mockResolvedValue({
        docs: [
          { data: () => ({ id: 'trace_1', flowId: 'flow_1', startTime: { toDate: () => new Date() } }) },
          { data: () => ({ id: 'trace_2', flowId: 'flow_1', startTime: { toDate: () => new Date() } }) }
        ],
        size: 2
      });
    });

    it('should list traces without filters', async () => {
      const result = await service.listTraces();

      expect(result.traces).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockCollection.orderBy).toHaveBeenCalledWith('startTime', 'desc');
    });

    it('should filter by flowId', async () => {
      await service.listTraces({ flowId: 'flow_1' });

      expect(mockCollection.where).toHaveBeenCalledWith('flowId', '==', 'flow_1');
    });

    it('should filter by userId', async () => {
      await service.listTraces({ userId: 'user_123' });

      expect(mockCollection.where).toHaveBeenCalledWith('userId', '==', 'user_123');
    });

    it('should filter by status', async () => {
      await service.listTraces({ status: 'success' });

      expect(mockCollection.where).toHaveBeenCalledWith('status', '==', 'success');
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await service.listTraces({ startDate, endDate });

      expect(mockCollection.where).toHaveBeenCalledWith('startTime', '>=', expect.anything());
      expect(mockCollection.where).toHaveBeenCalledWith('startTime', '<=', expect.anything());
    });

    it('should apply pagination', async () => {
      await service.listTraces({ limit: 10, offset: 20 });

      expect(mockCollection.limit).toHaveBeenCalledWith(10);
      expect(mockCollection.offset).toHaveBeenCalledWith(20);
    });

    it('should indicate hasMore correctly', async () => {
      mockCollection.get.mockResolvedValue({
        docs: new Array(10).fill({ data: () => ({ startTime: { toDate: () => new Date() } }) }),
        size: 100
      });

      const result = await service.listTraces({ limit: 10, offset: 0 });

      expect(result.hasMore).toBe(true);
    });

    it('should handle list errors', async () => {
      mockCollection.get.mockRejectedValue(new Error('Query failed'));

      await expect(
        service.listTraces()
      ).rejects.toThrow('Failed to list traces');
    });
  });

  describe('getRecentTraces', () => {
    it('should get recent traces for a flow', async () => {
      mockCollection.get.mockResolvedValue({
        docs: [
          { data: () => ({ id: 'trace_1', startTime: { toDate: () => new Date() } }) },
          { data: () => ({ id: 'trace_2', startTime: { toDate: () => new Date() } }) }
        ]
      });

      const traces = await service.getRecentTraces('flow_1', 10);

      expect(traces).toHaveLength(2);
      expect(mockCollection.where).toHaveBeenCalledWith('flowId', '==', 'flow_1');
      expect(mockCollection.limit).toHaveBeenCalledWith(10);
    });

    it('should handle recent traces errors', async () => {
      mockCollection.get.mockRejectedValue(new Error('Query failed'));

      await expect(
        service.getRecentTraces('flow_1')
      ).rejects.toThrow('Failed to get recent traces');
    });
  });

  // ============================================================================
  // Analytics
  // ============================================================================

  describe('getFlowAnalytics', () => {
    it('should calculate comprehensive analytics', async () => {
      mockCollection.get.mockResolvedValue({
        docs: [
          {
            data: () => ({
              status: 'success',
              duration: 1000,
              metrics: { totalTokens: 100, totalCost: 0.01 }
            })
          },
          {
            data: () => ({
              status: 'success',
              duration: 2000,
              metrics: { totalTokens: 200, totalCost: 0.02 }
            })
          },
          {
            data: () => ({
              status: 'error',
              duration: 500,
              metrics: { totalTokens: 50, totalCost: 0.005 }
            })
          }
        ]
      });

      const analytics = await service.getFlowAnalytics('flow_1');

      expect(analytics.flowId).toBe('flow_1');
      expect(analytics.totalExecutions).toBe(3);
      expect(analytics.successfulExecutions).toBe(2);
      expect(analytics.failedExecutions).toBe(1);
      expect(analytics.successRate).toBeCloseTo(0.666, 2);
      expect(analytics.avgDuration).toBeCloseTo(1166.666, 1);
      expect(analytics.minDuration).toBe(500);
      expect(analytics.maxDuration).toBe(2000);
      expect(analytics.totalTokens).toBe(350);
      expect(analytics.totalCost).toBeCloseTo(0.035, 3);
    });

    it('should calculate percentiles correctly', async () => {
      const durations = Array.from({ length: 100 }, (_, i) => i * 10);
      mockCollection.get.mockResolvedValue({
        docs: durations.map(d => ({
          data: () => ({ status: 'success', duration: d })
        }))
      });

      const analytics = await service.getFlowAnalytics('flow_1');

      expect(analytics.p50Duration).toBeGreaterThan(0);
      expect(analytics.p95Duration).toBeGreaterThan(analytics.p50Duration);
      expect(analytics.p99Duration).toBeGreaterThan(analytics.p95Duration);
    });

    it('should handle empty results', async () => {
      mockCollection.get.mockResolvedValue({ docs: [] });

      const analytics = await service.getFlowAnalytics('flow_1');

      expect(analytics.totalExecutions).toBe(0);
      expect(analytics.avgDuration).toBe(0);
      expect(analytics.successRate).toBe(0);
    });

    it('should handle analytics errors', async () => {
      mockCollection.get.mockRejectedValue(new Error('Query failed'));

      await expect(
        service.getFlowAnalytics('flow_1')
      ).rejects.toThrow('Failed to get analytics');
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await service.getFlowAnalytics('flow_1', { startDate, endDate });

      expect(mockCollection.where).toHaveBeenCalledWith('startTime', '>=', expect.anything());
      expect(mockCollection.where).toHaveBeenCalledWith('startTime', '<=', expect.anything());
    });
  });

  // ============================================================================
  // Cleanup Operations
  // ============================================================================

  describe('deleteOldTraces', () => {
    it('should delete traces older than specified days', async () => {
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };

      mockDb.batch.mockReturnValue(mockBatch);
      mockCollection.get.mockResolvedValue({
        docs: [
          { ref: 'ref1' },
          { ref: 'ref2' },
          { ref: 'ref3' }
        ],
        size: 3
      });

      const deletedCount = await service.deleteOldTraces(90);

      expect(deletedCount).toBe(3);
      expect(mockBatch.delete).toHaveBeenCalledTimes(3);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should limit batch delete to 500', async () => {
      await service.deleteOldTraces(30);

      expect(mockCollection.limit).toHaveBeenCalledWith(500);
    });

    it('should handle delete errors', async () => {
      mockCollection.get.mockRejectedValue(new Error('Query failed'));

      await expect(
        service.deleteOldTraces(90)
      ).rejects.toThrow('Failed to delete old traces');
    });
  });
});
