#!/usr/bin/env tsx
/**
 * Flow Benchmark Tool
 * 
 * Measures performance characteristics of static vs dynamic flows:
 * - Execution time
 * - Memory usage
 * - Throughput
 * - Latency percentiles
 * 
 * Usage:
 *   npm run benchmark-flow
 *   tsx scripts/migration/benchmark-flow.ts <flowName> [--iterations=100]
 */

import * as fs from 'fs';
import * as path from 'path';

interface BenchmarkMetrics {
  executionTimes: number[];
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  }[];
  errors: number;
  successful: number;
}

interface BenchmarkResult {
  flowName: string;
  mode: 'static' | 'dynamic';
  iterations: number;
  timestamp: string;
  metrics: BenchmarkMetrics;
  statistics: {
    mean: number;
    median: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
    stdDev: number;
  };
  memoryStats: {
    avgHeapUsed: number;
    avgHeapTotal: number;
    maxHeapUsed: number;
  };
  throughput: number; // requests per second
}

interface ComparisonReport {
  flowName: string;
  timestamp: string;
  iterations: number;
  staticResult: BenchmarkResult;
  dynamicResult: BenchmarkResult;
  comparison: {
    speedDifference: number; // percentage
    memoryDifference: number; // percentage
    throughputDifference: number; // percentage
    recommendation: 'BETTER' | 'ACCEPTABLE' | 'WORSE';
    issues: string[];
  };
}

/**
 * Calculate statistics from execution times
 */
function calculateStatistics(times: number[]): BenchmarkResult['statistics'] {
  const sorted = [...times].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, t) => sum + t, 0) / sorted.length;
  
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  const p50 = sorted[Math.floor(sorted.length * 0.50)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  
  // Standard deviation
  const squareDiffs = sorted.map(t => Math.pow(t - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, d) => sum + d, 0) / sorted.length;
  const stdDev = Math.sqrt(avgSquareDiff);
  
  return { mean, median, min, max, p50, p95, p99, stdDev };
}

/**
 * Execute flow and measure performance
 */
async function executeWithMetrics(
  flowName: string,
  mode: 'static' | 'dynamic',
  input: any
): Promise<{ duration: number; memory: NodeJS.MemoryUsage; success: boolean }> {
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  const memoryBefore = process.memoryUsage();
  const startTime = Date.now();
  
  try {
    if (mode === 'static') {
      const flowModule = await import(`@/ai/flows/${flowName}`);
      const flowFunction = Object.values(flowModule)[0] as any;
      await flowFunction(input);
    } else {
      const dynamicFlowModule = await import('@/ai/flows/dynamic-flow-executor');
      const executorFlow = dynamicFlowModule.dynamicFlowExecutorFlow;
      await executorFlow({ flowName, input });
    }
    
    const duration = Date.now() - startTime;
    const memoryAfter = process.memoryUsage();
    
    return {
      duration,
      memory: {
        rss: memoryAfter.rss - memoryBefore.rss,
        heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
        heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
        external: memoryAfter.external - memoryBefore.external,
        arrayBuffers: 0,
      },
      success: true,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      duration,
      memory: process.memoryUsage(),
      success: false,
    };
  }
}

/**
 * Run benchmark for a flow
 */
