#!/usr/bin/env tsx
/**
 * Migration Script: Load from JSON and migrate to Firestore
 * 
 * This script reads the extracted JSON files and migrates them to Firestore.
 */

import { adminDb } from '../src/lib/firebase/server-init';
import { Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Collection names
const COLLECTIONS = {
  FLOWS: 'flows',
  PROMPTS: 'prompts',
  TOOLS: 'tools',
};

interface MigrationStats {
  flows: { total: number; success: number; failed: number; skipped: number; errors: string[] };
  prompts: { total: number; success: number; failed: number; skipped: number; errors: string[] };
  tools: { total: number; success: number; failed: number; skipped: number; errors: string[] };
}

const stats: MigrationStats = {
  flows: { total: 0, success: 0, failed: 0, skipped: 0, errors: [] },
  prompts: { total: 0, success: 0, failed: 0, skipped: 0, errors: [] },
  tools: { total: 0, success: 0, failed: 0, skipped: 0, errors: [] },
};

/**
 * Load JSON file
 */
function loadJSON(filename: string): any[] {
  const filePath = path.join(process.cwd(), 'migration-output', filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Prepare flow for Firestore
 */
function prepareFlow(flow: any): any {
  return {
    id: flow.id || flow.name,
    name: flow.name,
    displayName: flow.displayName || flow.name,
    description: flow.description || `Flow for ${flow.name}`,
    version: flow.version || 1,
    status: flow.status || 'active',
    category: flow.category || 'general',
    tags: flow.tags || [],
    steps: flow.steps || [],
    inputSchema: flow.inputSchema || {},
    outputSchema: flow.outputSchema || {},
    createdBy: flow.createdBy || 'migration',
    createdAt: flow.createdAt || Timestamp.now(),
    updatedAt: flow.updatedAt || Timestamp.now(),
    publishedAt: flow.publishedAt || Timestamp.now(),
    settings: flow.settings || {
      timeout: 300000,
      retryPolicy: {
        maxRetries: 3,
        backoffMs: 1000,
      },
    },
  };
}

/**
 * Prepare prompt for Firestore
 */
function preparePrompt(prompt: any): any {
  return {
    id: prompt.id || prompt.name,
    name: prompt.name,
    displayName: prompt.displayName || prompt.name,
    description: prompt.description || `Prompt for ${prompt.name}`,
    version: prompt.version || 1,
    status: prompt.status || 'active',
    category: prompt.category || 'general',
    tags: prompt.tags || [],
    template: prompt.template || '',
    templateContent: prompt.templateContent || prompt.template || '',
    variables: prompt.variables || [],
    model: prompt.model || 'gemini-2.0-flash-exp',
    systemPrompt: prompt.systemPrompt,
    createdBy: prompt.createdBy || 'migration',
    createdAt: prompt.createdAt || Timestamp.now(),
    updatedAt: prompt.updatedAt || Timestamp.now(),
    publishedAt: prompt.publishedAt || Timestamp.now(),
    settings: prompt.settings || {
      temperature: 0.7,
      maxTokens: 2048,
    },
    testCases: prompt.testCases || [],
  };
}

/**
 * Prepare tool for Firestore
 */
function prepareTool(tool: any): any {
  return {
    name: tool.name,
    displayName: tool.displayName || tool.name,
    description: tool.description || `Tool for ${tool.name}`,
    category: tool.category || 'utility',
    tags: tool.tags || [],
    type: tool.type || 'builtin',
    handler: tool.handler || tool.name,
    inputSchema: tool.inputSchema || {},
    outputSchema: tool.outputSchema || {},
    status: tool.status || 'active',
    version: tool.version || '1.0.0',
    createdBy: tool.createdBy || 'migration',
    createdAt: tool.createdAt || Timestamp.now(),
    updatedAt: tool.updatedAt || Timestamp.now(),
    timeout: tool.timeout || 30000,
    examples: tool.examples || [],
    documentation: tool.documentation,
  };
}

/**
 * Migrate flows to Firestore
 */
async function migrateFlows(flows: any[], overwrite: boolean = false) {
  console.log('\n🚀 Migrating flows to Firestore...');
  stats.flows.total = flows.length;

  for (const flow of flows) {
    try {
      const prepared = prepareFlow(flow);
      const docRef = adminDb.collection(COLLECTIONS.FLOWS).doc(prepared.id);
      
      // Check if already exists
      const existing = await docRef.get();
      if (existing.exists && !overwrite) {
        console.log(`⏭️  Flow ${flow.name} already exists, skipping...`);
        stats.flows.skipped++;
        continue;
      }

      await docRef.set(prepared);
      stats.flows.success++;
      console.log(`✅ Migrated flow: ${flow.name}`);
    } catch (error) {
      stats.flows.failed++;
      const errorMsg = `Failed to migrate flow ${flow.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      stats.flows.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  console.log(`✅ Flows migration complete: ${stats.flows.success}/${stats.flows.total} successful, ${stats.flows.skipped} skipped`);
}

/**
 * Migrate prompts to Firestore
 */
async function migratePrompts(prompts: any[], overwrite: boolean = false) {
  console.log('\n🚀 Migrating prompts to Firestore...');
  stats.prompts.total = prompts.length;

  for (const prompt of prompts) {
    try {
      const prepared = preparePrompt(prompt);
      const docRef = adminDb.collection(COLLECTIONS.PROMPTS).doc(prepared.id);
      
      // Check if already exists
      const existing = await docRef.get();
      if (existing.exists && !overwrite) {
        console.log(`⏭️  Prompt ${prompt.name} already exists, skipping...`);
        stats.prompts.skipped++;
        continue;
      }

      await docRef.set(prepared);
      stats.prompts.success++;
      console.log(`✅ Migrated prompt: ${prompt.name}`);
    } catch (error) {
      stats.prompts.failed++;
      const errorMsg = `Failed to migrate prompt ${prompt.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      stats.prompts.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  console.log(`✅ Prompts migration complete: ${stats.prompts.success}/${stats.prompts.total} successful, ${stats.prompts.skipped} skipped`);
}

/**
 * Migrate tools to Firestore
 */
async function migrateTools(tools: any[], overwrite: boolean = false) {
  console.log('\n🚀 Migrating tools to Firestore...');
  stats.tools.total = tools.length;

  for (const tool of tools) {
    try {
      const prepared = prepareTool(tool);
      const docRef = adminDb.collection(COLLECTIONS.TOOLS).doc(prepared.name);
      
      // Check if already exists
      const existing = await docRef.get();
      if (existing.exists && !overwrite) {
        console.log(`⏭️  Tool ${tool.name} already exists, skipping...`);
        stats.tools.skipped++;
        continue;
      }

      await docRef.set(prepared);
      stats.tools.success++;
      console.log(`✅ Migrated tool: ${tool.name}`);
    } catch (error) {
      stats.tools.failed++;
      const errorMsg = `Failed to migrate tool ${tool.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      stats.tools.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  console.log(`✅ Tools migration complete: ${stats.tools.success}/${stats.tools.total} successful, ${stats.tools.skipped} skipped`);
}

/**
 * Print migration summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(70));

  console.log('\n🔄 Flows:');
  console.log(`   Total: ${stats.flows.total}`);
  console.log(`   ✅ Success: ${stats.flows.success}`);
  console.log(`   ⏭️  Skipped: ${stats.flows.skipped}`);
  console.log(`   ❌ Failed: ${stats.flows.failed}`);
  if (stats.flows.errors.length > 0) {
    console.log('   Errors:');
    stats.flows.errors.forEach(err => console.log(`     - ${err}`));
  }

  console.log('\n📝 Prompts:');
  console.log(`   Total: ${stats.prompts.total}`);
  console.log(`   ✅ Success: ${stats.prompts.success}`);
  console.log(`   ⏭️  Skipped: ${stats.prompts.skipped}`);
  console.log(`   ❌ Failed: ${stats.prompts.failed}`);
  if (stats.prompts.errors.length > 0) {
    console.log('   Errors:');
    stats.prompts.errors.forEach(err => console.log(`     - ${err}`));
  }

  console.log('\n🔧 Tools:');
  console.log(`   Total: ${stats.tools.total}`);
  console.log(`   ✅ Success: ${stats.tools.success}`);
  console.log(`   ⏭️  Skipped: ${stats.tools.skipped}`);
  console.log(`   ❌ Failed: ${stats.tools.failed}`);
  if (stats.tools.errors.length > 0) {
    console.log('   Errors:');
    stats.tools.errors.forEach(err => console.log(`     - ${err}`));
  }

  const totalSuccess = stats.flows.success + stats.prompts.success + stats.tools.success;
  const totalSkipped = stats.flows.skipped + stats.prompts.skipped + stats.tools.skipped;
  const totalFailed = stats.flows.failed + stats.prompts.failed + stats.tools.failed;
  const total = stats.flows.total + stats.prompts.total + stats.tools.total;

  console.log('\n' + '='.repeat(70));
  console.log(`📈 OVERALL: ${totalSuccess}/${total} successful, ${totalSkipped} skipped, ${totalFailed} failed`);
  console.log('='.repeat(70) + '\n');

  if (totalFailed === 0) {
    console.log('🎉 Migration completed successfully!\n');
  } else {
    console.log('⚠️  Migration completed with some failures. Check errors above.\n');
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 STARTING FIRESTORE MIGRATION FROM JSON');
  console.log('='.repeat(70) + '\n');

  // Check for overwrite flag
  const overwrite = process.argv.includes('--overwrite');
  if (overwrite) {
    console.log('⚠️  Overwrite mode enabled - existing documents will be replaced\n');
  }

  try {
    // Load JSON files
    console.log('📦 Loading JSON files from migration-output/...');
    const flows = loadJSON('flows.json');
    const prompts = loadJSON('prompts.json');
    const tools = loadJSON('tools.json');

    console.log(`✅ Loaded ${flows.length} flows`);
    console.log(`✅ Loaded ${prompts.length} prompts`);
    console.log(`✅ Loaded ${tools.length} tools`);

    if (flows.length === 0 && prompts.length === 0 && tools.length === 0) {
      console.log('\n⚠️  No configurations found to migrate.');
      console.log('Run: npm run tsx scripts/extract-existing-configs.ts first\n');
      process.exit(1);
    }

    // Run migrations
    if (flows.length > 0) await migrateFlows(flows, overwrite);
    if (prompts.length > 0) await migratePrompts(prompts, overwrite);
    if (tools.length > 0) await migrateTools(tools, overwrite);

    // Print summary
    printSummary();

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration failed with error:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();
