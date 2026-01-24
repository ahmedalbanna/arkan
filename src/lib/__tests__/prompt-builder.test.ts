// @ts-nocheck
/**
 * Tests for PromptBuilder utility
 */

import { PromptBuilder } from '../prompt-builder';
import { Section } from '../models/section';
import { Project } from '../models/project';
import { Control, Behavior } from '../models/control-types';

describe('PromptBuilder', () => {
  describe('buildSectionPrompt', () => {
    let project: Project;
    let section: Section;

    beforeEach(() => {
      project = new Project({
        id: 'project-1',
        title: 'Test Project',
        description: 'A test project',
        owner: 'user-1',
        metadata: {
          title: 'Test Project',
          subtitle: 'Testing Suite',
          author: 'Test Author',
          version: '1.0',
          date: '2026-01-23',
        },
      });

      section = new Section({
        id: 'section-1',
        title: 'Introduction',
        type: 'text',
        content: '',
      });
    });

    it('should build basic prompt with project metadata', () => {
      const prompt = PromptBuilder.buildSectionPrompt(section, project);

      expect(prompt).toContain('Test Project');
      expect(prompt).toContain('Test Author');
      expect(prompt).toBeTruthy();
    });

    it('should include section title in prompt', () => {
      const prompt = PromptBuilder.buildSectionPrompt(section, project);

      expect(prompt).toContain('Introduction');
    });

    it('should include behaviors in prompt', () => {
      section = section.with({
        behaviors: [
          { type: 'persona', name: 'Expert Writer' } as Behavior,
        ],
      });

      const prompt = PromptBuilder.buildSectionPrompt(section, project);

      expect(prompt).toContain('Expert Writer');
    });

    it('should include controls in prompt', () => {
      section = section.with({
        controls: {
          tone: 'professional',
          formality: 75,
          wordCount: 800,
        } as Control,
      });

      const prompt = PromptBuilder.buildSectionPrompt(section, project);

      expect(prompt).toContain('professional');
      expect(prompt).toContain('800');
    });

    it('should include guidelines in prompt', () => {
      section = section.with({
        guidelines: [
          'Use simple language',
          'Include examples',
        ],
      });

      const prompt = PromptBuilder.buildSectionPrompt(section, project);

      expect(prompt).toContain('simple language');
      expect(prompt).toContain('examples');
    });

    it('should handle section with all features', () => {
      section = section.with({
        behaviors: [
          { type: 'persona', name: 'Technical Writer' } as Behavior,
          { type: 'constraint', name: 'No Jargon' } as Behavior,
        ],
        controls: {
          tone: 'informative',
          formality: 60,
          wordCount: 1000,
          complexity: 70,
          targetAudience: 'professionals',
        } as Control,
        guidelines: [
          'Be concise',
          'Use bullet points',
        ],
      });

      const prompt = PromptBuilder.buildSectionPrompt(section, project);

      // Should contain all elements
      expect(prompt).toContain('Technical Writer');
      expect(prompt).toContain('No Jargon');
      expect(prompt).toContain('informative');
      expect(prompt).toContain('1000');
      expect(prompt).toContain('professionals');
      expect(prompt).toContain('Be concise');
    });

    it('should include project description if available', () => {
      project = project.with({
        description: 'This is a comprehensive test project for AI generation',
      });

      const prompt = PromptBuilder.buildSectionPrompt(section, project);

      expect(prompt).toContain('comprehensive test project');
    });
  });

  describe('buildChapterPrompt', () => {
    it('should build prompt for chapter generation', () => {
      const project = new Project({
        id: 'project-2',
        title: 'Chapter Test',
        description: 'Testing chapter generation',
        owner: 'user-1',
      });

      const sections = [
        new Section({
          id: 'sec-1',
          title: 'Section 1',
          type: 'text',
          content: '',
        }),
        new Section({
          id: 'sec-2',
          title: 'Section 2',
          type: 'text',
          content: '',
        }),
      ];

      const prompt = PromptBuilder.buildChapterPrompt(sections, project);

      expect(prompt).toContain('Section 1');
      expect(prompt).toContain('Section 2');
      expect(prompt).toContain('Chapter Test');
    });

    it('should handle empty sections array', () => {
      const project = new Project({
        id: 'project-3',
        title: 'Empty Chapter',
        description: 'No sections',
        owner: 'user-1',
      });

      const prompt = PromptBuilder.buildChapterPrompt([], project);

      expect(prompt).toBeTruthy();
      expect(prompt).toContain('Empty Chapter');
    });
  });

  describe('Prompt Quality', () => {
    it('should generate prompts with reasonable length', () => {
      const project = new Project({
        id: 'project-4',
        title: 'Quality Test',
        description: 'Testing prompt quality',
        owner: 'user-1',
      });

      const section = new Section({
        id: 'section-4',
        title: 'Test Section',
        type: 'text',
        content: '',
        behaviors: [
          { type: 'persona', name: 'Expert' } as Behavior,
        ],
        controls: {
          tone: 'professional',
          wordCount: 500,
        } as Control,
        guidelines: ['Be clear', 'Be concise'],
      });

      const prompt = PromptBuilder.buildSectionPrompt(section, project);

      // Prompt should be substantive but not excessive
      expect(prompt.length).toBeGreaterThan(50);
      expect(prompt.length).toBeLessThan(10000);
    });

    it('should generate well-structured prompts', () => {
      const project = new Project({
        id: 'project-5',
        title: 'Structure Test',
        owner: 'user-1',
      });

      const section = new Section({
        id: 'section-5',
        title: 'Structured Section',
        type: 'text',
        content: '',
      });

      const prompt = PromptBuilder.buildSectionPrompt(section, project);

      // Should have multiple sentences/paragraphs
      const sentenceCount = (prompt.match(/[.!?]/g) || []).length;
      expect(sentenceCount).toBeGreaterThan(2);
    });
  });
});
