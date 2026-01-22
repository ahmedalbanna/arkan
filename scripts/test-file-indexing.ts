/**
 * Test File Indexing Script
 * 
 * Tests the complete RAG pipeline:
 * 1. Create test documents
 * 2. Index using Ollama (nomic-embed-text)
 * 3. Store in Qdrant
 * 4. Test retrieval
 * 5. Verify system health
 */

import { indexDocument } from '@/lib/rag/indexer';
import { retrieveContext } from '@/lib/rag/retrieval';
import { getVectorStore } from '@/lib/rag/vector-store';
import { getCacheManager } from '@/lib/rag/cache';

const testDocuments = [
  {
    title: 'Introduction to Quantum Computing',
    content: `
Quantum Computing represents a revolutionary approach to computation that leverages the principles 
of quantum mechanics. Unlike classical computers that use bits (0 or 1), quantum computers use 
quantum bits or qubits that can exist in multiple states simultaneously through superposition.

Key Concepts:

1. Superposition: Qubits can be in a combination of 0 and 1 states simultaneously, enabling 
parallel processing of multiple possibilities.

2. Entanglement: Quantum particles can be correlated in ways that classical particles cannot, 
allowing qubits to be connected such that the state of one qubit can depend on the state of another.

3. Quantum Gates: Operations on qubits that manipulate their quantum states, analogous to logic 
gates in classical computing but with quantum properties.

Applications:
- Cryptography: Breaking traditional encryption and creating quantum-safe alternatives
- Drug Discovery: Simulating molecular interactions at quantum level
- Optimization: Solving complex optimization problems in logistics and finance
- Machine Learning: Quantum algorithms for faster pattern recognition

Current Challenges:
- Decoherence: Quantum states are fragile and easily disrupted
- Error Rates: Quantum operations have higher error rates than classical
- Scalability: Building large-scale quantum computers is technically challenging
- Temperature: Most quantum computers require near absolute zero temperatures

Leading Companies:
IBM, Google, Microsoft, and Amazon are investing heavily in quantum computing research and 
cloud-based quantum computing services.
    `,
    projectId: 'quantum-research',
    type: 'context' as const,
  },
  {
    title: 'TypeScript Advanced Patterns',
    content: `
TypeScript is a strongly typed programming language that builds on JavaScript, providing better 
tooling and error checking at scale. Advanced TypeScript patterns enable developers to write 
more maintainable and type-safe code.

Advanced Type Patterns:

1. Conditional Types:
   type IsString<T> = T extends string ? true : false;
   Allows types to change based on conditions.

2. Mapped Types:
   type Readonly<T> = { readonly [P in keyof T]: T[P] };
   Transform properties of existing types.

3. Template Literal Types:
   type EventName = \`on\${Capitalize<string>}\`;
   Create string literal types with patterns.

4. Utility Types:
   - Partial<T>: Makes all properties optional
   - Required<T>: Makes all properties required
   - Pick<T, K>: Select subset of properties
   - Omit<T, K>: Remove properties from type

Generic Constraints:
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

Type Guards:
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

Best Practices:
- Use strict mode for maximum type safety
- Prefer interfaces for object shapes
- Use union types for multiple possibilities
- Leverage type inference when possible
- Create custom utility types for common patterns

TypeScript enables building large-scale applications with confidence, catching errors at compile 
time rather than runtime.
    `,
    projectId: 'typescript-docs',
    type: 'reference' as const,
  },
];

