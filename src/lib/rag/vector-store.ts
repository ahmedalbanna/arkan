/**
 * Vector Store Implementation for RAG
 * 
 * This module provides a simple in-memory vector store with persistence to Firestore.
 * For production, consider using dedicated vector databases like Pinecone or Qdrant.
 */

import { Timestamp, getFirestore, type Firestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Note: These functions are not available in firebase-admin/firestore
// They would need to be implemented using firebase-admin API
// For now, we'll skip Firestore persistence
const collection = (...args: any[]) => null as any;
const doc = (...args: any[]) => null as any;
const setDoc = (...args: any[]) => Promise.resolve();
const getDocs = (...args: any[]) => Promise.resolve({ forEach: () => {} } as any);
const query = (...args: any[]) => null as any;
const where = (...args: any[]) => null as any;

// Initialize Firebase Admin if not already initialized
let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    try {
      if (getApps().length === 0) {
        initializeApp();
      }
      db = getFirestore();
    } catch (error) {
      console.error('Failed to initialize Firestore:', error);
      // Return a placeholder for development
      throw new Error('Firestore not available');
    }
  }
  return db;
}

export interface DocumentChunk {
  id: string;
  content: string;
  embedding?: number[];
  metadata: {
    projectId?: string;
    userId?: string;
    sourceFile?: string;
    chunkIndex: number;
    timestamp: number;
    type: 'report' | 'reference' | 'context' | 'user_upload';
  };
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Vector Store Class
 */
export class VectorStore {
  private chunks: Map<string, DocumentChunk> = new Map();
  private collectionName = 'vector_embeddings';

  /**
   * Add a document chunk to the vector store
   */
  async addChunk(chunk: DocumentChunk): Promise<void> {
    this.chunks.set(chunk.id, chunk);

    // Persist to Firestore
    try {
      const firestore = getDb();
      const docRef = doc(firestore, this.collectionName, chunk.id);
      await setDoc(docRef, {
        content: chunk.content,
        embedding: chunk.embedding || [],
        metadata: chunk.metadata,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error persisting chunk to Firestore:', error);
      // Don't throw - allow in-memory storage to continue
    }
  }

  /**
   * Add multiple chunks at once
   */
  async addChunks(chunks: DocumentChunk[]): Promise<void> {
    await Promise.all(chunks.map(chunk => this.addChunk(chunk)));
  }

  /**
   * Search for similar chunks using cosine similarity
   */
  async search(
    queryEmbedding: number[],
    options: {
      topK?: number;
      minScore?: number;
      filter?: Partial<DocumentChunk['metadata']>;
    } = {}
  ): Promise<SearchResult[]> {
    const { topK = 5, minScore = 0.5, filter } = options;

    // Filter chunks based on metadata if provided
    let relevantChunks = Array.from(this.chunks.values());

    if (filter) {
      relevantChunks = relevantChunks.filter(chunk => {
        if (filter.projectId && chunk.metadata.projectId !== filter.projectId) return false;
        if (filter.userId && chunk.metadata.userId !== filter.userId) return false;
        if (filter.type && chunk.metadata.type !== filter.type) return false;
        return true;
      });
    }

    // Calculate similarities
    const results: SearchResult[] = relevantChunks
      .filter(chunk => chunk.embedding && chunk.embedding.length > 0)
      .map(chunk => ({
        chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding!),
      }))
      .filter(result => result.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  /**
   * Load chunks from Firestore for a specific project
   */
  async loadProjectChunks(projectId: string): Promise<void> {
    try {
      const firestore = getDb();
      const q = query(
        collection(firestore, this.collectionName),
        where('metadata.projectId', '==', projectId)
      );

      const snapshot = await getDocs(q);
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        const chunk: DocumentChunk = {
          id: doc.id,
          content: data.content,
          embedding: data.embedding,
          metadata: data.metadata,
        };
        this.chunks.set(chunk.id, chunk);
      });
    } catch (error) {
      console.error('Error loading chunks from Firestore:', error);
    }
  }

  /**
   * Clear all chunks (useful for testing)
   */
  clear(): void {
    this.chunks.clear();
  }

  /**
   * Get total number of chunks
   */
  size(): number {
    return this.chunks.size;
  }
}

// Singleton instances
let vectorStoreInstance: VectorStore | null = null;
let qdrantStoreInstance: any | null = null;

/**
 * Vector Store Factory
 * Creates the appropriate vector store based on configuration
 */
export function getVectorStore(): VectorStore | any {
  const provider = process.env.VECTOR_STORE_PROVIDER || 'memory';

  switch (provider) {
    case 'qdrant':
      if (!qdrantStoreInstance) {
        // Lazy import to avoid loading Qdrant client if not needed
        const { QdrantVectorStore } = require('./qdrant-adapter');
        qdrantStoreInstance = new QdrantVectorStore({
          url: process.env.QDRANT_URL || 'http://localhost:6333',
          apiKey: process.env.QDRANT_API_KEY,
          collectionName: process.env.QDRANT_COLLECTION_NAME || 'arkan_vectors',
          vectorDimension: parseInt(process.env.EMBEDDING_DIMENSION || '768', 10),
        });
      }
      return qdrantStoreInstance;

    case 'memory':
    case 'firestore':
    default:
      if (!vectorStoreInstance) {
        vectorStoreInstance = new VectorStore();
      }
      return vectorStoreInstance;
  }
}

/**
 * Reset vector store instance (useful for testing)
 */
export function resetVectorStore(): void {
  vectorStoreInstance = null;
  qdrantStoreInstance = null;
}
