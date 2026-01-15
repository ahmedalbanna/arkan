/**
 * Comprehensive System Test
 * 
 * This file tests all components of the professional writing system:
 * 1. Universal flows
 * 2. Professional writing tools
 * 3. Advanced flows with tools integration
 */

import { 
  summarizeText, 
  paraphraseText,
  grammarCheck,
  academicLiteratureReview,
  academicPaperQualityChecker,
  professionalDocumentWriter,
} from '../flows';

import {
  checkGrammarTool,
  analyzeToneTool,
  validateCitationsTool,
  analyzeDocumentStructureTool,
  professionalWritingTools,
  getAvailableToolNames,
} from '../tools';

// Test data
const SAMPLE_TEXT = `
Artificial intelligence has transformd the way we approach problem-solving in modern society. 
Machine learning algorithms can now proces vast amounts of data with remarkable speed and accuracy.
However, there are still many challanges that need to be adressed before AI can fully realize it's potential.
`;

const SAMPLE_ACADEMIC_TEXT = `
According to Smith (2020), artificial intelligence is rapidly evolving. 
Recent studies by Jones et al. (2021) demonstrate significant improvements in natural language processing.
The work of Brown and Davis (2019) laid the foundation for current research in this field.
`;

const SAMPLE_REFERENCES = `
Brown, A., & Davis, M. (2019). Foundations of AI Research. Academic Press.
Jones, R., Wilson, S., & Taylor, K. (2021). Advances in NLP. Journal of AI Research, 15(3), 45-67.
Smith, J. (2020). The Evolution of Artificial Intelligence. Tech Publishing.
`;

console.log('🧪 COMPREHENSIVE SYSTEM TEST');
console.log('='.repeat(70));
console.log('');

