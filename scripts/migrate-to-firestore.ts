#!/usr/bin/env tsx
/**
 * Migration Script: Move Flows, Prompts, and Tools to Firestore
 * 
 * This script migrates existing configurations to Firestore collections
 * for use with the new admin services.
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

/**
 * Migration Statistics
 */
interface MigrationStats {
  flows: { total: number; success: number; failed: number; errors: string[] };
  prompts: { total: number; success: number; failed: number; errors: string[] };
  tools: { total: number; success: number; failed: number; errors: string[] };
}

const stats: MigrationStats = {
  flows: { total: 0, success: 0, failed: 0, errors: [] },
  prompts: { total: 0, success: 0, failed: 0, errors: [] },
  tools: { total: 0, success: 0, failed: 0, errors: [] },
};

/**
 * Load flow configurations from code
 */
async function loadFlowConfigurations() {
  console.log('📦 Loading flow configurations...');
  
  const flows = [];
  const flowsDir = path.join(process.cwd(), 'src/ai/flows');
  
  // Common flows to migrate
  const flowDefinitions = [
    {
      name: 'generate-text',
      displayName: 'Generate Text',
      description: 'Generate text content using AI',
      category: 'generation',
      tags: ['text', 'generation', 'ai'],
    },
    {
      name: 'generate-report-section',
      displayName: 'Generate Report Section',
      description: 'Generate a section of a report with RAG context',
      category: 'reporting',
      tags: ['report', 'section', 'rag'],
    },
    {
      name: 'generate-chapter-content',
      displayName: 'Generate Chapter Content',
      description: 'Generate chapter content for documents',
      category: 'content',
      tags: ['chapter', 'document', 'content'],
    },
    {
      name: 'summarize-text',
      displayName: 'Summarize Text',
      description: 'Summarize long text into concise content',
      category: 'processing',
      tags: ['summary', 'text', 'processing'],
    },
    {
      name: 'translate-text',
      displayName: 'Translate Text',
      description: 'Translate text between languages',
      category: 'processing',
      tags: ['translation', 'language', 'processing'],
    },
    {
      name: 'paraphrase-text',
      displayName: 'Paraphrase Text',
      description: 'Rephrase text while maintaining meaning',
      category: 'processing',
      tags: ['paraphrase', 'rewrite', 'text'],
    },
    {
      name: 'grammar-checker',
      displayName: 'Grammar Checker',
      description: 'Check and fix grammar issues',
      category: 'analysis',
      tags: ['grammar', 'correction', 'quality'],
    },
    {
      name: 'plagiarism-checker',
      displayName: 'Plagiarism Checker',
      description: 'Check content for plagiarism',
      category: 'analysis',
      tags: ['plagiarism', 'detection', 'quality'],
    },
    {
      name: 'academic-literature-review',
      displayName: 'Academic Literature Review',
      description: 'Generate academic literature review',
      category: 'academic',
      tags: ['academic', 'literature', 'review'],
    },
    {
      name: 'graduation-project-generator',
      displayName: 'Graduation Project Generator',
      description: 'Generate complete graduation project',
      category: 'academic',
      tags: ['graduation', 'project', 'academic'],
    },
  ];

  for (const def of flowDefinitions) {
    flows.push({
      id: def.name,
      name: def.name,
      displayName: def.displayName,
      description: def.description,
      version: 1,
      status: 'active' as const,
      category: def.category,
      tags: def.tags,
      steps: [],
      inputSchema: {},
      outputSchema: {},
      createdBy: 'migration-script',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      publishedAt: Timestamp.now(),
      settings: {
        timeout: 300000,
        retryPolicy: {
          maxRetries: 3,
          backoffMs: 1000,
        },
      },
    });
  }

  console.log(`✅ Loaded ${flows.length} flow configurations`);
  return flows;
}

/**
 * Load prompt templates
 */
