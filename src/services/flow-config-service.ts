/**
 * Flow Configuration Service
 * Week 2 - Day 4-5: Database Services
 * 
 * Service for managing flow configurations in Firestore.
 * Provides CRUD operations and flow versioning.
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  type QueryConstraint
} from '@firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore: db } = initializeFirebase();
import type { FlowConfiguration, FlowStatus, FlowVersion } from '../lib/models/flow-config';
import { flowConfigCache } from '@/lib/cache/flow-config-cache';

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
  async createFlow(flow: Omit<FlowConfiguration, 'metadata'>): Promise<FlowConfiguration> {
    try {
      const now = new Date();
      const flowWithMetadata: FlowConfiguration = {
        ...flow,
        metadata: {
          createdAt: now,
          updatedAt: now,
          createdBy: flow.metadata?.createdBy || 'system',
          updatedBy: flow.metadata?.updatedBy || 'system',
          stats: {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            avgExecutionTime: 0,
          },
        },
      };

      const flowRef = doc(db, this.collectionName, flow.id);
      await setDoc(flowRef, this.toFirestore(flowWithMetadata));

      // Create initial version
      await this.createVersion(flow.id, {
        version: flow.version,
        changeDescription: 'Initial version',
        createdAt: now,
        createdBy: flowWithMetadata.metadata.createdBy,
        configuration: flowWithMetadata,
      });

      return flowWithMetadata;
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

      const flowRef = doc(db, this.collectionName, flowId);
      const flowSnap = await getDoc(flowRef);

      if (!flowSnap.exists()) {
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
      const flowRef = doc(db, this.collectionName, flowId);
      const flowSnap = await getDoc(flowRef);

      if (!flowSnap.exists()) {
        throw new Error(`Flow not found: ${flowId}`);
      }

      const currentFlow = this.fromFirestore(flowSnap.data());
      const now = new Date();

      // Increment version if steps or config changed
      let newVersion = currentFlow.version;
      if (updates.steps || updates.config) {
        const versionParts = currentFlow.version.split('.');
        versionParts[2] = String(Number(versionParts[2]) + 1);
        newVersion = versionParts.join('.');
      }

      const updatedFlow: FlowConfiguration = {
        ...currentFlow,
        ...updates,
        version: newVersion,
        metadata: {
          ...currentFlow.metadata,
          updatedAt: now,
          updatedBy: updates.metadata?.updatedBy || currentFlow.metadata.updatedBy,
        },
      };

      await updateDoc(flowRef, this.toFirestore(updatedFlow));

      // Create version snapshot
      if (newVersion !== currentFlow.version) {
        await this.createVersion(flowId, {
          version: newVersion,
          changeDescription: changeDescription || 'Flow updated',
          createdAt: now,
          createdBy: updatedFlow.metadata.updatedBy,
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
      const flowRef = doc(db, this.collectionName, flowId);
      await deleteDoc(flowRef);

      // Delete all versions
      const versionsRef = collection(db, this.collectionName, flowId, 'versions');
      const versionsSnap = await getDocs(versionsRef);
      
      const deletePromises = versionsSnap.docs.map(doc => deleteDoc(doc.ref));
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
      const constraints: QueryConstraint[] = [];

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.category) {
        constraints.push(where('metadata.category', '==', filters.category));
      }

      if (filters?.tags && filters.tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', filters.tags));
      }

      constraints.push(orderBy('metadata.updatedAt', 'desc'));

      if (filters?.limit) {
        constraints.push(firestoreLimit(filters.limit));
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

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
      const versionRef = doc(db, this.collectionName, flowId, 'versions', version.version);
      await setDoc(versionRef, {
        ...version,
        createdAt: Timestamp.fromDate(version.createdAt),
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
      const versionRef = doc(db, this.collectionName, flowId, 'versions', version);
      const versionSnap = await getDoc(versionRef);

      if (!versionSnap.exists()) {
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
      const versionsRef = collection(db, this.collectionName, flowId, 'versions');
      const q = query(versionsRef, orderBy('createdAt', 'desc'));
      const versionsSnap = await getDocs(q);

      return versionsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
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
      const flowRef = doc(db, this.collectionName, flowId);
      const flowSnap = await getDoc(flowRef);

      if (!flowSnap.exists()) {
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

      await updateDoc(flowRef, {
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
        createdAt: Timestamp.fromDate(flow.metadata.createdAt),
        updatedAt: Timestamp.fromDate(flow.metadata.updatedAt),
        stats: flow.metadata.stats ? {
          ...flow.metadata.stats,
          lastExecutedAt: flow.metadata.stats.lastExecutedAt 
            ? Timestamp.fromDate(flow.metadata.stats.lastExecutedAt)
            : null,
        } : undefined,
      },
    };
  }

  /**
   * Convert Firestore data to flow
   */
  private fromFirestore(data: any): FlowConfiguration {
    return {
      ...data,
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt.toDate(),
        updatedAt: data.metadata.updatedAt.toDate(),
        stats: data.metadata.stats ? {
          ...data.metadata.stats,
          lastExecutedAt: data.metadata.stats.lastExecutedAt?.toDate(),
        } : undefined,
      },
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
