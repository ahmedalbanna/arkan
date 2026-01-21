
/**
 * Tool Registry Service
 * Week 2 - Day 4-5: Database Services
 * 
 * Service for managing tool configurations in Firestore.
 * Provides CRUD operations for tool registry.
 * 
 * NOTE: This service uses Firebase Admin SDK for server-side operations.
 */

import { adminDb } from '@/lib/firebase/server-init';
import type { ToolConfiguration, ToolCategory } from '../lib/models/tool-config';

// Use Admin SDK Firestore instance
const db = adminDb;

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
  async registerTool(tool: Partial<ToolConfiguration>): Promise<ToolConfiguration> {
    try {
      const now = new Date();
      const newToolData: ToolConfiguration = {
        ...(tool as ToolConfiguration),
        createdAt: now,
        updatedAt: now,
        createdBy: tool.createdBy || 'system',
        updatedBy: tool.updatedBy || 'system',
        version: tool.version || '1.0.0',
        enabled: tool.enabled ?? true,
        isBuiltIn: tool.isBuiltIn ?? false,
        stats: {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          totalExecutionTime: 0,
          avgExecutionTime: 0,
        },
      };

      const toolRef = db.collection(this.collectionName).doc(newToolData.name);
      await toolRef.set(this.toFirestore(newToolData));

      return newToolData;
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
      const toolRef = db.collection(this.collectionName).doc(toolName);
      const toolSnap = await toolRef.get();

      if (!toolSnap.exists) {
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
      const toolRef = db.collection(this.collectionName).doc(toolName);
      const toolSnap = await toolRef.get();

      if (!toolSnap.exists) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      const currentTool = this.fromFirestore(toolSnap.data());
      const now = new Date();

      const updatedTool: ToolConfiguration = {
        ...currentTool,
        ...updates,
        updatedAt: now,
        updatedBy: updates.updatedBy || currentTool.updatedBy,
      };

      await toolRef.update(this.toFirestore(updatedTool));

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
      const tool = await this.getTool(toolName);
      if (tool?.isBuiltIn) {
        throw new Error('Cannot delete built-in tool');
      }

      const toolRef = db.collection(this.collectionName).doc(toolName);
      await toolRef.delete();
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
      let query: FirebaseFirestore.Query = db.collection(this.collectionName);

      if (filters?.category) {
        query = query.where('category', '==', filters.category);
      }

      if (filters?.enabled !== undefined) {
        query = query.where('enabled', '==', filters.enabled);
      }

      if (filters?.isBuiltIn !== undefined) {
        query = query.where('isBuiltIn', '==', filters.isBuiltIn);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.where('tags', 'array-contains-any', filters.tags);
      }

      query = query.orderBy('updatedAt', 'desc');

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const querySnapshot = await query.get();

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
      const allTools = await this.listTools({ limit: 1000 });

      const searchLower = searchTerm.toLowerCase();
      return allTools
        .filter(tool =>
          tool.name.toLowerCase().includes(searchLower) ||
          tool.displayName.toLowerCase().includes(searchLower) ||
          tool.description.toLowerCase().includes(searchLower) ||
          (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchLower)))
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
      const toolRef = db.collection(this.collectionName).doc(toolName);
      await toolRef.update({ enabled, updatedAt: new Date() });
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
        const toolRef = db.collection(this.collectionName).doc(toolName);
  
        await db.runTransaction(async (transaction) => {
          const toolSnap = await transaction.get(toolRef);
          if (!toolSnap.exists) {
            return;
          }
  
          const tool = this.fromFirestore(toolSnap.data());
          const stats = tool.stats || {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalExecutionTime: 0,
            avgExecutionTime: 0,
          };
  
          stats.totalCalls = (stats.totalCalls || 0) + 1;
          if (success) {
            stats.successfulCalls = (stats.successfulCalls || 0) + 1;
          } else {
            stats.failedCalls = (stats.failedCalls || 0) + 1;
          }
  
          stats.totalExecutionTime = (stats.totalExecutionTime || 0) + executionTime;
          stats.avgExecutionTime = stats.totalExecutionTime / stats.totalCalls;
          stats.lastUsedAt = new Date();
  
          transaction.update(toolRef, { stats: stats });
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
      return tool?.stats || null;
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
    return tool;
  }

  /**
   * Convert Firestore data to tool
   */
  private fromFirestore(data: any): ToolConfiguration {
    if (!data) return data;

    const safeConvertToDate = (value: any): Date | undefined => {
        if (!value) return undefined;
        if (value instanceof Date) return value;
        if (typeof value.toDate === 'function') return value.toDate();
        if (typeof value === 'string' || typeof value === 'number') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) return date;
        }
        console.warn('Could not convert value to a valid Date:', value);
        return undefined;
    };

    return {
        ...data,
        createdAt: safeConvertToDate(data.createdAt),
        updatedAt: safeConvertToDate(data.updatedAt),
        stats: data.stats ? {
            ...data.stats,
            lastUsedAt: safeConvertToDate(data.stats.lastUsedAt),
        } : undefined,
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

export async function registerTool(tool: Partial<ToolConfiguration>): Promise<ToolConfiguration> {
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
