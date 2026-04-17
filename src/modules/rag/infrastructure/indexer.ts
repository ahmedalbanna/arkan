/**
 * Document Indexing Service
 * 
 * This module handles indexing documents into the vector store.
 * It chunks documents, generates embeddings, and stores them.
 */

import { chunkText, generateEmbeddings } from './embeddings';
import { getVectorStore } from './vector-store';
import type { DocumentChunk } from './vector-store-interface';
import { v4 as uuidv4 } from 'uuid';

export interface IndexingOptions {
  projectId?: string;
  userId?: string;
  sourceFile?: string;
  chunkSize?: number;
  overlap?: number;
  type?: 'report' | 'reference' | 'context' | 'user_upload';
}

export interface IndexingResult {
  success: boolean;
  chunksCreated: number;
  errors?: string[];
}

/**
 * Index a document into the vector store
 */
export async function indexDocument(
  content: string,
  options: IndexingOptions = {}
): Promise<IndexingResult> {
  const {
    projectId,
    userId,
    sourceFile,
    chunkSize = 500,
    overlap = 50,
    type = 'context',
  } = options;

  const errors: string[] = [];

  try {
    // 1. Split document into chunks
    const textChunks = chunkText(content, {
      chunkSize,
      overlap,
      preserveParagraphs: true,
    });

    console.log(`Split document into ${textChunks.length} chunks`);

    // 2. Generate embeddings for all chunks
    let embeddings: number[][];
    try {
      embeddings = await generateEmbeddings(textChunks);
    } catch (error) {
      errors.push(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        chunksCreated: 0,
        errors,
      };
    }

    // 3. Create document chunks with embeddings
    const documentChunks: DocumentChunk[] = textChunks.map((chunk, idx) => ({
      id: uuidv4(),
      content: chunk,
      embedding: embeddings[idx],
      metadata: {
        projectId,
        userId,
        sourceFile,
        chunkIndex: idx,
        timestamp: Date.now(),
        type,
      },
    }));

    // 4. Add chunks to vector store
    const vectorStore = getVectorStore();
    await vectorStore.addChunks(documentChunks);

    console.log(`Successfully indexed ${documentChunks.length} chunks`);

    return {
      success: true,
      chunksCreated: documentChunks.length,
    };
  } catch (error) {
    console.error('Error indexing document:', error);
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    
    return {
      success: false,
      chunksCreated: 0,
      errors,
    };
  }
}

/**
 * Index multiple documents at once
 */
export async function indexDocuments(
  documents: Array<{ content: string; options: IndexingOptions }>,
): Promise<IndexingResult[]> {
  return Promise.all(
    documents.map(doc => indexDocument(doc.content, doc.options))
  );
}

/**
 * Index project context (sections, chapters, etc.)
 * This is called when a report is generated to make it available for RAG
 */
export async function indexProjectContext(
  projectId: string,
  userId: string,
  context: {
    sections?: Array<{ title: string; content: string }>;
    chapters?: Array<{ title: string; content: string }>;
    otherDocuments?: Array<{ title: string; content: string }>;
  }
): Promise<IndexingResult> {
  const documents: Array<{ content: string; options: IndexingOptions }> = [];

  // Add sections
  if (context.sections) {
    context.sections.forEach(section => {
      documents.push({
        content: `# ${section.title}\n\n${section.content}`,
        options: {
          projectId,
          userId,
          sourceFile: `Section: ${section.title}`,
          type: 'report',
        },
      });
    });
  }

  // Add chapters
  if (context.chapters) {
    context.chapters.forEach(chapter => {
      documents.push({
        content: `# ${chapter.title}\n\n${chapter.content}`,
        options: {
          projectId,
          userId,
          sourceFile: `Chapter: ${chapter.title}`,
          type: 'report',
        },
      });
    });
  }

  // Add other documents
  if (context.otherDocuments) {
    context.otherDocuments.forEach(doc => {
      documents.push({
        content: `# ${doc.title}\n\n${doc.content}`,
        options: {
          projectId,
          userId,
          sourceFile: doc.title,
          type: 'context',
        },
      });
    });
  }

  const results = await indexDocuments(documents);

  // Aggregate results
  const totalChunks = results.reduce((sum, r) => sum + r.chunksCreated, 0);
  const allErrors = results.flatMap(r => r.errors || []);

  return {
    success: results.every(r => r.success),
    chunksCreated: totalChunks,
    errors: allErrors.length > 0 ? allErrors : undefined,
  };
}
