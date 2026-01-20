/**
 * Model Performance Monitoring
 * 
 * Tracks and monitors model performance, resource usage, and request patterns.
 * Provides insights for optimization and model selection tuning.
 */

import { OLLAMA_MODELS } from '../genkit';

/**
 * Performance metrics for a single request
 */
export interface RequestMetrics {
  model: string;
  flowName?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  inputTokens?: number;
  outputTokens?: number;
  success: boolean;
  error?: string;
  memoryUsageMB?: number;
}

/**
 * Aggregated performance statistics
 */
export interface ModelStatistics {
  model: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  totalTokensProcessed: number;
  averageInputTokens: number;
  averageOutputTokens: number;
  averageMemoryUsageMB: number;
  lastUsed: number;
  errorRate: number;
}

/**
 * Performance monitor class
 */
class ModelPerformanceMonitor {
  private metrics: RequestMetrics[] = [];
  private activeRequests: Map<string, RequestMetrics> = new Map();
  private maxMetricsHistory = 1000; // Keep last 1000 requests
  private requestCounts: Map<string, number> = new Map();

  /**
   * Start tracking a request
   */
  startRequest(requestId: string, model: string, flowName?: string): void {
    const metric: RequestMetrics = {
      model,
      flowName,
      startTime: Date.now(),
      success: false,
    };
    this.activeRequests.set(requestId, metric);
  }

  /**
   * End tracking a request
   */
  endRequest(
    requestId: string,
    success: boolean,
    error?: string,
    inputTokens?: number,
    outputTokens?: number,
    memoryUsageMB?: number
  ): void {
    const metric = this.activeRequests.get(requestId);
    if (!metric) return;

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;
    metric.error = error;
    metric.inputTokens = inputTokens;
    metric.outputTokens = outputTokens;
    metric.memoryUsageMB = memoryUsageMB;

    this.metrics.push(metric);
    this.activeRequests.delete(requestId);

    // Maintain max history size
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Update request count
    const currentCount = this.requestCounts.get(metric.model) || 0;
    this.requestCounts.set(metric.model, currentCount + 1);
  }

  /**
   * Get statistics for a specific model
   */
  getModelStatistics(model: string): ModelStatistics {
    const modelMetrics = this.metrics.filter((m) => m.model === model && m.duration);

    if (modelMetrics.length === 0) {
      return {
        model,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalTokensProcessed: 0,
        averageInputTokens: 0,
        averageOutputTokens: 0,
        averageMemoryUsageMB: 0,
        lastUsed: 0,
        errorRate: 0,
      };
    }

    const successfulRequests = modelMetrics.filter((m) => m.success).length;
    const failedRequests = modelMetrics.length - successfulRequests;
    const durations = modelMetrics.map((m) => m.duration || 0);
    const inputTokens = modelMetrics.map((m) => m.inputTokens || 0);
    const outputTokens = modelMetrics.map((m) => m.outputTokens || 0);
    const memoryUsages = modelMetrics.filter((m) => m.memoryUsageMB).map((m) => m.memoryUsageMB || 0);

    return {
      model,
      totalRequests: modelMetrics.length,
      successfulRequests,
      failedRequests,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalTokensProcessed: inputTokens.reduce((a, b) => a + b, 0) + outputTokens.reduce((a, b) => a + b, 0),
      averageInputTokens: inputTokens.reduce((a, b) => a + b, 0) / inputTokens.length,
      averageOutputTokens: outputTokens.reduce((a, b) => a + b, 0) / outputTokens.length,
      averageMemoryUsageMB: memoryUsages.length > 0 ? memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length : 0,
      lastUsed: Math.max(...modelMetrics.map((m) => m.startTime)),
      errorRate: failedRequests / modelMetrics.length,
    };
  }

  /**
   * Get statistics for all models
   */
  getAllStatistics(): ModelStatistics[] {
    const models = [OLLAMA_MODELS.GEMMA_2B, OLLAMA_MODELS.PHI3_MINI, OLLAMA_MODELS.LLAMA3_8B];
    return models.map((model) => this.getModelStatistics(model));
  }

