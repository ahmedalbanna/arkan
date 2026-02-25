/**
 * Test Script: Index Documents into Qdrant
 * 
 * This script demonstrates how to index documents into Qdrant
 * and verify the results.
 * 
 * Usage:
 *   npx tsx scripts/test-qdrant-indexing.ts
 */

import { indexDocument } from '@/modules/rag/infrastructure/indexer';
import { retrieveContext } from '@/modules/rag/infrastructure/retrieval';
import { getVectorStore } from '@/modules/rag/infrastructure/vector-store';

// Test documents with diverse content
const testDocuments = [
  {
    content: `
      Artificial Intelligence (AI) is transforming the world of technology. 
      Machine learning algorithms enable computers to learn from data without 
      being explicitly programmed. Deep learning, a subset of machine learning, 
      uses neural networks with multiple layers to process complex patterns.
      
      AI applications include natural language processing, computer vision, 
      robotics, and autonomous systems. Modern AI systems can perform tasks 
      that previously required human intelligence, such as language translation, 
      image recognition, and decision-making.
    `,
    metadata: {
      projectId: 'test-ai-project',
      userId: 'demo-user',
      sourceFile: 'ai-introduction.txt',
      type: 'context' as const,
    },
  },
  {
    content: `
      React is a JavaScript library for building user interfaces. 
      It was developed by Facebook and is now maintained by Meta and 
      a community of developers. React uses a component-based architecture, 
      allowing developers to create reusable UI components.
      
      Key features of React include the Virtual DOM for efficient rendering, 
      JSX syntax for writing components, and hooks for managing state and 
      side effects. React is widely used for building single-page applications 
      and mobile apps with React Native.
    `,
    metadata: {
      projectId: 'test-web-project',
      userId: 'demo-user',
      sourceFile: 'react-basics.txt',
      type: 'reference' as const,
    },
  },
  {
    content: `
      Database management systems (DBMS) are essential for storing and 
      retrieving data efficiently. SQL databases like PostgreSQL and MySQL 
      use structured schemas and ACID transactions. NoSQL databases like 
      MongoDB and Cassandra offer flexible schemas and horizontal scaling.
      
      Vector databases like Qdrant are specialized for storing and searching 
      high-dimensional vectors, making them ideal for AI and machine learning 
      applications. They support similarity search, which is crucial for 
      recommendation systems and semantic search.
    `,
    metadata: {
      projectId: 'test-db-project',
      userId: 'demo-user',
      sourceFile: 'database-overview.txt',
      type: 'context' as const,
    },
  },
  {
    content: `
      Next.js is a React framework for building full-stack web applications. 
      It provides features like server-side rendering, static site generation, 
      and API routes. Next.js 15 introduces the App Router with improved 
      performance and developer experience.
      
      Key features include automatic code splitting, built-in CSS support, 
      image optimization, and TypeScript support. Next.js is used by companies 
      like Netflix, TikTok, and Twitch for building production applications.
    `,
    metadata: {
      projectId: 'test-web-project',
      userId: 'demo-user',
      sourceFile: 'nextjs-guide.txt',
      type: 'reference' as const,
    },
  },
  {
    content: `
      Vector embeddings are numerical representations of text, images, or 
      other data types in a high-dimensional space. They capture semantic 
      meaning, allowing similar items to be close together in the vector space.
      
      Embedding models like BERT, GPT, and nomic-embed-text convert text into 
      dense vectors. These vectors enable semantic search, where queries find 
      results based on meaning rather than exact keyword matches. This is the 
      foundation of Retrieval-Augmented Generation (RAG) systems.
    `,
    metadata: {
      projectId: 'test-ai-project',
      userId: 'demo-user',
      sourceFile: 'embeddings-explained.txt',
      type: 'context' as const,
    },
  },
];

/**
 * Index all test documents
 */
type IndexTestResult = {
  projectId: string;
  userId: string;
  sourceFile: string;
  type: 'report' | 'reference' | 'context' | 'user_upload';
  chunksCreated?: number;
  error?: string;
};

