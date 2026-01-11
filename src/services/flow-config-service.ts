/**
 * Flow Configuration Service
 * 
 * CRUD operations for flow configurations stored in Firestore.
 * Handles flow creation, updates, versioning, and retrieval.
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
  limit,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client-init';
import { 
  FlowConfiguration, 
  FlowVersion, 
  FlowStatus,
  FLOW_COLLECTIONS,
  validateFlowConfiguration,
  createFlowConfiguration,
} from '@/lib/models/flow-config';

/**
 * Flow Configuration Service Class
 */
export class FlowConfigService {
  private readonly flowsCollection = collection(db, FLOW_COLLECTIONS.CONFIGURATIONS);
  private readonly versionsCollection = collection(db, FLOW_COLLECTIONS.VERSIONS);

  /**
   * Get flow configuration by name
   */
  async getFlowByName(flowName: string): Promise<FlowConfiguration | null> {
    try {
      const q = query(
        this.flowsCollection,
        where('name', '==', flowName),
        where('status', '==', 'active'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const docData = snapshot.docs[0].data();
      return this.mapToFlowConfiguration(snapshot.docs[0].id, docData);
    } catch (error) {
      console.error('Error getting flow by name:', error);
      throw new FlowServiceError('Failed to get flow by name', error);
    }
  }

  /**
   * Get flow configuration by ID
   */
  async getFlowById(flowId: string): Promise<FlowConfiguration | null> {
    try {
      const docRef = doc(this.flowsCollection, flowId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return this.mapToFlowConfiguration(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Error getting flow by ID:', error);
      throw new FlowServiceError('Failed to get flow by ID', error);
    }
  }

  /**
   * List all flows with optional filters
   */
  async listFlows(filters?: FlowFilters): Promise<FlowConfiguration[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }
      
      if (filters?.category) {
        constraints.push(where('category', '==', filters.category));
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', filters.tags));
      }
      
      // Order by creation date (most recent first)
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (filters?.limit) {
        constraints.push(limit(filters.limit));
      }
      
      const q = query(this.flowsCollection, ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        this.mapToFlowConfiguration(doc.id, doc.data())
      );
    } catch (error) {
      console.error('Error listing flows:', error);
      throw new FlowServiceError('Failed to list flows', error);
    }
  }

  /**
   * Create a new flow configuration
   */
  async createFlow(
    flow: Partial<FlowConfiguration>,
    userId: string
  ): Promise<FlowConfiguration> {
    try {
      // Validate flow configuration
      const errors = validateFlowConfiguration(flow);
      if (errors.length > 0) {
        throw new ValidationError('Flow validation failed', errors);
      }
      
      // Check if flow with same name already exists
      const existing = await this.getFlowByName(flow.name!);
      if (existing) {
        throw new FlowAlreadyExistsError(flow.name!);
      }
      
      // Create flow configuration with defaults
      const flowConfig = createFlowConfiguration({
        ...flow,
        createdBy: userId,
      });
      
      // Create new document
      const docRef = doc(this.flowsCollection);
      const now = Timestamp.now();
      
      const flowData: FlowConfiguration = {
        ...flowConfig,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      } as FlowConfiguration;
      
      await setDoc(docRef, this.flowToFirestore(flowData));
      
      // Create initial version
      await this.createVersion(flowData, userId, 'Initial version');
      
      return flowData;
    } catch (error) {
      console.error('Error creating flow:', error);
      if (error instanceof FlowServiceError) {
        throw error;
      }
      throw new FlowServiceError('Failed to create flow', error);
    }
  }

  /**
   * Update flow configuration
   */
  async updateFlow(
    flowId: string,
    updates: Partial<FlowConfiguration>,
    userId: string,
    versionMessage?: string
  ): Promise<FlowConfiguration> {
    try {
      const docRef = doc(this.flowsCollection, flowId);
      const existing = await this.getFlowById(flowId);
      
      if (!existing) {
        throw new FlowNotFoundError(flowId);
      }
      
      // Validate updated configuration
      const updatedFlow = { ...existing, ...updates };
      const errors = validateFlowConfiguration(updatedFlow);
      if (errors.length > 0) {
        throw new ValidationError('Flow validation failed', errors);
      }
      
      // Increment version
      const newVersion = existing.version + 1;
      
      const updateData = {
        ...updates,
        version: newVersion,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(docRef, this.flowToFirestore(updateData));
      
      // Create version snapshot
      const updatedFlowConfig = { ...existing, ...updateData };
      await this.createVersion(updatedFlowConfig, userId, versionMessage);
      
      return updatedFlowConfig;
    } catch (error) {
      console.error('Error updating flow:', error);
      if (error instanceof FlowServiceError) {
        throw error;
      }
      throw new FlowServiceError('Failed to update flow', error);
    }
  }

  /**
   * Update flow status
   */
  async updateFlowStatus(
    flowId: string,
    status: FlowStatus,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(this.flowsCollection, flowId);
      const existing = await this.getFlowById(flowId);
      
      if (!existing) {
        throw new FlowNotFoundError(flowId);
      }
      
      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
      };
      
      if (status === 'active' && !existing.publishedAt) {
        updateData.publishedAt = Timestamp.now();
      }
      
      await updateDoc(docRef, updateData);
      
      // Create version snapshot for status change
      await this.createVersion(
        { ...existing, status },
        userId,
        `Status changed to ${status}`
      );
    } catch (error) {
      console.error('Error updating flow status:', error);
      if (error instanceof FlowServiceError) {
        throw error;
      }
      throw new FlowServiceError('Failed to update flow status', error);
    }
  }

  /**
   * Delete flow configuration
   */
  async deleteFlow(flowId: string): Promise<void> {
    try {
      const docRef = doc(this.flowsCollection, flowId);
      const existing = await this.getFlowById(flowId);
      
      if (!existing) {
        throw new FlowNotFoundError(flowId);
      }
      
      // Soft delete by setting status to archived
      await this.updateFlowStatus(flowId, 'archived', 'system');
      
      // Optionally, hard delete if needed
      // await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting flow:', error);
      if (error instanceof FlowServiceError) {
        throw error;
      }
      throw new FlowServiceError('Failed to delete flow', error);
    }
  }

  /**
   * Get flow versions
   */
  async getFlowVersions(flowId: string, limitCount = 10): Promise<FlowVersion[]> {
    try {
      const q = query(
        this.versionsCollection,
        where('flowId', '==', flowId),
        orderBy('version', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => doc.data() as FlowVersion);
    } catch (error) {
      console.error('Error getting flow versions:', error);
      throw new FlowServiceError('Failed to get flow versions', error);
    }
  }

  /**
   * Get specific flow version
   */
  async getFlowVersion(flowId: string, version: number): Promise<FlowVersion | null> {
    try {
      const q = query(
        this.versionsCollection,
        where('flowId', '==', flowId),
        where('version', '==', version),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      return snapshot.docs[0].data() as FlowVersion;
    } catch (error) {
      console.error('Error getting flow version:', error);
      throw new FlowServiceError('Failed to get flow version', error);
    }
  }

  /**
   * Restore flow to previous version
   */
  async restoreFlowVersion(
    flowId: string,
    version: number,
    userId: string
  ): Promise<FlowConfiguration> {
    try {
      const versionData = await this.getFlowVersion(flowId, version);
      
      if (!versionData) {
        throw new FlowVersionNotFoundError(flowId, version);
      }
      
      // Update flow with version data
      return await this.updateFlow(
        flowId,
        versionData.configuration,
        userId,
        `Restored to version ${version}`
      );
    } catch (error) {
      console.error('Error restoring flow version:', error);
      if (error instanceof FlowServiceError) {
        throw error;
      }
      throw new FlowServiceError('Failed to restore flow version', error);
    }
  }

  /**
   * Create version snapshot
   */
  private async createVersion(
    flowConfig: FlowConfiguration,
    userId: string,
    message?: string
  ): Promise<void> {
    try {
      const versionDoc = doc(this.versionsCollection);
      
      const versionData: FlowVersion = {
        flowId: flowConfig.id,
        version: flowConfig.version,
        configuration: flowConfig,
        createdBy: userId,
        createdAt: Timestamp.now(),
        message,
        previousVersion: flowConfig.version > 1 ? flowConfig.version - 1 : undefined,
      };
      
      await setDoc(versionDoc, versionData);
    } catch (error) {
      console.error('Error creating version:', error);
      // Don't throw - version creation failure shouldn't block main operation
    }
  }

  /**
   * Map Firestore document to FlowConfiguration
   */
  private mapToFlowConfiguration(id: string, data: any): FlowConfiguration {
    return {
      id,
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      version: data.version,
      status: data.status,
      category: data.category,
      tags: data.tags || [],
      steps: data.steps || [],
      inputSchema: data.inputSchema || {},
      outputSchema: data.outputSchema || {},
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      publishedAt: data.publishedAt,
      settings: data.settings,
    };
  }

  /**
   * Convert FlowConfiguration to Firestore format
   */
  private flowToFirestore(flow: Partial<FlowConfiguration>): any {
    const firestoreData: any = {};
    
    // Only include defined fields
    if (flow.name !== undefined) firestoreData.name = flow.name;
    if (flow.displayName !== undefined) firestoreData.displayName = flow.displayName;
    if (flow.description !== undefined) firestoreData.description = flow.description;
    if (flow.version !== undefined) firestoreData.version = flow.version;
    if (flow.status !== undefined) firestoreData.status = flow.status;
    if (flow.category !== undefined) firestoreData.category = flow.category;
    if (flow.tags !== undefined) firestoreData.tags = flow.tags;
    if (flow.steps !== undefined) firestoreData.steps = flow.steps;
    if (flow.inputSchema !== undefined) firestoreData.inputSchema = flow.inputSchema;
    if (flow.outputSchema !== undefined) firestoreData.outputSchema = flow.outputSchema;
    if (flow.createdBy !== undefined) firestoreData.createdBy = flow.createdBy;
    if (flow.createdAt !== undefined) firestoreData.createdAt = flow.createdAt;
    if (flow.updatedAt !== undefined) firestoreData.updatedAt = flow.updatedAt;
    if (flow.publishedAt !== undefined) firestoreData.publishedAt = flow.publishedAt;
    if (flow.settings !== undefined) firestoreData.settings = flow.settings;
    
    return firestoreData;
  }
}

/**
 * Flow filters interface
 */
export interface FlowFilters {
  status?: FlowStatus;
  category?: string;
  tags?: string[];
  limit?: number;
}

/**
 * Custom error classes
 */
export class FlowServiceError extends Error {
  public readonly cause?: any;
  
  constructor(message: string, cause?: any) {
    super(message);
    this.name = 'FlowServiceError';
    this.cause = cause;
  }
}

export class FlowNotFoundError extends FlowServiceError {
  constructor(flowId: string) {
    super(`Flow not found: ${flowId}`);
    this.name = 'FlowNotFoundError';
  }
}

export class FlowAlreadyExistsError extends FlowServiceError {
  constructor(flowName: string) {
    super(`Flow already exists: ${flowName}`);
    this.name = 'FlowAlreadyExistsError';
  }
}

export class FlowVersionNotFoundError extends FlowServiceError {
  constructor(flowId: string, version: number) {
    super(`Flow version not found: ${flowId} v${version}`);
    this.name = 'FlowVersionNotFoundError';
  }
}

export class ValidationError extends FlowServiceError {
  public readonly errors: string[];
  
  constructor(message: string, errors: string[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Singleton instance
 */
export const flowConfigService = new FlowConfigService();

/**
 * Convenience functions
 */
export async function getFlowConfiguration(flowName: string): Promise<FlowConfiguration | null> {
  return flowConfigService.getFlowByName(flowName);
}

export async function listAllFlows(filters?: FlowFilters): Promise<FlowConfiguration[]> {
  return flowConfigService.listFlows(filters);
}

export async function createNewFlow(
  flow: Partial<FlowConfiguration>,
  userId: string
): Promise<FlowConfiguration> {
  return flowConfigService.createFlow(flow, userId);
}

export async function updateFlowConfig(
  flowId: string,
  updates: Partial<FlowConfiguration>,
  userId: string,
  message?: string
): Promise<FlowConfiguration> {
  return flowConfigService.updateFlow(flowId, updates, userId, message);
}
