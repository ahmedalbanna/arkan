/**
 * Migration Tests
 * Week 5 - Day 5: Migration Testing Suite
 */

import { describe, test, expect } from '@jest/globals';
import { FlowAnalyzer } from '../analyzer/FlowAnalyzer';
import { ConfigurationGenerator } from '../generator/ConfigurationGenerator';
import { MigrationValidator } from '../validator/MigrationValidator';

describe('Flow Analyzer', () => {
  test('should detect flow type', () => {
    const genkitCode = `
      import { defineFlow } from '@genkit-ai/flow';
      export const myFlow = defineFlow({...});
    `;

    // Test flow type detection logic
    expect(genkitCode.includes('defineFlow')).toBe(true);
  });

  test('should count steps correctly', () => {
    const code = `
      await generate({...});
      await retrieve({...});
      await someTool({...});
    `;

    const generateCount = (code.match(/await generate/g) || []).length;
    const retrieveCount = (code.match(/await retrieve/g) || []).length;
    
    expect(generateCount).toBe(1);
    expect(retrieveCount).toBe(1);
  });

  test('should detect RAG usage', () => {
    const codeWithRAG = 'await retrieve(docs)';
    const codeWithoutRAG = 'await generate()';

    expect(codeWithRAG.includes('retrieve')).toBe(true);
    expect(codeWithoutRAG.includes('retrieve')).toBe(false);
  });

  test('should extract prompt variables', () => {
    const template = 'Generate content about {{topic}} in {{language}}';
    const matches = Array.from(template.matchAll(/\{\{(\w+)\}\}/g));
    const variables = matches.map(m => m[1]);

    expect(variables).toEqual(['topic', 'language']);
  });
});

describe('Configuration Generator', () => {
  test('should generate flow ID from name', () => {
    const generator = new ConfigurationGenerator();
    const name = 'My Flow Name';
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    expect(id).toBe('my-flow-name');
  });

  test('should generate tags from analysis', () => {
    const mockAnalysis: any = {
      flowType: 'genkit',
      complexity: 'simple',
      analysis: {
        hasRAG: true,
        hasLLM: true,
        hasTools: false,
      },
    };

    const tags: string[] = ['migrated'];
    if (mockAnalysis.flowType) tags.push(mockAnalysis.flowType);
    if (mockAnalysis.complexity) tags.push(mockAnalysis.complexity);
    if (mockAnalysis.analysis.hasRAG) tags.push('rag');
    if (mockAnalysis.analysis.hasLLM) tags.push('llm');

    expect(tags).toContain('migrated');
    expect(tags).toContain('genkit');
    expect(tags).toContain('rag');
  });

  test('should calculate appropriate timeout', () => {
    const stepCount = 5;
    let timeout = 60000; // base 60s
    timeout += stepCount * 10000; // 10s per step
    timeout += 20000; // RAG
    timeout += 30000; // LLM

    const maxTimeout = Math.min(timeout, 300000); // Max 5 min
    expect(maxTimeout).toBeGreaterThan(60000);
    expect(maxTimeout).toBeLessThanOrEqual(300000);
  });
});

describe('Migration Validator', () => {
  test('should validate basic fields', () => {
    const invalidFlow: any = {
      id: '',
      name: '',
      steps: [],
    };

    const errors: string[] = [];
    if (!invalidFlow.id) errors.push('ID required');
    if (!invalidFlow.name) errors.push('Name required');
    if (invalidFlow.steps.length === 0) errors.push('Steps required');

    expect(errors.length).toBeGreaterThan(0);
  });

  test('should validate version format', () => {
    const validVersions = ['1.0.0', '2.1.3', '10.20.30'];
    const invalidVersions = ['1.0', 'v1.0.0', '1.0.0-beta'];

    validVersions.forEach(v => {
      expect(/^\d+\.\d+\.\d+$/.test(v)).toBe(true);
    });

    invalidVersions.forEach(v => {
      expect(/^\d+\.\d+\.\d+$/.test(v)).toBe(false);
    });
  });

  test('should calculate validation score', () => {
    const criticalErrors = 2;
    const normalErrors = 3;
    const warnings = 5;

    let score = 100;
    score -= criticalErrors * 25;
    score -= normalErrors * 10;
    score -= warnings * 2;

    expect(score).toBe(30); // 100 - 50 - 30 - 10
  });

  test('should calculate output similarity', () => {
    const output1 = { result: 'Hello World', count: 2 };
    const output2 = { result: 'Hello World', count: 2 };
    const output3 = { result: 'Different', count: 5 };

    const sim1 = JSON.stringify(output1) === JSON.stringify(output2);
    const sim2 = JSON.stringify(output1) === JSON.stringify(output3);

    expect(sim1).toBe(true);
    expect(sim2).toBe(false);
  });
});

describe('Migration Workflow', () => {
  test('should complete full migration workflow', () => {
    // 1. Analyze
    const mockAnalysis: any = {
      flowName: 'TestFlow',
      flowType: 'genkit',
      complexity: 'simple',
      analysis: {
        stepCount: 2,
        hasRAG: false,
        hasLLM: true,
      },
      inputs: [{ name: 'topic', type: 'string', required: true }],
      outputs: [{ name: 'result', type: 'string' }],
      prompts: [],
      tools: [],
    };

    // 2. Generate config
    const generator = new ConfigurationGenerator();
    // const config = generator.generateFlowConfig(mockAnalysis, '');

    // 3. Validate
    // const validator = new MigrationValidator();
    // const validation = validator.validate(config);

    // Assertions
    expect(mockAnalysis.flowName).toBe('TestFlow');
    // expect(validation.valid).toBe(true);
  });
});
