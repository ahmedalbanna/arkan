/**
 * Performance Benchmark Tool
 * 
 * Measures and compares performance between original and migrated flows.
 * Tracks execution time, memory usage, and throughput.
 */

import { performance } from 'perf_hooks';
import { writeFileSync } from 'fs';

interface BenchmarkConfig {
  iterations?: number;
  warmupRuns?: number;
  concurrency?: number;
  timeoutMs?: number;
}

interface BenchmarkMetrics {
  executionTime: {
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
    p99: number;
  };
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  throughput: {
    requestsPerSecond: number;
    totalRequests: number;
    totalDuration: number;
  };
  errors: number;
  timeouts: number;
}

interface BenchmarkResult {
  flowName: string;
  testCase: string;
  original: BenchmarkMetrics;
  migrated: BenchmarkMetrics;
  comparison: {
    speedup: number; // migrated/original ratio (>1 means migrated is faster)
    memoryDelta: number; // difference in memory usage
    throughputDelta: number; // difference in throughput
    recommendation: string;
  };
}

interface BenchmarkReport {
  totalFlows: number;
  totalTests: number;
  results: BenchmarkResult[];
  summary: {
    averageSpeedup: number;
    fasterCount: number;
    slowerCount: number;
    similarCount: number;
  };
}

export class PerformanceBenchmark {
  private config: Required<BenchmarkConfig>;

  constructor(config: BenchmarkConfig = {}) {
    this.config = {
      iterations: config.iterations || 10,
      warmupRuns: config.warmupRuns || 3,
      concurrency: config.concurrency || 1,
      timeoutMs: config.timeoutMs || 30000,
    };
  }