async function loadPromptTemplates() {
  console.log('📦 Loading prompt templates...');
  
  const prompts = [];

  // Common prompt templates
  const promptDefinitions = [
    {
      name: 'generate-text-prompt',
      displayName: 'Generate Text Prompt',
      description: 'General purpose text generation prompt',
      category: 'generation',
      tags: ['text', 'generation'],
      template: 'Generate {{type}} content about {{topic}}. {{instructions}}',
      variables: [
        { name: 'type', type: 'string', required: true, description: 'Type of content' },
        { name: 'topic', type: 'string', required: true, description: 'Main topic' },
        { name: 'instructions', type: 'string', required: false, description: 'Additional instructions' },
      ],
    },
    {
      name: 'summarize-prompt',
      displayName: 'Summarize Prompt',
      description: 'Prompt for text summarization',
      category: 'processing',
      tags: ['summary', 'processing'],
      template: 'Summarize the following text in {{maxWords}} words:\n\n{{text}}',
      variables: [
        { name: 'text', type: 'string', required: true, description: 'Text to summarize' },
        { name: 'maxWords', type: 'number', required: false, description: 'Maximum words' },
      ],
    },
    {
      name: 'translate-prompt',
      displayName: 'Translate Prompt',
      description: 'Prompt for text translation',
      category: 'processing',
      tags: ['translation', 'language'],
      template: 'Translate the following text from {{sourceLang}} to {{targetLang}}:\n\n{{text}}',
      variables: [
        { name: 'text', type: 'string', required: true, description: 'Text to translate' },
        { name: 'sourceLang', type: 'string', required: true, description: 'Source language' },
        { name: 'targetLang', type: 'string', required: true, description: 'Target language' },
      ],
    },
    {
      name: 'academic-writing-prompt',
      displayName: 'Academic Writing Prompt',
      description: 'Prompt for academic content generation',
      category: 'academic',
      tags: ['academic', 'writing'],
      template: 'Write an academic {{sectionType}} about {{topic}}. Use formal language and cite sources. {{guidelines}}',
      variables: [
        { name: 'sectionType', type: 'string', required: true, description: 'Type of section' },
        { name: 'topic', type: 'string', required: true, description: 'Topic to write about' },
        { name: 'guidelines', type: 'string', required: false, description: 'Writing guidelines' },
      ],
    },
  ];

  for (const def of promptDefinitions) {
    prompts.push({
      id: def.name,
      name: def.name,
      displayName: def.displayName,
      description: def.description,
      version: 1,
      status: 'active' as const,
      category: def.category,
      tags: def.tags,
      template: def.template,
      templateContent: def.template,
      variables: def.variables,
      model: 'gemini-2.0-flash-exp',
      createdBy: 'migration-script',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      publishedAt: Timestamp.now(),
      settings: {
        temperature: 0.7,
        maxTokens: 2048,
      },
    });
  }

  console.log(`✅ Loaded ${prompts.length} prompt templates`);
  return prompts;
}

/**
 * Load tool configurations
 */
async function loadToolConfigurations() {
  console.log('📦 Loading tool configurations...');
  
  const tools = [];

  // Common tool definitions
  const toolDefinitions = [
    {
      name: 'web-search',
      displayName: 'Web Search',
      description: 'Search the web for information',
      category: 'research',
      type: 'external' as const,
      handler: 'https://api.example.com/search',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          maxResults: { type: 'number', description: 'Maximum results', default: 10 },
        },
        required: ['query'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          results: { type: 'array', items: { type: 'object' } },
        },
      },
    },
    {
      name: 'citation-generator',
      displayName: 'Citation Generator',
      description: 'Generate citations in various formats',
      category: 'academic',
      type: 'builtin' as const,
      handler: 'citation-generator',
      inputSchema: {
        type: 'object',
        properties: {
          source: { type: 'object', description: 'Source information' },
          format: { type: 'string', enum: ['APA', 'MLA', 'Chicago'], description: 'Citation format' },
        },
        required: ['source', 'format'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          citation: { type: 'string', description: 'Formatted citation' },
        },
      },
    },
    {
      name: 'pdf-processor',
      displayName: 'PDF Processor',
      description: 'Extract text and metadata from PDF files',
      category: 'processing',
      type: 'builtin' as const,
      handler: 'pdf-processor',
      inputSchema: {
        type: 'object',
        properties: {
          pdfUrl: { type: 'string', description: 'URL to PDF file' },
          extractImages: { type: 'boolean', description: 'Extract images', default: false },
        },
        required: ['pdfUrl'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Extracted text' },
          metadata: { type: 'object', description: 'PDF metadata' },
        },
      },
    },
  ];

  for (const def of toolDefinitions) {
    tools.push({
      name: def.name,
      displayName: def.displayName,
      description: def.description,
      category: def.category,
      tags: [],
      type: def.type,
      handler: def.handler,
      inputSchema: def.inputSchema,
      outputSchema: def.outputSchema,
      status: 'active' as const,
      version: '1.0.0',
      createdBy: 'migration-script',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      timeout: 30000,
    });
  }

  console.log(`✅ Loaded ${tools.length} tool configurations`);
  return tools;
}

/**
 * Migrate flows to Firestore
 */
