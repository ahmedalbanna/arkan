/**
 * Prompt Management Service
 * Week 2 - Day 4-5: Database Services
 * 
 * Service for managing prompt configurations in Firestore.
 * Provides CRUD operations and prompt versioning.
 * 
 * NOTE: This service uses Firebase Admin SDK for server-side operations.
 */

import { adminDb } from '@/lib/firebase/server-init';
import type { PromptConfiguration, PromptStatus, PromptVersion } from '../lib/models/prompt-config';

// Use Admin SDK Firestore instance
const db = adminDb;

// ============================================================================
// Prompt Management Service
// ============================================================================

export class PromptManagementService {
  private readonly collectionName = 'prompts';

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Create a new prompt
   */
  async createPrompt(prompt: Partial<PromptConfiguration>): Promise<PromptConfiguration> {
    try {
      const now = new Date();
      const newPromptData: PromptConfiguration = {
        ...(prompt as PromptConfiguration),
        createdAt: now,
        updatedAt: now,
        createdBy: prompt.createdBy || 'system',
        updatedBy: prompt.updatedBy || 'system',
        stats: {
          totalUses: 0,
          successfulUses: 0,
          failedUses: 0,
          avgTokensUsed: 0,
          avgExecutionTime: 0,
        },
        version: prompt.version || '1',
        status: (prompt.status || 'draft') as PromptStatus,
      };

      const promptRef = db.collection(this.collectionName).doc(newPromptData.id);
      await promptRef.set(this.toFirestore(newPromptData));

      // Create initial version
      await this.createVersion(newPromptData.id, {
        version: newPromptData.version,
        changeDescription: 'Initial version',
        createdAt: now,
        createdBy: newPromptData.createdBy,
        configuration: newPromptData,
      });

      return newPromptData;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw new Error(`Failed to create prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a prompt by ID
   */
  async getPrompt(promptId: string, version?: number): Promise<PromptConfiguration | null> {
    try {
      if (version) {
        return this.getPromptVersion(promptId, version);
      }

      const promptRef = db.collection(this.collectionName).doc(promptId);
      const promptSnap = await promptRef.get();

      if (!promptSnap.exists) {
        return null;
      }

      return this.fromFirestore(promptSnap.data());
    } catch (error) {
      console.error('Error getting prompt:', error);
      throw new Error(`Failed to get prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a prompt
   */
  async updatePrompt(
    promptId: string,
    updates: Partial<PromptConfiguration>,
    changeDescription?: string
  ): Promise<PromptConfiguration> {
    try {
      const promptRef = db.collection(this.collectionName).doc(promptId);
      const promptSnap = await promptRef.get();

      if (!promptSnap.exists) {
        throw new Error(`Prompt not found: ${promptId}`);
      }

      const currentPrompt = this.fromFirestore(promptSnap.data());
      const now = new Date();

      // Increment version if template or variables changed
      let newVersion = currentPrompt.version;
      if (updates.template || updates.variables) {
        const versionNum = parseInt(currentPrompt.version || '1');
        newVersion = String(versionNum + 1);
      }

      const updatedPrompt: PromptConfiguration = {
        ...currentPrompt,
        ...updates,
        version: newVersion,
        updatedAt: now,
        updatedBy: (updates as any).updatedBy || currentPrompt.updatedBy,
      };

      await promptRef.update(this.toFirestore(updatedPrompt));

      // Create version snapshot if version changed
      if (newVersion !== currentPrompt.version) {
        await this.createVersion(promptId, {
          version: newVersion,
          changeDescription: changeDescription || 'Prompt updated',
          createdAt: now,
          createdBy: updatedPrompt.updatedBy,
          configuration: updatedPrompt,
        });
      }

      return updatedPrompt;
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw new Error(`Failed to update prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(promptId: string): Promise<void> {
    try {
      const promptRef = db.collection(this.collectionName).doc(promptId);
      await promptRef.delete();

      // Delete all versions
      const versionsRef = db.collection(this.collectionName).doc(promptId).collection('versions');
      const versionsSnap = await versionsRef.get();

      const deletePromises = versionsSnap.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw new Error(`Failed to delete prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List prompts with filters
   */
  async listPrompts(filters?: {
    status?: PromptStatus;
    category?: string;
    tags?: string[];
    language?: string;
    limit?: number;
  }): Promise<PromptConfiguration[]> {
    try {
      let query = db.collection(this.collectionName);

      if (filters?.status) {
        query = query.where('status', '==', filters.status) as any;
      }

      if (filters?.category) {
        query = query.where('category', '==', filters.category) as any;
      }

      if (filters?.language) {
        query = query.where('language', '==', filters.language) as any;
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.where('tags', 'array-contains-any', filters.tags) as any;
      }

      query = query.orderBy('updatedAt', 'desc') as any;

      if (filters?.limit) {
        query = query.limit(filters.limit) as any;
      }

      const querySnapshot = await query.get();

      return querySnapshot.docs.map(doc => this.fromFirestore(doc.data()));
    } catch (error) {
      console.error('Error listing prompts:', error);
      throw new Error(`Failed to list prompts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search prompts
   */
  async searchPrompts(searchTerm: string, limit: number = 20): Promise<PromptConfiguration[]> {
    try {
      // This is not efficient for large datasets. Consider a dedicated search service like Algolia or Typesense.
      const allPrompts = await this.listPrompts({ limit: 1000 }); // Increased limit for better search results

      const searchLower = searchTerm.toLowerCase();
      return allPrompts
        .filter(prompt =>
          prompt.name.toLowerCase().includes(searchLower) ||
          (prompt.description && prompt.description.toLowerCase().includes(searchLower)) ||
          prompt.template.toLowerCase().includes(searchLower) ||
          (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error searching prompts:', error);
      throw new Error(`Failed to search prompts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Version Management
  // ============================================================================

  /**
   * Create a version snapshot
   */
  private async createVersion(promptId: string, version: PromptVersion): Promise<void> {
    try {
      const versionRef = db.collection(this.collectionName).doc(promptId).collection('versions').doc(String(version.version));
      await versionRef.set({
        ...version,
        createdAt: version.createdAt, // Should already be a Date object
        configuration: this.toFirestore(version.configuration),
      });
    } catch (error) {
      console.error('Error creating version:', error);
      throw new Error(`Failed to create version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific prompt version
   */
  async getPromptVersion(promptId: string, version: number): Promise<PromptConfiguration | null> {
    try {
      const versionRef = db.collection(this.collectionName).doc(promptId).collection('versions').doc(String(version));
      const versionSnap = await versionRef.get();

      if (!versionSnap.exists) {
        return null;
      }

      const versionData = versionSnap.data() as PromptVersion;
      return this.fromFirestore(versionData.configuration as any);
    } catch (error) {
      console.error('Error getting prompt version:', error);
      throw new Error(`Failed to get prompt version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all versions of a prompt
   */
  async listVersions(promptId: string): Promise<PromptVersion[]> {
    try {
      const versionsRef = db.collection(this.collectionName).doc(promptId).collection('versions');
      const versionsSnap = await versionsRef.orderBy('createdAt', 'desc').get();

      return versionsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(), // Timestamps from subcollections need conversion
          configuration: this.fromFirestore(data.configuration),
        } as PromptVersion;
      });
    } catch (error) {
      console.error('Error listing versions:', error);
      throw new Error(`Failed to list versions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Update prompt usage statistics using a transaction
   */
  async updateStats(promptId: string, success: boolean, tokensUsed: number, executionTime: number): Promise<void> {
    try {
      const promptRef = db.collection(this.collectionName).doc(promptId);

      await db.runTransaction(async (transaction) => {
        const promptSnap = await transaction.get(promptRef);
        if (!promptSnap.exists) {
          return; // Prompt not found, do nothing
        }

        const prompt = this.fromFirestore(promptSnap.data());
        const stats = (prompt as any).stats || {
          totalUses: 0,
          successfulUses: 0,
          failedUses: 0,
          avgTokensUsed: 0,
          avgExecutionTime: 0,
        };

        stats.totalUses = (stats.totalUses || 0) + 1;
        if (success) {
          stats.successfulUses = (stats.successfulUses || 0) + 1;
        } else {
          stats.failedUses = (stats.failedUses || 0) + 1;
        }

        const totalTokens = (stats.avgTokensUsed || 0) * (stats.totalUses - 1);
        stats.avgTokensUsed = (totalTokens + tokensUsed) / stats.totalUses;

        const totalTime = (stats.avgExecutionTime || 0) * (stats.totalUses - 1);
        stats.avgExecutionTime = (totalTime + executionTime) / stats.totalUses;

        stats.lastUsedAt = new Date();

        transaction.update(promptRef, { stats: stats });
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
   * Convert prompt to Firestore format
   */
  private toFirestore(prompt: PromptConfiguration): any {
    // The data is already flat. Just return it.
    // Firestore handles Date to Timestamp conversion automatically.
    return prompt;
  }

  /**
   * Convert Firestore data to prompt
   */
  private fromFirestore(data: any): PromptConfiguration {
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

export const promptManagementService = new PromptManagementService();

// ============================================================================
// Public API
// ============================================================================

export async function createPrompt(prompt: Partial<PromptConfiguration>): Promise<PromptConfiguration> {
  return promptManagementService.createPrompt(prompt);
}

export async function getPromptById(promptId: string, version?: number): Promise<PromptConfiguration | null> {
  return promptManagementService.getPrompt(promptId, version);
}

export async function updatePrompt(
  promptId: string,
  updates: Partial<PromptConfiguration>,
  changeDescription?: string
): Promise<PromptConfiguration> {
  return promptManagementService.updatePrompt(promptId, updates, changeDescription);
}

export async function deletePrompt(promptId: string): Promise<void> {
  return promptManagementService.deletePrompt(promptId);
}

export async function listPrompts(filters?: {
  status?: PromptStatus;
  category?: string;
  tags?: string[];
  language?: string;
  limit?: number;
}): Promise<PromptConfiguration[]> {
  return promptManagementService.listPrompts(filters);
}

export async function searchPrompts(searchTerm: string, limit?: number): Promise<PromptConfiguration[]> {
  return promptManagementService.searchPrompts(searchTerm, limit);
}
