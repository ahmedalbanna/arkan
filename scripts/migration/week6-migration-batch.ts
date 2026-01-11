#!/usr/bin/env tsx

/**
 * Week 6 Migration Batch Script
 * Migrates Phase 1 (Simple Flows) and Phase 2 (Analysis Flows)
 * 
 * Phase 1: 15 Simple Text Generation Flows
 * Phase 2: 10 Analysis Flows
 * 
 * Total: 25 flows to be migrated during Week 6
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = require('../../docudec-firebase-adminsdk-2maa7-d07a19d3fc.json');

// Check if app is already initialized
try {
  getFirestore();
} catch (error) {
  // App not initialized, so initialize it
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

interface FlowConfig {
  flowId: string;
  name: string;
  description: string;
  category: 'simple' | 'analysis' | 'complex' | 'academic';
  phase: number;
  inputSchema: any;
  outputSchema: any;
  steps: FlowStep[];
  version: number;
  isActive: boolean;
  tags: string[];
}

interface FlowStep {
  stepId: string;
  type: 'generate' | 'retrieve' | 'tool' | 'format';
  config: any;
  nextStepId?: string;
}

// Phase 1: Simple Text Generation Flows
const PHASE1_FLOWS = [
  {
    id: 'generate-text',
    name: 'Generate Text',
    description: 'Generate text based on a prompt',
    tags: ['text-generation', 'creative', 'simple']
  },
  {
    id: 'paraphrase-text',
    name: 'Paraphrase Text',
    description: 'Paraphrase text in different styles',
    tags: ['text-transformation', 'paraphrasing', 'simple']
  },
  {
    id: 'summarize-text',
    name: 'Summarize Text',
    description: 'Summarize text in different lengths',
    tags: ['summarization', 'text-processing', 'simple']
  },
  {
    id: 'translate-text',
    name: 'Translate Text',
    description: 'Translate text between languages',
    tags: ['translation', 'multilingual', 'simple']
  },
  {
    id: 'humanize-text',
    name: 'Humanize Text',
    description: 'Make AI-generated text sound more human',
    tags: ['humanization', 'text-refinement', 'simple']
  },
  {
    id: 'manipulate-text',
    name: 'Manipulate Text',
    description: 'Perform various text manipulations',
    tags: ['text-manipulation', 'formatting', 'simple']
  },
  {
    id: 'text-stylist',
    name: 'Text Stylist',
    description: 'Apply different writing styles to text',
    tags: ['style-transfer', 'writing', 'simple']
  },
  {
    id: 'topic-explainer',
    name: 'Topic Explainer',
    description: 'Explain complex topics in simple terms',
    tags: ['education', 'explanation', 'simple']
  },
  {
    id: 'generate-citation',
    name: 'Generate Citation',
    description: 'Generate academic citations in various formats',
    tags: ['citation', 'academic', 'simple']
  },
  {
    id: 'generate-ideas',
    name: 'Generate Ideas',
    description: 'Generate creative ideas for topics',
    tags: ['brainstorming', 'creativity', 'simple']
  },
  {
    id: 'rewrite-to-markdown',
    name: 'Rewrite to Markdown',
    description: 'Convert text to markdown format',
    tags: ['markdown', 'formatting', 'simple']
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Convert text to speech format',
    tags: ['tts', 'audio', 'simple']
  },
  {
    id: 'image-to-text',
    name: 'Image to Text',
    description: 'Extract text from images',
    tags: ['ocr', 'image-processing', 'simple']
  },
  {
    id: 'generate-ui-description',
    name: 'Generate UI Description',
    description: 'Generate UI component descriptions',
    tags: ['ui', 'development', 'simple']
  },
  {
    id: 'generate-plantuml',
    name: 'Generate PlantUML',
    description: 'Generate PlantUML diagrams from descriptions',
    tags: ['diagrams', 'visualization', 'simple']
  }
];

// Phase 2: Analysis Flows
const PHASE2_FLOWS = [
  {
    id: 'grammar-checker',
    name: 'Grammar Checker',
    description: 'Check and correct grammar errors',
    tags: ['grammar', 'analysis', 'quality']
  },
  {
    id: 'bias-checker',
    name: 'Bias Checker',
    description: 'Detect biases in text',
    tags: ['bias-detection', 'analysis', 'quality']
  },
  {
    id: 'fact-checker',
    name: 'Fact Checker',
    description: 'Verify factual accuracy of statements',
    tags: ['fact-checking', 'analysis', 'verification']
  },
  {
    id: 'plagiarism-checker',
    name: 'Plagiarism Checker',
    description: 'Detect potential plagiarism in text',
    tags: ['plagiarism', 'analysis', 'academic']
  },
  {
    id: 'detect-ai-content',
    name: 'AI Content Detector',
    description: 'Detect AI-generated content',
    tags: ['ai-detection', 'analysis', 'quality']
  },
  {
    id: 'sentence-structure-checker',
    name: 'Sentence Structure Checker',
    description: 'Analyze and improve sentence structure',
    tags: ['sentence-analysis', 'analysis', 'quality']
  },
  {
    id: 'academic-paper-quality-checker',
    name: 'Academic Paper Quality Checker',
    description: 'Evaluate academic paper quality',
    tags: ['academic', 'analysis', 'quality-assurance']
  },
  {
    id: 'ai-proofread-document',
    name: 'AI Proofreader',
    description: 'Proofread documents for errors',
    tags: ['proofreading', 'analysis', 'quality']
  },
  {
    id: 'fact-retrieval',
    name: 'Fact Retrieval',
    description: 'Retrieve facts from knowledge base',
    tags: ['facts', 'retrieval', 'rag']
  },
  {
    id: 'question-answering',
    name: 'Question Answering',
    description: 'Answer questions based on context',
    tags: ['qa', 'analysis', 'rag']
  }
];

/**
 * Generate flow configuration from static flow file
 */
