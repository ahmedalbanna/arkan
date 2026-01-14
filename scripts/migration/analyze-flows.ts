#!/usr/bin/env tsx
/**
 * Flow Analysis Tool
 * 
 * Analyzes all existing Genkit flows and generates a comprehensive report
 * about their structure, complexity, and migration requirements.
 * 
 * Usage:
 *   npm run analyze-flows
 *   tsx scripts/migration/analyze-flows.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { FlowAnalyzer } from '@/lib/migration/analyzer/FlowAnalyzer';

interface FlowAnalysisReport {
  totalFlows: number;
  flowsByComplexity: {
    simple: string[];
    medium: string[];
    complex: string[];
  };
  flowsByCategory: Record<string, string[]>;
  migrationEstimate: {
    simple: number;    // hours
    medium: number;
    complex: number;
    total: number;
  };
  dependencies: {
    flowName: string;
    dependencies: string[];
  }[];
  warnings: string[];
}

async function analyzeFlows(): Promise<FlowAnalysisReport> {
  console.log('🔍 Starting flow analysis...\n');

  const flowsDir = path.join(process.cwd(), 'src/ai/flows');
  const flowFiles = fs.readdirSync(flowsDir)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts');

  const analyzer = new FlowAnalyzer();
  const report: FlowAnalysisReport = {
    totalFlows: 0,
    flowsByComplexity: {
      simple: [],
      medium: [],
      complex: [],
    },
    flowsByCategory: {},
    migrationEstimate: {
      simple: 0,
      medium: 0,
      complex: 0,
      total: 0,
    },
    dependencies: [],
    warnings: [],
  };

  for (const file of flowFiles) {
    const flowPath = path.join(flowsDir, file);
    const flowName = file.replace('.ts', '');

    console.log(`📄 Analyzing: ${flowName}`);

    try {
      const analysis = await analyzer.analyzeFlow(flowPath);
      report.totalFlows++;

      // Categorize by complexity
      const complexity = analysis.complexity || 'medium';
      report.flowsByComplexity[complexity as keyof typeof report.flowsByComplexity].push(flowName);

      // Categorize by type
      const category = analysis.category || 'general';
      if (!report.flowsByCategory[category]) {
        report.flowsByCategory[category] = [];
      }
      report.flowsByCategory[category].push(flowName);

      // Track dependencies
      if (analysis.dependencies && analysis.dependencies.length > 0) {
        report.dependencies.push({
          flowName,
          dependencies: analysis.dependencies,
        });
      }

      // Collect warnings
      if (analysis.warnings) {
        report.warnings.push(...analysis.warnings.map(w => `${flowName}: ${w}`));
      }

      // Estimate migration time
      const estimateHours = {
        simple: 2,
        medium: 4,
        complex: 8,
      };
      report.migrationEstimate[complexity as keyof typeof estimateHours] += 
        estimateHours[complexity as keyof typeof estimateHours] || 4;

    } catch (error) {
      console.error(`❌ Error analyzing ${flowName}:`, error);
      report.warnings.push(`${flowName}: Failed to analyze - ${error}`);
    }
  }

  // Calculate totals
  report.migrationEstimate.total = 
    report.migrationEstimate.simple + 
    report.migrationEstimate.medium + 
    report.migrationEstimate.complex;

  return report;
}

function printReport(report: FlowAnalysisReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 FLOW ANALYSIS REPORT');
  console.log('='.repeat(80) + '\n');

  console.log(`Total Flows: ${report.totalFlows}\n`);

  console.log('Complexity Breakdown:');
  console.log(`  Simple (${report.flowsByComplexity.simple.length}): ${report.flowsByComplexity.simple.join(', ')}`);
  console.log(`  Medium (${report.flowsByComplexity.medium.length}): ${report.flowsByComplexity.medium.join(', ')}`);
  console.log(`  Complex (${report.flowsByComplexity.complex.length}): ${report.flowsByComplexity.complex.join(', ')}\n`);

  console.log('Category Breakdown:');
  Object.entries(report.flowsByCategory).forEach(([category, flows]) => {
    console.log(`  ${category} (${flows.length}): ${flows.join(', ')}`);
  });

  console.log('\nMigration Time Estimate:');
  console.log(`  Simple flows: ${report.migrationEstimate.simple} hours`);
  console.log(`  Medium flows: ${report.migrationEstimate.medium} hours`);
  console.log(`  Complex flows: ${report.migrationEstimate.complex} hours`);
  console.log(`  Total: ${report.migrationEstimate.total} hours (${(report.migrationEstimate.total / 8).toFixed(1)} days)\n`);

  if (report.dependencies.length > 0) {
    console.log('Flow Dependencies:');
    report.dependencies.forEach(({ flowName, dependencies }) => {
      console.log(`  ${flowName} → ${dependencies.join(', ')}`);
    });
    console.log('');
  }

  if (report.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    report.warnings.forEach(warning => {
      console.log(`  - ${warning}`);
    });
    console.log('');
  }

  console.log('='.repeat(80) + '\n');
}

function saveReport(report: FlowAnalysisReport): void {
  const outputPath = path.join(process.cwd(), 'migration-analysis-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`💾 Report saved to: ${outputPath}\n`);
}

// Main execution
async function main() {
  try {
    const report = await analyzeFlows();
    printReport(report);
    saveReport(report);
    
    console.log('✅ Analysis complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

main();
