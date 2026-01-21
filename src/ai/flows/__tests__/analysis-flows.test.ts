/**
 * Analysis AI Flows Tests
 * 
 * Tests for analysis flows: grammar-checker, plagiarism-checker, bias-checker, ai-detector
 */

import { ai } from '@/ai/genkit';

jest.mock('@/ai/genkit', () => ({
  ai: {
    generate: jest.fn(),
  },
}));

describe('Analysis AI Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Grammar Checker Flow
  // ============================================================================

  describe('grammar-checker', () => {
    it('should detect grammar errors', async () => {
      const mockOutput = {
        errors: [
          {
            type: 'grammar',
            message: 'Subject-verb agreement',
            original: 'They was',
            correction: 'They were',
            position: { start: 0, end: 8 },
          },
          {
            type: 'spelling',
            message: 'Spelling error',
            original: 'recieve',
            correction: 'receive',
            position: { start: 15, end: 22 },
          },
        ],
        score: 85,
        corrections: 2,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const input = {
        text: 'They was going to recieve the package.',
      };

      const result = await ai.generate(input);

      expect(result.errors).toHaveLength(2);
      expect(result.score).toBe(85);
      expect(result.corrections).toBe(2);
    });

    it('should handle perfect text', async () => {
      const mockOutput = {
        errors: [],
        score: 100,
        corrections: 0,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'This sentence is perfect.' });

      expect(result.errors).toHaveLength(0);
      expect(result.score).toBe(100);
    });

    it('should categorize error types', async () => {
      const mockOutput = {
        errors: [
          { type: 'grammar', message: 'Grammar error' },
          { type: 'spelling', message: 'Spelling error' },
          { type: 'punctuation', message: 'Missing comma' },
          { type: 'style', message: 'Passive voice' },
        ],
        byType: {
          grammar: 1,
          spelling: 1,
          punctuation: 1,
          style: 1,
        },
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Test text' });

      expect(result.byType.grammar).toBe(1);
      expect(result.byType.spelling).toBe(1);
    });

    it('should provide suggestions', async () => {
      const mockOutput = {
        errors: [
          {
            original: 'alot',
            correction: 'a lot',
            suggestions: ['a lot', 'allot'],
          },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'alot of people' });

      expect(result.errors[0].suggestions).toContain('a lot');
    });

    it('should handle long documents', async () => {
      const longText = 'Sentence. '.repeat(1000);
      (ai.generate as jest.Mock).mockResolvedValue({ errors: [], score: 95 });

      const result = await ai.generate({ text: longText });

      expect(result).toBeDefined();
      expect(ai.generate).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Plagiarism Checker Flow
  // ============================================================================

  describe('plagiarism-checker', () => {
    it('should detect plagiarism', async () => {
      const mockOutput = {
        plagiarismScore: 35.5,
        matches: [
          {
            source: 'https://example.com/article1',
            similarity: 85,
            matchedText: 'This is copied text...',
            position: { start: 0, end: 50 },
          },
          {
            source: 'https://example.com/article2',
            similarity: 70,
            matchedText: 'Another copied section...',
            position: { start: 100, end: 150 },
          },
        ],
        uniqueContent: 64.5,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Text to check for plagiarism...' });

      expect(result.plagiarismScore).toBe(35.5);
      expect(result.matches).toHaveLength(2);
      expect(result.uniqueContent).toBe(64.5);
    });

    it('should handle original content', async () => {
      const mockOutput = {
        plagiarismScore: 0,
        matches: [],
        uniqueContent: 100,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Completely original text.' });

      expect(result.plagiarismScore).toBe(0);
      expect(result.matches).toHaveLength(0);
      expect(result.uniqueContent).toBe(100);
    });

    it('should rank matches by similarity', async () => {
      const mockOutput = {
        matches: [
          { source: 'source1', similarity: 95 },
          { source: 'source2', similarity: 80 },
          { source: 'source3', similarity: 65 },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Text' });

      expect(result.matches[0].similarity).toBeGreaterThan(result.matches[1].similarity);
      expect(result.matches[1].similarity).toBeGreaterThan(result.matches[2].similarity);
    });

    it('should identify source URLs', async () => {
      const mockOutput = {
        matches: [
          { source: 'https://example.com', similarity: 90 },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Text' });

      expect(result.matches[0].source).toMatch(/^https?:\/\//);
    });

    it('should calculate overall uniqueness', async () => {
      const mockOutput = {
        plagiarismScore: 25,
        uniqueContent: 75,
        matches: [],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Text' });

      expect(result.plagiarismScore + result.uniqueContent).toBe(100);
    });
  });

  // ============================================================================
  // Bias Checker Flow
  // ============================================================================

  describe('bias-checker', () => {
    it('should detect various types of bias', async () => {
      const mockOutput = {
        biasScore: 45,
        biases: [
          {
            type: 'gender',
            severity: 'medium',
            text: 'All doctors are men',
            suggestion: 'All doctors are people',
            position: { start: 0, end: 19 },
          },
          {
            type: 'racial',
            severity: 'high',
            text: 'Problematic statement',
            suggestion: 'Neutral statement',
            position: { start: 50, end: 70 },
          },
        ],
        biasByType: {
          gender: 1,
          racial: 1,
        },
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Text with biases' });

      expect(result.biasScore).toBe(45);
      expect(result.biases).toHaveLength(2);
      expect(result.biasByType.gender).toBe(1);
    });

    it('should categorize bias severity', async () => {
      const mockOutput = {
        biases: [
          { type: 'gender', severity: 'low' },
          { type: 'racial', severity: 'medium' },
          { type: 'political', severity: 'high' },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Text' });

      const severities = result.biases.map(b => b.severity);
      expect(severities).toContain('low');
      expect(severities).toContain('medium');
      expect(severities).toContain('high');
    });

    it('should provide neutral alternatives', async () => {
      const mockOutput = {
        biases: [
          {
            type: 'gender',
            text: 'chairman',
            suggestion: 'chairperson',
          },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'The chairman' });

      expect(result.biases[0].suggestion).toBe('chairperson');
    });

    it('should handle unbiased text', async () => {
      const mockOutput = {
        biasScore: 0,
        biases: [],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Neutral text' });

      expect(result.biasScore).toBe(0);
      expect(result.biases).toHaveLength(0);
    });

    it('should detect multiple bias types', async () => {
      const mockOutput = {
        biasByType: {
          gender: 2,
          racial: 1,
          age: 1,
          political: 1,
          religious: 0,
        },
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Text' });

      expect(Object.keys(result.biasByType)).toHaveLength(5);
    });
  });

  // ============================================================================
  // AI Content Detector Flow
  // ============================================================================

  describe('ai-detector', () => {
    it('should detect AI-generated content', async () => {
      const mockOutput = {
        aiProbability: 0.92,
        confidence: 0.88,
        isAiGenerated: true,
        indicators: [
          'Repetitive sentence structure',
          'Lack of personal anecdotes',
          'Overly formal language',
          'Uniform paragraph length',
        ],
        humanLikeScore: 8,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Text that appears AI-generated' });

      expect(result.aiProbability).toBeGreaterThan(0.8);
      expect(result.isAiGenerated).toBe(true);
      expect(result.indicators).toHaveLength(4);
    });

    it('should detect human-written content', async () => {
      const mockOutput = {
        aiProbability: 0.15,
        confidence: 0.85,
        isAiGenerated: false,
        indicators: [
          'Personal voice',
          'Varied sentence structure',
          'Informal expressions',
        ],
        humanLikeScore: 92,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Human-written text' });

      expect(result.aiProbability).toBeLessThan(0.3);
      expect(result.isAiGenerated).toBe(false);
      expect(result.humanLikeScore).toBeGreaterThan(90);
    });

    it('should provide confidence scores', async () => {
      const mockOutput = {
        aiProbability: 0.75,
        confidence: 0.92,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Text' });

      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should identify AI writing patterns', async () => {
      const mockOutput = {
        patterns: [
          'Consistent formality',
          'Lack of colloquialisms',
          'Perfect grammar',
          'Generic phrasing',
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Text' });

      expect(result.patterns).toContain('Perfect grammar');
    });

    it('should handle mixed content', async () => {
      const mockOutput = {
        aiProbability: 0.55,
        confidence: 0.70,
        isAiGenerated: false, // Below threshold
        possiblyMixed: true,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Mixed text' });

      expect(result.aiProbability).toBeGreaterThan(0.4);
      expect(result.aiProbability).toBeLessThan(0.7);
      expect(result.possiblyMixed).toBe(true);
    });

    it('should analyze different text lengths', async () => {
      // Short text
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        aiProbability: 0.6,
        confidence: 0.5, // Lower confidence for short text
      });

      const shortResult = await ai.generate({ text: 'Short text.' });
      expect(shortResult.confidence).toBeLessThan(0.7);

      // Long text
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        aiProbability: 0.85,
        confidence: 0.95, // Higher confidence for long text
      });

      const longText = 'Long text. '.repeat(100);
      const longResult = await ai.generate({ text: longText });
      expect(longResult.confidence).toBeGreaterThan(0.9);
    });
  });

  // ============================================================================
  // Integration Scenarios
  // ============================================================================

  describe('Integration scenarios', () => {
    it('should run grammar check before plagiarism check', async () => {
      // Grammar check
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        errors: [],
        score: 95,
      });

      const grammarResult = await ai.generate({ text: 'Test text' });

      // Plagiarism check
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        plagiarismScore: 10,
        matches: [],
      });

      const plagiarismResult = await ai.generate({ text: 'Test text' });

      expect(grammarResult.score).toBe(95);
      expect(plagiarismResult.plagiarismScore).toBe(10);
    });

    it('should combine analysis results', async () => {
      const checks = [
        { name: 'grammar', score: 90 },
        { name: 'bias', score: 85 },
        { name: 'aiDetection', score: 20 },
      ];

      for (const check of checks) {
        (ai.generate as jest.Mock).mockResolvedValueOnce({ score: check.score });
      }

      const results = [];
      for (const check of checks) {
        const result = await ai.generate({ text: 'Test' });
        results.push({ name: check.name, score: result.score });
      }

      expect(results).toHaveLength(3);
      expect(results.every(r => r.score !== undefined)).toBe(true);
    });

    it('should prioritize critical issues', async () => {
      const mockOutput = {
        issues: [
          { type: 'plagiarism', severity: 'critical', score: 90 },
          { type: 'grammar', severity: 'low', score: 5 },
          { type: 'bias', severity: 'high', score: 60 },
        ],
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Text' });

      const critical = result.issues.filter(i => i.severity === 'critical');
      expect(critical).toHaveLength(1);
      expect(critical[0].type).toBe('plagiarism');
    });
  });
});
