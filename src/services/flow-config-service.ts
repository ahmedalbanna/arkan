/**
 * Flow Configuration Service
 * Week 2 - Day 4-5: Database Services
 * 
 * Service for managing flow configurations in Firestore.
 * Provides CRUD operations and flow versioning.
 * 
 * NOTE: This service uses Firebase Admin SDK for server-side operations.
 */

import { adminDb } from '@/lib/firebase/server-init';
import type { FlowConfiguration, FlowStatus, FlowVersion } from '../lib/models/flow-config';
import { flowConfigCache } from '@/lib/cache/flow-config-cache';

// Use Admin SDK Firestore instance
const db = adminDb;

// ============================================================================
// Flow Configuration Service
// ============================================================================

export class FlowConfigService {
  private readonly collectionName = 'flows';

  // ============================================================================
  // CRUD Operations
  // ============================================================================

/**
   * Create a new flow
   */
  async createFlow(flow: Partial<FlowConfiguration>): Promise<FlowConfiguration> {
    try {
      const now = new Date();
      const newFlowData: FlowConfiguration = {
        ...(flow as FlowConfiguration),
        createdAt: now,
        updatedAt: now,
        createdBy: flow.createdBy || 'system',
        updatedBy: flow.updatedBy || 'system',
        stats: {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          avgExecutionTime: 0,
        },
        version: flow.version || 1, // Default to version 1
        status: flow.status || 'draft',
      };

      const flowRef = db.collection(this.collectionName).doc(newFlowData.id);
      await flowRef.set(this.toFirestore(newFlowData));

      // Create initial version
      await this.createVersion(newFlowData.id, {
        version: newFlowData.version,
        changeDescription: 'Initial version',
        createdAt: now,
        createdBy: newFlowData.createdBy,
        configuration: newFlowData,
      });

      return newFlowData;
    } catch (error) {
      console.error('Error creating flow:', error);
      throw new Error(`Failed to create flow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a flow by ID
   */
  async getFlow(flowId: string, version?: string): Promise<FlowConfiguration | null> {
    try {
      if (version) {
        return this.getFlowVersion(flowId, version);
      }

      const flowRef = db.collection(this.collectionName).doc(flowId);
      const flowSnap = await flowRef.get();

      if (!flowSnap.exists) {
        return null;
      }

      return this.fromFirestore(flowSnap.data());
    } catch (error) {
      console.error('Error getting flow:', error);
      throw new Error(`Failed to get flow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

    /**
   * Update a flow
   */
  async updateFlow(
    flowId: string, 
    updates: Partial<FlowConfiguration>,
    changeDescription?: string
  ): Promise<FlowConfiguration> {
    try {
      const flowRef = db.collection(this.collectionName).doc(flowId);
      const flowSnap = await flowRef.get();

      if (!flowSnap.exists) {
        throw new Error(`Flow not found: ${flowId}`);
      }

      const currentFlow = this.fromFirestore(flowSnap.data());
      const now = new Date();

      // Increment version if significant parts of the flow changed
      let newVersion = currentFlow.version;
      if (updates.steps || updates.config || updates.inputSchema || updates.outputSchema) {
        newVersion = (currentFlow.version || 1) + 1;
      }

      const updatedFlow: FlowConfiguration = {
        ...currentFlow,
        ...updates,
        version: newVersion,
        updatedAt: now,
        updatedBy: updates.updatedBy || currentFlow.updatedBy, // Assumes updater is passed in updates
      };

      await flowRef.update(this.toFirestore(updatedFlow));

      // Create a new version snapshot if the version changed
      if (newVersion !== currentFlow.version) {
        await this.createVersion(flowId, {
          version: newVersion,
          changeDescription: changeDescription || 'Flow updated',
          createdAt: now,
          createdBy: updatedFlow.updatedBy, // The user who made the change
          configuration: updatedFlow,
        });
      }

      return updatedFlow;
    } catch (error) {
      console.error('Error updating flow:', error);
      throw new Error(`Failed to update flow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  /**
   * Delete a flow
   */
  async deleteFlow(flowId: string): Promise<void> {
    try {
      const flowRef = db.collection(this.collectionName).doc(flowId);
      await flowRef.delete();

      // Delete all versions
      const versionsRef = db.collection(this.collectionName).doc(flowId).collection('versions');
      const versionsSnap = await versionsRef.get();
      
      const deletePromises = versionsSnap.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting flow:', error);
      throw new Error(`Failed to delete flow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

    /**
   * List flows with filters
   */
  async listFlows(filters?: {
    status?: FlowStatus;
    category?: string;
    tags?: string[];
    limit?: number;
  }): Promise<FlowConfiguration[]> {
    try {
      let query = db.collection(this.collectionName);

      if (filters?.status) {
        query = query.where('status', '==', filters.status) as any;
      }

      // FIX: Query 'category' at the root level
      if (filters?.category) {
        query = query.where('category', '==', filters.category) as any;
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.where('tags', 'array-contains-any', filters.tags) as any;
      }

      // FIX: Order by 'updatedAt' at the root level
      query = query.orderBy('updatedAt', 'desc') as any;

      if (filters?.limit) {
        query = query.limit(filters.limit) as any;
      }

      const querySnapshot = await query.get();

      // FIX: The fromFirestore method also needs correction
      return querySnapshot.docs.map(doc => this.fromFirestore(doc.data()));
    } catch (error) {
      console.error('Error listing flows:', error);
      throw new Error(`Failed to list flows: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search flows
   */
  async searchFlows(searchTerm: string, limit: number = 20): Promise<FlowConfiguration[]> {
    try {
      // Note: Firestore doesn't support full-text search
      // This is a simple implementation using name/description matching
      const allFlows = await this.listFlows({ limit: 100 });

      const searchLower = searchTerm.toLowerCase();
      return allFlows
        .filter(flow => 
          flow.name.toLowerCase().includes(searchLower) ||
          flow.description.toLowerCase().includes(searchLower) ||
          flow.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error searching flows:', error);
      throw new Error(`Failed to search flows: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Version Management
  // ============================================================================

  /**
   * Create a version snapshot
   */
  private async createVersion(flowId: string, version: FlowVersion): Promise<void> {
    try {
      const versionRef = db.collection(this.collectionName).doc(flowId).collection('versions').doc(version.version);
      await versionRef.set({
        ...version,
        createdAt: version.createdAt,
        configuration: this.toFirestore(version.configuration),
      });
    } catch (error) {
      console.error('Error creating version:', error);
      throw new Error(`Failed to create version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific flow version
   */
  async getFlowVersion(flowId: string, version: string): Promise<FlowConfiguration | null> {
    try {
      const versionRef = db.collection(this.collectionName).doc(flowId).collection('versions').doc(version);
      const versionSnap = await versionRef.get();

      if (!versionSnap.exists) {
        return null;
      }

      const versionData = versionSnap.data() as FlowVersion;
      return this.fromFirestore(versionData.configuration as any);
    } catch (error) {
      console.error('Error getting flow version:', error);
      throw new Error(`Failed to get flow version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all versions of a flow
   */
  async listVersions(flowId: string): Promise<FlowVersion[]> {
    try {
      const versionsRef = db.collection(this.collectionName).doc(flowId).collection('versions');
      const versionsSnap = await versionsRef.orderBy('createdAt', 'desc').get();

      return versionsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt.toDate(),
          configuration: this.fromFirestore(data.configuration),
        } as FlowVersion;
      });
    } catch (error) {
      console.error('Error listing versions:', error);
      throw new Error(`Failed to list versions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rollback to a previous version
   */
  async rollbackToVersion(flowId: string, version: string): Promise<FlowConfiguration> {
    try {
      const versionFlow = await this.getFlowVersion(flowId, version);
      
      if (!versionFlow) {
        throw new Error(`Version not found: ${version}`);
      }

      return this.updateFlow(flowId, versionFlow, `Rolled back to version ${version}`);
    } catch (error) {
      console.error('Error rolling back version:', error);
      throw new Error(`Failed to rollback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Update flow execution statistics
   */
  async updateStats(flowId: string, success: boolean, executionTime: number): Promise<void> {
    try {
      const flowRef = db.collection(this.collectionName).doc(flowId);
      const flowSnap = await flowRef.get();

      if (!flowSnap.exists) {
        return;
      }

      const flow = this.fromFirestore(flowSnap.data());
      const stats = flow.metadata.stats || {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        avgExecutionTime: 0,
      };

      stats.totalExecutions++;
      if (success) {
        stats.successfulExecutions++;
      } else {
        stats.failedExecutions++;
      }

      // Update average execution time
      const totalTime = stats.avgExecutionTime * (stats.totalExecutions - 1);
      stats.avgExecutionTime = (totalTime + executionTime) / stats.totalExecutions;
      stats.lastExecutedAt = new Date();

      await flowRef.update({
        'metadata.stats': stats,
      });
    } catch (error) {
      console.error('Error updating stats:', error);
      // Don't throw - stats update is non-critical
    }
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Convert flow to Firestore format
   */
  private toFirestore(flow: FlowConfiguration): any {
    return {
      ...flow,
      metadata: {
        ...flow.metadata,
        createdAt: flow.metadata.createdAt,
        updatedAt: flow.metadata.updatedAt,
        stats: flow.metadata.stats ? {
          ...flow.metadata.stats,
          lastExecutedAt: flow.metadata.stats.lastExecutedAt || null,
        } : undefined,
      },
    };
  }

/**
   * Convert Firestore data to flow
   */
  private fromFirestore(data: any): FlowConfiguration {
    if (!data) return data;

    // Helper function to safely convert any value to a Date object
    const safeConvertToDate = (value: any): Date | undefined => {
      if (!value) {
        return undefined;
      }
      // Case 1: Already a JavaScript Date object
      if (value instanceof Date) {
        return value;
      }
      // Case 2: Firestore Timestamp object
      if (typeof value.toDate === 'function') {
        return value.toDate();
      }
      // Case 3: String or number representation of a date
      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        // Ensure the parsed date is valid
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      // If conversion fails, log a warning and return undefined
      console.warn('Could not convert value to a valid Date:', value);
      return undefined;
    };

    return {
      ...data,
      createdAt: safeConvertToDate(data.createdAt),
      updatedAt: safeConvertToDate(data.updatedAt),
      stats: data.stats ? {
          ...data.stats,
          lastExecutedAt: safeConvertToDate(data.stats.lastExecutedAt),
        } : undefined,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const flowConfigService = new FlowConfigService();

// ============================================================================
// Public API
// ============================================================================

export async function createFlow(flow: Omit<FlowConfiguration, 'metadata'>): Promise<FlowConfiguration> {
  return flowConfigService.createFlow(flow);
}

export async function getFlow(flowId: string, version?: string): Promise<FlowConfiguration | null> {
  return flowConfigService.getFlow(flowId, version);
}

export async function updateFlow(
  flowId: string,
  updates: Partial<FlowConfiguration>,
  changeDescription?: string
): Promise<FlowConfiguration> {
  return flowConfigService.updateFlow(flowId, updates, changeDescription);
}

export async function deleteFlow(flowId: string): Promise<void> {
  return flowConfigService.deleteFlow(flowId);
}

export async function listFlows(filters?: {
  status?: FlowStatus;
  category?: string;
  tags?: string[];
  limit?: number;
}): Promise<FlowConfiguration[]> {
  return flowConfigService.listFlows(filters);
}

export async function searchFlows(searchTerm: string, limit?: number): Promise<FlowConfiguration[]> {
  return flowConfigService.searchFlows(searchTerm, limit);
}

export async function listFlowVersions(flowId: string): Promise<FlowVersion[]> {
  return flowConfigService.listVersions(flowId);
}

export async function rollbackToVersion(flowId: string, version: string): Promise<FlowConfiguration> {
  return flowConfigService.rollbackToVersion(flowId, version);
}

export function getFlowConfigService(): FlowConfigService {
  return flowConfigService;
}
