#!/usr/bin/env tsx
/**
 * Prompt Extraction Script
 * 
 * Extracts prompts from existing Genkit flows and creates
 * reusable prompt configurations in the database.
 * 
 * Usage:
 *   npm run extract-prompts
 *   tsx scripts/migration/extract-prompts.ts [flowName]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { PromptConfig } from '@/lib/models/prompt-config';

// Initialize Firebase
try {
  initializeApp();
} catch (error) {
  // Already initialized
}

const db = getFirestore();

interface ExtractedPrompt {
  flowName: string;
  promptText: string;
  variables: string[];
  context: string;
  lineNumber: number;
}

/**
 * Extract prompts from a TypeScript source file
 */
function extractPromptsFromFile(filePath: string): ExtractedPrompt[] {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const prompts: ExtractedPrompt[] = [];
  const flowName = path.basename(filePath, '.ts');

  function visit(node: ts.Node) {
    // Look for template literals or string literals that look like prompts
    if (ts.isTemplateExpression(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const text = node.getText(sourceFile);
      
      // Check if this looks like a prompt (contains certain keywords)
      if (
        text.length > 100 && // Prompts are usually long
        (text.includes('Generate') || 
         text.includes('Analyze') || 
         text.includes('Write') ||
         text.includes('Create') ||
         text.includes('You are'))
      ) {
        // Extract variables from template expressions
        const variables: string[] = [];
        const variableRegex = /\$\{([^}]+)\}/g;
        let match;
        
        while ((match = variableRegex.exec(text)) !== null) {
          const variable = match[1].trim();
          if (!variables.includes(variable)) {
            variables.push(variable);
          }
        }

        // Get context (parent function or arrow function)
        let context = 'unknown';
        let parent = node.parent;
        while (parent) {
          if (ts.isFunctionDeclaration(parent) || ts.isArrowFunction(parent)) {
            const functionName = ts.isFunctionDeclaration(parent) && parent.name
              ? parent.name.getText(sourceFile)
              : 'anonymous';
            context = functionName;
            break;
          }
          parent = parent.parent;
        }

        const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

        prompts.push({
          flowName,
          promptText: text.replace(/`/g, '').trim(),
          variables,
          context,
          lineNumber,
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return prompts;
}

/**
 * Create a prompt configuration from extracted prompt
 */
function createPromptConfig(extracted: ExtractedPrompt): Omit<PromptConfig, 'id' | 'createdAt' | 'updatedAt'> {
  const name = `${extracted.flowName}_${extracted.context}`.replace(/[^a-zA-Z0-9_]/g, '_');
  
  // Extract variable definitions from the prompt text
  const variableDefinitions: Record<string, { type: string; description: string; required: boolean }> = {};
  
  extracted.variables.forEach(variable => {
    // Try to infer type from variable name
    let type = 'string';
    const varLower = variable.toLowerCase();
    
    if (varLower.includes('count') || varLower.includes('number') || varLower.includes('limit')) {
      type = 'number';
    } else if (varLower.includes('enable') || varLower.includes('is') || varLower.includes('has')) {
      type = 'boolean';
    } else if (varLower.includes('list') || varLower.includes('items') || varLower.includes('array')) {
      type = 'array';
    }

    variableDefinitions[variable] = {
      type,
      description: `Variable from ${extracted.flowName}`,
      required: true,
    };
  });

  return {
    name,
    description: `Extracted from ${extracted.flowName} at line ${extracted.lineNumber}`,
    template: extracted.promptText,
    variables: variableDefinitions,
    category: 'extracted',
    tags: [extracted.flowName, 'migration', 'extracted'],
    version: 1,
    isActive: true,
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 2048,
  };
}

/**
 * Save prompt to Firestore
 */
async function savePromptToFirestore(promptConfig: Omit<PromptConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await db.collection('prompts').add({
    ...promptConfig,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return docRef.id;
}

/**
 * Extract prompts from a single flow file
 */
async function extractPromptsFromFlow(flowName: string): Promise<number> {
  const flowPath = path.join(process.cwd(), 'src/ai/flows', `${flowName}.ts`);
  
  if (!fs.existsSync(flowPath)) {
    throw new Error(`Flow file not found: ${flowPath}`);
  }

  console.log(`🔍 Extracting prompts from: ${flowName}`);
  
  const extractedPrompts = extractPromptsFromFile(flowPath);
  
  if (extractedPrompts.length === 0) {
    console.log(`  ℹ️  No prompts found`);
    return 0;
  }

  console.log(`  📝 Found ${extractedPrompts.length} prompt(s)`);

  let savedCount = 0;
  for (const extracted of extractedPrompts) {
    const promptConfig = createPromptConfig(extracted);
    
    try {
      const promptId = await savePromptToFirestore(promptConfig);
      console.log(`  ✅ Saved prompt: ${promptConfig.name} (ID: ${promptId})`);
      savedCount++;
    } catch (error) {
      console.error(`  ❌ Failed to save prompt ${promptConfig.name}:`, error);
    }
  }

  return savedCount;
}

/**
 * Extract prompts from all flows
 */
async function extractAllPrompts(): Promise<void> {
  const flowsDir = path.join(process.cwd(), 'src/ai/flows');
  const flowFiles = fs.readdirSync(flowsDir)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts');

  console.log(`📦 Extracting prompts from ${flowFiles.length} flows...\n`);

  let totalPrompts = 0;
  for (const file of flowFiles) {
    const flowName = file.replace('.ts', '');
    try {
      const count = await extractPromptsFromFlow(flowName);
      totalPrompts += count;
    } catch (error) {
      console.error(`❌ Error processing ${flowName}:`, error);
    }
    console.log('');
  }

  console.log(`\n✅ Extraction complete! Total prompts saved: ${totalPrompts}`);
}

// Main execution
async function main() {
  const flowName = process.argv[2];

  try {
    if (flowName) {
      // Extract from specific flow
      const count = await extractPromptsFromFlow(flowName);
      console.log(`\n✅ Extracted ${count} prompt(s) from ${flowName}`);
    } else {
      // Extract from all flows
      await extractAllPrompts();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  }
}

main();
