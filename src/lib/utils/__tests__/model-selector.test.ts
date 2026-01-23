/**
 * Tests for model selection logic
 */

import { assessSectionComplexity, selectModelForSection, getModelConfig } from '../model-selector';
import { Section } from '@/lib/models/section';
import { SectionComplexity } from '@/types';
import { Control, Behavior } from '@/lib/models/control-types';

jest.mock('../logger');

describe('Model Selector', () => {
  describe('assessSectionComplexity', () => {
    it('should return SIMPLE for basic section', () => {
      const section = new Section({
        id: 'simple-1',
        title: 'Simple Section',
        type: 'text',
        content: '',
      });

      const complexity = assessSectionComplexity(section);
      expect(complexity).toBe(SectionComplexity.SIMPLE);
    });

    it('should return MEDIUM for moderately complex section', () => {
      const section = new Section({
        id: 'medium-1',
        title: 'Medium Section',
        type: 'text',
        content: '',
        controls: {
          wordCount: 600,
          complexity: 50,
        } as Control,
        guidelines: ['Guideline 1', 'Guideline 2', 'Guideline 3'],
      });

      const complexity = assessSectionComplexity(section);
      expect(complexity).toBe(SectionComplexity.MEDIUM);
    });

    it('should return COMPLEX for highly complex section', () => {
      const section = new Section({
        id: 'complex-1',
        title: 'Complex Section',
        type: 'text',
        content: '',
        controls: {
          wordCount: 1000,
          complexity: 75,
        } as Control,
        guidelines: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'],
        context: ['sec-1', 'sec-2', 'sec-3'],
      });

      const complexity = assessSectionComplexity(section);
      expect(complexity).toBe(SectionComplexity.COMPLEX);
    });

    it('should return EXPERT for very complex section', () => {
      const section = new Section({
        id: 'expert-1',
        title: 'Expert Section',
        type: 'text',
        content: '',
        controls: {
          wordCount: 2000,
          complexity: 90,
        } as Control,
        guidelines: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'],
        context: ['sec-1', 'sec-2', 'sec-3', 'sec-4', 'sec-5', 'sec-6'],
        externalContext: ['file-1', 'file-2'],
        behaviors: [
          { type: 'persona', name: 'Expert' } as Behavior,
          { type: 'constraint', name: 'C1' } as Behavior,
          { type: 'thinkingStyle', name: 'TS1' } as Behavior,
          { type: 'outputFormat', name: 'OF1' } as Behavior,
        ],
      });

      const complexity = assessSectionComplexity(section);
      expect(complexity).toBe(SectionComplexity.EXPERT);
    });

    it('should consider word count in complexity', () => {
      const shortSection = new Section({
        id: 's1',
        title: 'Short',
        type: 'text',
        content: '',
        controls: { wordCount: 200 } as Control,
      });

      const longSection = new Section({
        id: 's2',
        title: 'Long',
        type: 'text',
        content: '',
        controls: { wordCount: 1600 } as Control,
      });

      expect(assessSectionComplexity(shortSection)).toBe(SectionComplexity.SIMPLE);
      expect(assessSectionComplexity(longSection)).toBeOneOf([
        SectionComplexity.COMPLEX,
        SectionComplexity.EXPERT,
      ]);
    });

    it('should consider structured content types as more complex', () => {
      const textSection = new Section({
        id: 't1',
        title: 'Text',
        type: 'text',
        content: '',
      });

      const diagramSection = new Section({
        id: 'd1',
        title: 'Diagram',
        type: 'diagram',
        content: '',
      });

      const textComplexity = assessSectionComplexity(textSection);
      const diagramComplexity = assessSectionComplexity(diagramSection);

      // Diagram should be more complex than plain text
      expect(['MEDIUM', 'COMPLEX']).toContain(diagramComplexity);
    });
  });

  describe('selectModelForSection', () => {
    it('should select gemma:2b for simple sections', () => {
      const section = new Section({
        id: 'simple',
        title: 'Simple',
        type: 'text',
        content: '',
      });

      const config = selectModelForSection(section);

      expect(config.model).toBe('ollama/gemma:2b');
      expect(config.temperature).toBe(0.3);
    });

    it('should select phi3:mini for medium sections', () => {
      const section = new Section({
        id: 'medium',
        title: 'Medium',
        type: 'text',
        content: '',
        controls: {
          wordCount: 700,
          complexity: 55,
        } as Control,
        guidelines: ['G1', 'G2', 'G3'],
      });

      const config = selectModelForSection(section);

      expect(config.model).toBe('ollama/phi3:mini');
      expect(config.temperature).toBe(0.4);
    });

    it('should select llama3:8b for complex sections', () => {
      const section = new Section({
        id: 'complex',
        title: 'Complex',
        type: 'text',
        content: '',
        controls: {
          wordCount: 1200,
          complexity: 80,
        } as Control,
        guidelines: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'],
        context: ['s1', 's2', 's3', 's4'],
      });

      const config = selectModelForSection(section);

      expect(config.model).toBe('ollama/llama3:8b');
      expect(config.temperature).toBe(0.5);
    });

    it('should select qwen for expert sections', () => {
      const section = new Section({
        id: 'expert',
        title: 'Expert',
        type: 'text',
        content: '',
        controls: {
          wordCount: 2500,
          complexity: 95,
        } as Control,
        guidelines: Array(8).fill('G'),
        context: Array(10).fill('s'),
        externalContext: ['f1', 'f2', 'f3'],
      });

      const config = selectModelForSection(section);

      expect(config.model).toBe('ollama/qwen2.5:latest');
      expect(config.temperature).toBe(0.6);
    });

    it('should return config with maxTokens', () => {
      const section = new Section({
        id: 'test',
        title: 'Test',
        type: 'text',
        content: '',
      });

      const config = selectModelForSection(section);

      expect(config.maxTokens).toBeDefined();
      expect(config.maxTokens).toBeGreaterThan(0);
    });
  });

  describe('getModelConfig', () => {
    it('should return config for each complexity level', () => {
      const simpleConfig = getModelConfig(SectionComplexity.SIMPLE);
      const mediumConfig = getModelConfig(SectionComplexity.MEDIUM);
      const complexConfig = getModelConfig(SectionComplexity.COMPLEX);
      const expertConfig = getModelConfig(SectionComplexity.EXPERT);

      expect(simpleConfig.model).toBe('ollama/gemma:2b');
      expect(mediumConfig.model).toBe('ollama/phi3:mini');
      expect(complexConfig.model).toBe('ollama/llama3:8b');
      expect(expertConfig.model).toBe('ollama/qwen2.5:latest');
    });

    it('should have increasing temperatures for higher complexity', () => {
      const configs = [
        getModelConfig(SectionComplexity.SIMPLE),
        getModelConfig(SectionComplexity.MEDIUM),
        getModelConfig(SectionComplexity.COMPLEX),
        getModelConfig(SectionComplexity.EXPERT),
      ];

      for (let i = 1; i < configs.length; i++) {
        expect(configs[i].temperature).toBeGreaterThanOrEqual(configs[i - 1].temperature);
      }
    });

    it('should have increasing maxTokens for higher complexity', () => {
      const configs = [
        getModelConfig(SectionComplexity.SIMPLE),
        getModelConfig(SectionComplexity.MEDIUM),
        getModelConfig(SectionComplexity.COMPLEX),
        getModelConfig(SectionComplexity.EXPERT),
      ];

      for (let i = 1; i < configs.length; i++) {
        expect(configs[i].maxTokens).toBeGreaterThan(configs[i - 1].maxTokens!);
      }
    });
  });
});

// Custom Jest matcher
expect.extend({
  toBeOneOf(received, array) {
    const pass = array.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${array}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${array}`,
        pass: false,
      };
    }
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(array: any[]): R;
    }
  }
}
