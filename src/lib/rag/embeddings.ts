/**
 * Embedding Service using Ollama
 * 
 * This module provides text embedding functionality using Ollama's embedding models.
 * Ollama supports models like nomic-embed-text for generating embeddings.
 */

import { ollamaConfig } from '@/lib/config';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
}

/**
 * Generate embeddings using Ollama
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch(`${ollamaConfig.serverAddress}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nomic-embed-text', // Ollama embedding model
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    // Process in parallel for better performance
    const embeddings = await Promise.all(
      texts.map(text => generateEmbedding(text))
    );
    return embeddings;
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw error;
  }
}

/**
 * Split text into chunks for embedding
 * This is important because embedding models have token limits
 */
export function chunkText(
  text: string,
  options: {
    chunkSize?: number;
    overlap?: number;
    preserveParagraphs?: boolean;
  } = {}
): string[] {
  const {
    chunkSize = 500, // characters
    overlap = 50,
    preserveParagraphs = true,
  } = options;

  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];

  if (preserveParagraphs) {
    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length <= chunkSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        
        // If single paragraph is larger than chunk size, split it
        if (paragraph.length > chunkSize) {
          const subChunks = splitLongText(paragraph, chunkSize, overlap);
          chunks.push(...subChunks);
          currentChunk = '';
        } else {
          currentChunk = paragraph;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }
  } else {
    // Simple character-based chunking with overlap
    return splitLongText(text, chunkSize, overlap);
  }

  return chunks;
}

/**
 * Split long text into chunks with overlap
 */
function splitLongText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    
    if (start >= text.length - overlap) break;
  }

  return chunks;
}

/**
 * Calculate the number of tokens (approximate)
 * This is a rough estimate: ~4 characters per token for English
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
