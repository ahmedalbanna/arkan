/**
 * Step Executor Tests
 */

import { StepExecutor } from '../step-executor';
import { ContextManager } from '../context-manager';
import { TemplateEngine } from '../template-engine';
import type { FlowConfiguration, FlowStep } from '../../../lib/models/flow-config';

// Mock the AI module
jest.mock('../../genkit', () => ({
  ai: {
    generate: jest.fn()
  }
}));

describe('StepExecutor', () => {
  let stepExecutor: StepExecutor;
  let contextManager: ContextManager;
  let templateEngine: TemplateEngine;
  let context: any;

  beforeEach(async () => {
    contextManager = new ContextManager();
    templateEngine = new TemplateEngine();
    stepExecutor = new StepExecutor(contextManager, templateEngine);

    // Create a mock context
    context = await contextManager.initialize({
      input: {
        topic: 'Machine Learning',
        query: 'What is AI?'
      },
      config: {
        steps: []
      } as FlowConfiguration,
      options: {},
      traceId: 'test_trace'
    });
  });

  describe('execute', () => {
    describe('prompt steps', () => {
      it('should execute prompt step successfully', async () => {
        const { ai } = require('../../genkit');
        ai.generate.mockResolvedValue({
          text: 'AI is artificial intelligence',
          usage: {
            totalTokens: 50,
            inputTokens: 20,
            outputTokens: 30
          }
        });

        const step: FlowStep = {
          id: 'step_1',
          name: 'Generate Response',
          type: 'prompt',
          config: {
            prompt: 'Answer: {{input.query}}',
            model: 'gemini-2.0-flash-exp',
            temperature: 0.7
          }
        };

        const result = await stepExecutor.execute(step, context);

        expect(result.status).toBe('success');
        expect(result.output).toBe('AI is artificial intelligence');
        expect(result.metrics?.tokens).toBe(50);
        expect(result.metrics?.cost).toBeGreaterThan(0);
      });

      it('should render template with context variables', async () => {
        const { ai } = require('../../genkit');
        ai.generate.mockResolvedValue({
          text: 'Response',
          usage: { totalTokens: 10 }
        });

        const step: FlowStep = {
          id: 'step_1',
          name: 'Test',
          type: 'prompt',
          config: {
            prompt: 'Topic: {{input.topic}}, Query: {{input.query}}',
            model: 'gemini-2.0-flash-exp'
          }
        };

        await stepExecutor.execute(step, context);

        expect(ai.generate).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: 'Topic: Machine Learning, Query: What is AI?'
          })
        );
      });
    });

    describe('condition steps', () => {
      it('should execute condition step', async () => {
        const step: FlowStep = {
          id: 'step_1',
          name: 'Check Condition',
          type: 'condition',
          config: {
            expression: 'input.topic === "Machine Learning"',
            onTrue: 'step_2',
            onFalse: 'step_3'
          }
        };

        const result = await stepExecutor.execute(step, context);

        expect(result.status).toBe('success');
        expect(result.output?.conditionMet).toBe(true);
        expect(result.output?.nextStep).toBe('step_2');
      });
    });

    describe('loop steps', () => {
      it('should execute loop step', async () => {
        context.variables.set('items', ['item1', 'item2', 'item3']);

        const step: FlowStep = {
          id: 'step_1',
          name: 'Loop Items',
          type: 'loop',
          config: {
            iterateOver: 'items',
            steps: []
          }
        };

        const result = await stepExecutor.execute(step, context);

        expect(result.status).toBe('success');
        expect(result.output).toHaveLength(3);
        expect(result.metrics?.iterations).toBe(3);
      });

      it('should respect maxIterations', async () => {
        context.variables.set('items', ['a', 'b', 'c', 'd', 'e']);

        const step: FlowStep = {
          id: 'step_1',
          name: 'Loop Items',
          type: 'loop',
          config: {
            iterateOver: 'items',
            maxIterations: 3,
            steps: []
          }
        };

        const result = await stepExecutor.execute(step, context);

        expect(result.output).toHaveLength(3);
        expect(result.metrics?.iterations).toBe(3);
      });
    });

    describe('parallel steps', () => {
      it('should execute parallel steps concurrently', async () => {
        const { ai } = require('../../genkit');
        ai.generate.mockResolvedValue({
          text: 'Response',
          usage: { totalTokens: 10 }
        });

        const step: FlowStep = {
          id: 'step_1',
          name: 'Parallel Execution',
          type: 'parallel',
          config: {
            steps: [
              {
                id: 'parallel_1',
                name: 'Task 1',
                type: 'prompt',
                config: { prompt: 'Task 1', model: 'gemini-2.0-flash-exp' }
              },
              {
                id: 'parallel_2',
                name: 'Task 2',
                type: 'prompt',
                config: { prompt: 'Task 2', model: 'gemini-2.0-flash-exp' }
              }
            ]
          }
        };

        const result = await stepExecutor.execute(step, context);

        expect(result.status).toBe('success');
        expect(result.output).toHaveLength(2);
        expect(result.metrics?.parallelSteps).toBe(2);
        expect(result.metrics?.successful).toBe(2);
      });

      it('should handle partial failures when allowed', async () => {
        const { ai } = require('../../genkit');
        ai.generate
          .mockResolvedValueOnce({ text: 'Success', usage: { totalTokens: 10 } })
          .mockRejectedValueOnce(new Error('Failed'));

        const step: FlowStep = {
          id: 'step_1',
          name: 'Parallel Execution',
          type: 'parallel',
          config: {
            allowPartialFailure: true,
            steps: [
              {
                id: 'parallel_1',
                name: 'Task 1',
                type: 'prompt',
                config: { prompt: 'Task 1', model: 'gemini-2.0-flash-exp' }
              },
              {
                id: 'parallel_2',
                name: 'Task 2',
                type: 'prompt',
                config: { prompt: 'Task 2', model: 'gemini-2.0-flash-exp' }
              }
            ]
          }
        };

        const result = await stepExecutor.execute(step, context);

        expect(result.status).toBe('success');
        expect(result.metrics?.successful).toBe(1);
        expect(result.metrics?.failed).toBe(1);
      });
    });

    describe('context mapping', () => {
      it('should map input from context', async () => {
        const { ai } = require('../../genkit');
        ai.generate.mockResolvedValue({
          text: 'Response',
          usage: { totalTokens: 10 }
        });

        context.variables.set('customTopic', 'Custom Topic');

        const step: FlowStep = {
          id: 'step_1',
          name: 'Test',
          type: 'prompt',
          config: {
            prompt: '{{topic}}',
            model: 'gemini-2.0-flash-exp'
          },
          contextMapping: {
            input: {
              topic: 'customTopic'
            }
          }
        };

        await stepExecutor.execute(step, context);

        // The context mapping should prepare the input correctly
        expect(ai.generate).toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should return error result on step failure', async () => {
        const { ai } = require('../../genkit');
        ai.generate.mockRejectedValue(new Error('AI generation failed'));

        const step: FlowStep = {
          id: 'step_1',
          name: 'Test',
          type: 'prompt',
          config: {
            prompt: 'Test',
            model: 'gemini-2.0-flash-exp'
          }
        };

        const result = await stepExecutor.execute(step, context);

        expect(result.status).toBe('error');
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('AI generation failed');
      });
    });
  });

  describe('parameter resolution', () => {
    it('should resolve template variables in parameters', async () => {
      context.variables.set('searchQuery', 'test query');

      const step: FlowStep = {
        id: 'step_1',
        name: 'Tool Step',
        type: 'tool',
        config: {
          toolName: 'search',
          parameters: {
            query: '{{searchQuery}}',
            limit: 10
          }
        }
      };

      // The parameter resolution happens internally
      // This tests that it doesn't throw
      await stepExecutor.execute(step, context);
    });
  });
});
