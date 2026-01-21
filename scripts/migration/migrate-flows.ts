#!/usr/bin/env tsx
/**
 * Flow Migration Script
 *
 * Orchestrates the complete migration of flows from static to dynamic.
 * Runs analysis, extraction, generation, and validation in sequence.
 *
 * Usage:
 *   npm run migrate-flows
 *   tsx scripts/migration/migrate-flows.ts [--phase=1] [--flows=flow1,flow2]
 */

import { FlowAnalyzer } from '@/lib/migration/analyzer/FlowAnalyzer';
import { ConfigurationGenerator } from '@/lib/migration/generator/ConfigurationGenerator';
import { MigrationValidator } from '@/lib/migration/validator/MigrationValidator';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase
try {
  initializeApp();
} catch (error) {
  // Already initialized
}

const db = getFirestore();

interface MigrationPhase {
  phase: number;
  name: string;
  flows: string[];
  description: string;
}

const MIGRATION_PHASES: MigrationPhase[] = [
  {
    phase: 1,
    name: 'Simple Text Generation',
    description: 'Basic text generation and manipulation flows',
    flows: [
      'generate-text',
      'paraphrase-text',
      'summarize-text',
      'translate-text',
      'humanize-text',
      'manipulate-text',
      'text-stylist',
      'improve-report-markdown',
      'rewrite-to-markdown',
      'rewrite-document-to-markdown',
      'generate-ideas',
      'topic-explainer',
      'generate-toc',
      'generate-citation',
      'generate-ui-description',
    ],
  },
  {
    phase: 2,
    name: 'Analysis Tools',
    description: 'Document analysis and checking flows',
    flows: [
      'grammar-checker',
      'bias-checker',
      'fact-checker',
      'plagiarism-checker',
      'detect-ai-content',
      'sentence-structure-checker',
      'question-answering',
      'analyze-context',
    ],
  },
  {
    phase: 3,
    name: 'Complex Document Generation',
    description: 'Multi-step document and report generation',
    flows: [
      'generate-report-section',
      'generate-chapter-content',
      'write-document',
      'professional-document-writer',
      'generate-quiz',
      'generate-session-plan',
      'create-lecture-unit',
      'generate-theoretical-lecture',
      'presentation-content-creator',
      'technical-spec-writer',
      'project-documentation-generator',
      'solve-assignments',
      'generate-diagrams',
      'generate-plantuml',
    ],
  },
  {
    phase: 4,
    name: 'Academic & Research',
    description: 'Academic writing and research flows with heavy RAG',
    flows: [
      'academic-literature-review',
      'ai-researcher',
      'graduation-project-generator',
      'literature-review-generator',
      'academic-paper-quality-checker',
      'ai-proofread-document',
      'fact-retrieval',
      'project-report-generator',
      'generate-project-blueprint',
    ],
  },
  {
    phase: 5,
    name: 'Special & RAG-Enhanced',
    description: 'Flows with RAG integration and special requirements',
    flows: [
      'generate-report-section-rag',
      'generate-chapter-content-rag',
      'summarize-document',
      'image-to-text',
      'text-to-speech',
      'generate-image',
      'run-agent-flow',
      'dynamic-flow-executor',
    ],
  },
];

interface MigrationResult {
  flowName: string;
  success: boolean;
  configId?: string;
  error?: string;
  validationResults?: any;
  duration: number;
}

interface MigrationReport {
  phase: number;
  startTime: string;
  endTime?: string;
  totalFlows: number;
  successful: number;
  failed: number;
  results: MigrationResult[];
}

/**
 * Migrate a single flow
 */
