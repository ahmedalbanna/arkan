/**
 * Tests for section metadata utility functions
 */

import {
  calculateWordCount,
  calculateCharacterCount,
  calculateReadTime,
  createGeneratedMetadata,
  createEditedMetadata,
  createGeneratingMetadata,
  createFailedMetadata,
  updateContentStatistics,
  addVersionToHistory,
  SectionStatus,
  defaultSectionMetadata,
} from '../section-metadata';

describe('Section Metadata Utils', () => {
  describe('calculateWordCount', () => {
    it('should count words correctly', () => {
      expect(calculateWordCount('Hello world')).toBe(2);
      expect(calculateWordCount('One two three four five')).toBe(5);
    });

    it('should handle empty string', () => {
      expect(calculateWordCount('')).toBe(0);
    });

    it('should handle whitespace-only string', () => {
      expect(calculateWordCount('   ')).toBe(0);
    });

    it('should handle multiple spaces', () => {
      expect(calculateWordCount('Word1    Word2     Word3')).toBe(3);
    });

    it('should handle newlines', () => {
      expect(calculateWordCount('Line1\nLine2\nLine3')).toBe(3);
    });
  });

  describe('calculateCharacterCount', () => {
    it('should count characters correctly', () => {
      expect(calculateCharacterCount('Hello')).toBe(5);
      expect(calculateCharacterCount('Hello world!')).toBe(12);
    });

    it('should handle empty string', () => {
      expect(calculateCharacterCount('')).toBe(0);
    });

    it('should count spaces', () => {
      expect(calculateCharacterCount('a b c')).toBe(5);
    });
  });

  describe('calculateReadTime', () => {
    it('should calculate read time (200 words per minute)', () => {
      const content200 = Array(200).fill('word').join(' ');
      expect(calculateReadTime(content200)).toBe(1);

      const content400 = Array(400).fill('word').join(' ');
      expect(calculateReadTime(content400)).toBe(2);
    });

    it('should round up partial minutes', () => {
      const content100 = Array(100).fill('word').join(' ');
      expect(calculateReadTime(content100)).toBe(1); // Rounds up 0.5 to 1
    });

    it('should handle empty content', () => {
      expect(calculateReadTime('')).toBe(0);
    });
  });

  describe('createGeneratedMetadata', () => {
    it('should create generated metadata', () => {
      const current = { ...defaultSectionMetadata };
      const updated = createGeneratedMetadata(current, 'ollama/gemma:2b');

      expect(updated.status).toBe(SectionStatus.GENERATED);
      expect(updated.generatedBy).toBe('ai');
      expect(updated.aiModel).toBe('ollama/gemma:2b');
      expect(updated.generationAttempts).toBe(1);
      expect(updated.generatedAt).toBeDefined();
    });

    it('should increment generation attempts', () => {
      const current = {
        ...defaultSectionMetadata,
        generationAttempts: 2,
      };
      const updated = createGeneratedMetadata(current, 'ollama/phi3:mini');

      expect(updated.generationAttempts).toBe(3);
    });

    it('should update timestamps', () => {
      const current = { ...defaultSectionMetadata };
      const before = Date.now();
      const updated = createGeneratedMetadata(current, 'ollama/gemma:2b');
      const after = Date.now();

      const generatedAt = new Date(updated.generatedAt!).getTime();
      const lastModified = new Date(updated.lastModifiedAt!).getTime();

      expect(generatedAt).toBeGreaterThanOrEqual(before);
      expect(generatedAt).toBeLessThanOrEqual(after);
      expect(lastModified).toBeGreaterThanOrEqual(before);
      expect(lastModified).toBeLessThanOrEqual(after);
    });
  });

  describe('createEditedMetadata', () => {
    it('should create edited metadata', () => {
      const current = {
        ...defaultSectionMetadata,
        status: SectionStatus.GENERATED,
      };
      const updated = createEditedMetadata(current);

      expect(updated.status).toBe(SectionStatus.EDITED);
      expect(updated.generatedBy).toBe('user');
    });

    it('should update lastModifiedAt', () => {
      const current = { ...defaultSectionMetadata };
      const before = Date.now();
      const updated = createEditedMetadata(current);
      const after = Date.now();

      const lastModified = new Date(updated.lastModifiedAt!).getTime();
      expect(lastModified).toBeGreaterThanOrEqual(before);
      expect(lastModified).toBeLessThanOrEqual(after);
    });
  });

  describe('createGeneratingMetadata', () => {
    it('should create generating metadata', () => {
      const current = { ...defaultSectionMetadata };
      const updated = createGeneratingMetadata(current);

      expect(updated.status).toBe(SectionStatus.GENERATING);
    });

    it('should preserve other metadata', () => {
      const current = {
        ...defaultSectionMetadata,
        aiModel: 'ollama/gemma:2b',
        wordCount: 100,
      };
      const updated = createGeneratingMetadata(current);

      expect(updated.aiModel).toBe('ollama/gemma:2b');
      expect(updated.wordCount).toBe(100);
    });
  });

  describe('createFailedMetadata', () => {
    it('should create failed metadata', () => {
      const current = { ...defaultSectionMetadata };
      const updated = createFailedMetadata(current);

      expect(updated.status).toBe(SectionStatus.FAILED);
    });

    it('should increment generation attempts', () => {
      const current = {
        ...defaultSectionMetadata,
        generationAttempts: 1,
      };
      const updated = createFailedMetadata(current);

      expect(updated.generationAttempts).toBe(2);
    });
  });

  describe('updateContentStatistics', () => {
    it('should update all statistics', () => {
      const metadata = { ...defaultSectionMetadata };
      const content = 'This is test content with exactly ten words here now.';
      const updated = updateContentStatistics(metadata, content);

      expect(updated.wordCount).toBe(10);
      expect(updated.characterCount).toBe(content.length);
      expect(updated.estimatedReadTime).toBeGreaterThan(0);
    });

    it('should handle empty content', () => {
      const metadata = { ...defaultSectionMetadata };
      const updated = updateContentStatistics(metadata, '');

      expect(updated.wordCount).toBe(0);
      expect(updated.characterCount).toBe(0);
      expect(updated.estimatedReadTime).toBe(0);
    });
  });

  describe('addVersionToHistory', () => {
    it('should add version to history', () => {
      const metadata = { ...defaultSectionMetadata };
      const updated = addVersionToHistory(metadata, 'Original content');

      expect(updated.previousVersions).toBeDefined();
      expect(updated.previousVersions!.length).toBe(1);
      expect(updated.previousVersions![0].content).toBe('Original content');
      expect(updated.version).toBe(2);
    });

    it('should maintain only last 5 versions', () => {
      let metadata = { ...defaultSectionMetadata };

      // Add 10 versions
      for (let i = 1; i <= 10; i++) {
        metadata = addVersionToHistory(metadata, `Version ${i}`);
      }

      expect(metadata.previousVersions!.length).toBe(5);
      expect(metadata.version).toBe(11);
    });

    it('should keep most recent versions', () => {
      let metadata = { ...defaultSectionMetadata };

      // Add 7 versions
      for (let i = 1; i <= 7; i++) {
        metadata = addVersionToHistory(metadata, `Version ${i}`);
      }

      // Should keep versions 3-7 (most recent 5)
      expect(metadata.previousVersions![0].content).toBe('Version 7');
      expect(metadata.previousVersions![4].content).toBe('Version 3');
    });

    it('should include timestamp and version number', () => {
      const metadata = { ...defaultSectionMetadata };
      const before = Date.now();
      const updated = addVersionToHistory(metadata, 'Content');
      const after = Date.now();

      const version = updated.previousVersions![0];
      expect(version).toHaveProperty('timestamp');
      expect(version).toHaveProperty('version');
      expect(version.version).toBe(1);

      const timestamp = new Date(version.timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('defaultSectionMetadata', () => {
    it('should have correct default values', () => {
      expect(defaultSectionMetadata.status).toBe(SectionStatus.DRAFT);
      expect(defaultSectionMetadata.version).toBe(1);
      expect(defaultSectionMetadata.generationAttempts).toBe(0);
      expect(defaultSectionMetadata.previousVersions).toEqual([]);
    });

    it('should have timestamps', () => {
      expect(defaultSectionMetadata.createdAt).toBeDefined();
      expect(defaultSectionMetadata.lastModifiedAt).toBeDefined();
    });
  });
});