async function generateFlowConfig(flowMeta: any, phase: number): Promise<FlowConfig> {
  const flowFilePath = path.join(process.cwd(), 'src/ai/flows', `${flowMeta.id}.ts`);
  
  if (!fs.existsSync(flowFilePath)) {
    throw new Error(`Flow file not found: ${flowFilePath}`);
  }

  const flowContent = fs.readFileSync(flowFilePath, 'utf-8');
  
  // Extract schemas
  const inputSchemaMatch = flowContent.match(/inputSchema:\s*(\w+Schema)/);
  const outputSchemaMatch = flowContent.match(/outputSchema:\s*(\w+Schema)/);
  
  // Basic configuration
  const config: FlowConfig = {
    flowId: flowMeta.id,
    name: flowMeta.name,
    description: flowMeta.description,
    category: phase === 1 ? 'simple' : 'analysis',
    phase,
    inputSchema: {
      type: 'reference',
      schemaName: inputSchemaMatch?.[1] || 'unknown'
    },
    outputSchema: {
      type: 'reference',
      schemaName: outputSchemaMatch?.[1] || 'unknown'
    },
    steps: await extractSteps(flowContent, flowMeta.id),
    version: 1,
    isActive: true,
    tags: flowMeta.tags
  };

  return config;
}

/**
 * Extract steps from flow file
 */
async function extractSteps(flowContent: string, flowId: string): Promise<FlowStep[]> {
  const steps: FlowStep[] = [];
  
  // Check if flow has prompt definition
  const hasPrompt = flowContent.includes('definePrompt');
  const hasRAG = flowContent.includes('retrieve') || flowContent.includes('rag');
  const hasTool = flowContent.includes('defineTool');
  
  let stepOrder = 1;
  
  // Step 1: RAG Retrieval (if needed)
  if (hasRAG) {
    steps.push({
      stepId: `step-${stepOrder}`,
      type: 'retrieve',
      config: {
        collectionName: 'documents',
        topK: 5,
        outputVariable: 'context'
      },
      nextStepId: `step-${stepOrder + 1}`
    });
    stepOrder++;
  }
  
  // Step 2: Generation (main step)
  if (hasPrompt) {
    const promptMatch = flowContent.match(/name:\s*'([^']+)'/);
    const modelMatch = flowContent.match(/model:\s*'([^']+)'/);
    const temperatureMatch = flowContent.match(/temperature:\s*([\d.]+|RECOMMENDED_TEMPERATURES\.\w+)/);
    
    steps.push({
      stepId: `step-${stepOrder}`,
      type: 'generate',
      config: {
        promptId: promptMatch?.[1] || `${flowId}-prompt`,
        model: modelMatch?.[1] || 'ollama/gemma:2b',
        temperature: temperatureMatch?.[1] || 0.7,
        outputVariable: 'result'
      },
      nextStepId: steps.length > 0 ? `step-${stepOrder + 1}` : undefined
    });
    stepOrder++;
  }
  
  // Step 3: Tool execution (if needed)
  if (hasTool) {
    steps.push({
      stepId: `step-${stepOrder}`,
      type: 'tool',
      config: {
        toolName: `${flowId}-tool`,
        outputVariable: 'toolResult'
      },
      nextStepId: `step-${stepOrder + 1}`
    });
    stepOrder++;
  }
  
  // Step 4: Format output
  steps.push({
    stepId: `step-${stepOrder}`,
    type: 'format',
    config: {
      template: '{{result}}',
      outputVariable: 'finalOutput'
    },
    nextStepId: undefined
  });
  
  return steps;
}

/**
 * Extract and save prompt configuration
 */
