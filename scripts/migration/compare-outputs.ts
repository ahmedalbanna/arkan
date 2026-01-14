#!/usr/bin/env tsx
/**
 * Output Comparison Tool
 * 
 * Compares outputs from static flows vs dynamic flows to ensure
 * migration accuracy and quality.
 * 
 * Usage:
 *   npm run compare-outputs
 *   tsx scripts/migration/compare-outputs.ts <flowName> [--runs=5]
 */

import * as fs from 'fs';
import * as path from 'path';
import { ai } from '@/ai/genkit';
import { ComparisonTools } from '@/lib/migration/ComparisonTools';

interface ComparisonResult {
  flowName: string;
  testCase: number;
  input: any;
  staticOutput: any;
  dynamicOutput: any;
  similarity: number;
  identical: boolean;
  differences: string[];
  executionTime: {
    static: number;
    dynamic: number;
  };
}

interface ComparisonReport {
  flowName: string;
  timestamp: string;
  totalTests: number;
  identicalOutputs: number;
  averageSimilarity: number;
  averageExecutionTime: {
    static: number;
    dynamic: number;
    percentDifference: number;
  };
  results: ComparisonResult[];
  recommendation: 'PASS' | 'REVIEW' | 'FAIL';
  notes: string[];
}

/**
 * Generate test inputs for a flow
 */
function generateTestInputs(flowName: string): any[] {
  // Define test cases for different flow types
  const testCases: Record<string, any[]> = {
    'generate-text': [
      { prompt: 'Write a short story about AI', language: 'en', tone: 'creative' },
      { prompt: 'Explain quantum computing', language: 'en', tone: 'educational' },
      { prompt: 'Write a product description', language: 'en', tone: 'professional' },
    ],
    'paraphrase-text': [
      { text: 'The quick brown fox jumps over the lazy dog.', style: 'formal' },
      { text: 'Artificial intelligence is transforming technology.', style: 'simple' },
      { text: 'Climate change requires immediate action.', style: 'academic' },
    ],
    'summarize-text': [
      { text: 'Long article about machine learning...', maxLength: 100 },
      { text: 'Research paper on neural networks...', maxLength: 200 },
    ],
    'translate-text': [
      { text: 'Hello, how are you?', targetLanguage: 'es' },
      { text: 'Artificial intelligence', targetLanguage: 'fr' },
      { text: 'Good morning', targetLanguage: 'ar' },
    ],
  };

  return testCases[flowName] || [
    { input: 'test input 1' },
    { input: 'test input 2' },
    { input: 'test input 3' },
  ];
}

/**
 * Execute static flow
 */
async function executeStaticFlow(flowName: string, input: any): Promise<{ output: any; duration: number }> {
  const startTime = Date.now();
  
  try {
    // Import the static flow
    const flowModule = await import(`@/ai/flows/${flowName}`);
    const flowFunction = Object.values(flowModule)[0] as any;
    
    // Execute the flow
    const output = await flowFunction(input);
    const duration = Date.now() - startTime;
    
    return { output, duration };
  } catch (error) {
    console.error(`Error executing static flow:`, error);
    throw error;
  }
}

/**
 * Execute dynamic flow
 */
async function executeDynamicFlow(flowName: string, input: any): Promise<{ output: any; duration: number }> {
  const startTime = Date.now();
  
  try {
    // Execute via dynamic flow executor
    const { executeDynamicFlow } = await import('@/ai/flows/dynamic-flow-executor');
    const output = await executeDynamicFlow(flowName, input);
    const duration = Date.now() - startTime;
    
    return { output, duration };
  } catch (error) {
    console.error(`Error executing dynamic flow:`, error);
    throw error;
  }
}

/**
 * Compare two outputs
 */
function compareOutputs(output1: any, output2: any): {
  similarity: number;
  identical: boolean;
  differences: string[];
} {
  const tools = new ComparisonTools();
  
  // Use ComparisonTools to calculate similarity
  const similarity = tools.calculateSimilarity(output1, output2);
  
  // Check if identical (within tolerance)
  const identical = similarity >= 0.95;
  
  // Find differences
  const differences: string[] = [];
  
  if (typeof output1 === 'object' && typeof output2 === 'object') {
    const keys1 = Object.keys(output1);
    const keys2 = Object.keys(output2);
    
    // Check for missing keys
    keys1.forEach(key => {
      if (!keys2.includes(key)) {
        differences.push(`Missing key in dynamic output: ${key}`);
      }
    });
    
    keys2.forEach(key => {
      if (!keys1.includes(key)) {
        differences.push(`Extra key in dynamic output: ${key}`);
      }
    });
    
    // Check for different values
    keys1.forEach(key => {
      if (keys2.includes(key) && output1[key] !== output2[key]) {
        differences.push(`Different value for ${key}`);
      }
    });
  } else if (output1 !== output2) {
    differences.push('Outputs are not identical');
  }
  
  return { similarity, identical, differences };
}

/**
 * Run comparison for a flow
 */
