/**
 * Prompt Management Service
 * Week 2 - Day 4-5: Database Services
 * 
 * Service for managing prompt configurations in Firestore.
 * Provides CRUD operations and prompt versioning.
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
import type { PromptConfiguration, PromptStatus, PromptVersion } from '../lib/models/prompt-config';

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
  async createPrompt(prompt: Omit<PromptConfiguration, 'metadata'>): Promise<PromptConfiguration> {
    try {
      const now = new Date();
      const promptWithMetadata: PromptConfiguration = {
        ...prompt,
        metadata: {
          createdAt: now,
          updatedAt: now,
          createdBy: prompt.metadata?.createdBy || 'system',
          updatedBy: prompt.metadata?.updatedBy || 'system',
          stats: {
            totalUses: 0,
            successfulUses: 0,
            failedUses: 0,
            avgTokensUsed: 0,
            avgExecutionTime: 0,
          },
        },
      };

      const promptRef = doc(db, this.collectionName, prompt.id);
      await setDoc(promptRef, this.toFirestore(promptWithMetadata));

      // Create initial version
      await this.createVersion(prompt.id, {
        version: prompt.version,
        changeDescription: 'Initial version',
        createdAt: now,
        createdBy: promptWithMetadata.metadata.createdBy,
        configuration: promptWithMetadata,
      });

      return promptWithMetadata;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw new Error(`Failed to create prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a prompt by ID
   */
  async getPrompt(promptId: string, version?: string): Promise<PromptConfiguration | null> {
    try {
      if (version) {
        return this.getPromptVersion(promptId, version);
      }

      const promptRef = doc(db, this.collectionName, promptId);
      const promptSnap = await getDoc(promptRef);

      if (!promptSnap.exists()) {
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
      const promptRef = doc(db, this.collectionName, promptId);
      const promptSnap = await getDoc(promptRef);

      if (!promptSnap.exists()) {
        throw new Error(`Prompt not found: ${promptId}`);
      }

      const currentPrompt = this.fromFirestore(promptSnap.data());
      const now = new Date();

      // Increment version if template changed
      let newVersion = currentPrompt.version;
      if (updates.template || updates.variables) {
        const versionParts = currentPrompt.version.split('.');
        versionParts[2] = String(Number(versionParts[2]) + 1);
        newVersion = versionParts.join('.');
      }

      const updatedPrompt: PromptConfiguration = {
        ...currentPrompt,
        ...updates,
        version: newVersion,
        metadata: {
          ...currentPrompt.metadata,
          updatedAt: now,
          updatedBy: updates.metadata?.updatedBy || currentPrompt.metadata.updatedBy,
        },
      };

      await updateDoc(promptRef, this.toFirestore(updatedPrompt));

      // Create version snapshot
      if (newVersion !== currentPrompt.version) {
        await this.createVersion(promptId, {
          version: newVersion,
          changeDescription: changeDescription || 'Prompt updated',
          createdAt: now,
          createdBy: updatedPrompt.metadata.updatedBy,
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
      const promptRef = doc(db, this.collectionName, promptId);
      await deleteDoc(promptRef);

      // Delete all versions
      const versionsRef = collection(db, this.collectionName, promptId, 'versions');
      const versionsSnap = await getDocs(versionsRef);

      const deletePromises = versionsSnap.docs.map(doc => deleteDoc(doc.ref));
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
      const constraints: QueryConstraint[] = [];

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.category) {
        constraints.push(where('metadata.category', '==', filters.category));
      }

      if (filters?.language) {
        constraints.push(where('metadata.language', '==', filters.language));
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
      console.error('Error listing prompts:', error);
      throw new Error(`Failed to list prompts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search prompts
   */
  async searchPrompts(searchTerm: string, limit: number = 20): Promise<PromptConfiguration[]> {
    try {
      const allPrompts = await this.listPrompts({ limit: 100 });

      const searchLower = searchTerm.toLowerCase();
      return allPrompts
        .filter(prompt =>
          prompt.name.toLowerCase().includes(searchLower) ||
          prompt.description.toLowerCase().includes(searchLower) ||
          prompt.template.toLowerCase().includes(searchLower) ||
          prompt.tags.some(tag => tag.toLowerCase().includes(searchLower))
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
      const versionRef = doc(db, this.collectionName, promptId, 'versions', version.version);
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
   * Get a specific prompt version
   */
  async getPromptVersion(promptId: string, version: string): Promise<PromptConfiguration | null> {
    try {
      const versionRef = doc(db, this.collectionName, promptId, 'versions', version);
      const versionSnap = await getDoc(versionRef);

      if (!versionSnap.exists()) {
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
      const versionsRef = collection(db, this.collectionName, promptId, 'versions');
      const q = query(versionsRef, orderBy('createdAt', 'desc'));
      const versionsSnap = await getDocs(q);

      return versionsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
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
   * Update prompt usage statistics
   */
  async updateStats(promptId: string, success: boolean, tokensUsed: number, executionTime: number): Promise<void> {
    try {
      const promptRef = doc(db, this.collectionName, promptId);
      const promptSnap = await getDoc(promptRef);

      if (!promptSnap.exists()) {
        return;
      }

      const prompt = this.fromFirestore(promptSnap.data());
      const stats = prompt.metadata.stats || {
        totalUses: 0,
        successfulUses: 0,
        failedUses: 0,
        avgTokensUsed: 0,
        avgExecutionTime: 0,
      };

      stats.totalUses++;
      if (success) {
        stats.successfulUses++;
      } else {
        stats.failedUses++;
      }

      // Update averages
      const totalTokens = stats.avgTokensUsed * (stats.totalUses - 1);
      stats.avgTokensUsed = (totalTokens + tokensUsed) / stats.totalUses;

      const totalTime = stats.avgExecutionTime * (stats.totalUses - 1);
      stats.avgExecutionTime = (totalTime + executionTime) / stats.totalUses;

      stats.lastUsedAt = new Date();

      await updateDoc(promptRef, {
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
   * Convert prompt to Firestore format
   */
  private toFirestore(prompt: PromptConfiguration): any {
    return {
      ...prompt,
      metadata: {
        ...prompt.metadata,
        createdAt: Timestamp.fromDate(prompt.metadata.createdAt),
        updatedAt: Timestamp.fromDate(prompt.metadata.updatedAt),
        stats: prompt.metadata.stats ? {
          ...prompt.metadata.stats,
          lastUsedAt: prompt.metadata.stats.lastUsedAt
            ? Timestamp.fromDate(prompt.metadata.stats.lastUsedAt)
            : null,
        } : undefined,
      },
    };
  }

  /**
   * Convert Firestore data to prompt
   */
  private fromFirestore(data: any): PromptConfiguration {
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

export const promptManagementService = new PromptManagementService();

// ============================================================================
// Public API
// ============================================================================

export async function createPrompt(prompt: Omit<PromptConfiguration, 'metadata'>): Promise<PromptConfiguration> {
  return promptManagementService.createPrompt(prompt);
}

export async function getPromptById(promptId: string, version?: string): Promise<PromptConfiguration | null> {
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
