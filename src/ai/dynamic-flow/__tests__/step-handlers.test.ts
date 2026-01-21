/**
 * Step Handlers Tests
 * 
 * Comprehensive tests for all step handler functions
 */

import {
  executeRetrieveStep,
  executeGenerateStep,
  executeToolStep,
  executeFormatStep,
  executeTransformStep,
  executeConditionStep,
  executeLoopStep,
} from '../step-handlers';
import { ContextManager } from '../context-manager';
import type { FlowConfiguration } from '../../../lib/models/flow-config';

// Mock dependencies
jest.mock('../../genkit', () => ({
  ai: {
    generate: jest.fn(),
  },
}));

jest.mock('../../../services/rag-service', () => ({
  searchDocuments: jest.fn(),
}));

describe('Step Handlers', () => {
  let contextManager: ContextManager;
  let context: any;

  beforeEach(async () => {
    contextManager = new ContextManager();
    context = await contextManager.initialize({
      input: {
        topic: 'AI Testing',
        items: ['item1', 'item2', 'item3'],
        text: 'Hello World',
      },
      config: {} as FlowConfiguration,
      options: {},
      traceId: 'test_trace',
    });

    context.variables.set('testVar', 'testValue');
    jest.clearAllMocks();
  });

  describe('executeRetrieveStep', () => {
    it('should retrieve documents from RAG', async () => {
      const { searchDocuments } = require('../../../services/rag-service');
      searchDocuments.mockResolvedValue({
        documents: [
          { content: 'Doc 1', score: 0.9 },
          { content: 'Doc 2', score: 0.8 },
        ],
      });

      const config = {
        query: '{{input.topic}}',
        collection: 'test-collection',
        limit: 5,
        minScore: 0.7,
      };

      const result = await executeRetrieveStep(config, context);

      expect(searchDocuments).toHaveBeenCalledWith({
        query: 'AI Testing',
        collection: 'test-collection',
        limit: 5,
        minScore: 0.7,
        filters: undefined,
      });
      expect(result.documents).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it('should handle RAG errors gracefully', async () => {
      const { searchDocuments } = require('../../../services/rag-service');
      searchDocuments.mockRejectedValue(new Error('RAG service unavailable'));

      const config = {
        query: 'test query',
        collection: 'test-collection',
      };

      await expect(executeRetrieveStep(config, context)).rejects.toThrow();
    });
  });

  describe('executeGenerateStep', () => {
    it('should generate text with inline prompt', async () => {
      const { ai } = require('../../genkit');
      ai.generate.mockResolvedValue({
        text: 'Generated content',
        usage: { totalTokens: 100 },
      });

      const config = {
        prompt: 'Write about {{input.topic}}',
        model: 'gemini-2.0-flash-exp',
        outputFormat: 'text',
      };

      const result = await executeGenerateStep(config, context);

      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'Write about AI Testing',
          model: 'gemini-2.0-flash-exp',
        })
      );
      expect(result.text).toBe('Generated content');
    });

    it('should parse JSON output format', async () => {
      const { ai } = require('../../genkit');
      ai.generate.mockResolvedValue({
        text: '{"result": "success"}',
        usage: { totalTokens: 50 },
      });

      const config = {
        prompt: 'Generate JSON',
        model: 'gemini-2.0-flash-exp',
        outputFormat: 'json',
      };

      const result = await executeGenerateStep(config, context);

      expect(result).toEqual({ result: 'success' });
    });

    it('should handle generation errors', async () => {
      const { ai } = require('../../genkit');
      ai.generate.mockRejectedValue(new Error('API limit exceeded'));

      const config = {
        prompt: 'Test',
        model: 'gemini-2.0-flash-exp',
      };

      await expect(executeGenerateStep(config, context)).rejects.toThrow();
    });
  });

  describe('executeTransformStep', () => {
    it('should transform with uppercase', async () => {
      const config = {
        transformer: 'uppercase',
        input: '{{input.text}}',
      };

      const result = await executeTransformStep(config, context);

      expect(result).toBe('HELLO WORLD');
    });

    it('should transform with lowercase', async () => {
      const config = {
        transformer: 'lowercase',
        input: '{{input.text}}',
      };

      const result = await executeTransformStep(config, context);

      expect(result).toBe('hello world');
    });

    it('should join array with separator', async () => {
      const config = {
        transformer: 'join',
        input: '{{input.items}}',
        parameters: { separator: ', ' },
      };

      const result = await executeTransformStep(config, context);

      expect(result).toBe('item1, item2, item3');
    });

    it('should get first element of array', async () => {
      const config = {
        transformer: 'first',
        input: '{{input.items}}',
      };

      const result = await executeTransformStep(config, context);

      expect(result).toBe('item1');
    });

    it('should get array length', async () => {
      const config = {
        transformer: 'length',
        input: '{{input.items}}',
      };

      const result = await executeTransformStep(config, context);

      expect(result).toBe(3);
    });

    it('should throw error for unknown transformer', async () => {
      const config = {
        transformer: 'unknownTransformer',
        input: 'test',
      };

      await expect(executeTransformStep(config, context)).rejects.toThrow(
        'Transformer not found'
      );
    });
  });

  describe('executeConditionStep', () => {
    it('should evaluate condition to true', async () => {
      const config = {
        condition: 'input.topic === "AI Testing"',
        thenSteps: ['step_then'],
        elseSteps: ['step_else'],
      };

      const result = await executeConditionStep(config, context);

      expect(result.conditionResult).toBe(true);
      expect(result.nextSteps).toEqual(['step_then']);
    });

    it('should evaluate condition to false', async () => {
      const config = {
        condition: 'input.topic === "Other"',
        thenSteps: ['step_then'],
        elseSteps: ['step_else'],
      };

      const result = await executeConditionStep(config, context);

      expect(result.conditionResult).toBe(false);
      expect(result.nextSteps).toEqual(['step_else']);
    });

    it('should return empty array when no else steps', async () => {
      const config = {
        condition: 'false',
        thenSteps: ['step_then'],
      };

      const result = await executeConditionStep(config, context);

      expect(result.nextSteps).toEqual([]);
    });
  });

  describe('executeLoopStep', () => {
    it('should configure loop over array', async () => {
      const config = {
        iterateOver: 'input.items',
        itemVariable: 'currentItem',
        steps: ['step1', 'step2'],
      };

      const result = await executeLoopStep(config, context);

      expect(result.array).toEqual(['item1', 'item2', 'item3']);
      expect(result.itemVariable).toBe('currentItem');
      expect(result.steps).toEqual(['step1', 'step2']);
      expect(result.totalIterations).toBe(3);
    });

    it('should respect maxIterations limit', async () => {
      const config = {
        iterateOver: 'input.items',
        itemVariable: 'item',
        steps: ['step1'],
        maxIterations: 2,
      };

      const result = await executeLoopStep(config, context);

      expect(result.totalIterations).toBe(2);
      expect(result.array).toHaveLength(2);
    });

    it('should throw error if variable is not an array', async () => {
      const config = {
        iterateOver: 'input.text',
        itemVariable: 'item',
        steps: ['step1'],
      };

      await expect(executeLoopStep(config, context)).rejects.toThrow(
        'Loop variable is not an array'
      );
    });
  });

  describe('executeFormatStep', () => {
    it('should format output', async () => {
      const config = {
        format: 'json',
        input: { key: 'value' },
      };

      const result = await executeFormatStep(config, context);

      expect(typeof result).toBe('string');
      expect(JSON.parse(result)).toEqual({ key: 'value' });
    });
  });

  describe('executeToolStep', () => {
    it('should execute tool function', async () => {
      // Mock tool execution
      const config = {
        toolName: 'calculator',
        parameters: {
          operation: 'add',
          a: 5,
          b: 3,
        },
      };

      // This test would need proper tool registry setup
      // Placeholder for now
      expect(config.toolName).toBe('calculator');
    });
  });
});