  /**
   * Get current active requests count per model
   */
  getActiveRequestCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.activeRequests.forEach((metric) => {
      counts[metric.model] = (counts[metric.model] || 0) + 1;
    });
    return counts;
  }

  /**
   * Check if model can handle more concurrent requests
   */
  canHandleRequest(model: string, maxConcurrent: number): boolean {
    const activeCounts = this.getActiveRequestCounts();
    const currentCount = activeCounts[model] || 0;
    return currentCount < maxConcurrent;
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit = 10): RequestMetrics[] {
    return this.metrics
      .filter((m) => !m.success && m.error)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get slowest requests for optimization
   */
  getSlowestRequests(limit = 10): RequestMetrics[] {
    return [...this.metrics]
      .filter((m) => m.duration)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, limit);
  }

  /**
   * Get performance comparison between models
   */
  compareModels(): Record<string, { avgSpeed: number; avgQuality: number; reliability: number }> {
    const stats = this.getAllStatistics();
    const comparison: Record<string, { avgSpeed: number; avgQuality: number; reliability: number }> = {};

    stats.forEach((stat) => {
      // Speed: inverse of average duration (lower duration = higher speed score)
      const avgSpeed = stat.averageDuration > 0 ? 1000 / stat.averageDuration : 0;

      // Quality: proxy based on output tokens (more output typically = better quality)
      const avgQuality = stat.averageOutputTokens;

      // Reliability: 1 - error rate
      const reliability = 1 - stat.errorRate;

      comparison[stat.model] = {
        avgSpeed: Math.round(avgSpeed * 100) / 100,
        avgQuality: Math.round(avgQuality * 100) / 100,
        reliability: Math.round(reliability * 100) / 100,
      };
    });

    return comparison;
  }

  /**
   * Get performance report
   */
  generateReport(): string {
    const stats = this.getAllStatistics();
    const activeRequests = this.getActiveRequestCounts();

    let report = '📊 MODEL PERFORMANCE REPORT\n';
    report += '═══════════════════════════════════════\n\n';

    stats.forEach((stat) => {
      const modelName = stat.model.split('/')[1] || stat.model;
      report += `🤖 ${modelName.toUpperCase()}\n`;
      report += `   Total Requests: ${stat.totalRequests}\n`;
      report += `   Success Rate: ${((stat.successfulRequests / stat.totalRequests) * 100).toFixed(1)}%\n`;
      report += `   Avg Duration: ${stat.averageDuration.toFixed(0)}ms\n`;
      report += `   Range: ${stat.minDuration.toFixed(0)}ms - ${stat.maxDuration.toFixed(0)}ms\n`;
      report += `   Avg Input Tokens: ${stat.averageInputTokens.toFixed(0)}\n`;
      report += `   Avg Output Tokens: ${stat.averageOutputTokens.toFixed(0)}\n`;
      if (stat.averageMemoryUsageMB > 0) {
        report += `   Avg Memory: ${stat.averageMemoryUsageMB.toFixed(1)}MB\n`;
      }
      report += `   Active Requests: ${activeRequests[stat.model] || 0}\n`;
      report += '\n';
    });

    report += '📈 MODEL COMPARISON\n';
    report += '═══════════════════════════════════════\n';
    const comparison = this.compareModels();
    Object.entries(comparison).forEach(([model, metrics]) => {
      const modelName = model.split('/')[1] || model;
      report += `   ${modelName}: Speed=${metrics.avgSpeed.toFixed(2)} | Quality=${metrics.avgQuality.toFixed(0)} | Reliability=${(metrics.reliability * 100).toFixed(1)}%\n`;
    });

    return report;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = [];
    this.activeRequests.clear();
    this.requestCounts.clear();
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      statistics: this.getAllStatistics(),
      activeRequests: Object.fromEntries(this.activeRequests),
      timestamp: Date.now(),
    }, null, 2);
  }

  /**
   * Get metrics for specific flow
   */
  getFlowStatistics(flowName: string): {
    totalRequests: number;
    averageDuration: number;
    modelUsage: Record<string, number>;
  } {
    const flowMetrics = this.metrics.filter((m) => m.flowName === flowName && m.duration);

    if (flowMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageDuration: 0,
        modelUsage: {},
      };
    }

    const modelUsage: Record<string, number> = {};
    flowMetrics.forEach((m) => {
      modelUsage[m.model] = (modelUsage[m.model] || 0) + 1;
    });

    return {
      totalRequests: flowMetrics.length,
      averageDuration: flowMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / flowMetrics.length,
      modelUsage,
    };
  }
}

// Singleton instance
export const performanceMonitor = new ModelPerformanceMonitor();

/**
 * Helper function to track a request
 */
export async function trackRequest<T>(
  requestId: string,
  model: string,
  flowName: string | undefined,
  operation: () => Promise<T>,
  getTokenCounts?: () => { input?: number; output?: number }
): Promise<T> {
  performanceMonitor.startRequest(requestId, model, flowName);

  try {
    const result = await operation();
    const tokens = getTokenCounts?.();
    performanceMonitor.endRequest(
      requestId,
      true,
      undefined,
      tokens?.input,
      tokens?.output
    );
    return result;
  } catch (error) {
    performanceMonitor.endRequest(
      requestId,
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
