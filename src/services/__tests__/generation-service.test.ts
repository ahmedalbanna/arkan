/**
 * Generation Service Tests
 * 
 * Tests for generation logging service - Critical for tracking AI operations
 */

import { logGeneration } from '../generation-service';
import { adminDb } from '@/lib/firebase/server-init';

// Mock Firebase Admin
jest.mock('@/lib/firebase/server-init', () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

describe('Generation Service', () => {
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Firestore collection
    mockCollection = {
      add: jest.fn().mockResolvedValue({ id: 'gen_123' }),
    };

    (adminDb.collection as jest.Mock).mockReturnValue(mockCollection);

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // Basic Logging Operations
  // ============================================================================

  describe('logGeneration', () => {
    it('should log generation successfully', async () => {
      const logData = {
        agentId: 'agent_123',
        userId: 'user_456',
        input: { text: 'Test input' },
        output: { result: 'Test output' },
        creditCost: 5,
      };

      await logGeneration(logData);

      expect(adminDb.collection).toHaveBeenCalledWith('agent_generations');
      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'agent_123',
          userId: 'user_456',
          input: { text: 'Test input' },
          output: { result: 'Test output' },
          creditCost: 5,
          createdAt: expect.any(String),
        })
      );
    });

    it('should add timestamp to log entry', async () => {
      const beforeLog = new Date().toISOString();

      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input: {},
        output: {},
        creditCost: 1,
      });

      const callArgs = mockCollection.add.mock.calls[0][0];
      const afterLog = new Date().toISOString();

      expect(callArgs.createdAt).toBeDefined();
      expect(new Date(callArgs.createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeLog).getTime()
      );
      expect(new Date(callArgs.createdAt).getTime()).toBeLessThanOrEqual(
        new Date(afterLog).getTime()
      );
    });

    it('should handle complex input data', async () => {
      const complexInput = {
        text: 'Generate a report',
        options: {
          language: 'en',
          style: 'formal',
          sections: ['intro', 'body', 'conclusion'],
        },
        metadata: {
          projectId: 'proj_123',
          version: '1.0',
        },
      };

      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input: complexInput,
        output: {},
        creditCost: 10,
      });

      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          input: complexInput,
        })
      );
    });

    it('should handle complex output data', async () => {
      const complexOutput = {
        text: 'Generated report...',
        metadata: {
          wordCount: 1500,
          duration: 5000,
          model: 'gemini-pro',
        },
        sections: [
          { title: 'Introduction', content: '...' },
          { title: 'Body', content: '...' },
        ],
      };

      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input: {},
        output: complexOutput,
        creditCost: 15,
      });

      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          output: complexOutput,
        })
      );
    });

    it('should handle zero credit cost', async () => {
      await logGeneration({
        agentId: 'agent_free',
        userId: 'user_456',
        input: {},
        output: {},
        creditCost: 0,
      });

      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          creditCost: 0,
        })
      );
    });

    it('should handle large credit costs', async () => {
      await logGeneration({
        agentId: 'agent_expensive',
        userId: 'user_456',
        input: {},
        output: {},
        creditCost: 100,
      });

      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          creditCost: 100,
        })
      );
    });

    it('should handle decimal credit costs', async () => {
      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input: {},
        output: {},
        creditCost: 2.5,
      });

      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          creditCost: 2.5,
        })
      );
    });
  });

  // ============================================================================
  // Different Agent Types
  // ============================================================================

  describe('Different agent types', () => {
    it('should log text generation', async () => {
      await logGeneration({
        agentId: 'text-generator',
        userId: 'user_123',
        input: { prompt: 'Write a story' },
        output: { text: 'Once upon a time...' },
        creditCost: 3,
      });

      expect(mockCollection.add).toHaveBeenCalled();
    });

    it('should log image generation', async () => {
      await logGeneration({
        agentId: 'image-generator',
        userId: 'user_123',
        input: { prompt: 'A sunset' },
        output: { imageUrl: 'https://example.com/image.png' },
        creditCost: 10,
      });

      expect(mockCollection.add).toHaveBeenCalled();
    });

    it('should log analysis operations', async () => {
      await logGeneration({
        agentId: 'plagiarism-checker',
        userId: 'user_123',
        input: { text: 'Document content...' },
        output: { plagiarismScore: 5.2, matches: [] },
        creditCost: 5,
      });

      expect(mockCollection.add).toHaveBeenCalled();
    });

    it('should log transformation operations', async () => {
      await logGeneration({
        agentId: 'markdown-to-pdf',
        userId: 'user_123',
        input: { markdown: '# Title\n\nContent' },
        output: { pdfUrl: 'https://example.com/doc.pdf' },
        creditCost: 2,
      });

      expect(mockCollection.add).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Error Handling
  // ============================================================================

  describe('Error handling', () => {
    it('should not throw when logging fails', async () => {
      mockCollection.add.mockRejectedValue(new Error('Database error'));

      // Should not throw - logging is non-critical
      await expect(
        logGeneration({
          agentId: 'agent_123',
          userId: 'user_456',
          input: {},
          output: {},
          creditCost: 5,
        })
      ).resolves.not.toThrow();
    });

    it('should log error when logging fails', async () => {
      const error = new Error('Network timeout');
      mockCollection.add.mockRejectedValue(error);

      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input: {},
        output: {},
        creditCost: 5,
      });

      expect(console.error).toHaveBeenCalledWith(
        'Failed to log generation for agent agent_123:',
        error
      );
    });

    it('should handle Firestore permission errors', async () => {
      mockCollection.add.mockRejectedValue(
        new Error('PERMISSION_DENIED: Missing or insufficient permissions')
      );

      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input: {},
        output: {},
        creditCost: 5,
      });

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle Firestore quota errors', async () => {
      mockCollection.add.mockRejectedValue(
        new Error('RESOURCE_EXHAUSTED: Quota exceeded')
      );

      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input: {},
        output: {},
        creditCost: 5,
      });

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle null/undefined values gracefully', async () => {
      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input: null as any,
        output: undefined as any,
        creditCost: 0,
      });

      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          input: null,
          output: undefined,
        })
      );
    });
  });

  // ============================================================================
  // Multiple Operations
  // ============================================================================

  describe('Multiple operations', () => {
    it('should handle concurrent logging', async () => {
      const logs = [
        {
          agentId: 'agent_1',
          userId: 'user_1',
          input: {},
          output: {},
          creditCost: 1,
        },
        {
          agentId: 'agent_2',
          userId: 'user_2',
          input: {},
          output: {},
          creditCost: 2,
        },
        {
          agentId: 'agent_3',
          userId: 'user_3',
          input: {},
          output: {},
          creditCost: 3,
        },
      ];

      await Promise.all(logs.map(log => logGeneration(log)));

      expect(mockCollection.add).toHaveBeenCalledTimes(3);
    });

    it('should handle sequential logging', async () => {
      await logGeneration({
        agentId: 'agent_1',
        userId: 'user_123',
        input: { step: 1 },
        output: { result: 1 },
        creditCost: 1,
      });

      await logGeneration({
        agentId: 'agent_2',
        userId: 'user_123',
        input: { step: 2 },
        output: { result: 2 },
        creditCost: 2,
      });

      await logGeneration({
        agentId: 'agent_3',
        userId: 'user_123',
        input: { step: 3 },
        output: { result: 3 },
        creditCost: 3,
      });

      expect(mockCollection.add).toHaveBeenCalledTimes(3);
    });

    it('should continue logging after failure', async () => {
      // First call fails
      mockCollection.add.mockRejectedValueOnce(new Error('Temporary error'));

      await logGeneration({
        agentId: 'agent_1',
        userId: 'user_123',
        input: {},
        output: {},
        creditCost: 1,
      });

      // Second call succeeds
      mockCollection.add.mockResolvedValueOnce({ id: 'gen_456' });

      await logGeneration({
        agentId: 'agent_2',
        userId: 'user_123',
        input: {},
        output: {},
        creditCost: 2,
      });

      expect(mockCollection.add).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================================
  // Data Integrity
  // ============================================================================

  describe('Data integrity', () => {
    it('should preserve data types in input', async () => {
      const input = {
        string: 'text',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { key: 'value' },
        null: null,
      };

      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input,
        output: {},
        creditCost: 5,
      });

      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          input,
        })
      );
    });

    it('should preserve data types in output', async () => {
      const output = {
        string: 'result',
        number: 99.9,
        boolean: false,
        array: ['a', 'b', 'c'],
        object: { nested: { deep: 'value' } },
      };

      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input: {},
        output,
        creditCost: 5,
      });

      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          output,
        })
      );
    });

    it('should handle large data payloads', async () => {
      const largeInput = {
        text: 'A'.repeat(10000), // 10KB of text
      };

      const largeOutput = {
        result: 'B'.repeat(50000), // 50KB of text
      };

      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input: largeInput,
        output: largeOutput,
        creditCost: 20,
      });

      expect(mockCollection.add).toHaveBeenCalled();
    });

    it('should handle special characters in data', async () => {
      const specialChars = {
        unicode: '你好世界 🚀 émojis',
        escaped: 'Line 1\nLine 2\tTabbed',
        quotes: 'He said "Hello"',
      };

      await logGeneration({
        agentId: 'agent_123',
        userId: 'user_456',
        input: specialChars,
        output: specialChars,
        creditCost: 5,
      });

      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          input: specialChars,
          output: specialChars,
        })
      );
    });
  });

  // ============================================================================
  // Use Cases
  // ============================================================================

  describe('Real-world use cases', () => {
    it('should log document generation', async () => {
      await logGeneration({
        agentId: 'document-writer',
        userId: 'user_academic',
        input: {
          title: 'Research Paper',
          topic: 'Machine Learning',
          sections: ['Introduction', 'Methodology', 'Results'],
          style: 'academic',
        },
        output: {
          document: '# Research Paper\n\n...',
          wordCount: 2500,
          readingTime: 10,
        },
        creditCost: 15,
      });

      expect(mockCollection.add).toHaveBeenCalled();
    });

    it('should log grammar checking', async () => {
      await logGeneration({
        agentId: 'grammar-checker',
        userId: 'user_student',
        input: {
          text: 'This is a sentance with errors.',
        },
        output: {
          corrections: [
            { original: 'sentance', corrected: 'sentence', position: 10 },
          ],
          score: 95,
        },
        creditCost: 3,
      });

      expect(mockCollection.add).toHaveBeenCalled();
    });

    it('should log translation', async () => {
      await logGeneration({
        agentId: 'translator',
        userId: 'user_translator',
        input: {
          text: 'Hello, world!',
          sourceLanguage: 'en',
          targetLanguage: 'ar',
        },
        output: {
          translatedText: 'مرحبا بالعالم!',
          confidence: 0.98,
        },
        creditCost: 2,
      });

      expect(mockCollection.add).toHaveBeenCalled();
    });

    it('should log summarization', async () => {
      await logGeneration({
        agentId: 'summarizer',
        userId: 'user_researcher',
        input: {
          text: 'Very long article...',
          maxLength: 100,
        },
        output: {
          summary: 'Article summary...',
          compressionRatio: 0.1,
        },
        creditCost: 5,
      });

      expect(mockCollection.add).toHaveBeenCalled();
    });

    it('should log AI detection', async () => {
      await logGeneration({
        agentId: 'ai-detector',
        userId: 'user_teacher',
        input: {
          text: 'Essay content...',
        },
        output: {
          aiProbability: 0.85,
          confidence: 0.92,
          reasons: ['Uniform sentence structure', 'Lack of personal voice'],
        },
        creditCost: 4,
      });

      expect(mockCollection.add).toHaveBeenCalled();
    });
  });
});
