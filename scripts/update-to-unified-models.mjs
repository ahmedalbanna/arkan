#!/usr/bin/env node

/**
 * Script to update all AI flows, tools, and prompts to use unified model management
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Configuration
const MODEL_MAPPINGS = {
  'googleai/gemini-2.5-flash-lite': "await getModel('fast')",
  'googleai/gemini-2.0-flash-lite': "await getModel('balanced')",
  'googleai/gemini-2.0-flash-exp': "await getModel('quality')",
};

const DIRECTORIES_TO_UPDATE = [
  'src/ai/flows',
  'src/ai/tools',
  'src/ai/prompts',
];

let filesUpdated = 0;
let totalReplacements = 0;

/**
 * Check if file needs getModel import
 */
function needsGetModelImport(content) {
  return content.includes("getModel('") && !content.includes('getModel } from');
}

/**
 * Add getModel to imports
 */
function addGetModelImport(content) {
  // Check if already has getModel
  if (content.includes('getModel } from')) {
    return content;
  }

  // Pattern 1: import { ai } from '@/ai/genkit';
  if (content.match(/import\s*{\s*ai\s*}\s*from\s*['"]@\/ai\/genkit['"]/)) {
    return content.replace(
      /import\s*{\s*ai\s*}\s*from\s*['"]@\/ai\/genkit['"]/,
      "import { ai, getModel } from '@/ai/genkit'"
    );
  }

  // Pattern 2: import { ai, something } from '@/ai/genkit';
  if (content.match(/import\s*{([^}]+)}\s*from\s*['"]@\/ai\/genkit['"]/)) {
    return content.replace(
      /import\s*{([^}]+)}\s*from\s*['"]@\/ai\/genkit['"]/,
      (match, imports) => {
        if (!imports.includes('getModel')) {
          return `import { ${imports.trim()}, getModel } from '@/ai/genkit'`;
        }
        return match;
      }
    );
  }

  return content;
}

/**
 * Replace model strings with getModel calls
 */
function replaceModelStrings(content, filename) {
  let updated = content;
  let fileReplacements = 0;

  for (const [oldModel, newModel] of Object.entries(MODEL_MAPPINGS)) {
    const patterns = [
      // Pattern: model: 'googleai/...'
      new RegExp(`model:\\s*['"]${oldModel.replace(/\//g, '\\/')}['"]`, 'g'),
      // Pattern: model:'googleai/...'
      new RegExp(`model:['"]${oldModel.replace(/\//g, '\\/')}['"]`, 'g'),
    ];

    patterns.forEach(pattern => {
      const matches = updated.match(pattern);
      if (matches) {
        fileReplacements += matches.length;
        updated = updated.replace(pattern, `model: ${newModel}`);
      }
    });
  }

  if (fileReplacements > 0) {
    console.log(`  ✓ ${filename}: ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  }

  return { content: updated, replacements: fileReplacements };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Replace model strings
    const { content: updatedContent, replacements } = replaceModelStrings(content, filePath);
    content = updatedContent;

    // Add getModel import if needed
    if (needsGetModelImport(content)) {
      content = addGetModelImport(content);
    }

    // Write back if changed
    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf-8');
      filesUpdated++;
      return replacements;
    }

    return 0;
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
  const files = readdirSync(dirPath);

  for (const file of files) {
    const filePath = join(dirPath, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Skip test directories
      if (!file.includes('test') && !file.includes('__test__')) {
        processDirectory(filePath);
      }
    } else if (stat.isFile() && extname(file) === '.ts') {
      processFile(filePath);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Updating AI files to use unified model management...\n');

  DIRECTORIES_TO_UPDATE.forEach(dir => {
    console.log(`📁 Processing ${dir}...`);
    processDirectory(dir);
  });

  console.log('\n✨ Update complete!');
  console.log(`📊 Statistics:`);
  console.log(`   - Files updated: ${filesUpdated}`);
  console.log(`   - Total replacements: ${totalReplacements}`);

  if (filesUpdated > 0) {
    console.log('\n📚 Next steps:');
    console.log('   1. Review changes: git diff src/ai/');
    console.log('   2. Test the changes: npm run genkit:dev');
    console.log('   3. Run type check: npm run typecheck');
  } else {
    console.log('\n✅ All files already up to date!');
  }
}

// Run the script
main();
