/**
 * Model Health Check and Availability Monitoring
 * 
 * Monitors Ollama server and model availability, performs health checks,
 * and provides automatic fallback mechanisms.
 */

import { OLLAMA_MODELS } from './genkit';
import { getFallbackModel } from './model-selector';

/**
 * Health status for a model
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNAVAILABLE = 'unavailable',
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  model: string;
  status: HealthStatus;
  responseTime?: number;
  lastChecked: number;
  error?: string;
  available: boolean;
}

/**
 * Server health information
 */
export interface ServerHealth {
  serverUrl: string;
  online: boolean;
  lastChecked: number;
  models: HealthCheckResult[];
  overallStatus: HealthStatus;
}

/**
 * Health check configuration
 */
interface HealthCheckConfig {
  serverUrl: string;
  checkInterval: number; // ms
  timeout: number; // ms
  retryAttempts: number;
}

/**
 * Model health monitor
 */
class ModelHealthMonitor {
  private config: HealthCheckConfig;
  private healthCache: Map<string, HealthCheckResult> = new Map();
  private serverOnline = true;
  private lastServerCheck = 0;
  private checkInterval?: NodeJS.Timeout;

  constructor(config: Partial<HealthCheckConfig> = {}) {
    this.config = {
      serverUrl: 'http://185.190.140.93:11434',
      checkInterval: 60000, // 1 minute
      timeout: 5000, // 5 seconds
      retryAttempts: 3,
      ...config,
    };
  }

  /**
   * Perform health check for a specific model
   */
  async checkModel(model: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const modelName = model.replace('ollama/', '');

    try {
      // Try to generate a simple response
      await this.testGeneration(modelName);

      const responseTime = Date.now() - startTime;
      const result: HealthCheckResult = {
        model,
        status: this.determineStatus(responseTime),
        responseTime,
        lastChecked: Date.now(),
        available: true,
      };

      this.healthCache.set(model, result);
      return result;
    } catch (error) {
      const result: HealthCheckResult = {
        model,
        status: HealthStatus.UNAVAILABLE,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
        available: false,
      };

      this.healthCache.set(model, result);
      return result;
    }
  }

  /**
   * Test generation with a model
   */
  private async testGeneration(modelName: string): Promise<boolean> {
    // Simple test: generate a single word
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.serverUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: 'Say "ok"',
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Determine health status based on response time
   */
  private determineStatus(responseTime: number): HealthStatus {
    if (responseTime < 2000) return HealthStatus.HEALTHY;
    if (responseTime < 5000) return HealthStatus.DEGRADED;
    return HealthStatus.UNHEALTHY;
  }

  /**
   * Check all models
   */
  async checkAllModels(): Promise<HealthCheckResult[]> {
    const models = [OLLAMA_MODELS.GEMMA_2B, OLLAMA_MODELS.PHI3_MINI, OLLAMA_MODELS.LLAMA3_8B];
    const results = await Promise.all(models.map((model) => this.checkModel(model)));
    return results;
  }

  /**
   * Check server availability
   */
  async checkServer(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.serverUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.serverOnline = response.ok;
      this.lastServerCheck = Date.now();
      return this.serverOnline;
    } catch { 
      this.serverOnline = false;
      this.lastServerCheck = Date.now();
      return false;
    }
  }

  /**
   * Get cached health status
   */
  getHealthStatus(model: string): HealthCheckResult | null {
    return this.healthCache.get(model) || null;
  }

  /**
   * Get all cached health statuses
   */
  getAllHealthStatuses(): HealthCheckResult[] {
    return Array.from(this.healthCache.values());
  }

  /**
   * Check if model is available
   */
  isModelAvailable(model: string): boolean {
    const health = this.healthCache.get(model);
    if (!health) return true; // Assume available if not checked yet

    // Consider available if status is healthy or degraded
    return health.status === HealthStatus.HEALTHY || health.status === HealthStatus.DEGRADED;
  }

