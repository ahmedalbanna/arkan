/**
 * Flow Analysis Tool
 * 
 * Analyzes existing hardcoded flows and provides migration recommendations.
 * Identifies complexity, dependencies, and migration priority.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { StepType } from '@/lib/models/flow-config';

interface FlowAnalysis {
  flowName: string;
  filePath: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedSteps: number;
  dependencies: string[];
  usesRAG: boolean;
  usesTools: boolean;
  hasConditionals: boolean;
  hasLoops: boolean;
  promptsFound: number;
  migrationPriority: 'high' | 'medium' | 'low';
  migrationPhase: 1 | 2 | 3;
  recommendations: string[];
  estimatedEffort: string;
}

interface AnalysisReport {
  totalFlows: number;
  analyzedFlows: number;
  byComplexity: {
    simple: number;
    medium: number;
    complex: number;
  };
  byPhase: {
    phase1: number;
    phase2: number;
    phase3: number;
  };
  flows: FlowAnalysis[];
  summary: string[];
}

export class FlowAnalyzer {
  private flowsDir: string;
  private patterns = {
    ragRetrieval: /ragService|retrieveContext|vectorStore/gi,
    toolUsage: /executeTool|toolRegistry|callTool/gi,
    conditionals: /if\s*\(|switch\s*\(|\?\s*:/gi,
    loops: /for\s*\(|while\s*\(|\.map\(|\.forEach\(/gi,
    prompts: /prompt\s*[:=]|template\s*[:=]|`[\s\S]*?\$\{/gi,
    generateCall: /ai\.generate|model\.generate|llm\.generate/gi,
    errorHandling: /try\s*\{|catch\s*\(/gi,
  };

  constructor(flowsDir: string = './src/ai/flows') {
    this.flowsDir = flowsDir;
  }

  /**
   * Analyze all flows in the directory
   */
  public async analyzeAllFlows(): Promise<AnalysisReport> {
    console.log('🔍 Starting flow analysis...\n');

    const flowFiles = this.getFlowFiles();
    const analyses: FlowAnalysis[] = [];

    for (const file of flowFiles) {
      const analysis = await this.analyzeFlow(file);
      if (analysis) {
        analyses.push(analysis);
        this.printFlowAnalysis(analysis);
      }
    }

    const report = this.generateReport(analyses);
    return report;
  }

  /**
   * Get all TypeScript flow files
   */
  private getFlowFiles(): string[] {
    try {
      const files = readdirSync(this.flowsDir);
      return files
        .filter(file => file.endsWith('.ts') && !file.includes('.test.') && !file.includes('index.ts'))
        .map(file => join(this.flowsDir, file));
    } catch (error) {
      console.error('Error reading flows directory:', error);
      return [];
    }
  }

  /**
   * Analyze a single flow file
   */
  private async analyzeFlow(filePath: string): Promise<FlowAnalysis | null> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const flowName = this.extractFlowName(filePath);

      // Count occurrences of different patterns
      const usesRAG = this.patterns.ragRetrieval.test(content);
      const usesTools = this.patterns.toolUsage.test(content);
      const hasConditionals = this.patterns.conditionals.test(content);
      const hasLoops = this.patterns.loops.test(content);
      const promptMatches = content.match(this.patterns.prompts) || [];
      const generateCalls = content.match(this.patterns.generateCall) || [];

      // Estimate number of steps
      const estimatedSteps = this.estimateSteps(content, {
        usesRAG,
        usesTools,
        hasConditionals,
        hasLoops,
        generateCalls: generateCalls.length,
      });

      // Determine complexity
      const complexity = this.determineComplexity(estimatedSteps, {
        usesRAG,
        usesTools,
        hasConditionals,
        hasLoops,
      });

      // Find dependencies
      const dependencies = this.extractDependencies(content);

      // Determine migration priority and phase
      const { priority, phase } = this.determineMigrationStrategy(complexity, {
        usesRAG,
        usesTools,
        hasConditionals,
        hasLoops,
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        complexity,
        usesRAG,
        usesTools,
        hasConditionals,
        hasLoops,
        promptsFound: promptMatches.length,
      });

      // Estimate effort
      const estimatedEffort = this.estimateEffort(complexity, estimatedSteps);

      return {
        flowName,
        filePath,
        complexity,
        estimatedSteps,
        dependencies,
        usesRAG,
        usesTools,
        hasConditionals,
        hasLoops,
        promptsFound: promptMatches.length,
        migrationPriority: priority,
        migrationPhase: phase,
        recommendations,
        estimatedEffort,
      };
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract flow name from file path
   */
  private extractFlowName(filePath: string): string {
    const fileName = filePath.split('/').pop() || '';
    return fileName.replace('.ts', '');
  }

  /**
   * Estimate number of steps in the flow
   */
  private estimateSteps(
    content: string,
    features: {
      usesRAG: boolean;
      usesTools: boolean;
      hasConditionals: boolean;
      hasLoops: boolean;
      generateCalls: number;
    }
  ): number {
    let steps = 0;

    // Base steps from generate calls
    steps += features.generateCalls;

    // Add steps for RAG
    if (features.usesRAG) steps += 1;

    // Add steps for tools
    if (features.usesTools) steps += 1;

    // Add steps for conditionals
    if (features.hasConditionals) steps += 2;

    // Add steps for loops
    if (features.hasLoops) steps += 2;

    // Minimum of 1 step
    return Math.max(1, steps);
  }

  /**
   * Determine flow complexity
   */
  private determineComplexity(
    steps: number,
    features: {
      usesRAG: boolean;
      usesTools: boolean;
      hasConditionals: boolean;
      hasLoops: boolean;
    }
  ): 'simple' | 'medium' | 'complex' {
    // Complex if has loops or many steps
    if (features.hasLoops || steps > 5) {
      return 'complex';
    }

    // Medium if has conditionals or RAG or tools
    if (features.hasConditionals || features.usesRAG || features.usesTools) {
      return 'medium';
    }

    // Simple otherwise
    return 'simple';
  }

  /**
   * Extract import dependencies
   */
  private extractDependencies(content: string): string[] {
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    const dependencies = new Set<string>();

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const dep = match[1];
      // Only include project dependencies
      if (dep.startsWith('@/') || dep.startsWith('./') || dep.startsWith('../')) {
        dependencies.add(dep);
      }
    }

    return Array.from(dependencies);
  }

  /**
   * Determine migration priority and phase
   */
  private determineMigrationStrategy(
    complexity: 'simple' | 'medium' | 'complex',
    features: {
      usesRAG: boolean;
      usesTools: boolean;
      hasConditionals: boolean;
      hasLoops: boolean;
    }
  ): { priority: 'high' | 'medium' | 'low'; phase: 1 | 2 | 3 } {
    // Phase 1: Simple text generation flows
    if (complexity === 'simple' && !features.usesRAG && !features.usesTools) {
      return { priority: 'high', phase: 1 };
    }

    // Phase 2: Analysis and RAG flows
    if (complexity === 'medium' || features.usesRAG) {
      return { priority: 'medium', phase: 2 };
    }

    // Phase 3: Complex flows with control flow
    return { priority: 'low', phase: 3 };
  }

  /**
   * Generate migration recommendations
   */
  private generateRecommendations(analysis: {
    complexity: string;
    usesRAG: boolean;
    usesTools: boolean;
    hasConditionals: boolean;
    hasLoops: boolean;
    promptsFound: number;
  }): string[] {
    const recommendations: string[] = [];

    if (analysis.complexity === 'simple') {
      recommendations.push('✅ Good candidate for early migration');
      recommendations.push('📝 Extract prompts into prompt templates');
    }

    if (analysis.usesRAG) {
      recommendations.push('🔍 Add RETRIEVE step for RAG context');
      recommendations.push('⚙️ Configure collection and topK parameters');
    }

    if (analysis.usesTools) {
      recommendations.push('🔧 Register custom tools in tool registry');
      recommendations.push('📋 Define tool input/output schemas');
    }

    if (analysis.hasConditionals) {
      recommendations.push('🔀 Use CONDITION steps for branching logic');
      recommendations.push('⚠️ Test both branches thoroughly');
    }

    if (analysis.hasLoops) {
      recommendations.push('🔄 Convert loops to LOOP steps');
      recommendations.push('⚠️ Set appropriate maxIterations');
    }

    if (analysis.promptsFound > 1) {
      recommendations.push(`📚 Extract ${analysis.promptsFound} prompts into templates`);
    }

    if (analysis.complexity === 'complex') {
      recommendations.push('🧪 Migrate in pilot phase first');
      recommendations.push('📊 Compare outputs carefully');
    }

    return recommendations;
  }

  /**
   * Estimate migration effort
   */
  private estimateEffort(complexity: string, steps: number): string {
    if (complexity === 'simple') {
      return '1-2 hours';
    } else if (complexity === 'medium') {
      return '2-4 hours';
    } else {
      return '4-8 hours';
    }
  }

  /**
   * Print individual flow analysis
   */
  private printFlowAnalysis(analysis: FlowAnalysis): void {
    const complexityEmoji = {
      simple: '🟢',
      medium: '🟡',
      complex: '🔴',
    };

    console.log(`\n${complexityEmoji[analysis.complexity]} ${analysis.flowName}`);
    console.log(`   Complexity: ${analysis.complexity.toUpperCase()}`);
    console.log(`   Estimated Steps: ${analysis.estimatedSteps}`);
    console.log(`   Migration Phase: ${analysis.migrationPhase}`);
    console.log(`   Priority: ${analysis.migrationPriority.toUpperCase()}`);
    console.log(`   Effort: ${analysis.estimatedEffort}`);
    
    if (analysis.usesRAG || analysis.usesTools || analysis.hasConditionals || analysis.hasLoops) {
      console.log(`   Features:`);
      if (analysis.usesRAG) console.log(`     • RAG retrieval`);
      if (analysis.usesTools) console.log(`     • Tool usage`);
      if (analysis.hasConditionals) console.log(`     • Conditional logic`);
      if (analysis.hasLoops) console.log(`     • Loops/iteration`);
    }

    if (analysis.recommendations.length > 0) {
      console.log(`   Recommendations:`);
      analysis.recommendations.forEach(rec => console.log(`     ${rec}`));
    }
  }

  /**
   * Generate comprehensive analysis report
   */
  private generateReport(analyses: FlowAnalysis[]): AnalysisReport {
    const byComplexity = {
      simple: analyses.filter(a => a.complexity === 'simple').length,
      medium: analyses.filter(a => a.complexity === 'medium').length,
      complex: analyses.filter(a => a.complexity === 'complex').length,
    };

    const byPhase = {
      phase1: analyses.filter(a => a.migrationPhase === 1).length,
      phase2: analyses.filter(a => a.migrationPhase === 2).length,
      phase3: analyses.filter(a => a.migrationPhase === 3).length,
    };

    const summary = [
      `📊 Analysis Summary:`,
      `   Total Flows: ${analyses.length}`,
      ``,
      `   By Complexity:`,
      `   🟢 Simple: ${byComplexity.simple}`,
      `   🟡 Medium: ${byComplexity.medium}`,
      `   🔴 Complex: ${byComplexity.complex}`,
      ``,
      `   By Migration Phase:`,
      `   Phase 1 (Simple): ${byPhase.phase1} flows`,
      `   Phase 2 (Medium): ${byPhase.phase2} flows`,
      `   Phase 3 (Complex): ${byPhase.phase3} flows`,
      ``,
      `   Total Estimated Effort: ${this.calculateTotalEffort(analyses)}`,
    ];

    return {
      totalFlows: analyses.length,
      analyzedFlows: analyses.length,
      byComplexity,
      byPhase,
      flows: analyses,
      summary,
    };
  }

  /**
   * Calculate total effort across all flows
   */
  private calculateTotalEffort(analyses: FlowAnalysis[]): string {
    const hours = analyses.reduce((total, analysis) => {
      const effort = analysis.estimatedEffort.match(/(\d+)-(\d+)/);
      if (effort) {
        return total + (parseInt(effort[1]) + parseInt(effort[2])) / 2;
      }
      return total;
    }, 0);

    return `${Math.round(hours)} hours`;
  }

  /**
   * Export report to JSON
   */
  public exportReport(report: AnalysisReport, outputPath: string): void {
    const fs = require('fs');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Report exported to ${outputPath}`);
  }

  /**
   * Print summary report
   */
  public printSummary(report: AnalysisReport): void {
    console.log('\n' + '='.repeat(70));
    report.summary.forEach(line => console.log(line));
    console.log('='.repeat(70) + '\n');
  }
}

// CLI Usage
if (require.main === module) {
  const analyzer = new FlowAnalyzer();
  
  analyzer.analyzeAllFlows().then(report => {
    analyzer.printSummary(report);
    analyzer.exportReport(report, './migration-analysis-report.json');
    
    console.log('✨ Analysis complete!');
    console.log('📄 Detailed report saved to migration-analysis-report.json');
  }).catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });
}

export default FlowAnalyzer;
