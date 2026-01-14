/**
 * Enhanced Flow Executor Tests
 */

import { EnhancedFlowExecutor, ValidationError } from '../executor';
import type { FlowConfiguration } from '../../../lib/models/flow-config';
import { z } from 'zod';

// Mock the AI module
jest.mock('../../genkit', () => ({
  ai: {
    generate: jest.fn()
  }
}));

describe('EnhancedFlowExecutor', () => {
  let executor: EnhancedFlowExecutor;

  beforeEach(() => {
    executor = new EnhancedFlowExecutor();
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should execute a simple flow successfully', async () => {
      const { ai } = require('../../genkit');
      ai.generate.mockResolvedValue({
        text: 'Generated content',
        usage: {
          totalTokens: 100,
          inputTokens: 50,
          outputTokens: 50
        }
      });

      const config: FlowConfiguration = {
        id: 'flow_1',
        name: 'test-flow',
        description: 'Test flow',
        version: '1.0.0',
        tags: ['test'],
        status: 'active' as any,
        inputSchema: z.object({
          topic: z.string()
        }),
        outputSchema: z.object({
          content: z.string()
        }),
        steps: [
          {
            id: 'step_1',
            name: 'Generate Content',
            type: 'prompt',
            config: {
              prompt: 'Write about {{input.topic}}',
              model: 'gemini-2.0-flash-exp'
            },
            contextMapping: {
              output: {
                '': 'content'
              }
            }
          }
        ],
        outputMapping: {
          content: 'content'
        },
        config: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const input = { topic: 'AI' };
      const result = await executor.execute(config, input);

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(result.traceId).toBeDefined();
      expect(result.metrics.totalSteps).toBe(1);
      expect(result.metrics.successfulSteps).toBe(1);
      expect(result.metrics.failedSteps).toBe(0);
    });

    it('should validate input schema', async () => {
      const config: FlowConfiguration = {
        id: 'flow_1',
        name: 'test-flow',
        description: 'Test',
        version: '1.0.0',
        tags: [],
        status: 'active' as any,
        inputSchema: z.object({
          required: z.string()
        }),
        outputSchema: z.object({}),
        steps: [],
        config: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await executor.execute(config, { wrong: 'input' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle step failures with retry', async () => {
      const { ai } = require('../../genkit');
      
      // Fail twice, then succeed
      ai.generate
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          text: 'Success',
          usage: { totalTokens: 10 }
        });

      const config: FlowConfiguration = {
        id: 'flow_1',
        name: 'test-flow',
        description: 'Test',
        version: '1.0.0',
        tags: [],
        status: 'active' as any,
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: [
          {
            id: 'step_1',
            name: 'Flaky Step',
            type: 'prompt',
            config: {
              prompt: 'Test',
              model: 'gemini-2.0-flash-exp'
            },
            errorHandling: {
              retries: 2
            }
          }
        ],
        config: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await executor.execute(config, {});

      expect(result.success).toBe(true);
      expect(ai.generate).toHaveBeenCalledTimes(3);
    });

    it('should execute fallback step on failure', async () => {
      const { ai } = require('../../genkit');
      
      ai.generate
        .mockRejectedValueOnce(new Error('Primary failed'))
        .mockResolvedValueOnce({
          text: 'Fallback success',
          usage: { totalTokens: 10 }
        });

      const config: FlowConfiguration = {
        id: 'flow_1',
        name: 'test-flow',
        description: 'Test',
        version: '1.0.0',
        tags: [],
        status: 'active' as any,
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: [
          {
            id: 'step_1',
            name: 'Primary Step',
            type: 'prompt',
            config: {
              prompt: 'Primary',
              model: 'gemini-2.0-flash-exp'
            },
            errorHandling: {
              fallback: 'step_2'
            }
          },
          {
            id: 'step_2',
            name: 'Fallback Step',
            type: 'prompt',
            config: {
              prompt: 'Fallback',
              model: 'gemini-2.0-flash-exp'
            }
          }
        ],
        config: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await executor.execute(config, {});

      expect(result.success).toBe(true);
      expect(ai.generate).toHaveBeenCalledTimes(2);
    });

    it('should skip steps based on conditions', async () => {
      const { ai } = require('../../genkit');
      ai.generate.mockResolvedValue({
        text: 'Success',
        usage: { totalTokens: 10 }
      });

      const config: FlowConfiguration = {
        id: 'flow_1',
        name: 'test-flow',
        description: 'Test',
        version: '1.0.0',
        tags: [],
        status: 'active' as any,
        inputSchema: z.object({
          shouldExecute: z.boolean()
        }),
        outputSchema: z.object({}),
        steps: [
          {
            id: 'step_1',
            name: 'Conditional Step',
            type: 'prompt',
            config: {
              prompt: 'Test',
              model: 'gemini-2.0-flash-exp'
            },
            condition: {
              expression: 'input.shouldExecute === true'
            }
          }
        ],
        config: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await executor.execute(config, { shouldExecute: false });

      expect(result.success).toBe(true);
      expect(result.metrics.skippedSteps).toBe(1);
      expect(ai.generate).not.toHaveBeenCalled();
    });

    it('should track execution metrics', async () => {
      const { ai } = require('../../genkit');
      ai.generate.mockResolvedValue({
        text: 'Success',
        usage: {
          totalTokens: 150,
          inputTokens: 100,
          outputTokens: 50
        }
      });

      const config: FlowConfiguration = {
        id: 'flow_1',
        name: 'test-flow',
        description: 'Test',
        version: '1.0.0',
        tags: [],
        status: 'active' as any,
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: [
          {
            id: 'step_1',
            name: 'Step 1',
            type: 'prompt',
            config: {
              prompt: 'Test',
              model: 'gemini-2.0-flash-exp'
            }
          }
        ],
        config: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await executor.execute(config, {});

      expect(result.metrics.totalTokens).toBe(150);
      expect(result.metrics.totalCost).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });
  });

  describe('validation', () => {
    it('should reject flow with no steps', async () => {
      const config: FlowConfiguration = {
        id: 'flow_1',
        name: 'test-flow',
        description: 'Test',
        version: '1.0.0',
        tags: [],
        status: 'active' as any,
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: [],
        config: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await executor.execute(config, {});

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('at least one step');
    });

    it('should reject duplicate step IDs', async () => {
      const config: FlowConfiguration = {
        id: 'flow_1',
        name: 'test-flow',
        description: 'Test',
        version: '1.0.0',
        tags: [],
        status: 'active' as any,
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: [
          {
            id: 'step_1',
            name: 'Step 1',
            type: 'prompt',
            config: {}
          },
          {
            id: 'step_1',
            name: 'Step 2',
            type: 'prompt',
            config: {}
          }
        ],
        config: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await executor.execute(config, {});

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Duplicate step ID');
    });

    it('should reject invalid step references', async () => {
      const config: FlowConfiguration = {
        id: 'flow_1',
        name: 'test-flow',
        description: 'Test',
        version: '1.0.0',
        tags: [],
        status: 'active' as any,
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: [
          {
            id: 'step_1',
            name: 'Step 1',
            type: 'condition',
            config: {
              expression: 'true'
            },
            condition: {
              expression: 'true',
              onTrue: 'step_999' // Non-existent step
            }
          }
        ],
        config: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await executor.execute(config, {});

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('unknown onTrue step');
    });
  });
});
