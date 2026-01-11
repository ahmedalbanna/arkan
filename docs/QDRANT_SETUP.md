# 🚀 Qdrant Vector Database Setup Guide

This guide will help you set up and configure Qdrant as the vector database backend for Arkan's RAG system.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Migration from Firestore](#migration-from-firestore)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## Prerequisites

Before you begin, ensure you have:

- **Docker & Docker Compose** installed
- **Node.js 18+** and npm
- **Ollama** running with `nomic-embed-text` model
- **Firebase** configured (existing setup)

## Quick Start

### 1. Start Qdrant

```bash
# Start Qdrant using Docker Compose
npm run qdrant:start

# Check logs to ensure it's running
npm run qdrant:logs
```

Qdrant will be available at:
- **API**: `http://localhost:6333`
- **Web UI**: `http://localhost:3100` (for debugging)

### 2. Configure Environment

Create or update `.env.local`:

```bash
# Copy example configuration
cp .env.local.example .env.local
```

Update the following variables:

```env
# Vector Store Configuration
VECTOR_STORE_PROVIDER=qdrant
EMBEDDING_DIMENSION=768
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=arkan_vectors

# Ollama Configuration
OLLAMA_BASE_URL=http://185.190.140.93:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

### 3. Initialize Qdrant Collection

```bash
# Test connection
npm run qdrant:test

# Initialize collection with proper schema
npm run qdrant:init

# Verify setup
npm run qdrant:stats
```

### 4. Migrate Existing Data (Optional)

If you have existing vectors in Firestore:

```bash
# Dry run to see what would be migrated
npm run migrate:qdrant:dry-run

# Actual migration
npm run migrate:qdrant
```

### 5. Start Development Server

```bash
npm run dev
```

Your RAG system is now using Qdrant! 🎉

---

## Configuration

### Vector Store Providers

Arkan supports multiple vector store backends:

| Provider | Best For | Setup Complexity |
|----------|----------|------------------|
| `qdrant` | Production, scalability | Medium |
| `memory` | Development, testing | Easy |
| `firestore` | Firebase-only setup | Easy |

Switch providers by changing `VECTOR_STORE_PROVIDER` in `.env.local`.

### Qdrant Configuration Options

```env
# Required
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=arkan_vectors
EMBEDDING_DIMENSION=768

# Optional
QDRANT_API_KEY=your-api-key-here  # For Qdrant Cloud or secured instances
```

### Collection Schema

Qdrant collections are automatically created with:

- **Vector Size**: 768 (nomic-embed-text dimension)
- **Distance Metric**: Cosine similarity
- **Indexed Fields**: `projectId`, `userId`, `type`, `timestamp`
- **Optimizers**: 2 default segments for balanced performance

---

## Migration from Firestore

### Understanding the Migration Process

The migration script:
1. Reads all vectors from Firestore collection `vector_embeddings`
2. Transfers them to Qdrant in batches
3. Validates the migration
4. Optionally cleans up old data

### Step-by-Step Migration

#### 1. Backup Your Data

```bash
# Export Firestore data (using Firebase CLI)
firebase firestore:export gs://your-bucket/backup-$(date +%Y%m%d)
```

#### 2. Run Dry Run

```bash
npm run migrate:qdrant:dry-run
```

Expected output:
```
🚀 Starting migration to Qdrant...
Mode: DRY RUN
Found 250 documents in Firestore
🔍 DRY RUN: Would migrate 250 chunks
```

#### 3. Execute Migration

```bash
npm run migrate:qdrant
```

Monitor the progress:
```
📖 Reading vectors from Firestore...
Found 250 documents in Firestore
📤 Migrating 250 chunks to Qdrant...
  ✓ Batch 1/3 migrated (100 chunks)
  ✓ Batch 2/3 migrated (100 chunks)
  ✓ Batch 3/3 migrated (50 chunks)
🔍 Verifying migration...
  ✅ Migration verified successfully
```

#### 4. Verify Migration

```bash
# Check Qdrant statistics
npm run qdrant:stats

# Test search functionality
npm run dev
# Navigate to /admin/rag-health to check system status
```

#### 5. Switch to Qdrant

Update `.env.local`:
```env
VECTOR_STORE_PROVIDER=qdrant
```

Restart your application.

### Migration Script Options

```bash
# Custom batch size
npx tsx scripts/migrate-to-qdrant.ts --batch-size=50

# With Firestore cleanup (use with caution!)
npx tsx scripts/migrate-to-qdrant.ts --cleanup

# Show help
npx tsx scripts/migrate-to-qdrant.ts --help
```

---

## Monitoring & Maintenance

### Health Checks

#### API Endpoint

```bash
curl http://localhost:9002/api/rag/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-10T20:00:00Z",
  "checks": {
    "config": { "status": "ok" },
    "vectorStore": { 
      "status": "ok",
      "details": {
        "totalChunks": 1500,
        "vectorDimension": 768
      }
    },
    "ollama": { "status": "ok" }
  }
}
```

#### Admin Dashboard

Navigate to: `http://localhost:9002/admin`

Add the RAG Health Monitor component to view real-time status.

### CLI Utilities

```bash
# Get collection statistics
npm run qdrant:stats

# Test connection
npm run qdrant:test

# View Qdrant logs
npm run qdrant:logs

# Reinitialize collection (destructive!)
npm run qdrant:init
```

### Performance Monitoring

