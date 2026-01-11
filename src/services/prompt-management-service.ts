/**
 * Prompt Management Service
 * 
 * CRUD operations for prompt templates stored in Firestore.
 * Handles prompt creation, updates, versioning, and retrieval.
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
  PromptConfiguration,
  PromptVersion,
  PromptStatus,
  PROMPT_COLLECTIONS,
  validatePromptConfiguration,
  createPromptConfiguration,
  renderTemplate,
  validatePromptInput,
} from '@/lib/models/prompt-config';

/**
 * Prompt Management Service Class
 */
export class PromptManagementService {
  private readonly promptsCollection = collection(db, PROMPT_COLLECTIONS.CONFIGURATIONS);
  private readonly versionsCollection = collection(db, PROMPT_COLLECTIONS.VERSIONS);

  /**
   * Get prompt by ID
   */
  async getPromptById(promptId: string): Promise<PromptConfiguration | null> {
    try {
      const docRef = doc(this.promptsCollection, promptId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.mapToPromptConfiguration(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Error getting prompt by ID:', error);
      throw new PromptServiceError('Failed to get prompt by ID', error);
    }
  }

  /**
   * Get prompt by name
   */
  async getPromptByName(promptName: string): Promise<PromptConfiguration | null> {
    try {
      const q = query(
        this.promptsCollection,
        where('name', '==', promptName),
        where('status', '==', 'active'),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      return this.mapToPromptConfiguration(snapshot.docs[0].id, snapshot.docs[0].data());
    } catch (error) {
      console.error('Error getting prompt by name:', error);
      throw new PromptServiceError('Failed to get prompt by name', error);
    }
  }

  /**
   * List all prompts with optional filters
   */
  async listPrompts(filters?: PromptFilters): Promise<PromptConfiguration[]> {
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

      const q = query(this.promptsCollection, ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc =>
        this.mapToPromptConfiguration(doc.id, doc.data())
      );
    } catch (error) {
      console.error('Error listing prompts:', error);
      throw new PromptServiceError('Failed to list prompts', error);
    }
  }

  /**
   * Create a new prompt configuration
   */
  async createPrompt(
    prompt: Partial<PromptConfiguration>,
    userId: string
  ): Promise<PromptConfiguration> {
    try {
      // Validate prompt configuration
      const errors = validatePromptConfiguration(prompt);
      if (errors.length > 0) {
        throw new ValidationError('Prompt validation failed', errors);
      }

      // Check if prompt with same name already exists
      const existing = await this.getPromptByName(prompt.name!);
      if (existing) {
        throw new PromptAlreadyExistsError(prompt.name!);
      }

      // Create prompt configuration with defaults
      const promptConfig = createPromptConfiguration({
        ...prompt,
        createdBy: userId,
      });

      // Create new document
      const docRef = doc(this.promptsCollection);
      const now = Timestamp.now();

      const promptData: PromptConfiguration = {
        ...promptConfig,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      } as PromptConfiguration;

      await setDoc(docRef, this.promptToFirestore(promptData));

      // Create initial version
      await this.createVersion(promptData, userId, 'Initial version');

      return promptData;
    } catch (error) {
      console.error('Error creating prompt:', error);
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError('Failed to create prompt', error);
    }
  }

  /**
   * Update prompt configuration
   */
  async updatePrompt(
    promptId: string,
    updates: Partial<PromptConfiguration>,
    userId: string,
    versionMessage?: string
  ): Promise<PromptConfiguration> {
    try {
      const docRef = doc(this.promptsCollection, promptId);
      const existing = await this.getPromptById(promptId);

      if (!existing) {
        throw new PromptNotFoundError(promptId);
      }

      // Validate updated configuration
      const updatedPrompt = { ...existing, ...updates };
      const errors = validatePromptConfiguration(updatedPrompt);
      if (errors.length > 0) {
        throw new ValidationError('Prompt validation failed', errors);
      }

      // Increment version
      const newVersion = existing.version + 1;

      const updateData = {
        ...updates,
        version: newVersion,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, this.promptToFirestore(updateData));

      // Create version snapshot
      const updatedPromptConfig = { ...existing, ...updateData };
      await this.createVersion(updatedPromptConfig, userId, versionMessage);

      return updatedPromptConfig;
    } catch (error) {
      console.error('Error updating prompt:', error);
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError('Failed to update prompt', error);
    }
  }

  /**
   * Update prompt status
   */
  async updatePromptStatus(
    promptId: string,
    status: PromptStatus,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(this.promptsCollection, promptId);
      const existing = await this.getPromptById(promptId);

      if (!existing) {
        throw new PromptNotFoundError(promptId);
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
      console.error('Error updating prompt status:', error);
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError('Failed to update prompt status', error);
    }
  }

  /**
   * Delete prompt configuration
   */
  async deletePrompt(promptId: string): Promise<void> {
    try {
      const docRef = doc(this.promptsCollection, promptId);
      const existing = await this.getPromptById(promptId);

      if (!existing) {
        throw new PromptNotFoundError(promptId);
      }

      // Soft delete by setting status to archived
      await this.updatePromptStatus(promptId, 'archived', 'system');

      // Optionally, hard delete if needed
      // await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting prompt:', error);
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError('Failed to delete prompt', error);
    }
  }

  /**
   * Render prompt with variables
   */
  async renderPrompt(
    promptId: string,
    variables: Record<string, any>
  ): Promise<PromptRenderResult> {
    try {
      const prompt = await this.getPromptById(promptId);

      if (!prompt) {
        throw new PromptNotFoundError(promptId);
      }

      // Validate input variables
      const validation = validatePromptInput(variables, prompt.variables);
      if (!validation.valid) {
        throw new ValidationError('Variable validation failed', validation.errors);
      }

      // Render template
      const renderedPrompt = renderTemplate(prompt.templateContent, variables);
      const renderedSystem = prompt.systemPrompt
        ? renderTemplate(prompt.systemPrompt, variables)
        : undefined;

      return {
        promptId: prompt.id,
        version: prompt.version,
        renderedPrompt,
        renderedSystem,
        variables,
      };
    } catch (error) {
      console.error('Error rendering prompt:', error);
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError('Failed to render prompt', error);
    }
  }

  /**
   * Test prompt with test cases
   */
  async testPrompt(promptId: string): Promise<PromptTestResult[]> {
    try {
      const prompt = await this.getPromptById(promptId);

      if (!prompt) {
        throw new PromptNotFoundError(promptId);
      }

      if (!prompt.testCases || prompt.testCases.length === 0) {
        return [];
      }

      const results: PromptTestResult[] = [];

      for (const testCase of prompt.testCases) {
        try {
          const rendered = await this.renderPrompt(promptId, testCase.input);

          const passed = testCase.expectedPattern
            ? new RegExp(testCase.expectedPattern).test(rendered.renderedPrompt)
            : testCase.expectedOutput
            ? rendered.renderedPrompt === testCase.expectedOutput
            : true;

          results.push({
            testCaseId: testCase.id,
            testCaseName: testCase.name,
            passed,
            renderedPrompt: rendered.renderedPrompt,
            expectedOutput: testCase.expectedOutput,
            error: undefined,
          });
        } catch (error) {
          results.push({
            testCaseId: testCase.id,
            testCaseName: testCase.name,
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error testing prompt:', error);
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError('Failed to test prompt', error);
    }
  }

  /**
   * Get prompt versions
   */
  async getPromptVersions(promptId: string, limitCount = 10): Promise<PromptVersion[]> {
    try {
      const q = query(
        this.versionsCollection,
        where('promptId', '==', promptId),
        orderBy('version', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => doc.data() as PromptVersion);
    } catch (error) {
      console.error('Error getting prompt versions:', error);
      throw new PromptServiceError('Failed to get prompt versions', error);
    }
  }

  /**
   * Get specific prompt version
   */
  async getPromptVersion(promptId: string, version: number): Promise<PromptVersion | null> {
    try {
      const q = query(
        this.versionsCollection,
        where('promptId', '==', promptId),
        where('version', '==', version),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as PromptVersion;
    } catch (error) {
      console.error('Error getting prompt version:', error);
      throw new PromptServiceError('Failed to get prompt version', error);
    }
  }

  /**
   * Restore prompt to previous version
   */
  async restorePromptVersion(
    promptId: string,
    version: number,
    userId: string
  ): Promise<PromptConfiguration> {
    try {
      const versionData = await this.getPromptVersion(promptId, version);

      if (!versionData) {
        throw new PromptVersionNotFoundError(promptId, version);
      }

      // Update prompt with version data
      return await this.updatePrompt(
        promptId,
        versionData.configuration,
        userId,
        `Restored to version ${version}`
      );
    } catch (error) {
      console.error('Error restoring prompt version:', error);
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError('Failed to restore prompt version', error);
    }
  }

  /**
   * Create version snapshot
   */
  private async createVersion(
    promptConfig: PromptConfiguration,
    userId: string,
    message?: string
  ): Promise<void> {
    try {
      const versionDoc = doc(this.versionsCollection);

      const versionData: PromptVersion = {
        promptId: promptConfig.id,
        version: promptConfig.version,
        configuration: promptConfig,
        createdBy: userId,
        createdAt: Timestamp.now(),
        message,
        previousVersion: promptConfig.version > 1 ? promptConfig.version - 1 : undefined,
      };

      await setDoc(versionDoc, versionData);
    } catch (error) {
      console.error('Error creating version:', error);
      // Don't throw - version creation failure shouldn't block main operation
    }
  }

  /**
   * Map Firestore document to PromptConfiguration
   */
  private mapToPromptConfiguration(id: string, data: any): PromptConfiguration {
    return {
      id,
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      templateContent: data.templateContent,
      systemPrompt: data.systemPrompt,
      variables: data.variables || [],
      inputSchema: data.inputSchema || {},
      outputSchema: data.outputSchema || {},
      version: data.version,
      status: data.status,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      publishedAt: data.publishedAt,
      testCases: data.testCases,
      preferredModel: data.preferredModel,
      fallbackModel: data.fallbackModel,
      settings: data.settings,
    };
  }

  /**
   * Convert PromptConfiguration to Firestore format
   */
  private promptToFirestore(prompt: Partial<PromptConfiguration>): any {
    const firestoreData: any = {};

    // Only include defined fields
    if (prompt.name !== undefined) firestoreData.name = prompt.name;
    if (prompt.displayName !== undefined) firestoreData.displayName = prompt.displayName;
    if (prompt.description !== undefined) firestoreData.description = prompt.description;
    if (prompt.category !== undefined) firestoreData.category = prompt.category;
    if (prompt.tags !== undefined) firestoreData.tags = prompt.tags;
    if (prompt.templateContent !== undefined) firestoreData.templateContent = prompt.templateContent;
    if (prompt.systemPrompt !== undefined) firestoreData.systemPrompt = prompt.systemPrompt;
    if (prompt.variables !== undefined) firestoreData.variables = prompt.variables;
    if (prompt.inputSchema !== undefined) firestoreData.inputSchema = prompt.inputSchema;
    if (prompt.outputSchema !== undefined) firestoreData.outputSchema = prompt.outputSchema;
    if (prompt.version !== undefined) firestoreData.version = prompt.version;
    if (prompt.status !== undefined) firestoreData.status = prompt.status;
    if (prompt.createdBy !== undefined) firestoreData.createdBy = prompt.createdBy;
    if (prompt.createdAt !== undefined) firestoreData.createdAt = prompt.createdAt;
    if (prompt.updatedAt !== undefined) firestoreData.updatedAt = prompt.updatedAt;
    if (prompt.publishedAt !== undefined) firestoreData.publishedAt = prompt.publishedAt;
    if (prompt.testCases !== undefined) firestoreData.testCases = prompt.testCases;
    if (prompt.preferredModel !== undefined) firestoreData.preferredModel = prompt.preferredModel;
    if (prompt.fallbackModel !== undefined) firestoreData.fallbackModel = prompt.fallbackModel;
    if (prompt.settings !== undefined) firestoreData.settings = prompt.settings;

    return firestoreData;
  }
}

/**
 * Interfaces
 */
export interface PromptFilters {
  status?: PromptStatus;
  category?: string;
  tags?: string[];
  limit?: number;
}

export interface PromptRenderResult {
  promptId: string;
  version: number;
  renderedPrompt: string;
  renderedSystem?: string;
  variables: Record<string, any>;
}

export interface PromptTestResult {
  testCaseId: string;
  testCaseName: string;
  passed: boolean;
  renderedPrompt?: string;
  expectedOutput?: string;
  error?: string;
}

/**
 * Custom error classes
 */
export class PromptServiceError extends Error {
  public readonly cause?: any;

  constructor(message: string, cause?: any) {
    super(message);
    this.name = 'PromptServiceError';
    this.cause = cause;
  }
}

export class PromptNotFoundError extends PromptServiceError {
  constructor(promptId: string) {
    super(`Prompt not found: ${promptId}`);
    this.name = 'PromptNotFoundError';
  }
}

export class PromptAlreadyExistsError extends PromptServiceError {
  constructor(promptName: string) {
    super(`Prompt already exists: ${promptName}`);
    this.name = 'PromptAlreadyExistsError';
  }
}

export class PromptVersionNotFoundError extends PromptServiceError {
  constructor(promptId: string, version: number) {
    super(`Prompt version not found: ${promptId} v${version}`);
    this.name = 'PromptVersionNotFoundError';
  }
}

export class ValidationError extends PromptServiceError {
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
export const promptManagementService = new PromptManagementService();

/**
 * Convenience functions
 */
export async function getPromptById(promptId: string): Promise<PromptConfiguration | null> {
  return promptManagementService.getPromptById(promptId);
}

export async function renderPromptTemplate(
  promptId: string,
  variables: Record<string, any>
): Promise<PromptRenderResult> {
  return promptManagementService.renderPrompt(promptId, variables);
}

export async function listAllPrompts(filters?: PromptFilters): Promise<PromptConfiguration[]> {
  return promptManagementService.listPrompts(filters);
}
