// @ts-nocheck
/**
 * Tests for Section model prompt building methods
 */

import { Behavior, Control } from '../control-types';
import { Section } from '../section';

describe('Section - Prompt Building', () => {
  describe('buildSystemPrompt', () => {
    it('should build basic system prompt without behaviors', () => {
      const section = new Section({
        id: 'test-1',
        title: 'Introduction',
        type: 'text',
        content: '',
      });

      const prompt = section.buildSystemPrompt();
      expect(prompt).toContain('Introduction');
      expect(prompt).toBeTruthy();
    });

    it('should include persona in system prompt', () => {
      const section = new Section({
        id: 'test-2',
        title: 'Executive Summary',
        type: 'text',
        content: '',
        behaviors: [
          {
            type: 'persona',
            name: 'Technical Expert',
            description: 'A senior software architect with deep technical knowledge',
          } as Behavior,
        ],
      });

      const prompt = section.buildSystemPrompt();
      expect(prompt).toContain('A senior software architect with deep technical knowledge');
      expect(prompt).toContain('ROLE / PERSONA');
    });

    it('should include multiple personas', () => {
      const section = new Section({
        id: 'test-3',
        title: 'Market Analysis',
        type: 'text',
        content: '',
        behaviors: [
          { type: 'persona', name: 'Market Analyst' } as Behavior,
          { type: 'persona', name: 'Business Strategist' } as Behavior,
        ],
      });

      const prompt = section.buildSystemPrompt();
      expect(prompt).toContain('Market Analyst');
      expect(prompt).toContain('Business Strategist');
    });

    it('should include constraints in system prompt', () => {
      const section = new Section({
        id: 'test-4',
        title: 'Technical Specs',
        type: 'text',
        content: '',
        behaviors: [
          {
            type: 'behavior',
            name: 'No Jargon - Avoid technical jargon',
            description: 'Avoid technical jargon',
          } as Behavior,
        ],
      });

      const prompt = section.buildSystemPrompt();
      expect(prompt).toContain('MANDATORY RULES');
      expect(prompt).toContain('No Jargon');
    });

    it('should include thinking style in system prompt', () => {
      const section = new Section({
        id: 'test-5',
        title: 'Analysis',
        type: 'text',
        content: '',
        behaviors: [
          {
            type: 'behavior',
            name: 'Analytical - Break down complex problems',
            description: 'Break down complex problems',
          } as Behavior,
        ],
      });

      const prompt = section.buildSystemPrompt();
      expect(prompt).toContain('MANDATORY RULES');
      expect(prompt).toContain('Analytical');
    });
  });

  describe('buildActionPrompt', () => {
    it('should build action prompt with tone control', () => {
      const section = new Section({
        id: 'test-6',
        title: 'Marketing Copy',
        type: 'text',
        content: '',
        controls: {
          tone: 'persuasive',
        } as Control,
      });

      const prompt = section.buildActionPrompt();
      expect(prompt).toContain('persuasive');
    });

    it('should include formality level', () => {
      const section = new Section({
        id: 'test-7',
        title: 'Report',
        type: 'text',
        content: '',
        controls: {
          formality: 80,
        } as Control,
      });

      const prompt = section.buildActionPrompt();
      expect(prompt).toContain('formal');
      expect(prompt.toLowerCase()).toMatch(/formality|formal/);
    });

    it('should include word count requirement', () => {
      const section = new Section({
        id: 'test-8',
        title: 'Essay',
        type: 'text',
        content: '',
        controls: {
          wordCount: 1000,
        } as Control,
      });

      const prompt = section.buildActionPrompt();
      expect(prompt).toContain('1000');
      expect(prompt.toLowerCase()).toMatch(/word|words/);
    });

    it('should include complexity level', () => {
      const section = new Section({
        id: 'test-9',
        title: 'Advanced Topic',
        type: 'text',
        content: '',
        controls: {
          complexity: 90,
        } as Control,
      });

      const prompt = section.buildActionPrompt();
      expect(prompt.toLowerCase()).toMatch(/complex|advanced|sophisticated/);
    });

    it('should include target audience', () => {
      const section = new Section({
        id: 'test-10',
        title: 'User Guide',
        type: 'text',
        content: '',
        controls: {
          formality: 0,
          complexity: 0,
        } as Control,
      });

      const prompt = section.buildActionPrompt();
      expect(prompt).toContain('very informal');
      expect(prompt).toContain('very simple');
    });

    it('should build comprehensive prompt with all controls', () => {
      const section = new Section({
        id: 'test-11',
        title: 'Full Featured',
        type: 'text',
        content: '',
        controls: {
          tone: 'professional',
          formality: 70,
          wordCount: 500,
          complexity: 60,
          targetAudience: 'professionals',
        } as Control,
      });

      const prompt = section.buildActionPrompt();
      expect(prompt).toContain('professional');
      expect(prompt).toContain('500');
      expect(prompt.toLowerCase()).toMatch(/formality|formal/);
    });
  });

  describe('getContextAsRecord', () => {
    it('should return empty object when no context', () => {
      const section = new Section({
        id: 'test-12',
        title: 'Isolated',
        type: 'text',
        content: '',
      });

      // No context property means getContextAsRecord returns empty
      const context = section.getContextAsRecord({} as any);
      expect(context).toEqual({});
      expect(Object.keys(context).length).toBe(0);
    });

    it('should return context for referenced sections', () => {
      const section = new Section({
        id: 'test-13',
        title: 'Related',
        type: 'text',
        content: '',
        context: {
          sections: {
            'section-1': 'reference',
            'section-2': 'reference',
          },
        },
      });

      const mockProject = {
        getSection: (id: string) => {
          const sections: Record<string, any> = {
            'section-1': new Section({
              id: 'section-1',
              title: 'First',
              type: 'text',
              content: 'Content 1',
            }),
            'section-2': new Section({
              id: 'section-2',
              title: 'Second',
              type: 'text',
              content: 'Content 2',
            }),
          };
          return sections[id];
        },
      };

      const context = section.getContextAsRecord(mockProject as any);
      expect(context).toEqual({
        'First': 'Content 1',
        'Second': 'Content 2',
      });
    });

    it('should skip sections with empty content', () => {
      const section = new Section({
        id: 'test-14',
        title: 'Selective',
        type: 'text',
        content: '',
        context: {
          sections: {
            'section-1': 'reference',
            'section-2': 'reference',
          },
        },
      });

      const mockProject = {
        getSection: (id: string) => {
          const sections: Record<string, any> = {
            'section-1': new Section({
              id: 'section-1',
              title: 'Has Content',
              type: 'text',
              content: 'Some content',
            }),
            'section-2': new Section({
              id: 'section-2',
              title: 'Empty',
              type: 'text',
              content: '',
            }),
          };
          return sections[id];
        },
      };

      const context = section.getContextAsRecord(mockProject as any);
      expect(context).toEqual({
        'Has Content': 'Some content',
      });
    });

    it('should handle missing referenced sections gracefully', () => {
      const section = new Section({
        id: 'test-15',
        title: 'Missing Refs',
        type: 'text',
        content: '',
        context: {
          sections: {
            'section-1': 'reference',
            'non-existent': 'reference',
          },
        },
      });

      const mockProject = {
        getSection: (id: string) => {
          const allSections: Record<string, any> = {
            'section-1': new Section({
              id: 'section-1',
              title: 'Exists',
              type: 'text',
              content: 'Content',
            }),
          };
          return allSections[id];
        },
      };

      const context = section.getContextAsRecord(mockProject as any);
      expect(context).toEqual({
        'Exists': 'Content',
      });
    });
  });

  describe('getExternalContextAsArray', () => {
    it('should return empty array when no external context', () => {
      const section = new Section({
        id: 'test-16',
        title: 'No External',
        type: 'text',
        content: '',
      });

      const context = section.getExternalContextAsArray({});
      expect(context).toEqual([]);
    });

    it('should return external context files', () => {
      const section = new Section({
        id: 'test-17',
        title: 'With External',
        type: 'text',
        content: '',
        context: {
          externalContext: {
            'file-1': 'context',
            'file-2': 'example',
          },
        },
      });

      const mockProject = {
        externalContext: [
          {
            id: 'file-1',
            fileName: 'doc1.pdf',
            content: 'Document 1 content',
          },
          {
            id: 'file-2',
            fileName: 'doc2.pdf',
            content: 'Document 2 content',
          },
        ],
      };

      const context = section.getExternalContextAsArray(mockProject as any);
      expect(context).toHaveLength(2);
      expect(context[0]).toEqual({
        fileName: 'doc1.pdf',
        content: 'Document 1 content',
        type: 'context',
      });
      expect(context[1]).toEqual({
        fileName: 'doc2.pdf',
        content: 'Document 2 content',
        type: 'example',
      });
    });

    it('should skip files with empty content', () => {
      const section = new Section({
        id: 'test-18',
        title: 'Filtered External',
        type: 'text',
        content: '',
        context: {
          externalContext: {
            'file-1': 'context',
            'file-2': 'context',
          },
        },
      });

      const mockProject = {
        externalContext: [
          {
            id: 'file-1',
            fileName: 'doc1.pdf',
            content: 'Has content',
          },
          {
            id: 'file-2',
            fileName: 'empty.pdf',
            content: '',
          },
        ],
      };

      const context = section.getExternalContextAsArray(mockProject as any);
      expect(context).toHaveLength(2);
      expect(context[0].fileName).toBe('doc1.pdf');
      expect(context[1].fileName).toBe('empty.pdf');
    });
  });

  describe('Integration - Full Prompt Building', () => {
    it('should build complete prompts for complex section', () => {
      const section = new Section({
        id: 'complex-1',
        title: 'Technical Architecture',
        type: 'text',
        content: '',
        behaviors: [
          { type: 'persona', name: 'Solutions Architect' } as Behavior,
          { type: 'constraint', name: 'Use diagrams', description: 'Include architectural diagrams' } as Behavior,
        ],
        controls: {
          tone: 'professional',
          formality: 80,
          wordCount: 1500,
          complexity: 85,
          targetAudience: 'developers',
        } as Control,
        guidelines: [
          'Use industry-standard terminology',
          'Include code examples',
        ],
      });

      const systemPrompt = section.buildSystemPrompt();
      const actionPrompt = section.buildActionPrompt();

      // System prompt should include behaviors and title
      expect(systemPrompt).toContain('Technical Architecture');
      expect(systemPrompt).toContain('professional');

      // Action prompt should include controls
      expect(actionPrompt).toContain('professional');
      expect(actionPrompt).toContain('1500');
      expect(actionPrompt).toContain('formal');
    });
  });
});
