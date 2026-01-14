/**
 * Comparison Tools
 * Week 5 - Day 5: Flow Output Comparison
 * 
 * Tools for comparing outputs between original and migrated flows.
 */

// ============================================================================
// Types
// ============================================================================

export interface ComparisonReport {
  flowName: string;
  testCases: TestCaseResult[];
  overallSimilarity: number;
  passed: boolean;
  summary: ComparisonSummary;
}

export interface TestCaseResult {
  testName: string;
  input: Record<string, any>;
  originalOutput: any;
  migratedOutput: any;
  identical: boolean;
  similarity: number;
  differences: Difference[];
  passed: boolean;
}

export interface Difference {
  path: string;
  type: 'missing' | 'extra' | 'type-mismatch' | 'value-difference';
  original: any;
  migrated: any;
  severity: 'low' | 'medium' | 'high';
}

export interface ComparisonSummary {
  totalTests: number;
  passed: number;
  failed: number;
  avgSimilarity: number;
  criticalDifferences: number;
}

// ============================================================================
// Comparison Tools Class
// ============================================================================

export class ComparisonTools {
  /**
   * Compare outputs from original and migrated flows
   */
  compareOutputs(
    original: any,
    migrated: any,
    path: string = 'root'
  ): Difference[] {
    const differences: Difference[] = [];

    // Type comparison
    if (typeof original !== typeof migrated) {
      differences.push({
        path,
        type: 'type-mismatch',
        original: typeof original,
        migrated: typeof migrated,
        severity: 'high',
      });
      return differences;
    }

    // Null/undefined comparison
    if (original === null || original === undefined) {
      if (original !== migrated) {
        differences.push({
          path,
          type: 'value-difference',
          original,
          migrated,
          severity: 'medium',
        });
      }
      return differences;
    }

    // Array comparison
    if (Array.isArray(original)) {
      if (!Array.isArray(migrated)) {
        differences.push({
          path,
          type: 'type-mismatch',
          original: 'array',
          migrated: typeof migrated,
          severity: 'high',
        });
        return differences;
      }

      if (original.length !== migrated.length) {
        differences.push({
          path: `${path}.length`,
          type: 'value-difference',
          original: original.length,
          migrated: migrated.length,
          severity: 'medium',
        });
      }

      // Compare each element
      const minLength = Math.min(original.length, migrated.length);
      for (let i = 0; i < minLength; i++) {
        differences.push(...this.compareOutputs(original[i], migrated[i], `${path}[${i}]`));
      }

      return differences;
    }

    // Object comparison
    if (typeof original === 'object') {
      if (typeof migrated !== 'object' || migrated === null) {
        differences.push({
          path,
          type: 'type-mismatch',
          original: 'object',
          migrated: typeof migrated,
          severity: 'high',
        });
        return differences;
      }

      const originalKeys = Object.keys(original);
      const migratedKeys = Object.keys(migrated);

      // Find missing keys
      for (const key of originalKeys) {
        if (!(key in migrated)) {
          differences.push({
            path: `${path}.${key}`,
            type: 'missing',
            original: original[key],
            migrated: undefined,
            severity: 'high',
          });
        } else {
          differences.push(...this.compareOutputs(original[key], migrated[key], `${path}.${key}`));
        }
      }

      // Find extra keys
      for (const key of migratedKeys) {
        if (!(key in original)) {
          differences.push({
            path: `${path}.${key}`,
            type: 'extra',
            original: undefined,
            migrated: migrated[key],
            severity: 'low',
          });
        }
      }

      return differences;
    }

    // Primitive comparison
    if (original !== migrated) {
      differences.push({
        path,
        type: 'value-difference',
        original,
        migrated,
        severity: this.assessValueDifferenceSeverity(original, migrated),
      });
    }

    return differences;
  }

  /**
   * Run test suite comparing original and migrated flows
   */
  async runTestSuite(
    flowName: string,
    testCases: Array<{
      name: string;
      input: Record<string, any>;
    }>,
    originalExecutor: (input: any) => Promise<any>,
    migratedExecutor: (input: any) => Promise<any>
  ): Promise<ComparisonReport> {
    const results: TestCaseResult[] = [];

    for (const testCase of testCases) {
      try {
        // Execute both flows
        const originalOutput = await originalExecutor(testCase.input);
        const migratedOutput = await migratedExecutor(testCase.input);

        // Compare outputs
        const differences = this.compareOutputs(originalOutput, migratedOutput);
        const similarity = this.calculateSimilarity(originalOutput, migratedOutput);
        const identical = differences.length === 0;

        results.push({
          testName: testCase.name,
          input: testCase.input,
          originalOutput,
          migratedOutput,
          identical,
          similarity,
          differences,
          passed: similarity >= 95, // 95% threshold
        });

      } catch (error) {
        results.push({
          testName: testCase.name,
          input: testCase.input,
          originalOutput: null,
          migratedOutput: null,
          identical: false,
          similarity: 0,
          differences: [{
            path: 'execution',
            type: 'value-difference',
            original: 'success',
            migrated: 'error',
            severity: 'high',
          }],
          passed: false,
        });
      }
    }

    // Calculate summary
    const summary: ComparisonSummary = {
      totalTests: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      avgSimilarity: results.reduce((sum, r) => sum + r.similarity, 0) / results.length,
      criticalDifferences: results.reduce(
        (sum, r) => sum + r.differences.filter(d => d.severity === 'high').length,
        0
      ),
    };

    const overallSimilarity = summary.avgSimilarity;
    const passed = summary.passed === summary.totalTests;

    return {
      flowName,
      testCases: results,
      overallSimilarity,
      passed,
      summary,
    };
  }