  /**
   * Get server health information
   */
  async getServerHealth(): Promise<ServerHealth> {
    const serverOnline = await this.checkServer();
    const modelResults = await this.checkAllModels();

    // Determine overall status
    let overallStatus = HealthStatus.HEALTHY;
    if (!serverOnline) {
      overallStatus = HealthStatus.UNAVAILABLE;
    } else {
      const unhealthyCount = modelResults.filter(
        (r) => r.status === HealthStatus.UNHEALTHY || r.status === HealthStatus.UNAVAILABLE
      ).length;

      if (unhealthyCount === modelResults.length) {
        overallStatus = HealthStatus.UNAVAILABLE;
      } else if (unhealthyCount > 0) {
        overallStatus = HealthStatus.DEGRADED;
      }
    }

    return {
      serverUrl: this.config.serverUrl,
      online: serverOnline,
      lastChecked: Date.now(),
      models: modelResults,
      overallStatus,
    };
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks(): void {
    if (this.checkInterval) return;

    // Initial check
    this.checkAllModels();

    // Periodic checks
    this.checkInterval = setInterval(async () => {
      await this.checkAllModels();
    }, this.config.checkInterval);
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  /**
   * Generate health report
   */
  async generateHealthReport(): Promise<string> {
    const serverHealth = await this.getServerHealth();

    let report = '🏥 MODEL HEALTH STATUS\n';
    report += '═══════════════════════════════════════\n\n';

    report += `🌐 Server: ${serverHealth.serverUrl}\n`;
    report += `   Status: ${serverHealth.online ? '🟢 ONLINE' : '🔴 OFFLINE'}\n`;
    report += `   Overall: ${this.getStatusEmoji(serverHealth.overallStatus)} ${serverHealth.overallStatus.toUpperCase()}\n\n`;

    report += '📊 MODEL STATUS:\n\n';

    serverHealth.models.forEach((model) => {
      const modelName = model.model.split('/')[1] || model.model;
      report += `🤖 ${modelName.toUpperCase()}\n`;
      report += `   Status: ${this.getStatusEmoji(model.status)} ${model.status.toUpperCase()}\n`;
      report += `   Available: ${model.available ? '✅ Yes' : '❌ No'}\n`;

      if (model.responseTime) {
        report += `   Response Time: ${model.responseTime.toFixed(0)}ms\n`;
      }

      if (model.error) {
        report += `   Error: ${model.error}\n`;
      }

      const cacheAge = Date.now() - model.lastChecked;
      report += `   Last Checked: ${this.formatAge(cacheAge)} ago\n`;
      report += '\n';
    });

    return report;
  }

  /**
   * Get emoji for status
   */
  private getStatusEmoji(status: HealthStatus): string {
    switch (status) {
      case HealthStatus.HEALTHY:
        return '🟢';
      case HealthStatus.DEGRADED:
        return '🟡';
      case HealthStatus.UNHEALTHY:
        return '🟠';
      case HealthStatus.UNAVAILABLE:
        return '🔴';
      default:
        return '⚪';
    }
  }

  /**
   * Format age in human-readable format
   */
  private formatAge(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HealthCheckConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear health cache
   */
  clearCache(): void {
    this.healthCache.clear();
  }
}

// Singleton instance
export const healthMonitor = new ModelHealthMonitor();

/**
 * Check if model is healthy and available
 */
export async function isModelHealthy(model: string): Promise<boolean> {
  const result = await healthMonitor.checkModel(model);
  return result.available && result.status !== HealthStatus.UNAVAILABLE;
}

/**
 * Get available model with fallback
 */
export async function getAvailableModel(preferredModel: string): Promise<string> {
  const isHealthy = await isModelHealthy(preferredModel);
  
  if (isHealthy) {
    return preferredModel;
  }

  // Try fallback
  const fallback = getFallbackModel(preferredModel);
  const fallbackHealthy = await isModelHealthy(fallback);

  if (fallbackHealthy) {
    console.warn(`Model ${preferredModel} unavailable, using fallback: ${fallback}`);
    return fallback;
  }

  // If fallback also fails, return preferred (let it fail with proper error)
  console.error(`Both ${preferredModel} and fallback ${fallback} are unavailable`);
  return preferredModel;
}

/**
 * Execute with automatic fallback
 */
export async function executeWithFallback<T>(
  model: string,
  operation: (model: string) => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let currentModel = model;
  let attempts = 0;

  while (attempts <= maxRetries) {
    try {
      // Check if model is healthy before attempting
      if (attempts > 0) {
        currentModel = await getAvailableModel(currentModel);
      }

      return await operation(currentModel);
    } catch (error) {
      attempts++;

      if (attempts > maxRetries) {
        throw error;
      }

      // Try fallback on next attempt
      const fallback = getFallbackModel(currentModel);
      console.warn(`Attempt ${attempts} failed with ${currentModel}, trying fallback: ${fallback}`);
      currentModel = fallback;
    }
  }

  throw new Error('All attempts failed');
}

/**
 * Start monitoring (call this at app startup)
 */
export function startHealthMonitoring(intervalMs = 60000): void {
  healthMonitor.updateConfig({ checkInterval: intervalMs });
  healthMonitor.startPeriodicChecks();
}

/**
 * Stop monitoring (call this at app shutdown)
 */
export function stopHealthMonitoring(): void {
  healthMonitor.stopPeriodicChecks();
}
