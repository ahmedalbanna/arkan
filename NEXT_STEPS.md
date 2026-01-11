## ✅ COMPLETED: Qdrant Vector Database Integration

The RAG system has been successfully upgraded with **Qdrant** as the production vector database backend!

### What Was Implemented:
- ✅ Qdrant Docker setup with docker-compose
- ✅ QdrantVectorStore adapter implementing full interface
- ✅ Vector store factory with provider switching
- ✅ Migration scripts from Firestore to Qdrant
- ✅ Health monitoring API and admin dashboard
- ✅ Comprehensive test suite
- ✅ Complete documentation

### Quick Start:
```bash
npm run qdrant:start  # Start Qdrant
npm run qdrant:init   # Initialize collection
npm run dev           # Start app with Qdrant
```

See [QDRANT_SETUP.md](./docs/QDRANT_SETUP.md) for complete guide.

---

## Original Arabic Guide (Reference)

تصميم وتنفيذ محرك بحث يعتمد على تقنية RAG (Retrieval-Augmented Generation) هو تطبيق عملي ومتقدم لأدوات الذكاء الاصطناعي. سنركز هنا على تطبيق ذلك باستخدام Genkit، مع استخدام **Qdrant** (تم التنفيذ!) كخيار ممتاز لقاعدة بيانات المتجهات.

سنفترض أنك تستخدم Genkit في مشروعك وأنك تريد تحقيق هذا على سيرفرك المحلي.

---

## المكونات المطلوبة

1.  **Embedder:** (في حالتنا: نموذج `nomic-embed-text` من Ollama).
2.  **Vector DB:** PostgreSQL مع ملحق `pgvector`.
3.  **Indexer:** وظيفة Genkit لجلب المستندات وفهرستها في Vector DB.
4.  **Retriever:** وظيفة Genkit للبحث في Vector DB واسترجاع الوثائق ذات الصلة.

---

## المرحلة الأولى: إعداد قاعدة البيانات والـ Embedder

### 1. إعداد PostgreSQL و pgvector

لنفترض أنك قمت بتثبيت PostgreSQL على سيرفرك المحلي.

**خطوات الإعداد:**

1.  **تثبيت ملحق `pgvector`:**
    ```sql
    CREATE EXTENSION IF NOT EXISTS vector;
    ```
2.  **إنشاء جدول لتخزين الوثائق والمتجهات:**

    ```sql
    CREATE TABLE documents (
        id SERIAL PRIMARY KEY,
        content TEXT,               -- النص الأصلي للوثيقة
        metadata JSONB,             -- بيانات وصفية (مثل العنوان، التاريخ)
        embedding VECTOR(768)       -- حقل المتجه (768 هو حجم متجه nomic-embed-text)
    );
    ```

### 2. إعداد Embedder المحلي (Ollama)

سنستخدم نموذج `nomic-embed-text`، وهو نموذج تضمين مفتوح المصدر وممتاز.

1.  **تشغيل نموذج التضمين في Ollama:**
    ```bash
    ollama run nomic-embed-text
    ```
2.  **تكوين Genkit لاستخدام Embedder Ollama:**

    ```typescript
    // genkit.config.ts
    import { ollama, ollamaEmbedder } from '@genkit-ai/ollama';

    configureGenkit({
      plugins: [
        ollama({
          serverAddress: 'http://localhost:11434',
        }),
        // تعريف الـ Embedder
        ollamaEmbedder({
            name: 'nomicEmbedder',
            model: 'nomic-embed-text', 
        }),
      ],
    });
    ```

---

## المرحلة الثانية: Indexer (الفهرسة)

وظيفة Indexer هي قراءة بياناتك الداخلية وإضافتها كمتجهات إلى جدول `documents` في PostgreSQL.

### 3. تعريف الـ Indexer (وظيفة Genkit)

في Genkit، تحتاج إلى ربط الـ Indexer بمكتبة تساعد في التفاعل مع قاعدة البيانات، مثل `@genkit-ai/pg`. (إذا لم يكن متوفراً بشكل رسمي، يمكن بناء وظيفة مخصصة للتفاعل مع Postgres).

لأغراض الشرح، سنقوم بمحاكاة الفهرسة باستخدام وظيفة مخصصة تتفاعل مع Postgres (باستخدام مكتبة مثل `pg` أو `node-postgres`).