async function compareFlow(flowName: string, numRuns: number = 3): Promise<ComparisonReport> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 Comparing: ${flowName}`);
  console.log('='.repeat(80));

  const testInputs = generateTestInputs(flowName);
  const results: ComparisonResult[] = [];
  
  console.log(`\n📋 Running ${testInputs.length} test cases (${numRuns} runs each)...\n`);

  let testCaseNumber = 0;
  for (const input of testInputs) {
    testCaseNumber++;
    console.log(`\n📝 Test Case ${testCaseNumber}:`);
    console.log(`  Input: ${JSON.stringify(input).substring(0, 100)}...`);

    for (let run = 1; run <= numRuns; run++) {
      console.log(`\n  Run ${run}/${numRuns}:`);

      try {
        // Execute static flow
        console.log('    ⚙️  Executing static flow...');
        const staticResult = await executeStaticFlow(flowName, input);
        console.log(`    ✅ Static: ${staticResult.duration}ms`);

        // Execute dynamic flow
        console.log('    ⚙️  Executing dynamic flow...');
        const dynamicResult = await executeDynamicFlow(flowName, input);
        console.log(`    ✅ Dynamic: ${dynamicResult.duration}ms`);

        // Compare outputs
        const comparison = compareOutputs(staticResult.output, dynamicResult.output);
        
        console.log(`    📊 Similarity: ${(comparison.similarity * 100).toFixed(1)}%`);
        if (comparison.identical) {
          console.log('    ✅ Outputs are identical!');
        } else {
          console.log(`    ⚠️  ${comparison.differences.length} difference(s) found`);
        }

        results.push({
          flowName,
          testCase: testCaseNumber,
          input,
          staticOutput: staticResult.output,
          dynamicOutput: dynamicResult.output,
          similarity: comparison.similarity,
          identical: comparison.identical,
          differences: comparison.differences,
          executionTime: {
            static: staticResult.duration,
            dynamic: dynamicResult.duration,
          },
        });

      } catch (error) {
        console.error(`    ❌ Error:`, error);
      }
    }
  }

  // Calculate summary statistics
  const identicalOutputs = results.filter(r => r.identical).length;
  const averageSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
  
  const avgStaticTime = results.reduce((sum, r) => sum + r.executionTime.static, 0) / results.length;
  const avgDynamicTime = results.reduce((sum, r) => sum + r.executionTime.dynamic, 0) / results.length;
  const percentDifference = ((avgDynamicTime - avgStaticTime) / avgStaticTime) * 100;

  // Determine recommendation
  let recommendation: 'PASS' | 'REVIEW' | 'FAIL' = 'PASS';
  const notes: string[] = [];

  if (averageSimilarity < 0.8) {
    recommendation = 'FAIL';
    notes.push('Low similarity score - significant differences detected');
  } else if (averageSimilarity < 0.9) {
    recommendation = 'REVIEW';
    notes.push('Moderate similarity - manual review recommended');
  }

  if (percentDifference > 50) {
    if (recommendation === 'PASS') recommendation = 'REVIEW';
    notes.push('Dynamic flow is significantly slower (>50%)');
  } else if (percentDifference > 20) {
    notes.push('Dynamic flow is moderately slower (>20%)');
  } else if (percentDifference < -20) {
    notes.push('Dynamic flow is faster than static flow');
  }

  if (identicalOutputs === results.length) {
    notes.push('All outputs are identical - excellent migration!');
  }

  const report: ComparisonReport = {
    flowName,
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    identicalOutputs,
    averageSimilarity,
    averageExecutionTime: {
      static: avgStaticTime,
      dynamic: avgDynamicTime,
      percentDifference,
    },
    results,
    recommendation,
    notes,
  };

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPARISON SUMMARY');
  console.log('='.repeat(80));
  console.log(`\nTests Run: ${results.length}`);
  console.log(`Identical Outputs: ${identicalOutputs}/${results.length}`);
  console.log(`Average Similarity: ${(averageSimilarity * 100).toFixed(1)}%`);
  console.log(`\nExecution Time:`);
  console.log(`  Static:  ${avgStaticTime.toFixed(0)}ms`);
  console.log(`  Dynamic: ${avgDynamicTime.toFixed(0)}ms`);
  console.log(`  Difference: ${percentDifference > 0 ? '+' : ''}${percentDifference.toFixed(1)}%`);
  console.log(`\nRecommendation: ${recommendation}`);
  
  if (notes.length > 0) {
    console.log('\nNotes:');
    notes.forEach(note => console.log(`  • ${note}`));
  }
  
  console.log('\n' + '='.repeat(80) + '\n');

  // Save report
  const reportPath = path.join(
    process.cwd(),
    'migration-reports',
    'comparisons',
    `${flowName}-comparison.json`
  );
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved: ${reportPath}\n`);

  return report;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const flowName = args[0];
  const runsArg = args.find(arg => arg.startsWith('--runs='));
  const numRuns = runsArg ? parseInt(runsArg.split('=')[1]) : 3;

  if (!flowName) {
    console.error('❌ Error: Flow name is required');
    console.log('\nUsage: tsx scripts/migration/compare-outputs.ts <flowName> [--runs=5]');
    process.exit(1);
  }

  console.log('🔍 Output Comparison Tool\n');
  console.log(`Flow: ${flowName}`);
  console.log(`Runs per test: ${numRuns}\n`);

  try {
    const report = await compareFlow(flowName, numRuns);
    
    if (report.recommendation === 'FAIL') {
      console.log('❌ Comparison FAILED - migration needs review');
      process.exit(1);
    } else if (report.recommendation === 'REVIEW') {
      console.log('⚠️  Comparison needs REVIEW - manual inspection recommended');
      process.exit(0);
    } else {
      console.log('✅ Comparison PASSED - migration successful!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ Comparison failed:', error);
    process.exit(1);
  }
}

main();
