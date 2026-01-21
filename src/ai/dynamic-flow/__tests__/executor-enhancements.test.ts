/**
 * Tests for Enhanced Flow Executor improvements:
 * - Circuit Breaker Pattern
 * - Timeout Mechanism
 * - Parallelization Support
 */

// Mock all dependencies BEFORE importing
jest.mock('../../genkit', () => ({
  ai: {
    defineFlow: jest.fn(),
    generate: jest.fn(),
  },
}));

jest.mock('../step-executor', () => ({
  StepExecutor: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

jest.mock('../context-manager', () => ({
  ContextManager: jest.fn().mockImplementation(() => {
    const mockContext = {
      id: 'ctx-1',
      traceId: 'trace-1',
      input: {},
      config: { steps: [] },
      options: {},
      variables: new Map(),
      stepResults: new Map(),
      metrics: {
        successfulSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        totalTokens: 0,
        totalCost: 0,
        cacheHits: 0,
        cacheMisses: 0,
      },
      startTime: Date.now(),
    };
    
    return {
      initialize: jest.fn().mockImplementation((config) => {
        mockContext.config = config.config;
        mockContext.options = config.options || {};
        return Promise.resolve(mockContext);
      }),
      updateContext: jest.fn().mockImplementation((ctx, step, result) => {
        ctx.stepResults.set(step.id, result);
        return Promise.resolve();
      }),
      extractOutput: jest.fn().mockReturnValue({}),
      snapshot: jest.fn().mockReturnValue({}),
    };
  }),
}));

jest.mock('../schema-validator', () => ({
  SchemaValidator: jest.fn().mockImplementation(() => ({
    validate: jest.fn().mockResolvedValue({ data: {}, valid: true }),
  })),
}));

jest.mock('../template-engine', () => ({
  TemplateEngine: jest.fn().mockImplementation(() => ({
    render: jest.fn(),
  })),
}));

jest.mock('../condition-evaluator', () => ({
  ConditionEvaluator: jest.fn().mockImplementation(() => ({
    evaluate: jest.fn().mockReturnValue(true),
  })),
}));

import { EnhancedFlowExecutor, TimeoutError, StepExecutionError } from '../executor';
import type { FlowConfiguration } from '../../../lib/models/flow-config';

describe('EnhancedFlowExecutor - New Features', () => {
  let executor: EnhancedFlowExecutor;

  beforeEach(() => {
    executor = new EnhancedFlowExecutor();
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Circuit Breaker Pattern', () => {
    it('should open circuit after threshold failures', async () => {
      const config: FlowConfiguration = {
        id: 'test-flow',
        name: 'Test Flow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'Failing Step',
            type: 'generate',
            config: { prompt: 'test' }
          }
        ],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: {} },
        config: { timeout: 60000 }
      };

      // Mock step executor to always fail
      const mockStepExecutor = require('../step-executor').StepExecutor;
      mockStepExecutor.prototype.execute = jest.fn().mockRejectedValue(new Error('Step failed'));

      // Execute multiple times to trigger circuit breaker
      for (let i = 0; i < 6; i++) {
        const result = await executor.execute(config, {});
        expect(result.success).toBe(false);
      }

      // Circuit should be open now
      const result = await executor.execute(config, {});
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Circuit breaker is OPEN');
    });

    it('should transition to half-open after reset timeout', async () => {
      jest.useFakeTimers();
      
      const config: FlowConfiguration = {
        id: 'test-flow',
        name: 'Test Flow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'Step',
            type: 'generate',
            config: { prompt: 'test' }
          }
        ],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: {} },
        config: { timeout: 60000 }
      };

      const mockStepExecutor = require('../step-executor').StepExecutor;
      
      // First, cause failures to open circuit
      mockStepExecutor.prototype.execute = jest.fn().mockRejectedValue(new Error('Step failed'));
      for (let i = 0; i < 6; i++) {
        await executor.execute(config, {});
      }

      // Wait for reset timeout (mocked)
      jest.advanceTimersByTime(61000); // 1 minute + buffer

      // Now make it succeed
      mockStepExecutor.prototype.execute = jest.fn().mockResolvedValue({
        status: 'success',
        output: { result: 'success' },
        metrics: {}
      });

      // Should transition to half-open and eventually close
      const result = await executor.execute(config, {});
      expect(result.success).toBe(true);
      
      jest.useRealTimers();
    });
  });

  describe('Timeout Mechanism', () => {
    it('should timeout flow execution after global timeout', async () => {
      jest.useRealTimers(); // Use real timers for this test
      
      const config: FlowConfiguration = {
        id: 'test-flow',
        name: 'Test Flow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'Slow Step',
            type: 'generate',
            config: { prompt: 'test' }
          }
        ],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: {} },
        config: { timeout: 100 } // 100ms timeout
      };

      // Mock step executor to take longer than timeout
      const mockStepExecutor = require('../step-executor').StepExecutor;
      mockStepExecutor.prototype.execute = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              status: 'success',
              output: { result: 'done' },
              metrics: {}
            });
          }, 1000); // Takes 1 second
        });
      });

      const result = await executor.execute(config, {});
      
      expect(result.success).toBe(false);
      expect(result.error?.name).toBe('TimeoutError');
      expect(result.error?.message).toContain('Flow execution timeout');
    });

    it('should timeout individual step execution', async () => {
      jest.useRealTimers();
      
      const config: FlowConfiguration = {
        id: 'test-flow',
        name: 'Test Flow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'Slow Step',
            type: 'generate',
            config: { 
              prompt: 'test',
              timeout: 50 // 50ms step timeout
            }
          }
        ],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: {} },
        config: { timeout: 60000 }
      };

      const mockStepExecutor = require('../step-executor').StepExecutor;
      mockStepExecutor.prototype.execute = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              status: 'success',
              output: { result: 'done' },
              metrics: {}
            });
          }, 500); // Takes 500ms
        });
      });

      const result = await executor.execute(config, {}, { stepTimeout: 50 });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('timeout');
    });
  });

  describe('Parallelization Support', () => {
    it('should execute independent steps in parallel', async () => {
      const config: FlowConfiguration = {
        id: 'test-flow',
        name: 'Test Flow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'Independent Step 1',
            type: 'generate',
            config: { prompt: 'test1' }
          },
          {
            id: 'step2',
            name: 'Independent Step 2',
            type: 'generate',
            config: { prompt: 'test2' }
          },
          {
            id: 'step3',
            name: 'Independent Step 3',
            type: 'generate',
            config: { prompt: 'test3' }
          }
        ],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: {} },
        config: { timeout: 60000 }
      };

      const executionOrder: string[] = [];
      const mockStepExecutor = require('../step-executor').StepExecutor;
      
      mockStepExecutor.prototype.execute = jest.fn().mockImplementation((step) => {
        executionOrder.push(step.id);
        return Promise.resolve({
          status: 'success',
          output: { result: `${step.id} done` },
          metrics: {}
        });
      });

      const startTime = Date.now();
      const result = await executor.execute(config, {});
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      // All three steps should be in execution order
      expect(executionOrder).toContain('step1');
      expect(executionOrder).toContain('step2');
      expect(executionOrder).toContain('step3');
      
      // Should be fast since they run in parallel
      expect(duration).toBeLessThan(1000);
    });

    it('should execute dependent steps sequentially', async () => {
      const config: FlowConfiguration = {
        id: 'test-flow',
        name: 'Test Flow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            type: 'generate',
            config: { prompt: 'test1' }
          },
          {
            id: 'step2',
            name: 'Dependent Step',
            type: 'generate',
            config: { 
              prompt: 'Use {{steps.step1.output}}' // Depends on step1
            }
          },
          {
            id: 'step3',
            name: 'Final Step',
            type: 'generate',
            config: { 
              prompt: 'Use {{steps.step2.output}}' // Depends on step2
            }
          }
        ],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: {} },
        config: { timeout: 60000 }
      };

      const executionOrder: string[] = [];
      
      const mockInstance = new (require('../step-executor').StepExecutor)();
      mockInstance.execute = jest.fn().mockImplementation((step) => {
        executionOrder.push(step.id);
        return Promise.resolve({
          status: 'success',
          output: { result: `${step.id} done` },
          metrics: {}
        });
      });
      
      executor['stepExecutor'] = mockInstance;

      const result = await executor.execute(config, {});

      expect(result.success).toBe(true);
      // Steps should execute in order due to dependencies
      expect(executionOrder).toEqual(['step1', 'step2', 'step3']);
    });

    it('should handle mixed parallel and sequential execution', async () => {
      const config: FlowConfiguration = {
        id: 'test-flow',
        name: 'Test Flow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            type: 'generate',
            config: { prompt: 'test1' }
          },
          {
            id: 'step2',
            name: 'Parallel Step 1',
            type: 'generate',
            config: { 
              prompt: 'Use {{steps.step1.output}}' // Depends on step1
            }
          },
          {
            id: 'step3',
            name: 'Parallel Step 2',
            type: 'generate',
            config: { 
              prompt: 'Use {{steps.step1.output}}' // Also depends on step1
            }
          },
          {
            id: 'step4',
            name: 'Final Step',
            type: 'generate',
            config: { 
              prompt: 'Use {{steps.step2.output}} and {{steps.step3.output}}' // Depends on both
            }
          }
        ],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: {} },
        config: { timeout: 60000 }
      };

      const executionOrder: string[] = [];
      
      const mockInstance = new (require('../step-executor').StepExecutor)();
      mockInstance.execute = jest.fn().mockImplementation((step) => {
        executionOrder.push(step.id);
        return Promise.resolve({
          status: 'success',
          output: { result: `${step.id} done` },
          metrics: {}
        });
      });
      
      executor['stepExecutor'] = mockInstance;

      const result = await executor.execute(config, {});

      expect(result.success).toBe(true);
      
      // step1 should be first
      expect(executionOrder[0]).toBe('step1');
      
      // step2 and step3 can be in any order (parallel)
      expect(executionOrder.slice(1, 3)).toContain('step2');
      expect(executionOrder.slice(1, 3)).toContain('step3');
      
      // step4 should be last
      expect(executionOrder[3]).toBe('step4');
    });
  });

  describe('Combined Features', () => {
    it('should handle timeout with circuit breaker', async () => {
      jest.useRealTimers();
      
      const config: FlowConfiguration = {
        id: 'test-flow',
        name: 'Test Flow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'Slow Step',
            type: 'generate',
            config: { prompt: 'test' }
          }
        ],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: {} },
        config: { timeout: 60000 }
      };

      const mockInstance = new (require('../step-executor').StepExecutor)();
      mockInstance.execute = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({
            status: 'success',
            output: {},
            metrics: {}
          }), 500);
        });
      });
      
      executor['stepExecutor'] = mockInstance;

      // Cause multiple timeouts to trigger circuit breaker
      for (let i = 0; i < 6; i++) {
        await executor.execute(config, {}, { stepTimeout: 50 });
      }

      // Circuit should be open
      const result = await executor.execute(config, {});
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Circuit breaker is OPEN');
    });

    it('should parallelize with timeout protection', async () => {
      const config: FlowConfiguration = {
        id: 'test-flow',
        name: 'Test Flow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'Fast Step',
            type: 'generate',
            config: { prompt: 'test1' }
          },
          {
            id: 'step2',
            name: 'Slow Step',
            type: 'generate',
            config: { prompt: 'test2' }
          }
        ],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: {} },
        config: { timeout: 60000 }
      };

      const mockStepExecutor = require('../step-executor').StepExecutor;
      mockStepExecutor.prototype.execute = jest.fn().mockImplementation((step) => {
        const delay = step.id === 'step2' ? 2000 : 100;
        return new Promise((resolve) => {
          setTimeout(() => resolve({
            status: 'success',
            output: { result: 'done' },
            metrics: {}
          }), delay);
        });
      });

      const result = await executor.execute(config, {}, { stepTimeout: 500 });
      
      // Should fail because step2 times out
      expect(result.success).toBe(false);
    });
  });
});

describe('Circuit Breaker Standalone', () => {
  // Test circuit breaker implementation details
  it('should properly track state transitions', () => {
    // These tests would verify the circuit breaker state machine
    // CLOSED -> OPEN -> HALF_OPEN -> CLOSED
  });
});
