# 🏗️ RAG Architecture Reference

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  • Next.js 15 App Router                                        │
│  • React Components (Report Builder, Writing Tools)             │
│  • Admin Dashboard (RAG Health Monitor)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
│  • /api/rag/index-document    (Indexing)                        │
│  • /api/rag/retrieve-context  (Retrieval)                       │
│  • /api/rag/health            (Health Check)                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AI Flows Layer                              │
│  • generateReportSectionWithRAG                                  │
│  • generateChapterContentWithRAG                                 │
│  • Other AI flows with context enhancement                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      RAG Services                                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Indexer    │  │  Retrieval   │  │  Embeddings  │          │
│  │             │  │              │  │              │          │
│  │ • Chunking  │  │ • Query      │  │ • Ollama API │          │
│  │ • Metadata  │  │ • Filtering  │  │ • Caching    │          │
│  │ • Batching  │  │ • Ranking    │  │ • Batch ops  │          │
│  └─────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Vector Store Factory                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  if (PROVIDER === 'qdrant')  → QdrantVectorStore         │  │
│  │  if (PROVIDER === 'memory')  → VectorStore (in-memory)   │  │
│  │  if (PROVIDER === 'firestore') → VectorStore (Firebase)  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Storage Backends                              │
│                                                                  │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │    Qdrant      │  │  In-Memory Map  │  │   Firestore     │ │
│  │  (Production)  │  │  (Development)  │  │  (Fallback)     │ │
│  └────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Document Indexing Flow

```
User uploads document
         ↓
API: /api/rag/index-document
         ↓
indexer.indexDocument()
         ↓
    ┌────────────────────┐
    │ Text Chunking      │ ← chunkText() with overlap
    └────────────────────┘
         ↓
    ┌────────────────────┐
    │ Generate Embeddings│ ← Ollama API (nomic-embed-text)
    └────────────────────┘
         ↓
    ┌────────────────────┐
    │ Create Chunks      │ ← Add metadata (projectId, type, etc.)
    └────────────────────┘
         ↓
vectorStore.addChunks()
         ↓
Qdrant Collection (arkan_vectors)
```

### 2. Context Retrieval Flow

```
AI Flow needs context
         ↓
retrieveContext(query, options)
         ↓
    ┌────────────────────┐
    │ Generate Query     │ ← Ollama embedding
    │ Embedding          │
    └────────────────────┘
         ↓
vectorStore.search(embedding, filters)
         ↓
    ┌────────────────────┐
    │ Vector Similarity  │ ← Cosine similarity search
    │ Search in Qdrant   │
    └────────────────────┘
         ↓
    ┌────────────────────┐
    │ Filter by Metadata │ ← projectId, userId, type
    └────────────────────┘
         ↓
    ┌────────────────────┐
    │ Rank & Return Top-K│ ← Sort by score, limit results
    └────────────────────┘
         ↓
Return formatted context to AI
```

### 3. RAG-Enhanced Generation Flow

```
User requests report section
         ↓
generateReportSectionWithRAG(input)
         ↓
    ┌────────────────────┐
    │ Retrieve Context   │ ← retrieveContext() with filters
    └────────────────────┘
         ↓
    ┌────────────────────┐
    │ Build Enhanced     │ ← Combine: prompt + RAG context + 
    │ Prompt             │   project sections + diagrams
    └────────────────────┘
         ↓
    ┌────────────────────┐
    │ Generate with AI   │ ← Genkit + Gemini
    └────────────────────┘
         ↓
Validate & return section content
```

---

## Components

### Core Files Structure

```
src/lib/rag/
├── config.ts                    # Centralized configuration
├── vector-store-interface.ts    # TypeScript interfaces
├── vector-store.ts              # Factory + in-memory impl
├── qdrant-adapter.ts            # Qdrant implementation
├── embeddings.ts                # Ollama integration
├── indexer.ts                   # Document indexing
├── retrieval.ts                 # Context retrieval
├── index.ts                     # Barrel exports
└── __tests__/
    ├── embeddings.test.ts
    ├── vector-store.test.ts
    ├── qdrant-adapter.test.ts
    └── integration.test.ts
```

### Configuration System

```typescript
// src/lib/rag/config.ts
export const RAGConfig = {
  vectorStore: {
    provider: 'qdrant' | 'memory' | 'firestore',
    dimension: 768,
  },
  qdrant: {
    url: 'http://localhost:6333',
    collectionName: 'arkan_vectors',
    batchSize: 100,
  },
  ollama: {
    baseUrl: 'http://185.190.140.93:11434',
    embeddingModel: 'nomic-embed-text',
  },
  chunking: {
    chunkSize: 500,
    overlap: 50,
  },
  search: {
    defaultTopK: 5,
    defaultMinScore: 0.5,
  },
};
```

---

## Key Interfaces

### DocumentChunk
```typescript
interface DocumentChunk {
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
```

### IVectorStore
```typescript
interface IVectorStore {
  addChunk(chunk: DocumentChunk): Promise<void>;
  addChunks(chunks: DocumentChunk[]): Promise<void>;
  search(embedding: number[], options?: SearchOptions): Promise<SearchResult[]>;
  loadProjectChunks(projectId: string): Promise<void>;
  clear(): void | Promise<void>;
  size(): number | Promise<number>;
}
```

---

## Qdrant Collection Schema

### Collection Configuration
```json
{
  "name": "arkan_vectors",
  "vectors": {
    "size": 768,
    "distance": "Cosine"
  },
  "optimizers_config": {
    "default_segment_number": 2
  }
}
```

### Payload Structure
```json
{
  "id": "uuid-v4",
  "vector": [0.123, 0.456, ...],  // 768 dimensions
  "payload": {
    "content": "text content",
    "projectId": "project-123",
    "userId": "user-456",
    "sourceFile": "document.pdf",
    "chunkIndex": 0,
    "timestamp": 1704931200000,
    "type": "context"
  }
}
```