  /**
   * Calculate similarity percentage
   */
  private calculateSimilarity(original: any, migrated: any): number {
    const origStr = JSON.stringify(original);
    const migrStr = JSON.stringify(migrated);

    if (origStr === migrStr) return 100;

    // Simple string similarity
    const maxLen = Math.max(origStr.length, migrStr.length);
    const minLen = Math.min(origStr.length, migrStr.length);

    return Math.round((minLen / maxLen) * 100);
  }

  /**
   * Assess severity of value difference
   */
  private assessValueDifferenceSeverity(original: any, migrated: any): 'low' | 'medium' | 'high' {
    // If both are strings and similar, low severity
    if (typeof original === 'string' && typeof migrated === 'string') {
      const similarity = this.calculateStringSimilarity(original, migrated);
      if (similarity > 90) return 'low';
      if (similarity > 70) return 'medium';
      return 'high';
    }

    // Numbers with small difference
    if (typeof original === 'number' && typeof migrated === 'number') {
      const diff = Math.abs(original - migrated);
      const ratio = diff / Math.max(Math.abs(original), 1);
      if (ratio < 0.01) return 'low'; // <1% difference
      if (ratio < 0.1) return 'medium'; // <10% difference
      return 'high';
    }

    return 'medium';
  }

  /**
   * Calculate string similarity (simple)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 100;

    let matches = 0;
    for (let i = 0; i < Math.min(len1, len2); i++) {
      if (str1[i] === str2[i]) matches++;
    }

    return Math.round((matches / maxLen) * 100);
  }

  /**
   * Generate comparison report (HTML)
   */
  generateHTMLReport(report: ComparisonReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Migration Comparison Report - ${report.flowName}</title>
  <style>
    body { font-family: system-ui; padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 2rem; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; }
    .test-case { background: white; border: 1px solid #e5e7eb; padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem; }
    .passed { border-left: 4px solid #10b981; }
    .failed { border-left: 4px solid #ef4444; }
    .difference { background: #fef3c7; padding: 0.5rem; margin: 0.5rem 0; border-radius: 0.25rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Migration Comparison Report</h1>
    <h2>${report.flowName}</h2>
    <p>Overall Similarity: ${report.overallSimilarity.toFixed(2)}%</p>
    <p>Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}</p>
  </div>

  <div class="stats">
    <div class="stat-card">
      <h3>Total Tests</h3>
      <p style="font-size: 2rem; font-weight: bold;">${report.summary.totalTests}</p>
    </div>
    <div class="stat-card">
      <h3>Passed</h3>
      <p style="font-size: 2rem; font-weight: bold; color: #10b981;">${report.summary.passed}</p>
    </div>
    <div class="stat-card">
      <h3>Failed</h3>
      <p style="font-size: 2rem; font-weight: bold; color: #ef4444;">${report.summary.failed}</p>
    </div>
    <div class="stat-card">
      <h3>Avg Similarity</h3>
      <p style="font-size: 2rem; font-weight: bold;">${report.summary.avgSimilarity.toFixed(1)}%</p>
    </div>
  </div>

  <h2>Test Cases</h2>
  ${report.testCases.map(tc => `
    <div class="test-case ${tc.passed ? 'passed' : 'failed'}">
      <h3>${tc.testName} - ${tc.passed ? '✅ PASSED' : '❌ FAILED'}</h3>
      <p>Similarity: ${tc.similarity}%</p>
      ${tc.differences.length > 0 ? `
        <h4>Differences (${tc.differences.length}):</h4>
        ${tc.differences.map(d => `
          <div class="difference">
            <strong>${d.path}</strong>: ${d.type}<br>
            Original: ${JSON.stringify(d.original)}<br>
            Migrated: ${JSON.stringify(d.migrated)}
          </div>
        `).join('')}
      ` : '<p>No differences found</p>'}
    </div>
  `).join('')}
</body>
</html>
`;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function createComparisonReport(
  flowName: string,
  testResults: TestCaseResult[]
): ComparisonReport {
  const tools = new ComparisonTools();
  
  const summary: ComparisonSummary = {
    totalTests: testResults.length,
    passed: testResults.filter(r => r.passed).length,
    failed: testResults.filter(r => !r.passed).length,
    avgSimilarity: testResults.reduce((sum, r) => sum + r.similarity, 0) / testResults.length,
    criticalDifferences: testResults.reduce(
      (sum, r) => sum + r.differences.filter(d => d.severity === 'high').length,
      0
    ),
  };

  return {
    flowName,
    testCases: testResults,
    overallSimilarity: summary.avgSimilarity,
    passed: summary.passed === summary.totalTests && summary.criticalDifferences === 0,
    summary,
  };
}

export function generateComparisonHTML(report: ComparisonReport): string {
  const tools = new ComparisonTools();
  return tools.generateHTMLReport(report);
}
