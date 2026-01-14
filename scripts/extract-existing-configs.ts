#!/usr/bin/env tsx
/**
 * Extract Existing Configurations Script
 * 
 * This script scans your existing codebase to extract flow, prompt,
 * and tool configurations for migration to Firestore.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Timestamp } from 'firebase-admin/firestore';

interface ExtractedFlow {
  name: string;
  displayName: string;
  description: string;
  category: string;
  tags: string[];
  inputSchema?: any;
  outputSchema?: any;
}

interface ExtractedPrompt {
  name: string;
  displayName: string;
  description: string;
  category: string;
  template: string;
  variables: any[];
}

interface ExtractedTool {
  name: string;
  displayName: string;
  description: string;
  category: string;
  inputSchema: any;
  outputSchema: any;
}

const extracted = {
  flows: [] as ExtractedFlow[],
  prompts: [] as ExtractedPrompt[],
  tools: [] as ExtractedTool[],
};

/**
 * Extract flows from src/ai/flows directory
 */
async function extractFlows() {
  console.log('🔍 Scanning for flows in src/ai/flows...');
  
  const flowsDir = path.join(process.cwd(), 'src/ai/flows');
  
  if (!fs.existsSync(flowsDir)) {
    console.log('⚠️  Flows directory not found');
    return;
  }

  const files = fs.readdirSync(flowsDir).filter(f => 
    f.endsWith('.ts') && f !== 'index.ts'
  );

  for (const file of files) {
    const filePath = path.join(flowsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract flow name from filename
    const flowName = file.replace('.ts', '');
    
    // Try to extract displayName and description from comments or exports
    let displayName = flowName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    let description = `AI flow for ${displayName.toLowerCase()}`;
    
    // Look for JSDoc comments
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\n/);
    if (jsdocMatch) {
      description = jsdocMatch[1].trim();
    }

    // Determine category based on filename/content
    let category = 'general';
    if (flowName.includes('generate')) category = 'generation';
    else if (flowName.includes('summarize') || flowName.includes('paraphrase')) category = 'processing';
    else if (flowName.includes('check') || flowName.includes('detect')) category = 'analysis';
    else if (flowName.includes('academic') || flowName.includes('graduation')) category = 'academic';
    else if (flowName.includes('report') || flowName.includes('chapter')) category = 'reporting';

    // Extract tags
    const tags = [category];
    if (flowName.includes('rag')) tags.push('rag');
    if (flowName.includes('ai')) tags.push('ai');
    if (flowName.includes('text')) tags.push('text');

    extracted.flows.push({
      name: flowName,
      displayName,
      description,
      category,
      tags,
    });
  }

  console.log(`✅ Found ${extracted.flows.length} flows`);
}

/**
 * Extract prompts from src/ai/prompts directory
 */
