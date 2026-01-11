# ⚡ Qdrant Quick Start - 5 Minutes Setup

Get Qdrant vector database running with Arkan's RAG system in 5 minutes!

## 🎯 Prerequisites

- Docker installed
- Node.js 18+ 
- Ollama running with `nomic-embed-text` model

## 📦 Installation Steps

### Step 1: Start Qdrant (1 minute)

```bash
npm run qdrant:start
```

✅ Qdrant is now running at `http://localhost:6333`

### Step 2: Configure Environment (1 minute)

Add to `.env.local`:

```env
VECTOR_STORE_PROVIDER=qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=arkan_vectors
EMBEDDING_DIMENSION=768
```

### Step 3: Initialize Collection (1 minute)

```bash
npm run qdrant:test   # Test connection
npm run qdrant:init   # Create collection
```

### Step 4: Start Your App (1 minute)

```bash
npm run dev
```

### Step 5: Verify Setup (1 minute)

Open your browser and navigate to:
```
http://localhost:9002/api/rag/health
```

You should see:
```json
{
  "status": "healthy",
  "checks": {
    "vectorStore": { "status": "ok" }
  }
}
```

## 🎉 Done!

Your RAG system is now using Qdrant for production-ready vector search!

## 🔄 Migrate Existing Data

If you have vectors in Firestore:

```bash
npm run migrate:qdrant:dry-run  # Preview
npm run migrate:qdrant          # Execute
```

## 📊 Quick Commands

```bash
npm run qdrant:stats   # View collection stats
npm run qdrant:logs    # View Qdrant logs
npm run qdrant:stop    # Stop Qdrant
```

## 🆘 Troubleshooting

**Qdrant won't start?**
```bash
docker ps  # Check if running
docker logs arkan-qdrant  # Check logs
```

**Connection refused?**
- Make sure Docker is running
- Check port 6333 is not in use
- Verify `.env.local` has correct URL

## 📚 Next Steps

- [Full Setup Guide](./QDRANT_SETUP.md)
- [Vector Search Engine Docs](./VECTOR_SEARCH_ENGINE.md)
- [RAG Implementation Guide](../RAG_QUICKSTART.md)

---

**Need Help?** Check the [full documentation](./QDRANT_SETUP.md) for detailed troubleshooting.
