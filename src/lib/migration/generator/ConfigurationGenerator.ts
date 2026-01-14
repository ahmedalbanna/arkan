/**
 * Configuration Generator
 * Week 5 - Day 1-2: Dynamic Configuration Generator
 * 
 * Generates dynamic flow configurations from analyzed static flows.
 */

import type { FlowConfiguration, FlowStep, StepType } from '../../models/flow-config';
import type { FlowAnalysisResult } from '../analyzer/FlowAnalyzer';

// ============================================================================
// Configuration Generator Class
// ============================================================================

export class ConfigurationGenerator {
  /**
   * Generate flow configuration from analysis
   */
  generateFlowConfig(
    analysis: FlowAnalysisResult,
    sourceCode: string
  ): FlowConfiguration {
    const flowId = this.generateFlowId(analysis.flowName);
    
    return {
      id: flowId,
      name: analysis.flowName,
      description: this.generateDescription(analysis),
      version: '1.0.0',
      tags: this.generateTags(analysis),
      status: 'draft',
      inputSchema: this.generateInputSchema(analysis),
      outputSchema: this.generateOutputSchema(analysis),
      steps: this.generateSteps(analysis, sourceCode),
      config: this.generateConfig(analysis),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'migration-tool',
        updatedBy: 'migration-tool',
        category: this.inferCategory(analysis),
      },
    };
  }

  // ============================================================================
  // ID and Basic Info Generation
  // ============================================================================

  private generateFlowId(flowName: string): string {
    return flowName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private generateDescription(analysis: FlowAnalysisResult): string {
    const parts: string[] = [];
    
    parts.push(`Migrated from ${analysis.flowType} flow.`);
    
    if (analysis.analysis.hasRAG) parts.push('Uses RAG retrieval.');
    if (analysis.analysis.hasLLM) parts.push('Uses LLM generation.');
    if (analysis.analysis.hasTools) parts.push('Executes tools.');
    
    parts.push(`${analysis.analysis.stepCount} steps.`);
    
    return parts.join(' ');
  }

  private generateTags(analysis: FlowAnalysisResult): string[] {
    const tags: string[] = ['migrated'];
    
    if (analysis.flowType) tags.push(analysis.flowType);
    if (analysis.complexity) tags.push(analysis.complexity);
    if (analysis.analysis.hasRAG) tags.push('rag');
    if (analysis.analysis.hasLLM) tags.push('llm');
    if (analysis.analysis.hasTools) tags.push('tools');
    
    return tags;
  }

  private inferCategory(analysis: FlowAnalysisResult): string {
    const name = analysis.flowName.toLowerCase();
    
    if (name.includes('academic') || name.includes('research')) return 'academic';
    if (name.includes('report')) return 'reporting';
    if (name.includes('summarize') || name.includes('summary')) return 'summarization';
    if (name.includes('check') || name.includes('validate')) return 'validation';
    
    return 'general';
  }

  // ============================================================================
  // Schema Generation
  // ============================================================================

  private generateInputSchema(analysis: FlowAnalysisResult): FlowConfiguration['inputSchema'] {
    return {
      type: 'zod',
      fields: analysis.inputs.map(input => ({
        name: input.name,
        type: this.mapType(input.type),
        label: this.generateLabel(input.name),
        required: input.required,
        description: input.description,
      })),
      required: true,
    };
  }

  private generateOutputSchema(analysis: FlowAnalysisResult): FlowConfiguration['outputSchema'] {
    if (analysis.outputs.length > 0) {
      return {
        type: 'zod',
        fields: analysis.outputs.map(output => ({
          name: output.name,
          type: this.mapType(output.type),
          label: this.generateLabel(output.name),
          required: true,
          description: output.description,
        })),
        required: true,
      };
    }

    // Default output schema
    return {
      type: 'zod',
      fields: [
        {
          name: 'result',
          type: 'string',
          label: 'Result',
          required: true,
          description: 'Flow execution result',
        },
      ],
      required: true,
    };
  }

  private mapType(zodType: string): any {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      array: 'array',
      object: 'object',
      date: 'date',
    };
    return typeMap[zodType] || 'string';
  }

  private generateLabel(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  // ============================================================================
  // Steps Generation
  // ============================================================================

  private generateSteps(analysis: FlowAnalysisResult, sourceCode: string): FlowStep[] {
    const steps: FlowStep[] = [];
    let stepCounter = 1;

    // Generate steps based on analysis
    if (analysis.analysis.hasRAG) {
      steps.push(this.generateRetrieveStep(stepCounter++, analysis));
    }

    if (analysis.prompts.length > 0) {
      for (const prompt of analysis.prompts) {
        steps.push(this.generateGenerateStep(stepCounter++, prompt, analysis));
      }
    } else if (analysis.analysis.hasLLM) {
      steps.push(this.generateGenerateStep(stepCounter++, null, analysis));
    }

    if (analysis.tools.length > 0) {
      for (const tool of analysis.tools) {
        steps.push(this.generateToolStep(stepCounter++, tool));
      }
    }

    // Add format step if needed
    if (steps.length > 0) {
      steps.push(this.generateFormatStep(stepCounter++, analysis));
    }

    return steps;
  }

  private generateRetrieveStep(stepNumber: number, analysis: FlowAnalysisResult): FlowStep {
    const topicInput = analysis.inputs.find(i => 
      i.name.toLowerCase().includes('topic') || 
      i.name.toLowerCase().includes('query')
    );

    return {
      id: `step-${stepNumber}`,
      name: 'Retrieve Documents',
      type: 'retrieve' as StepType,
      description: 'Retrieve relevant documents from knowledge base',
      config: {
        type: 'retrieve',
        query: topicInput ? `{{${topicInput.name}}}` : '{{query}}',
        collection: 'documents',
        limit: 10,
        minScore: 0.7,
        outputVariable: 'documents',
      },
    };
  }

  private generateGenerateStep(
    stepNumber: number,
    prompt: any | null,
    analysis: FlowAnalysisResult
  ): FlowStep {
    let promptText = '';
    let variables: Record<string, string> = {};

    if (prompt) {
      promptText = prompt.template;
      prompt.variables.forEach((v: string) => {
        variables[v] = `{{${v}}}`;
      });
    } else {
      // Generate default prompt
      const topicInput = analysis.inputs[0];
      promptText = `Generate content about {{${topicInput?.name || 'topic'}}}`;
      variables[topicInput?.name || 'topic'] = `{{${topicInput?.name || 'topic'}}}`;
    }

    return {
      id: `step-${stepNumber}`,
      name: 'Generate Content',
      type: 'generate' as StepType,
      description: 'Generate content using LLM',
      config: {
        type: 'generate',
        prompt: promptText,
        variables,
        outputVariable: 'generated',
        outputFormat: 'text',
      },
    };
  }

  private generateToolStep(stepNumber: number, tool: any): FlowStep {
    return {
      id: `step-${stepNumber}`,
      name: `Execute ${tool.name}`,
      type: 'tool' as StepType,
      description: `Execute ${tool.name} tool`,
      config: {
        type: 'tool',
        toolName: tool.name,
        parameters: tool.parameters,
        outputVariable: `${tool.name}_result`,
      },
    };
  }

  private generateFormatStep(stepNumber: number, analysis: FlowAnalysisResult): FlowStep {
    const outputName = analysis.outputs[0]?.name || 'result';

    return {
      id: `step-${stepNumber}`,
      name: 'Format Output',
      type: 'format' as StepType,
      description: 'Format final output',
      config: {
        type: 'format',
        template: '{{generated}}',
        format: 'text',
        outputVariable: outputName,
      },
    };
  }

  // ============================================================================
  // Config Generation
  // ============================================================================

  private generateConfig(analysis: FlowAnalysisResult): FlowConfiguration['config'] {
    return {
      timeout: this.calculateTimeout(analysis),
      cache: true,
      cacheTTL: 3600,
      tracing: true,
      defaultModel: {
        name: 'gemini-1.5-flash',
        temperature: 0.7,
        maxTokens: 2048,
      },
    };
  }

  private calculateTimeout(analysis: FlowAnalysisResult): number {
    // Base timeout: 60 seconds
    let timeout = 60000;

    // Add time based on complexity
    timeout += analysis.analysis.stepCount * 10000; // 10s per step
    if (analysis.analysis.hasRAG) timeout += 20000; // 20s for RAG
    if (analysis.analysis.hasLLM) timeout += 30000; // 30s for LLM

    return Math.min(timeout, 300000); // Max 5 minutes
  }

  // ============================================================================
  // Batch Generation
  // ============================================================================

  /**
   * Generate configurations for multiple flows
   */
  generateBatch(
    analyses: FlowAnalysisResult[],
    sourceFiles: Map<string, string>
  ): Map<string, FlowConfiguration> {
    const configs = new Map<string, FlowConfiguration>();

    for (const analysis of analyses) {
      const sourceCode = sourceFiles.get(analysis.filePath) || '';
      const config = this.generateFlowConfig(analysis, sourceCode);
      configs.set(analysis.flowName, config);
    }

    return configs;
  }

  /**
   * Export configuration to JSON
   */
  exportConfig(config: FlowConfiguration): string {
    return JSON.stringify(config, null, 2);
  }

  /**
   * Generate migration script
   */
  generateMigrationScript(
    analysis: FlowAnalysisResult,
    config: FlowConfiguration
  ): string {
    return `
// Migration Script for: ${analysis.flowName}
// Generated: ${new Date().toISOString()}
// Complexity: ${analysis.complexity}
// Estimated Time: ${analysis.estimatedMigrationTime} minutes

import { createFlow } from '@/services/flow-config-service';

const flowConfig = ${JSON.stringify(config, null, 2)};

export async function migrate() {
  try {
    const result = await createFlow(flowConfig);
    console.log('Migration successful:', result.id);
    return result;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Manual steps required:
${analysis.recommendations.map(r => `// - ${r}`).join('\n')}

${analysis.warnings.length > 0 ? `
// Warnings:
${analysis.warnings.map(w => `// ${w}`).join('\n')}
` : ''}
`;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function generateMigrationPackage(
  analysis: FlowAnalysisResult,
  sourceCode: string
): {
  config: FlowConfiguration;
  script: string;
  readme: string;
} {
  const generator = new ConfigurationGenerator();
  const config = generator.generateFlowConfig(analysis, sourceCode);
  const script = generator.generateMigrationScript(analysis, config);
  const readme = generateReadme(analysis, config);

  return { config, script, readme };
}

function generateReadme(analysis: FlowAnalysisResult, config: FlowConfiguration): string {
  return `# Migration: ${analysis.flowName}

## Overview
- **Original File**: ${analysis.filePath}
- **Flow Type**: ${analysis.flowType}
- **Complexity**: ${analysis.complexity}
- **Estimated Migration Time**: ${analysis.estimatedMigrationTime} minutes

## Analysis
- Steps: ${analysis.analysis.stepCount}
- Has RAG: ${analysis.analysis.hasRAG ? 'Yes' : 'No'}
- Has LLM: ${analysis.analysis.hasLLM ? 'Yes' : 'No'}
- Has Tools: ${analysis.analysis.hasTools ? 'Yes' : 'No'}
- Has Conditions: ${analysis.analysis.hasConditions ? 'Yes' : 'No'}
- Has Loops: ${analysis.analysis.hasLoops ? 'Yes' : 'No'}

## Configuration
Generated configuration ID: \`${config.id}\`

## Recommendations
${analysis.recommendations.map(r => `- ${r}`).join('\n')}

${analysis.warnings.length > 0 ? `
## Warnings
${analysis.warnings.map(w => `- ${w}`).join('\n')}
` : ''}

## Migration Steps
1. Review generated configuration
2. Run migration script
3. Test migrated flow
4. Compare outputs with original
5. Deploy to production

## Testing
\`\`\`bash
# Test the migrated flow
curl -X POST http://localhost:3000/api/flows/test \\
  -H "Content-Type: application/json" \\
  -d @test-input.json
\`\`\`
`;
}
