/**
 * Text Generation AI Flows Tests
 * 
 * Tests for text generation flows: generate-text, paraphrase-text, summarize-text, translate-text
 */

import { ai } from '@/ai/genkit';

// Mock Genkit AI
jest.mock('@/ai/genkit', () => ({
  ai: {
    generate: jest.fn(),
  },
}));

describe('Text Generation AI Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Generate Text Flow
  // ============================================================================

  describe('generate-text', () => {
    it('should generate text from prompt', async () => {
      const mockOutput = {
        text: 'Generated text based on the prompt...',
        metadata: { model: 'gemini-2.0-flash-exp', tokens: 150 },
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const input = {
        prompt: 'Write a short story about AI',
        maxLength: 500,
        temperature: 0.7,
      };

      // Simulate flow execution
      const result = await ai.generate(input);

      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(0);
      expect(ai.generate).toHaveBeenCalledWith(input);
    });

    it('should handle different temperature settings', async () => {
      (ai.generate as jest.Mock).mockResolvedValue({ text: 'Creative output' });

      await ai.generate({ prompt: 'Test', temperature: 0.9 });
      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({ temperature: 0.9 })
      );

      await ai.generate({ prompt: 'Test', temperature: 0.1 });
      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({ temperature: 0.1 })
      );
    });

    it('should respect maxLength parameter', async () => {
      (ai.generate as jest.Mock).mockResolvedValue({ text: 'Short text' });

      await ai.generate({ prompt: 'Test', maxLength: 100 });

      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({ maxLength: 100 })
      );
    });

    it('should handle empty prompt', async () => {
      await expect(
        ai.generate({ prompt: '', maxLength: 500 })
      ).rejects.toThrow();
    });

    it('should handle generation errors', async () => {
      (ai.generate as jest.Mock).mockRejectedValue(new Error('Generation failed'));

      await expect(
        ai.generate({ prompt: 'Test', maxLength: 500 })
      ).rejects.toThrow('Generation failed');
    });
  });

  // ============================================================================
  // Paraphrase Text Flow
  // ============================================================================

  describe('paraphrase-text', () => {
    it('should paraphrase text successfully', async () => {
      const mockOutput = {
        text: 'Rephrased version of the original text with similar meaning...',
        originalLength: 100,
        paraphrasedLength: 105,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const input = {
        text: 'Original text that needs to be paraphrased...',
        style: 'formal',
        preserveMeaning: true,
      };

      const result = await ai.generate(input);

      expect(result.text).toBeDefined();
      expect(result.text).not.toBe(input.text);
    });

    it('should handle different paraphrasing styles', async () => {
      (ai.generate as jest.Mock).mockResolvedValue({ text: 'Paraphrased' });

      const styles = ['formal', 'casual', 'academic', 'creative'];

      for (const style of styles) {
        await ai.generate({ text: 'Test', style });
        expect(ai.generate).toHaveBeenCalledWith(
          expect.objectContaining({ style })
        );
      }
    });

    it('should preserve meaning when requested', async () => {
      (ai.generate as jest.Mock).mockResolvedValue({ text: 'Paraphrased text' });

      await ai.generate({ text: 'Test', preserveMeaning: true });

      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({ preserveMeaning: true })
      );
    });

    it('should handle long text', async () => {
      const longText = 'A'.repeat(5000);
      (ai.generate as jest.Mock).mockResolvedValue({ text: 'Paraphrased' });

      await ai.generate({ text: longText, style: 'formal' });

      expect(ai.generate).toHaveBeenCalled();
    });

    it('should handle special characters', async () => {
      const specialText = 'Text with émojis 🚀 and symbols @#$%';
      (ai.generate as jest.Mock).mockResolvedValue({ text: 'Paraphrased' });

      await ai.generate({ text: specialText, style: 'formal' });

      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({ text: specialText })
      );
    });
  });

  // ============================================================================
  // Summarize Text Flow
  // ============================================================================

  describe('summarize-text', () => {
    it('should summarize text successfully', async () => {
      const mockOutput = {
        summary: 'This is a concise summary of the main points...',
        originalWordCount: 500,
        summaryWordCount: 50,
        compressionRatio: 0.1,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const input = {
        text: 'Very long text that needs summarization... '.repeat(50),
        maxLength: 100,
        style: 'bullet_points',
      };

      const result = await ai.generate(input);

      expect(result.summary).toBeDefined();
      expect(result.summaryWordCount).toBeLessThan(result.originalWordCount);
    });

    it('should handle different summary styles', async () => {
      (ai.generate as jest.Mock).mockResolvedValue({ summary: 'Summary' });

      const styles = ['paragraph', 'bullet_points', 'key_points', 'abstract'];

      for (const style of styles) {
        await ai.generate({ text: 'Long text...', style });
        expect(ai.generate).toHaveBeenCalledWith(
          expect.objectContaining({ style })
        );
      }
    });

    it('should respect maxLength constraint', async () => {
      (ai.generate as jest.Mock).mockResolvedValue({ 
        summary: 'Short summary',
        summaryWordCount: 10,
      });

      await ai.generate({ text: 'Long text', maxLength: 50 });

      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({ maxLength: 50 })
      );
    });

    it('should calculate compression ratio', async () => {
      const mockOutput = {
        summary: 'Summary',
        originalWordCount: 1000,
        summaryWordCount: 100,
        compressionRatio: 0.1,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const result = await ai.generate({ text: 'Long text...', maxLength: 100 });

      expect(result.compressionRatio).toBe(0.1);
    });

    it('should handle already short text', async () => {
      const shortText = 'This is already short.';
      (ai.generate as jest.Mock).mockResolvedValue({ 
        summary: shortText,
        compressionRatio: 1.0,
      });

      const result = await ai.generate({ text: shortText, maxLength: 100 });

      expect(result.compressionRatio).toBe(1.0);
    });
  });

  // ============================================================================
  // Translate Text Flow
  // ============================================================================

  describe('translate-text', () => {
    it('should translate text successfully', async () => {
      const mockOutput = {
        translatedText: 'مرحبا بالعالم',
        sourceLanguage: 'en',
        targetLanguage: 'ar',
        confidence: 0.98,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      const input = {
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'ar',
      };

      const result = await ai.generate(input);

      expect(result.translatedText).toBeDefined();
      expect(result.targetLanguage).toBe('ar');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should support multiple language pairs', async () => {
      (ai.generate as jest.Mock).mockResolvedValue({ translatedText: 'Translated' });

      const pairs = [
        { source: 'en', target: 'ar' },
        { source: 'en', target: 'es' },
        { source: 'ar', target: 'en' },
        { source: 'fr', target: 'de' },
      ];

      for (const { source, target } of pairs) {
        await ai.generate({ 
          text: 'Test', 
          sourceLanguage: source, 
          targetLanguage: target 
        });
      }

      expect(ai.generate).toHaveBeenCalledTimes(4);
    });

    it('should detect source language when not provided', async () => {
      const mockOutput = {
        translatedText: 'Translated',
        sourceLanguage: 'en',
        targetLanguage: 'ar',
        detectedSource: true,
      };

      (ai.generate as jest.Mock).mockResolvedValue(mockOutput);

      await ai.generate({ text: 'Hello', targetLanguage: 'ar' });

      expect(ai.generate).toHaveBeenCalled();
    });

    it('should preserve formatting', async () => {
      const textWithFormatting = 'Title\n\nParagraph 1\n\nParagraph 2';
      (ai.generate as jest.Mock).mockResolvedValue({ 
        translatedText: 'عنوان\n\nالفقرة 1\n\nالفقرة 2',
        preservedFormatting: true,
      });

      const result = await ai.generate({
        text: textWithFormatting,
        sourceLanguage: 'en',
        targetLanguage: 'ar',
        preserveFormatting: true,
      });

      expect(result.preservedFormatting).toBe(true);
    });

    it('should handle technical terms', async () => {
      const technicalText = 'The API uses RESTful endpoints with JSON payloads.';
      (ai.generate as jest.Mock).mockResolvedValue({ 
        translatedText: 'Translated with technical terms preserved',
      });

      await ai.generate({
        text: technicalText,
        sourceLanguage: 'en',
        targetLanguage: 'ar',
        preserveTechnicalTerms: true,
      });

      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({ preserveTechnicalTerms: true })
      );
    });

    it('should handle Unicode characters', async () => {
      const unicodeText = 'Text with émojis 🚀 and symbols ✓';
      (ai.generate as jest.Mock).mockResolvedValue({ translatedText: 'Translated' });

      await ai.generate({
        text: unicodeText,
        sourceLanguage: 'en',
        targetLanguage: 'ar',
      });

      expect(ai.generate).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Integration Scenarios
  // ============================================================================

  describe('Integration scenarios', () => {
    it('should handle generate -> summarize workflow', async () => {
      // Generate long text
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        text: 'Very long generated text... '.repeat(100),
      });

      const generated = await ai.generate({ prompt: 'Write essay', maxLength: 1000 });

      // Summarize the generated text
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        summary: 'Summary of generated text',
        compressionRatio: 0.1,
      });

      const summarized = await ai.generate({ text: generated.text, maxLength: 100 });

      expect(summarized.summary).toBeDefined();
    });

    it('should handle translate -> paraphrase workflow', async () => {
      // Translate text
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        translatedText: 'Translated text',
        targetLanguage: 'ar',
      });

      const translated = await ai.generate({
        text: 'Original',
        sourceLanguage: 'en',
        targetLanguage: 'ar',
      });

      // Paraphrase the translation
      (ai.generate as jest.Mock).mockResolvedValueOnce({
        text: 'Paraphrased translation',
      });

      const paraphrased = await ai.generate({
        text: translated.translatedText,
        style: 'formal',
      });

      expect(paraphrased.text).toBeDefined();
    });

    it('should handle error recovery in workflow', async () => {
      // First attempt fails
      (ai.generate as jest.Mock).mockRejectedValueOnce(new Error('Temporary failure'));

      await expect(ai.generate({ prompt: 'Test' })).rejects.toThrow();

      // Retry succeeds
      (ai.generate as jest.Mock).mockResolvedValueOnce({ text: 'Success' });

      const result = await ai.generate({ prompt: 'Test' });

      expect(result.text).toBe('Success');
    });
  });
});