  /**
   * Benchmark a single executor
   */
  public async benchmarkExecutor(
    name: string,
    executor: (input: any) => Promise<any>,
    input: any
  ): Promise<BenchmarkMetrics> {
    console.log(`   Benchmarking ${name}...`);

    // Warmup runs
    for (let i = 0; i < this.config.warmupRuns; i++) {
      try {
        await this.executeWithTimeout(executor, input);
      } catch (error) {
        // Ignore warmup errors
      }
    }

    // Actual benchmark runs
    const executionTimes: number[] = [];
    let errors = 0;
    let timeouts = 0;
    const memoryBefore = process.memoryUsage();

    const startTime = performance.now();

    for (let i = 0; i < this.config.iterations; i++) {
      const iterStart = performance.now();

      try {
        await this.executeWithTimeout(executor, input);
        const iterEnd = performance.now();
        executionTimes.push(iterEnd - iterStart);
      } catch (error: any) {
        if (error.message === 'Timeout') {
          timeouts++;
        } else {
          errors++;
        }
        // Add max timeout as execution time for failed runs
        executionTimes.push(this.config.timeoutMs);
      }
    }

    const endTime = performance.now();
    const memoryAfter = process.memoryUsage();

    // Calculate metrics
    const sortedTimes = executionTimes.sort((a, b) => a - b);
    const totalDuration = (endTime - startTime) / 1000; // Convert to seconds

    const metrics: BenchmarkMetrics = {
      executionTime: {
        min: Math.min(...executionTimes),
        max: Math.max(...executionTimes),
        avg: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
        median: this.calculateMedian(sortedTimes),
        p95: this.calculatePercentile(sortedTimes, 95),
        p99: this.calculatePercentile(sortedTimes, 99),
      },
      memoryUsage: {
        heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
        heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
        external: memoryAfter.external - memoryBefore.external,
      },
      throughput: {
        requestsPerSecond: this.config.iterations / totalDuration,
        totalRequests: this.config.iterations,
        totalDuration,
      },
      errors,
      timeouts,
    };

    console.log(`   ✓ Completed: avg ${metrics.executionTime.avg.toFixed(2)}ms`);

    return metrics;
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout(
    executor: (input: any) => Promise<any>,
    input: any
  ): Promise<any> {
    return Promise.race([
      executor(input),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), this.config.timeoutMs)
      ),
    ]);
  }

  /**
   * Calculate median
   */
  private calculateMedian(sortedValues: number[]): number {
    const mid = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2 === 0) {
      return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
    }
    return sortedValues[mid];
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Compare two benchmark results
   */
  public async compareBenchmarks(
    flowName: string,
    testCaseName: string,
    originalExecutor: (input: any) => Promise<any>,
    migratedExecutor: (input: any) => Promise<any>,
    input: any
  ): Promise<BenchmarkResult> {
    console.log(`\n📊 Benchmarking: ${flowName} - ${testCaseName}`);

    const original = await this.benchmarkExecutor('Original', originalExecutor, input);
    const migrated = await this.benchmarkExecutor('Migrated', migratedExecutor, input);

    // Calculate comparison metrics
    const speedup = original.executionTime.avg / migrated.executionTime.avg;
    const memoryDelta = migrated.memoryUsage.heapUsed - original.memoryUsage.heapUsed;
    const throughputDelta = migrated.throughput.requestsPerSecond - original.throughput.requestsPerSecond;

    const recommendation = this.generateRecommendation(speedup, memoryDelta);

    return {
      flowName,
      testCase: testCaseName,
      original,
      migrated,
      comparison: {
        speedup,
        memoryDelta,
        throughputDelta,
        recommendation,
      },
    };
  }

  /**
   * Generate performance recommendation
   */
  private generateRecommendation(speedup: number, memoryDelta: number): string {
    if (speedup > 1.2 && memoryDelta < 0) {
      return '✅ Excellent - Faster and uses less memory';
    } else if (speedup > 1.2) {
      return '✅ Good - Significantly faster';
    } else if (speedup > 1.05) {
      return '✅ Acceptable - Slightly faster';
    } else if (speedup > 0.95 && speedup <= 1.05) {
      return '⚠️ Similar - Performance is comparable';
    } else if (speedup > 0.8) {
      return '⚠️ Warning - Slightly slower';
    } else {
      return '❌ Poor - Significantly slower, needs optimization';
    }
  }

  /**
   * Run benchmarks for multiple test cases
   */
  public async runBenchmarks(
    testConfigs: Array<{
      flowName: string;
      testCase: string;
      originalExecutor: (input: any) => Promise<any>;
      migratedExecutor: (input: any) => Promise<any>;
      input: any;
    }>
  ): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    for (const config of testConfigs) {
      try {
        const result = await this.compareBenchmarks(
          config.flowName,
          config.testCase,
          config.originalExecutor,
          config.migratedExecutor,
          config.input
        );
        results.push(result);
      } catch (error) {
        console.error(`❌ Benchmark failed for ${config.flowName}:`, error);
      }
    }

    return results;
  }

  /**
   * Generate benchmark report
   */
  public generateReport(results: BenchmarkResult[]): BenchmarkReport {
    const fasterCount = results.filter(r => r.comparison.speedup > 1.05).length;
    const slowerCount = results.filter(r => r.comparison.speedup < 0.95).length;
    const similarCount = results.filter(
      r => r.comparison.speedup >= 0.95 && r.comparison.speedup <= 1.05
    ).length;

    const averageSpeedup =
      results.reduce((sum, r) => sum + r.comparison.speedup, 0) / results.length;

    return {
      totalFlows: new Set(results.map(r => r.flowName)).size,
      totalTests: results.length,
      results,
      summary: {
        averageSpeedup,
        fasterCount,
        slowerCount,
        similarCount,
      },
    };
  }

  /**
   * Print detailed results
   */
  public printResults(results: BenchmarkResult[]): void {
    console.log('\n' + '='.repeat(70));
    console.log('PERFORMANCE BENCHMARK RESULTS');
    console.log('='.repeat(70) + '\n');

    results.forEach((result, index) => {
      const speedupPercent = ((result.comparison.speedup - 1) * 100).toFixed(1);
      const speedupSign = result.comparison.speedup > 1 ? '+' : '';

      console.log(`${index + 1}. ${result.flowName} - ${result.testCase}`);
      console.log(`   Original: ${result.original.executionTime.avg.toFixed(2)}ms (avg)`);
      console.log(`   Migrated: ${result.migrated.executionTime.avg.toFixed(2)}ms (avg)`);
      console.log(`   Speedup:  ${speedupSign}${speedupPercent}% ${result.comparison.speedup > 1 ? '🚀' : '🐌'}`);
      console.log(`   Memory:   ${this.formatBytes(result.comparison.memoryDelta)}`);
      console.log(`   ${result.comparison.recommendation}`);
      console.log('');
    });
  }

  /**
   * Print summary
   */
  public printSummary(report: BenchmarkReport): void {
    const avgSpeedupPercent = ((report.summary.averageSpeedup - 1) * 100).toFixed(1);
    const avgSign = report.summary.averageSpeedup > 1 ? '+' : '';

    console.log('\n' + '='.repeat(70));
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    PERFORMANCE SUMMARY                               ║
╚══════════════════════════════════════════════════════════════════════╝

📊 Benchmark Statistics:
   Total Flows:       ${report.totalFlows}
   Total Tests:       ${report.totalTests}
   
   🚀 Faster:         ${report.summary.fasterCount} (${((report.summary.fasterCount / report.totalTests) * 100).toFixed(1)}%)
   ⚖️  Similar:        ${report.summary.similarCount} (${((report.summary.similarCount / report.totalTests) * 100).toFixed(1)}%)
   🐌 Slower:         ${report.summary.slowerCount} (${((report.summary.slowerCount / report.totalTests) * 100).toFixed(1)}%)
   
   Average Speedup:   ${avgSign}${avgSpeedupPercent}%
`);

    if (report.summary.averageSpeedup > 1.1) {
      console.log('✅ Migration shows significant performance improvement!');
    } else if (report.summary.averageSpeedup > 0.95) {
      console.log('✅ Migration maintains comparable performance.');
    } else {
      console.log('⚠️ Migration shows performance degradation. Consider optimization.');
    }

    console.log('='.repeat(70) + '\n');
  }

  /**
   * Format bytes
   */
  private formatBytes(bytes: number): string {
    const abs = Math.abs(bytes);
    const sign = bytes >= 0 ? '+' : '';

    if (abs < 1024) {
      return `${sign}${bytes}B`;
    } else if (abs < 1024 * 1024) {
      return `${sign}${(bytes / 1024).toFixed(2)}KB`;
    } else {
      return `${sign}${(bytes / (1024 * 1024)).toFixed(2)}MB`;
    }
  }

  /**
   * Export report to JSON
   */
  public exportReport(report: BenchmarkReport, outputPath: string): void {
    writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`✅ Benchmark report saved to ${outputPath}`);
  }

  /**
   * Generate HTML report
   */
  public generateHTMLReport(report: BenchmarkReport): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Performance Benchmark Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px; }
    .summary { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .stat { display: inline-block; margin: 10px 20px; }
    .stat-value { font-size: 24px; font-weight: bold; }
    .result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
    .faster { border-left: 4px solid #4CAF50; }
    .similar { border-left: 4px solid #2196F3; }
    .slower { border-left: 4px solid #F44336; }
    .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
    .metric { background: #f9f9f9; padding: 10px; border-radius: 3px; }
    canvas { max-width: 600px; margin: 20px auto; display: block; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚡ Performance Benchmark Report</h1>
    
    <div class="summary">
      <h2>Summary</h2>
      <div class="stat">
        <div class="stat-value">${report.totalTests}</div>
        <div>Total Tests</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #4CAF50;">${report.summary.fasterCount}</div>
        <div>Faster</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #2196F3;">${report.summary.similarCount}</div>
        <div>Similar</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #F44336;">${report.summary.slowerCount}</div>
        <div>Slower</div>
      </div>
      <div class="stat">
        <div class="stat-value">${((report.summary.averageSpeedup - 1) * 100).toFixed(1)}%</div>
        <div>Avg Speedup</div>
      </div>
    </div>

    <canvas id="speedupChart"></canvas>

    <h2>Detailed Results</h2>
`;

    report.results.forEach(result => {
      const speedupClass = result.comparison.speedup > 1.05 ? 'faster' : 
                           result.comparison.speedup < 0.95 ? 'slower' : 'similar';
      
      html += `
    <div class="result ${speedupClass}">
      <h3>${result.flowName} - ${result.testCase}</h3>
      <div class="metrics">
        <div class="metric">
          <strong>Original:</strong><br>
          Avg: ${result.original.executionTime.avg.toFixed(2)}ms<br>
          P95: ${result.original.executionTime.p95.toFixed(2)}ms
        </div>
        <div class="metric">
          <strong>Migrated:</strong><br>
          Avg: ${result.migrated.executionTime.avg.toFixed(2)}ms<br>
          P95: ${result.migrated.executionTime.p95.toFixed(2)}ms
        </div>
      </div>
      <p><strong>Speedup:</strong> ${(result.comparison.speedup * 100).toFixed(1)}%</p>
      <p><strong>Recommendation:</strong> ${result.comparison.recommendation}</p>
    </div>
`;
    });

    // Add chart data
    const chartLabels = report.results.map(r => `${r.flowName} - ${r.testCase}`);
    const chartData = report.results.map(r => ((r.comparison.speedup - 1) * 100).toFixed(1));

    html += `
  </div>
  <script>
    const ctx = document.getElementById('speedupChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(chartLabels)},
        datasets: [{
          label: 'Speedup (%)',
          data: ${JSON.stringify(chartData)},
          backgroundColor: ${JSON.stringify(chartData.map((v: string) => parseFloat(v) > 0 ? '#4CAF50' : '#F44336'))}
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Performance Comparison' }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Speedup (%)' } }
        }
      }
    });
  </script>
</body>
</html>
`;

    return html;
  }

  /**
   * Export HTML report
   */
  public exportHTMLReport(report: BenchmarkReport, outputPath: string): void {
    const html = this.generateHTMLReport(report);
    writeFileSync(outputPath, html);
    console.log(`✅ HTML report saved to ${outputPath}`);
  }
}

// CLI Usage
if (require.main === module) {
  console.log('Performance Benchmark Tool');
  console.log('Usage: ts-node benchmark-flow.ts');
  console.log('\nThis tool should be used programmatically with test cases.');
  console.log('See the batch migration script for usage examples.');
}

export default PerformanceBenchmark;
