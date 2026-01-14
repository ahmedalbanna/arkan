/**
 * Execution Trace Service Tests
 */

import { ExecutionTraceService } from '../execution-trace-service';
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

describe('ExecutionTraceService', () => {
  let service: ExecutionTraceService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          flowId: 'test_flow',
          status: 'running',
          startTime: { toDate: () => new Date() }
        })
      }),
      update: jest.fn().mockResolvedValue(undefined),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      runTransaction: jest.fn((callback) => callback({
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn(),
        update: jest.fn()
      }))
    };

    (getFirestore as jest.Mock).mockReturnValue(mockDb);
    service = new ExecutionTraceService();
  });

  describe('startTrace', () => {
    it('should start a new trace', async () => {
      const trace = await service.startTrace('flow_1', '1.0.0', { test: 'input' });

      expect(trace.id).toBeDefined();
      expect(trace.flowId).toBe('flow_1');
      expect(trace.flowVersion).toBe('1.0.0');
      expect(trace.status).toBe('running');
      expect(mockDb.set).toHaveBeenCalled();
    });

    it('should include user and session info', async () => {
      const trace = await service.startTrace('flow_1', '1.0.0', {}, {
        userId: 'user_123',
        sessionId: 'session_456'
      });

      expect(trace.userId).toBe('user_123');
      expect(trace.sessionId).toBe('session_456');
    });
  });

  describe('completeTrace', () => {
    it('should complete trace successfully', async () => {
      await service.completeTrace('trace_1', {
        status: 'success',
        output: { result: 'test' }
      });

      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should record error on failure', async () => {
      const error = new Error('Test error');
      await service.completeTrace('trace_1', {
        status: 'error',
        error
      });

      expect(mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          error: expect.objectContaining({
            message: 'Test error'
          })
        })
      );
    });
  });

  describe('recordStepSuccess', () => {
    it('should record successful step', async () => {
      await service.recordStepSuccess('trace_1', 'step_1', {
        stepName: 'Test Step',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        output: { result: 'success' }
      });

      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('getFlowAnalytics', () => {
    it('should calculate analytics', async () => {
      mockDb.get.mockResolvedValue({
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
              duration: 500
            })
          }
        ]
      });

      const analytics = await service.getFlowAnalytics('flow_1');

      expect(analytics.totalExecutions).toBe(3);
      expect(analytics.successfulExecutions).toBe(2);
      expect(analytics.failedExecutions).toBe(1);
      expect(analytics.successRate).toBeCloseTo(0.666, 2);
      expect(analytics.avgDuration).toBeGreaterThan(0);
    });
  });
});
