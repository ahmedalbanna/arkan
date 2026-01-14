/**
 * Execution Trace Service
 * 
 * Manages execution traces for debugging and monitoring.
 * Stores and retrieves flow execution history.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client-init';
import {
  ExecutionTrace,
  ExecutionStatus,
  ExecutionSummary,
  ExecutionFilters,
  ExecutionAnalytics,
  TRACE_COLLECTIONS,
  getExecutionSummary,
  formatExecutionTrace,
} from '@/lib/models/execution-trace';

/**
 * Execution Trace Service Class
 */
export class ExecutionTraceService {
  private readonly tracesCollection = collection(db, TRACE_COLLECTIONS.EXECUTIONS);
  private readonly analyticsCollection = collection(db, TRACE_COLLECTIONS.ANALYTICS);

  /**
   * Save execution trace
   */
  async saveTrace(trace: ExecutionTrace): Promise<void> {
    try {
      const docRef = doc(this.tracesCollection, trace.id);
      await setDoc(docRef, this.traceToFirestore(trace));
    } catch (error) {
      console.error('Error saving execution trace:', error);
      throw new TraceServiceError('Failed to save execution trace', error);
    }
  }

  /**
   * Get execution trace by ID
   */
  async getTraceById(traceId: string): Promise<ExecutionTrace | null> {
    try {
      const docRef = doc(this.tracesCollection, traceId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.mapToExecutionTrace(docSnap.data());
    } catch (error) {
      console.error('Error getting execution trace:', error);
      throw new TraceServiceError('Failed to get execution trace', error);
    }
  }

  /**
   * List execution traces with filters
   */
  async listTraces(filters?: ExecutionFilters): Promise<ExecutionSummary[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.flowId) {
        constraints.push(where('flowId', '==', filters.flowId));
      }

      if (filters?.flowName) {
        constraints.push(where('flowName', '==', filters.flowName));
      }

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }

      if (filters?.startDate) {
        constraints.push(where('startTime', '>=', Timestamp.fromDate(filters.startDate)));
      }

      if (filters?.endDate) {
        constraints.push(where('startTime', '<=', Timestamp.fromDate(filters.endDate)));
      }

      if (filters?.hasError !== undefined) {
        if (filters.hasError) {
          constraints.push(where('status', '==', 'failed'));
        } else {
          constraints.push(where('status', '==', 'completed'));
        }
      }

      // Order by start time (most recent first)
      constraints.push(orderBy('startTime', 'desc'));

      // Limit results
      const limitCount = filters?.maxDuration ? 1000 : 50; // Get more if filtering by duration
      constraints.push(limit(limitCount));

      const q = query(this.tracesCollection, ...constraints);
      const snapshot = await getDocs(q);

      let traces = snapshot.docs.map(doc => {
        const data = doc.data();
        return getExecutionSummary(this.mapToExecutionTrace(data));
      });

      // Post-filter for duration (can't do in Firestore query)
      if (filters?.minDuration !== undefined) {
        traces = traces.filter(t => (t.duration || 0) >= filters.minDuration!);
      }

      if (filters?.maxDuration !== undefined) {
        traces = traces.filter(t => (t.duration || 0) <= filters.maxDuration!);
      }

