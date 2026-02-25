/**
 * RAG Configuration
 * 
 * Centralized configuration for RAG and vector search functionality.
 */

export const RAGConfig = {
  // Vector Store Configuration
  vectorStore: {
    provider: process.env.VECTOR_STORE_PROVIDER || 'memory',
    dimension: parseInt(process.env.EMBEDDING_DIMENSION || '768', 10),
  },

  // Qdrant Configuration
  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: process.env.QDRANT_COLLECTION_NAME || 'arkan_vectors',
    batchSize: 100,
  },

  // Ollama Configuration
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://185.190.140.93:11434',
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
  },

  // Chunking Configuration
  chunking: {
    chunkSize: 500,
    overlap: 50,
    preserveParagraphs: true,
  },

  // Search Configuration
  search: {
    defaultTopK: 5,
    defaultMinScore: 0.5,
    maxTopK: 20,
  },

  // Cache Configuration
  cache: {
    embeddingCacheTTL: 24 * 60 * 60 * 1000, // 24 hours
    searchResultCacheTTL: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Validate RAG configuration
 */
export function validateRAGConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate vector dimension
  if (RAGConfig.vectorStore.dimension <= 0) {
    errors.push('EMBEDDING_DIMENSION must be a positive number');
  }

  // Validate Qdrant URL if using Qdrant
  if (RAGConfig.vectorStore.provider === 'qdrant') {
    if (!RAGConfig.qdrant.url) {
      errors.push('QDRANT_URL is required when using Qdrant provider');
    }
    
    try {
      new URL(RAGConfig.qdrant.url);
    } catch {
      errors.push('QDRANT_URL must be a valid URL');
    }
  }

  // Validate Ollama URL
  try {
    new URL(RAGConfig.ollama.baseUrl);
  } catch {
    errors.push('OLLAMA_BASE_URL must be a valid URL');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
