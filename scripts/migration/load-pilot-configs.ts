#!/usr/bin/env tsx
/**
 * Load Pilot Flow Configurations to Firestore
 * 
 * Loads the 5 pilot flow configurations into Firestore for testing.
 */

import * as fs from 'fs';
import * as path from 'path';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase
try {
  initializeApp();
} catch (error) {
  // Already initialized
}

const db = getFirestore();

interface FlowConfig {
  name: string;
  version: number;
  description: string;
  category: string;
  tags: string[];
  isActive: boolean;
  inputSchema: any;
  outputSchema: any;
  steps: any[];
  metadata: any;
}

async function loadPilotConfigs(): Promise<void> {
  console.log('🚀 Loading Pilot Flow Configurations to Firestore\n');

  const pilotDir = path.join(process.cwd(), 'migration-configs/pilot');
  const configFiles = fs.readdirSync(pilotDir).filter(f => f.endsWith('.json'));

  console.log(`📋 Found ${configFiles.length} pilot configurations\n`);

  const results = {
    success: [] as string[],
    failed: [] as string[],
  };

  for (const file of configFiles) {
    const flowName = file.replace('.json', '');
    console.log(`\n📄 Processing: ${flowName}`);

    try {
      const configPath = path.join(pilotDir, file);
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as FlowConfig;

      // Check if flow already exists
      const existingQuery = await db.collection('flowConfigs')
        .where('name', '==', configData.name)
        .get();

      if (!existingQuery.empty) {
        console.log(`  ⚠️  Flow already exists, updating...`);
        const docRef = existingQuery.docs[0].ref;
        await docRef.update({
          ...configData,
          updatedAt: new Date().toISOString(),
          migrationDate: new Date().toISOString(),
        });
        console.log(`  ✅ Updated existing flow`);
      } else {
        console.log(`  ✨ Creating new flow...`);
        await db.collection('flowConfigs').add({
          ...configData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log(`  ✅ Created new flow`);
      }

      results.success.push(flowName);
      console.log(`  💾 Saved to Firestore`);

    } catch (error) {
      console.error(`  ❌ Failed:`, error);
      results.failed.push(flowName);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 LOADING SUMMARY');
  console.log('='.repeat(80));
  console.log(`\nTotal: ${configFiles.length}`);
  console.log(`✅ Successful: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.success.length > 0) {
    console.log('\nSuccessfully loaded:');
    results.success.forEach(name => console.log(`  ✅ ${name}`));
  }

  if (results.failed.length > 0) {
    console.log('\nFailed:');
    results.failed.forEach(name => console.log(`  ❌ ${name}`));
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Main execution
async function main() {
  try {
    await loadPilotConfigs();
    console.log('✅ Pilot configurations loaded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Loading failed:', error);
    process.exit(1);
  }
}

main();
