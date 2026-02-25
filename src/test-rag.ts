import { generateEmbedding } from '@/modules/rag/infrastructure/embeddings';

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