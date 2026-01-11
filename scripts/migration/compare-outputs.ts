/**
 * Output Comparison Tool
 * 
 * Compares outputs between original hardcoded flows and migrated dynamic flows.
 * Calculates similarity scores and identifies differences.
 */

import { readFileSync, writeFileSync } from 'fs';
import { diffLines, diffWords } from 'diff';

interface ComparisonInput {
  flowName: string;
  testCases: Array<{
    name: string;
    input: any;
  }>;
}

interface ComparisonResult {
  flowName: string;
  testCase: string;
  originalOutput: string;
  migratedOutput: string;
  similarity: number;
  differences: Array<{
    type: 'added' | 'removed' | 'modified';
    content: string;
    line?: number;
  }>;
  status: 'passed' | 'failed' | 'warning';
  notes: string[];
}

interface ComparisonReport {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  averageSimilarity: number;
  results: ComparisonResult[];
  summary: string;
}

export class OutputComparator {
  private similarityThreshold = 0.85; // 85% similarity to pass
  private warningThreshold = 0.95; // <95% triggers warning

  /**
   * Compare outputs for a single test case
   */
  public compareOutputs(
    flowName: string,
    testCaseName: string,
    originalOutput: string,
    migratedOutput: string
  ): ComparisonResult {
    // Normalize outputs
    const normalizedOriginal = this.normalizeOutput(originalOutput);
    const normalizedMigrated = this.normalizeOutput(migratedOutput);

    // Calculate similarity
    const similarity = this.calculateSimilarity(normalizedOriginal, normalizedMigrated);

    // Find differences
    const differences = this.findDifferences(normalizedOriginal, normalizedMigrated);

    // Determine status
    const status = this.determineStatus(similarity, differences);

    // Generate notes
    const notes = this.generateNotes(similarity, differences);

    return {
      flowName,
      testCase: testCaseName,
      originalOutput,
      migratedOutput,
      similarity,
      differences,
      status,
      notes,
    };
  }

