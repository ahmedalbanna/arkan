/**
 * Flow Execution Integration Tests
 * 
 * End-to-end integration tests for complete flow execution workflows
 */

import { DynamicFlowExecutor } from '@/ai/dynamic-flow/executor';
import * as flowService from '@/services/flow-config-service';
import * as ragService from '@/services/rag-service';
import { ai } from '@/ai/genkit';

// Mock dependencies
jest.mock('@/services/flow-config-service');
jest.mock('@/services/rag-service');
jest.mock('@/ai/genkit');

describe('Flow Execution Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Complete RAG Workflow
  // ============================================================================

  describe('RAG-Enhanced Generation Workflow', () => {
    it('should execute complete RAG flow: retrieve -> generate -> format', async () => {
      const mockFlow = {
        id: 'rag-flow-1',
        name: 'RAG Enhanced Report',
        version: '1.0.0',
        steps: [
          {
            id: 'retrieve',
            name: 'Retrieve Context',
            type: 'retrieve' as const,
            config: {
              query: '{{input.topic}}',
              collection: 'documents',
              limit: 5,
            },
          },
          {
            id: 'generate',
            name: 'Generate Content',
            type: 'generate' as const,
            config: {
              prompt: 'Based on context: {{steps.retrieve.documents}}, write about {{input.topic}}',
              model: 'gemini-2.0-flash-exp',
            },
          },
          {
            id: 'format',
            name: 'Format Output',
            type: 'format' as const,
            config: {
              template: '# {{input.topic}}\n\n{{steps.generate.output}}',
            },
          },
        ],
      };

      // Mock RAG retrieval
      (ragService.retrieveContext as jest.Mock).mockResolvedValue({
        chunks: [
          { content: 'Relevant context 1', score: 0.9 },
          { content: 'Relevant context 2', score: 0.85 },
        ],
      });

      // Mock AI generation
      (ai.generate as jest.Mock).mockResolvedValue({
        text: 'Generated content based on retrieved context...',
      });

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const result = await executor.execute({ topic: 'Machine Learning' });

      expect(result.success).toBe(true);
      expect(result.output).toContain('# Machine Learning');
      expect(ragService.retrieveContext).toHaveBeenCalled();
      expect(ai.generate).toHaveBeenCalled();
    });

    it('should handle RAG retrieval failure with fallback', async () => {
      const mockFlow = {
        id: 'rag-flow-2',
        steps: [
          {
            id: 'retrieve',
            type: 'retrieve' as const,
            config: { query: '{{input.query}}', collection: 'documents' },
            errorHandling: {
              continueOnError: true,
              fallback: 'generate_without_context',
            },
          },
          {
            id: 'generate_without_context',
            type: 'generate' as const,
            config: {
              prompt: 'Generate about {{input.query}} without context',
            },
          },
        ],
      };

      // RAG fails
      (ragService.retrieveContext as jest.Mock).mockRejectedValue(
        new Error('Vector DB unavailable')
      );

      // Fallback generation succeeds
      (ai.generate as jest.Mock).mockResolvedValue({
        text: 'Generated without context',
      });

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const result = await executor.execute({ query: 'Test' });

      expect(result.success).toBe(true);
      expect(result.output).toContain('Generated without context');
    });
  });

  // ============================================================================
  // Multi-Tool Workflow
  // ============================================================================

  describe('Multi-Tool Analysis Workflow', () => {
    it('should execute analysis pipeline: grammar -> plagiarism -> bias', async () => {
      const mockFlow = {
        id: 'analysis-flow',
        steps: [
          {
            id: 'grammar',
            type: 'tool' as const,
            config: { toolName: 'grammar-checker', input: { text: '{{input.text}}' } },
          },
          {
            id: 'plagiarism',
            type: 'tool' as const,
            config: { toolName: 'plagiarism-checker', input: { text: '{{input.text}}' } },
          },
          {
            id: 'bias',
            type: 'tool' as const,
            config: { toolName: 'bias-checker', input: { text: '{{input.text}}' } },
          },
          {
            id: 'aggregate',
            type: 'transform' as const,
            config: {
              input: {
                grammar: '{{steps.grammar.score}}',
                plagiarism: '{{steps.plagiarism.score}}',
                bias: '{{steps.bias.score}}',
              },
              transformer: 'aggregate-scores',
            },
          },
        ],
      };

      // Mock tool executions
      (ai.generate as jest.Mock)
        .mockResolvedValueOnce({ score: 95, errors: [] }) // grammar
        .mockResolvedValueOnce({ score: 10, matches: [] }) // plagiarism
        .mockResolvedValueOnce({ score: 5, biases: [] }); // bias

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const result = await executor.execute({ text: 'Test document' });

      expect(result.success).toBe(true);
      expect(ai.generate).toHaveBeenCalledTimes(3);
    });

    it('should handle partial tool failures', async () => {
      const mockFlow = {
        id: 'analysis-flow-2',
        steps: [
          {
            id: 'tool1',
            type: 'tool' as const,
            config: { toolName: 'checker-1' },
            errorHandling: { continueOnError: true },
          },
          {
            id: 'tool2',
            type: 'tool' as const,
            config: { toolName: 'checker-2' },
            errorHandling: { continueOnError: true },
          },
        ],
      };

      // First tool fails, second succeeds
      (ai.generate as jest.Mock)
        .mockRejectedValueOnce(new Error('Tool 1 failed'))
        .mockResolvedValueOnce({ result: 'Tool 2 success' });

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const result = await executor.execute({ text: 'Test' });

      expect(result.success).toBe(true);
      expect(result.trace.steps[1].status).toBe('success');
    });
  });

  // ============================================================================
  // Conditional Branching Workflow
  // ============================================================================

  describe('Conditional Logic Workflow', () => {
    it('should execute different branches based on conditions', async () => {
      const mockFlow = {
        id: 'conditional-flow',
        steps: [
          {
            id: 'check_length',
            type: 'condition' as const,
            config: {
              condition: '{{input.text.length}} > 1000',
              thenSteps: ['summarize'],
              elseSteps: ['paraphrase'],
            },
          },
          {
            id: 'summarize',
            type: 'generate' as const,
            config: { prompt: 'Summarize: {{input.text}}' },
          },
          {
            id: 'paraphrase',
            type: 'generate' as const,
            config: { prompt: 'Paraphrase: {{input.text}}' },
          },
        ],
      };

      // Test long text (should summarize)
      (ai.generate as jest.Mock).mockResolvedValueOnce({ text: 'Summary' });

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const longText = 'A'.repeat(1500);
      const result1 = await executor.execute({ text: longText });

      expect(result1.success).toBe(true);
      expect(result1.trace.steps.find(s => s.stepId === 'summarize')).toBeDefined();

      // Test short text (should paraphrase)
      (ai.generate as jest.Mock).mockResolvedValueOnce({ text: 'Paraphrased' });

      const shortText = 'Short text.';
      const result2 = await executor.execute({ text: shortText });

      expect(result2.success).toBe(true);
      expect(result2.trace.steps.find(s => s.stepId === 'paraphrase')).toBeDefined();
    });

    it('should handle nested conditions', async () => {
      const mockFlow = {
        id: 'nested-conditions',
        steps: [
          {
            id: 'check_type',
            type: 'condition' as const,
            config: {
              condition: '{{input.type}} === "academic"',
              thenSteps: ['check_length'],
              elseSteps: ['casual_process'],
            },
          },
          {
            id: 'check_length',
            type: 'condition' as const,
            config: {
              condition: '{{input.text.length}} > 500',
              thenSteps: ['formal_long'],
              elseSteps: ['formal_short'],
            },
          },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue({ text: 'Processed' });

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const result = await executor.execute({ 
        type: 'academic', 
        text: 'A'.repeat(600) 
      });

      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // Loop Processing Workflow
  // ============================================================================

  describe('Loop Processing Workflow', () => {
    it('should process array items with loop', async () => {
      const mockFlow = {
        id: 'loop-flow',
        steps: [
          {
            id: 'process_items',
            type: 'loop' as const,
            config: {
              iterateOver: '{{input.items}}',
              itemVariable: 'item',
              steps: [
                {
                  id: 'transform_item',
                  type: 'transform' as const,
                  config: {
                    input: '{{item}}',
                    transformer: 'uppercase',
                  },
                },
              ],
              maxIterations: 10,
            },
          },
        ],
      };

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const result = await executor.execute({ 
        items: ['item1', 'item2', 'item3'] 
      });

      expect(result.success).toBe(true);
      expect(result.trace.steps.filter(s => s.stepId === 'transform_item')).toHaveLength(3);
    });

    it('should respect maxIterations limit', async () => {
      const mockFlow = {
        id: 'loop-limited',
        steps: [
          {
            id: 'process',
            type: 'loop' as const,
            config: {
              iterateOver: '{{input.items}}',
              itemVariable: 'item',
              steps: [{ id: 'process_item', type: 'transform' as const, config: {} }],
              maxIterations: 5,
            },
          },
        ],
      };

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const result = await executor.execute({ 
        items: Array(100).fill('item') 
      });

      expect(result.success).toBe(true);
      // Should only process 5 items
      expect(result.trace.steps.filter(s => s.stepId === 'process_item')).toHaveLength(5);
    });
  });

  // ============================================================================
  // Error Recovery and Retry
  // ============================================================================

  describe('Error Recovery Workflow', () => {
    it('should retry failed steps with exponential backoff', async () => {
      const mockFlow = {
        id: 'retry-flow',
        steps: [
          {
            id: 'unreliable_step',
            type: 'generate' as const,
            config: { prompt: '{{input.prompt}}' },
            errorHandling: {
              retries: 3,
              continueOnError: false,
            },
          },
        ],
      };

      // Fail twice, then succeed
      (ai.generate as jest.Mock)
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValueOnce({ text: 'Success on attempt 3' });

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const result = await executor.execute({ prompt: 'Test' });

      expect(result.success).toBe(true);
      expect(ai.generate).toHaveBeenCalledTimes(3);
      expect(result.trace.steps[0].attempts).toHaveLength(2); // 2 failed attempts
    });

    it('should execute fallback after max retries', async () => {
      const mockFlow = {
        id: 'fallback-flow',
        steps: [
          {
            id: 'primary',
            type: 'generate' as const,
            config: { prompt: 'Primary prompt' },
            errorHandling: {
              retries: 2,
              fallback: 'backup',
            },
          },
          {
            id: 'backup',
            type: 'generate' as const,
            config: { prompt: 'Backup prompt' },
          },
        ],
      };

      // Primary fails all retries
      (ai.generate as jest.Mock)
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockResolvedValueOnce({ text: 'Backup success' });

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const result = await executor.execute({ prompt: 'Test' });

      expect(result.success).toBe(true);
      expect(result.output).toContain('Backup success');
    });
  });

  // ============================================================================
  // Performance and Metrics
  // ============================================================================

  describe('Performance Tracking', () => {
    it('should track execution metrics', async () => {
      const mockFlow = {
        id: 'metrics-flow',
        steps: [
          { id: 'step1', type: 'generate' as const, config: {} },
          { id: 'step2', type: 'generate' as const, config: {} },
        ],
      };

      (ai.generate as jest.Mock)
        .mockResolvedValueOnce({ text: 'Step 1', metadata: { tokens: 100, cost: 0.01 } })
        .mockResolvedValueOnce({ text: 'Step 2', metadata: { tokens: 150, cost: 0.015 } });

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const result = await executor.execute({ input: 'Test' });

      expect(result.trace.metrics.totalTokens).toBe(250);
      expect(result.trace.metrics.totalCost).toBeCloseTo(0.025, 3);
      expect(result.trace.duration).toBeGreaterThan(0);
    });

    it('should track cache performance', async () => {
      const mockFlow = {
        id: 'cache-flow',
        steps: [
          { id: 'cached1', type: 'generate' as const, config: { cache: true } },
          { id: 'cached2', type: 'generate' as const, config: { cache: true } },
        ],
      };

      (ai.generate as jest.Mock)
        .mockResolvedValueOnce({ text: 'Result 1', cached: false })
        .mockResolvedValueOnce({ text: 'Result 2', cached: true });

      const executor = new DynamicFlowExecutor(mockFlow as any);
      const result = await executor.execute({ input: 'Test' });

      expect(result.trace.metrics.cacheHits).toBe(1);
      expect(result.trace.metrics.cacheMisses).toBe(1);
    });
  });
});
