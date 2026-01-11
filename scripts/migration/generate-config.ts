/**
 * Config Generation Script
 * 
 * Generates FlowConfiguration objects from analyzed flows.
 * Creates step-by-step flow definitions with proper schemas.
 */

import { readFileSync, writeFileSync } from 'fs';
import {
  FlowConfiguration,
  FlowStep,
  StepType,
  GenerateStepConfig,
  RetrieveStepConfig,
  ToolStepConfig,
  FormatStepConfig,
} from '@/lib/models/flow-config';

interface FlowTemplate {
  flowName: string;
  displayName: string;
  description: string;
  category: string;
  tags: string[];
  steps: StepTemplate[];
  inputSchema: any;
  outputSchema: any;
}

interface StepTemplate {
  type: StepType;
  name: string;
  description: string;
  config: any;
}

export class ConfigGenerator {
  /**
   * Generate FlowConfiguration from analyzed flow
   */
  public generateFlowConfig(
    flowName: string,
    analysis: any,
    prompts: any[]
  ): FlowConfiguration {
    const steps = this.generateSteps(flowName, analysis, prompts);
    
    return {
      name: flowName,
      displayName: this.formatDisplayName(flowName),
      description: this.generateDescription(flowName, analysis),
      category: this.categorizeFlow(flowName, analysis),
      tags: this.generateTags(flowName, analysis),
      steps,
      inputSchema: this.generateInputSchema(steps),
      outputSchema: this.generateOutputSchema(steps),
      status: 'draft',
      version: '1.0.0',
      metadata: {
        migratedFrom: flowName,
        migratedAt: new Date().toISOString(),
        originalComplexity: analysis.complexity,
      },
    };
  }

  /**
   * Generate steps based on flow analysis
   */
  private generateSteps(
    flowName: string,
    analysis: any,
    prompts: any[]
  ): FlowStep[] {
    const steps: FlowStep[] = [];
    let stepCounter = 1;

    // Add RAG retrieval step if needed
    if (analysis.usesRAG) {
      steps.push(this.createRetrieveStep(stepCounter++, flowName));
    }

    // Add generate steps for each prompt
    prompts.forEach((prompt, index) => {
      steps.push(this.createGenerateStep(stepCounter++, flowName, prompt, index));
    });

    // Add tool step if needed
    if (analysis.usesTools) {
      steps.push(this.createToolStep(stepCounter++, flowName));
    }

    // Add format step
    steps.push(this.createFormatStep(stepCounter++, flowName));

    // If no steps were generated, add a default generate step
    if (steps.length === 0) {
      steps.push(this.createDefaultGenerateStep(flowName));
    }

    return steps;
  }