async function migrateFlows(flows: any[]) {
  console.log('\n🚀 Migrating flows to Firestore...');
  stats.flows.total = flows.length;

  const batch = adminDb.batch();
  let batchCount = 0;

  for (const flow of flows) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.FLOWS).doc(flow.id);
      
      // Check if already exists
      const existing = await docRef.get();
      if (existing.exists) {
        console.log(`⚠️  Flow ${flow.name} already exists, skipping...`);
        stats.flows.success++;
        continue;
      }

      batch.set(docRef, flow);
      batchCount++;

      // Commit batch every 500 documents
      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }

      stats.flows.success++;
      console.log(`✅ Migrated flow: ${flow.name}`);
    } catch (error) {
      stats.flows.failed++;
      const errorMsg = `Failed to migrate flow ${flow.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      stats.flows.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  // Commit remaining batch
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Flows migration complete: ${stats.flows.success}/${stats.flows.total} successful`);
}

/**
 * Migrate prompts to Firestore
 */
async function migratePrompts(prompts: any[]) {
  console.log('\n🚀 Migrating prompts to Firestore...');
  stats.prompts.total = prompts.length;

  const batch = adminDb.batch();
  let batchCount = 0;

  for (const prompt of prompts) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.PROMPTS).doc(prompt.id);
      
      // Check if already exists
      const existing = await docRef.get();
      if (existing.exists) {
        console.log(`⚠️  Prompt ${prompt.name} already exists, skipping...`);
        stats.prompts.success++;
        continue;
      }

      batch.set(docRef, prompt);
      batchCount++;

      // Commit batch every 500 documents
      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }

      stats.prompts.success++;
      console.log(`✅ Migrated prompt: ${prompt.name}`);
    } catch (error) {
      stats.prompts.failed++;
      const errorMsg = `Failed to migrate prompt ${prompt.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      stats.prompts.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  // Commit remaining batch
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Prompts migration complete: ${stats.prompts.success}/${stats.prompts.total} successful`);
}

/**
 * Migrate tools to Firestore
 */
async function migrateTools(tools: any[]) {
  console.log('\n🚀 Migrating tools to Firestore...');
  stats.tools.total = tools.length;

  const batch = adminDb.batch();
  let batchCount = 0;

  for (const tool of tools) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.TOOLS).doc(tool.name);
      
      // Check if already exists
      const existing = await docRef.get();
      if (existing.exists) {
        console.log(`⚠️  Tool ${tool.name} already exists, skipping...`);
        stats.tools.success++;
        continue;
      }

      batch.set(docRef, tool);
      batchCount++;

      // Commit batch every 500 documents
      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }

      stats.tools.success++;
      console.log(`✅ Migrated tool: ${tool.name}`);
    } catch (error) {
      stats.tools.failed++;
      const errorMsg = `Failed to migrate tool ${tool.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      stats.tools.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  // Commit remaining batch
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Tools migration complete: ${stats.tools.success}/${stats.tools.total} successful`);
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
  console.log(`   ❌ Failed: ${stats.flows.failed}`);
  if (stats.flows.errors.length > 0) {
    console.log('   Errors:');
    stats.flows.errors.forEach(err => console.log(`     - ${err}`));
  }

  console.log('\n📝 Prompts:');
  console.log(`   Total: ${stats.prompts.total}`);
  console.log(`   ✅ Success: ${stats.prompts.success}`);
  console.log(`   ❌ Failed: ${stats.prompts.failed}`);
  if (stats.prompts.errors.length > 0) {
    console.log('   Errors:');
    stats.prompts.errors.forEach(err => console.log(`     - ${err}`));
  }

  console.log('\n🔧 Tools:');
  console.log(`   Total: ${stats.tools.total}`);
  console.log(`   ✅ Success: ${stats.tools.success}`);
  console.log(`   ❌ Failed: ${stats.tools.failed}`);
  if (stats.tools.errors.length > 0) {
    console.log('   Errors:');
    stats.tools.errors.forEach(err => console.log(`     - ${err}`));
  }

  const totalSuccess = stats.flows.success + stats.prompts.success + stats.tools.success;
  const totalFailed = stats.flows.failed + stats.prompts.failed + stats.tools.failed;
  const total = stats.flows.total + stats.prompts.total + stats.tools.total;

  console.log('\n' + '='.repeat(70));
  console.log(`📈 OVERALL: ${totalSuccess}/${total} successful, ${totalFailed} failed`);
  console.log('='.repeat(70) + '\n');

  if (totalFailed === 0) {
    console.log('🎉 Migration completed successfully! All items migrated.\n');
  } else {
    console.log('⚠️  Migration completed with some failures. Check errors above.\n');
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 STARTING FIRESTORE MIGRATION');
  console.log('='.repeat(70) + '\n');

  try {
    // Load configurations
    const flows = await loadFlowConfigurations();
    const prompts = await loadPromptTemplates();
    const tools = await loadToolConfigurations();

    // Run migrations
    await migrateFlows(flows);
    await migratePrompts(prompts);
    await migrateTools(tools);

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