async function indexTestDocuments(): Promise<IndexTestResult[]> {
  console.log('📚 Starting document indexing...\n');

  const results: IndexTestResult[] = [];

  for (let i = 0; i < testDocuments.length; i++) {
    const doc = testDocuments[i];
    console.log(`📄 Indexing document ${i + 1}/${testDocuments.length}:`);
    console.log(`   Source: ${doc.metadata.sourceFile}`);
    console.log(`   Project: ${doc.metadata.projectId}`);
    console.log(`   Type: ${doc.metadata.type}`);

    try {
      const result = await indexDocument(doc.content, {
        projectId: doc.metadata.projectId,
        userId: doc.metadata.userId,
        sourceFile: doc.metadata.sourceFile,
        type: doc.metadata.type,
        chunkSize: 300,
        overlap: 50,
      });

      if (result.success) {
        console.log(`   ✅ Indexed successfully: ${result.chunksCreated} chunks created\n`);
        results.push({ ...doc.metadata, chunksCreated: result.chunksCreated });
      } else {
        const errorMessage = result.errors?.[0] ?? 'Unknown error';
        console.log(`   ❌ Failed: ${errorMessage}\n`);
        results.push({ ...doc.metadata, error: errorMessage });
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      results.push({ ...doc.metadata, error: String(error) });
    }
  }

  return results;
}

/**
 * Test retrieval with various queries
 */
async function testRetrieval() {
  console.log('\n🔍 Testing context retrieval...\n');

  const testQueries = [
    {
      query: 'What is machine learning?',
      projectId: 'test-ai-project',
      description: 'AI-related query in AI project',
    },
    {
      query: 'How do I build a web application?',
      projectId: 'test-web-project',
      description: 'Web development query in web project',
    },
    {
      query: 'What are vector databases?',
      projectId: 'test-db-project',
      description: 'Database query in database project',
    },
    {
      query: 'Explain embeddings',
      projectId: undefined,
      description: 'Cross-project query (no filter)',
    },
  ];

  for (const test of testQueries) {
    console.log(`❓ Query: "${test.query}"`);
    console.log(`   Context: ${test.description}`);

    try {
      const result = await retrieveContext(test.query, {
        projectId: test.projectId,
        topK: 3,
        minScore: 0.5,
      });

      console.log(`   ✅ Found ${result.sources.length} relevant chunks:`);
      result.sources.forEach((source, idx) => {
        console.log(`      ${idx + 1}. Score: ${source.score.toFixed(3)} | Source: ${source.sourceFile || 'N/A'}`);
      });
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
  }
}

/**
 * Get and display statistics
 */
async function displayStatistics() {
  console.log('\n📊 Qdrant Collection Statistics:\n');

  try {
    const vectorStore = getVectorStore();

    if (typeof vectorStore.getStats === 'function') {
      const stats = await vectorStore.getStats();
      console.log(`Total Chunks:       ${stats.totalChunks.toLocaleString()}`);
      console.log(`Vector Dimension:   ${stats.vectorDimension}`);
      console.log(`Indexed Fields:     ${stats.indexedFields?.join(', ') || 'N/A'}`);
    } else {
      const size = typeof vectorStore.size === 'function' ? await vectorStore.size() : vectorStore.size();
      console.log(`Total Chunks:       ${size}`);
    }

    // Get project breakdown
    console.log('\n📁 Project Breakdown:');
    const projects = ['test-ai-project', 'test-web-project', 'test-db-project'];
    
    for (const projectId of projects) {
      const result = await retrieveContext('test', {
        projectId,
        topK: 100,
        minScore: 0.0,
      });
      console.log(`   ${projectId}: ${result.sources.length} chunks`);
    }

  } catch (error) {
    console.error(`Error getting statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   🧪 QDRANT INDEXING & RETRIEVAL TEST');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Index documents
    console.log('STEP 1: Indexing Test Documents');
    console.log('───────────────────────────────────────────────────────\n');
    const indexResults = await indexTestDocuments();

    // Step 2: Wait a moment for indexing to complete
    console.log('⏳ Waiting for indexing to complete...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Test retrieval
    console.log('STEP 2: Testing Context Retrieval');
    console.log('───────────────────────────────────────────────────────\n');
    await testRetrieval();

    // Step 4: Display statistics
    console.log('STEP 3: Collection Statistics');
    console.log('───────────────────────────────────────────────────────');
    await displayStatistics();

    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('   ✅ TEST COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════\n');

    const successCount = indexResults.filter(result => !result.error).length;
    const totalChunks = indexResults.reduce((sum, result) => sum + (result.chunksCreated ?? 0), 0);
    console.log(`📊 Summary:`);
    console.log(`   Documents indexed: ${successCount}/${testDocuments.length}`);
    console.log(`   Total chunks: ${totalChunks}`);
    console.log('\n💡 Next steps:');
    console.log('   1. View in Qdrant UI: http://localhost:3100');
    console.log('   2. Check health: curl http://localhost:9002/api/rag/health');
    console.log('   3. View stats: npm run qdrant:stats\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { indexTestDocuments, testRetrieval, displayStatistics };
