#!/usr/bin/env tsx

/**
 * Week 6 Migration Testing Script
 * Tests migrated flows and compares outputs with original flows
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

interface TestCase {
  flowId: string;
  name: string;
  input: any;
  expectedOutputFields: string[];
}

// Test cases for Phase 1 flows
const PHASE1_TEST_CASES: TestCase[] = [
  {
    flowId: 'generate-text',
    name: 'Generate Text',
    input: { prompt: 'Write a short story about a robot learning to paint.' },
    expectedOutputFields: ['generatedText']
  },
  {
    flowId: 'paraphrase-text',
    name: 'Paraphrase Text',
    input: { 
      text: 'The quick brown fox jumps over the lazy dog.',
      mode: 'standard'
    },
    expectedOutputFields: ['paraphrasedText']
  },
  {
    flowId: 'summarize-text',
    name: 'Summarize Text',
    input: { 
      text: 'Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.',
      length: 'short'
    },
    expectedOutputFields: ['summary']
  },
  {
    flowId: 'translate-text',
    name: 'Translate Text',
    input: {
      text: 'Hello, how are you?',
      targetLanguage: 'Spanish'
    },
    expectedOutputFields: ['translatedText']
  },
  {
    flowId: 'humanize-text',
    name: 'Humanize Text',
    input: {
      text: 'It is imperative to acknowledge that the implementation of said solution requires comprehensive analysis.'
    },
    expectedOutputFields: ['humanizedText']
  }
];

// Test cases for Phase 2 flows
const PHASE2_TEST_CASES: TestCase[] = [
  {
    flowId: 'grammar-checker',
    name: 'Grammar Checker',
    input: {
      text: 'She dont likes apples and oranges is her favorite.'
    },
    expectedOutputFields: ['corrections', 'correctedText']
  },
  {
    flowId: 'bias-checker',
    name: 'Bias Checker',
    input: {
      text: 'Women are naturally better at nursing than men.'
    },
    expectedOutputFields: ['biases', 'score']
  },
  {
    flowId: 'fact-checker',
    name: 'Fact Checker',
    input: {
      text: 'The Earth is flat and the sun revolves around it.'
    },
    expectedOutputFields: ['facts', 'verification']
  },
  {
    flowId: 'plagiarism-checker',
    name: 'Plagiarism Checker',
    input: {
      text: 'To be or not to be, that is the question.'
    },
    expectedOutputFields: ['score', 'matches']
  },
  {
    flowId: 'detect-ai-content',
    name: 'AI Content Detector',
    input: {
      text: 'This is a sample text that needs to be analyzed for AI content detection purposes.'
    },
    expectedOutputFields: ['isAIGenerated', 'confidence']
  }
];

interface TestResult {
  flowId: string;
  success: boolean;
  error?: string;
  originalOutput?: any;
  dynamicOutput?: any;
  executionTime: {
    original: number;
    dynamic: number;
  };
  outputMatch: boolean;
  fieldValidation: {
    field: string;
    present: boolean;
  }[];
}

/**
 * Test original static flow
 */
