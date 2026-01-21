/**
 * Flow Configuration Model Tests
 * 
 * Tests for FlowConfiguration type definitions, validation, and utility functions
 */

import {
  FlowConfiguration,
  FlowStep,
  StepType,
  FlowStatus,
  validateFlowConfiguration,
  validateStepConfiguration,
  isValidStepType,
  getStepTypeLabel,
  createDefaultFlowConfig,
  createDefaultStepConfig,
  FlowMetadata,
  FlowGlobalConfig,
  SchemaDefinition,
} from '../flow-config';

describe('Flow Configuration Model', () => {
  // ============================================================================
  // Type Validation
  // ============================================================================

  describe('isValidStepType', () => {
    it('should return true for valid step types', () => {
      expect(isValidStepType('retrieve')).toBe(true);
      expect(isValidStepType('generate')).toBe(true);
      expect(isValidStepType('tool')).toBe(true);
      expect(isValidStepType('format')).toBe(true);
      expect(isValidStepType('transform')).toBe(true);
      expect(isValidStepType('condition')).toBe(true);
      expect(isValidStepType('loop')).toBe(true);
    });

    it('should return false for invalid step types', () => {
      expect(isValidStepType('invalid')).toBe(false);
      expect(isValidStepType('unknown')).toBe(false);
      expect(isValidStepType('')).toBe(false);
      expect(isValidStepType('RETRIEVE')).toBe(false); // case sensitive
    });

    it('should handle edge cases', () => {
      expect(isValidStepType(null as any)).toBe(false);
      expect(isValidStepType(undefined as any)).toBe(false);
      expect(isValidStepType(123 as any)).toBe(false);
    });
  });

  describe('getStepTypeLabel', () => {
    it('should return human-readable labels', () => {
      expect(getStepTypeLabel('retrieve')).toBe('Retrieve (RAG)');
      expect(getStepTypeLabel('generate')).toBe('Generate (LLM)');
      expect(getStepTypeLabel('tool')).toBe('Tool Call');
      expect(getStepTypeLabel('format')).toBe('Format Output');
      expect(getStepTypeLabel('transform')).toBe('Transform Data');
      expect(getStepTypeLabel('condition')).toBe('Conditional Branch');
      expect(getStepTypeLabel('loop')).toBe('Loop/Iterate');
    });

    it('should handle invalid types', () => {
      expect(getStepTypeLabel('invalid' as StepType)).toBe('Unknown');
      expect(getStepTypeLabel('' as StepType)).toBe('Unknown');
    });
  });

  // ============================================================================
  // Default Configuration Creation
  // ============================================================================

  describe('createDefaultFlowConfig', () => {
    it('should create valid default flow configuration', () => {
      const config = createDefaultFlowConfig('test-flow', 'Test Flow');

      expect(config.id).toBe('test-flow');
      expect(config.name).toBe('Test Flow');
      expect(config.version).toBe('1.0.0');
      expect(config.description).toBe('');
      expect(config.steps).toEqual([]);
      expect(config.status).toBe('draft');
      expect(config.inputSchema).toBeDefined();
      expect(config.outputSchema).toBeDefined();
      expect(config.config).toBeDefined();
      expect(config.metadata).toBeDefined();
    });

    it('should create proper default schemas', () => {
      const config = createDefaultFlowConfig('test', 'Test');

      expect(config.inputSchema.type).toBe('object');
      expect(config.inputSchema.properties).toEqual({});
      expect(config.inputSchema.required).toEqual([]);

      expect(config.outputSchema.type).toBe('object');
      expect(config.outputSchema.properties).toEqual({});
    });

    it('should create proper default config', () => {
      const config = createDefaultFlowConfig('test', 'Test');

      expect(config.config.timeout).toBe(300000); // 5 minutes
      expect(config.config.retries).toBe(0);
      expect(config.config.cache).toBe(false);
      expect(config.config.streaming).toBe(false);
    });

    it('should create proper metadata', () => {
      const config = createDefaultFlowConfig('test', 'Test');

      expect(config.metadata.author).toBe('system');
      expect(config.metadata.category).toBe('general');
      expect(config.metadata.tags).toEqual([]);
      expect(config.metadata.isPublic).toBe(false);
      expect(config.metadata.createdAt).toBeInstanceOf(Date);
      expect(config.metadata.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow custom descriptions', () => {
      const config = createDefaultFlowConfig('test', 'Test', 'Custom description');

      expect(config.description).toBe('Custom description');
    });
  });

  describe('createDefaultStepConfig', () => {
    it('should create default retrieve step', () => {
      const step = createDefaultStepConfig('retrieve', 'step1', 'Retrieve Data');

      expect(step.id).toBe('step1');
      expect(step.name).toBe('Retrieve Data');
      expect(step.type).toBe('retrieve');
      expect(step.config).toEqual({
        collection: 'documents',
        query: '{{input.query}}',
        limit: 5,
        minScore: 0.7,
      });
      expect(step.required).toBe(true);
      expect(step.enabled).toBe(true);
    });

    it('should create default generate step', () => {
      const step = createDefaultStepConfig('generate', 'step1', 'Generate Text');

      expect(step.type).toBe('generate');
      expect(step.config).toEqual({
        model: 'gemini-2.0-flash-exp',
        prompt: 'Generate content based on: {{input.text}}',
        temperature: 0.7,
        maxTokens: 1000,
      });
    });

    it('should create default tool step', () => {
      const step = createDefaultStepConfig('tool', 'step1', 'Call Tool');

      expect(step.type).toBe('tool');
      expect(step.config).toEqual({
        toolName: 'example-tool',
        input: {
          data: '{{input.data}}',
        },
      });
    });

    it('should create default format step', () => {
      const step = createDefaultStepConfig('format', 'step1', 'Format Output');

      expect(step.type).toBe('format');
      expect(step.config).toEqual({
        template: '{{steps.previousStep.output}}',
        format: 'text',
      });
    });

    it('should create default transform step', () => {
      const step = createDefaultStepConfig('transform', 'step1', 'Transform Data');

      expect(step.type).toBe('transform');
      expect(step.config).toEqual({
        input: '{{steps.previousStep.output}}',
        transformer: 'uppercase',
        parameters: {},
      });
    });

    it('should create default condition step', () => {
      const step = createDefaultStepConfig('condition', 'step1', 'Check Condition');

      expect(step.type).toBe('condition');
      expect(step.config).toEqual({
        condition: '{{input.value}} > 0',
        thenSteps: [],
        elseSteps: [],
      });
    });

    it('should create default loop step', () => {
      const step = createDefaultStepConfig('loop', 'step1', 'Loop Over Items');

      expect(step.type).toBe('loop');
      expect(step.config).toEqual({
        iterateOver: '{{input.items}}',
        itemVariable: 'item',
        steps: [],
        maxIterations: 100,
      });
    });

    it('should set proper default values', () => {
      const step = createDefaultStepConfig('generate', 'step1', 'Test');

      expect(step.required).toBe(true);
      expect(step.enabled).toBe(true);
      expect(step.description).toBe('');
      expect(step.outputMapping).toBeUndefined();
      expect(step.condition).toBeUndefined();
      expect(step.errorHandling).toBeUndefined();
    });
  });

  // ============================================================================
  // Flow Configuration Validation
  // ============================================================================

  describe('validateFlowConfiguration', () => {
    let validFlow: FlowConfiguration;

    beforeEach(() => {
      validFlow = createDefaultFlowConfig('test-flow', 'Test Flow');
      validFlow.steps = [
        createDefaultStepConfig('retrieve', 'step1', 'Retrieve'),
        createDefaultStepConfig('generate', 'step2', 'Generate'),
      ];
    });

    it('should validate correct flow configuration', () => {
      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should require flow id', () => {
      validFlow.id = '';

      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Flow ID is required');
    });

    it('should require flow name', () => {
      validFlow.name = '';

      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Flow name is required');
    });

    it('should require valid version format', () => {
      validFlow.version = 'invalid';

      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Version must follow semver format (e.g., 1.0.0)');
    });

    it('should accept valid version formats', () => {
      const versions = ['1.0.0', '2.5.3', '10.20.30', '0.0.1'];

      versions.forEach(version => {
        validFlow.version = version;
        const result = validateFlowConfiguration(validFlow);
        expect(result.valid).toBe(true);
      });
    });

    it('should require at least one step', () => {
      validFlow.steps = [];

      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Flow must have at least one step');
    });

    it('should detect duplicate step IDs', () => {
      validFlow.steps = [
        createDefaultStepConfig('retrieve', 'step1', 'Step 1'),
        createDefaultStepConfig('generate', 'step1', 'Step 2'), // Duplicate ID
      ];

      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duplicate step ID: step1');
    });

    it('should validate step references in conditions', () => {
      validFlow.steps[0].condition = {
        expression: '{{steps.nonExistent.output}} > 0',
        defaultValue: false,
      };

      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Step step1: References non-existent step nonExistent');
    });

    it('should validate fallback step references', () => {
      validFlow.steps[0].errorHandling = {
        fallback: 'nonExistentStep',
        continueOnError: false,
        retries: 0,
      };

      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Step step1: Fallback step nonExistentStep does not exist');
    });

    it('should detect circular dependencies', () => {
      validFlow.steps = [
        {
          ...createDefaultStepConfig('generate', 'step1', 'Step 1'),
          config: { prompt: '{{steps.step2.output}}' },
        },
        {
          ...createDefaultStepConfig('generate', 'step2', 'Step 2'),
          config: { prompt: '{{steps.step1.output}}' },
        },
      ];

      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Circular dependency'))).toBe(true);
    });

    it('should validate condition branch steps', () => {
      validFlow.steps[0] = {
        ...createDefaultStepConfig('condition', 'step1', 'Condition'),
        config: {
          condition: 'true',
          thenSteps: ['nonExistent'],
          elseSteps: [],
        },
      };

      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Step step1: Then branch references non-existent step nonExistent');
    });

    it('should validate loop nested steps', () => {
      validFlow.steps[0] = {
        ...createDefaultStepConfig('loop', 'step1', 'Loop'),
        config: {
          iterateOver: '{{input.items}}',
          itemVariable: 'item',
          steps: ['nonExistent'],
          maxIterations: 100,
        },
      };

      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Step step1: Loop references non-existent step nonExistent');
    });

    it('should allow multiple validation errors', () => {
      validFlow.id = '';
      validFlow.name = '';
      validFlow.steps = [];

      const result = validateFlowConfiguration(validFlow);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Flow ID is required');
      expect(result.errors).toContain('Flow name is required');
      expect(result.errors).toContain('Flow must have at least one step');
    });
  });

  // ============================================================================
  // Step Configuration Validation
  // ============================================================================

  describe('validateStepConfiguration', () => {
    it('should validate correct step configuration', () => {
      const step = createDefaultStepConfig('retrieve', 'step1', 'Retrieve');
      const result = validateStepConfiguration(step);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should require step id', () => {
      const step = createDefaultStepConfig('retrieve', '', 'Retrieve');
      const result = validateStepConfiguration(step);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Step ID is required');
    });

    it('should require step name', () => {
      const step = createDefaultStepConfig('retrieve', 'step1', '');
      const result = validateStepConfiguration(step);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Step name is required');
    });

    it('should validate step type', () => {
      const step = {
        ...createDefaultStepConfig('retrieve', 'step1', 'Test'),
        type: 'invalid' as StepType,
      };
      const result = validateStepConfiguration(step);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid step type: invalid');
    });

    it('should validate retrieve step config', () => {
      const step = createDefaultStepConfig('retrieve', 'step1', 'Retrieve');
      step.config = { invalid: 'config' };

      const result = validateStepConfiguration(step);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('collection'))).toBe(true);
    });

    it('should validate generate step config', () => {
      const step = createDefaultStepConfig('generate', 'step1', 'Generate');
      step.config = { invalid: 'config' };

      const result = validateStepConfiguration(step);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('prompt') || e.includes('model'))).toBe(true);
    });

    it('should validate tool step config', () => {
      const step = createDefaultStepConfig('tool', 'step1', 'Tool');
      step.config = { invalid: 'config' };

      const result = validateStepConfiguration(step);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('toolName'))).toBe(true);
    });

    it('should validate condition step config', () => {
      const step = createDefaultStepConfig('condition', 'step1', 'Condition');
      step.config = { invalid: 'config' };

      const result = validateStepConfiguration(step);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('condition'))).toBe(true);
    });

    it('should validate loop step config', () => {
      const step = createDefaultStepConfig('loop', 'step1', 'Loop');
      step.config = { invalid: 'config' };

      const result = validateStepConfiguration(step);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('iterateOver'))).toBe(true);
    });

    it('should allow multiple validation errors', () => {
      const step = {
        id: '',
        name: '',
        type: 'invalid' as StepType,
        config: {},
        required: true,
        enabled: true,
        description: '',
      };

      const result = validateStepConfiguration(step);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  // ============================================================================
  // Type Definitions
  // ============================================================================

  describe('Type Definitions', () => {
    it('should allow valid FlowConfiguration', () => {
      const flow: FlowConfiguration = createDefaultFlowConfig('test', 'Test');
      
      expect(flow.id).toBeDefined();
      expect(flow.name).toBeDefined();
      expect(flow.version).toBeDefined();
      expect(flow.steps).toBeDefined();
      expect(flow.inputSchema).toBeDefined();
      expect(flow.outputSchema).toBeDefined();
    });

    it('should allow valid FlowStep', () => {
      const step: FlowStep = createDefaultStepConfig('retrieve', 'step1', 'Test');
      
      expect(step.id).toBeDefined();
      expect(step.name).toBeDefined();
      expect(step.type).toBeDefined();
      expect(step.config).toBeDefined();
    });

    it('should enforce StepType values', () => {
      const validTypes: StepType[] = [
        'retrieve',
        'generate',
        'tool',
        'format',
        'transform',
        'condition',
        'loop',
      ];

      validTypes.forEach(type => {
        const step = createDefaultStepConfig(type, 'step1', 'Test');
        expect(step.type).toBe(type);
      });
    });

    it('should enforce FlowStatus values', () => {
      const validStatuses: FlowStatus[] = ['draft', 'published', 'archived'];

      validStatuses.forEach(status => {
        const flow = createDefaultFlowConfig('test', 'Test');
        flow.status = status;
        expect(flow.status).toBe(status);
      });
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const flow = createDefaultFlowConfig('', '');
      const result = validateFlowConfiguration(flow);

      expect(result.valid).toBe(false);
    });

    it('should handle very long flow names', () => {
      const longName = 'A'.repeat(1000);
      const flow = createDefaultFlowConfig('test', longName);

      expect(flow.name).toBe(longName);
    });

    it('should handle special characters in IDs', () => {
      const flow = createDefaultFlowConfig('test-flow_123', 'Test');

      expect(flow.id).toBe('test-flow_123');
    });

    it('should handle large step arrays', () => {
      const flow = createDefaultFlowConfig('test', 'Test');
      flow.steps = Array.from({ length: 100 }, (_, i) =>
        createDefaultStepConfig('generate', `step${i}`, `Step ${i}`)
      );

      const result = validateFlowConfiguration(flow);

      expect(result.valid).toBe(true);
      expect(flow.steps.length).toBe(100);
    });
  });
});
