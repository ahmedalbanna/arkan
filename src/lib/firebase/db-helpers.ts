'use server';

import { adminDb } from './server-init';
import type { UserProfile, ProjectProperties } from '@/lib/models';
import {
  validateUser,
  validateCreateUser,
  validateUpdateUser,
  validateProject,
  validateCreateProject,
  validateUpdateProject,
  validateSection,
  validateCreateSection,
  validateUpdateSection,
  validateTemplate,
  validateCreateTemplate,
  validateUpdateTemplate,
  validateTransaction,
  validateCreateTransaction,
  validateUpdateTransaction,
  validateNotification,
  validateCreateNotification,
  validateUpdateNotification,
  validateAgent,
  validateCreateAgent,
  validateUpdateAgent,
} from './validation-helpers';

/**
 * Generic Database Helpers for Firestore Operations
 * 
 * This module provides reusable, type-safe helpers for common Firestore operations.
 * All helpers use the Firebase Admin SDK (adminDb) initialized in server-init.ts.
 * 
 * Usage patterns:
 * - Generic helpers for any collection
 * - Collection-specific helpers with optimized queries
 * - Pagination support with cursor-based navigation
 * - Transaction support for atomic operations
 * 
 * @module db-helpers
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaginatedResult<T> {
  items: T[];
  hasNextPage: boolean;
  lastVisibleId: string | null;
}

export interface QueryFilter {
  field: string;
  operator: '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in';
  value: any;
}

export interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
}

// ============================================================================
// GENERIC FIRESTORE HELPERS
// ============================================================================

/**
 * Get a single document by ID with full type safety
 * @param collection - Firestore collection name
 * @param docId - Document ID
 * @returns Document data with ID or null if not found
 */
export async function getDoc<T extends { id?: string }>(
  collection: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  try {
    const doc = await adminDb.collection(collection).doc(docId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as T & { id: string };
  } catch (error) {
    console.error(`Error fetching document from ${collection}:`, error);
    throw error;
  }
}

/**
 * List documents with optional filtering, ordering, and limiting
 * @param collection - Firestore collection name
 * @param options - Query options (filters, ordering, limiting)
 * @returns Array of documents with IDs
 */
export async function listDocs<T extends { id?: string }>(
  collection: string,
  options?: QueryOptions
): Promise<(T & { id: string })[]> {
  try {
    let query: any = adminDb.collection(collection);

    // Apply filters
    if (options?.filters) {
      for (const filter of options.filters) {
        query = query.where(filter.field, filter.operator, filter.value);
      }
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction);
    }

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as (T & { id: string })[];
  } catch (error) {
    console.error(`Error listing documents from ${collection}:`, error);
    throw error;
  }
}

/**
 * Create a new document with auto-generated ID
 * @param collection - Firestore collection name
 * @param data - Document data to create
 * @returns Created document with generated ID
 */
export async function createDoc<T extends { id?: string }>(
  collection: string,
  data: Omit<T, 'id'>
): Promise<T & { id: string }> {
  try {
    const docRef = adminDb.collection(collection).doc();
    const dataToSave = {
      ...data,
      id: docRef.id,
    };
    await docRef.set(dataToSave);
    return dataToSave as T & { id: string };
  } catch (error) {
    console.error(`Error creating document in ${collection}:`, error);
    throw error;
  }
}

/**
 * Update a document with merge strategy (non-destructive)
 * @param collection - Firestore collection name
 * @param docId - Document ID
 * @param data - Partial data to update
 * @returns Updated document data
 */
export async function updateDoc<T extends { id?: string }>(
  collection: string,
  docId: string,
  data: Partial<Omit<T, 'id'>>
): Promise<T & { id: string }> {
  try {
    await adminDb.collection(collection).doc(docId).update(data);
    const updated = await getDoc<T>(collection, docId);
    if (!updated) throw new Error('Failed to retrieve updated document');
    return updated;
  } catch (error) {
    console.error(`Error updating document in ${collection}:`, error);
    throw error;
  }
}

/**
 * Delete a document by ID
 * @param collection - Firestore collection name
 * @param docId - Document ID
 */
export async function deleteDoc(collection: string, docId: string): Promise<void> {
  try {
    await adminDb.collection(collection).doc(docId).delete();
  } catch (error) {
    console.error(`Error deleting document from ${collection}:`, error);
    throw error;
  }
}

