/**
 * Model Request Queue Manager
 * 
 * Manages request queuing and concurrency limits for different models.
 * Prevents memory overload by controlling concurrent requests per model.
 */

import { OLLAMA_MODELS } from '../../domain/constants/AiModels';
import { getMaxConcurrentRequests } from './model-selector';
import { performanceMonitor } from './model-performance-monitor';

/**
 * Default request timeout in milliseconds (60 seconds)
 * Prevents queue deadlocks if a model hangs during loading or generation.
 */
export const DEFAULT_REQUEST_TIMEOUT = Number(process.env.AI_REQUEST_TIMEOUT) || 60000;

/**
 * Request priority levels
 */
export enum RequestPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
}

/**
 * Queued request information
 */
interface QueuedRequest<T> {
  id: string;
  model: string;
  flowName?: string;
  priority: RequestPriority;
  operation: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  queuedAt: number;
  timeout?: number;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  model: string;
  queuedRequests: number;
  activeRequests: number;
  maxConcurrent: number;
  averageWaitTime: number;
  totalProcessed: number;
}

/**
 * Request queue manager for a specific model
 */
class ModelQueue {
  private queue: QueuedRequest<any>[] = [];
  private activeRequests = 0;
  private maxConcurrent: number;
  private model: string;
  private totalProcessed = 0;
  private totalWaitTime = 0;

  constructor(model: string, maxConcurrent?: number) {
    this.model = model;
    this.maxConcurrent = maxConcurrent || getMaxConcurrentRequests(model);
  }

  /**
   * Add request to queue
   */
  async enqueue<T>(
    id: string,
    flowName: string | undefined,
    operation: () => Promise<T>,
    priority: RequestPriority = RequestPriority.NORMAL,
    timeout?: number
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id,
        model: this.model,
        flowName,
        priority,
        operation,
        resolve,
        reject,
        queuedAt: Date.now(),
        timeout: timeout || DEFAULT_REQUEST_TIMEOUT,
      };

      // Insert based on priority
      const insertIndex = this.queue.findIndex((r) => r.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(request);
      } else {
        this.queue.splice(insertIndex, 0, request);
      }