### Indexed Fields
- `projectId` (keyword)
- `userId` (keyword)
- `type` (keyword)
- `timestamp` (integer)

---

## Performance Characteristics

### Indexing Performance
- **Single document**: ~100-200ms
- **Batch (100 chunks)**: ~2-3 seconds
- **Throughput**: ~50-100 chunks/second
- **Bottleneck**: Embedding generation (Ollama)

### Search Performance
- **Simple search**: < 50ms
- **Filtered search**: < 100ms
- **Complex queries**: < 200ms
- **Bottleneck**: Query embedding + network

### Scalability
| Vectors | RAM | Search Time | Indexing Time |
|---------|-----|-------------|---------------|
| 10K | 500MB | < 50ms | 2 min |
| 100K | 2GB | < 100ms | 20 min |
| 1M | 8GB | < 200ms | 3 hours |
| 10M | 32GB+ | < 500ms | 30+ hours |

---

## Environment Variables

### Required
```env
VECTOR_STORE_PROVIDER=qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=arkan_vectors
EMBEDDING_DIMENSION=768
OLLAMA_BASE_URL=http://185.190.140.93:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

### Optional
```env
QDRANT_API_KEY=your-api-key-for-cloud
```

---

## API Endpoints

### POST /api/rag/index-document
Index a document into the vector store.

**Request**:
```json
{
  "content": "document text",
  "projectId": "project-123",
  "userId": "user-456",
  "sourceFile": "document.pdf",
  "type": "context"
}
```

**Response**:
```json
{
  "success": true,
  "chunksCreated": 15
}
```

### POST /api/rag/retrieve-context
Retrieve relevant context for a query.

**Request**:
```json
{
  "query": "what is machine learning?",
  "projectId": "project-123",
  "topK": 5,
  "minScore": 0.7
}
```

**Response**:
```json
{
  "context": "formatted context string",
  "sources": [
    {
      "content": "chunk content",
      "score": 0.95,
      "sourceFile": "ml-intro.pdf"
    }
  ]
}
```

### GET /api/rag/health
Get health status of RAG system.

**Response**:
```json
{
  "status": "healthy",
  "checks": {
    "vectorStore": { "status": "ok", "totalChunks": 1500 },
    "ollama": { "status": "ok" }
  }
}
```

---

## Monitoring & Observability

### Health Checks
1. **Vector Store**: Connectivity and collection status
2. **Ollama**: Embedding service availability
3. **Configuration**: Validation of env variables

### Metrics to Track
- Search latency (p50, p95, p99)
- Indexing throughput
- Vector count per project
- Embedding cache hit rate
- Error rates

### Logging
```typescript
// Automatic logging in:
- indexDocument() - chunks created, errors
- retrieveContext() - queries, results count
- QdrantVectorStore - operations, performance
```

---

## Security Considerations

### Access Control
- Project-based isolation via `projectId` filter
- User-based filtering via `userId`
- No cross-project data leakage

### Data Protection
- Vectors stored with minimal metadata
- No sensitive content in payload
- Regular backups recommended

### API Security
- Optional Qdrant API key
- Network isolation via Docker
- Rate limiting on API routes

---

## Migration Strategy

### From In-Memory/Firestore to Qdrant

1. **Prepare**:
   ```bash
   npm run qdrant:start
   npm run qdrant:init
   ```

2. **Test**:
   ```bash
   npm run migrate:qdrant:dry-run
   ```

3. **Execute**:
   ```bash
   npm run migrate:qdrant
   ```

4. **Verify**:
   ```bash
   npm run qdrant:stats
   curl http://localhost:9002/api/rag/health
   ```

5. **Switch**:
   ```env
   VECTOR_STORE_PROVIDER=qdrant
   ```

---

## Troubleshooting Guide

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Connection refused | Qdrant not running | `npm run qdrant:start` |
| No search results | Data not indexed | Check `qdrant:stats` |
| Slow searches | Large dataset | Add filters, increase memory |
| Embedding fails | Ollama down | Check Ollama service |
| Migration fails | Invalid data | Use `--dry-run` first |

### Debug Commands
```bash
# Check Qdrant status
docker ps | grep qdrant

# View logs
npm run qdrant:logs

# Test connection
npm run qdrant:test

# Get statistics
npm run qdrant:stats

# Health check
curl http://localhost:9002/api/rag/health
```

---

## Best Practices

### Indexing
1. ✅ Batch multiple documents together
2. ✅ Use appropriate chunk sizes (500 chars)
3. ✅ Add meaningful metadata
4. ✅ Index after content changes
5. ❌ Don't index during high-traffic periods

### Retrieval
1. ✅ Use filters to narrow search scope
2. ✅ Set appropriate `topK` (3-10)
3. ✅ Use higher `minScore` for quality
4. ✅ Cache frequent queries
5. ❌ Don't retrieve without filters in prod

### Production
1. ✅ Use Qdrant Cloud or managed instance
2. ✅ Enable health monitoring
3. ✅ Regular backups of vector data
4. ✅ Monitor resource usage
5. ✅ Use API keys for security

---

## References

- [Qdrant Setup Guide](./QDRANT_SETUP.md)
- [Quick Start Guide](./QDRANT_QUICKSTART.md)
- [Vector Search Engine](./VECTOR_SEARCH_ENGINE.md)
- [RAG Quick Start](../RAG_QUICKSTART.md)
- [Implementation Summary](../QDRANT_IMPLEMENTATION_SUMMARY.md)

---

**Last Updated**: January 10, 2026  
**Maintained By**: Arkan Development Team
