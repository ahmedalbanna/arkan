/**
 * Qdrant Utility Scripts
 * 
 * Helper scripts for managing Qdrant vector database
 */

import { QdrantVectorStore } from '@/lib/rag/qdrant-adapter';
import { RAGConfig } from '@/lib/rag/config';

/**
 * Initialize Qdrant collection
 */
export async function initializeQdrant(): Promise<void> {
  console.log('🚀 Initializing Qdrant...');
  
  const qdrant = new QdrantVectorStore({
    url: RAGConfig.qdrant.url,
    apiKey: RAGConfig.qdrant.apiKey,
    collectionName: RAGConfig.qdrant.collectionName,
    vectorDimension: RAGConfig.vectorStore.dimension,
  });

  await qdrant.initialize();
  console.log('✅ Qdrant initialized successfully');
}

/**
 * Get Qdrant statistics
 */
export async function getQdrantStats(): Promise<void> {
  console.log('📊 Fetching Qdrant statistics...\n');
  
  const qdrant = new QdrantVectorStore({
    url: RAGConfig.qdrant.url,
    apiKey: RAGConfig.qdrant.apiKey,
    collectionName: RAGConfig.qdrant.collectionName,
    vectorDimension: RAGConfig.vectorStore.dimension,
  });

  const isHealthy = await qdrant.healthCheck();
  console.log(`Health Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);

  if (isHealthy) {
    const stats = await qdrant.getStats();
    console.log(`\nCollection: ${RAGConfig.qdrant.collectionName}`);
    console.log(`Total Chunks: ${stats.totalChunks.toLocaleString()}`);
    console.log(`Vector Dimension: ${stats.vectorDimension}`);
    console.log(`Indexed Fields: ${stats.indexedFields?.join(', ') || 'N/A'}`);
  }
}

/**
 * Clear Qdrant collection (WARNING: Destructive!)
 */
export async function clearQdrant(confirm: boolean = false): Promise<void> {
  if (!confirm) {
    console.log('⚠️  This will delete ALL data from Qdrant!');
    console.log('Run with --confirm flag if you are sure.');
    return;
  }

  console.log('🗑️  Clearing Qdrant collection...');
  
  const qdrant = new QdrantVectorStore({
    url: RAGConfig.qdrant.url,
    apiKey: RAGConfig.qdrant.apiKey,
    collectionName: RAGConfig.qdrant.collectionName,
    vectorDimension: RAGConfig.vectorStore.dimension,
  });

  await qdrant.clear();
  console.log('✅ Qdrant collection cleared');
}

/**
 * Test Qdrant connection
 */
export async function testQdrantConnection(): Promise<void> {
  console.log('🔍 Testing Qdrant connection...\n');
  console.log(`URL: ${RAGConfig.qdrant.url}`);
  console.log(`Collection: ${RAGConfig.qdrant.collectionName}`);
  console.log(`Vector Dimension: ${RAGConfig.vectorStore.dimension}\n`);

  const qdrant = new QdrantVectorStore({
    url: RAGConfig.qdrant.url,
    apiKey: RAGConfig.qdrant.apiKey,
    collectionName: RAGConfig.qdrant.collectionName,
    vectorDimension: RAGConfig.vectorStore.dimension,
  });

  try {
    const isHealthy = await qdrant.healthCheck();
    if (isHealthy) {
      console.log('✅ Connection successful!');
      await qdrant.initialize();
      console.log('✅ Collection initialized!');
      
      const stats = await qdrant.getStats();
      console.log(`\n📊 Collection has ${stats.totalChunks} chunks`);
    } else {
      console.log('❌ Connection failed - Qdrant not responding');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Connection error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const command = process.argv[2];
  const flags = process.argv.slice(3);

  switch (command) {
    case 'init':
      await initializeQdrant();
      break;
    
    case 'stats':
      await getQdrantStats();
      break;
    
    case 'clear':
      await clearQdrant(flags.includes('--confirm'));
      break;
    
    case 'test':
      await testQdrantConnection();
      break;
    
    default:
      console.log(`
Qdrant Utility Scripts

Usage:
  npx ts-node scripts/qdrant-utils.ts <command> [options]

Commands:
  init       Initialize Qdrant collection
  stats      Show collection statistics
  clear      Clear all data (use --confirm flag)
  test       Test Qdrant connection

Examples:
  npx ts-node scripts/qdrant-utils.ts init
  npx ts-node scripts/qdrant-utils.ts stats
  npx ts-node scripts/qdrant-utils.ts test
  npx ts-node scripts/qdrant-utils.ts clear --confirm
      `);
      break;
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
