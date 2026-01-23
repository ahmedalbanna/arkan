/**
 * Tests for simplified PromptBuilder methods
 */

import { PromptBuilder } from '../prompt-builder';
import { Section } from '../models/section';
import { Project } from '../models/project';
import { Control, Behavior } from '../models/control-types';

describe('PromptBuilder - Simplified Methods', () => {
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

  describe('buildSectionSystemPrompt', () => {
    it('should build system prompt with project metadata', () => {
      const systemPrompt = PromptBuilder.buildSectionSystemPrompt(section, project);

      expect(systemPrompt).toContain('Test Project');
      expect(systemPrompt).toContain('Test Author');
      expect(systemPrompt).toContain('Introduction');
      expect(systemPrompt).toContain('expert technical writer');
    });

    it('should include section behaviors in system prompt', () => {
      section = section.with({
        behaviors: [
          { type: 'persona', name: 'Senior Engineer' } as Behavior,
        ],
      });

      const systemPrompt = PromptBuilder.buildSectionSystemPrompt(section, project);

      expect(systemPrompt).toContain('Senior Engineer');
    });

    it('should include core instructions', () => {
      const systemPrompt = PromptBuilder.buildSectionSystemPrompt(section, project);

      expect(systemPrompt).toContain('Review all provided context carefully');
      expect(systemPrompt).toContain('Output ONLY the markdown content');
      expect(systemPrompt).toContain('Do NOT wrap output in JSON');
    });

    it('should handle project without metadata', () => {
      project = new Project({
        id: 'project-2',
        title: 'Simple Project',
        description: 'No metadata',
        owner: 'user-1',
      });

      const systemPrompt = PromptBuilder.buildSectionSystemPrompt(section, project);

      expect(systemPrompt).toBeTruthy();
      expect(systemPrompt).toContain('Introduction');
    });
  });

  describe('buildSectionUserPrompt', () => {
    it('should build user prompt with task description', () => {
      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      expect(userPrompt).toContain('Write the section titled "Introduction"');
      expect(userPrompt).toContain('Output Requirements');
    });

    it('should include action prompt controls', () => {
      section = section.with({
        controls: {
          tone: 'professional',
          formality: 80,
          wordCount: 500,
        } as Control,
      });

      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      expect(userPrompt).toContain('professional');
      expect(userPrompt).toContain('500');
    });

    it('should include guidelines if present', () => {
      section = section.with({
        guidelines: [
          'Be concise',
          'Use examples',
          'Include statistics',
        ],
      });

      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      expect(userPrompt).toContain('Guidelines to Follow');
      expect(userPrompt).toContain('Be concise');
      expect(userPrompt).toContain('Use examples');
      expect(userPrompt).toContain('Include statistics');
    });

    it('should include context from other sections', () => {
      // Create another section with content
      project = project.addSection('chapter-1', new Section({
        id: 'background',
        title: 'Background',
        type: 'text',
        content: 'This is background information',
      }));

      // Link it as context
      section = section.with({
        context: {
          sections: { 'background': 'context' },
          externalContext: {},
        },
      });

      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      expect(userPrompt).toContain('Available Context');
      expect(userPrompt).toContain('Background');
      expect(userPrompt).toContain('This is background information');
    });

    it('should include external file context', () => {
      // Add external context to project
      project = project.addExternalContext({
        id: 'file-1',
        fileName: 'research.pdf',
        content: 'Research data from the study',
        type: 'context',
      });

      // Link it to section
      section = section.with({
        context: {
          sections: {},
          externalContext: { 'file-1': 'context' },
        },
      });

      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      expect(userPrompt).toContain('research.pdf');
      expect(userPrompt).toContain('Research data from the study');
    });

    it('should handle section with no context', () => {
      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      expect(userPrompt).toContain('No additional context provided');
    });

    it('should include output requirements', () => {
      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      expect(userPrompt).toContain('Write complete, well-structured markdown');
      expect(userPrompt).toContain('Use appropriate headings');
      expect(userPrompt).toContain('start with ##');
    });

    it('should handle empty section content in context', () => {
      // Add section with no content
      project = project.addSection('chapter-1', new Section({
        id: 'empty',
        title: 'Empty Section',
        type: 'text',
        content: '',
      }));

      section = section.with({
        context: {
          sections: { 'empty': 'context' },
          externalContext: {},
        },
      });

      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      expect(userPrompt).toContain('(No content yet)');
    });
  });

  describe('Integration - Complete Prompt Flow', () => {
    it('should generate complete prompts for complex section', () => {
      // Create a complex section with all features
      project = project.addSection('chapter-1', new Section({
        id: 'related',
        title: 'Related Work',
        type: 'text',
        content: 'Previous research has shown...',
      }));

      section = section.with({
        title: 'Methodology',
        behaviors: [
          { type: 'persona', name: 'Research Scientist' } as Behavior,
          { type: 'constraint', name: 'Academic Style', description: 'Use formal academic language' } as Behavior,
        ],
        controls: {
          tone: 'formal',
          formality: 90,
          wordCount: 1500,
          complexity: 85,
          targetAudience: 'academics',
        } as Control,
        guidelines: [
          'Explain the research design',
          'Justify methodology choices',
          'Include data collection methods',
        ],
        context: {
          sections: { 'related': 'context' },
          externalContext: {},
        },
      });

      const systemPrompt = PromptBuilder.buildSectionSystemPrompt(section, project);
      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      // System prompt should include persona and role
      expect(systemPrompt).toContain('Methodology');
      expect(systemPrompt).toContain('Research Scientist');
      expect(systemPrompt).toContain('Academic Style');

      // User prompt should include all controls and guidelines
      expect(userPrompt).toContain('1500');
      expect(userPrompt).toContain('academics');
      expect(userPrompt).toContain('Explain the research design');
      expect(userPrompt).toContain('Related Work');
      expect(userPrompt).toContain('Previous research');
    });

    it('should create prompts suitable for API consumption', () => {
      const systemPrompt = PromptBuilder.buildSectionSystemPrompt(section, project);
      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      // Both should be non-empty strings
      expect(typeof systemPrompt).toBe('string');
      expect(typeof userPrompt).toBe('string');
      expect(systemPrompt.length).toBeGreaterThan(50);
      expect(userPrompt.length).toBeGreaterThan(50);

      // System prompt should NOT contain context (that's in user prompt)
      expect(systemPrompt).not.toContain('Available Context');

      // User prompt should contain the task
      expect(userPrompt).toContain('Task:');
    });
  });

  describe('Prompt Quality', () => {
    it('should generate prompts with reasonable length', () => {
      const systemPrompt = PromptBuilder.buildSectionSystemPrompt(section, project);
      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      // Prompts should be substantive but not excessive
      expect(systemPrompt.length).toBeGreaterThan(100);
      expect(systemPrompt.length).toBeLessThan(5000);
      expect(userPrompt.length).toBeGreaterThan(50);
      expect(userPrompt.length).toBeLessThan(10000);
    });

    it('should not duplicate information between prompts', () => {
      const systemPrompt = PromptBuilder.buildSectionSystemPrompt(section, project);
      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, project);

      // System prompt has role/persona, user prompt has task/context
      // They should not have excessive overlap
      expect(systemPrompt).toContain('Your Role');
      expect(userPrompt).toContain('Task:');
      
      // System shouldn't contain detailed task instructions
      expect(systemPrompt).not.toContain('Write the section titled');
    });
  });

  describe('Backward Compatibility', () => {
    it('should still support old buildSectionPrompt method', () => {
      const oldPrompt = PromptBuilder.buildSectionPrompt(section, project);

      expect(oldPrompt).toBeTruthy();
      expect(oldPrompt).toContain('Introduction');
    });
  });
});