async function extractPrompts() {
  console.log('🔍 Scanning for prompts in src/ai/prompts...');
  
  const promptsDir = path.join(process.cwd(), 'src/ai/prompts');
  
  if (!fs.existsSync(promptsDir)) {
    console.log('⚠️  Prompts directory not found');
    return;
  }

  const files = fs.readdirSync(promptsDir).filter(f => 
    f.endsWith('.ts') && f !== 'index.ts'
  );

  for (const file of files) {
    const filePath = path.join(promptsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const promptName = file.replace('.ts', '');
    
    let displayName = promptName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    let description = `Prompt template for ${displayName.toLowerCase()}`;
    
    // Try to find prompt template in file
    let template = '';
    const templateMatch = content.match(/`([^`]+)`/);
    if (templateMatch) {
      template = templateMatch[1];
    }

    // Determine category
    let category = 'general';
    if (promptName.includes('academic')) category = 'academic';
    else if (promptName.includes('writing')) category = 'writing';
    else if (promptName.includes('generate')) category = 'generation';

    extracted.prompts.push({
      name: promptName,
      displayName,
      description,
      category,
      template,
      variables: [],
    });
  }

  console.log(`✅ Found ${extracted.prompts.length} prompts`);
}

/**
 * Extract tools from src/ai/tools directory
 */
async function extractTools() {
  console.log('🔍 Scanning for tools in src/ai/tools...');
  
  const toolsDir = path.join(process.cwd(), 'src/ai/tools');
  
  if (!fs.existsSync(toolsDir)) {
    console.log('⚠️  Tools directory not found');
    return;
  }

  const files = fs.readdirSync(toolsDir).filter(f => 
    f.endsWith('.ts') && f !== 'index.ts' && f !== 'schemas.ts'
  );

  for (const file of files) {
    const filePath = path.join(toolsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const toolName = file.replace('.ts', '');
    
    let displayName = toolName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    let description = `Tool for ${displayName.toLowerCase()}`;

    // Determine category
    let category = 'utility';
    if (toolName.includes('citation') || toolName.includes('reference')) category = 'academic';
    else if (toolName.includes('grammar') || toolName.includes('style')) category = 'writing';
    else if (toolName.includes('analysis')) category = 'analysis';
    else if (toolName.includes('documentation')) category = 'documentation';

    extracted.tools.push({
      name: toolName,
      displayName,
      description,
      category,
      inputSchema: {},
      outputSchema: {},
    });
  }

  console.log(`✅ Found ${extracted.tools.length} tools`);
}

/**
 * Save extracted configurations to JSON files
 */
async function saveExtracted() {
  console.log('\n💾 Saving extracted configurations...');
  
  const outputDir = path.join(process.cwd(), 'migration-output');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save flows
  fs.writeFileSync(
    path.join(outputDir, 'flows.json'),
    JSON.stringify(extracted.flows, null, 2)
  );
  console.log(`✅ Saved flows to migration-output/flows.json`);

  // Save prompts
  fs.writeFileSync(
    path.join(outputDir, 'prompts.json'),
    JSON.stringify(extracted.prompts, null, 2)
  );
  console.log(`✅ Saved prompts to migration-output/prompts.json`);

  // Save tools
  fs.writeFileSync(
    path.join(outputDir, 'tools.json'),
    JSON.stringify(extracted.tools, null, 2)
  );
  console.log(`✅ Saved tools to migration-output/tools.json`);

  // Save summary
  const summary = {
    extractedAt: new Date().toISOString(),
    counts: {
      flows: extracted.flows.length,
      prompts: extracted.prompts.length,
      tools: extracted.tools.length,
      total: extracted.flows.length + extracted.prompts.length + extracted.tools.length,
    },
  };

  fs.writeFileSync(
    path.join(outputDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );
  console.log(`✅ Saved summary to migration-output/summary.json`);
}

/**
 * Print extraction report
 */
function printReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 EXTRACTION REPORT');
  console.log('='.repeat(70));

  console.log('\n📦 Extracted Items:');
  console.log(`   Flows: ${extracted.flows.length}`);
  console.log(`   Prompts: ${extracted.prompts.length}`);
  console.log(`   Tools: ${extracted.tools.length}`);
  console.log(`   Total: ${extracted.flows.length + extracted.prompts.length + extracted.tools.length}`);

  if (extracted.flows.length > 0) {
    console.log('\n🔄 Sample Flows:');
    extracted.flows.slice(0, 5).forEach(flow => {
      console.log(`   - ${flow.name} (${flow.category})`);
    });
    if (extracted.flows.length > 5) {
      console.log(`   ... and ${extracted.flows.length - 5} more`);
    }
  }

  if (extracted.prompts.length > 0) {
    console.log('\n📝 Sample Prompts:');
    extracted.prompts.slice(0, 5).forEach(prompt => {
      console.log(`   - ${prompt.name} (${prompt.category})`);
    });
    if (extracted.prompts.length > 5) {
      console.log(`   ... and ${extracted.prompts.length - 5} more`);
    }
  }

  if (extracted.tools.length > 0) {
    console.log('\n🔧 Sample Tools:');
    extracted.tools.slice(0, 5).forEach(tool => {
      console.log(`   - ${tool.name} (${tool.category})`);
    });
    if (extracted.tools.length > 5) {
      console.log(`   ... and ${extracted.tools.length - 5} more`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Extraction complete! Check migration-output/ directory');
  console.log('='.repeat(70) + '\n');

  console.log('📝 Next steps:');
  console.log('   1. Review extracted configurations in migration-output/');
  console.log('   2. Edit JSON files to add missing details');
  console.log('   3. Run: npm run tsx scripts/migrate-from-json.ts');
  console.log('');
}

/**
 * Main extraction function
 */
async function runExtraction() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 EXTRACTING CONFIGURATIONS FROM CODEBASE');
  console.log('='.repeat(70) + '\n');

  try {
    await extractFlows();
    await extractPrompts();
    await extractTools();
    await saveExtracted();
    printReport();

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Extraction failed with error:', error);
    process.exit(1);
  }
}

// Run extraction
runExtraction();