async function benchmarkFlow(
  flowName: string,
  mode: 'static' | 'dynamic',
  iterations: number,
  testInput: any
): Promise<BenchmarkResult> {
  console.log(`\n🔄 Benchmarking ${mode} flow: ${flowName}`);
  console.log(`   Iterations: ${iterations}\n`);

  const metrics: BenchmarkMetrics = {
    executionTimes: [],
    memoryUsage: [],
    errors: 0,
    successful: 0,
  };

  const progressInterval = Math.max(1, Math.floor(iterations / 10));
  
  for (let i = 0; i < iterations; i++) {
    if ((i + 1) % progressInterval === 0) {
      const percent = ((i + 1) / iterations * 100).toFixed(0);
      process.stdout.write(`\r   Progress: ${percent}% (${i + 1}/${iterations})`);
    }
    
    const result = await executeWithMetrics(flowName, mode, testInput);
    
    if (result.success) {
      metrics.executionTimes.push(result.duration);
      metrics.memoryUsage.push({
        heapUsed: result.memory.heapUsed,
        heapTotal: result.memory.heapTotal,
        external: result.memory.external,
      });
      metrics.successful++;
    } else {
      metrics.errors++;
    }
    
    // Small delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  console.log('\r   Progress: 100% ✅\n');

  // Calculate statistics
  const statistics = calculateStatistics(metrics.executionTimes);
  
  const avgHeapUsed = metrics.memoryUsage.reduce((sum, m) => sum + m.heapUsed, 0) / metrics.memoryUsage.length;
  const avgHeapTotal = metrics.memoryUsage.reduce((sum, m) => sum + m.heapTotal, 0) / metrics.memoryUsage.length;
  const maxHeapUsed = Math.max(...metrics.memoryUsage.map(m => m.heapUsed));
  
  const totalTime = metrics.executionTimes.reduce((sum, t) => sum + t, 0);
  const throughput = (metrics.successful / (totalTime / 1000));

  return {
    flowName,
    mode,
    iterations,
    timestamp: new Date().toISOString(),
    metrics,
    statistics,
    memoryStats: {
      avgHeapUsed,
      avgHeapTotal,
      maxHeapUsed,
    },
    throughput,
  };
}

/**
 * Print benchmark result
 */
function printBenchmarkResult(result: BenchmarkResult): void {
  console.log(`📊 ${result.mode.toUpperCase()} Results:`);
  console.log(`   Success Rate: ${(result.metrics.successful / result.iterations * 100).toFixed(1)}%`);
  console.log(`\n   Execution Time:`);
  console.log(`     Mean:   ${result.statistics.mean.toFixed(2)}ms`);
  console.log(`     Median: ${result.statistics.median.toFixed(2)}ms`);
  console.log(`     Min:    ${result.statistics.min.toFixed(2)}ms`);
  console.log(`     Max:    ${result.statistics.max.toFixed(2)}ms`);
  console.log(`     P95:    ${result.statistics.p95.toFixed(2)}ms`);
  console.log(`     P99:    ${result.statistics.p99.toFixed(2)}ms`);
  console.log(`     StdDev: ${result.statistics.stdDev.toFixed(2)}ms`);
  console.log(`\n   Memory:`);
  console.log(`     Avg Heap: ${(result.memoryStats.avgHeapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`     Max Heap: ${(result.memoryStats.maxHeapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\n   Throughput: ${result.throughput.toFixed(2)} req/sec\n`);
}

/**
 * Compare benchmark results
 */
function compareResults(staticResult: BenchmarkResult, dynamicResult: BenchmarkResult): ComparisonReport['comparison'] {
  const speedDifference = ((dynamicResult.statistics.mean - staticResult.statistics.mean) / staticResult.statistics.mean) * 100;
  const memoryDifference = ((dynamicResult.memoryStats.avgHeapUsed - staticResult.memoryStats.avgHeapUsed) / staticResult.memoryStats.avgHeapUsed) * 100;
  const throughputDifference = ((dynamicResult.throughput - staticResult.throughput) / staticResult.throughput) * 100;
  
  const issues: string[] = [];
  let recommendation: 'BETTER' | 'ACCEPTABLE' | 'WORSE' = 'ACCEPTABLE';
  
  // Speed analysis
  if (speedDifference > 50) {
    issues.push(`Dynamic flow is ${speedDifference.toFixed(1)}% slower`);
    recommendation = 'WORSE';
  } else if (speedDifference > 20) {
    issues.push(`Dynamic flow is ${speedDifference.toFixed(1)}% slower`);
    if (recommendation === 'ACCEPTABLE') recommendation = 'ACCEPTABLE';
  } else if (speedDifference < -10) {
    issues.push(`Dynamic flow is ${Math.abs(speedDifference).toFixed(1)}% faster!`);
    recommendation = 'BETTER';
  }
  
  // Memory analysis
  if (memoryDifference > 100) {
    issues.push(`Dynamic flow uses ${memoryDifference.toFixed(1)}% more memory`);
    if (recommendation !== 'WORSE') recommendation = 'WORSE';
  } else if (memoryDifference > 50) {
    issues.push(`Dynamic flow uses ${memoryDifference.toFixed(1)}% more memory`);
  }
  
  // Success rate
  const staticSuccessRate = (staticResult.metrics.successful / staticResult.iterations) * 100;
  const dynamicSuccessRate = (dynamicResult.metrics.successful / dynamicResult.iterations) * 100;
  
  if (dynamicSuccessRate < staticSuccessRate - 5) {
    issues.push(`Lower success rate: ${dynamicSuccessRate.toFixed(1)}% vs ${staticSuccessRate.toFixed(1)}%`);
    recommendation = 'WORSE';
  }
  
  return {
    speedDifference,
    memoryDifference,
    throughputDifference,
    recommendation,
    issues,
  };
}

/**
 * Generate test input for flow
 */
function generateTestInput(flowName: string): any {
  // Simple test inputs - can be customized per flow
  const inputs: Record<string, any> = {
    'generate-text': { prompt: 'Write a test sentence', language: 'en' },
    'paraphrase-text': { text: 'This is a test sentence.', style: 'formal' },
    'summarize-text': { text: 'This is a longer text that needs to be summarized for testing purposes.', maxLength: 50 },
    'translate-text': { text: 'Hello world', targetLanguage: 'es' },
  };
  
  return inputs[flowName] || { input: 'test input' };
}

/**
 * Main benchmark function
 */
async function main() {
  const args = process.argv.slice(2);
  const flowName = args[0];
  const iterationsArg = args.find(arg => arg.startsWith('--iterations='));
  const iterations = iterationsArg ? parseInt(iterationsArg.split('=')[1]) : 100;

  if (!flowName) {
    console.error('❌ Error: Flow name is required');
    console.log('\nUsage: tsx scripts/migration/benchmark-flow.ts <flowName> [--iterations=100]');
    process.exit(1);
  }

  console.log('⚡ Flow Benchmark Tool\n');
  console.log(`Flow: ${flowName}`);
  console.log(`Iterations: ${iterations}\n`);
  console.log('='.repeat(80));

  const testInput = generateTestInput(flowName);

  try {
    // Benchmark static flow
    const staticResult = await benchmarkFlow(flowName, 'static', iterations, testInput);
    printBenchmarkResult(staticResult);

    // Benchmark dynamic flow
    const dynamicResult = await benchmarkFlow(flowName, 'dynamic', iterations, testInput);
    printBenchmarkResult(dynamicResult);

    // Compare results
    const comparison = compareResults(staticResult, dynamicResult);

    console.log('='.repeat(80));
    console.log('📊 COMPARISON\n');
    console.log(`Speed:      ${comparison.speedDifference > 0 ? '+' : ''}${comparison.speedDifference.toFixed(1)}%`);
    console.log(`Memory:     ${comparison.memoryDifference > 0 ? '+' : ''}${comparison.memoryDifference.toFixed(1)}%`);
    console.log(`Throughput: ${comparison.throughputDifference > 0 ? '+' : ''}${comparison.throughputDifference.toFixed(1)}%`);
    console.log(`\nRecommendation: ${comparison.recommendation}`);
    
    if (comparison.issues.length > 0) {
      console.log('\nIssues:');
      comparison.issues.forEach(issue => console.log(`  • ${issue}`));
    }
    console.log('\n' + '='.repeat(80));

    // Save report
    const report: ComparisonReport = {
      flowName,
      timestamp: new Date().toISOString(),
      iterations,
      staticResult,
      dynamicResult,
      comparison,
    };

    const reportPath = path.join(
      process.cwd(),
      'migration-reports',
      'benchmarks',
      `${flowName}-benchmark.json`
    );
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved: ${reportPath}\n`);

    if (comparison.recommendation === 'WORSE') {
      console.log('❌ Performance is significantly worse - optimization needed');
      process.exit(1);
    } else {
      console.log('✅ Performance is acceptable');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Benchmark failed:', error);
    process.exit(1);
  }
}

main();
