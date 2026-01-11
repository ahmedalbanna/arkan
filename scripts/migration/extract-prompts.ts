/**
 * Prompt Extraction Script
 * 
 * Extracts prompt templates from existing hardcoded flows and converts them
 * to PromptConfiguration objects with variable definitions.
 */

import { readFileSync, writeFileSync } from 'fs';
import { PromptConfiguration, PromptVariable } from '@/lib/models/prompt-config';

interface ExtractedPrompt {
  sourceFlow: string;
  promptContent: string;
  variables: string[];
  location: {
    line: number;
    column: number;
  };
  context: string;
}

interface ExtractionResult {
  flowName: string;
  filePath: string;
  prompts: ExtractedPrompt[];
  configurations: PromptConfiguration[];
}

export class PromptExtractor {
  private patterns = {
    // Template literal with variables: `text ${variable}`
    templateLiteral: /`([^`]*\$\{[^}]+\}[^`]*)`/gs,
    // String concatenation: 'text' + variable + 'text'
    stringConcat: /(['"])([^'"]*)\1\s*\+\s*(\w+)/g,
    // Variable extraction from template: ${variable}
    variables: /\$\{([^}]+)\}/g,
    // Mustache/Handlebars syntax: {{variable}}
    mustache: /\{\{([^}]+)\}\}/g,
  };

  /**
   * Extract prompts from a flow file
   */
  public async extractFromFile(filePath: string): Promise<ExtractionResult> {
    const content = readFileSync(filePath, 'utf-8');
    const flowName = this.getFlowName(filePath);
    const lines = content.split('\n');

    const prompts = this.findPrompts(content, lines);
    const configurations = prompts.map((prompt, index) => 
      this.createPromptConfiguration(prompt, flowName, index)
    );

    return {
      flowName,
      filePath,
      prompts,
      configurations,
    };
  }

  /**
   * Extract flow name from file path
   */
  private getFlowName(filePath: string): string {
    const fileName = filePath.split('/').pop() || '';
    return fileName.replace('.ts', '');
  }

  /**
   * Find all prompts in the content
   */
  private findPrompts(content: string, lines: string[]): ExtractedPrompt[] {
    const prompts: ExtractedPrompt[] = [];
    
    // Find template literals with variables
    let match;
    this.patterns.templateLiteral.lastIndex = 0;
    
    while ((match = this.patterns.templateLiteral.exec(content)) !== null) {
      const promptContent = match[1];
      const variables = this.extractVariables(promptContent);
      
      // Skip if no variables (likely not a prompt)
      if (variables.length === 0) continue;
      
      // Skip very short strings (likely not prompts)
      if (promptContent.length < 20) continue;
      
      const location = this.getLocation(content, match.index, lines);
      const context = this.getContext(lines, location.line);
      
      prompts.push({
        sourceFlow: '',
        promptContent,
        variables,
        location,
        context,
      });
    }

    return prompts;
  }

  /**
   * Extract variables from prompt content
   */
  private extractVariables(content: string): string[] {
    const variables = new Set<string>();
    
    // Extract ${variable} style
    let match;
    this.patterns.variables.lastIndex = 0;
    while ((match = this.patterns.variables.exec(content)) !== null) {
      const varName = match[1].trim();
      // Clean up variable name (remove object access, function calls, etc.)
      const cleanName = varName.split('.')[0].split('(')[0];
      if (cleanName) {
        variables.add(cleanName);
      }
    }

    // Extract {{variable}} style
    this.patterns.mustache.lastIndex = 0;
    while ((match = this.patterns.mustache.exec(content)) !== null) {
      const varName = match[1].trim();
      const cleanName = varName.split('.')[0];
      if (cleanName) {
        variables.add(cleanName);
      }
    }

    return Array.from(variables);
  }

  /**
   * Get line and column location in source
   */
  private getLocation(content: string, index: number, lines: string[]): { line: number; column: number } {
    const beforeMatch = content.substring(0, index);
    const line = beforeMatch.split('\n').length;
    const lastLineStart = beforeMatch.lastIndexOf('\n') + 1;
    const column = index - lastLineStart;
    
    return { line, column };
  }

  /**
   * Get context around the prompt (3 lines before and after)
   */
  private getContext(lines: string[], lineNumber: number): string {
    const start = Math.max(0, lineNumber - 3);
    const end = Math.min(lines.length, lineNumber + 3);
    return lines.slice(start, end).join('\n');
  }

  /**
   * Create PromptConfiguration from extracted prompt
   */
  private createPromptConfiguration(
    prompt: ExtractedPrompt,
    flowName: string,
    index: number
  ): PromptConfiguration {
    const promptName = this.generatePromptName(flowName, index);
    const variables = this.createVariables(prompt.variables);
    const templateContent = this.convertToMustacheSyntax(prompt.promptContent);

    return {
      name: promptName,
      displayName: this.generateDisplayName(flowName, index),
      description: `Extracted from ${flowName}`,
      category: this.categorizePrompt(prompt.promptContent),
      tags: [flowName, 'extracted', 'migration'],
      templateContent,
      variables,
      inputSchema: this.generateInputSchema(variables),
      outputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
        },
      },
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxTokens: 2048,
      status: 'draft',
      version: '1.0.0',
      metadata: {
        sourceFlow: flowName,
        extractedAt: new Date().toISOString(),
        location: prompt.location,
      },
    };
  }

  /**
   * Generate prompt name
   */
  private generatePromptName(flowName: string, index: number): string {
    return `${flowName}-prompt-${index + 1}`;
  }

  /**
   * Generate display name
   */
  private generateDisplayName(flowName: string, index: number): string {
    const formatted = flowName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return `${formatted} - Prompt ${index + 1}`;
  }

  /**
   * Create variable definitions from variable names
   */
  private createVariables(variableNames: string[]): PromptVariable[] {
    return variableNames.map(name => ({
      name,
      type: this.inferVariableType(name),
      description: `Variable ${name} from source flow`,
      required: true,
      defaultValue: undefined,
    }));
  }

  /**
   * Infer variable type from name
   */
  private inferVariableType(name: string): 'string' | 'number' | 'boolean' | 'array' | 'object' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('count') || lowerName.includes('number') || lowerName.includes('num')) {
      return 'number';
    }
    
    if (lowerName.includes('is') || lowerName.includes('has') || lowerName.includes('enabled')) {
      return 'boolean';
    }
    
    if (lowerName.includes('list') || lowerName.includes('items') || lowerName.includes('array')) {
      return 'array';
    }
    
    if (lowerName.includes('config') || lowerName.includes('settings') || lowerName.includes('options')) {
      return 'object';
    }
    
    return 'string';
  }

  /**
   * Convert template literal syntax to Mustache syntax
   */
  private convertToMustacheSyntax(content: string): string {
    // Convert ${variable} to {{variable}}
    return content.replace(/\$\{([^}]+)\}/g, '{{$1}}');
  }

  /**
   * Categorize prompt based on content
   */
  private categorizePrompt(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('report') || lowerContent.includes('document')) {
      return 'report-generation';
    }
    
    if (lowerContent.includes('analyze') || lowerContent.includes('analysis')) {
      return 'analysis';
    }
    
    if (lowerContent.includes('summarize') || lowerContent.includes('summary')) {
      return 'summarization';
    }
    
    if (lowerContent.includes('translate')) {
      return 'translation';
    }
    
    if (lowerContent.includes('improve') || lowerContent.includes('enhance')) {
      return 'improvement';
    }
    
    return 'general';
  }

  /**
   * Generate input schema from variables
   */
  private generateInputSchema(variables: PromptVariable[]): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    variables.forEach(variable => {
      properties[variable.name] = {
        type: variable.type,
        description: variable.description,
      };
      
      if (variable.required) {
        required.push(variable.name);
      }
    });

    return {
      type: 'object',
      properties,
      required,
    };
  }

  /**
   * Extract prompts from multiple files
   */
  public async extractFromMultipleFiles(filePaths: string[]): Promise<ExtractionResult[]> {
    const results: ExtractionResult[] = [];
    
    for (const filePath of filePaths) {
      try {
        const result = await this.extractFromFile(filePath);
        if (result.prompts.length > 0) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Error extracting from ${filePath}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Export prompt configurations to JSON
   */
  public exportConfigurations(
    results: ExtractionResult[],
    outputPath: string
  ): void {
    const allConfigurations = results.flatMap(r => r.configurations);
    
    writeFileSync(
      outputPath,
      JSON.stringify(allConfigurations, null, 2),
      'utf-8'
    );
    
    console.log(`✅ Exported ${allConfigurations.length} prompt configurations to ${outputPath}`);
  }

  /**
   * Generate migration report
   */
  public generateReport(results: ExtractionResult[]): string {
    const totalPrompts = results.reduce((sum, r) => sum + r.prompts.length, 0);
    const flowsWithPrompts = results.length;
    
    let report = `
╔══════════════════════════════════════════════════════════════════════╗
║                    PROMPT EXTRACTION REPORT                          ║
╚══════════════════════════════════════════════════════════════════════╝

📊 Summary:
   Total Flows Analyzed: ${results.length}
   Flows with Prompts: ${flowsWithPrompts}
   Total Prompts Extracted: ${totalPrompts}

📋 Extraction Details:
`;

    results.forEach(result => {
      report += `\n   ${result.flowName}:`;
      report += `\n      Prompts Found: ${result.prompts.length}`;
      
      result.prompts.forEach((prompt, index) => {
        report += `\n      • Prompt ${index + 1}:`;
        report += `\n        Variables: ${prompt.variables.join(', ')}`;
        report += `\n        Location: Line ${prompt.location.line}`;
        report += `\n        Length: ${prompt.promptContent.length} chars`;
      });
    });

    report += `\n\n✨ Next Steps:`;
    report += `\n   1. Review generated prompt configurations`;
    report += `\n   2. Refine variable names and types`;
    report += `\n   3. Add descriptions and examples`;
    report += `\n   4. Test prompts with sample data`;
    report += `\n   5. Upload to prompt management system`;
    
    return report;
  }

  /**
   * Print extraction summary
   */
  public printSummary(results: ExtractionResult[]): void {
    console.log('\n' + '='.repeat(70));
    console.log(this.generateReport(results));
    console.log('='.repeat(70) + '\n');
  }
}

// CLI Usage
if (require.main === module) {
  const { readdirSync } = require('fs');
  const { join } = require('path');
  
  const flowsDir = './src/ai/flows';
  const files = readdirSync(flowsDir)
    .filter((f: string) => f.endsWith('.ts') && !f.includes('.test.') && !f.includes('index.ts'))
    .map((f: string) => join(flowsDir, f));
  
  const extractor = new PromptExtractor();
  
  extractor.extractFromMultipleFiles(files).then(results => {
    extractor.printSummary(results);
    extractor.exportConfigurations(results, './extracted-prompts.json');
    
    console.log('✨ Prompt extraction complete!');
    console.log('📄 Configurations saved to extracted-prompts.json');
  }).catch(error => {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  });
}

export default PromptExtractor;
