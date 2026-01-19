/**
 * Document Tracking Service
 * 
 * Tracks all indexed documents in Firestore for admin management
 * - Record document uploads
 * - Store metadata (file name, chunks, timestamp, project)
 * - Enable listing and searching
 * - Support deletion tracking
 */

import { adminDb } from '@/lib/firebase/server-init';
import { Timestamp } from 'firebase-admin/firestore';

export interface IndexedDocumentRecord {
  id: string;
  projectId: string;
  userId?: string;
  sourceFile: string;
  chunksCount: number;
  fileSize: number;
  type: 'report' | 'reference' | 'context' | 'user_upload';
  timestamp: number;
  indexedAt: Timestamp;
  chunkSize: number;
  overlap: number;
  status: 'indexed' | 'failed' | 'deleted';
  errorMessage?: string;
}

const COLLECTION_NAME = 'indexed_documents';

/**
 * Record a newly indexed document
 */
export async function recordIndexedDocument(data: {
  projectId: string;
  userId?: string;
  sourceFile: string;
  chunksCount: number;
  fileSize: number;
  type: 'report' | 'reference' | 'context' | 'user_upload';
  chunkSize: number;
  overlap: number;
}): Promise<string> {
  try {
    const docRef = adminDb.collection(COLLECTION_NAME).doc();
    
    const record = {
      projectId: data.projectId,
      sourceFile: data.sourceFile,
      chunksCount: data.chunksCount,
      fileSize: data.fileSize,
      type: data.type,
      chunkSize: data.chunkSize,
      overlap: data.overlap,
      timestamp: Date.now(),
      indexedAt: Timestamp.now(),
      status: 'indexed' as const,
      ...(data.userId && { userId: data.userId }),
    };

    await docRef.set(record);
    
    console.log(`📝 Recorded document: ${data.sourceFile} (${data.chunksCount} chunks)`);
    
    return docRef.id;
  } catch (error) {
    console.error('Error recording indexed document:', error);
    throw error;
  }
}

/**
 * Record a failed indexing attempt
 */
export async function recordFailedIndexing(data: {
  projectId: string;
  userId?: string;
  sourceFile: string;
  fileSize: number;
  type: string;
  errorMessage: string;
}): Promise<string> {
  try {
    const docRef = adminDb.collection(COLLECTION_NAME).doc();
    
    const record = {
      projectId: data.projectId,
      sourceFile: data.sourceFile,
      fileSize: data.fileSize,
      type: data.type,
      chunksCount: 0,
      chunkSize: 0,
      overlap: 0,
      timestamp: Date.now(),
      indexedAt: Timestamp.now(),
      status: 'failed' as const,
      errorMessage: data.errorMessage,
      ...(data.userId && { userId: data.userId }),
    };

    await docRef.set(record);
    
    return docRef.id;
  } catch (error) {
    console.error('Error recording failed indexing:', error);
    throw error;
  }
}

/**
 * Get all indexed documents
 */
export async function getAllIndexedDocuments(): Promise<IndexedDocumentRecord[]> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where('status', '==', 'indexed')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const documents: IndexedDocumentRecord[] = [];
    
    snapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        ...(doc.data() as Omit<IndexedDocumentRecord, 'id'>),
      });
    });

    return documents;
  } catch (error) {
    console.error('Error fetching indexed documents:', error);
    return [];
  }
}

/**
 * Get documents by project ID
 */
export async function getDocumentsByProject(projectId: string): Promise<IndexedDocumentRecord[]> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where('projectId', '==', projectId)
      .where('status', '==', 'indexed')
      .orderBy('timestamp', 'desc')
      .get();

    const documents: IndexedDocumentRecord[] = [];
    
    snapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        ...(doc.data() as Omit<IndexedDocumentRecord, 'id'>),
      });
    });

    return documents;
  } catch (error) {
    console.error('Error fetching documents by project:', error);
    return [];
  }
}

/**
 * Mark document as deleted
 */
export async function markDocumentDeleted(projectId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where('projectId', '==', projectId)
      .where('status', '==', 'indexed')
      .get();

    const batch = adminDb.batch();
    
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        status: 'deleted',
        deletedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    
    console.log(`🗑️ Marked documents in project "${projectId}" as deleted`);
  } catch (error) {
    console.error('Error marking document as deleted:', error);
    throw error;
  }
}

/**
 * Get statistics about indexed documents
 */
export async function getDocumentStatistics(): Promise<{
  totalDocuments: number;
  totalChunks: number;
  projectCount: number;
  recentUploads: number;
}> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where('status', '==', 'indexed')
      .get();

    let totalChunks = 0;
    const projects = new Set<string>();
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    let recentUploads = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      totalChunks += data.chunksCount || 0;
      projects.add(data.projectId);
      if (data.timestamp > oneDayAgo) {
        recentUploads++;
      }
    });

    return {
      totalDocuments: snapshot.size,
      totalChunks,
      projectCount: projects.size,
      recentUploads,
    };
  } catch (error) {
    console.error('Error getting document statistics:', error);
    return {
      totalDocuments: 0,
      totalChunks: 0,
      projectCount: 0,
      recentUploads: 0,
    };
  }
}

/**
 * Search documents
 */
export async function searchDocuments(query: string): Promise<IndexedDocumentRecord[]> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where('status', '==', 'indexed')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const documents: IndexedDocumentRecord[] = [];
    const lowerQuery = query.toLowerCase();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const sourceFile = (data.sourceFile || '').toLowerCase();
      const projectId = (data.projectId || '').toLowerCase();
      
      if (sourceFile.includes(lowerQuery) || projectId.includes(lowerQuery)) {
        documents.push({
          id: doc.id,
          ...(data as Omit<IndexedDocumentRecord, 'id'>),
        });
      }
    });

    return documents;
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
}