// ============================================================================
// TEST 1: Universal Flows
// ============================================================================
async function testUniversalFlows() {
  console.log('📝 TEST 1: Universal Flows');
  console.log('-'.repeat(70));
  
  try {
    // Test summarize
    console.log('  → Testing summarizeText...');
    const summary = await summarizeText({
      text: SAMPLE_TEXT,
      length: 'short',
    });
    console.log('    ✓ Summary generated successfully');
    console.log(`    Length: ${summary.summary.length} characters`);
    
    // Test paraphrase
    console.log('  → Testing paraphraseText...');
    const paraphrase = await paraphraseText({
      text: 'This is a simple test sentence.',
      mode: 'formal',
    });
    console.log('    ✓ Paraphrase generated successfully');
    
    console.log('  ✅ Universal Flows: PASSED');
    return true;
  } catch (error) {
    console.error('  ❌ Universal Flows: FAILED');
    console.error('    Error:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// ============================================================================
// TEST 2: Professional Writing Tools (Direct Calls)
// ============================================================================
async function testProfessionalTools() {
  console.log('');
  console.log('🔧 TEST 2: Professional Writing Tools');
  console.log('-'.repeat(70));
  
  try {
    // Test tool availability
    console.log('  → Checking tool availability...');
    const toolNames = getAvailableToolNames();
    console.log(`    ✓ Found ${toolNames.length} tools`);
    console.log(`    Tools: ${toolNames.slice(0, 5).join(', ')}...`);
    
    // Test grammar checker
    console.log('  → Testing checkGrammarTool...');
    const grammarResult = await checkGrammarTool({
      text: SAMPLE_TEXT,
      language: 'en',
    });
    console.log(`    ✓ Found ${grammarResult.totalIssues} issues`);
    console.log(`    Errors: ${grammarResult.errorCount}, Warnings: ${grammarResult.warningCount}`);
    
    // Test tone analyzer
    console.log('  → Testing analyzeToneTool...');
    const toneResult = await analyzeToneTool({
      text: 'We are pleased to inform you that your application has been approved.',
      targetTone: 'professional',
    });
    console.log(`    ✓ Detected tone: ${toneResult.detectedTone}`);
    console.log(`    Confidence: ${(toneResult.confidence * 100).toFixed(1)}%`);
    
    // Test citation validator
    console.log('  → Testing validateCitationsTool...');
    const citationResult = await validateCitationsTool({
      text: SAMPLE_ACADEMIC_TEXT,
      citationStyle: 'APA',
    });
    console.log(`    ✓ Found ${citationResult.totalCitations} citations`);
    console.log(`    Valid: ${citationResult.validCitations}, Invalid: ${citationResult.invalidCitations}`);
    
    // Test document structure analyzer
    console.log('  → Testing analyzeDocumentStructureTool...');
    const structureResult = await analyzeDocumentStructureTool({
      text: SAMPLE_TEXT,
      documentType: 'general',
    });
    console.log(`    ✓ Coherence score: ${(structureResult.coherence.score * 100).toFixed(1)}%`);
    console.log(`    Transition quality: ${structureResult.transitions.quality}`);
    
    console.log('  ✅ Professional Writing Tools: PASSED');
    return true;
  } catch (error) {
    console.error('  ❌ Professional Writing Tools: FAILED');
    console.error('    Error:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// ============================================================================
// TEST 3: Advanced Flow - Academic Literature Review
// ============================================================================
async function testLiteratureReviewFlow() {
  console.log('');
  console.log('📚 TEST 3: Academic Literature Review Flow');
  console.log('-'.repeat(70));
  
  try {
    console.log('  → Generating academic literature review...');
    console.log('    Topic: "Artificial Intelligence in Education"');
    
    const result = await academicLiteratureReview({
      topic: 'Artificial Intelligence in Education',
      keywords: ['AI', 'machine learning', 'educational technology', 'personalized learning'],
      citationStyle: 'APA',
      focusAreas: ['Student engagement', 'Learning outcomes'],
      minLength: 800,
      includeGaps: true,
    });
    
    console.log('    ✓ Literature review generated successfully');
    console.log(`    Word count: ${result.metadata.wordCount}`);
    console.log(`    Citations: ${result.metadata.citationCount}`);
    console.log(`    Valid citations: ${result.citations.validCitations}/${result.citations.totalCitations}`);
    console.log(`    Argument strength: ${result.qualityMetrics.argumentStrength}`);
    console.log(`    Logical flow score: ${(result.qualityMetrics.logicalFlowScore * 100).toFixed(1)}%`);
    
    if (result.citations.citationIssues.length > 0) {
      console.log(`    Citation issues: ${result.citations.citationIssues.length}`);
    }
    
    console.log('  ✅ Academic Literature Review Flow: PASSED');
    return true;
  } catch (error) {
    console.error('  ❌ Academic Literature Review Flow: FAILED');
    console.error('    Error:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// ============================================================================
// TEST 4: Advanced Flow - Academic Paper Quality Checker
// ============================================================================
async function testQualityCheckerFlow() {
  console.log('');
  console.log('🎯 TEST 4: Academic Paper Quality Checker Flow');
  console.log('-'.repeat(70));
  
  try {
    console.log('  → Running comprehensive quality check...');
    
    const result = await academicPaperQualityChecker({
      documentText: SAMPLE_ACADEMIC_TEXT + '\n\n' + SAMPLE_TEXT,
      references: SAMPLE_REFERENCES,
      citationStyle: 'APA',
      documentType: 'research_paper',
      checkGrammar: true,
      checkCitations: true,
      checkStructure: true,
      checkReadability: true,
    });
    
    console.log('    ✓ Quality check completed successfully');
    console.log(`    Overall Score: ${result.overallScore}/100`);
    console.log(`    Quality Level: ${result.qualityLevel}`);
    console.log(`    Readiness: ${result.summary.readinessLevel}`);
    console.log(`    Estimated revision time: ${result.summary.estimatedRevisionTime}`);
    
    console.log('    Scores breakdown:');
    if (result.scores.grammar) console.log(`      - Grammar: ${result.scores.grammar}/100`);
    if (result.scores.citations) console.log(`      - Citations: ${result.scores.citations}/100`);
    if (result.scores.structure) console.log(`      - Structure: ${result.scores.structure}/100`);
    if (result.scores.readability) console.log(`      - Readability: ${result.scores.readability}/100`);
    
    console.log(`    Strengths: ${result.summary.strengths.length}`);
    console.log(`    Weaknesses: ${result.summary.weaknesses.length}`);
    console.log(`    Critical issues: ${result.recommendations.critical.length}`);
    console.log(`    Important improvements: ${result.recommendations.important.length}`);
    
    console.log('  ✅ Academic Paper Quality Checker Flow: PASSED');
    return true;
  } catch (error) {
    console.error('  ❌ Academic Paper Quality Checker Flow: FAILED');
    console.error('    Error:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// ============================================================================
// TEST 5: Advanced Flow - Professional Document Writer
// ============================================================================
async function testProfessionalWriterFlow() {
  console.log('');
  console.log('📄 TEST 5: Professional Document Writer Flow');
  console.log('-'.repeat(70));
  
  try {
    console.log('  → Generating professional business report...');
    
    const result = await professionalDocumentWriter({
      documentType: 'business_report',
      topic: 'Q4 2024 Project Performance Analysis',
      purpose: 'Provide stakeholders with a comprehensive overview of project outcomes',
      targetAudience: 'Executive management and project sponsors',
      keyPoints: [
        'Project delivered on time and within budget',
        'Key milestones achieved with 95% success rate',
        'Identified areas for improvement in team communication',
        'Positive stakeholder feedback received',
      ],
      tone: 'professional',
      length: 'medium',
      includeExecutiveSummary: true,
      includeRecommendations: true,
    });
    
    console.log('    ✓ Document generated successfully');
    console.log(`    Word count: ${result.qualityMetrics.wordCount}`);
    console.log(`    Structure score: ${result.qualityMetrics.structureScore}/100`);
    console.log(`    Flow score: ${result.qualityMetrics.flowScore}/100`);
    console.log(`    Tone alignment: ${(result.qualityMetrics.toneAlignment * 100).toFixed(1)}%`);
    
    console.log(`    Improvements applied: ${result.improvements.applied.length}`);
    if (result.improvements.applied.length > 0) {
      result.improvements.applied.forEach(imp => {
        console.log(`      - ${imp}`);
      });
    }
    
    console.log(`    Additional suggestions: ${result.improvements.suggestions.length}`);
    
    console.log('  ✅ Professional Document Writer Flow: PASSED');
    return true;
  } catch (error) {
    console.error('  ❌ Professional Document Writer Flow: FAILED');
    console.error('    Error:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================
async function runAllTests() {
  console.log('Starting comprehensive system test...');
  console.log('');
  
  const results = {
    universalFlows: false,
    professionalTools: false,
    literatureReview: false,
    qualityChecker: false,
    professionalWriter: false,
  };
  
  results.universalFlows = await testUniversalFlows();
  results.professionalTools = await testProfessionalTools();
  results.literatureReview = await testLiteratureReviewFlow();
  results.qualityChecker = await testQualityCheckerFlow();
  results.professionalWriter = await testProfessionalWriterFlow();
  
  // Summary
  console.log('');
  console.log('='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  console.log('');
  Object.entries(results).forEach(([name, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`  ${status} - ${name}`);
  });
  
  console.log('');
  console.log(`Total: ${passed}/${total} tests passed (${(passed/total*100).toFixed(1)}%)`);
  console.log('');
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! System is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }
  
  console.log('');
  console.log('='.repeat(70));
}

// Run tests
runAllTests().catch(error => {
  console.error('');
  console.error('💥 CRITICAL ERROR:');
  console.error(error);
  process.exit(1);
});

export {};
