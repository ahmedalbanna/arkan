# 🚀 RAG Quick Start Guide

**Get your RAG system up and running in 5 minutes!**

---

## ✅ Prerequisites

- [x] Ollama server running
- [x] Arkan application installed
- [x] Firebase configured

---

## 📦 Step 1: Install Ollama Embedding Model

On your Ollama server (http://185.190.140.93:11434), run:

```bash
ollama pull nomic-embed-text
```

Verify installation:
```bash
ollama list
# Should show: nomic-embed-text and gemma:2b
```

---

## ⚙️ Step 2: Configure Environment

Your `.env` file is already configured with:
```bash
OLLAMA_SERVER_ADDRESS="http://185.190.140.93:11434"
```

No additional configuration needed! ✅

---

## 🧪 Step 3: Test RAG System

### Test 1: Check Ollama Connection

```bash
curl http://185.190.140.93:11434/api/tags
```

Should return list of available models.

### Test 2: Run Unit Tests

```bash
npm test src/lib/rag/__tests__
```

### Test 3: Test Embedding Generation

Create a test file: `test-rag.ts`

```typescript
import { generateEmbedding } from '@/lib/rag/embeddings';

async function testRAG() {
  try {
    const embedding = await generateEmbedding('Hello world');
    console.log('✅ Embedding generated!');
    console.log('Dimensions:', embedding.length); // Should be ~768
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testRAG();
```

Run it:
```bash
npx tsx test-rag.ts
```

---

## 🎯 Step 4: Use RAG in Your Application

### Option A: Use RAG-Enhanced Section Generation

```typescript
import { generateReportSectionWithRAG } from '@/ai/flows';

const output = await generateReportSectionWithRAG({
  sectionToGenerate: 'Introduction',
  prompt: 'Write an introduction...',
  projectId: 'your-project-id',
  userId: 'your-user-id',
  enableRAG: true,
  ragTopK: 5,
});
```

### Option B: Use RAG-Enhanced Chapter Generation

```typescript
import { generateChapterContentWithRAG } from '@/ai/flows';

const output = await generateChapterContentWithRAG({
  chapterTitle: 'Chapter 1',
  sectionInstructions: [...],
  projectId: 'your-project-id',
  userId: 'your-user-id',
  enableRAG: true,
  ragTopK: 8,
});
```

---

## 📄 Step 5: Index Your First Document

### Via API:

```bash
curl -X POST http://localhost:9002/api/rag/index-document \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your document content here...",
    "fileName": "research.pdf",
    "userId": "user-123",
    "projectId": "proj-456",
    "type": "reference"
  }'
```

### Via React Hook:

```typescript
import { useRAGIndexing } from '@/hooks/rag/use-rag-indexing';

function MyComponent() {
  const { indexDocument, isIndexing, success } = useRAGIndexing();

  const handleIndex = async () => {
    await indexDocument(
      'Document content...',
      'research.pdf',
      'proj-123',
      'reference'
    );
  };

  return <button onClick={handleIndex}>Index Document</button>;
}
```

---

## 🔍 Step 6: Retrieve Context

```bash
curl -X POST http://localhost:9002/api/rag/retrieve-context \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is machine learning?",
    "userId": "user-123",
    "projectId": "proj-456",
    "topK": 5
  }'
```

---

## ✨ That's It!

Your RAG system is now ready to use. The system will:

✅ Automatically chunk documents  
✅ Generate embeddings using Ollama  
✅ Store in vector database  
✅ Retrieve relevant context  
✅ Enhance AI-generated content  

---

## 📚 Next Steps

- Read [RAG_IMPLEMENTATION.md](./RAG_IMPLEMENTATION.md) for detailed documentation
- Explore API endpoints in `src/app/api/rag/`
- Check out React hooks in `src/hooks/rag/`
- Review examples in the implementation guide

---

## 🐛 Troubleshooting

**Problem:** "Failed to generate embedding"

**Solution:** 
1. Check Ollama is running: `curl http://185.190.140.93:11434/api/tags`
2. Verify nomic-embed-text is installed: `ollama list`
3. Check firewall/network connectivity

**Problem:** "No results returned"

**Solution:**
1. Index some documents first
2. Lower minScore threshold
3. Increase topK parameter

---

## 📞 Need Help?

Refer to the main documentation: [RAG_IMPLEMENTATION.md](./RAG_IMPLEMENTATION.md)
