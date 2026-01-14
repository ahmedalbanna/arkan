/**
 * Execution Trace Service
 * Week 2 - Day 2: Execution Trace Service
 * 
 * Manages execution traces in Firestore for:
 * - Monitoring flow executions
 * - Debugging and troubleshooting
 * - Analytics and metrics
 * - Performance tracking
 */

import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import type { ExecutionResult, ExecutionMetrics } from '../ai/dynamic-flow/executor';

// ============================================================================
// Execution Trace Service
// ============================================================================

export class ExecutionTraceService {
  private db = getFirestore();
  private collectionName = 'execution_traces';
  private statsCollection = 'flow_statistics';

  // ============================================================================
  // Trace Management
  // ============================================================================

  /**
   * Start a new execution trace
   */
  async startTrace(
    flowId: string,
    flowVersion: string,
    input: any,
    options?: TraceOptions
  ): Promise<ExecutionTrace> {
    try {
      const traceId = this.generateTraceId();
      const now = new Date();

      const trace: ExecutionTrace = {
        id: traceId,
        flowId,
        flowVersion,
        input,
        status: 'running',
        startTime: now,
        userId: options?.userId,
        sessionId: options?.sessionId,
        steps: [],
        context: {},
        metrics: {
          totalTokens: 0,
          totalCost: 0,
          cacheHits: 0,
          cacheMisses: 0
        }
      };

      // Store in Firestore
      await this.db.collection(this.collectionName).doc(traceId).set({
        ...trace,
        startTime: Timestamp.fromDate(now)
      });

      return trace;
    } catch (error) {
      throw new Error(`Failed to start trace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete an execution trace
   */
  async completeTrace(
    traceId: string,
    result: {
      status: 'success' | 'error' | 'timeout';
      output?: any;
      error?: any;
      metrics?: ExecutionMetrics;
    }
  ): Promise<void> {
    try {
      const now = new Date();
      const traceRef = this.db.collection(this.collectionName).doc(traceId);
      
      // Get current trace to calculate duration
      const traceDoc = await traceRef.get();
      if (!traceDoc.exists) {
        throw new Error(`Trace ${traceId} not found`);
      }

      const traceData = traceDoc.data()!;
      const startTime = traceData.startTime?.toDate() || now;
      const duration = now.getTime() - startTime.getTime();

      // Update trace
      await traceRef.update({
        status: result.status,
        output: result.output,
        error: result.error ? {
          message: result.error.message || String(result.error),
          stack: result.error.stack,
          name: result.error.name
        } : null,
        endTime: Timestamp.fromDate(now),
        duration,
        metrics: result.metrics || traceData.metrics
      });

      // Update flow statistics
      await this.updateFlowStatistics(traceData.flowId, {
        status: result.status,
        duration,
        metrics: result.metrics
      });
    } catch (error) {
      console.error('Failed to complete trace:', error);
      throw new Error(`Failed to complete trace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Record a successful step execution
   */
  async recordStepSuccess(
    traceId: string,
    stepId: string,
    result: StepTraceResult
  ): Promise<void> {
    try {
      const stepTrace: StepTrace = {
        stepId,
        stepName: result.stepName || stepId,
        startTime: result.startTime || new Date(),
        endTime: result.endTime || new Date(),
        duration: result.duration || 0,
        status: 'success',
        input: result.input,
        output: result.output,
        metrics: result.metrics
      };

      await this.db.collection(this.collectionName).doc(traceId).update({
        steps: FieldValue.arrayUnion(stepTrace)
      });
    } catch (error) {
      console.error('Failed to record step success:', error);
    }
  }

  /**
   * Record a step error
   */
  async recordStepError(
    traceId: string,
    stepId: string,
    error: Error
  ): Promise<void> {
    try {
      const stepTrace: StepTrace = {
        stepId,
        stepName: stepId,
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        status: 'error',
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      };

      await this.db.collection(this.collectionName).doc(traceId).update({
        steps: FieldValue.arrayUnion(stepTrace)
      });
    } catch (err) {
      console.error('Failed to record step error:', err);
    }
  }

  /**
   * Record a skipped step
   */
  async recordSkippedStep(traceId: string, stepId: string): Promise<void> {
    try {
      const stepTrace: StepTrace = {
        stepId,
        stepName: stepId,
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        status: 'skipped'
      };

      await this.db.collection(this.collectionName).doc(traceId).update({
        steps: FieldValue.arrayUnion(stepTrace)
      });
    } catch (error) {
      console.error('Failed to record skipped step:', error);
    }
  }

  /**
   * Record a step attempt (for retries)
   */
  async recordStepAttempt(
    traceId: string,
    stepId: string,
    attempt: number,
    error: any
  ): Promise<void> {
    try {
      await this.db.collection(this.collectionName).doc(traceId).update({
        [`attempts.${stepId}`]: FieldValue.arrayUnion({
          attempt,
          timestamp: Timestamp.now(),
          error: error.message || String(error)
        })
      });
    } catch (err) {
      console.error('Failed to record step attempt:', err);
    }
  }

  // ============================================================================
  // Query Traces
  // ============================================================================

  /**
   * Get trace by ID
   */
  async getTrace(traceId: string): Promise<ExecutionTrace | null> {
    try {
      const doc = await this.db.collection(this.collectionName).doc(traceId).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      return {
        ...data,
        startTime: data.startTime?.toDate() || new Date(),
        endTime: data.endTime?.toDate()
      } as ExecutionTrace;
    } catch (error) {
      throw new Error(`Failed to get trace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List traces with filtering
   */
  async listTraces(options: ListTracesOptions = {}): Promise<ListTracesResult> {
    try {
      const {
        flowId,
        userId,
        status,
        startDate,
        endDate,
        limit = 50,
        offset = 0
      } = options;

      let query = this.db.collection(this.collectionName) as any;

      // Apply filters
      if (flowId) {
        query = query.where('flowId', '==', flowId);
      }

      if (userId) {
        query = query.where('userId', '==', userId);
      }

      if (status) {
        query = query.where('status', '==', status);
      }

      if (startDate) {
        query = query.where('startTime', '>=', Timestamp.fromDate(startDate));
      }

      if (endDate) {
        query = query.where('startTime', '<=', Timestamp.fromDate(endDate));
      }

      // Order by start time (descending)
      query = query.orderBy('startTime', 'desc');

      // Get total count
      const countSnapshot = await query.get();
      const total = countSnapshot.size;

      // Apply pagination
      query = query.offset(offset).limit(limit);
      const snapshot = await query.get();

      const traces: ExecutionTrace[] = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate()
        };
      });

      return {
        traces,
        total,
        limit,
        offset,
        hasMore: offset + traces.length < total
      };
    } catch (error) {
      throw new Error(`Failed to list traces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recent traces for a flow
   */
  async getRecentTraces(flowId: string, limit: number = 100): Promise<ExecutionTrace[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where('flowId', '==', flowId)
        .orderBy('startTime', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate()
        } as ExecutionTrace;
      });
    } catch (error) {
      throw new Error(`Failed to get recent traces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  /**
   * Get execution analytics for a flow
   */
  async getFlowAnalytics(
    flowId: string,
    options: AnalyticsOptions = {}
  ): Promise<FlowAnalytics> {
    try {
      const { startDate, endDate, limit = 1000 } = options;

      let query = this.db
        .collection(this.collectionName)
        .where('flowId', '==', flowId) as any;

      if (startDate) {
        query = query.where('startTime', '>=', Timestamp.fromDate(startDate));
      }

      if (endDate) {
        query = query.where('startTime', '<=', Timestamp.fromDate(endDate));
      }

      query = query.limit(limit);
      const snapshot = await query.get();

      const traces = snapshot.docs.map((doc: any) => doc.data());

      // Calculate analytics
      const totalExecutions = traces.length;
      const successful = traces.filter((t: any) => t.status === 'success').length;
      const failed = traces.filter((t: any) => t.status === 'error').length;
      const durations = traces.filter((t: any) => t.duration).map((t: any) => t.duration);
      const tokens = traces.filter((t: any) => t.metrics?.totalTokens).map((t: any) => t.metrics.totalTokens);
      const costs = traces.filter((t: any) => t.metrics?.totalCost).map((t: any) => t.metrics.totalCost);

      return {
        flowId,
        totalExecutions,
        successfulExecutions: successful,
        failedExecutions: failed,
        successRate: totalExecutions > 0 ? successful / totalExecutions : 0,
        avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
        minDuration: durations.length > 0 ? Math.min(...durations) : 0,
        maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
        p50Duration: this.percentile(durations, 50),
        p95Duration: this.percentile(durations, 95),
        p99Duration: this.percentile(durations, 99),
        totalTokens: tokens.reduce((a, b) => a + b, 0),
        totalCost: costs.reduce((a, b) => a + b, 0),
        avgTokens: tokens.length > 0 ? tokens.reduce((a, b) => a + b, 0) / tokens.length : 0,
        avgCost: costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0
      };
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Statistics Updates
  // ============================================================================

  /**
   * Update flow statistics
   */
  private async updateFlowStatistics(
    flowId: string,
    execution: {
      status: string;
      duration: number;
      metrics?: ExecutionMetrics;
    }
  ): Promise<void> {
    try {
      const statsRef = this.db.collection(this.statsCollection).doc(flowId);

      await this.db.runTransaction(async (transaction) => {
        const doc = await transaction.get(statsRef);

        if (!doc.exists) {
          // Create new stats document
          transaction.set(statsRef, {
            flowId,
            totalExecutions: 1,
            successfulExecutions: execution.status === 'success' ? 1 : 0,
            failedExecutions: execution.status === 'error' ? 1 : 0,
            avgDuration: execution.duration,
            totalTokens: execution.metrics?.totalTokens || 0,
            totalCost: execution.metrics?.totalCost || 0,
            lastExecuted: Timestamp.now()
          });
        } else {
          // Update existing stats
          const data = doc.data()!;
          const totalExec = data.totalExecutions + 1;

          transaction.update(statsRef, {
            totalExecutions: totalExec,
            successfulExecutions: data.successfulExecutions + (execution.status === 'success' ? 1 : 0),
            failedExecutions: data.failedExecutions + (execution.status === 'error' ? 1 : 0),
            avgDuration: (data.avgDuration * data.totalExecutions + execution.duration) / totalExec,
            totalTokens: data.totalTokens + (execution.metrics?.totalTokens || 0),
            totalCost: data.totalCost + (execution.metrics?.totalCost || 0),
            lastExecuted: Timestamp.now()
          });
        }
      });
    } catch (error) {
      console.error('Failed to update flow statistics:', error);
    }
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Generate unique trace ID
   */
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate percentile
   */
  private percentile(numbers: number[], p: number): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Delete old traces (cleanup)
   */
  async deleteOldTraces(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const snapshot = await this.db
        .collection(this.collectionName)
        .where('startTime', '<', Timestamp.fromDate(cutoffDate))
        .limit(500)
        .get();

      const batch = this.db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();

      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to delete old traces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ExecutionTrace {
  id: string;
  flowId: string;
  flowVersion: string;
  input: any;
  output?: any;
  error?: any;
  status: 'running' | 'success' | 'error' | 'timeout';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  userId?: string;
  sessionId?: string;
  steps: StepTrace[];
  context: Record<string, any>;
  metrics: {
    totalTokens: number;
    totalCost: number;
    cacheHits: number;
    cacheMisses: number;
  };
}

export interface StepTrace {
  stepId: string;
  stepName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'success' | 'error' | 'skipped';
  input?: any;
  output?: any;
  error?: any;
  metrics?: any;
}

export interface StepTraceResult {
  stepName?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  input?: any;
  output?: any;
  metrics?: any;
}

export interface TraceOptions {
  userId?: string;
  sessionId?: string;
}

export interface ListTracesOptions {
  flowId?: string;
  userId?: string;
  status?: 'running' | 'success' | 'error' | 'timeout';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ListTracesResult {
  traces: ExecutionTrace[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface AnalyticsOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface FlowAnalytics {
  flowId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  totalTokens: number;
  totalCost: number;
  avgTokens: number;
  avgCost: number;
}

// ============================================================================
// Singleton Instance
// ============================================================================

let executionTraceServiceInstance: ExecutionTraceService | null = null;

export function getExecutionTraceService(): ExecutionTraceService {
  if (!executionTraceServiceInstance) {
    executionTraceServiceInstance = new ExecutionTraceService();
  }
  return executionTraceServiceInstance;
}