Track these metrics:

1. **Search Latency**: Should be < 100ms for most queries
2. **Indexing Speed**: ~50-100 chunks/second
3. **Memory Usage**: Monitor Docker container memory
4. **Disk Usage**: Check `./qdrant_storage` directory

```bash
# Check Docker container stats
docker stats arkan-qdrant

# Check storage size
du -sh ./qdrant_storage
```

### Regular Maintenance

#### Weekly Tasks
- Review search quality metrics
- Check for orphaned chunks
- Monitor disk usage

#### Monthly Tasks
- Analyze query patterns
- Optimize chunk size if needed
- Review indexing strategy

---

## Troubleshooting

### Common Issues

#### 1. Qdrant Won't Start

**Symptom**: `Cannot connect to Qdrant at localhost:6333`

**Solutions**:
```bash
# Check if port is already in use
lsof -i :6333

# Restart Docker container
docker-compose restart qdrant

# Check Docker logs
docker logs arkan-qdrant
```

#### 2. Migration Fails

**Symptom**: `Error: Failed to add chunks`

**Solutions**:
- Check Qdrant has enough disk space
- Verify embedding dimensions match (768)
- Try smaller batch size: `--batch-size=50`
- Check Firestore permissions

#### 3. Search Returns No Results

**Symptom**: Empty search results despite indexed data

**Solutions**:
```bash
# Verify data was indexed
npm run qdrant:stats

# Check collection exists
curl http://localhost:6333/collections

# Test with health check
curl http://localhost:9002/api/rag/health
```

#### 4. Slow Search Performance

**Solutions**:
- Enable payload indexes (auto-created on init)
- Increase Qdrant memory allocation
- Use filters to narrow search scope
- Consider increasing `default_segment_number`

#### 5. Embedding Generation Fails

**Symptom**: `Failed to generate embedding: Connection refused`

**Solutions**:
```bash
# Check Ollama is running
curl http://185.190.140.93:11434/api/tags

# Verify model is available
ollama list | grep nomic-embed-text

# Pull model if missing
ollama pull nomic-embed-text
```

### Debug Mode

Enable verbose logging:

```env
# .env.local
DEBUG=qdrant:*
LOG_LEVEL=debug
```

### Reset Everything

If you need to start fresh:

```bash
# Stop Qdrant
npm run qdrant:stop

# Remove data
rm -rf ./qdrant_storage

# Restart and reinitialize
npm run qdrant:start
npm run qdrant:init
```

---

## Production Deployment

### Docker Compose for Production

Update `docker-compose.yml`:

```yaml
services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: arkan-qdrant-prod
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT_ALLOW_RECOVERY_MODE=true
    restart: always
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G

volumes:
  qdrant_data:
    driver: local
```

### Qdrant Cloud

For managed Qdrant:

1. Sign up at [cloud.qdrant.io](https://cloud.qdrant.io)
2. Create a cluster
3. Update `.env.production`:

```env
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-api-key
QDRANT_COLLECTION_NAME=arkan_vectors_prod
```

### Scaling Recommendations

| Data Size | Recommended Setup |
|-----------|-------------------|
| < 100K vectors | Single Qdrant instance (2GB RAM) |
| 100K - 1M vectors | Single instance (4-8GB RAM) |
| > 1M vectors | Consider Qdrant Cloud with scaling |

### Security Checklist

- [ ] Enable API key authentication
- [ ] Use HTTPS/TLS for connections
- [ ] Restrict network access (firewall rules)
- [ ] Regular backups of `qdrant_storage`
- [ ] Monitor for unusual query patterns
- [ ] Keep Qdrant updated

### Backup Strategy

```bash
# Backup Qdrant data
docker exec arkan-qdrant tar czf /tmp/backup.tar.gz /qdrant/storage
docker cp arkan-qdrant:/tmp/backup.tar.gz ./backups/qdrant-$(date +%Y%m%d).tar.gz

# Restore from backup
docker cp ./backups/qdrant-20240110.tar.gz arkan-qdrant:/tmp/
docker exec arkan-qdrant tar xzf /tmp/qdrant-20240110.tar.gz -C /
docker restart arkan-qdrant
```

---

## Performance Optimization

### Indexing Optimization

```typescript
// Use batch operations
await vectorStore.addChunks(chunks); // Good
// vs
for (const chunk of chunks) {
  await vectorStore.addChunk(chunk); // Slow
}
```

### Search Optimization

```typescript
// Use filters to reduce search space
await retrieveContext(query, {
  projectId: 'specific-project', // Filter by project
  topK: 5, // Limit results
  minScore: 0.7, // Higher threshold = faster
});
```

### Collection Settings

For large datasets, tune collection parameters:

```typescript
// In qdrant-adapter.ts, adjust createCollection:
optimizers_config: {
  default_segment_number: 4, // More segments = better parallelism
  indexing_threshold: 20000, // Optimize for your data size
},
```

---

## Additional Resources

- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Ollama Models](https://ollama.ai/library)
- [Vector Search Best Practices](https://qdrant.tech/articles/vector-search-best-practices/)
- [Arkan RAG Implementation](./VECTOR_SEARCH_ENGINE.md)

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review logs: `npm run qdrant:logs`
3. Test health: `curl http://localhost:9002/api/rag/health`
4. Open an issue with detailed error messages

---

**Last Updated**: January 2026  
**Version**: 1.0.0
