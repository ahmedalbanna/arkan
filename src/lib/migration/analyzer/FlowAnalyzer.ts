/**
 * Flow Analyzer
 * Week 5 - Day 1-2: Flow Analysis Tool
 *
 * Analyzes existing static flows to prepare for migration.
 * Extracts flow structure, dependencies, and metadata.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SchemaParser } from './SchemaParser';

// ============================================================================
// Types
// ============================================================================

export interface FlowAnalysisResult {
  flowName: string;
  filePath: string;
  flowType: 'genkit' | 'custom' | 'unknown';
  complexity: 'simple' | 'medium' | 'complex';
  category: string;
  analysis: {
    stepCount: number;
    hasRAG: boolean;
    hasLLM: boolean;
    hasTools: boolean;
    hasConditions: boolean;
    hasLoops: boolean;
  };
  dependencies: string[];
  inputs: FlowInput[];
  outputs: FlowOutput[];
  prompts: PromptUsage[];
  tools: ToolUsage[];
  estimatedMigrationTime: number;
  migrationComplexity: number;
  recommendations: string[];
  warnings: string[];
}

export interface FlowInput {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface FlowOutput {
  name: string;
  type: string;
  description?: string;
}

export interface PromptUsage {
  name: string;
  template: string;
  variables: string[];
  location: string;
}

export interface ToolUsage {
  name: string;
  type: string;
  parameters: Record<string, any>;
}

// ============================================================================
// Flow Analyzer Class
// ============================================================================

export class FlowAnalyzer {
  private flowsDirectory: string;
  private results: Map<string, FlowAnalysisResult>;
  private schemaParser: SchemaParser;

  constructor(flowsDirectory: string) {
    this.flowsDirectory = flowsDirectory;
    this.results = new Map();
    this.schemaParser = new SchemaParser();
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Analyze all flows in directory
   */
  async analyzeAllFlows(): Promise<FlowAnalysisResult[]> {
    const flowFiles = this.findFlowFiles(this.flowsDirectory);
    const results: FlowAnalysisResult[] = [];

    for (const filePath of flowFiles) {
      try {
        const result = await this.analyzeFlow(filePath);
        results.push(result);
        this.results.set(filePath, result);
      } catch (error) {
        console.error(`Error analyzing ${filePath}:`, error);
      }
    }

    return results;
  }

  /**
   * Analyze a single flow file
   */
  async analyzeFlow(filePath: string): Promise<FlowAnalysisResult> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const flowName = this.extractFlowName(filePath, content);

    // Detect flow type
    const flowType = this.detectFlowType(content);

    // Analyze structure
    const analysis = this.analyzeStructure(content);

    // Extract components
    const inputs = this.extractInputs(content);
    const outputs = this.extractOutputs(content);
    const prompts = this.extractPrompts(content);
    const tools = this.extractTools(content);
    const dependencies = this.extractDependencies(content);

    // Calculate complexity
    const complexity = this.calculateComplexity(analysis);
    const migrationComplexity = this.calculateMigrationComplexity(analysis, prompts, tools);
    const estimatedMigrationTime = this.estimateMigrationTime(migrationComplexity);

    // Generate recommendations and warnings
    const recommendations = this.generateRecommendations(analysis, prompts, tools);
    const warnings = this.generateWarnings(analysis, content);

    const category = this.inferCategory(flowName);

    return {
      flowName,
      filePath,
      flowType,
      complexity,
      category,
      analysis,
      dependencies,
      inputs,
      outputs,
      prompts,
      tools,
      estimatedMigrationTime,
      migrationComplexity,
      recommendations,
      warnings,
    };
  }

  /**
   * Get analysis summary
   */
  getSummary(): {
    totalFlows: number;
    byComplexity: Record<string, number>;
    byType: Record<string, number>;
    totalEstimatedTime: number;
  } {
    const results = Array.from(this.results.values());

    return {
      totalFlows: results.length,
      byComplexity: {
        simple: results.filter(r => r.complexity === 'simple').length,
        medium: results.filter(r => r.complexity === 'medium').length,
        complex: results.filter(r => r.complexity === 'complex').length,
      },
      byType: {
        genkit: results.filter(r => r.flowType === 'genkit').length,
        custom: results.filter(r => r.flowType === 'custom').length,
        unknown: results.filter(r => r.flowType === 'unknown').length,
      },
      totalEstimatedTime: results.reduce((sum, r) => sum + r.estimatedMigrationTime, 0),
    };
  }

  // ============================================================================
  // Private Methods - File Operations
  // ============================================================================

  private findFlowFiles(directory: string): string[] {
    const files: string[] = [];

    const searchDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          searchDir(fullPath);
        } else if (entry.isFile() && this.isFlowFile(entry.name)) {
          files.push(fullPath);
        }
      }
    };

    searchDir(directory);
    return files;
  }

  private isFlowFile(filename: string): boolean {
    return (
      filename.endsWith('.ts') &&
      !filename.endsWith('.test.ts') &&
      !filename.endsWith('.spec.ts') &&
      (filename.includes('flow') || filename.includes('Flow'))
    );
  }

  // ============================================================================
  // Private Methods - Extraction
  // ============================================================================

  private extractFlowName(filePath: string, content: string): string {
    // Try to find defineFlow name
    const defineFlowMatch = content.match(/defineFlow\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (defineFlowMatch) {
      return defineFlowMatch[1];
    }

    // Fallback to filename
    return path.basename(filePath, '.ts');
  }

  private detectFlowType(content: string): 'genkit' | 'custom' | 'unknown' {
    if (content.includes('defineFlow') || content.includes('@genkit-ai')) {
      return 'genkit';
    }
    if (content.includes('class') && content.includes('Flow')) {
      return 'custom';
    }
    return 'unknown';
  }

  private analyzeStructure(content: string): FlowAnalysisResult['analysis'] {
    return {
      stepCount: this.countSteps(content),
      hasRAG: this.detectRAG(content),
      hasLLM: this.detectLLM(content),
      hasTools: this.detectTools(content),
      hasConditions: this.detectConditions(content),
      hasLoops: this.detectLoops(content),
    };
  }

  private countSteps(content: string): number {
    // Count potential steps (generate, retrieve, tool calls, prompt calls, etc.)
    let count = 0;
    count += (content.match(/await generate/g) || []).length;
    count += (content.match(/await retrieve/g) || []).length;
    count += (content.match(/await\s+\w+Tool/g) || []).length;
    count += (content.match(/await\s+\w+Prompt\(/g) || []).length;
    count += (content.match(/definePrompt\(/g) || []).length;
    return count || 1;
  }

  private detectRAG(content: string): boolean {
    return content.includes('retrieve') ||
      content.includes('searchDocuments') ||
      content.includes('qdrant') ||
      content.includes('vectorStore');
  }

  private detectLLM(content: string): boolean {
    return content.includes('generate') ||
      content.includes('gemini') ||
      content.includes('gpt') ||
      content.includes('llm') ||
      content.includes('definePrompt') ||
      content.includes('Prompt(');
  }

  private detectTools(content: string): boolean {
    return content.includes('Tool') ||
      content.includes('tool(') ||
      content.includes('defineTool');
  }

  private detectConditions(content: string): boolean {
    return content.includes('if (') || content.includes('switch (');
  }

  private detectLoops(content: string): boolean {
    return content.includes('for (') ||
      content.includes('while (') ||
      content.includes('.map(') ||
      content.includes('.forEach(');
  }

  private extractInputs(content: string): FlowInput[] {
    const inputs: FlowInput[] = [];

    // Try to extract from imported schema reference
    const importedSchemaMatch = content.match(/inputSchema:\s*(\w+InputSchema)/);
    if (importedSchemaMatch) {
      const schemaName = importedSchemaMatch[1];
      
      // Use dynamic schema parser
      const fields = this.schemaParser.getAllFields(schemaName);
      if (fields.length > 0) {
        return fields.map(field => ({
          name: field.name,
          type: field.type,
          required: field.required,
          description: field.description
        }));
      }
      
      // If dynamic parsing didn't find anything, return empty
      // The validation step will catch this
      return inputs;
    }

    // Fallback: Extract from inline schema definition
    const schemaMatch = content.match(/inputSchema:\s*z\.object\(\{([^}]+)\}\)/s);
    if (schemaMatch) {
      const fields = schemaMatch[1];
      const fieldMatches = fields.matchAll(/(\w+):\s*z\.(\w+)\(\)\.?(\w*)/g);

      for (const match of fieldMatches) {
        inputs.push({
          name: match[1],
          type: match[2],
          required: !match[3] || match[3] !== 'optional',
        });
      }
    }

    return inputs;
  }

  private extractOutputs(content: string): FlowOutput[] {
    const outputs: FlowOutput[] = [];

    // Try to extract from imported schema reference
    const importedSchemaMatch = content.match(/outputSchema:\s*(\w+OutputSchema)/);
    if (importedSchemaMatch) {
      const schemaName = importedSchemaMatch[1];
      
      // Use dynamic schema parser
      const fields = this.schemaParser.getAllFields(schemaName);
      if (fields.length > 0) {
        return fields.map(field => ({
          name: field.name,
          type: field.type,
          description: field.description
        }));
      }
      
      // If dynamic parsing didn't find anything, return empty
      return outputs;
    }

    // Fallback: Extract from inline output schema or return statements
    const schemaMatch = content.match(/outputSchema:\s*z\.object\(\{([^}]+)\}\)/s);
    if (schemaMatch) {
      const fields = schemaMatch[1];
      const fieldMatches = fields.matchAll(/(\w+):\s*z\.(\w+)\(\)/g);

      for (const match of fieldMatches) {
        outputs.push({
          name: match[1],
          type: match[2],
        });
      }
    }

    return outputs;
  }

  private inferOutputFieldName(flowName: string): string {
    // Convert camelCase flow name to output field name
    // GenerateText -> generatedText
    // Paraphrase -> paraphrasedText
    // Summarize -> summary
    
    const lower = flowName.charAt(0).toLowerCase() + flowName.slice(1);
    
    // Specific output field mappings
    const outputFieldMap: Record<string, string> = {
      'Paraphrase': 'paraphrasedText',
      'Summarize': 'summary',
      'TranslateText': 'translatedText',
      'HumanizeText': 'humanizedText',
      'ManipulateText': 'manipulatedText',
      'GrammarCheck': 'correctedText',
      'BiasCheck': 'issues',
      'PlagiarismCheck': 'matches',
      'FactCheck': 'claims',
      'DetectAI': 'score',
      'SentenceStructureCheck': 'issues',
      'TopicExplainer': 'explanation',
      'IdeaGeneration': 'markdown',
    };
    
    // Check exact matches first
    for (const [key, value] of Object.entries(outputFieldMap)) {
      if (flowName === key) {
        return value;
      }
    }
    
    // Common patterns
    if (flowName.includes('Generate')) {
      return lower.replace('generate', 'generated');
    }
    if (flowName.includes('Paraphrase')) {
      return 'paraphrasedText';
    }
    if (flowName.includes('Summarize')) {
      return 'summary';
    }
    if (flowName.includes('Translate')) {
      return 'translatedText';
    }
    if (flowName.includes('Humanize')) {
      return 'humanizedText';
    }
    
    // Default: just use lowercase version
    return lower;
  }

  private extractPrompts(content: string): PromptUsage[] {
    const prompts: PromptUsage[] = [];

    // Find prompt definitions
    const promptMatches = content.matchAll(/definePrompt\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g);
    for (const match of promptMatches) {
      const variables = this.extractPromptVariables(match[2]);
      prompts.push({
        name: match[1],
        template: match[2],
        variables,
        location: 'inline',
      });
    }

    return prompts;
  }

  private extractPromptVariables(template: string): string[] {
    const matches = template.matchAll(/\{\{(\w+)\}\}/g);
    return Array.from(matches).map(m => m[1]);
  }

  private extractTools(content: string): ToolUsage[] {
    const tools: ToolUsage[] = [];

    // Find tool usages
    const toolMatches = content.matchAll(/(\w+Tool)\s*\(/g);
    for (const match of toolMatches) {
      tools.push({
        name: match[1],
        type: 'unknown',
        parameters: {},
      });
    }

    return tools;
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    const importMatches = content.matchAll(/import\s+.*from\s+['"`]([^'"`]+)['"`]/g);

    for (const match of importMatches) {
      dependencies.push(match[1]);
    }

    return dependencies;
  }

  private inferCategory(flowName: string): string {
    const name = flowName.toLowerCase();
    if (name.includes('academic') || name.includes('research')) return 'academic';
    if (name.includes('report')) return 'reporting';
    if (name.includes('summarize') || name.includes('summary')) return 'summarization';
    if (name.includes('check') || name.includes('validate')) return 'validation';
    return 'general';
  }

  // ============================================================================
  // Private Methods - Analysis
  // ============================================================================

  private calculateComplexity(analysis: FlowAnalysisResult['analysis']): 'simple' | 'medium' | 'complex' {
    let score = 0;

    score += analysis.stepCount;
    if (analysis.hasRAG) score += 2;
    if (analysis.hasLLM) score += 1;
    if (analysis.hasTools) score += 2;
    if (analysis.hasConditions) score += 3;
    if (analysis.hasLoops) score += 4;

    if (score <= 3) return 'simple';
    if (score <= 8) return 'medium';
    return 'complex';
  }

  private calculateMigrationComplexity(
    analysis: FlowAnalysisResult['analysis'],
    prompts: PromptUsage[],
    tools: ToolUsage[]
  ): number {
    let complexity = analysis.stepCount * 10;
    complexity += prompts.length * 15;
    complexity += tools.length * 20;
    if (analysis.hasConditions) complexity += 30;
    if (analysis.hasLoops) complexity += 50;

    return complexity;
  }

  private estimateMigrationTime(complexity: number): number {
    // Returns time in minutes
    return Math.ceil(complexity / 10);
  }

  private generateRecommendations(
    analysis: FlowAnalysisResult['analysis'],
    prompts: PromptUsage[],
    tools: ToolUsage[]
  ): string[] {
    const recommendations: string[] = [];

    if (analysis.stepCount > 10) {
      recommendations.push('Consider breaking this flow into smaller sub-flows');
    }

    if (prompts.length > 5) {
      recommendations.push('Extract prompts to prompt library for reusability');
    }

    if (tools.length > 0) {
      recommendations.push('Register custom tools in tool registry before migration');
    }

    if (analysis.hasConditions) {
      recommendations.push('Review conditional logic - may need manual adjustment');
    }

    if (analysis.hasLoops) {
      recommendations.push('Loops require special handling - test thoroughly after migration');
    }

    return recommendations;
  }

  private generateWarnings(analysis: FlowAnalysisResult['analysis'], content: string): string[] {
    const warnings: string[] = [];

    if (content.includes('eval(')) {
      warnings.push('⚠️ Contains eval() - may not be migratable');
    }

    if (content.includes('process.env')) {
      warnings.push('⚠️ Uses environment variables - ensure they are configured');
    }

    if (analysis.hasLoops && analysis.hasLLM) {
      warnings.push('⚠️ LLM calls in loops may cause rate limiting');
    }

    if (content.includes('firebase') || content.includes('firestore')) {
      warnings.push('⚠️ Direct Firestore access - will be replaced by service layer');
    }

    return warnings;
  }

  // ============================================================================
  // Export Methods
  // ============================================================================

  /**
   * Export analysis results to JSON
   */
  exportToJSON(): string {
    const results = Array.from(this.results.values());
    return JSON.stringify({
      summary: this.getSummary(),
      flows: results,
      generatedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Export analysis results to CSV
   */
  exportToCSV(): string {
    const results = Array.from(this.results.values());
    const headers = [
      'Flow Name',
      'File Path',
      'Type',
      'Complexity',
      'Steps',
      'Has RAG',
      'Has LLM',
      'Has Tools',
      'Est. Time (min)',
      'Warnings',
    ];

    const rows = results.map(r => [
      r.flowName,
      r.filePath,
      r.flowType,
      r.complexity,
      r.analysis.stepCount,
      r.analysis.hasRAG ? 'Yes' : 'No',
      r.analysis.hasLLM ? 'Yes' : 'No',
      r.analysis.hasTools ? 'Yes' : 'No',
      r.estimatedMigrationTime,
      r.warnings.length,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create and run analyzer
 */
export async function analyzeFlows(directory: string): Promise<FlowAnalysisResult[]> {
  const analyzer = new FlowAnalyzer(directory);
  return analyzer.analyzeAllFlows();
}

/**
 * Get migration priority list
 */
export function prioritizeFlows(results: FlowAnalysisResult[]): FlowAnalysisResult[] {
  return results.sort((a, b) => {
    // Sort by complexity (simple first) then by step count
    if (a.complexity !== b.complexity) {
      const order = { simple: 1, medium: 2, complex: 3 };
      return order[a.complexity] - order[b.complexity];
    }
    return a.analysis.stepCount - b.analysis.stepCount;
  });
}
