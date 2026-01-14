#!/usr/bin/env tsx
/**
 * Flow Configuration Generator
 * 
 * Generates dynamic flow configurations from existing static Genkit flows.
 * Uses the ConfigurationGenerator to create database-ready flow configs.
 * 
 * Usage:
 *   npm run create-flow-configs
 *   tsx scripts/migration/create-flow-configs.ts [flowName]
 */

import * as fs from 'fs';
import * as path from 'path';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ConfigurationGenerator } from '@/lib/migration/generator/ConfigurationGenerator';
import type { FlowConfig } from '@/lib/models/flow-config';

// Initialize Firebase
try {
  initializeApp();
} catch (error) {
  // Already initialized
}

const db = getFirestore();

/**
 * Save flow configuration to Firestore
 */
async function saveFlowConfig(flowConfig: Omit<FlowConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await db.collection('flowConfigs').add({
    ...flowConfig,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log(`  💾 Saved to Firestore with ID: ${docRef.id}`);
  return docRef.id;
}

/**
 * Generate and save flow configuration for a single flow
 */
async function generateFlowConfig(flowName: string, saveToDB: boolean = true): Promise<FlowConfig | null> {
  const flowPath = path.join(process.cwd(), 'src/ai/flows', `${flowName}.ts`);
  
  if (!fs.existsSync(flowPath)) {
    throw new Error(`Flow file not found: ${flowPath}`);
  }

  console.log(`\n🔧 Generating configuration for: ${flowName}`);
  console.log(`  📄 Source: ${flowPath}`);

  const generator = new ConfigurationGenerator();
  
  try {
    const flowConfig = await generator.generateFlowConfig(flowPath);
    
    console.log(`  ✅ Configuration generated successfully`);
    console.log(`  📊 Steps: ${flowConfig.steps.length}`);
    console.log(`  🏷️  Category: ${flowConfig.category}`);
    console.log(`  🏷️  Tags: ${flowConfig.tags.join(', ')}`);

    // Save to JSON file for review
    const outputDir = path.join(process.cwd(), 'migration-configs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, `${flowName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(flowConfig, null, 2));
    console.log(`  📝 Config saved to: ${outputPath}`);

    // Save to database if requested
    if (saveToDB) {
      const docId = await saveFlowConfig(flowConfig);
      return { ...flowConfig, id: docId } as FlowConfig;
    }

    return flowConfig as FlowConfig;
  } catch (error) {
    console.error(`  ❌ Failed to generate configuration:`, error);
    throw error;
  }
}

/**
 * Generate configurations for all flows
 */
async function generateAllFlowConfigs(saveToDB: boolean = true): Promise<void> {
  const flowsDir = path.join(process.cwd(), 'src/ai/flows');
  const flowFiles = fs.readdirSync(flowsDir)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts');

  console.log(`🚀 Generating configurations for ${flowFiles.length} flows...\n`);
  console.log(`Database save: ${saveToDB ? 'ENABLED' : 'DISABLED'}\n`);

  const results = {
    success: [] as string[],
    failed: [] as string[],
  };

  for (const file of flowFiles) {
    const flowName = file.replace('.ts', '');
    
    try {
      await generateFlowConfig(flowName, saveToDB);
      results.success.push(flowName);
    } catch (error) {
      console.error(`\n❌ Failed to process ${flowName}:`, error);
      results.failed.push(flowName);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`\nSuccessful: ${results.success.length}/${flowFiles.length}`);
  if (results.success.length > 0) {
    console.log(`  ✅ ${results.success.join(', ')}`);
  }
  
  if (results.failed.length > 0) {
    console.log(`\nFailed: ${results.failed.length}/${flowFiles.length}`);
    console.log(`  ❌ ${results.failed.join(', ')}`);
  }
  
  console.log('\n' + '='.repeat(80) + '\n');

  // Save summary
  const summaryPath = path.join(process.cwd(), 'migration-configs', 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
  console.log(`📄 Summary saved to: ${summaryPath}\n`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const flowName = args.find(arg => !arg.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  const saveToDB = !dryRun;

  console.log('🔧 Flow Configuration Generator\n');
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - configurations will NOT be saved to database\n');
  }

  try {
    if (flowName) {
      // Generate specific flow
      await generateFlowConfig(flowName, saveToDB);
      console.log('\n✅ Configuration generation complete!');
    } else {
      // Generate all flows
      await generateAllFlowConfigs(saveToDB);
      console.log('✅ All configurations generated!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

main();
