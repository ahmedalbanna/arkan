/**
 * Tool Configuration Model Tests
 * 
 * Tests for ToolConfiguration type definitions, validation, and utility functions
 */

import {
  ToolConfiguration,
  ToolCategory,
  ToolImplementationType,
  ToolStatistics,
  validateToolConfiguration,
  validateToolSchema,
  createDefaultToolConfig,
  isValidToolCategory,
  getToolCategoryLabel,
  calculateToolStatistics,
} from '../tool-config';

describe('Tool Configuration Model', () => {
  // ============================================================================
  // Type Validation
  // ============================================================================

  describe('isValidToolCategory', () => {
    it('should return true for valid categories', () => {
      expect(isValidToolCategory('text-generation')).toBe(true);
      expect(isValidToolCategory('analysis')).toBe(true);
      expect(isValidToolCategory('transformation')).toBe(true);
      expect(isValidToolCategory('retrieval')).toBe(true);
      expect(isValidToolCategory('utility')).toBe(true);
      expect(isValidToolCategory('custom')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(isValidToolCategory('invalid')).toBe(false);
      expect(isValidToolCategory('')).toBe(false);
      expect(isValidToolCategory('TEXT-GENERATION')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidToolCategory(null as any)).toBe(false);
      expect(isValidToolCategory(undefined as any)).toBe(false);
      expect(isValidToolCategory(123 as any)).toBe(false);
    });
  });

  describe('getToolCategoryLabel', () => {
    it('should return human-readable labels', () => {
      expect(getToolCategoryLabel('text-generation')).toBe('Text Generation');
      expect(getToolCategoryLabel('analysis')).toBe('Analysis');
      expect(getToolCategoryLabel('transformation')).toBe('Transformation');
      expect(getToolCategoryLabel('retrieval')).toBe('Retrieval');
      expect(getToolCategoryLabel('utility')).toBe('Utility');
      expect(getToolCategoryLabel('custom')).toBe('Custom');
    });

    it('should handle invalid categories', () => {
      expect(getToolCategoryLabel('invalid' as ToolCategory)).toBe('Unknown');
    });
  });

  // ============================================================================
  // Default Configuration Creation
  // ============================================================================

  describe('createDefaultToolConfig', () => {
    it('should create valid default tool configuration', () => {
      const config = createDefaultToolConfig('test-tool', 'Test Tool');

      expect(config.name).toBe('test-tool');
      expect(config.displayName).toBe('Test Tool');
      expect(config.description).toBe('');
      expect(config.category).toBe('custom');
      expect(config.version).toBe('1.0.0');
      expect(config.enabled).toBe(true);
      expect(config.isBuiltIn).toBe(false);
      expect(config.tags).toEqual([]);
      expect(config.createdAt).toBeInstanceOf(Date);
      expect(config.updatedAt).toBeInstanceOf(Date);
    });

    it('should create default schema', () => {
      const config = createDefaultToolConfig('test', 'Test');

      expect(config.schema.input).toBeDefined();
      expect(config.schema.input.type).toBe('object');
      expect(config.schema.input.properties).toEqual({});
      expect(config.schema.input.required).toEqual([]);

      expect(config.schema.output).toBeDefined();
      expect(config.schema.output.type).toBe('object');
      expect(config.schema.output.properties).toEqual({});
    });

    it('should create default implementation', () => {
      const config = createDefaultToolConfig('test', 'Test');

      expect(config.implementation.type).toBe('genkit-flow');
      expect(config.implementation.flowName).toBe('test');
    });

    it('should create default config', () => {
      const config = createDefaultToolConfig('test', 'Test');

      expect(config.config.timeout).toBe(30000);
      expect(config.config.retries).toBe(3);
    });

    it('should initialize statistics', () => {
      const config = createDefaultToolConfig('test', 'Test');

      expect(config.stats).toBeDefined();
      expect(config.stats.totalCalls).toBe(0);
      expect(config.stats.successfulCalls).toBe(0);
      expect(config.stats.failedCalls).toBe(0);
      expect(config.stats.totalExecutionTime).toBe(0);
      expect(config.stats.avgExecutionTime).toBe(0);
    });

    it('should allow custom category', () => {
      const config = createDefaultToolConfig('test', 'Test', 'analysis');

      expect(config.category).toBe('analysis');
    });

    it('should set proper author', () => {
      const config = createDefaultToolConfig('test', 'Test');

      expect(config.createdBy).toBe('system');
      expect(config.updatedBy).toBe('system');
    });
  });

  // ============================================================================
  // Schema Validation
  // ============================================================================

  describe('validateToolSchema', () => {
    it('should validate correct schema', () => {
      const schema = {
        input: {
          type: 'object' as const,
          properties: {
            text: { type: 'string' as const },
            count: { type: 'number' as const },
          },
          required: ['text'],
        },
        output: {
          type: 'object' as const,
          properties: {
            result: { type: 'string' as const },
          },
        },
      };

      const result = validateToolSchema(schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should require input schema', () => {
      const schema = {
        input: null as any,
        output: { type: 'object' as const, properties: {} },
      };

      const result = validateToolSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Input schema is required');
    });

    it('should require output schema', () => {
      const schema = {
        input: { type: 'object' as const, properties: {} },
        output: null as any,
      };

      const result = validateToolSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Output schema is required');
    });

    it('should validate input schema type', () => {
      const schema = {
        input: {
          type: 'invalid' as any,
          properties: {},
        },
        output: { type: 'object' as const, properties: {} },
      };

      const result = validateToolSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Input schema must be object type'))).toBe(true);
    });

    it('should validate output schema type', () => {
      const schema = {
        input: { type: 'object' as const, properties: {} },
        output: {
          type: 'invalid' as any,
          properties: {},
        },
      };

      const result = validateToolSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Output schema must be object type'))).toBe(true);
    });

    it('should validate property types', () => {
      const schema = {
        input: {
          type: 'object' as const,
          properties: {
            field: { type: 'invalidType' as any },
          },
        },
        output: { type: 'object' as const, properties: {} },
      };

      const result = validateToolSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid property type'))).toBe(true);
    });

    it('should validate required fields exist', () => {
      const schema = {
        input: {
          type: 'object' as const,
          properties: {
            existing: { type: 'string' as const },
          },
          required: ['existing', 'nonExistent'],
        },
        output: { type: 'object' as const, properties: {} },
      };

      const result = validateToolSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('nonExistent'))).toBe(true);
    });

    it('should allow nested object schemas', () => {
      const schema = {
        input: {
          type: 'object' as const,
          properties: {
            user: {
              type: 'object' as const,
              properties: {
                name: { type: 'string' as const },
                age: { type: 'number' as const },
              },
            },
          },
        },
        output: { type: 'object' as const, properties: {} },
      };

      const result = validateToolSchema(schema);

      expect(result.valid).toBe(true);
    });

    it('should allow array schemas', () => {
      const schema = {
        input: {
          type: 'object' as const,
          properties: {
            items: {
              type: 'array' as const,
              items: { type: 'string' as const },
            },
          },
        },
        output: { type: 'object' as const, properties: {} },
      };

      const result = validateToolSchema(schema);

      expect(result.valid).toBe(true);
    });
  });

  // ============================================================================
  // Tool Configuration Validation
  // ============================================================================

  describe('validateToolConfiguration', () => {
    let validTool: ToolConfiguration;

    beforeEach(() => {
      validTool = createDefaultToolConfig('test-tool', 'Test Tool', 'analysis');
      validTool.description = 'A test tool';
      validTool.schema = {
        input: {
          type: 'object',
          properties: {
            text: { type: 'string' },
          },
          required: ['text'],
        },
        output: {
          type: 'object',
          properties: {
            result: { type: 'string' },
          },
        },
      };
    });

    it('should validate correct tool configuration', () => {
      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should require tool name', () => {
      validTool.name = '';

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tool name is required');
    });

    it('should require display name', () => {
      validTool.displayName = '';

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tool display name is required');
    });

    it('should validate name format', () => {
      validTool.name = 'Invalid Name With Spaces';

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tool name must be kebab-case (e.g., my-tool-name)');
    });

    it('should allow valid name formats', () => {
      const validNames = ['my-tool', 'tool-123', 'a-b-c', 'test-tool-name'];

      validNames.forEach(name => {
        validTool.name = name;
        const result = validateToolConfiguration(validTool);
        expect(result.valid).toBe(true);
      });
    });

    it('should validate version format', () => {
      validTool.version = 'invalid';

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Version must follow semver format (e.g., 1.0.0)');
    });

    it('should validate category', () => {
      validTool.category = 'invalid' as ToolCategory;

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid tool category: invalid');
    });

    it('should validate schema', () => {
      validTool.schema = {
        input: null as any,
        output: null as any,
      };

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate implementation type', () => {
      validTool.implementation = {
        type: 'invalid' as any,
        flowName: 'test',
      };

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid implementation type'))).toBe(true);
    });

    it('should require flowName for genkit-flow implementation', () => {
      validTool.implementation = {
        type: 'genkit-flow',
        flowName: '',
      };

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('flowName'))).toBe(true);
    });

    it('should require handler for custom implementation', () => {
      validTool.implementation = {
        type: 'custom',
        handler: null as any,
      };

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('handler'))).toBe(true);
    });

    it('should require endpoint for api implementation', () => {
      validTool.implementation = {
        type: 'api',
        endpoint: '',
      };

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('endpoint'))).toBe(true);
    });

    it('should validate timeout value', () => {
      validTool.config.timeout = -1000;

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('timeout'))).toBe(true);
    });

    it('should validate retries value', () => {
      validTool.config.retries = -5;

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('retries'))).toBe(true);
    });

    it('should allow multiple validation errors', () => {
      validTool.name = '';
      validTool.displayName = '';
      validTool.version = 'invalid';

      const result = validateToolConfiguration(validTool);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  // ============================================================================
  // Tool Statistics
  // ============================================================================

  describe('calculateToolStatistics', () => {
    it('should calculate statistics correctly', () => {
      const stats: ToolStatistics = {
        totalCalls: 100,
        successfulCalls: 85,
        failedCalls: 15,
        totalExecutionTime: 50000,
        avgExecutionTime: 500,
      };

      const calculated = calculateToolStatistics(stats);

      expect(calculated.successRate).toBeCloseTo(0.85, 2);
      expect(calculated.failureRate).toBeCloseTo(0.15, 2);
    });

    it('should handle zero calls', () => {
      const stats: ToolStatistics = {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalExecutionTime: 0,
        avgExecutionTime: 0,
      };

      const calculated = calculateToolStatistics(stats);

      expect(calculated.successRate).toBe(0);
      expect(calculated.failureRate).toBe(0);
    });

    it('should calculate average execution time', () => {
      const stats: ToolStatistics = {
        totalCalls: 10,
        successfulCalls: 10,
        failedCalls: 0,
        totalExecutionTime: 15000,
        avgExecutionTime: 0,
      };

      const calculated = calculateToolStatistics(stats);

      expect(calculated.avgExecutionTime).toBe(1500);
    });

    it('should handle perfect success rate', () => {
      const stats: ToolStatistics = {
        totalCalls: 100,
        successfulCalls: 100,
        failedCalls: 0,
        totalExecutionTime: 50000,
        avgExecutionTime: 500,
      };

      const calculated = calculateToolStatistics(stats);

      expect(calculated.successRate).toBe(1.0);
      expect(calculated.failureRate).toBe(0.0);
    });

    it('should handle perfect failure rate', () => {
      const stats: ToolStatistics = {
        totalCalls: 50,
        successfulCalls: 0,
        failedCalls: 50,
        totalExecutionTime: 25000,
        avgExecutionTime: 500,
      };

      const calculated = calculateToolStatistics(stats);

      expect(calculated.successRate).toBe(0.0);
      expect(calculated.failureRate).toBe(1.0);
    });

    it('should validate total calls consistency', () => {
      const stats: ToolStatistics = {
        totalCalls: 100,
        successfulCalls: 60,
        failedCalls: 50, // Should be 40 for consistency
        totalExecutionTime: 50000,
        avgExecutionTime: 500,
      };

      const calculated = calculateToolStatistics(stats);

      // Should still calculate based on provided numbers
      expect(calculated.successRate).toBeCloseTo(0.6, 2);
    });
  });

  // ============================================================================
  // Implementation Types
  // ============================================================================

  describe('Implementation types', () => {
    it('should support genkit-flow implementation', () => {
      const config = createDefaultToolConfig('test', 'Test');
      config.implementation = {
        type: 'genkit-flow',
        flowName: 'my-flow',
      };

      expect(config.implementation.type).toBe('genkit-flow');
      expect(config.implementation.flowName).toBe('my-flow');
    });

    it('should support custom implementation', () => {
      const handler = async (input: any) => ({ result: 'success' });
      const config = createDefaultToolConfig('test', 'Test');
      config.implementation = {
        type: 'custom',
        handler,
      };

      expect(config.implementation.type).toBe('custom');
      expect(config.implementation.handler).toBe(handler);
    });

    it('should support api implementation', () => {
      const config = createDefaultToolConfig('test', 'Test');
      config.implementation = {
        type: 'api',
        endpoint: 'https://api.example.com/tool',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      };

      expect(config.implementation.type).toBe('api');
      expect(config.implementation.endpoint).toBe('https://api.example.com/tool');
      expect(config.implementation.method).toBe('POST');
    });
  });

  // ============================================================================
  // Tool Metadata
  // ============================================================================

  describe('Tool metadata', () => {
    it('should track creation metadata', () => {
      const config = createDefaultToolConfig('test', 'Test');

      expect(config.createdBy).toBe('system');
      expect(config.createdAt).toBeInstanceOf(Date);
    });

    it('should track update metadata', () => {
      const config = createDefaultToolConfig('test', 'Test');

      expect(config.updatedBy).toBe('system');
      expect(config.updatedAt).toBeInstanceOf(Date);
    });

    it('should support tags', () => {
      const config = createDefaultToolConfig('test', 'Test');
      config.tags = ['nlp', 'text-processing', 'beta'];

      expect(config.tags).toEqual(['nlp', 'text-processing', 'beta']);
    });

    it('should track enabled status', () => {
      const config = createDefaultToolConfig('test', 'Test');

      expect(config.enabled).toBe(true);

      config.enabled = false;
      expect(config.enabled).toBe(false);
    });

    it('should distinguish built-in tools', () => {
      const config = createDefaultToolConfig('test', 'Test');

      expect(config.isBuiltIn).toBe(false);

      config.isBuiltIn = true;
      expect(config.isBuiltIn).toBe(true);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle very long descriptions', () => {
      const longDesc = 'A'.repeat(10000);
      const config = createDefaultToolConfig('test', 'Test');
      config.description = longDesc;

      expect(config.description.length).toBe(10000);
    });

    it('should handle special characters in names', () => {
      const config = createDefaultToolConfig('test-tool-123', 'Test Tool #123');

      expect(config.name).toBe('test-tool-123');
      expect(config.displayName).toBe('Test Tool #123');
    });

    it('should handle Unicode in display names', () => {
      const config = createDefaultToolConfig('test', '测试工具 مرحبا');

      expect(config.displayName).toBe('测试工具 مرحبا');
    });

    it('should handle complex nested schemas', () => {
      const config = createDefaultToolConfig('test', 'Test');
      config.schema = {
        input: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                profile: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    settings: {
                      type: 'object',
                      properties: {
                        theme: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        output: {
          type: 'object',
          properties: {},
        },
      };

      const result = validateToolSchema(config.schema);

      expect(result.valid).toBe(true);
    });

    it('should handle large statistics', () => {
      const stats: ToolStatistics = {
        totalCalls: 1000000,
        successfulCalls: 999990,
        failedCalls: 10,
        totalExecutionTime: 500000000,
        avgExecutionTime: 500,
      };

      const calculated = calculateToolStatistics(stats);

      expect(calculated.successRate).toBeGreaterThan(0.999);
    });

    it('should handle many tags', () => {
      const config = createDefaultToolConfig('test', 'Test');
      config.tags = Array.from({ length: 50 }, (_, i) => `tag${i}`);

      expect(config.tags.length).toBe(50);
    });
  });
});