async function migrateFlow(flowName: string): Promise<MigrationResult> {
  const startTime = Date.now();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔄 Migrating: ${flowName}`);
  console.log('='.repeat(80));

  try {
    const flowPath = path.join(process.cwd(), 'src/ai/flows', `${flowName}.ts`);

    if (!fs.existsSync(flowPath)) {
      throw new Error(`Flow file not found: ${flowPath}`);
    }

    const sourceCode = fs.readFileSync(flowPath, 'utf-8');

    // Step 1: Analyze the flow
    console.log('\n📊 Step 1: Analyzing flow...');
    const analyzer = new FlowAnalyzer();
    const analysis = await analyzer.analyzeFlow(flowPath);
    console.log(`  ✅ Complexity: ${analysis.complexity}`);
    console.log(`  ✅ Category: ${analysis.category}`);

    if (analysis.warnings && analysis.warnings.length > 0) {
      console.log(`  ⚠️  Warnings: ${analysis.warnings.length}`);
      analysis.warnings.forEach(w => console.log(`     - ${w}`));
    }

    // Step 2: Generate configuration
    console.log('\n🔧 Step 2: Generating configuration...');
    const generator = new ConfigurationGenerator();
    const flowConfig = await generator.generateFlowConfig(analysis, sourceCode);
    console.log(`  ✅ Generated ${flowConfig.steps.length} steps`);

    // Step 3: Validate configuration
    console.log('\n✅ Step 3: Validating configuration...');
    const validator = new MigrationValidator();
    const validationResults = await validator.validate(flowConfig);

    if (!validationResults.valid) {
      console.log(`  ❌ Validation failed:`);
      validationResults.errors?.forEach(e => console.log(`     - ${JSON.stringify(e, null, 2)}`));
      throw new Error('Configuration validation failed');
    }
    console.log('  ✅ Configuration is valid');

    // Step 4: Save to database
    console.log('\n💾 Step 4: Saving to database...');
    const docRef = await db.collection('flowConfigs').add({
      ...flowConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      migrationDate: new Date().toISOString(),
      sourceFile: flowPath,
    });
    console.log(`  ✅ Saved with ID: ${docRef.id}`);

    // Step 5: Save backup
    const backupDir = path.join(process.cwd(), 'migration-backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, `${flowName}_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(flowConfig, null, 2));
    console.log(`  💾 Backup saved: ${backupPath}`);

    const duration = Date.now() - startTime;
    console.log(`\n✅ Migration successful! (${duration}ms)`);

    return {
      flowName,
      success: true,
      configId: docRef.id,
      validationResults,
      duration,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ Migration failed:`, error);

    return {
      flowName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration,
    };
  }
}

/**
 * Migrate flows for a specific phase
 */
async function migratePhase(phase: MigrationPhase): Promise<MigrationReport> {
  console.log('\n' + '█'.repeat(80));
  console.log(`🚀 PHASE ${phase.phase}: ${phase.name}`);
  console.log(`📝 ${phase.description}`);
  console.log(`📊 Flows to migrate: ${phase.flows.length}`);
  console.log('█'.repeat(80) + '\n');

  const report: MigrationReport = {
    phase: phase.phase,
    startTime: new Date().toISOString(),
    totalFlows: phase.flows.length,
    successful: 0,
    failed: 0,
    results: [],
  };

  for (const flowName of phase.flows) {
    const result = await migrateFlow(flowName);
    report.results.push(result);

    if (result.success) {
      report.successful++;
    } else {
      report.failed++;
    }

    // Small delay between migrations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  report.endTime = new Date().toISOString();

  // Print phase summary
  console.log('\n' + '='.repeat(80));
  console.log(`📊 PHASE ${phase.phase} SUMMARY`);
  console.log('='.repeat(80));
  console.log(`Total: ${report.totalFlows}`);
  console.log(`✅ Successful: ${report.successful}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`📈 Success Rate: ${((report.successful / report.totalFlows) * 100).toFixed(1)}%`);

  if (report.failed > 0) {
    console.log('\nFailed flows:');
    report.results
      .filter(r => !r.success)
      .forEach(r => console.log(`  ❌ ${r.flowName}: ${r.error}`));
  }

  console.log('='.repeat(80) + '\n');

  // Save phase report
  const reportPath = path.join(
    process.cwd(),
    'migration-reports',
    `phase-${phase.phase}-report.json`
  );
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Phase report saved: ${reportPath}\n`);

  return report;
}

/**
 * Main migration function
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const phaseArg = args.find(arg => arg.startsWith('--phase='));
  const flowsArg = args.find(arg => arg.startsWith('--flows='));

  const targetPhase = phaseArg ? parseInt(phaseArg.split('=')[1]) : null;
  const specificFlows = flowsArg ? flowsArg.split('=')[1].split(',') : null;

  console.log('🚀 Flow Migration Tool\n');

  try {
    if (specificFlows) {
      // Migrate specific flows
      console.log(`📋 Migrating specific flows: ${specificFlows.join(', ')}\n`);

      for (const flowName of specificFlows) {
        await migrateFlow(flowName.trim());
      }

      console.log('\n✅ Migration complete!');

    } else if (targetPhase) {
      // Migrate specific phase
      const phase = MIGRATION_PHASES.find(p => p.phase === targetPhase);

      if (!phase) {
        throw new Error(`Invalid phase: ${targetPhase}`);
      }

      await migratePhase(phase);
      console.log('✅ Phase migration complete!');

    } else {
      // Migrate all phases
      console.log('🌟 Starting full migration (all phases)\n');

      const allReports: MigrationReport[] = [];

      for (const phase of MIGRATION_PHASES) {
        const report = await migratePhase(phase);
        allReports.push(report);

        // Pause between phases
        console.log('⏸️  Pausing 5 seconds before next phase...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Print final summary
      const totalFlows = allReports.reduce((sum, r) => sum + r.totalFlows, 0);
      const totalSuccessful = allReports.reduce((sum, r) => sum + r.successful, 0);
      const totalFailed = allReports.reduce((sum, r) => sum + r.failed, 0);

      console.log('\n' + '█'.repeat(80));
      console.log('🎉 MIGRATION COMPLETE - FINAL SUMMARY');
      console.log('█'.repeat(80));
      console.log(`\nTotal Flows: ${totalFlows}`);
      console.log(`✅ Successful: ${totalSuccessful}`);
      console.log(`❌ Failed: ${totalFailed}`);
      console.log(`📈 Overall Success Rate: ${((totalSuccessful / totalFlows) * 100).toFixed(1)}%`);
      console.log('\n' + '█'.repeat(80) + '\n');

      // Save final summary
      const summaryPath = path.join(process.cwd(), 'migration-reports', 'final-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify({
        completedAt: new Date().toISOString(),
        totalFlows,
        totalSuccessful,
        totalFailed,
        successRate: (totalSuccessful / totalFlows) * 100,
        phases: allReports,
      }, null, 2));
      console.log(`📄 Final summary saved: ${summaryPath}\n`);
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
