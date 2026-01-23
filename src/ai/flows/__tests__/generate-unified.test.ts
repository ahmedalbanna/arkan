/**
 * Tests for unified generation flow
 */

import { generateUnified, generateUnifiedBatch } from '../generate-unified';
import { GenerationProcessType } from '@/ai/schemas/unified-generation';

// Mock dependencies
jest.mock('@/ai/genkit');
jest.mock('@/lib/utils/retry-utils');
jest.mock('@/lib/utils/logger');

const mockWithRetry = require('@/lib/utils/retry-utils').withRetry as jest.MockedFunction<any>;

describe('generateUnified', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseInput = {
    processType: GenerationProcessType.SECTION,
    processId: 'test-section-1',
    systemPrompt: 'You are an expert writer.',
    userPrompt: 'Write an introduction section.',
  };

  describe('Successful Generation', () => {
    it('should generate content for section process', async () => {
      const mockContent = '## Introduction\n\nThis is generated content.';
      mockWithRetry.mockImplementation(async (fn: () => any) => mockContent);

      const result = await generateUnified(baseInput);

      expect(result.processType).toBe(GenerationProcessType.SECTION);
      expect(result.processId).toBe('test-section-1');
      expect(result.content).toBe(mockContent);
      expect(result.metadata.modelUsed).toBeDefined();
      expect(result.metadata.generatedAt).toBeDefined();
      expect(result.metadata.processingTimeMs).toBeGreaterThan(0);
    });

    it('should use default model config for process type', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => 'Content');

      await generateUnified({
        ...baseInput,
        processType: GenerationProcessType.GRAMMAR,
      });

      // Grammar uses phi3:mini with temperature 0.1 by default
      expect(mockWithRetry).toHaveBeenCalled();
    });

    it('should override default config with user config', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => 'Content');

      await generateUnified({
        ...baseInput,
        modelConfig: {
          modelName: 'ollama/llama3:8b',
          temperature: 0.7,
        },
      });

      expect(mockWithRetry).toHaveBeenCalled();
    });
  });

  describe('Process Types', () => {
    it('should handle GRAMMAR process', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => 'Corrected text.');

      const result = await generateUnified({
        processType: GenerationProcessType.GRAMMAR,
        processId: 'grammar-1',
        systemPrompt: 'Correct grammar.',
        userPrompt: 'Fix this text.',
      });

      expect(result.processType).toBe(GenerationProcessType.GRAMMAR);
    });

    it('should handle TRANSLATION process', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => 'Texto traducido.');

      const result = await generateUnified({
        processType: GenerationProcessType.TRANSLATION,
        processId: 'trans-1',
        systemPrompt: 'Translate text.',
        userPrompt: 'Translate to Spanish.',
      });

      expect(result.processType).toBe(GenerationProcessType.TRANSLATION);
    });

    it('should handle SUMMARIZATION process', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => 'Brief summary.');

      const result = await generateUnified({
        processType: GenerationProcessType.SUMMARIZATION,
        processId: 'summary-1',
        systemPrompt: 'Summarize text.',
        userPrompt: 'Create a summary.',
      });

      expect(result.processType).toBe(GenerationProcessType.SUMMARIZATION);
    });

    it('should handle CUSTOM process', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => 'Custom output.');

      const result = await generateUnified({
        processType: GenerationProcessType.CUSTOM,
        processId: 'custom-1',
        systemPrompt: 'Custom instructions.',
        userPrompt: 'Custom task.',
      });

      expect(result.processType).toBe(GenerationProcessType.CUSTOM);
    });
  });

  describe('Response Parsing', () => {
    it('should handle string response', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => 'Plain text response');

      const result = await generateUnified(baseInput);

      expect(result.content).toBe('Plain text response');
    });

    it('should extract from object with text field', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => ({
        text: 'Content from text field',
      }));

      const result = await generateUnified(baseInput);

      expect(result.content).toBe('Content from text field');
    });

    it('should extract from object with content field', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => ({
        content: 'Content from content field',
      }));

      const result = await generateUnified(baseInput);

      expect(result.content).toBe('Content from content field');
    });

    it('should extract from candidates array', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => ({
        candidates: [{ content: 'Content from candidates' }],
      }));

      const result = await generateUnified(baseInput);

      expect(result.content).toBe('Content from candidates');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for empty content', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => '');

      await expect(generateUnified(baseInput)).rejects.toThrow(
        'failed to generate content'
      );
    });

    it('should throw error for whitespace-only content', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => '   \n\n   ');

      await expect(generateUnified(baseInput)).rejects.toThrow(
        'failed to generate content'
      );
    });

    it('should propagate AI errors', async () => {
      mockWithRetry.mockRejectedValue(new Error('AI service error'));

      await expect(generateUnified(baseInput)).rejects.toThrow('AI service error');
    });
  });

  describe('Metadata', () => {
    it('should include processing time', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'Content';
      });

      const result = await generateUnified(baseInput);

      expect(result.metadata.processingTimeMs).toBeGreaterThan(90);
    });

    it('should include model used', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => 'Content');

      const result = await generateUnified({
        ...baseInput,
        modelConfig: { modelName: 'ollama/llama3:8b' },
      });

      expect(result.metadata.modelUsed).toBe('ollama/llama3:8b');
    });

    it('should include generation timestamp', async () => {
      mockWithRetry.mockImplementation(async (fn: () => any) => 'Content');

      const before = Date.now();
      const result = await generateUnified(baseInput);
      const after = Date.now();

      const timestamp = new Date(result.metadata.generatedAt).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });
});