  /**
   * Create RETRIEVE step for RAG
   */
  private createRetrieveStep(stepNum: number, flowName: string): FlowStep {
    const config: RetrieveStepConfig = {
      type: 'RETRIEVE',
      query: '{{input.query}}',
      collection: 'documents',
      topK: 5,
      threshold: 0.7,
      rerank: true,
    };

    return {
      id: `${flowName}-step-${stepNum}`,
      type: 'RETRIEVE',
      name: 'Retrieve Context',
      description: 'Retrieve relevant context from RAG database',
      config,
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          context: { type: 'string' },
          sources: { type: 'array' },
        },
      },
    };
  }

  /**
   * Create GENERATE step
   */
  private createGenerateStep(
    stepNum: number,
    flowName: string,
    prompt: any,
    promptIndex: number
  ): FlowStep {
    const promptName = prompt?.name || `${flowName}-prompt-${promptIndex + 1}`;
    
    const config: GenerateStepConfig = {
      type: 'GENERATE',
      promptName,
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxTokens: 2048,
      variables: this.extractPromptVariables(prompt),
    };

    return {
      id: `${flowName}-step-${stepNum}`,
      type: 'GENERATE',
      name: `Generate Content ${promptIndex + 1}`,
      description: `Generate content using ${promptName}`,
      config,
      inputSchema: {
        type: 'object',
        properties: this.generateVariableProperties(prompt?.variables || []),
        required: prompt?.variables?.filter((v: any) => v.required).map((v: any) => v.name) || [],
      },
      outputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    };
  }

  /**
   * Create TOOL step
   */
  private createToolStep(stepNum: number, flowName: string): FlowStep {
    const config: ToolStepConfig = {
      type: 'TOOL',
      toolName: 'custom-tool',
      arguments: {
        input: '{{context.previousOutput}}',
      },
    };

    return {
      id: `${flowName}-step-${stepNum}`,
      type: 'TOOL',
      name: 'Execute Tool',
      description: 'Execute custom tool for processing',
      config,
      inputSchema: {
        type: 'object',
        properties: {
          previousOutput: { type: 'string' },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: { type: 'any' },
        },
      },
    };
  }

  /**
   * Create FORMAT step
   */
  private createFormatStep(stepNum: number, flowName: string): FlowStep {
    const config: FormatStepConfig = {
      type: 'FORMAT',
      format: 'markdown',
      template: '{{context.text}}',
    };

    return {
      id: `${flowName}-step-${stepNum}`,
      type: 'FORMAT',
      name: 'Format Output',
      description: 'Format final output',
      config,
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          formatted: { type: 'string' },
        },
      },
    };
  }

  /**
   * Create default GENERATE step
   */
  private createDefaultGenerateStep(flowName: string): FlowStep {
    const config: GenerateStepConfig = {
      type: 'GENERATE',
      promptName: `${flowName}-prompt`,
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxTokens: 2048,
      variables: {
        input: '{{input.text}}',
      },
    };

    return {
      id: `${flowName}-step-1`,
      type: 'GENERATE',
      name: 'Generate Content',
      description: 'Generate content based on input',
      config,
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
        },
        required: ['text'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
        },
      },
    };
  }

  /**
   * Extract prompt variables for step config
   */
  private extractPromptVariables(prompt: any): Record<string, string> {
    if (!prompt?.variables) return {};
    
    const variables: Record<string, string> = {};
    prompt.variables.forEach((v: any) => {
      variables[v.name] = `{{context.${v.name}}}`;
    });
    
    return variables;
  }

  /**
   * Generate variable properties for schema
   */
  private generateVariableProperties(variables: any[]): Record<string, any> {
    const properties: Record<string, any> = {};
    
    variables.forEach(v => {
      properties[v.name] = {
        type: v.type || 'string',
        description: v.description,
      };
    });
    
    return properties;
  }

  /**
   * Format display name from flow name
   */
  private formatDisplayName(flowName: string): string {
    return flowName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Generate description from flow name and analysis
   */
  private generateDescription(flowName: string, analysis: any): string {
    const displayName = this.formatDisplayName(flowName);
    let description = `${displayName} flow - `;
    
    if (analysis.usesRAG) {
      description += 'retrieves context and ';
    }
    
    description += 'generates content';
    
    if (analysis.usesTools) {
      description += ' using custom tools';
    }
    
    return description + '.';
  }

  /**
   * Categorize flow based on name and analysis
   */
  private categorizeFlow(flowName: string, analysis: any): string {
    const lowerName = flowName.toLowerCase();
    
    if (lowerName.includes('report') || lowerName.includes('document')) {
      return 'report-generation';
    }
    
    if (lowerName.includes('analyze') || lowerName.includes('checker')) {
      return 'analysis';
    }
    
    if (lowerName.includes('summarize')) {
      return 'summarization';
    }
    
    if (lowerName.includes('translate')) {
      return 'translation';
    }
    
    if (lowerName.includes('improve') || lowerName.includes('paraphrase')) {
      return 'improvement';
    }
    
    return 'general';
  }

  /**
   * Generate tags from flow name and analysis
   */
  private generateTags(flowName: string, analysis: any): string[] {
    const tags: string[] = ['migrated'];
    
    if (analysis.usesRAG) tags.push('rag');
    if (analysis.usesTools) tags.push('tools');
    if (analysis.hasConditionals) tags.push('conditional');
    if (analysis.hasLoops) tags.push('loop');
    
    // Add category-based tags
    const category = this.categorizeFlow(flowName, analysis);
    tags.push(category);
    
    return tags;
  }

  /**
   * Generate input schema from steps
   */
  private generateInputSchema(steps: FlowStep[]): any {
    // Use input schema from first step
    const firstStep = steps[0];
    if (!firstStep) {
      return {
        type: 'object',
        properties: {
          input: { type: 'string' },
        },
      };
    }
    
    return firstStep.inputSchema;
  }

  /**
   * Generate output schema from steps
   */
  private generateOutputSchema(steps: FlowStep[]): any {
    // Use output schema from last step
    const lastStep = steps[steps.length - 1];
    if (!lastStep) {
      return {
        type: 'object',
        properties: {
          output: { type: 'string' },
        },
      };
    }
    
    return lastStep.outputSchema;
  }

  /**
   * Generate multiple flow configurations
   */
  public generateMultipleConfigs(
    analysisResults: any[],
    promptResults: any[]
  ): FlowConfiguration[] {
    const configs: FlowConfiguration[] = [];
    
    analysisResults.forEach(analysis => {
      // Find prompts for this flow
      const flowPrompts = promptResults.find(
        p => p.flowName === analysis.flowName
      )?.configurations || [];
      
      const config = this.generateFlowConfig(
        analysis.flowName,
        analysis,
        flowPrompts
      );
      
      configs.push(config);
    });
    
    return configs;
  }

  /**
   * Export configurations to JSON
   */
  public exportConfigs(configs: FlowConfiguration[], outputPath: string): void {
    writeFileSync(
      outputPath,
      JSON.stringify(configs, null, 2),
      'utf-8'
    );
    
    console.log(`✅ Exported ${configs.length} flow configurations to ${outputPath}`);
  }

  /**
   * Generate migration report
   */
  public generateReport(configs: FlowConfiguration[]): string {
    let report = `
╔══════════════════════════════════════════════════════════════════════╗
║                   CONFIG GENERATION REPORT                           ║
╚══════════════════════════════════════════════════════════════════════╝

📊 Summary:
   Total Configurations Generated: ${configs.length}
   Total Steps: ${configs.reduce((sum, c) => sum + c.steps.length, 0)}

📋 Configuration Details:
`;

    configs.forEach(config => {
      report += `\n   ${config.name}:`;
      report += `\n      Display Name: ${config.displayName}`;
      report += `\n      Category: ${config.category}`;
      report += `\n      Steps: ${config.steps.length}`;
      report += `\n      Status: ${config.status}`;
      
      // List step types
      const stepTypes = config.steps.map(s => s.type).join(' → ');
      report += `\n      Flow: ${stepTypes}`;
    });

    report += `\n\n✨ Next Steps:`;
    report += `\n   1. Review generated configurations`;
    report += `\n   2. Adjust step parameters`;
    report += `\n   3. Test each configuration`;
    report += `\n   4. Upload to Firestore`;
    report += `\n   5. Deploy to production`;
    
    return report;
  }

  /**
   * Print summary
   */
  public printSummary(configs: FlowConfiguration[]): void {
    console.log('\n' + '='.repeat(70));
    console.log(this.generateReport(configs));
    console.log('='.repeat(70) + '\n');
  }

  /**
   * Generate TypeScript code for flow configurations
   */
  public generateTypeScriptCode(configs: FlowConfiguration[]): string {
    let code = `/**
 * Generated Flow Configurations
 * 
 * Auto-generated from migration tool
 * Date: ${new Date().toISOString()}
 */

import { FlowConfiguration } from '@/lib/models/flow-config';

export const migratedFlows: FlowConfiguration[] = ${JSON.stringify(configs, null, 2)};

export default migratedFlows;
`;
    
    return code;
  }

  /**
   * Export as TypeScript file
   */
  public exportAsTypeScript(configs: FlowConfiguration[], outputPath: string): void {
    const code = this.generateTypeScriptCode(configs);
    writeFileSync(outputPath, code, 'utf-8');
    console.log(`✅ Exported TypeScript code to ${outputPath}`);
  }
}

// CLI Usage
if (require.main === module) {
  const analysisPath = './migration-analysis-report.json';
  const promptsPath = './extracted-prompts.json';
  
  try {
    const analysisData = JSON.parse(readFileSync(analysisPath, 'utf-8'));
    const promptsData = JSON.parse(readFileSync(promptsPath, 'utf-8'));
    
    const generator = new ConfigGenerator();
    const configs = generator.generateMultipleConfigs(
      analysisData.flows || [],
      promptsData
    );
    
    generator.printSummary(configs);
    generator.exportConfigs(configs, './generated-flow-configs.json');
    generator.exportAsTypeScript(configs, './generated-flow-configs.ts');
    
    console.log('✨ Config generation complete!');
    console.log('📄 Configurations saved to generated-flow-configs.json and .ts');
  } catch (error) {
    console.error('❌ Config generation failed:', error);
    console.error('Make sure analysis and prompt extraction have been run first.');
    process.exit(1);
  }
}

export default ConfigGenerator;