```typescript
// indexer.ts
import { defineIndexer, Chunk, Document, embed, GenkitError } from '@genkit-ai/core';
import { Pool } from 'pg'; // افترض أنك تستخدم node-postgres

// تعريف Pool قاعدة البيانات
const pgPool = new Pool({
  user: 'your_user',
  host: 'localhost',
  database: 'your_db',
  password: 'your_password',
  port: 5432,
});

// استيراد الـ Embedder من config
import { nomicEmbedder } from '../genkit.config'; 

export const internalDocsIndexer = defineIndexer(
  {
    name: 'InternalDocsIndex',
    embedder: nomicEmbedder, // ربط الـ Embedder
  },
  async (flow) => {
    // 1. استرجاع الوثائق الخام (من نظام الملفات، API، الخ)
    const rawDocuments = [
        { title: "سياسة الخصوصية", text: "هذه الوثيقة تحتوي على..." },
        { title: "دليل الموظفين", text: "التعويضات والإجازات موضحة..." },
    ];
    
    // 2. معالجة وتقسيم الوثائق إلى قطع صغيرة (Chunking)
    // التقسيم ضروري لأن الـ LLM يفضل العمل على نصوص قصيرة ومركزة.
    const docsToEmbed: Document[] = rawDocuments.map(doc => ({
        text: doc.text,
        metadata: { title: doc.title },
    }));

    // Genkit يساعد في إنشاء المتجهات عبر وظيفة `embed`
    const chunks = await flow.chunk(docsToEmbed, {
        chunkSize: 512, 
        overlap: 100 
    });
    
    // 3. إنشاء المتجهات وتخزينها
    for (const chunk of chunks) {
        // إنشاء المتجه باستخدام الـ Embedder المُعرّف
        const embedding = await embed({
            embedder: nomicEmbedder,
            content: chunk.text,
        });

        // إدراج المتجه في PostgreSQL
        await pgPool.query(
            `INSERT INTO documents (content, metadata, embedding) VALUES ($1, $2, $3)`,
            [chunk.text, chunk.metadata, embedding.embedding]
        );
    }
    console.log(`Successfully indexed ${chunks.length} chunks.`);
  }
);
```

لتشغيل عملية الفهرسة:
```bash
genkit index run InternalDocsIndex
```

---

## المرحلة الثالثة: Retriever (الاسترجاع)

وظيفة Retriever هي أخذ سؤال المستخدم، تحويله إلى متجه (باستخدام نفس الـ Embedder)، والبحث عن أقرب المتجهات في PostgreSQL.

### 4. تعريف الـ Retriever

نحتاج إلى وظيفة `Retriever` مخصصة تتحدث مع PostgreSQL.

```typescript
// retriever.ts
import { defineRetriever, embed, RetrievalResult, Document } from '@genkit-ai/core';
import { pgPool } from './indexer'; // استيراد Pool
import { nomicEmbedder } from '../genkit.config'; 

export const internalDocsRetriever = defineRetriever(
  {
    name: 'InternalDocsRetriever',
    embedder: nomicEmbedder,
    config: {
        k: 4, // استرجع أفضل 4 وثائق
    },
  },
  async ({ query }) => {
    // 1. تحويل سؤال المستخدم إلى متجه (Embedding)
    const queryEmbedding = await embed({
        embedder: nomicEmbedder,
        content: query,
    });

    // 2. البحث في PostgreSQL باستخدام قياس التشابه (Cosine Similarity)
    // <-> هو معامل المسافة في pgvector
    const result = await pgPool.query(
      `SELECT content, metadata FROM documents 
       ORDER BY embedding <-> $1 
       LIMIT $2`,
      [queryEmbedding.embedding, 4] // $1 هو المتجه، $2 هو Limit
    );

    // 3. تحويل النتائج إلى تنسيق Genkit (Document[])
    const documents: Document[] = result.rows.map(row => ({
      text: row.content,
      metadata: row.metadata,
    }));

    return { documents } as RetrievalResult;
  }
);
```

### 5. استخدام Retriever في Flow (RAG)

يمكنك الآن دمج هذا الـ Retriever في أي Flow:

```typescript
// flow.ts
import { generate, retrieve } from '@genkit-ai/flow';
import { gemini } from '@genkit-ai/gemini'; 
import { internalDocsRetriever } from './retriever'; 

export const RAGQueryFlow = defineFlow(
  // ...
  async ({ userQuestion }) => {
    
    // 1. استرجاع السياق
    const retrievalResult = await retrieve({
      retriever: internalDocsRetriever,
      query: userQuestion,
    });
    
    const context = retrievalResult.documents
      .map(doc => doc.text)
      .join('\n--- السياق المسترجع ---\n');

    // 2. مطالبة LLM بالإجابة بناءً على السياق المسترجع
    const ragPrompt = `
      السياق المسترجع من الوثائق الداخلية:
      ---
      ${context}
      ---
      بالاعتماد فقط على السياق أعلاه، أجب على السؤال التالي: ${userQuestion}
      إذا لم تجد الإجابة في السياق، أجب بأنك لا تعرف.
    `;
    
    const response = await generate({
      model: gemini.flash(), 
      prompt: ragPrompt,
    });

    return response.text;
  }
);
```