/**
 * Paginate through a collection with cursor-based navigation
 * @param collection - Firestore collection name
 * @param limit - Number of items per page
 * @param startAfterId - Document ID to start after (for next page)
 * @param options - Additional query options
 * @returns Paginated result with hasNextPage indicator
 */
export async function paginateQuery<T extends { id?: string }>(
  collection: string,
  limit: number,
  startAfterId?: string,
  options?: QueryOptions
): Promise<PaginatedResult<T & { id: string }>> {
  try {
    let query: any = adminDb.collection(collection);

    // Apply filters
    if (options?.filters) {
      for (const filter of options.filters) {
        query = query.where(filter.field, filter.operator, filter.value);
      }
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction);
    }

    // Handle pagination cursor
    if (startAfterId) {
      const startAfterDoc = await adminDb.collection(collection).doc(startAfterId).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    // Fetch one extra to determine if there's a next page
    query = query.limit(limit + 1);
    const snapshot = await query.get();

    const items = snapshot.docs
      .slice(0, limit)
      .map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as (T & { id: string })[];

    const hasNextPage = snapshot.docs.length > limit;
    const lastVisibleId = hasNextPage ? snapshot.docs[snapshot.docs.length - 2].id : null;

    return { items, hasNextPage, lastVisibleId };
  } catch (error) {
    console.error(`Error paginating documents in ${collection}:`, error);
    throw error;
  }
}

/**
 * Batch write multiple documents (create or update)
 * @param collection - Firestore collection name
 * @param operations - Array of {docId?, data} operations
 */
export async function batchWrite<T extends { id?: string }>(
  collection: string,
  operations: Array<{ docId?: string; data: T }>
): Promise<void> {
  try {
    const batch = adminDb.batch();
    for (const op of operations) {
      const docId = op.docId || adminDb.collection(collection).doc().id;
      const docRef = adminDb.collection(collection).doc(docId);
      batch.set(docRef, op.data, { merge: true });
    }
    await batch.commit();
  } catch (error) {
    console.error(`Error batch writing to ${collection}:`, error);
    throw error;
  }
}

/**
 * Run a transaction with automatic retry and rollback
 * @param operation - Async function that performs transaction operations
 */