describe('generateUnifiedBatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate multiple items in parallel', async () => {
    mockWithRetry.mockImplementation(async (fn: () => any) => 'Generated content');

    const inputs = [
      {
        processType: GenerationProcessType.SECTION,
        processId: 'section-1',
        systemPrompt: 'System 1',
        userPrompt: 'User 1',
      },
      {
        processType: GenerationProcessType.SECTION,
        processId: 'section-2',
        systemPrompt: 'System 2',
        userPrompt: 'User 2',
      },
      {
        processType: GenerationProcessType.SECTION,
        processId: 'section-3',
        systemPrompt: 'System 3',
        userPrompt: 'User 3',
      },
    ];

    const results = await generateUnifiedBatch(inputs);

    expect(results).toHaveLength(3);
    expect(results.every(r => r.success)).toBe(true);
  });

  it('should handle partial failures', async () => {
    let callCount = 0;
    mockWithRetry.mockImplementation(async (fn: () => any) => {
      callCount++;
      if (callCount === 2) {
        throw new Error('Generation failed');
      }
      return 'Generated content';
    });

    const inputs = [
      {
        processType: GenerationProcessType.SECTION,
        processId: 'section-1',
        systemPrompt: 'System 1',
        userPrompt: 'User 1',
      },
      {
        processType: GenerationProcessType.SECTION,
        processId: 'section-2',
        systemPrompt: 'System 2',
        userPrompt: 'User 2',
      },
      {
        processType: GenerationProcessType.SECTION,
        processId: 'section-3',
        systemPrompt: 'System 3',
        userPrompt: 'User 3',
      },
    ];

    const results = await generateUnifiedBatch(inputs);

    expect(results).toHaveLength(3);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
    expect(results[2].success).toBe(true);
  });

  it('should return all results even if some fail', async () => {
    mockWithRetry.mockRejectedValue(new Error('All failed'));

    const inputs = [
      {
        processType: GenerationProcessType.SECTION,
        processId: 'section-1',
        systemPrompt: 'System 1',
        userPrompt: 'User 1',
      },
    ];

    const results = await generateUnifiedBatch(inputs);

    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toBeDefined();
  });
});
