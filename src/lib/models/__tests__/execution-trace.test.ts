/**
 * Execution Trace Model Tests
 * 
 * Tests for ExecutionTrace type definitions and utility functions
 */

import {
  ExecutionTrace,
  StepTrace,
  StepStatus,
  TraceStatus,
  ExecutionMetrics,
  StepRetryAttempt,
  createExecutionTrace,
  createStepTrace,
  calculateTraceDuration,
  aggregateMetrics,
  isTraceComplete,
  getFailedSteps,
  getSuccessfulSteps,
  getSkippedSteps,
} from '../execution-trace';

describe('Execution Trace Model', () => {
  // ============================================================================
  // Trace Creation
  // ============================================================================

  describe('createExecutionTrace', () => {
    it('should create valid execution trace', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', { input: 'test' });

      expect(trace.id).toBeDefined();
      expect(trace.id).toMatch(/^trace_/);
      expect(trace.flowId).toBe('flow-1');
      expect(trace.flowVersion).toBe('1.0.0');
      expect(trace.status).toBe('running');
      expect(trace.input).toEqual({ input: 'test' });
      expect(trace.startTime).toBeInstanceOf(Date);
      expect(trace.steps).toEqual([]);
      expect(trace.metrics).toBeDefined();
    });

    it('should generate unique trace IDs', () => {
      const trace1 = createExecutionTrace('flow-1', '1.0.0', {});
      const trace2 = createExecutionTrace('flow-1', '1.0.0', {});

      expect(trace1.id).not.toBe(trace2.id);
    });

    it('should include optional userId', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {}, 'user-123');

      expect(trace.userId).toBe('user-123');
    });

    it('should include optional sessionId', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {}, 'user-123', 'session-456');

      expect(trace.sessionId).toBe('session-456');
    });

    it('should initialize default metrics', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});

      expect(trace.metrics.totalTokens).toBe(0);
      expect(trace.metrics.totalCost).toBe(0);
      expect(trace.metrics.cacheHits).toBe(0);
      expect(trace.metrics.cacheMisses).toBe(0);
    });

    it('should set running status by default', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});

      expect(trace.status).toBe('running');
      expect(trace.endTime).toBeUndefined();
      expect(trace.duration).toBeUndefined();
    });
  });

  describe('createStepTrace', () => {
    it('should create valid step trace', () => {
      const step = createStepTrace('step-1', 'retrieve', 'Retrieve Data');

      expect(step.stepId).toBe('step-1');
      expect(step.stepType).toBe('retrieve');
      expect(step.stepName).toBe('Retrieve Data');
      expect(step.status).toBe('pending');
      expect(step.startTime).toBeInstanceOf(Date);
      expect(step.attempts).toEqual([]);
    });

    it('should set pending status by default', () => {
      const step = createStepTrace('step-1', 'generate', 'Generate');

      expect(step.status).toBe('pending');
      expect(step.endTime).toBeUndefined();
      expect(step.duration).toBeUndefined();
    });

    it('should support different step types', () => {
      const types = ['retrieve', 'generate', 'tool', 'format', 'transform', 'condition', 'loop'] as const;

      types.forEach(type => {
        const step = createStepTrace('step-1', type, 'Test');
        expect(step.stepType).toBe(type);
      });
    });
  });

  // ============================================================================
  // Trace Status Management
  // ============================================================================

  describe('isTraceComplete', () => {
    it('should return false for running trace', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.status = 'running';

      expect(isTraceComplete(trace)).toBe(false);
    });

    it('should return true for success status', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.status = 'success';
      trace.endTime = new Date();

      expect(isTraceComplete(trace)).toBe(true);
    });

    it('should return true for error status', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.status = 'error';
      trace.endTime = new Date();
      trace.error = { message: 'Failed', name: 'Error' };

      expect(isTraceComplete(trace)).toBe(true);
    });

    it('should return true for timeout status', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.status = 'timeout';
      trace.endTime = new Date();

      expect(isTraceComplete(trace)).toBe(true);
    });

    it('should return true for cancelled status', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.status = 'cancelled';
      trace.endTime = new Date();

      expect(isTraceComplete(trace)).toBe(true);
    });
  });

  // ============================================================================
  // Duration Calculation
  // ============================================================================

  describe('calculateTraceDuration', () => {
    it('should calculate duration for completed trace', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.startTime = new Date('2024-01-01T00:00:00Z');
      trace.endTime = new Date('2024-01-01T00:00:05Z');

      const duration = calculateTraceDuration(trace);

      expect(duration).toBe(5000); // 5 seconds in milliseconds
    });

    it('should return undefined for running trace', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.status = 'running';
      trace.endTime = undefined;

      const duration = calculateTraceDuration(trace);

      expect(duration).toBeUndefined();
    });

    it('should handle very short durations', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.startTime = new Date('2024-01-01T00:00:00.000Z');
      trace.endTime = new Date('2024-01-01T00:00:00.100Z');

      const duration = calculateTraceDuration(trace);

      expect(duration).toBe(100); // 100ms
    });

    it('should handle long durations', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.startTime = new Date('2024-01-01T00:00:00Z');
      trace.endTime = new Date('2024-01-01T01:00:00Z');

      const duration = calculateTraceDuration(trace);

      expect(duration).toBe(3600000); // 1 hour
    });

    it('should use trace.duration if available', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.duration = 1234;

      const duration = calculateTraceDuration(trace);

      expect(duration).toBe(1234);
    });
  });

  // ============================================================================
  // Step Filtering
  // ============================================================================

  describe('getSuccessfulSteps', () => {
    it('should return only successful steps', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.steps = [
        { ...createStepTrace('step-1', 'retrieve', 'Step 1'), status: 'success' },
        { ...createStepTrace('step-2', 'generate', 'Step 2'), status: 'error' },
        { ...createStepTrace('step-3', 'tool', 'Step 3'), status: 'success' },
        { ...createStepTrace('step-4', 'format', 'Step 4'), status: 'skipped' },
      ];

      const successful = getSuccessfulSteps(trace);

      expect(successful).toHaveLength(2);
      expect(successful[0].stepId).toBe('step-1');
      expect(successful[1].stepId).toBe('step-3');
    });

    it('should return empty array when no successful steps', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.steps = [
        { ...createStepTrace('step-1', 'retrieve', 'Step 1'), status: 'error' },
        { ...createStepTrace('step-2', 'generate', 'Step 2'), status: 'skipped' },
      ];

      const successful = getSuccessfulSteps(trace);

      expect(successful).toHaveLength(0);
    });

    it('should return empty array for trace with no steps', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});

      const successful = getSuccessfulSteps(trace);

      expect(successful).toEqual([]);
    });
  });

  describe('getFailedSteps', () => {
    it('should return only failed steps', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.steps = [
        { ...createStepTrace('step-1', 'retrieve', 'Step 1'), status: 'success' },
        { ...createStepTrace('step-2', 'generate', 'Step 2'), status: 'error' },
        { ...createStepTrace('step-3', 'tool', 'Step 3'), status: 'error' },
        { ...createStepTrace('step-4', 'format', 'Step 4'), status: 'skipped' },
      ];

      const failed = getFailedSteps(trace);

      expect(failed).toHaveLength(2);
      expect(failed[0].stepId).toBe('step-2');
      expect(failed[1].stepId).toBe('step-3');
    });

    it('should return empty array when no failed steps', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.steps = [
        { ...createStepTrace('step-1', 'retrieve', 'Step 1'), status: 'success' },
        { ...createStepTrace('step-2', 'generate', 'Step 2'), status: 'success' },
      ];

      const failed = getFailedSteps(trace);

      expect(failed).toHaveLength(0);
    });
  });

  describe('getSkippedSteps', () => {
    it('should return only skipped steps', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.steps = [
        { ...createStepTrace('step-1', 'retrieve', 'Step 1'), status: 'success' },
        { ...createStepTrace('step-2', 'generate', 'Step 2'), status: 'skipped' },
        { ...createStepTrace('step-3', 'tool', 'Step 3'), status: 'error' },
        { ...createStepTrace('step-4', 'format', 'Step 4'), status: 'skipped' },
      ];

      const skipped = getSkippedSteps(trace);

      expect(skipped).toHaveLength(2);
      expect(skipped[0].stepId).toBe('step-2');
      expect(skipped[1].stepId).toBe('step-4');
    });

    it('should return empty array when no skipped steps', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.steps = [
        { ...createStepTrace('step-1', 'retrieve', 'Step 1'), status: 'success' },
        { ...createStepTrace('step-2', 'generate', 'Step 2'), status: 'error' },
      ];

      const skipped = getSkippedSteps(trace);

      expect(skipped).toHaveLength(0);
    });
  });

  // ============================================================================
  // Metrics Aggregation
  // ============================================================================

  describe('aggregateMetrics', () => {
    it('should aggregate metrics from multiple steps', () => {
      const steps: StepTrace[] = [
        {
          ...createStepTrace('step-1', 'retrieve', 'Step 1'),
          status: 'success',
          metrics: { tokens: 100, cost: 0.01, cacheHit: true },
        },
        {
          ...createStepTrace('step-2', 'generate', 'Step 2'),
          status: 'success',
          metrics: { tokens: 500, cost: 0.05, cacheHit: false },
        },
        {
          ...createStepTrace('step-3', 'tool', 'Step 3'),
          status: 'success',
          metrics: { tokens: 200, cost: 0.02, cacheHit: true },
        },
      ];

      const metrics = aggregateMetrics(steps);

      expect(metrics.totalTokens).toBe(800);
      expect(metrics.totalCost).toBeCloseTo(0.08, 3);
      expect(metrics.cacheHits).toBe(2);
      expect(metrics.cacheMisses).toBe(1);
    });

    it('should handle steps without metrics', () => {
      const steps: StepTrace[] = [
        {
          ...createStepTrace('step-1', 'retrieve', 'Step 1'),
          status: 'success',
        },
        {
          ...createStepTrace('step-2', 'generate', 'Step 2'),
          status: 'success',
          metrics: { tokens: 100, cost: 0.01 },
        },
      ];

      const metrics = aggregateMetrics(steps);

      expect(metrics.totalTokens).toBe(100);
      expect(metrics.totalCost).toBe(0.01);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
    });

    it('should return zero metrics for empty steps', () => {
      const metrics = aggregateMetrics([]);

      expect(metrics.totalTokens).toBe(0);
      expect(metrics.totalCost).toBe(0);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
    });

    it('should handle only cache misses', () => {
      const steps: StepTrace[] = [
        {
          ...createStepTrace('step-1', 'generate', 'Step 1'),
          status: 'success',
          metrics: { tokens: 100, cost: 0.01, cacheHit: false },
        },
        {
          ...createStepTrace('step-2', 'generate', 'Step 2'),
          status: 'success',
          metrics: { tokens: 200, cost: 0.02, cacheHit: false },
        },
      ];

      const metrics = aggregateMetrics(steps);

      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(2);
    });
  });

  // ============================================================================
  // Step Retry Attempts
  // ============================================================================

  describe('Step retry attempts', () => {
    it('should track retry attempts', () => {
      const step = createStepTrace('step-1', 'generate', 'Generate');
      const attempt: StepRetryAttempt = {
        attemptNumber: 1,
        timestamp: new Date(),
        error: { message: 'Temporary failure', name: 'Error' },
      };

      step.attempts = [attempt];

      expect(step.attempts).toHaveLength(1);
      expect(step.attempts[0].attemptNumber).toBe(1);
      expect(step.attempts[0].error?.message).toBe('Temporary failure');
    });

    it('should track multiple retry attempts', () => {
      const step = createStepTrace('step-1', 'generate', 'Generate');
      step.attempts = [
        {
          attemptNumber: 1,
          timestamp: new Date('2024-01-01T00:00:01Z'),
          error: { message: 'Attempt 1 failed', name: 'Error' },
        },
        {
          attemptNumber: 2,
          timestamp: new Date('2024-01-01T00:00:02Z'),
          error: { message: 'Attempt 2 failed', name: 'Error' },
        },
        {
          attemptNumber: 3,
          timestamp: new Date('2024-01-01T00:00:03Z'),
          error: { message: 'Attempt 3 failed', name: 'Error' },
        },
      ];

      expect(step.attempts).toHaveLength(3);
      expect(step.attempts[2].attemptNumber).toBe(3);
    });

    it('should include error details in attempts', () => {
      const step = createStepTrace('step-1', 'tool', 'Call Tool');
      const attempt: StepRetryAttempt = {
        attemptNumber: 1,
        timestamp: new Date(),
        error: {
          message: 'Network timeout',
          name: 'TimeoutError',
          stack: 'Error: Network timeout\n    at ...',
        },
      };

      step.attempts = [attempt];

      expect(step.attempts[0].error?.name).toBe('TimeoutError');
      expect(step.attempts[0].error?.stack).toBeDefined();
    });
  });

  // ============================================================================
  // Trace Error Tracking
  // ============================================================================

  describe('Trace error tracking', () => {
    it('should track trace-level errors', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.status = 'error';
      trace.error = {
        message: 'Flow execution failed',
        name: 'ExecutionError',
        stack: 'Error: Flow execution failed\n    at ...',
      };

      expect(trace.error.message).toBe('Flow execution failed');
      expect(trace.error.name).toBe('ExecutionError');
      expect(trace.error.stack).toBeDefined();
    });

    it('should track step-level errors', () => {
      const step = createStepTrace('step-1', 'generate', 'Generate');
      step.status = 'error';
      step.error = {
        message: 'Generation failed',
        name: 'GenerationError',
      };

      expect(step.error.message).toBe('Generation failed');
      expect(step.error.name).toBe('GenerationError');
    });
  });

  // ============================================================================
  // Type Definitions
  // ============================================================================

  describe('Type definitions', () => {
    it('should enforce TraceStatus values', () => {
      const statuses: TraceStatus[] = ['running', 'success', 'error', 'timeout', 'cancelled'];

      statuses.forEach(status => {
        const trace = createExecutionTrace('flow-1', '1.0.0', {});
        trace.status = status;
        expect(trace.status).toBe(status);
      });
    });

    it('should enforce StepStatus values', () => {
      const statuses: StepStatus[] = ['pending', 'running', 'success', 'error', 'skipped'];

      statuses.forEach(status => {
        const step = createStepTrace('step-1', 'generate', 'Test');
        step.status = status;
        expect(step.status).toBe(status);
      });
    });

    it('should support all step types', () => {
      const types = ['retrieve', 'generate', 'tool', 'format', 'transform', 'condition', 'loop'] as const;

      types.forEach(type => {
        const step = createStepTrace('step-1', type, 'Test');
        expect(step.stepType).toBe(type);
      });
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle trace with many steps', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.steps = Array.from({ length: 100 }, (_, i) =>
        createStepTrace(`step-${i}`, 'generate', `Step ${i}`)
      );

      expect(trace.steps).toHaveLength(100);
    });

    it('should handle very large input data', () => {
      const largeInput = { data: 'A'.repeat(100000) };
      const trace = createExecutionTrace('flow-1', '1.0.0', largeInput);

      expect(trace.input.data.length).toBe(100000);
    });

    it('should handle very large output data', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.output = { result: 'B'.repeat(50000) };

      expect(trace.output.result.length).toBe(50000);
    });

    it('should handle Unicode in input/output', () => {
      const input = { text: '你好世界 مرحبا 🚀' };
      const trace = createExecutionTrace('flow-1', '1.0.0', input);
      trace.output = { result: '测试结果 ✓' };

      expect(trace.input.text).toBe('你好世界 مرحبا 🚀');
      expect(trace.output.result).toBe('测试结果 ✓');
    });

    it('should handle zero duration', () => {
      const trace = createExecutionTrace('flow-1', '1.0.0', {});
      trace.startTime = new Date('2024-01-01T00:00:00.000Z');
      trace.endTime = new Date('2024-01-01T00:00:00.000Z');

      const duration = calculateTraceDuration(trace);

      expect(duration).toBe(0);
    });

    it('should handle high precision metrics', () => {
      const metrics = aggregateMetrics([
        {
          ...createStepTrace('step-1', 'generate', 'Step 1'),
          status: 'success',
          metrics: { tokens: 123, cost: 0.0123456789 },
        },
        {
          ...createStepTrace('step-2', 'generate', 'Step 2'),
          status: 'success',
          metrics: { tokens: 456, cost: 0.0456789123 },
        },
      ]);

      expect(metrics.totalTokens).toBe(579);
      expect(metrics.totalCost).toBeCloseTo(0.0580245912, 10);
    });
  });
});
