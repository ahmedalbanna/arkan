/**
 * Load Demo Data Script
 * 
 * Populates the vector database with diverse demo content
 * for showcasing RAG capabilities
 */

import { indexDocument } from '@/lib/rag/indexer';

const demoDocuments = [
  {
    title: 'Introduction to Machine Learning',
    content: `
Machine Learning (ML) is a subset of artificial intelligence that enables systems to learn 
and improve from experience without being explicitly programmed. ML algorithms build models 
based on sample data, known as training data, to make predictions or decisions.

Key Types of Machine Learning:

1. Supervised Learning: The algorithm learns from labeled training data. Examples include 
classification (spam detection) and regression (price prediction).

2. Unsupervised Learning: The algorithm finds patterns in unlabeled data. Common techniques 
include clustering (customer segmentation) and dimensionality reduction (data visualization).

3. Reinforcement Learning: The algorithm learns through trial and error, receiving rewards 
for correct actions. Used in robotics, game playing, and autonomous systems.

Popular ML Algorithms:
- Linear Regression: Predicts continuous values
- Decision Trees: Makes decisions based on feature values
- Neural Networks: Mimics brain structure for complex pattern recognition
- Support Vector Machines: Effective for classification tasks
- Random Forests: Ensemble of decision trees for better accuracy

Applications:
Machine learning powers modern applications like recommendation systems (Netflix, Amazon), 
voice assistants (Siri, Alexa), fraud detection, medical diagnosis, and autonomous vehicles.
    `,
    metadata: {
      projectId: 'demo-ai',
      sourceFile: 'machine-learning-intro.md',
      type: 'context' as const,
    },
  },
  {
    title: 'Deep Learning and Neural Networks',
    content: `
Deep Learning is a specialized branch of machine learning that uses artificial neural networks 
with multiple layers (hence "deep") to progressively extract higher-level features from raw input.

Neural Network Architecture:
- Input Layer: Receives raw data
- Hidden Layers: Process and transform data through weighted connections
- Output Layer: Produces final predictions

Deep Learning Architectures:

1. Convolutional Neural Networks (CNNs):
   - Specialized for image processing
   - Use convolutional layers to detect features
   - Applications: Image classification, object detection, facial recognition

2. Recurrent Neural Networks (RNNs):
   - Process sequential data
   - Maintain memory of previous inputs
   - Applications: Language modeling, speech recognition, time series prediction

3. Transformers:
   - Attention mechanism for processing sequences
   - Parallel processing capabilities
   - Applications: Language translation, text generation (GPT, BERT)

Training Deep Networks:
- Backpropagation: Adjusts weights to minimize error
- Gradient Descent: Optimization algorithm
- Regularization: Prevents overfitting (dropout, batch normalization)

Challenges:
- Requires large datasets
- Computationally expensive (needs GPUs/TPUs)
- Risk of overfitting
- Difficult to interpret (black box problem)

Recent Advances:
Transfer learning, few-shot learning, self-supervised learning, and foundation models 
have made deep learning more accessible and effective for various tasks.
    `,
    metadata: {
      projectId: 'demo-ai',
      sourceFile: 'deep-learning.md',
      type: 'context' as const,
    },
  },
  {
    title: 'Building Modern Web Applications with React',
    content: `
React is a JavaScript library for building user interfaces, created by Facebook. It has become 
one of the most popular frameworks for web development due to its component-based architecture 
and efficient rendering.

Core Concepts:

1. Components:
   - Reusable building blocks of UI
   - Can be functional or class-based
   - Accept inputs (props) and return JSX

2. JSX (JavaScript XML):
   - Syntax extension for writing HTML-like code in JavaScript
   - Transpiled to JavaScript function calls
   - Makes component structure clear and readable

3. Virtual DOM:
   - In-memory representation of the actual DOM
   - React compares virtual DOM with actual DOM
   - Only updates changed elements (reconciliation)

4. State Management:
   - useState: Local component state
   - useContext: Share data across components
   - Redux/Zustand: Global state management

5. Hooks:
   - useState: Manage component state
   - useEffect: Handle side effects
   - useCallback: Memoize functions
   - useMemo: Memoize computed values
   - Custom hooks: Reusable logic

React Ecosystem:
- Next.js: Full-stack React framework with SSR/SSG
- React Router: Client-side routing
- React Query: Server state management
- Styled Components: CSS-in-JS styling
- Testing Library: Component testing

Best Practices:
- Keep components small and focused
- Use functional components with hooks
- Implement proper error boundaries
- Optimize performance with memoization
- Follow naming conventions
- Write tests for critical components

Modern React (2024):
- Server Components for better performance
- Concurrent rendering for smoother UX
- Automatic batching of state updates
- Improved TypeScript support
    `,
    metadata: {
      projectId: 'demo-web',
      sourceFile: 'react-guide.md',
      type: 'context' as const,
    },
  },
  {
    title: 'Next.js 15: The React Framework for Production',
    content: `
Next.js is a powerful React framework that provides a complete solution for building 
production-ready web applications with server-side rendering, static generation, and more.

Key Features:

1. App Router (Next.js 13+):
   - File-system based routing
   - Server and Client Components
   - Nested layouts and loading states
   - Error boundaries and not-found pages

2. Rendering Strategies:
   - Static Generation (SSG): Pre-render at build time
   - Server-Side Rendering (SSR): Render on each request
   - Incremental Static Regeneration (ISR): Update static pages
   - Client-Side Rendering (CSR): Render in browser

3. Server Actions:
   - Run server code directly from components
   - Type-safe mutations
   - Progressive enhancement
   - No API routes needed

4. Data Fetching:
   - Async Server Components
   - Automatic request deduplication
   - Streaming with Suspense
   - Parallel and sequential fetching

5. Performance Optimizations:
   - Automatic code splitting
   - Image optimization
   - Font optimization
   - Script optimization

6. API Routes:
   - Serverless functions
   - Full-stack applications
   - REST and GraphQL APIs

Developer Experience:
- Fast Refresh: Instant feedback
- TypeScript support out of the box
- Built-in CSS and Sass support
- Environment variables
- ESLint configuration

Deployment:
- Vercel: Optimized for Next.js
- Other platforms: AWS, Azure, Google Cloud
- Self-hosted: Node.js server or Docker

Use Cases:
- E-commerce sites
- Marketing websites
- Dashboards and admin panels
- Documentation sites
- SaaS applications
    `,
    metadata: {
      projectId: 'demo-web',
      sourceFile: 'nextjs-guide.md',
      type: 'context' as const,
    },
  },
  {
    title: 'Vector Databases and Semantic Search',
    content: `
Vector databases are specialized database systems designed to store, index, and search 
high-dimensional vectors efficiently. They are essential for modern AI applications.

What are Vectors?
Vectors are numerical representations (embeddings) of data like text, images, or audio. 
Similar items have similar vectors, enabling semantic search based on meaning rather than 
exact keyword matches.

Popular Vector Databases:

1. Qdrant:
   - Written in Rust for performance
   - Rich filtering capabilities
   - Cloud and self-hosted options
   - Excellent for production use

2. Pinecone:
   - Fully managed cloud service
   - Scales automatically
   - Easy integration
   - Good for quick prototypes

3. Weaviate:
   - GraphQL API
   - Multi-modal search
   - Built-in ML models
   - Open source

4. Milvus:
   - Highly scalable
   - Multiple index types
   - GPU acceleration
   - Enterprise-ready

Key Concepts:

1. Similarity Search:
   - Cosine similarity: Measures angle between vectors
   - Euclidean distance: Measures straight-line distance
   - Dot product: Measures alignment

2. Indexing Methods:
   - HNSW: Hierarchical Navigable Small World graphs
   - IVF: Inverted File Index with clustering
   - ANNOY: Approximate Nearest Neighbors Oh Yeah
   - PQ: Product Quantization for compression

3. Embedding Models:
   - Sentence-BERT: Text embeddings
   - CLIP: Image and text embeddings
   - OpenAI Ada: General purpose
   - Custom models: Domain-specific

Applications:
- Semantic search: Find documents by meaning
- Recommendation systems: Similar products/content
- RAG (Retrieval-Augmented Generation): Enhance LLMs with context
- Anomaly detection: Find outliers
- Deduplication: Identify duplicates

Best Practices:
- Choose appropriate vector dimension (384-1536)
- Use proper distance metric for your use case
- Implement metadata filtering
- Monitor query performance
- Regular index optimization
- Backup vector data
    `,
    metadata: {
      projectId: 'demo-db',
      sourceFile: 'vector-databases.md',
      type: 'context' as const,
    },
  },
  {
    title: 'RAG: Retrieval-Augmented Generation',
    content: `
Retrieval-Augmented Generation (RAG) is a technique that combines large language models 
with external knowledge retrieval to generate more accurate and informative responses.

How RAG Works:

1. Indexing Phase:
   - Split documents into chunks
   - Generate embeddings for each chunk
   - Store vectors in a vector database
   - Add metadata for filtering

2. Retrieval Phase:
   - User submits a query
   - Convert query to embedding
   - Search vector database for similar chunks
   - Retrieve top-k most relevant results

3. Generation Phase:
   - Combine retrieved context with user query
   - Send enhanced prompt to LLM
   - LLM generates response using retrieved context
   - Return answer with sources

Benefits of RAG:

1. Accuracy:
   - Reduces hallucinations
   - Grounds responses in facts
   - Provides source attribution

2. Cost-Effective:
   - No need to retrain LLMs
   - Update knowledge by updating database
   - Smaller, focused knowledge base

3. Domain-Specific:
   - Customize for your use case
   - Include proprietary information
   - Control what knowledge is used

4. Transparency:
   - Show sources used
   - Verify information
   - Build trust

RAG Architecture Components:

1. Document Processing:
   - Text extraction (PDF, Word, etc.)
   - Chunking strategies (fixed, semantic)
   - Metadata extraction

2. Embedding Service:
   - Ollama: Local, free
   - OpenAI: Cloud-based
   - Custom models: Domain-specific

3. Vector Store:
   - Qdrant: Production-ready
   - Pinecone: Managed service
   - Chroma: Development

4. LLM Integration:
   - OpenAI GPT-4
   - Anthropic Claude
   - Google Gemini
   - Local models (Llama, Mistral)

Advanced Techniques:

1. Re-ranking:
   - Cross-encoder models
   - Hybrid search (vector + keyword)
   - Reciprocal rank fusion

2. Query Expansion:
   - Generate multiple query variations
   - Use synonyms and related terms
   - Improve recall

3. Caching:
   - Cache embeddings
   - Cache search results
   - Reduce latency

4. Hybrid Search:
   - Combine semantic and keyword search
   - BM25 + vector similarity
   - Better for diverse queries

Challenges:
- Chunk size optimization
- Balancing precision and recall
- Managing context window limits
- Handling contradictory information
- Keeping data up-to-date

Use Cases:
- Customer support chatbots
- Documentation search
- Research assistants
- Legal document analysis
- Medical information retrieval
    `,
    metadata: {
      projectId: 'demo-ai',
      sourceFile: 'rag-explained.md',
      type: 'context' as const,
    },
  },
];