async function extractPromptConfig(flowContent: string, flowId: string) {
  // Try multiple patterns to find prompt definition
  const promptMatch = flowContent.match(/definePrompt\s*\(\s*\{/s) || 
                      flowContent.match(/ai\.definePrompt\s*\(/s);
  
  if (!promptMatch) {
    console.log(`No prompt found for ${flowId}`);
    return null;
  }

  const nameMatch = flowContent.match(/name:\s*['"]([^'"]+)['"]/);
  const promptTextMatch = flowContent.match(/prompt:\s*`([^`]+)`/s);
  const modelMatch = flowContent.match(/model:\s*['"]([^'"]+)['"]/);
  
  const promptConfig = {
    promptId: nameMatch?.[1] || `${flowId}-prompt`,
    flowId,
    name: nameMatch?.[1] || `${flowId} Prompt`,
    template: promptTextMatch?.[1] || '',
    model: modelMatch?.[1] || 'ollama/gemma:2b',
    variables: extractVariables(promptTextMatch?.[1] || ''),
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save to Firestore
  await db.collection('prompts').doc(promptConfig.promptId).set(promptConfig);
  console.log(`✓ Saved prompt: ${promptConfig.promptId}`);
  
  return promptConfig;
}

/**
 * Extract variables from prompt template
 */
function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{\{(\w+)\}\}\}/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/\{|\}/g, ''));
}

/**
 * Remove undefined values from an object recursively
 */
function removeUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item));
  } else if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Save flow configuration to Firestore
 */
async function saveFlowConfig(config: FlowConfig) {
  const cleanedConfig = removeUndefined({
    ...config,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'migration-script',
    migratedAt: new Date().toISOString()
  });
  
  await db.collection('flows').doc(config.flowId).set(cleanedConfig);
  
  console.log(`✓ Migrated flow: ${config.name} (${config.flowId})`);
}

/**
 * Migrate a batch of flows
 */
async function migrateFlowBatch(flows: any[], phase: number) {
  console.log(`\n=== Migrating Phase ${phase} Flows ===`);
  console.log(`Total flows: ${flows.length}\n`);
  
  const results = {
    successful: [] as string[],
    failed: [] as Array<{id: string, error: string}>
  };

  for (const flowMeta of flows) {
    try {
      console.log(`Processing: ${flowMeta.name} (${flowMeta.id})...`);
      
      // Read flow file
      const flowFilePath = path.join(process.cwd(), 'src/ai/flows', `${flowMeta.id}.ts`);
      const flowContent = fs.readFileSync(flowFilePath, 'utf-8');
      
      // Extract and save prompt
      await extractPromptConfig(flowContent, flowMeta.id);
      
      // Generate and save flow config
      const config = await generateFlowConfig(flowMeta, phase);
      await saveFlowConfig(config);
      
      results.successful.push(flowMeta.id);
      console.log(`✓ Successfully migrated: ${flowMeta.name}\n`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.failed.push({ id: flowMeta.id, error: errorMsg });
      console.error(`✗ Failed to migrate ${flowMeta.id}: ${errorMsg}\n`);
    }
  }

  return results;
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Week 6 Migration - Phase 1 & 2                      ║');
  console.log('║   Dynamic Flow System                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const startTime = Date.now();
  
  try {
    // Migrate Phase 1: Simple Flows
    const phase1Results = await migrateFlowBatch(PHASE1_FLOWS, 1);
    
    // Migrate Phase 2: Analysis Flows
    const phase2Results = await migrateFlowBatch(PHASE2_FLOWS, 2);
    
    // Generate report
    const totalTime = Date.now() - startTime;
    const totalSuccessful = phase1Results.successful.length + phase2Results.successful.length;
    const totalFailed = phase1Results.failed.length + phase2Results.failed.length;
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   Migration Summary                                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`Total Flows Processed: ${totalSuccessful + totalFailed}`);
    console.log(`✓ Successful: ${totalSuccessful}`);
    console.log(`✗ Failed: ${totalFailed}`);
    console.log(`Time Elapsed: ${(totalTime / 1000).toFixed(2)}s\n`);
    
    if (phase1Results.failed.length > 0 || phase2Results.failed.length > 0) {
      console.log('Failed Migrations:');
      [...phase1Results.failed, ...phase2Results.failed].forEach(f => {
        console.log(`  - ${f.id}: ${f.error}`);
      });
    }
    
    // Save migration report
    const report = {
      week: 6,
      phases: [1, 2],
      timestamp: new Date().toISOString(),
      duration: totalTime,
      phase1: {
        total: PHASE1_FLOWS.length,
        successful: phase1Results.successful,
        failed: phase1Results.failed
      },
      phase2: {
        total: PHASE2_FLOWS.length,
        successful: phase2Results.successful,
        failed: phase2Results.failed
      },
      summary: {
        totalFlows: totalSuccessful + totalFailed,
        successful: totalSuccessful,
        failed: totalFailed,
        successRate: ((totalSuccessful / (totalSuccessful + totalFailed)) * 100).toFixed(2) + '%'
      }
    };
    
    await db.collection('migration-reports').add(report);
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'migration-output', 'week6-migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✓ Migration report saved to: ${reportPath}`);
    
    console.log('\n✓ Week 6 Migration Complete!\n');
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

export { runMigration, generateFlowConfig, extractPromptConfig };
