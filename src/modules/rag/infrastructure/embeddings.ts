/**
 * Embedding Service using Ollama
 * 
 * Optimized for high-throughput document indexing and low-latency retrieval.
 * Features batch processing, concurrency control, and deterministic caching.
 */

export interface EmbeddingResult {
  embedding: number[];
  model: string;
}

/**
 * Generate embeddings using Ollama with caching.
 * 
 * OPTIMIZATIONS:
 * 1. Sanitization: Strips excessive whitespace to minimize token consumption.
 * 2. Cache-First: Resolves from LRU cache before network hit.
 * 3. Error Containment: Wraps fetch in try-catch with specific error vectors.
 */
export async function generateEmbedding(text: string, useCache: boolean = true): Promise<number[]> {
  const { RAGConfig } = await import('./config');
  
  // 1. Sanitization — Remove redundant tokens
  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (!cleanText) return [];

  // 2. Check cache
  if (useCache) {
    const { getCacheManager } = await import('./cache');
    const cache = getCacheManager().getEmbeddingCache();
    const cached = cache.getEmbedding(cleanText);
    
    if (cached) {
      return cached;
    }
  }
  
  try {
    const response = await fetch(`${RAGConfig.ollama.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: RAGConfig.ollama.embeddingModel,
        prompt: cleanText,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const embedding = data.embedding;
    
    if (useCache && embedding) {
      const { getCacheManager } = await import('./cache');
      const cache = getCacheManager().getEmbeddingCache();
      cache.setEmbedding(cleanText, embedding);
    }
    
    return embedding || [];
  } catch (error) {
    console.error('[Embeddings] Synthesis failure:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch.
 * 
 * OPTIMIZATIONS:
 * 1. Parallel Batching: Uses Promise.all for high-throughput.
 * 2. Concurrency Limit: Caps maximum simultaneous requests to Ollama (default: 5).
 */
export async function generateEmbeddings(texts: string[], concurrencyLimit: number = 5): Promise<number[][]> {
  const results: number[][] = new Array(texts.length);
  
  // simple semaphore implementation for concurrency control
  const chunks = [];
  for (let i = 0; i < texts.length; i += concurrencyLimit) {
    chunks.push(texts.slice(i, i + concurrencyLimit));
  }

  let index = 0;
  for (const chunk of chunks) {
    const batchResults = await Promise.all(
      chunk.map(text => generateEmbedding(text))
    );
    batchResults.forEach(res => {
      results[index++] = res;
    });
  }

  return results;
}

/**
 * Split text into chunks for embedding.
 * Optimized for semantic cohesion and token limits.
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

  if (!text || text.length <= chunkSize) {
    return text ? [text] : [];
  }

  const chunks: string[] = [];

  if (preserveParagraphs) {
    // Split by paragraphs first to maintain context
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      // If adding this paragraph exceeds limit
      if ((currentChunk + paragraph).length > chunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
        
        // If single paragraph is larger than chunk size, split it character-wise
        if (paragraph.length > chunkSize) {
          const subChunks = splitLongText(paragraph, chunkSize, overlap);
          chunks.push(...subChunks);
        } else {
          currentChunk = paragraph;
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }
  } else {
    return splitLongText(text, chunkSize, overlap);
  }

  return chunks;
}

/**
 * Split long text into chunks with overlap.
 */
function splitLongText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    
    if (start >= text.length - overlap || end === text.length) break;
  }

  return chunks;
}

/**
 * Calculate the number of tokens (approximate).
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Refined estimate: weighted average for mixed content
  return Math.ceil(text.length / 3.8);
}
