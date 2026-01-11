# ⚡ Qdrant RAG System - Quick Reference Card

## 🚀 Essential Commands

```bash
# Start/Stop Qdrant
npm run qdrant:start          # Start container
npm run qdrant:stop           # Stop container
npm run qdrant:logs           # View logs

# Monitor System
npm run qdrant:stats          # View statistics
npm run qdrant:test           # Test connection
curl http://localhost:9002/api/rag/health  # Health check

# Testing & Demo
npx tsx scripts/test-qdrant-indexing.ts    # Run full demo

# Migration (if needed)
npm run migrate:qdrant:dry-run   # Preview
npm run migrate:qdrant           # Execute
```

## 🌐 Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Admin Dashboard** | http://localhost:9002/admin/rag-monitor | Monitor & test RAG |
| **Health API** | http://localhost:9002/api/rag/health | System status JSON |
| **Stats API** | http://localhost:9002/api/rag/stats | Statistics JSON |
| **Qdrant API** | http://localhost:6333 | Direct Qdrant |
| **Qdrant UI** | http://localhost:3100 | Visual explorer |

## 💻 Code Examples

### Index a Document
```typescript
import { indexDocument } from '@/lib/rag';

const result = await indexDocument(content, {
  projectId: 'my-project',
  userId: 'user-123',
  sourceFile: 'document.pdf',
  type: 'context',
});

console.log(`Indexed ${result.chunksCreated} chunks`);
```

### Search for Context
```typescript
import { retrieveContext } from '@/lib/rag';

const result = await retrieveContext(query, {
  projectId: 'my-project',
  topK: 5,
  minScore: 0.7,
});

console.log(`Found ${result.sources.length} relevant chunks`);
```

### Use in AI Flow
```typescript
import { generateReportSectionWithRAG } from '@/ai/flows';

// Automatically uses Qdrant for context!
const section = await generateReportSectionWithRAG({
  projectId: 'my-project',
  sectionTitle: 'Introduction',
  outline: ['Background'],
});
```

## 📊 Current Status

```
✅ Qdrant:       Running (localhost:6333)
✅ Collection:   arkan_vectors (13 chunks)
✅ Projects:     3 test projects indexed
✅ Health:       All systems healthy
✅ Dashboard:    /admin/rag-monitor
```

## 🎯 Best Practices

### Indexing
✅ Use batch operations for multiple docs  
✅ Add meaningful project IDs  
✅ Set appropriate chunk sizes (300-500)  
✅ Include source file names  

### Searching
✅ Always filter by projectId in production  
✅ Use topK between 3-10  
✅ Set minScore > 0.7 for quality  
✅ Monitor search latency  

### Maintenance
✅ Check health regularly  
✅ Monitor chunk count growth  
✅ Back up qdrant_storage/  
✅ Review query performance  

## 🐛 Troubleshooting

**Qdrant not connecting?**
```bash
docker ps | grep qdrant      # Check if running
docker logs arkan-qdrant     # View logs
npm run qdrant:start         # Restart
```

**No search results?**
```bash
npm run qdrant:stats         # Check data exists
# Lower minScore or check projectId filter
```

**Slow searches?**
```bash
# Use projectId filter
# Reduce topK
# Check Qdrant resource usage
```

## 📚 Documentation

- **Full Setup**: [docs/QDRANT_SETUP.md](./docs/QDRANT_SETUP.md)
- **Quick Start**: [docs/QDRANT_QUICKSTART.md](./docs/QDRANT_QUICKSTART.md)
- **Architecture**: [docs/RAG_ARCHITECTURE.md](./docs/RAG_ARCHITECTURE.md)
- **Demo Summary**: [QDRANT_LIVE_DEMO_SUMMARY.md](./QDRANT_LIVE_DEMO_SUMMARY.md)
- **Implementation**: [QDRANT_IMPLEMENTATION_SUMMARY.md](./QDRANT_IMPLEMENTATION_SUMMARY.md)

## 🎊 What You Have

✅ Production-ready vector database  
✅ 13 test chunks indexed  
✅ Monitoring dashboard  
✅ Query testing tool  
✅ Health monitoring  
✅ Migration scripts  
✅ Complete documentation  

## 🚀 Start Building!

Your RAG system is ready. Start indexing real documents and building amazing AI features!

---

**Need Help?** Check the documentation or run:
```bash
npm run qdrant:stats
curl http://localhost:9002/api/rag/health
```
