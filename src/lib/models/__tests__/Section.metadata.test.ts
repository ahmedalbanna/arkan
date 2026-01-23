/**
 * Tests for Section metadata tracking functionality
 */

import { SectionStatus } from '@/types';
import { Section } from '../section';

describe('Section - Metadata Tracking', () => {
  describe('Initialization', () => {
    it('should initialize with default metadata', () => {
      const section = new Section({
        id: 'test-1',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      expect(section.getStatus()).toBe(SectionStatus.DRAFT);
      expect(section.getWordCount()).toBe(0);
      expect(section.getReadTime()).toBe(0);
      expect(section.getGenerationAttempts()).toBe(0);
    });

    it('should preserve existing metadata', () => {
      const section = new Section({
        id: 'test-2',
        title: 'Test Section',
        type: 'text',
        content: '',
        metadata: {
          status: SectionStatus.GENERATED,
          aiModel: 'ollama/gemma:2b',
          wordCount: 100,
        },
      });

      expect(section.getStatus()).toBe(SectionStatus.GENERATED);
      expect(section.getAiModel()).toBe('ollama/gemma:2b');
      expect(section.getWordCount()).toBe(100);
    });
  });

  describe('markAsGenerating', () => {
    it('should mark section as generating', () => {
      const section = new Section({
        id: 'test-3',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      const updated = section.markAsGenerating();

      expect(updated.getStatus()).toBe(SectionStatus.GENERATING);
      expect(updated.isGenerating()).toBe(true);
    });

    it('should update lastModifiedAt timestamp', () => {
      const section = new Section({
        id: 'test-4',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      const before = Date.now();
      const updated = section.markAsGenerating();
      const after = Date.now();

      const lastModified = (updated.metadata as any).lastModifiedAt;
      const timestamp = new Date(lastModified).getTime();

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('markAsGenerated', () => {
    it('should mark section as generated with AI model', () => {
      const section = new Section({
        id: 'test-5',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      const content = 'This is generated content with multiple words.';
      const updated = section.markAsGenerated('ollama/gemma:2b', content);

      expect(updated.getStatus()).toBe(SectionStatus.GENERATED);
      expect(updated.getAiModel()).toBe('ollama/gemma:2b');
      expect(updated.content).toBe(content);
      expect(updated.isGenerated()).toBe(true);
    });

    it('should calculate word count and statistics', () => {
      const section = new Section({
        id: 'test-6',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      const content = 'This is a test content with exactly ten words here.';
      const updated = section.markAsGenerated('ollama/phi3:mini', content);

      expect(updated.getWordCount()).toBe(10);
      expect(updated.getReadTime()).toBeGreaterThan(0);
    });

    it('should increment generation attempts', () => {
      const section = new Section({
        id: 'test-7',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      const updated = section.markAsGenerated('ollama/gemma:2b', 'Test content');

      expect(updated.getGenerationAttempts()).toBe(1);
    });

    it('should save version history when content changes', () => {
      const section = new Section({
        id: 'test-8',
        title: 'Test Section',
        type: 'text',
        content: 'Original content',
      });

      const updated = section.markAsGenerated('ollama/gemma:2b', 'New content');
      const metadata = updated.metadata as any;

      expect(metadata.previousVersions).toBeDefined();
      expect(metadata.previousVersions.length).toBeGreaterThan(0);
      expect(metadata.previousVersions[0].content).toBe('Original content');
    });

    it('should set generatedAt timestamp', () => {
      const section = new Section({
        id: 'test-9',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      const before = Date.now();
      const updated = section.markAsGenerated('ollama/gemma:2b', 'Test content');
      const after = Date.now();

      const generatedAt = updated.getGeneratedAt();
      expect(generatedAt).toBeDefined();

      const timestamp = new Date(generatedAt!).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('markAsFailed', () => {
    it('should mark section as failed', () => {
      const section = new Section({
        id: 'test-10',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      const updated = section.markAsFailed();

      expect(updated.getStatus()).toBe(SectionStatus.FAILED);
    });

    it('should increment generation attempts on failure', () => {
      const section = new Section({
        id: 'test-11',
        title: 'Test Section',
        type: 'text',
        content: '',
        metadata: {
          generationAttempts: 1,
        },
      });

      const updated = section.markAsFailed();

      expect(updated.getGenerationAttempts()).toBe(2);
    });
  });

  describe('markAsEdited', () => {
    it('should mark section as edited', () => {
      const section = new Section({
        id: 'test-12',
        title: 'Test Section',
        type: 'text',
        content: 'Original content',
        metadata: {
          status: SectionStatus.GENERATED,
        },
      });

      const updated = section.markAsEdited('Edited content');

      expect(updated.getStatus()).toBe(SectionStatus.EDITED);
      expect(updated.content).toBe('Edited content');
    });

    it('should update content statistics', () => {
      const section = new Section({
        id: 'test-13',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      const content = 'This is manually edited content with words.';
      const updated = section.markAsEdited(content);

      expect(updated.getWordCount()).toBeGreaterThan(0);
    });

    it('should save version history', () => {
      const section = new Section({
        id: 'test-14',
        title: 'Test Section',
        type: 'text',
        content: 'Original content',
      });

      const updated = section.markAsEdited('Edited content');
      const metadata = updated.metadata as any;

      expect(metadata.previousVersions).toBeDefined();
      expect(metadata.previousVersions[0].content).toBe('Original content');
    });

    it('should set generatedBy to user', () => {
      const section = new Section({
        id: 'test-15',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      const updated = section.markAsEdited('Edited content');
      const metadata = updated.metadata as any;

      expect(metadata.generatedBy).toBe('user');
    });
  });

  describe('updateContent', () => {
    it('should update content without changing status when editedByUser is false', () => {
      const section = new Section({
        id: 'test-16',
        title: 'Test Section',
        type: 'text',
        content: '',
        metadata: {
          status: SectionStatus.GENERATED,
        },
      });

      const updated = section.updateContent('Updated content', false);

      expect(updated.content).toBe('Updated content');
      expect(updated.getStatus()).toBe(SectionStatus.GENERATED);
    });

    it('should mark as edited when editedByUser is true', () => {
      const section = new Section({
        id: 'test-17',
        title: 'Test Section',
        type: 'text',
        content: 'Original',
        metadata: {
          status: SectionStatus.GENERATED,
        },
      });

      const updated = section.updateContent('Edited', true);

      expect(updated.getStatus()).toBe(SectionStatus.EDITED);
    });

    it('should update statistics', () => {
      const section = new Section({
        id: 'test-18',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      const content = 'New content with some words.';
      const updated = section.updateContent(content);

      expect(updated.getWordCount()).toBeGreaterThan(0);
    });
  });

  describe('Status Helpers', () => {
    it('should correctly identify generated sections', () => {
      const generated = new Section({
        id: 'test-19',
        title: 'Test',
        type: 'text',
        content: '',
        metadata: { status: SectionStatus.GENERATED },
      });

      expect(generated.isGenerated()).toBe(true);
    });

    it('should correctly identify edited sections as generated', () => {
      const edited = new Section({
        id: 'test-20',
        title: 'Test',
        type: 'text',
        content: '',
        metadata: { status: SectionStatus.EDITED },
      });

      expect(edited.isGenerated()).toBe(true);
    });

    it('should correctly identify generating sections', () => {
      const generating = new Section({
        id: 'test-21',
        title: 'Test',
        type: 'text',
        content: '',
        metadata: { status: SectionStatus.GENERATING },
      });

      expect(generating.isGenerating()).toBe(true);
    });

    it('should return false for draft sections', () => {
      const draft = new Section({
        id: 'test-22',
        title: 'Test',
        type: 'text',
        content: '',
      });

      expect(draft.isGenerated()).toBe(false);
      expect(draft.isGenerating()).toBe(false);
    });
  });

  describe('Version History', () => {
    it('should maintain up to 5 previous versions', () => {
      let section = new Section({
        id: 'test-23',
        title: 'Test Section',
        type: 'text',
        content: 'Version 1',
      });

      // Generate 6 versions
      for (let i = 2; i <= 7; i++) {
        section = section.markAsGenerated('ollama/gemma:2b', `Version ${i}`);
      }

      const metadata = section.metadata as any;
      expect(metadata.previousVersions.length).toBeLessThanOrEqual(5);
    });

    it('should store version metadata correctly', () => {
      const section = new Section({
        id: 'test-24',
        title: 'Test Section',
        type: 'text',
        content: 'Version 1',
      });

      const updated = section.markAsGenerated('ollama/gemma:2b', 'Version 2');
      const metadata = updated.metadata as any;
      const firstVersion = metadata.previousVersions[0];

      expect(firstVersion).toHaveProperty('content');
      expect(firstVersion).toHaveProperty('timestamp');
      expect(firstVersion).toHaveProperty('version');
      expect(firstVersion.content).toBe('Version 1');
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate word count accurately', () => {
      const section = new Section({
        id: 'test-25',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      const content = 'One two three four five six seven eight nine ten.';
      const updated = section.markAsGenerated('ollama/gemma:2b', content);

      expect(updated.getWordCount()).toBe(10);
    });

    it('should calculate read time (200 words per minute)', () => {
      const section = new Section({
        id: 'test-26',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      // 400 words should take 2 minutes to read
      const content = Array(400).fill('word').join(' ');
      const updated = section.markAsGenerated('ollama/gemma:2b', content);

      expect(updated.getReadTime()).toBe(2);
    });

    it('should handle empty content gracefully', () => {
      const section = new Section({
        id: 'test-27',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      expect(section.getWordCount()).toBe(0);
      expect(section.getReadTime()).toBe(0);
    });
  });

  describe('Integration with Section updates', () => {
    it('should preserve metadata when using with()', () => {
      const section = new Section({
        id: 'test-28',
        title: 'Test Section',
        type: 'text',
        content: '',
        metadata: {
          status: SectionStatus.GENERATED,
          aiModel: 'ollama/gemma:2b',
          wordCount: 100,
        },
      });

      const updated = section.with({ title: 'Updated Title' });

      expect(updated.getStatus()).toBe(SectionStatus.GENERATED);
      expect(updated.getAiModel()).toBe('ollama/gemma:2b');
      expect(updated.title).toBe('Updated Title');
    });

    it('should track multiple generation attempts', () => {
      let section = new Section({
        id: 'test-29',
        title: 'Test Section',
        type: 'text',
        content: '',
      });

      // First attempt fails
      section = section.markAsFailed();
      expect(section.getGenerationAttempts()).toBe(1);

      // Second attempt succeeds
      section = section.markAsGenerated('ollama/gemma:2b', 'Generated content');
      expect(section.getGenerationAttempts()).toBe(2);
    });
  });
});