  /**
   * Normalize output for comparison
   */
  private normalizeOutput(output: string): string {
    return output
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n+/g, '\n') // Normalize line breaks
      .toLowerCase();
  }

  /**
   * Calculate similarity score using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Find specific differences between outputs
   */
  private findDifferences(
    original: string,
    migrated: string
  ): Array<{ type: 'added' | 'removed' | 'modified'; content: string; line?: number }> {
    const differences: Array<{ type: 'added' | 'removed' | 'modified'; content: string; line?: number }> = [];
    
    // Line-by-line comparison
    const diff = diffLines(original, migrated);
    let lineNumber = 0;

    diff.forEach(part => {
      if (part.added) {
        differences.push({
          type: 'added',
          content: part.value,
          line: lineNumber,
        });
      } else if (part.removed) {
        differences.push({
          type: 'removed',
          content: part.value,
          line: lineNumber,
        });
      } else {
        lineNumber += part.value.split('\n').length - 1;
      }
    });

    return differences;
  }

  /**
   * Determine test status
   */
  private determineStatus(
    similarity: number,
    differences: Array<any>
  ): 'passed' | 'failed' | 'warning' {
    if (similarity < this.similarityThreshold) {
      return 'failed';
    }
    
    if (similarity < this.warningThreshold) {
      return 'warning';
    }

    return 'passed';
  }

  /**
   * Generate notes about the comparison
   */
  private generateNotes(similarity: number, differences: Array<any>): string[] {
    const notes: string[] = [];

    notes.push(`Similarity score: ${(similarity * 100).toFixed(2)}%`);

    if (differences.length > 0) {
      const added = differences.filter(d => d.type === 'added').length;
      const removed = differences.filter(d => d.type === 'removed').length;
      
      if (added > 0) {
        notes.push(`${added} additions found`);
      }
      if (removed > 0) {
        notes.push(`${removed} removals found`);
      }
    }

    if (similarity < this.similarityThreshold) {
      notes.push('⚠️ Output differs significantly from original');
    } else if (similarity < this.warningThreshold) {
      notes.push('⚠️ Minor differences detected');
    } else {
      notes.push('✅ Output matches original closely');
    }

    return notes;
  }

  /**
   * Run comparison for multiple test cases
   */
  public async runComparison(
    flowName: string,
    originalExecutor: (input: any) => Promise<string>,
    migratedExecutor: (input: any) => Promise<string>,
    testCases: Array<{ name: string; input: any }>
  ): Promise<ComparisonResult[]> {
    const results: ComparisonResult[] = [];

    for (const testCase of testCases) {
      try {
        console.log(`   Testing: ${testCase.name}...`);
        
        const originalOutput = await originalExecutor(testCase.input);
        const migratedOutput = await migratedExecutor(testCase.input);

        const result = this.compareOutputs(
          flowName,
          testCase.name,
          originalOutput,
          migratedOutput
        );

        results.push(result);

        const statusIcon = {
          passed: '✅',
          warning: '⚠️',
          failed: '❌',
        }[result.status];

        console.log(`   ${statusIcon} ${testCase.name}: ${(result.similarity * 100).toFixed(2)}% similarity`);
      } catch (error) {
        console.error(`   ❌ Error testing ${testCase.name}:`, error);
      }
    }

    return results;
  }

  /**
   * Generate comparison report
   */
  public generateReport(results: ComparisonResult[]): ComparisonReport {
    const totalTests = results.length;
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const warnings = results.filter(r => r.status === 'warning').length;

    const averageSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / totalTests;

    const summary = this.generateSummary({
      totalTests,
      passed,
      failed,
      warnings,
      averageSimilarity,
    });

    return {
      totalTests,
      passed,
      failed,
      warnings,
      averageSimilarity,
      results,
      summary,
    };
  }

  /**
   * Generate summary text
   */
  private generateSummary(data: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
    averageSimilarity: number;
  }): string {
    const { totalTests, passed, failed, warnings, averageSimilarity } = data;

    let summary = `
╔══════════════════════════════════════════════════════════════════════╗
║                    OUTPUT COMPARISON REPORT                          ║
╚══════════════════════════════════════════════════════════════════════╝

📊 Test Results:
   Total Tests:           ${totalTests}
   ✅ Passed:             ${passed} (${((passed / totalTests) * 100).toFixed(1)}%)
   ⚠️  Warnings:          ${warnings} (${((warnings / totalTests) * 100).toFixed(1)}%)
   ❌ Failed:             ${failed} (${((failed / totalTests) * 100).toFixed(1)}%)
   
   Average Similarity:    ${(averageSimilarity * 100).toFixed(2)}%
`;

    if (failed > 0) {
      summary += `\n⚠️  Some tests failed. Review differences carefully.`;
    } else if (warnings > 0) {
      summary += `\n⚠️  Some tests have minor differences. Consider reviewing.`;
    } else {
      summary += `\n✅ All tests passed! Migration successful.`;
    }

    return summary;
  }

  /**
   * Export report to JSON
   */
  public exportReport(report: ComparisonReport, outputPath: string): void {
    writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Comparison report saved to ${outputPath}`);
  }

  /**
   * Print detailed results
   */
  public printDetailedResults(results: ComparisonResult[]): void {
    console.log('\n' + '='.repeat(70));
    console.log('DETAILED COMPARISON RESULTS');
    console.log('='.repeat(70) + '\n');

    results.forEach((result, index) => {
      const statusIcon = {
        passed: '✅',
        warning: '⚠️',
        failed: '❌',
      }[result.status];

      console.log(`${index + 1}. ${statusIcon} ${result.flowName} - ${result.testCase}`);
      console.log(`   Similarity: ${(result.similarity * 100).toFixed(2)}%`);
      
      if (result.notes.length > 0) {
        console.log(`   Notes:`);
        result.notes.forEach(note => console.log(`     • ${note}`));
      }

      if (result.differences.length > 0 && result.status !== 'passed') {
        console.log(`   Differences:`);
        result.differences.slice(0, 5).forEach(diff => {
          console.log(`     [${diff.type}] ${diff.content.substring(0, 50)}...`);
        });
        if (result.differences.length > 5) {
          console.log(`     ... and ${result.differences.length - 5} more`);
        }
      }

      console.log('');
    });
  }

  /**
   * Generate HTML report
   */
  public generateHTMLReport(report: ComparisonReport): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Output Comparison Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
    .summary { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .stat { display: inline-block; margin: 10px 20px; }
    .stat-value { font-size: 24px; font-weight: bold; }
    .test-result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
    .test-result.passed { border-left: 4px solid #4CAF50; }
    .test-result.warning { border-left: 4px solid #FF9800; }
    .test-result.failed { border-left: 4px solid #F44336; }
    .diff { background: #f9f9f9; padding: 10px; margin: 10px 0; border-radius: 3px; font-family: monospace; font-size: 12px; }
    .added { background: #c8e6c9; }
    .removed { background: #ffcdd2; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Output Comparison Report</h1>
    
    <div class="summary">
      <h2>Summary</h2>
      <div class="stat">
        <div class="stat-value">${report.totalTests}</div>
        <div>Total Tests</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #4CAF50;">${report.passed}</div>
        <div>Passed</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #FF9800;">${report.warnings}</div>
        <div>Warnings</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #F44336;">${report.failed}</div>
        <div>Failed</div>
      </div>
      <div class="stat">
        <div class="stat-value">${(report.averageSimilarity * 100).toFixed(2)}%</div>
        <div>Avg Similarity</div>
      </div>
    </div>

    <h2>Test Results</h2>
`;

    report.results.forEach(result => {
      html += `
    <div class="test-result ${result.status}">
      <h3>${result.flowName} - ${result.testCase}</h3>
      <p><strong>Similarity:</strong> ${(result.similarity * 100).toFixed(2)}%</p>
      <p><strong>Status:</strong> ${result.status.toUpperCase()}</p>
      ${result.notes.length > 0 ? `<p><strong>Notes:</strong> ${result.notes.join(', ')}</p>` : ''}
      ${result.differences.length > 0 ? `<p><strong>Differences:</strong> ${result.differences.length} found</p>` : ''}
    </div>
`;
    });

    html += `
  </div>
</body>
</html>
`;

    return html;
  }

  /**
   * Export HTML report
   */
  public exportHTMLReport(report: ComparisonReport, outputPath: string): void {
    const html = this.generateHTMLReport(report);
    writeFileSync(outputPath, html);
    console.log(`✅ HTML report saved to ${outputPath}`);
  }
}

// CLI Usage
if (require.main === module) {
  console.log('Output Comparison Tool');
  console.log('Usage: ts-node compare-outputs.ts');
  console.log('\nThis tool should be used programmatically with test cases.');
  console.log('See the batch migration script for usage examples.');
}

export default OutputComparator;