      // Try to process immediately
      this.processNext();
    });
  }

  /**
   * Process next request in queue
   */
  private async processNext(): Promise<void> {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.activeRequests++;
    const waitTime = Date.now() - request.queuedAt;
    this.totalWaitTime += waitTime;

    try {
      // Check timeout
      if (request.timeout && waitTime > request.timeout) {
        throw new Error(`Request timeout: waited ${waitTime}ms, max ${request.timeout}ms`);
      }

      performanceMonitor.startRequest(request.id, this.model, request.flowName);
      
      // Execute with timeout wrapper
      const executionPromise = request.operation();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Execution timeout: ${request.model} failed to respond within ${request.timeout}ms`)), request.timeout);
      });

      const result = await Promise.race([executionPromise, timeoutPromise]);
      performanceMonitor.endRequest(request.id, true);
      
      request.resolve(result);
      this.totalProcessed++;
    } catch (error) {
      performanceMonitor.endRequest(
        request.id,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      request.reject(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      this.activeRequests--;
      // Process next request
      this.processNext();
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      model: this.model,
      queuedRequests: this.queue.length,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent,
      averageWaitTime: this.totalProcessed > 0 ? this.totalWaitTime / this.totalProcessed : 0,
      totalProcessed: this.totalProcessed,
    };
  }

  /**
   * Update max concurrent requests
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = max;
    // Try to process queued requests with new limit
    this.processNext();
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue.forEach((req) => {
      req.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Get active request count
   */
  getActiveCount(): number {
    return this.activeRequests;
  }
}

/**
 * Global queue manager for all models
 */
class QueueManager {
  private queues: Map<string, ModelQueue> = new Map();

  constructor() {
    // Initialize queues for each model
    this.queues.set(OLLAMA_MODELS.GEMMA_2B, new ModelQueue(OLLAMA_MODELS.GEMMA_2B, 5));
    this.queues.set(OLLAMA_MODELS.PHI3_MINI, new ModelQueue(OLLAMA_MODELS.PHI3_MINI, 3));
    this.queues.set(OLLAMA_MODELS.LLAMA3_8B, new ModelQueue(OLLAMA_MODELS.LLAMA3_8B, 1));
  }

  /**
   * Execute request with queue management
   */
  async executeWithQueue<T>(
    requestId: string,
    model: string,
    flowName: string | undefined,
    operation: () => Promise<T>,
    priority: RequestPriority = RequestPriority.NORMAL,
    timeout?: number
  ): Promise<T> {
    let queue = this.queues.get(model);

    // Create queue if it doesn't exist
    if (!queue) {
      queue = new ModelQueue(model);
      this.queues.set(model, queue);
    }

    return queue.enqueue(requestId, flowName, operation, priority, timeout);
  }

  /**
   * Get statistics for all queues
   */
  getAllStats(): QueueStats[] {
    return Array.from(this.queues.values()).map((queue) => queue.getStats());
  }

  /**
   * Get statistics for specific model
   */
  getModelStats(model: string): QueueStats | null {
    const queue = this.queues.get(model);
    return queue ? queue.getStats() : null;
  }

  /**
   * Update max concurrent requests for a model
   */
  setMaxConcurrent(model: string, max: number): void {
    const queue = this.queues.get(model);
    if (queue) {
      queue.setMaxConcurrent(max);
    }
  }

  /**
   * Clear all queues
   */
  clearAll(): void {
    this.queues.forEach((queue) => queue.clear());
  }

  /**
   * Clear specific model queue
   */
  clearModel(model: string): void {
    const queue = this.queues.get(model);
    if (queue) {
      queue.clear();
    }
  }

  /**
   * Get total queued requests across all models
   */
  getTotalQueued(): number {
    return Array.from(this.queues.values()).reduce(
      (sum, queue) => sum + queue.getQueueLength(),
      0
    );
  }

  /**
   * Get total active requests across all models
   */
  getTotalActive(): number {
    return Array.from(this.queues.values()).reduce(
      (sum, queue) => sum + queue.getActiveCount(),
      0
    );
  }

  /**
   * Generate queue status report
   */
  generateReport(): string {
    const stats = this.getAllStats();
    
    let report = '📋 REQUEST QUEUE STATUS\n';
    report += '═══════════════════════════════════════\n\n';

    stats.forEach((stat) => {
      const modelName = stat.model.split('/')[1] || stat.model;
      report += `🤖 ${modelName.toUpperCase()}\n`;
      report += `   Queued: ${stat.queuedRequests} requests\n`;
      report += `   Active: ${stat.activeRequests}/${stat.maxConcurrent}\n`;
      report += `   Total Processed: ${stat.totalProcessed}\n`;
      report += `   Avg Wait Time: ${stat.averageWaitTime.toFixed(0)}ms\n`;
      
      // Status indicator
      const utilization = stat.activeRequests / stat.maxConcurrent;
      if (utilization >= 1.0) {
        report += `   Status: 🔴 FULL (${(utilization * 100).toFixed(0)}% utilization)\n`;
      } else if (utilization >= 0.7) {
        report += `   Status: 🟡 BUSY (${(utilization * 100).toFixed(0)}% utilization)\n`;
      } else {
        report += `   Status: 🟢 AVAILABLE (${(utilization * 100).toFixed(0)}% utilization)\n`;
      }
      
      report += '\n';
    });

    report += `📊 OVERALL: ${this.getTotalQueued()} queued, ${this.getTotalActive()} active\n`;

    return report;
  }

  /**
   * Check if model is available for immediate execution
   */
  isAvailable(model: string): boolean {
    const queue = this.queues.get(model);
    if (!queue) return true;

    const stats = queue.getStats();
    return stats.activeRequests < stats.maxConcurrent && stats.queuedRequests === 0;
  }

  /**
   * Get estimated wait time for a model
   */
  getEstimatedWaitTime(model: string): number {
    const queue = this.queues.get(model);
    if (!queue) return 0;

    const stats = queue.getStats();
    if (stats.queuedRequests === 0) return 0;

    // Estimate based on average wait time and queue position
    return stats.averageWaitTime * (stats.queuedRequests / stats.maxConcurrent);
  }
}

// Singleton instance
export const queueManager = new QueueManager();

/**
 * Helper function to execute request with automatic queue management
 */
export async function executeWithQueue<T>(
  requestId: string,
  model: string,
  flowName: string | undefined,
  operation: () => Promise<T>,
  options?: {
    priority?: RequestPriority;
    timeout?: number;
  }
): Promise<T> {
  return queueManager.executeWithQueue(
    requestId,
    model,
    flowName,
    operation,
    options?.priority || RequestPriority.NORMAL,
    options?.timeout
  );
}

/**
 * Check if a request should be queued
 */
export function shouldQueueRequest(model: string): boolean {
  return !queueManager.isAvailable(model);
}

/**
 * Get queue position for next request
 */
export function getQueuePosition(model: string): number {
  const stats = queueManager.getModelStats(model);
  return stats ? stats.queuedRequests + 1 : 1;
}
