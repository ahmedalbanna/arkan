/**
 * Unit Tests for Step Handlers
 * 
 * Tests all 4 step handler implementations:
 * - executeRetrieveStep
 * - executeGenerateStep
 * - executeToolStep
 * - executeFormatStep
 */

import {
  executeStep,
  executeRetrieveStep,
  executeGenerateStep,
  executeToolStep,
  executeFormatStep,
  StepExecutionError,
  StepValidationError,
  UnsupportedStepTypeError,
} from '../step-handlers';
import { ContextManager } from '../context-manager';
import { FlowStep } from '@/lib/models/flow-config';

// Mock dependencies
jest.mock('@/lib/rag/retrieval', () => ({
  retrieveContext: jest.fn(),
  retrieveContextEnhanced: jest.fn(),
}));

jest.mock('@/services/tool-registry-service', () => ({
  executeTool: jest.fn(),
}));

jest.mock('@/ai/genkit', () => ({
  ai: {
    generate: jest.fn(),
  },
}));

describe('Step Handlers', () => {
  let context: ContextManager;

  beforeEach(() => {
    // Initialize context with some test data
    context = new ContextManager({ testInput: 'test value' });
    jest.clearAllMocks();
  });

  describe('executeStep', () => {
    it('should route to correct handler based on step type', async () => {
      const retrieveStep: FlowStep = {
        id: 'step1',
        name: 'Test Retrieve',
        type: 'retrieve',
        handler: 'retrieve',
        inputMapping: {},
        outputMapping: {},
      };

      // Mock the retrieval
      const { retrieveContext } = require('@/lib/rag/retrieval');
      retrieveContext.mockResolvedValue({
        context: 'Retrieved context',
        sources: [],
      });

      const result = await executeStep(retrieveStep, { query: 'test' }, context);

      expect(result.output).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for unsupported step type', async () => {
      const invalidStep: FlowStep = {
        id: 'step1',
        name: 'Invalid Step',
        type: 'invalid' as any,
        handler: 'invalid',
        inputMapping: {},
        outputMapping: {},
      };

      await expect(
        executeStep(invalidStep, {}, context)
      ).rejects.toThrow(UnsupportedStepTypeError);
    });

    it('should include execution duration in metadata', async () => {
      const formatStep: FlowStep = {
        id: 'step1',
        name: 'Format Step',
        type: 'format',
        handler: 'format',
        inputMapping: {},
        outputMapping: {},
      };

      const result = await executeStep(
        formatStep,
        { data: 'test', format: 'text' },
        context
      );

      expect(result.metadata?.duration).toBeDefined();
      expect(typeof result.metadata?.duration).toBe('number');
    });
  });

  describe('executeRetrieveStep', () => {
    const retrieveStep: FlowStep = {
      id: 'retrieve1',
      name: 'RAG Retrieval',
      type: 'retrieve',
      handler: 'retrieve',
      inputMapping: {},
      outputMapping: {},
    };

    beforeEach(() => {
      const { retrieveContext } = require('@/lib/rag/retrieval');
      retrieveContext.mockClear();
    });

    it('should retrieve context successfully', async () => {
      const { retrieveContext } = require('@/lib/rag/retrieval');
      retrieveContext.mockResolvedValue({
        context: 'Test context from RAG',
        sources: [
          { content: 'Source 1', score: 0.9, sourceFile: 'doc1.txt', type: 'report' },
          { content: 'Source 2', score: 0.8, sourceFile: 'doc2.txt', type: 'report' },
        ],
      });

      const input = {
        query: 'What is machine learning?',
        topK: 5,
        minScore: 0.5,
      };

      const result = await executeRetrieveStep(retrieveStep, input, context);

      expect(result.output.context).toBe('Test context from RAG');
      expect(result.output.sources).toHaveLength(2);
      expect(result.output.retrievedCount).toBe(2);
      expect(result.metadata?.query).toBe('What is machine learning?');
      expect(result.metadata?.topK).toBe(5);
    });

    it('should throw validation error when query is missing', async () => {
      const input = {
        topK: 5,
        // query missing
      };

      await expect(
        executeRetrieveStep(retrieveStep, input, context)
      ).rejects.toThrow(StepValidationError);
    });
  });

  describe('executeGenerateStep', () => {
    const generateStep: FlowStep = {
      id: 'generate1',
      name: 'LLM Generation',
      type: 'generate',
      handler: 'generate',
      inputMapping: {},
      outputMapping: {},
    };

    it('should generate text successfully', async () => {
      const { ai } = require('@/ai/genkit');
      const mockResponse = {
        text: () => 'Generated text response',
        usage: { totalTokens: 150 },
      };
      ai.generate.mockResolvedValue(mockResponse);

      const input = {
        prompt: 'Write a summary of machine learning',
        model: 'ollama/phi3:mini',
        temperature: 0.7,
      };

      const result = await executeGenerateStep(generateStep, input, context);

      expect(result.output.text).toBe('Generated text response');
      expect(result.output.model).toBe('ollama/phi3:mini');
      expect(result.metadata?.tokensUsed).toBe(150);
      expect(result.metadata?.temperature).toBe(0.7);
    });

    it('should throw validation error when prompt is missing', async () => {
      const input = {
        model: 'ollama/phi3:mini',
        // prompt missing
      };

      await expect(
        executeGenerateStep(generateStep, input, context)
      ).rejects.toThrow(StepValidationError);
    });
  });

  describe('executeToolStep', () => {
    const toolStep: FlowStep = {
      id: 'tool1',
      name: 'Tool Execution',
      type: 'tool',
      handler: 'tool',
      inputMapping: {},
      outputMapping: {},
    };

    it('should execute tool successfully', async () => {
      const { executeTool } = require('@/services/tool-registry-service');
      executeTool.mockResolvedValue({
        result: 'Tool execution result',
        data: { value: 42 },
      });

      const input = {
        toolName: 'checkGrammar',
        parameters: {
          text: 'Test text to check',
        },
      };

      const result = await executeToolStep(toolStep, input, context);

      expect(result.output.toolName).toBe('checkGrammar');
      expect(result.output.result).toEqual({
        result: 'Tool execution result',
        data: { value: 42 },
      });
      expect(result.metadata?.toolName).toBe('checkGrammar');
    });

    it('should throw validation error when toolName is missing', async () => {
      const input = {
        parameters: { test: 'value' },
        // toolName missing
      };

      await expect(
        executeToolStep(toolStep, input, context)
      ).rejects.toThrow(StepValidationError);
    });
  });

  describe('executeFormatStep', () => {
    const formatStep: FlowStep = {
      id: 'format1',
      name: 'Format Output',
      type: 'format',
      handler: 'format',
      inputMapping: {},
      outputMapping: {},
    };

    describe('JSON formatting', () => {
      it('should format data as JSON', async () => {
        const input = {
          data: { name: 'Test', value: 42 },
          format: 'json',
        };

        const result = await executeFormatStep(formatStep, input, context);

        expect(result.output.formatted).toBe(
          JSON.stringify({ name: 'Test', value: 42 }, null, 2)
        );
        expect(result.output.format).toBe('json');
      });
    });

    describe('Text formatting', () => {
      it('should format data as plain text', async () => {
        const input = {
          data: 'Simple text',
          format: 'text',
        };

        const result = await executeFormatStep(formatStep, input, context);

        expect(result.output.formatted).toBe('Simple text');
      });

      it('should use template for text formatting', async () => {
        const input = {
          data: { user: 'Alice', score: 95 },
          format: 'text',
          template: 'User {{user}} scored {{score}} points',
        };

        const result = await executeFormatStep(formatStep, input, context);

        expect(result.output.formatted).toBe('User Alice scored 95 points');
      });
    });

    describe('Transformations', () => {
      it('should apply uppercase transformation', async () => {
        const input = {
          data: 'hello world',
          format: 'text',
          transformation: 'uppercase',
        };

        const result = await executeFormatStep(formatStep, input, context);

        expect(result.output.formatted).toBe('HELLO WORLD');
      });

      it('should apply lowercase transformation', async () => {
        const input = {
          data: 'HELLO WORLD',
          format: 'text',
          transformation: 'lowercase',
        };

        const result = await executeFormatStep(formatStep, input, context);

        expect(result.output.formatted).toBe('hello world');
      });
    });

    it('should throw validation error when data is missing', async () => {
      const input = {
        format: 'json',
        // data missing
      };

      await expect(
        executeFormatStep(formatStep, input, context)
      ).rejects.toThrow(StepValidationError);
    });
  });
});
