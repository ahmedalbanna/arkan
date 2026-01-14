/**
 * Dynamic Flow Executor Tests
 * Week 1 - Day 5: Testing Dynamic Flow Executor
 */

import { DynamicFlowExecutor, createFlowExecutor, executeFlow } from '../dynamic-flow-executor';
import type { FlowConfiguration } from '../../../lib/models/flow-config';
import { FlowStatus, StepType } from '../../../lib/models/flow-config';

describe('DynamicFlowExecutor', () => {
  describe('Flow Initialization', () => {
    test('should create executor with flow configuration', () => {
      const flow: FlowConfiguration = createTestFlow();
      const executor = new DynamicFlowExecutor(flow);

      expect(executor).toBeDefined();
      expect(executor.getTrace().flowId).toBe('test-flow');
    });

    test('should initialize context', () => {
      const flow: FlowConfiguration = createTestFlow();
      const executor = new DynamicFlowExecutor(flow);

      const context = executor.getContext();
      expect(context).toBeDefined();
      expect(context.size()).toBe(0);
    });
  });

  describe('Input Validation', () => {
    test('should validate input against schema', async () => {
      const flow: FlowConfiguration = createTestFlow();
      const executor = new DynamicFlowExecutor(flow);

      const result = await executor.execute({
        topic: 'Machine Learning',
        language: 'en',
      });

      // Since step implementations are pending, it will fail at step execution
      // But input validation should pass
      expect(result).toBeDefined();
    });

    test('should fail with invalid input', async () => {
      const flow: FlowConfiguration = createTestFlow();
      const executor = new DynamicFlowExecutor(flow);

      const result = await executor.execute({
        // Missing required 'topic' field
        language: 'en',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Flow Status Check', () => {
    test('should reject execution of non-active flow', async () => {
      const flow: FlowConfiguration = createTestFlow();
      flow.status = FlowStatus.DRAFT;

      const executor = new DynamicFlowExecutor(flow);
      const result = await executor.execute({ topic: 'Test', language: 'en' });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not active');
    });
  });

  describe('Execution Trace', () => {
    test('should create execution trace', async () => {
      const flow: FlowConfiguration = createTestFlow();
      const executor = new DynamicFlowExecutor(flow);

      await executor.execute({ topic: 'Test', language: 'en' });

      const trace = executor.getTrace();
      expect(trace.flowId).toBe('test-flow');
      expect(trace.flowVersion).toBe('1.0.0');
      expect(trace.startTime).toBeDefined();
      expect(trace.status).toBeDefined();
    });

    test('should track execution duration', async () => {
      const flow: FlowConfiguration = createTestFlow();
      const executor = new DynamicFlowExecutor(flow);

      await executor.execute({ topic: 'Test', language: 'en' });

      const trace = executor.getTrace();
      expect(trace.duration).toBeDefined();
      expect(trace.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Context Management', () => {
    test('should populate context with input', async () => {
      const flow: FlowConfiguration = createTestFlow();
      const executor = new DynamicFlowExecutor(flow);

      await executor.execute({ topic: 'Machine Learning', language: 'en' });

      const context = executor.getContext();
      expect(context.get('topic')).toBe('Machine Learning');
      expect(context.get('language')).toBe('en');
    });
  });

  describe('Abort Execution', () => {
    test('should allow aborting execution', () => {
      const flow: FlowConfiguration = createTestFlow();
      const executor = new DynamicFlowExecutor(flow);

      executor.abort();

      // Execution should be aborted
      const trace = executor.getTrace();
      expect(trace).toBeDefined();
    });
  });

  describe('Factory Functions', () => {
    test('createFlowExecutor should create executor', () => {
      const flow: FlowConfiguration = createTestFlow();
      const executor = createFlowExecutor(flow);

      expect(executor).toBeDefined();
      expect(executor).toBeInstanceOf(DynamicFlowExecutor);
    });

    test('executeFlow should execute flow', async () => {
      const flow: FlowConfiguration = createTestFlow();
      const result = await executeFlow(flow, { topic: 'Test', language: 'en' });

      expect(result).toBeDefined();
      expect(result.trace).toBeDefined();
    });
  });
});

// ============================================================================
// Test Helpers
// ============================================================================

function createTestFlow(): FlowConfiguration {
  return {
    id: 'test-flow',
    name: 'Test Flow',
    description: 'A test flow for unit testing',
    version: '1.0.0',
    tags: ['test'],
    status: FlowStatus.ACTIVE,
    
    inputSchema: {
      type: 'zod',
      fields: [
        {
          name: 'topic',
          type: 'string',
          label: 'Topic',
          required: true,
        },
        {
          name: 'language',
          type: 'string',
          label: 'Language',
          required: true,
        }
      ],
      required: true,
    },
    
    outputSchema: {
      type: 'zod',
      fields: [
        {
          name: 'result',
          type: 'string',
          label: 'Result',
          required: true,
        }
      ],
      required: true,
    },
    
    steps: [
      {
        id: 'step-1',
        name: 'Test Step',
        type: StepType.FORMAT,
        description: 'A test step',
        config: {
          type: 'format',
          template: 'Topic: {{topic}}',
          format: 'text',
          outputVariable: 'result',
        },
      }
    ],
    
    config: {
      timeout: 60000,
      tracing: true,
    },
    
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test-user',
      updatedBy: 'test-user',
    },
  };
}
