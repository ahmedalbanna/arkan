/**
 * Tool Registry Service
 * Week 2 - Day 4-5: Database Services
 * 
 * Service for managing tool configurations in Firestore.
 * Provides CRUD operations for tool registry.
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
import { db } from '../lib/firebase/client-init';
import type { ToolConfiguration, ToolCategory } from '../lib/models/tool-config';

// ============================================================================
// Tool Registry Service
// ============================================================================

export class ToolRegistryService {
  private readonly collectionName = 'tools';

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Register a new tool
   */
  async registerTool(tool: Omit<ToolConfiguration, 'metadata'>): Promise<ToolConfiguration> {
    try {
      const now = new Date();
      const toolWithMetadata: ToolConfiguration = {
        ...tool,
        metadata: {
          createdAt: now,
          updatedAt: now,
          createdBy: tool.metadata?.createdBy || 'system',
          updatedBy: tool.metadata?.updatedBy || 'system',
          version: tool.metadata?.version || '1.0.0',
          stats: {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalExecutionTime: 0,
            avgExecutionTime: 0,
          },
        },
      };

      const toolRef = doc(db, this.collectionName, tool.name);
      await setDoc(toolRef, this.toFirestore(toolWithMetadata));

      return toolWithMetadata;
    } catch (error) {
      console.error('Error registering tool:', error);
      throw new Error(`Failed to register tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a tool by name
   */
  async getTool(toolName: string): Promise<ToolConfiguration | null> {
    try {
      const toolRef = doc(db, this.collectionName, toolName);
      const toolSnap = await getDoc(toolRef);

      if (!toolSnap.exists()) {
        return null;
      }

      return this.fromFirestore(toolSnap.data());
    } catch (error) {
      console.error('Error getting tool:', error);
      throw new Error(`Failed to get tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a tool
   */
  async updateTool(
    toolName: string,
    updates: Partial<ToolConfiguration>
  ): Promise<ToolConfiguration> {
    try {
      const toolRef = doc(db, this.collectionName, toolName);
      const toolSnap = await getDoc(toolRef);

      if (!toolSnap.exists()) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      const currentTool = this.fromFirestore(toolSnap.data());
      const now = new Date();

      const updatedTool: ToolConfiguration = {
        ...currentTool,
        ...updates,
        metadata: {
          ...currentTool.metadata,
          ...updates.metadata,
          updatedAt: now,
          updatedBy: updates.metadata?.updatedBy || currentTool.metadata.updatedBy,
        },
      };

      await updateDoc(toolRef, this.toFirestore(updatedTool));

      return updatedTool;
    } catch (error) {
      console.error('Error updating tool:', error);
      throw new Error(`Failed to update tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a tool
   */
  async deleteTool(toolName: string): Promise<void> {
    try {
      // Check if tool is built-in
      const tool = await this.getTool(toolName);
      if (tool?.isBuiltIn) {
        throw new Error('Cannot delete built-in tool');
      }

      const toolRef = doc(db, this.collectionName, toolName);
      await deleteDoc(toolRef);
    } catch (error) {
      console.error('Error deleting tool:', error);
      throw new Error(`Failed to delete tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List tools with filters
   */
  async listTools(filters?: {
    category?: ToolCategory;
    enabled?: boolean;
    isBuiltIn?: boolean;
    tags?: string[];
    limit?: number;
  }): Promise<ToolConfiguration[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.category) {
        constraints.push(where('category', '==', filters.category));
      }

      if (filters?.enabled !== undefined) {
        constraints.push(where('enabled', '==', filters.enabled));
      }

      if (filters?.isBuiltIn !== undefined) {
        constraints.push(where('isBuiltIn', '==', filters.isBuiltIn));
      }

      if (filters?.tags && filters.tags.length > 0) {
        constraints.push(where('metadata.tags', 'array-contains-any', filters.tags));
      }

      constraints.push(orderBy('metadata.updatedAt', 'desc'));

      if (filters?.limit) {
        constraints.push(firestoreLimit(filters.limit));
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => this.fromFirestore(doc.data()));
    } catch (error) {
      console.error('Error listing tools:', error);
      throw new Error(`Failed to list tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search tools
   */
  async searchTools(searchTerm: string, limit: number = 20): Promise<ToolConfiguration[]> {
    try {
      const allTools = await this.listTools({ limit: 100 });

      const searchLower = searchTerm.toLowerCase();
      return allTools
        .filter(tool =>
          tool.name.toLowerCase().includes(searchLower) ||
          tool.displayName.toLowerCase().includes(searchLower) ||
          tool.description.toLowerCase().includes(searchLower) ||
          (tool.metadata.tags && tool.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error searching tools:', error);
      throw new Error(`Failed to search tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enable/disable a tool
   */
  async setToolEnabled(toolName: string, enabled: boolean): Promise<void> {
    try {
      const toolRef = doc(db, this.collectionName, toolName);
      await updateDoc(toolRef, { enabled });
    } catch (error) {
      console.error('Error setting tool enabled:', error);
      throw new Error(`Failed to set tool enabled: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Update tool execution statistics
   */
  async updateStats(toolName: string, success: boolean, executionTime: number): Promise<void> {
    try {
      const toolRef = doc(db, this.collectionName, toolName);
      const toolSnap = await getDoc(toolRef);

      if (!toolSnap.exists()) {
        return;
      }

      const tool = this.fromFirestore(toolSnap.data());
      const stats = tool.metadata.stats || {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalExecutionTime: 0,
        avgExecutionTime: 0,
      };

      stats.totalCalls++;
      if (success) {
        stats.successfulCalls++;
      } else {
        stats.failedCalls++;
      }

      stats.totalExecutionTime += executionTime;
      stats.avgExecutionTime = stats.totalExecutionTime / stats.totalCalls;
      stats.lastUsedAt = new Date();

      await updateDoc(toolRef, {
        'metadata.stats': {
          ...stats,
          lastUsedAt: Timestamp.fromDate(stats.lastUsedAt),
        },
      });
    } catch (error) {
      console.error('Error updating stats:', error);
      // Don't throw - stats update is non-critical
    }
  }

  /**
   * Get tool statistics
   */
  async getToolStats(toolName: string): Promise<any> {
    try {
      const tool = await this.getTool(toolName);
      return tool?.metadata.stats || null;
    } catch (error) {
      console.error('Error getting tool stats:', error);
      return null;
    }
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Convert tool to Firestore format
   */
  private toFirestore(tool: ToolConfiguration): any {
    return {
      ...tool,
      metadata: {
        ...tool.metadata,
        createdAt: Timestamp.fromDate(tool.metadata.createdAt),
        updatedAt: Timestamp.fromDate(tool.metadata.updatedAt),
        stats: tool.metadata.stats ? {
          ...tool.metadata.stats,
          lastUsedAt: tool.metadata.stats.lastUsedAt
            ? Timestamp.fromDate(tool.metadata.stats.lastUsedAt)
            : null,
        } : undefined,
      },
    };
  }

  /**
   * Convert Firestore data to tool
   */
  private fromFirestore(data: any): ToolConfiguration {
    return {
      ...data,
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt.toDate(),
        updatedAt: data.metadata.updatedAt.toDate(),
        stats: data.metadata.stats ? {
          ...data.metadata.stats,
          lastUsedAt: data.metadata.stats.lastUsedAt?.toDate(),
        } : undefined,
      },
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const toolRegistryService = new ToolRegistryService();

// ============================================================================
// Public API
// ============================================================================

export async function registerTool(tool: Omit<ToolConfiguration, 'metadata'>): Promise<ToolConfiguration> {
  return toolRegistryService.registerTool(tool);
}

export async function getTool(toolName: string): Promise<ToolConfiguration | null> {
  return toolRegistryService.getTool(toolName);
}

export async function updateTool(
  toolName: string,
  updates: Partial<ToolConfiguration>
): Promise<ToolConfiguration> {
  return toolRegistryService.updateTool(toolName, updates);
}

export async function deleteTool(toolName: string): Promise<void> {
  return toolRegistryService.deleteTool(toolName);
}

export async function listTools(filters?: {
  category?: ToolCategory;
  enabled?: boolean;
  isBuiltIn?: boolean;
  tags?: string[];
  limit?: number;
}): Promise<ToolConfiguration[]> {
  return toolRegistryService.listTools(filters);
}

export async function searchTools(searchTerm: string, limit?: number): Promise<ToolConfiguration[]> {
  return toolRegistryService.searchTools(searchTerm, limit);
}

export async function setToolEnabled(toolName: string, enabled: boolean): Promise<void> {
  return toolRegistryService.setToolEnabled(toolName, enabled);
}

export async function getToolStats(toolName: string): Promise<any> {
  return toolRegistryService.getToolStats(toolName);
}