async function testOriginalFlow(testCase: TestCase): Promise<any> {
  const startTime = Date.now();
  
  try {
    // Dynamic import of the flow
    const flowModule = await import(`../../src/ai/flows/${testCase.flowId}`);
    const flowFunction = flowModule[Object.keys(flowModule)[0]];
    
    if (typeof flowFunction !== 'function') {
      throw new Error('Flow function not found in module');
    }
    
    const result = await flowFunction(testCase.input);
    const executionTime = Date.now() - startTime;
    
    return { result, executionTime };
  } catch (error) {
    throw new Error(`Original flow test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Test migrated dynamic flow
 */
async function testDynamicFlow(testCase: TestCase): Promise<any> {
  const startTime = Date.now();
  
  try {
    // Import dynamic flow executor
    const { dynamicFlowExecutor } = await import('../../src/ai/flows/dynamic-flow-executor');
    
    const result = await dynamicFlowExecutor({
      flowId: testCase.flowId,
      input: testCase.input,
      context: {}
    });
    
    const executionTime = Date.now() - startTime;
    
    return { result, executionTime };
  } catch (error) {
    throw new Error(`Dynamic flow test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Compare outputs between original and dynamic flows
 */
function compareOutputs(original: any, dynamic: any, expectedFields: string[]): boolean {
  // Check if both outputs have the expected fields
  for (const field of expectedFields) {
    if (!(field in original) || !(field in dynamic)) {
      return false;
    }
  }
  
  // Basic similarity check (can be enhanced with more sophisticated comparison)
  return true;
}

/**
 * Validate output fields
 */
function validateFields(output: any, expectedFields: string[]): Array<{field: string, present: boolean}> {
  return expectedFields.map(field => ({
    field,
    present: field in output && output[field] !== null && output[field] !== undefined
  }));
}

/**
 * Run test for a single flow
 */
async function testFlow(testCase: TestCase): Promise<TestResult> {
  console.log(`\nTesting: ${testCase.name} (${testCase.flowId})`);
  console.log('─'.repeat(60));
  
  const result: TestResult = {
    flowId: testCase.flowId,
    success: false,
    executionTime: { original: 0, dynamic: 0 },
    outputMatch: false,
    fieldValidation: []
  };
  
  try {
    // Test original flow
    console.log('  → Testing original flow...');
    const originalTest = await testOriginalFlow(testCase);
    result.originalOutput = originalTest.result;
    result.executionTime.original = originalTest.executionTime;
    console.log(`    ✓ Original flow completed in ${originalTest.executionTime}ms`);
    
    // Test dynamic flow
    console.log('  → Testing dynamic flow...');
    const dynamicTest = await testDynamicFlow(testCase);
    result.dynamicOutput = dynamicTest.result;
    result.executionTime.dynamic = dynamicTest.executionTime;
    console.log(`    ✓ Dynamic flow completed in ${dynamicTest.executionTime}ms`);
    
    // Compare outputs
    result.outputMatch = compareOutputs(
      originalTest.result,
      dynamicTest.result,
      testCase.expectedOutputFields
    );
    
    // Validate fields
    result.fieldValidation = validateFields(
      dynamicTest.result,
      testCase.expectedOutputFields
    );
    
    result.success = true;
    console.log(`  ✓ Test passed`);
    
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    console.log(`  ✗ Test failed: ${result.error}`);
  }
  
  return result;
}

/**
 * Run all tests for a phase
 */
async function testPhase(testCases: TestCase[], phaseName: string) {
  console.log(`\n╔════════════════════════════════════════════════════════╗`);
  console.log(`║   Testing ${phaseName}`.padEnd(56) + '║');
  console.log(`╚════════════════════════════════════════════════════════╝`);
  
  const results: TestResult[] = [];
  
  for (const testCase of testCases) {
    const result = await testFlow(testCase);
    results.push(result);
    
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

/**
 * Generate test report
 */
function generateReport(phase1Results: TestResult[], phase2Results: TestResult[]) {
  const allResults = [...phase1Results, ...phase2Results];
  
  const passed = allResults.filter(r => r.success).length;
  const failed = allResults.filter(r => !r.success).length;
  const outputMatches = allResults.filter(r => r.outputMatch).length;
  
  const avgOriginalTime = allResults.reduce((sum, r) => sum + r.executionTime.original, 0) / allResults.length;
  const avgDynamicTime = allResults.reduce((sum, r) => sum + r.executionTime.dynamic, 0) / allResults.length;
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Test Summary                                         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log(`Total Tests: ${allResults.length}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Output Matches: ${outputMatches}/${allResults.length}`);
  console.log(`\nPerformance:`);
  console.log(`  Original Flows Avg: ${avgOriginalTime.toFixed(2)}ms`);
  console.log(`  Dynamic Flows Avg: ${avgDynamicTime.toFixed(2)}ms`);
  console.log(`  Overhead: ${((avgDynamicTime - avgOriginalTime) / avgOriginalTime * 100).toFixed(2)}%`);
  
  if (failed > 0) {
    console.log('\nFailed Tests:');
    allResults.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.flowId}: ${r.error}`);
    });
  }
  
  return {
    timestamp: new Date().toISOString(),
    totalTests: allResults.length,
    passed,
    failed,
    outputMatches,
    performance: {
      originalAvg: avgOriginalTime,
      dynamicAvg: avgDynamicTime,
      overhead: ((avgDynamicTime - avgOriginalTime) / avgOriginalTime * 100)
    },
    phase1: {
      total: phase1Results.length,
      passed: phase1Results.filter(r => r.success).length,
      failed: phase1Results.filter(r => !r.success).length
    },
    phase2: {
      total: phase2Results.length,
      passed: phase2Results.filter(r => r.success).length,
      failed: phase2Results.filter(r => !r.success).length
    },
    detailedResults: allResults
  };
}

/**
 * Main test function
 */
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Week 6 Migration Testing                            ║');
  console.log('║   Testing Phase 1 & 2 Migrated Flows                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  try {
    // Test Phase 1
    const phase1Results = await testPhase(PHASE1_TEST_CASES, 'Phase 1: Simple Flows');
    
    // Test Phase 2
    const phase2Results = await testPhase(PHASE2_TEST_CASES, 'Phase 2: Analysis Flows');
    
    // Generate and save report
    const report = generateReport(phase1Results, phase2Results);
    
    const reportPath = path.join(process.cwd(), 'migration-output', 'week6-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✓ Test report saved to: ${reportPath}`);
    
    // Save to Firestore
    await db.collection('test-reports').add(report);
    
    console.log('\n✓ Week 6 Testing Complete!\n');
    
  } catch (error) {
    console.error('\n✗ Testing failed:', error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test error:', error);
      process.exit(1);
    });
}

export { runTests, testFlow, testPhase };
