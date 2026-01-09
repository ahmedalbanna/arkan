#!/usr/bin/env node

/**
 * Integration test for unified model management
 * Tests that all flows, tools, and prompts use the unified system
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let totalFiles = 0;
let filesWithIssues = 0;
let totalIssues = 0;

/**
 * Check if file uses unified model management
 */
function checkFile(filePath, category) {
  totalFiles++;
  
  const content = readFileSync(filePath, 'utf-8');
  const issues = [];

  // Check for hardcoded model strings (except in comments and strings explanations)
  const hardcodedPatterns = [
    /model:\s*['"]googleai\/gemini-2\.5-flash-lite['"]/,
    /model:\s*['"]googleai\/gemini-2\.0-flash-lite['"]/,
    /model:\s*['"]googleai\/gemini-2\.0-flash-exp['"]/,
  ];

  hardcodedPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push(`Found hardcoded model string (pattern ${index + 1})`);
    }
  });

  // Check if file imports getModel when needed
  if (content.includes('definePrompt') || content.includes('.generate(')) {
    if (content.includes('model:') && !content.includes('getModel')) {
      // Check if it's ollama-example.ts (which is allowed to have different patterns)
      if (!filePath.includes('ollama-example')) {
        issues.push('Uses models but does not import getModel');
      }
    }
  }

  // Report results
  if (issues.length > 0) {
    filesWithIssues++;
    totalIssues += issues.length;
    console.log(`${COLORS.red}✗${COLORS.reset} ${filePath}`);
    issues.forEach(issue => {
      console.log(`  ${COLORS.yellow}→${COLORS.reset} ${issue}`);
    });
  } else {
    console.log(`${COLORS.green}✓${COLORS.reset} ${filePath}`);
  }

  return issues.length === 0;
}

/**
 * Main test execution
 */
function main() {
  console.log(`${COLORS.blue}🧪 Running integration tests for unified model management${COLORS.reset}\n`);

  const filesToCheck = [
    // Flows
    { path: 'src/ai/flows/professional-document-writer.ts', category: 'flows' },
    { path: 'src/ai/flows/graduation-project-generator.ts', category: 'flows' },
    { path: 'src/ai/flows/academic-literature-review.ts', category: 'flows' },
    { path: 'src/ai/flows/run-agent-flow.ts', category: 'flows' },
    
    // Tools
    { path: 'src/ai/tools/citations-and-references.ts', category: 'tools' },
    { path: 'src/ai/tools/grammar-and-style.ts', category: 'tools' },
    { path: 'src/ai/tools/documentation-generation.ts', category: 'tools' },
    
    // Prompts
    { path: 'src/ai/prompts/academic-writing.ts', category: 'prompts' },
    { path: 'src/ai/prompts/index.ts', category: 'prompts' },
  ];

  filesToCheck.forEach(({ path, category }) => {
    try {
      checkFile(path, category);
    } catch (error) {
      console.log(`${COLORS.red}✗${COLORS.reset} ${path} (${error.message})`);
      filesWithIssues++;
    }
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`${COLORS.blue}📊 Test Summary${COLORS.reset}`);
  console.log('='.repeat(60));
  console.log(`Total files checked: ${totalFiles}`);
  console.log(`Files with issues: ${filesWithIssues}`);
  console.log(`Total issues found: ${totalIssues}`);
  
  if (filesWithIssues === 0) {
    console.log(`\n${COLORS.green}✨ All tests passed! All files use unified model management.${COLORS.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${COLORS.yellow}⚠️  Some files need attention.${COLORS.reset}`);
    process.exit(1);
  }
}

main();
