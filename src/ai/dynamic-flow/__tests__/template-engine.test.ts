/**
 * Template Engine Tests
 */

import { TemplateEngine, TemplateRenderError } from '../template-engine';
import { ContextManager } from '../context-manager';
import type { FlowConfiguration } from '../../../lib/models/flow-config';

describe('TemplateEngine', () => {
  let templateEngine: TemplateEngine;
  let contextManager: ContextManager;
  let context: any;

  beforeEach(async () => {
    templateEngine = new TemplateEngine();
    contextManager = new ContextManager();
    
    // Create a mock context
    context = await contextManager.initialize({
      input: {
        topic: 'Machine Learning',
        userType: 'premium',
        items: ['a', 'b', 'c']
      },
      config: {} as FlowConfiguration,
      options: {},
      traceId: 'test_trace'
    });

    context.variables.set('userName', 'John Doe');
    context.variables.set('count', 42);
  });

  describe('render', () => {
    it('should render simple variable substitution', () => {
      const template = 'Hello {{userName}}!';
      const result = templateEngine.render(template, context);
      expect(result).toBe('Hello John Doe!');
    });

    it('should access input variables', () => {
      const template = 'Topic: {{input.topic}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('Topic: Machine Learning');
    });

    it('should handle nested property access', () => {
      const template = 'User is {{input.userType}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('User is premium');
    });

    it('should handle conditionals', () => {
      const template = '{{#if input.userType}}Premium User{{else}}Free User{{/if}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('Premium User');
    });

    it('should handle loops', () => {
      const template = '{{#each input.items}}{{this}} {{/each}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('a b c ');
    });

    it('should throw TemplateRenderError on invalid template', () => {
      const template = '{{unclosed';
      expect(() => templateEngine.render(template, context))
        .toThrow(TemplateRenderError);
    });
  });

  describe('helpers', () => {
    it('should uppercase strings', () => {
      const template = '{{uppercase userName}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('JOHN DOE');
    });

    it('should lowercase strings', () => {
      const template = '{{lowercase input.topic}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('machine learning');
    });

    it('should truncate strings', () => {
      const template = '{{truncate userName 4}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('John...');
    });

    it('should join arrays', () => {
      const template = '{{join input.items ", "}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('a, b, c');
    });

    it('should get first element', () => {
      const template = '{{first input.items}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('a');
    });

    it('should get last element', () => {
      const template = '{{last input.items}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('c');
    });

    it('should perform equality comparison', () => {
      const template = '{{#if (eq count 42)}}Yes{{else}}No{{/if}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('Yes');
    });

    it('should perform greater than comparison', () => {
      const template = '{{#if (gt count 40)}}Yes{{else}}No{{/if}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('Yes');
    });

    it('should add numbers', () => {
      const template = '{{add count 8}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('50');
    });

    it('should handle default values', () => {
      const template = '{{default missingVar "default value"}}';
      const result = templateEngine.render(template, context);
      expect(result).toBe('default value');
    });
  });

  describe('validate', () => {
    it('should validate correct template', () => {
      const template = 'Hello {{name}}!';
      const result = templateEngine.validate(template);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid template', () => {
      const template = '{{unclosed';
      const result = templateEngine.validate(template);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('extractVariables', () => {
    it('should extract simple variables', () => {
      const template = 'Hello {{name}} and {{age}}!';
      const variables = templateEngine.extractVariables(template);
      expect(variables).toContain('name');
      expect(variables).toContain('age');
    });

    it('should extract nested variables', () => {
      const template = '{{input.topic}} by {{user.name}}';
      const variables = templateEngine.extractVariables(template);
      expect(variables).toContain('input.topic');
      expect(variables).toContain('user.name');
    });

    it('should handle duplicate variables', () => {
      const template = '{{name}} and {{name}} again';
      const variables = templateEngine.extractVariables(template);
      expect(variables.filter(v => v === 'name')).toHaveLength(1);
    });
  });
});
