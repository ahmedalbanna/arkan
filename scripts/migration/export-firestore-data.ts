/**
 * Export Firestore Data
 * Exports projects, transactions, and other collections
 */

import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

interface ExportResult {
  collection: string;
  count: number;
  file: string;
}

async function exportCollection(collectionName: string, exportDir: string): Promise<ExportResult> {
  console.log(`\n📦 Exporting collection: ${collectionName}`);
  
  const snapshot = await admin.firestore().collection(collectionName).get();
  const documents: any[] = [];

  snapshot.forEach(doc => {
    documents.push({
      id: doc.id,
      ...doc.data(),
      _exportedAt: new Date().toISOString(),
    });
  });

  const fileName = `${collectionName}.json`;
  const filePath = path.join(exportDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(documents, null, 2));

  console.log(`   ✅ Exported ${documents.length} documents`);
  console.log(`   💾 Saved to: ${filePath}`);

  return {
    collection: collectionName,
    count: documents.length,
    file: fileName,
  };
}

async function exportFirestoreData() {
  console.log('🔥 Exporting Firestore Data...\n');

  const exportDir = path.join(process.cwd(), 'migration-exports', 'firestore');
  await fs.mkdir(exportDir, { recursive: true });

  try {
    const collections = [
      'users',
      'projects',
      'transactions',
      'creditLedger',
      'notifications',
      'reportTemplates',
      'docxTemplates',
      'pptxTemplates',
      'agents',
      'agentCategories',
      'settings',
      'features',
    ];

    const results: ExportResult[] = [];

    for (const collection of collections) {
      try {
        const result = await exportCollection(collection, exportDir);
        results.push(result);
      } catch (error) {
        console.warn(`   ⚠️  Could not export ${collection}:`, (error as Error).message);
        results.push({
          collection,
          count: 0,
          file: 'ERROR',
        });
      }
    }

    // Generate summary
    const summary = {
      totalCollections: collections.length,
      exportedCollections: results.filter(r => r.count > 0).length,
      totalDocuments: results.reduce((sum, r) => sum + r.count, 0),
      collections: results,
      exportedAt: new Date().toISOString(),
    };

    console.log('\n📊 Export Summary:');
    console.log(`   Total Collections: ${summary.totalCollections}`);
    console.log(`   Exported Successfully: ${summary.exportedCollections}`);
    console.log(`   Total Documents: ${summary.totalDocuments}`);
    console.log('\n   Collection Counts:');
    results.forEach(r => {
      console.log(`   - ${r.collection}: ${r.count} documents`);
    });

    // Save summary
    const summaryFile = path.join(exportDir, '_export-summary.json');
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));

    console.log(`\n✅ Firestore export completed!`);
    console.log(`   Summary: ${summaryFile}`);

    return { results, summary };
  } catch (error) {
    console.error('❌ Firestore export failed:', error);
    throw error;
  }
}

// Run export
if (require.main === module) {
  exportFirestoreData()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { exportFirestoreData };