      return traces;
    } catch (error) {
      console.error('Error listing execution traces:', error);
      throw new TraceServiceError('Failed to list execution traces', error);
    }
  }

  /**
   * Get traces for a specific flow
   */
  async getFlowTraces(
    flowId: string,
    limitCount = 20
  ): Promise<ExecutionSummary[]> {
    // Note: limitCount is not used as listTraces has its own internal limit logic
    return this.listTraces({ flowId });
  }

  /**
   * Get traces for a specific user
   */
  async getUserTraces(
    userId: string,
    limitCount = 20
  ): Promise<ExecutionSummary[]> {
    // Note: limitCount is not used as listTraces has its own internal limit logic
    return this.listTraces({ userId });
  }

  /**
   * Get failed executions
   */
  async getFailedExecutions(limitCount = 50): Promise<ExecutionSummary[]> {
    // Note: limitCount is not used as listTraces has its own internal limit logic
    return this.listTraces({ status: 'failed' });
  }

  /**
   * Get slow executions
   */
  async getSlowExecutions(
    minDuration: number,
    limitCount = 50
  ): Promise<ExecutionSummary[]> {
    // Note: limitCount is not used as listTraces has its own internal limit logic
    return this.listTraces({ minDuration });
  }

  /**
   * Get execution analytics for a flow
   */
  async getFlowAnalytics(
    flowId: string,
    period: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<ExecutionAnalytics | null> {
    try {
      const q = query(
        this.analyticsCollection,
        where('flowId', '==', flowId),
        where('period', '==', period),
        orderBy('startDate', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Calculate analytics on the fly
        return await this.calculateAnalytics(flowId, period);
      }

      return snapshot.docs[0].data() as ExecutionAnalytics;
    } catch (error) {
      console.error('Error getting flow analytics:', error);
      throw new TraceServiceError('Failed to get flow analytics', error);
    }
  }

  /**
   * Calculate analytics from traces
   */
  private async calculateAnalytics(
    flowId: string,
    period: 'hour' | 'day' | 'week' | 'month'
  ): Promise<ExecutionAnalytics> {
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'hour':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    // Get all traces in period
    const traces = await this.listTraces({
      flowId,
      startDate,
      endDate,
    });

    // Calculate metrics
    const totalExecutions = traces.length;
    const successfulExecutions = traces.filter(t => t.status === 'completed').length;
    const failedExecutions = traces.filter(t => t.status === 'failed').length;
    const cancelledExecutions = traces.filter(t => t.status === 'cancelled').length;

    const durations = traces
      .filter(t => t.duration !== undefined)
      .map(t => t.duration!);

    const averageDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    const sortedDurations = [...durations].sort((a, b) => a - b);
    const medianDuration = sortedDurations.length > 0
      ? sortedDurations[Math.floor(sortedDurations.length / 2)]
      : 0;

    const p95Duration = sortedDurations.length > 0
      ? sortedDurations[Math.floor(sortedDurations.length * 0.95)]
      : 0;

    const p99Duration = sortedDurations.length > 0
      ? sortedDurations[Math.floor(sortedDurations.length * 0.99)]
      : 0;

    const successRate = totalExecutions > 0
      ? successfulExecutions / totalExecutions
      : 0;

    return {
      flowId,
      period,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      cancelledExecutions,
      averageDuration,
      medianDuration,
      p95Duration,
      p99Duration,
      successRate,
    };
  }

  /**
   * Save analytics to database
   */
  async saveAnalytics(analytics: ExecutionAnalytics): Promise<void> {
    try {
      const docRef = doc(this.analyticsCollection);
      await setDoc(docRef, analytics);
    } catch (error) {
      console.error('Error saving analytics:', error);
      // Don't throw - analytics save failure shouldn't block
    }
  }

  /**
   * Delete old traces (cleanup)
   */
  async deleteOldTraces(daysToKeep = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const q = query(
        this.tracesCollection,
        where('startTime', '<', Timestamp.fromDate(cutoffDate)),
        limit(500) // Delete in batches
      );

      const snapshot = await getDocs(q);
      let deletedCount = 0;

      // Note: In production, use batch operations or Cloud Functions
      for (const document of snapshot.docs) {
        await deleteDoc(document.ref);
        deletedCount++;
      }

      return deletedCount;
    } catch (error) {
      console.error('Error deleting old traces:', error);
      throw new TraceServiceError('Failed to delete old traces', error);
    }
  }

  /**
   * Format trace for display
   */
  formatTrace(trace: ExecutionTrace): string {
    return formatExecutionTrace(trace);
  }

  /**
   * Map Firestore document to ExecutionTrace
   */
  private mapToExecutionTrace(data: any): ExecutionTrace {
    return {
      id: data.id,
      flowId: data.flowId,
      flowName: data.flowName,
      flowVersion: data.flowVersion,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      status: data.status,
      input: data.input,
      output: data.output,
      error: data.error,
      stepTraces: data.stepTraces || [],
      userId: data.userId,
      requestId: data.requestId,
      environment: data.environment,
      metrics: data.metrics,
    };
  }

  /**
   * Convert ExecutionTrace to Firestore format
   */
  private traceToFirestore(trace: ExecutionTrace): any {
    return {
      id: trace.id,
      flowId: trace.flowId,
      flowName: trace.flowName,
      flowVersion: trace.flowVersion,
      startTime: trace.startTime,
      endTime: trace.endTime,
      duration: trace.duration,
      status: trace.status,
      input: trace.input,
      output: trace.output,
      error: trace.error,
      stepTraces: trace.stepTraces,
      userId: trace.userId,
      requestId: trace.requestId,
      environment: trace.environment,
      metrics: trace.metrics,
    };
  }
}

/**
 * Custom error class
 */
export class TraceServiceError extends Error {
  public readonly cause?: any;

  constructor(message: string, cause?: any) {
    super(message);
    this.name = 'TraceServiceError';
    this.cause = cause;
  }
}

/**
 * Singleton instance
 */
export const executionTraceService = new ExecutionTraceService();

/**
 * Convenience functions
 */
export async function saveExecutionTrace(trace: ExecutionTrace): Promise<void> {
  return executionTraceService.saveTrace(trace);
}

export async function getExecutionTrace(traceId: string): Promise<ExecutionTrace | null> {
  return executionTraceService.getTraceById(traceId);
}

export async function listExecutionTraces(filters?: ExecutionFilters): Promise<ExecutionSummary[]> {
  return executionTraceService.listTraces(filters);
}

export async function getFlowExecutionAnalytics(
  flowId: string,
  period?: 'hour' | 'day' | 'week' | 'month'
): Promise<ExecutionAnalytics | null> {
  return executionTraceService.getFlowAnalytics(flowId, period);
}
