
/**
 * Tests for Embeddings Service
 */

import { chunkText, estimateTokens } from '../embeddings';

describe('Embeddings Service', () => {
  describe('chunkText', () => {
    it('should return single chunk for short text', () => {
      const text = 'Short text';
      const chunks = chunkText(text, { chunkSize: 100 });
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(text);
    });

    it('should split long text into multiple chunks', () => {
      const text = 'a'.repeat(1000);
      const chunks = chunkText(text, { chunkSize: 200, overlap: 50 });
      
      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0].length).toBeLessThanOrEqual(200);
    });

    it('should preserve paragraphs when enabled', () => {
      const text = 'Paragraph one.\n\nParagraph two.\n\nParagraph three.';
      const chunks = chunkText(text, {
        chunkSize: 30,
        preserveParagraphs: true,
      });
      
      expect(chunks.length).toBeGreaterThan(0);
      // Each chunk should contain complete paragraphs
      chunks.forEach(chunk => {
        expect(chunk.trim().length).toBeGreaterThan(0);
      });
    });

    it('should handle empty text', () => {
      const chunks = chunkText('', { chunkSize: 100 });
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe('');
    });
  });

  describe('estimateTokens', () => {
    it('should estimate tokens correctly', () => {
      const text = 'Hello world';
      const tokens = estimateTokens(text);
      
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBe(Math.ceil(text.length / 4));
    });

    it('should handle empty text', () => {
      expect(estimateTokens('')).toBe(0);
    });
  });
});