async function testIndexing() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   🧪 RAG PIPELINE TEST - OLLAMA + QDRANT');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Check system health
    console.log('STEP 1: System Health Check');
    console.log('───────────────────────────────────────────────────────\n');

    const vectorStore = getVectorStore();
    
    // Check Qdrant
    if (typeof vectorStore.healthCheck === 'function') {
      const isHealthy = await vectorStore.healthCheck();
      console.log(`✓ Qdrant: ${isHealthy ? '🟢 HEALTHY' : '🔴 UNHEALTHY'}`);
    }

    // Check Ollama
    try {
      const response = await fetch('http://185.190.140.93:11434/api/tags');
      const data = await response.json();
      const hasModel = data.models?.some((m: any) => m.name.includes('nomic-embed-text'));
      console.log(`✓ Ollama: ${hasModel ? '🟢 READY (nomic-embed-text)' : '🟡 MISSING MODEL'}`);
    } catch {
      console.log('✗ Ollama: 🔴 UNREACHABLE');
    }

    console.log('');

    // Step 2: Index documents
    console.log('STEP 2: Indexing Test Documents');
    console.log('───────────────────────────────────────────────────────\n');

    const indexResults = [];
    for (let i = 0; i < testDocuments.length; i++) {
      const doc = testDocuments[i];
      console.log(`📄 [${i + 1}/${testDocuments.length}] Indexing: ${doc.title}`);
      console.log(`   Project: ${doc.projectId}`);
      console.log(`   Processing with Ollama (nomic-embed-text)...`);

      const startTime = Date.now();
      const result = await indexDocument(doc.content, {
        projectId: doc.projectId,
        sourceFile: `${doc.title}.md`,
        type: doc.type,
        chunkSize: 400,
        overlap: 50,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (result.success) {
        console.log(`   ✓ Success: ${result.chunksCreated} chunks in ${duration}s`);
        console.log(`   ✓ Stored in Qdrant\n`);
        indexResults.push({
          title: doc.title,
          chunks: result.chunksCreated,
          time: parseFloat(duration),
          success: true,
        });
      } else {
        console.log(`   ✗ Failed: ${result.errors}\n`);
        indexResults.push({
          title: doc.title,
          error: result.errors,
          success: false,
        });
      }
    }

    // Step 3: Test retrieval
    console.log('\nSTEP 3: Testing Context Retrieval');
    console.log('───────────────────────────────────────────────────────\n');

    const testQueries = [
      { query: 'What is quantum computing?', projectId: 'quantum-research' },
      { query: 'Explain TypeScript utility types', projectId: 'typescript-docs' },
      { query: 'superposition and entanglement', projectId: 'quantum-research' },
    ];

    for (const test of testQueries) {
      console.log(`🔍 Query: "${test.query}"`);
      console.log(`   Project: ${test.projectId}`);

      const startTime = Date.now();
      const result = await retrieveContext(test.query, {
        projectId: test.projectId,
        topK: 3,
        minScore: 0.5,
        useCache: true,
        rerank: true,
        rerankStrategy: 'hybrid',
      });

      const duration = Date.now() - startTime;

      console.log(`   ✓ Found ${result.sources.length} results in ${duration}ms`);
      result.sources.forEach((source, idx) => {
        console.log(`      ${idx + 1}. Score: ${source.score.toFixed(3)}`);
      });
      console.log('');
    }

    // Step 4: Cache statistics
    console.log('STEP 4: Cache Performance');
    console.log('───────────────────────────────────────────────────────\n');

    const cacheManager = getCacheManager();
    const stats = cacheManager.getAllStats();

    console.log(`Embedding Cache:`);
    console.log(`   Size: ${stats.embeddings.size} items`);
    console.log(`   Hits: ${stats.embeddings.hits}`);
    console.log(`   Misses: ${stats.embeddings.misses}`);
    console.log(`   Hit Rate: ${(stats.embeddings.hitRate * 100).toFixed(1)}%`);

    console.log(`\nSearch Cache:`);
    console.log(`   Size: ${stats.searches.size} items`);
    console.log(`   Hits: ${stats.searches.hits}`);
    console.log(`   Misses: ${stats.searches.misses}`);
    console.log(`   Hit Rate: ${(stats.searches.hitRate * 100).toFixed(1)}%`);

    // Step 5: Final statistics
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('   📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    const totalChunks = indexResults.reduce((sum, r) => sum + (r.chunks || 0), 0);
    const avgTime = indexResults.reduce((sum, r) => sum + (r.time || 0), 0) / indexResults.length;
    const successCount = indexResults.filter(r => r.success).length;

    console.log(`Documents Indexed: ${successCount}/${testDocuments.length}`);
    console.log(`Total Chunks: ${totalChunks}`);
    console.log(`Avg Time per Document: ${avgTime.toFixed(2)}s`);
    console.log(`Cache Hit Rate: ${(stats.total.hitRate * 100).toFixed(1)}%`);

    if (typeof vectorStore.getStats === 'function') {
      const vStats = await vectorStore.getStats();
      console.log(`Total Vectors in Qdrant: ${vStats.totalChunks}`);
    }

    console.log('\n✅ RAG PIPELINE TEST COMPLETE!\n');
    console.log('🎯 Next Steps:');
    console.log('   1. Open admin panel: http://localhost:9002/admin/document-indexer');
    console.log('   2. Upload your own files (PDF, DOCX, TXT, MD)');
    console.log('   3. Test retrieval in demo: http://localhost:9002/demo/rag');
    console.log('   4. Monitor system: http://localhost:9002/admin/rag-monitor\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  testIndexing().catch(console.error);
}

export { testIndexing };
