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