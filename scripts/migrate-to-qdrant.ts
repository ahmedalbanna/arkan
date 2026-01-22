/**
 * Migration Script: Transfer vectors from Firestore to Qdrant
 * 
 * Usage:
 *   npx ts-node scripts/migrate-to-qdrant.ts
 * 
 * This script:
 * 1. Reads all vector embeddings from Firestore
 * 2. Transfers them to Qdrant
 * 3. Validates the migration
 * 4. Optionally cleans up old data
 */

import { adminDb } from '@/lib/firebase/server-init';
import { QdrantVectorStore } from '@/lib/rag/qdrant-adapter';
import { RAGConfig } from '@/lib/rag/config';
import type { DocumentChunk } from '@/lib/rag/vector-store-interface';

interface MigrationStats {
  totalDocuments: number;
  successfulMigrations: number;
  failedMigrations: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

async function migrateToQdrant(options: {
  dryRun?: boolean;
  cleanupFirestore?: boolean;
  batchSize?: number;
}): Promise<MigrationStats> {
  const { dryRun = false, cleanupFirestore = false, batchSize = 100 } = options;

  const stats: MigrationStats = {
    totalDocuments: 0,
    successfulMigrations: 0,
    failedMigrations: 0,
    errors: [],
    startTime: new Date(),
  };

  console.log('🚀 Starting migration to Qdrant...');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Cleanup Firestore after migration: ${cleanupFirestore}`);
  console.log('');

  try {
    // Initialize Qdrant
    const qdrantStore = new QdrantVectorStore({
      url: RAGConfig.qdrant.url,
      apiKey: RAGConfig.qdrant.apiKey,
      collectionName: RAGConfig.qdrant.collectionName,
      vectorDimension: RAGConfig.vectorStore.dimension,
    });

    // Health check
    console.log('🔍 Checking Qdrant connection...');
    const isHealthy = await qdrantStore.healthCheck();
    if (!isHealthy) {
      throw new Error('Qdrant is not accessible. Please ensure the service is running.');
    }
    console.log('✅ Qdrant is healthy\n');

    // Initialize collection
    await qdrantStore.initialize();

    // Get current Qdrant stats
    const currentStats = await qdrantStore.getStats();
    console.log(`📊 Current Qdrant stats:`);
    console.log(`  - Total chunks: ${currentStats.totalChunks}`);
    console.log(`  - Vector dimension: ${currentStats.vectorDimension}\n`);

    // Read from Firestore
    console.log('📖 Reading vectors from Firestore...');
    const collectionRef = adminDb.collection('vector_embeddings');
    const snapshot = await collectionRef.get();
    stats.totalDocuments = snapshot.size;

    console.log(`Found ${stats.totalDocuments} documents in Firestore\n`);

    if (stats.totalDocuments === 0) {
      console.log('⚠️  No documents to migrate');
      stats.endTime = new Date();
      stats.duration = stats.endTime.getTime() - stats.startTime.getTime();
      return stats;
    }

    // Process documents in batches
    const chunks: DocumentChunk[] = [];
    let batch: DocumentChunk[] = [];

    snapshot.forEach((doc) => {
      try {
        const data = doc.data();
        
        // Validate document structure
        if (!data.content || !data.embedding || !data.metadata) {
          stats.errors.push(`Document ${doc.id} missing required fields`);
          stats.failedMigrations++;
          return;
        }

        const chunk: DocumentChunk = {
          id: doc.id,
          content: data.content,
          embedding: data.embedding,
          metadata: {
            projectId: data.metadata.projectId,
            userId: data.metadata.userId,
            sourceFile: data.metadata.sourceFile,
            chunkIndex: data.metadata.chunkIndex,
            timestamp: data.metadata.timestamp,
            type: data.metadata.type || 'context',
          },
        };

        batch.push(chunk);
        chunks.push(chunk);

      } catch (error) {
        stats.errors.push(`Error processing document ${doc.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        stats.failedMigrations++;
      }
    });

    // Migrate to Qdrant
    if (!dryRun && batch.length > 0) {
      console.log(`📤 Migrating ${batch.length} chunks to Qdrant...`);
      
      for (let i = 0; i < batch.length; i += batchSize) {
        const currentBatch = batch.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(batch.length / batchSize);

        try {
          await qdrantStore.addChunks(currentBatch);
          stats.successfulMigrations += currentBatch.length;
          
          console.log(`  ✓ Batch ${batchNum}/${totalBatches} migrated (${currentBatch.length} chunks)`);
        } catch (error) {
          stats.failedMigrations += currentBatch.length;
          stats.errors.push(`Batch ${batchNum} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`  ✗ Batch ${batchNum}/${totalBatches} failed`);
        }
      }
    } else if (dryRun) {
      console.log(`🔍 DRY RUN: Would migrate ${batch.length} chunks`);
      stats.successfulMigrations = batch.length;
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const finalStats = await qdrantStore.getStats();
    console.log(`  - Total chunks in Qdrant: ${finalStats.totalChunks}`);
    
    if (!dryRun && finalStats.totalChunks >= currentStats.totalChunks + stats.successfulMigrations) {
      console.log('  ✅ Migration verified successfully');
    } else if (!dryRun) {
      console.log('  ⚠️  Warning: Chunk count mismatch. Please verify manually.');
    }

    // Cleanup Firestore (if requested)
    if (cleanupFirestore && !dryRun && stats.successfulMigrations > 0) {
      console.log('\n🧹 Cleaning up Firestore...');
      console.log('⚠️  This feature is not implemented yet for safety.');
      console.log('   Please manually delete Firestore documents after verifying the migration.');
    }

  } catch (error) {
    stats.errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('\n❌ Migration failed:', error);
  }

  stats.endTime = new Date();
  stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

  return stats;
}

/**
 * Print migration summary
 */
function printSummary(stats: MigrationStats): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total documents:        ${stats.totalDocuments}`);
  console.log(`Successful migrations:  ${stats.successfulMigrations}`);
  console.log(`Failed migrations:      ${stats.failedMigrations}`);
  console.log(`Duration:               ${stats.duration ? (stats.duration / 1000).toFixed(2) + 's' : 'N/A'}`);
  
  if (stats.errors.length > 0) {
    console.log(`\nErrors (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach((error, idx) => {
      console.log(`  ${idx + 1}. ${error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`  ... and ${stats.errors.length - 10} more errors`);
    }
  }
  
  console.log('='.repeat(60));
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const cleanup = args.includes('--cleanup');
  const batchSize = parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '100', 10);

  if (args.includes('--help')) {
    console.log(`
Migration Script: Transfer vectors from Firestore to Qdrant

Usage:
  npx ts-node scripts/migrate-to-qdrant.ts [options]

Options:
  --dry-run              Run migration without making changes
  --cleanup              Delete Firestore documents after successful migration
  --batch-size=N         Number of documents per batch (default: 100)
  --help                 Show this help message

Examples:
  # Dry run to see what would be migrated
  npx ts-node scripts/migrate-to-qdrant.ts --dry-run

  # Actual migration
  npx ts-node scripts/migrate-to-qdrant.ts

  # Migration with cleanup
  npx ts-node scripts/migrate-to-qdrant.ts --cleanup

  # Custom batch size
  npx ts-node scripts/migrate-to-qdrant.ts --batch-size=50
    `);
    process.exit(0);
  }

  const stats = await migrateToQdrant({
    dryRun,
    cleanupFirestore: cleanup,
    batchSize,
  });

  printSummary(stats);

  if (stats.failedMigrations > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { migrateToQdrant };
export type { MigrationStats };
