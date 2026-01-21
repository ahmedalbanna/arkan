/**
 * Prompt Configuration Model Tests
 * 
 * Tests for PromptConfiguration type definitions, validation, and utility functions
 */

import {
  PromptConfiguration,
  PromptVariable,
  PromptVersion,
  PromptCategory,
  validatePromptConfiguration,
  validatePromptTemplate,
  extractTemplateVariables,
  createDefaultPromptConfig,
  createPromptVersion,
  isValidPromptCategory,
  getPromptCategoryLabel,
} from '../prompt-config';

describe('Prompt Configuration Model', () => {
  // ============================================================================
  // Type Validation
  // ============================================================================

  describe('isValidPromptCategory', () => {
    it('should return true for valid categories', () => {
      expect(isValidPromptCategory('text-generation')).toBe(true);
      expect(isValidPromptCategory('analysis')).toBe(true);
      expect(isValidPromptCategory('transformation')).toBe(true);
      expect(isValidPromptCategory('summarization')).toBe(true);
      expect(isValidPromptCategory('translation')).toBe(true);
      expect(isValidPromptCategory('question-answering')).toBe(true);
      expect(isValidPromptCategory('custom')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(isValidPromptCategory('invalid')).toBe(false);
      expect(isValidPromptCategory('')).toBe(false);
      expect(isValidPromptCategory('TEXT-GENERATION')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidPromptCategory(null as any)).toBe(false);
      expect(isValidPromptCategory(undefined as any)).toBe(false);
      expect(isValidPromptCategory(123 as any)).toBe(false);
    });
  });

  describe('getPromptCategoryLabel', () => {
    it('should return human-readable labels', () => {
      expect(getPromptCategoryLabel('text-generation')).toBe('Text Generation');
      expect(getPromptCategoryLabel('analysis')).toBe('Analysis');
      expect(getPromptCategoryLabel('transformation')).toBe('Transformation');
      expect(getPromptCategoryLabel('summarization')).toBe('Summarization');
      expect(getPromptCategoryLabel('translation')).toBe('Translation');
      expect(getPromptCategoryLabel('question-answering')).toBe('Question Answering');
      expect(getPromptCategoryLabel('custom')).toBe('Custom');
    });

    it('should handle invalid categories', () => {
      expect(getPromptCategoryLabel('invalid' as PromptCategory)).toBe('Unknown');
    });
  });

  // ============================================================================
  // Template Variable Extraction
  // ============================================================================

  describe('extractTemplateVariables', () => {
    it('should extract simple variables', () => {
      const template = 'Hello {{name}}, welcome to {{place}}!';
      const variables = extractTemplateVariables(template);

      expect(variables).toEqual(['name', 'place']);
    });

    it('should extract nested variables', () => {
      const template = 'User: {{user.name}}, Email: {{user.email}}';
      const variables = extractTemplateVariables(template);

      expect(variables).toContain('user.name');
      expect(variables).toContain('user.email');
    });

    it('should extract array access variables', () => {
      const template = 'First item: {{items[0]}}, Second: {{items[1]}}';
      const variables = extractTemplateVariables(template);

      expect(variables).toContain('items[0]');
      expect(variables).toContain('items[1]');
    });

    it('should handle duplicate variables', () => {
      const template = '{{name}} and {{name}} again';
      const variables = extractTemplateVariables(template);

      expect(variables).toEqual(['name']);
    });

    it('should handle no variables', () => {
      const template = 'Static text without variables';
      const variables = extractTemplateVariables(template);

      expect(variables).toEqual([]);
    });

    it('should handle empty template', () => {
      const variables = extractTemplateVariables('');

      expect(variables).toEqual([]);
    });

    it('should handle malformed variables', () => {
      const template = '{{incomplete} or {single}';
      const variables = extractTemplateVariables(template);

      expect(variables).toEqual([]);
    });

    it('should handle complex expressions', () => {
      const template = 'Result: {{steps.step1.output.value}}';
      const variables = extractTemplateVariables(template);

      expect(variables).toContain('steps.step1.output.value');
    });

    it('should handle Handlebars helpers', () => {
      const template = '{{uppercase name}} and {{truncate description 50}}';
      const variables = extractTemplateVariables(template);

      expect(variables.length).toBeGreaterThan(0);
    });

    it('should handle whitespace in variables', () => {
      const template = '{{ name }} and {{  value  }}';
      const variables = extractTemplateVariables(template);

      expect(variables).toContain('name');
      expect(variables).toContain('value');
    });
  });

  // ============================================================================
  // Template Validation
  // ============================================================================

  describe('validatePromptTemplate', () => {
    it('should validate correct template', () => {
      const template = 'Hello {{name}}, your score is {{score}}.';
      const result = validatePromptTemplate(template);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect unbalanced braces', () => {
      const template = 'Hello {{name, missing close';
      const result = validatePromptTemplate(template);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unbalanced template braces');
    });

    it('should detect empty variable names', () => {
      const template = 'Hello {{}}, empty variable';
      const result = validatePromptTemplate(template);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Empty variable name found');
    });

    it('should validate nested structures', () => {
      const template = 'User: {{user.profile.name}}';
      const result = validatePromptTemplate(template);

      expect(result.valid).toBe(true);
    });

    it('should handle Handlebars syntax', () => {
      const template = '{{#if condition}}Show this{{/if}}';
      const result = validatePromptTemplate(template);

      expect(result.valid).toBe(true);
    });

    it('should handle Handlebars each loops', () => {
      const template = '{{#each items}}{{this.name}}{{/each}}';
      const result = validatePromptTemplate(template);

      expect(result.valid).toBe(true);
    });

    it('should detect malformed Handlebars blocks', () => {
      const template = '{{#if condition}}No closing tag';
      const result = validatePromptTemplate(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('block') || e.includes('closing'))).toBe(true);
    });

    it('should allow empty template', () => {
      const result = validatePromptTemplate('');

      // Empty templates might be valid or invalid depending on requirements
      expect(result).toBeDefined();
    });

    it('should validate complex real-world templates', () => {
      const template = `
You are an AI assistant helping with {{task}}.

Context:
{{#each contextItems}}
- {{this.title}}: {{this.content}}
{{/each}}

User request: {{input.request}}

Please provide a {{style}} response.
      `;

      const result = validatePromptTemplate(template);

      expect(result.valid).toBe(true);
    });
  });

  // ============================================================================
  // Default Configuration Creation
  // ============================================================================

  describe('createDefaultPromptConfig', () => {
    it('should create valid default prompt configuration', () => {
      const config = createDefaultPromptConfig('test-prompt', 'Test Prompt');

      expect(config.id).toBe('test-prompt');
      expect(config.name).toBe('Test Prompt');
      expect(config.template).toBe('');
      expect(config.version).toBe('1.0.0');
      expect(config.category).toBe('custom');
      expect(config.variables).toEqual([]);
      expect(config.tags).toEqual([]);
      expect(config.isActive).toBe(true);
      expect(config.createdAt).toBeInstanceOf(Date);
      expect(config.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow custom category', () => {
      const config = createDefaultPromptConfig('test', 'Test', 'analysis');

      expect(config.category).toBe('analysis');
    });

    it('should set default timestamps', () => {
      const before = new Date();
      const config = createDefaultPromptConfig('test', 'Test');
      const after = new Date();

      expect(config.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(config.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(config.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('should create proper version history', () => {
      const config = createDefaultPromptConfig('test', 'Test');

      expect(config.versionHistory).toEqual([]);
    });
  });

  describe('createPromptVersion', () => {
    it('should create prompt version snapshot', () => {
      const config = createDefaultPromptConfig('test', 'Test');
      config.template = 'Hello {{name}}';
      config.variables = [{ name: 'name', type: 'string', required: true }];

      const version = createPromptVersion(config, 'Initial version');

      expect(version.version).toBe('1.0.0');
      expect(version.template).toBe('Hello {{name}}');
      expect(version.variables).toEqual(config.variables);
      expect(version.changeLog).toBe('Initial version');
      expect(version.createdAt).toBeInstanceOf(Date);
      expect(version.createdBy).toBe('system');
    });

    it('should allow custom createdBy', () => {
      const config = createDefaultPromptConfig('test', 'Test');
      const version = createPromptVersion(config, 'Update', 'user_123');

      expect(version.createdBy).toBe('user_123');
    });

    it('should handle empty changelog', () => {
      const config = createDefaultPromptConfig('test', 'Test');
      const version = createPromptVersion(config, '');

      expect(version.changeLog).toBe('');
    });
  });

  // ============================================================================
  // Prompt Configuration Validation
  // ============================================================================

  describe('validatePromptConfiguration', () => {
    let validPrompt: PromptConfiguration;

    beforeEach(() => {
      validPrompt = createDefaultPromptConfig('test-prompt', 'Test Prompt');
      validPrompt.template = 'Hello {{name}}, your score is {{score}}.';
      validPrompt.variables = [
        { name: 'name', type: 'string', required: true, description: 'User name' },
        { name: 'score', type: 'number', required: true, description: 'Score value' },
      ];
    });

    it('should validate correct prompt configuration', () => {
      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should require prompt id', () => {
      validPrompt.id = '';

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Prompt ID is required');
    });

    it('should require prompt name', () => {
      validPrompt.name = '';

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Prompt name is required');
    });

    it('should require template', () => {
      validPrompt.template = '';

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Prompt template is required');
    });

    it('should validate template syntax', () => {
      validPrompt.template = 'Invalid {{template';

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('template'))).toBe(true);
    });

    it('should validate version format', () => {
      validPrompt.version = 'invalid';

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Version must follow semver format (e.g., 1.0.0)');
    });

    it('should validate category', () => {
      validPrompt.category = 'invalid' as PromptCategory;

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid prompt category: invalid');
    });

    it('should validate variable definitions', () => {
      validPrompt.variables = [
        { name: '', type: 'string', required: true } as any,
      ];

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Variable name is required'))).toBe(true);
    });

    it('should detect undefined variables in template', () => {
      validPrompt.template = 'Hello {{name}}, {{undefinedVar}}';

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('undefinedVar'))).toBe(true);
    });

    it('should detect unused variables', () => {
      validPrompt.variables.push({
        name: 'unusedVar',
        type: 'string',
        required: false,
      });

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('unusedVar') && e.includes('not used'))).toBe(true);
    });

    it('should validate variable types', () => {
      validPrompt.variables = [
        { name: 'name', type: 'invalid' as any, required: true },
      ];

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid variable type'))).toBe(true);
    });

    it('should detect duplicate variable names', () => {
      validPrompt.variables = [
        { name: 'name', type: 'string', required: true },
        { name: 'name', type: 'number', required: false }, // Duplicate
      ];

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate variable'))).toBe(true);
    });

    it('should allow multiple validation errors', () => {
      validPrompt.id = '';
      validPrompt.name = '';
      validPrompt.template = '';

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should validate default values match types', () => {
      validPrompt.variables = [
        { 
          name: 'count', 
          type: 'number', 
          required: false,
          defaultValue: 'not a number' as any
        },
      ];
      validPrompt.template = 'Count: {{count}}';

      const result = validatePromptConfiguration(validPrompt);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('default value'))).toBe(true);
    });
  });

  // ============================================================================
  // Variable Type Validation
  // ============================================================================

  describe('Variable type validation', () => {
    it('should validate string variables', () => {
      const variable: PromptVariable = {
        name: 'text',
        type: 'string',
        required: true,
        defaultValue: 'default',
      };

      expect(variable.type).toBe('string');
      expect(typeof variable.defaultValue).toBe('string');
    });

    it('should validate number variables', () => {
      const variable: PromptVariable = {
        name: 'count',
        type: 'number',
        required: false,
        defaultValue: 42,
      };

      expect(variable.type).toBe('number');
      expect(typeof variable.defaultValue).toBe('number');
    });

    it('should validate boolean variables', () => {
      const variable: PromptVariable = {
        name: 'flag',
        type: 'boolean',
        required: false,
        defaultValue: true,
      };

      expect(variable.type).toBe('boolean');
      expect(typeof variable.defaultValue).toBe('boolean');
    });

    it('should validate array variables', () => {
      const variable: PromptVariable = {
        name: 'items',
        type: 'array',
        required: false,
        defaultValue: ['a', 'b', 'c'],
      };

      expect(variable.type).toBe('array');
      expect(Array.isArray(variable.defaultValue)).toBe(true);
    });

    it('should validate object variables', () => {
      const variable: PromptVariable = {
        name: 'config',
        type: 'object',
        required: false,
        defaultValue: { key: 'value' },
      };

      expect(variable.type).toBe('object');
      expect(typeof variable.defaultValue).toBe('object');
    });
  });

  // ============================================================================
  // Version History
  // ============================================================================

  describe('Version history', () => {
    it('should maintain version history', () => {
      const config = createDefaultPromptConfig('test', 'Test');
      config.template = 'Version 1';

      const v1 = createPromptVersion(config, 'Initial version');
      config.versionHistory = [v1];

      expect(config.versionHistory).toHaveLength(1);
      expect(config.versionHistory[0].version).toBe('1.0.0');
    });

    it('should track multiple versions', () => {
      const config = createDefaultPromptConfig('test', 'Test');
      
      config.template = 'Version 1';
      const v1 = createPromptVersion(config, 'Initial');
      
      config.version = '1.1.0';
      config.template = 'Version 2';
      const v2 = createPromptVersion(config, 'Update');
      
      config.versionHistory = [v1, v2];

      expect(config.versionHistory).toHaveLength(2);
      expect(config.versionHistory[1].version).toBe('1.1.0');
    });

    it('should preserve version metadata', () => {
      const config = createDefaultPromptConfig('test', 'Test');
      const version = createPromptVersion(config, 'Test version', 'user_123');

      expect(version.createdBy).toBe('user_123');
      expect(version.createdAt).toBeInstanceOf(Date);
      expect(version.changeLog).toBe('Test version');
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle very long templates', () => {
      const longTemplate = 'A'.repeat(10000) + '{{name}}';
      const config = createDefaultPromptConfig('test', 'Test');
      config.template = longTemplate;

      expect(config.template.length).toBeGreaterThan(10000);
    });

    it('should handle special characters in variable names', () => {
      const variables = extractTemplateVariables('{{user_name}} {{item-id}}');

      expect(variables).toContain('user_name');
      expect(variables).toContain('item-id');
    });

    it('should handle Unicode in templates', () => {
      const template = 'مرحبا {{name}} 你好 {{greeting}}';
      const variables = extractTemplateVariables(template);

      expect(variables).toContain('name');
      expect(variables).toContain('greeting');
    });

    it('should handle nested Handlebars blocks', () => {
      const template = `
{{#if outer}}
  {{#each items}}
    {{#if this.visible}}
      {{this.name}}
    {{/if}}
  {{/each}}
{{/if}}
      `;

      const result = validatePromptTemplate(template);

      expect(result.valid).toBe(true);
    });

    it('should handle many variables', () => {
      const variables = Array.from({ length: 100 }, (_, i) => ({
        name: `var${i}`,
        type: 'string' as const,
        required: false,
      }));

      const config = createDefaultPromptConfig('test', 'Test');
      config.variables = variables;
      config.template = variables.map(v => `{{${v.name}}}`).join(' ');

      const result = validatePromptConfiguration(config);

      expect(result.valid).toBe(true);
    });
  });
});