async function loadDemoData() {
  console.log('🚀 Loading demo data into RAG system...\n');

  let totalChunks = 0;
  const results = [];

  for (let i = 0; i < demoDocuments.length; i++) {
    const doc = demoDocuments[i];
    console.log(`📄 [${i + 1}/${demoDocuments.length}] Indexing: ${doc.title}`);
    console.log(`   Project: ${doc.metadata.projectId}`);
    console.log(`   Source: ${doc.metadata.sourceFile}`);

    try {
      const result = await indexDocument(doc.content, {
        ...doc.metadata,
        chunkSize: 400,
        overlap: 50,
      });

      if (result.success) {
        console.log(`   ✅ Success: ${result.chunksCreated} chunks created\n`);
        totalChunks += result.chunksCreated;
        results.push({
          title: doc.title,
          chunks: result.chunksCreated,
          success: true,
        });
      } else {
        console.log(`   ❌ Failed: ${result.errors}\n`);
        results.push({
          title: doc.title,
          error: result.errors,
          success: false,
        });
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}\n`);
      results.push({
        title: doc.title,
        error: String(error),
        success: false,
      });
    }

    // Small delay between documents
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('═'.repeat(60));
  console.log('📊 DEMO DATA LOADING COMPLETE');
  console.log('═'.repeat(60));
  console.log(`Total documents: ${demoDocuments.length}`);
  console.log(`Total chunks created: ${totalChunks}`);
  console.log(`Success rate: ${results.filter(r => r.success).length}/${demoDocuments.length}`);
  console.log('');
  console.log('✅ Demo data is ready!');
  console.log('');
  console.log('🎯 Next steps:');
  console.log('   1. Visit http://localhost:9002/demo/rag');
  console.log('   2. Try sample queries in the demo interface');
  console.log('   3. Compare different re-ranking strategies');
  console.log('   4. Monitor cache performance');
  console.log('');
}

// Run if executed directly
if (require.main === module) {
  loadDemoData().catch(console.error);
}

export { loadDemoData, demoDocuments };