export async function runTransaction<T>(
  operation: (transaction: any) => Promise<T>
): Promise<T> {
  try {
    return await adminDb.runTransaction(operation);
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// ============================================================================
// COLLECTION-SPECIFIC HELPERS: USERS
// ============================================================================

/**
 * Get user profile by ID
 */
export async function getUserHelper(userId: string): Promise<UserProfile | null> {
  return getDoc<UserProfile>('users', userId);
}

/**
 * List all users with optional pagination
 */
export async function listUsersHelper(
  limit?: number,
  startAfterId?: string
): Promise<PaginatedResult<UserProfile>> {
  return paginateQuery<UserProfile>('users', limit || 10, startAfterId, {
    orderBy: { field: 'createdAt', direction: 'desc' },
  });
}

/**
 * Create a new user document (called after auth creation)
 */
export async function createUserDocHelper(
  userId: string,
  data: Omit<UserProfile, 'id'>
): Promise<UserProfile> {
  try {
    const userData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Validate user data before saving
    validateCreateUser(userData);
    
    await adminDb.collection('users').doc(userId).set(userData);
    return { id: userId, ...userData } as UserProfile;
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserHelper(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile> {
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return updateDoc<UserProfile>('users', userId, updateData);
}

/**
 * Delete user document
 */
export async function deleteUserDocHelper(userId: string): Promise<void> {
  return deleteDoc('users', userId);
}

/**
 * Get user credits with daily refresh logic
 */
export async function getUserCreditsHelper(
  userId: string
): Promise<{ credits: number; updated: boolean }> {
  return runTransaction(async (transaction) => {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as UserProfile;
    let currentCredits = userData.credits ?? 0;
    const lastUpdate = userData.lastDailyCreditUpdate
      ? new Date(userData.lastDailyCreditUpdate).getTime()
      : 0;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const updates: { [key: string]: any } = {};
    let updated = false;

    // Check if it's time for a daily credit refresh
    if (Date.now() - lastUpdate > twentyFourHours) {
      if (currentCredits < 10) {
        currentCredits = 10;
        updates.credits = currentCredits;
      }
      updates.lastDailyCreditUpdate = new Date().toISOString();
      updated = true;
    }

    if (Object.keys(updates).length > 0) {
      transaction.update(userRef, updates);
    }

    return { credits: currentCredits, updated };
  });
}

/**
 * Deduct credits from user (with daily refresh)
 * @returns New credit balance
 */
export async function deductUserCreditsHelper(
  userId: string,
  creditsToDeduct: number
): Promise<number> {
  return runTransaction(async (transaction) => {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as UserProfile;
    let currentCredits = userData.credits ?? 0;
    const lastUpdate = userData.lastDailyCreditUpdate
      ? new Date(userData.lastDailyCreditUpdate).getTime()
      : 0;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const updates: { [key: string]: any } = {};

    // Check if it's time for a daily credit refresh
    if (Date.now() - lastUpdate > twentyFourHours) {
      if (currentCredits < 10) {
        currentCredits = 10;
        updates.credits = currentCredits;
      }
      updates.lastDailyCreditUpdate = new Date().toISOString();
    }

    if (currentCredits < creditsToDeduct) {
      throw {
        status: 402,
        message: 'Insufficient credits. Please purchase more credits to continue.',
      };
    }

    const newBalance = currentCredits - creditsToDeduct;
    updates.credits = newBalance;
    updates.updatedAt = new Date().toISOString();

    transaction.update(userRef, updates);

    return newBalance;
  });
}

/**
 * Add credits to user account
 */
export async function addUserCreditsHelper(
  userId: string,
  creditsToAdd: number
): Promise<void> {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    // Using dynamic import to avoid firebase-admin/firestore import at module level
    const firebaseAdmin = require('firebase-admin');
    await userRef.update({
      credits: firebaseAdmin.firestore.FieldValue.increment(creditsToAdd),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding user credits:', error);
    throw error;
  }
}

// ============================================================================
// COLLECTION-SPECIFIC HELPERS: PROJECTS
// ============================================================================

/**
 * Get project by ID
 */
export async function getProjectHelper(projectId: string): Promise<ProjectProperties | null> {
  return getDoc<ProjectProperties>('projects', projectId);
}

/**
 * List projects by author (user ID)
 */
export async function listProjectsByAuthorHelper(
  userId: string
): Promise<ProjectProperties[]> {
  return listDocs<ProjectProperties>('projects', {
    filters: [{ field: 'meta.author', operator: '==' as const, value: userId }],
    orderBy: { field: 'meta.updated', direction: 'desc' },
  });
}

/**
 * Save project (create or update)
 */
export async function saveProjectHelper(
  projectData: ProjectProperties
): Promise<ProjectProperties> {
  try {
    const collection = adminDb.collection('projects');
    const docRef = projectData.id ? collection.doc(projectData.id) : collection.doc();

    const dataToSave: ProjectProperties = {
      ...projectData,
      id: docRef.id,
      meta: {
        ...projectData.meta,
        updated: new Date().toISOString(),
      },
    };

    // Validate project data before saving
    validateProject(dataToSave);

    await docRef.set(dataToSave, { merge: true });
    return dataToSave;
  } catch (error) {
    console.error('Error saving project:', error);
    throw error;
  }
}

/**
 * Delete project by ID
 */
export async function deleteProjectHelper(projectId: string): Promise<void> {
  return deleteDoc('projects', projectId);
}

// ============================================================================
// COLLECTION-SPECIFIC HELPERS: SECTIONS
// ============================================================================

/**
 * Get section by ID
 */
export async function getSectionHelper(sectionId: string): Promise<any | null> {
  return getDoc('sections', sectionId);
}

/**
 * List sections by project ID
 */
export async function listSectionsByProjectHelper(projectId: string): Promise<any[]> {
  return listDocs('sections', {
    filters: [{ field: 'projectId', operator: '==' as const, value: projectId }],
    orderBy: { field: 'order', direction: 'asc' },
  });
}

/**
 * Save section (create or update)
 */
export async function saveSectionHelper(sectionData: any): Promise<any> {
  try {
    const collection = adminDb.collection('sections');
    const docRef = sectionData.id ? collection.doc(sectionData.id) : collection.doc();

    const dataToSave = {
      ...sectionData,
      id: docRef.id,
      updatedAt: new Date().toISOString(),
    };

    // Validate section data before saving
    validateSection(dataToSave);

    await docRef.set(dataToSave, { merge: true });
    return dataToSave;
  } catch (error) {
    console.error('Error saving section:', error);
    throw error;
  }
}

/**
 * Delete section by ID
 */
export async function deleteSectionHelper(sectionId: string): Promise<void> {
  return deleteDoc('sections', sectionId);
}

// ============================================================================
// COLLECTION-SPECIFIC HELPERS: TEMPLATES
// ============================================================================

/**
 * Get template by ID
 */
export async function getTemplateHelper(templateId: string): Promise<any | null> {
  return getDoc('templates', templateId);
}

/**
 * List templates with optional filtering
 */
export async function listTemplatesHelper(type?: string): Promise<any[]> {
  const filters = type ? [{ field: 'type', operator: '==' as const, value: type }] : undefined;
  return listDocs('templates', { filters });
}

/**
 * Save template (create or update)
 */
export async function saveTemplateHelper(templateData: any): Promise<any> {
  try {
    const collection = adminDb.collection('templates');
    const docRef = templateData.id ? collection.doc(templateData.id) : collection.doc();

    const dataToSave = {
      ...templateData,
      id: docRef.id,
      updatedAt: new Date().toISOString(),
    };

    // Validate template data before saving
    validateTemplate(dataToSave);

    await docRef.set(dataToSave, { merge: true });
    return dataToSave;
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
}

/**
 * Delete template by ID
 */
export async function deleteTemplateHelper(templateId: string): Promise<void> {
  return deleteDoc('templates', templateId);
}

// ============================================================================
// COLLECTION-SPECIFIC HELPERS: TRANSACTIONS
// ============================================================================

/**
 * Get transaction by ID
 */
export async function getTransactionHelper(transactionId: string): Promise<any | null> {
  return getDoc('transactions', transactionId);
}

/**
 * List transactions by user ID
 */
export async function listUserTransactionsHelper(userId: string): Promise<any[]> {
  return listDocs('transactions', {
    filters: [{ field: 'userId', operator: '==' as const, value: userId }],
    orderBy: { field: 'createdAt', direction: 'desc' },
  });
}

/**
 * Create transaction record
 */
export async function createTransactionHelper(transactionData: any): Promise<any> {
  try {
    const dataToCreate = {
      ...transactionData,
      createdAt: new Date().toISOString(),
    };
    // Validate transaction data before creating
    validateCreateTransaction(dataToCreate);
    
    return createDoc('transactions', dataToCreate);
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// ============================================================================
// COLLECTION-SPECIFIC HELPERS: NOTIFICATIONS
// ============================================================================

/**
 * Get notification by ID
 */
export async function getNotificationHelper(notificationId: string): Promise<any | null> {
  return getDoc('notifications', notificationId);
}

/**
 * List notifications for user
 */
export async function listUserNotificationsHelper(userId: string): Promise<any[]> {
  return listDocs('notifications', {
    filters: [{ field: 'userId', operator: '==' as const, value: userId }],
    orderBy: { field: 'createdAt', direction: 'desc' },
  });
}

/**
 * Create notification
 */
export async function createNotificationHelper(notificationData: any): Promise<any> {
  try {
    const dataToCreate = {
      ...notificationData,
      createdAt: new Date().toISOString(),
      read: false,
    };
    // Validate notification data before creating
    validateCreateNotification(dataToCreate);
    
    return createDoc('notifications', dataToCreate);
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsReadHelper(notificationId: string): Promise<void> {
  await updateDoc('notifications', notificationId, { read: true });
}

// ============================================================================
// COLLECTION-SPECIFIC HELPERS: AGENTS
// ============================================================================

/**
 * Get agent by ID
 */
export async function getAgentHelper(agentId: string): Promise<any | null> {
  return getDoc('agents', agentId);
}

/**
 * List all agents
 */
export async function listAgentsHelper(): Promise<any[]> {
  return listDocs('agents', { orderBy: { field: 'name', direction: 'asc' } });
}

/**
 * Save agent (create or update)
 */
export async function saveAgentHelper(agentData: any): Promise<any> {
  try {
    const collection = adminDb.collection('agents');
    const docRef = agentData.id ? collection.doc(agentData.id) : collection.doc();

    const dataToSave = {
      ...agentData,
      id: docRef.id,
      updatedAt: new Date().toISOString(),
    };

    // Validate agent data before saving
    validateAgent(dataToSave);

    await docRef.set(dataToSave, { merge: true });
    return dataToSave;
  } catch (error) {
    console.error('Error saving agent:', error);
    throw error;
  }
}

/**
 * Delete agent by ID
 */
export async function deleteAgentHelper(agentId: string): Promise<void> {
  return deleteDoc('agents', agentId);
}
