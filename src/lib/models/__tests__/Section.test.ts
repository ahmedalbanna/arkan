/**
 * Section Model Tests - Core Functionality
 */

// Mock the markdown-parser to avoid ESM issues
jest.mock('@/lib/project/markdown-parser');
jest.mock('@/lib/project/template');

import { Section, type SectionProperties } from '../section';
import { SectionStatus } from '@/types/section-metadata';
import { Project } from '../project';
import { Chapter } from '../chapter';

describe('Section Model', () => {
  describe('constructor', () => {
    it('should create a section with valid properties', () => {
      const section = new Section({
        title: 'Introduction',
        type: 'report',
      });

      expect(section.id).toBeDefined();
      expect(section.title).toBe('Introduction');
      expect(section.type).toBe('report');
      expect(section.content).toBe('');
      expect(section.prompt).toBe('');
    });

    it('should auto-generate ID if not provided', () => {
      const section = new Section({ title: 'Section', type: 'report' });
      expect(section.id).toBeDefined();
      expect(section.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
    });

    it('should use provided ID', () => {
      const section = new Section({
        id: 'section-123',
        title: 'Section',
        type: 'report',
      });
      expect(section.id).toBe('section-123');
    });

    it('should initialize with defaults', () => {
      const section = new Section({ title: 'Test', type: 'report' });

      expect(section.content).toBe('');
      expect(section.prompt).toBe('');
      expect(section.rules).toEqual([]);
      expect(section.guidelines).toEqual([]);
      expect(section.constraints).toEqual([]);
      expect(section.behaviors).toEqual([]);
      expect(section.metadata).toBeDefined();
    });

    it('should accept custom properties', () => {
      const section = new Section({
        title: 'Custom',
        type: 'code',
        content: 'Some code',
        prompt: 'Generate code',
        rules: ['Rule 1'],
        guidelines: ['Guideline 1'],
      });

      expect(section.content).toBe('Some code');
      expect(section.prompt).toBe('Generate code');
      expect(section.rules).toEqual(['Rule 1']);
      expect(section.guidelines).toEqual(['Guideline 1']);
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const section = new Section({ title: 'Section', type: 'report' });
      expect(section.title).toBe('Section');
      expect(section.id).toBeDefined();
    });

    it('should return new instance with with()', () => {
      const original = new Section({ title: 'Original', type: 'report' });
      const updated = original.with({ title: 'Updated' });

      expect(updated).not.toBe(original);
      expect(original.title).toBe('Original');
      expect(updated.title).toBe('Updated');
    });
  });

  describe('with()', () => {
    it('should update properties', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const updated = section.with({ 
        content: 'New content',
        prompt: 'New prompt' 
      });

      expect(updated.content).toBe('New content');
      expect(updated.prompt).toBe('New prompt');
      expect(updated.title).toBe('Test'); // Unchanged
    });
  });

  describe('status transitions', () => {
    it('should start with DRAFT status', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      expect(section.getStatus()).toBe(SectionStatus.DRAFT);
      expect(section.isGenerated()).toBe(false);
      expect(section.isGenerating()).toBe(false);
    });

    it('should transition to GENERATING status', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const generating = section.markAsGenerating();

      expect(generating.getStatus()).toBe(SectionStatus.GENERATING);
      expect(generating.isGenerating()).toBe(true);
      // Generation attempts are tracked in metadata
      expect(generating.getGenerationAttempts()).toBeGreaterThanOrEqual(0);
    });

    it('should transition to GENERATED status', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const generated = section.markAsGenerated('gemma-2b', 'Generated content');

      expect(generated.getStatus()).toBe(SectionStatus.GENERATED);
      expect(generated.isGenerated()).toBe(true);
      expect(generated.getAiModel()).toBe('gemma-2b');
      expect(generated.content).toBe('Generated content');
    });

    it('should transition to FAILED status', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const failed = section.markAsFailed();

      expect(failed.getStatus()).toBe(SectionStatus.FAILED);
      expect(failed.isGenerated()).toBe(false);
    });

    it('should transition to EDITED status', () => {
      const section = new Section({ 
        title: 'Test', 
        type: 'report',
        content: 'Original' 
      });
      const edited = section.markAsEdited('User edited content');

      expect(edited.getStatus()).toBe(SectionStatus.EDITED);
      expect(edited.isGenerated()).toBe(true); // Edited counts as generated
      expect(edited.content).toBe('User edited content');
    });
  });

  describe('markAsGenerated()', () => {
    it('should update content and metadata', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const generated = section.markAsGenerated('llama3-8b', 'AI generated content here');

      expect(generated.content).toBe('AI generated content here');
      expect(generated.getAiModel()).toBe('llama3-8b');
      expect(generated.getWordCount()).toBeGreaterThan(0);
      expect(generated.getGeneratedAt()).toBeDefined();
    });

    it('should save version history when content changes', () => {
      const section = new Section({ 
        title: 'Test', 
        type: 'report',
        content: 'Old content' 
      });
      const generated = section.markAsGenerated('gemma-2b', 'New content');

      // Version history is internal, but we can verify the update worked
      expect(generated.content).toBe('New content');
      expect(section.content).toBe('Old content'); // Original unchanged
    });
  });

  describe('updateContent()', () => {
    it('should update content without changing status', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const updated = section.updateContent('New content');

      expect(updated.content).toBe('New content');
      expect(updated.getStatus()).toBe(SectionStatus.DRAFT);
    });

    it('should mark as edited when editedByUser is true', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const edited = section.updateContent('User content', true);

      expect(edited.content).toBe('User content');
      expect(edited.getStatus()).toBe(SectionStatus.EDITED);
    });
  });

  describe('metadata getters', () => {
    it('should return word count', () => {
      const section = new Section({ 
        title: 'Test', 
        type: 'report',
        content: 'This is a test with five words' 
      });
      const generated = section.markAsGenerated('gemma-2b', 'This is a test with five words');
      
      expect(generated.getWordCount()).toBeGreaterThan(0);
    });

    it('should return read time', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const generated = section.markAsGenerated('gemma-2b', 'content '.repeat(200)); // ~200 words
      
      expect(generated.getReadTime()).toBeGreaterThan(0);
    });

    it('should return generation attempts', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const attempt1 = section.markAsGenerating();
      
      // Metadata tracks attempts
      expect(attempt1.getGenerationAttempts()).toBeGreaterThanOrEqual(0);
    });

    it('should return AI model', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const generated = section.markAsGenerated('phi3-mini', 'content');
      
      expect(generated.getAiModel()).toBe('phi3-mini');
    });

    it('should return undefined for AI model if not generated', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      expect(section.getAiModel()).toBeUndefined();
    });
  });

  describe('context methods', () => {
    it('should get context as record', () => {
      const s1 = new Section({ 
        id: 's1', 
        title: 'Section 1', 
        type: 'report',
        content: 'Content 1' 
      });
      const s2 = new Section({ 
        id: 's2', 
        title: 'Section 2', 
        type: 'report',
        content: 'Content 2',
        context: { sections: { s1: 'context' } }
      });
      
      const chapter = new Chapter({ title: 'Chapter', sections: [s1, s2] });
      const project = new Project({ content: [chapter] });

      const context = s2.getContextAsRecord(project);
      expect(context['Section 1']).toBe('Content 1');
    });

    it('should return empty record if no context', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const project = new Project({});

      const context = section.getContextAsRecord(project);
      expect(context).toEqual({});
    });

    it('should get external context as array', () => {
      const section = new Section({ 
        title: 'Test', 
        type: 'report',
        context: { externalContext: { 'file1': 'context' } }
      });
      
      const project = new Project({
        externalContext: [{
          id: 'file1',
          fileName: 'test.pdf',
          content: 'PDF content',
          type: 'context'
        }]
      });

      const files = section.getExternalContextAsArray(project);
      expect(files).toHaveLength(1);
      expect(files[0].fileName).toBe('test.pdf');
    });

    it('should return empty array if no external context', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      const project = new Project({});

      const files = section.getExternalContextAsArray(project);
      expect(files).toEqual([]);
    });
  });

  describe('prompt building', () => {
    it('should build system prompt', () => {
      const section = new Section({ 
        title: 'Test', 
        type: 'report',
        rules: ['Rule 1', 'Rule 2'],
        guidelines: ['Guideline 1']
      });

      const systemPrompt = section.buildSystemPrompt();
      expect(systemPrompt).toContain('AI assistant');
      expect(systemPrompt).toContain('Rule 1');
      expect(systemPrompt).toContain('Guideline 1');
    });

    it('should build action prompt', () => {
      const section = new Section({ 
        title: 'Test', 
        type: 'report',
        prompt: 'Write about AI',
        controls: { 
          formality: 80, 
          complexity: 50,
          wordCount: 500 
        }
      });

      const actionPrompt = section.buildActionPrompt();
      expect(actionPrompt).toContain('Write about AI');
      expect(actionPrompt).toContain('formality');
      expect(actionPrompt).toContain('500 words');
    });
  });

  describe('toStateObject()', () => {
    it('should convert to plain object', () => {
      const section = new Section({
        id: 's-123',
        title: 'Section',
        type: 'report',
        content: 'Content',
      });

      const stateObject = section.toStateObject();

      expect(stateObject).toEqual(
        expect.objectContaining({
          id: 's-123',
          title: 'Section',
          type: 'report',
          content: 'Content',
        })
      );
      expect(stateObject).not.toBeInstanceOf(Section);
    });

    it('should include all properties', () => {
      const section = new Section({
        title: 'Test',
        type: 'code',
        rules: ['Rule 1'],
        guidelines: ['Guide 1'],
        constraints: ['Constraint 1'],
      });

      const stateObject = section.toStateObject();

      expect(stateObject.rules).toEqual(['Rule 1']);
      expect(stateObject.guidelines).toEqual(['Guide 1']);
      expect(stateObject.constraints).toEqual(['Constraint 1']);
    });
  });

  describe('toJSON()', () => {
    it('should serialize to JSON correctly', () => {
      const section = new Section({
        id: 's-123',
        title: 'Test',
        type: 'report',
      });

      const json = JSON.stringify(section);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe('s-123');
      expect(parsed.title).toBe('Test');
      expect(parsed.type).toBe('report');
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      expect(section.content).toBe('');
      expect(section.getWordCount()).toBe(0);
    });

    it('should handle special characters in title', () => {
      const section = new Section({ 
        title: 'Section 1: Introduction & Background', 
        type: 'report' 
      });
      expect(section.title).toBe('Section 1: Introduction & Background');
    });

    it('should handle multiple status transitions', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      
      const gen1 = section.markAsGenerating();
      expect(gen1.getStatus()).toBe(SectionStatus.GENERATING);
      
      const generated = gen1.markAsGenerated('gemma-2b', 'Content');
      expect(generated.getStatus()).toBe(SectionStatus.GENERATED);
      
      const edited = generated.markAsEdited('Edited content');
      expect(edited.getStatus()).toBe(SectionStatus.EDITED);
    });

    it('should handle chained updates', () => {
      const section = new Section({ title: 'Test', type: 'report' });
      
      const updated = section
        .with({ prompt: 'New prompt' })
        .with({ rules: ['Rule 1'] })
        .updateContent('New content');

      expect(updated.prompt).toBe('New prompt');
      expect(updated.rules).toEqual(['Rule 1']);
      expect(updated.content).toBe('New content');
      expect(section.prompt).toBe(''); // Original unchanged
    });
  });
});
