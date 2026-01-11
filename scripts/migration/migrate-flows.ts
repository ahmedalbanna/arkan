/**
 * Batch Migration Script
 * 
 * Orchestrates the complete migration process:
 * 1. Analyze flows
 * 2. Extract prompts
 * 3. Generate configurations
 * 4. Upload to Firestore
 * 5. Validate migration
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import FlowAnalyzer from './analyze-flows';
import PromptExtractor from './extract-prompts';
import ConfigGenerator from './generate-config';
import { FlowConfiguration } from '@/lib/models/flow-config';
import { PromptConfiguration } from '@/lib/models/prompt-config';
import { writeFileSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface MigrationOptions {
  flowsDir?: string;
  phase?: 1 | 2 | 3 | 'all';
  dryRun?: boolean;
  outputDir?: string;
  skipAnalysis?: boolean;
  skipExtraction?: boolean;
  skipUpload?: boolean;
}

interface MigrationResult {
  success: boolean;
  flowsMigrated: number;
  promptsCreated: number;
  errors: string[];
  warnings: string[];
  duration: number;
  summary: string;
}

export class BatchMigrator {
  private flowsDir: string;
  private outputDir: string;
  private db: any;

  constructor(options: MigrationOptions = {}) {
    this.flowsDir = options.flowsDir || './src/ai/flows';
    this.outputDir = options.outputDir || './migration-output';
    
    // Initialize Firebase (only if not dry run)
    if (!options.dryRun && !options.skipUpload) {
      this.initializeFirebase();
    }
  }

  /**
   * Initialize Firebase
   */
  private initializeFirebase(): void {
    try {
      // Load Firebase config
      const firebaseConfig = JSON.parse(
        readFileSync('./firebase-config.json', 'utf-8')
      );
      
      const app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);
      
      console.log('✅ Firebase initialized');
    } catch (error) {
      console.warn('⚠️  Firebase initialization failed. Running in dry-run mode.');
      this.db = null;
    }
  }

  /**
   * Run complete migration
   */
  public async migrate(options: MigrationOptions = {}): Promise<MigrationResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║                    BATCH MIGRATION STARTED                           ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

    try {
      // Step 1: Analyze flows
      let analysisReport;
      if (!options.skipAnalysis) {
        console.log('📊 Step 1: Analyzing flows...\n');
        analysisReport = await this.analyzeFlows();
        this.saveReport('analysis', analysisReport);
        console.log(`✅ Analysis complete: ${analysisReport.flows.length} flows analyzed\n`);
      } else {
        console.log('⏭️  Skipping analysis (loading from file)...\n');
        analysisReport = this.loadReport('analysis');
      }

      // Filter flows by phase
      const flowsToMigrate = this.filterFlowsByPhase(
        analysisReport.flows,
        options.phase || 'all'
      );

      console.log(`🎯 Migrating ${flowsToMigrate.length} flows (Phase ${options.phase || 'all'})\n`);

      // Step 2: Extract prompts
      let promptResults;
      if (!options.skipExtraction) {
        console.log('📝 Step 2: Extracting prompts...\n');
        promptResults = await this.extractPrompts(flowsToMigrate);
        this.saveReport('prompts', promptResults);
        console.log(`✅ Extraction complete: ${this.countPrompts(promptResults)} prompts extracted\n`);
      } else {
        console.log('⏭️  Skipping extraction (loading from file)...\n');
        promptResults = this.loadReport('prompts');
      }

      // Step 3: Generate configurations
      console.log('⚙️  Step 3: Generating configurations...\n');
      const { flowConfigs, promptConfigs } = await this.generateConfigs(
        flowsToMigrate,
        promptResults
      );
      this.saveReport('flow-configs', flowConfigs);
      this.saveReport('prompt-configs', promptConfigs);
      console.log(`✅ Generation complete: ${flowConfigs.length} flow configs, ${promptConfigs.length} prompt configs\n`);

      // Step 4: Upload to Firestore
      let uploadedFlows = 0;
      let uploadedPrompts = 0;

      if (!options.skipUpload && !options.dryRun) {
        console.log('☁️  Step 4: Uploading to Firestore...\n');
        
        uploadedPrompts = await this.uploadPrompts(promptConfigs);
        console.log(`✅ Uploaded ${uploadedPrompts} prompts`);
        
        uploadedFlows = await this.uploadFlows(flowConfigs);
        console.log(`✅ Uploaded ${uploadedFlows} flows\n`);
      } else {
        console.log('⏭️  Skipping upload (dry run mode)\n');
      }

      // Step 5: Validation
      console.log('🔍 Step 5: Validating migration...\n');
      const validationResults = await this.validateMigration(flowConfigs, promptConfigs);
      this.saveReport('validation', validationResults);

      if (validationResults.errors.length > 0) {
        errors.push(...validationResults.errors);
      }
      if (validationResults.warnings.length > 0) {
        warnings.push(...validationResults.warnings);
      }

      // Generate final report
      const duration = Date.now() - startTime;
      const summary = this.generateSummary({
        flowsMigrated: flowConfigs.length,
        promptsCreated: promptConfigs.length,
        uploadedFlows,
        uploadedPrompts,
        errors,
        warnings,
        duration,
      });

      console.log('\n' + summary);

      return {
        success: errors.length === 0,
        flowsMigrated: flowConfigs.length,
        promptsCreated: promptConfigs.length,
        errors,
        warnings,
        duration,
        summary,
      };
    } catch (error) {
      errors.push(`Migration failed: ${error}`);
      return {
        success: false,
        flowsMigrated: 0,
        promptsCreated: 0,
        errors,
        warnings,
        duration: Date.now() - startTime,
        summary: 'Migration failed with errors',
      };
    }
  }

  /**
   * Analyze flows
   */
  private async analyzeFlows(): Promise<any> {
    const analyzer = new FlowAnalyzer(this.flowsDir);
    return await analyzer.analyzeAllFlows();
  }

  /**
   * Extract prompts
   */
  private async extractPrompts(flows: any[]): Promise<any> {
    const extractor = new PromptExtractor();
    const filePaths = flows.map(f => f.filePath);
    return await extractor.extractFromMultipleFiles(filePaths);
  }

  /**
   * Generate configurations
   */
  private async generateConfigs(flows: any[], promptResults: any[]): Promise<{
    flowConfigs: FlowConfiguration[];
    promptConfigs: PromptConfiguration[];
  }> {
    const generator = new ConfigGenerator();
    const flowConfigs = generator.generateMultipleConfigs(flows, promptResults);
    
    // Extract all prompt configurations
    const promptConfigs = promptResults.flatMap(r => r.configurations);
    
    return { flowConfigs, promptConfigs };
  }

  /**
   * Upload prompts to Firestore
   */
  private async uploadPrompts(prompts: PromptConfiguration[]): Promise<number> {
    if (!this.db) return 0;

    let uploaded = 0;
    const promptsCollection = collection(this.db, 'prompts');

    for (const prompt of prompts) {
      try {
        const promptDoc = doc(promptsCollection, prompt.name);
        await setDoc(promptDoc, {
          ...prompt,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        uploaded++;
        console.log(`   ✓ Uploaded prompt: ${prompt.name}`);
      } catch (error) {
        console.error(`   ✗ Failed to upload prompt ${prompt.name}:`, error);
      }
    }

    return uploaded;
  }

  /**
   * Upload flows to Firestore
   */
  private async uploadFlows(flows: FlowConfiguration[]): Promise<number> {
    if (!this.db) return 0;

    let uploaded = 0;
    const flowsCollection = collection(this.db, 'flows');

    for (const flow of flows) {
      try {
        const flowDoc = doc(flowsCollection, flow.name);
        await setDoc(flowDoc, {
          ...flow,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        uploaded++;
        console.log(`   ✓ Uploaded flow: ${flow.name}`);
      } catch (error) {
        console.error(`   ✗ Failed to upload flow ${flow.name}:`, error);
      }
    }

    return uploaded;
  }

  /**
   * Validate migration
   */
  private async validateMigration(
    flows: FlowConfiguration[],
    prompts: PromptConfiguration[]
  ): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate each flow
    flows.forEach(flow => {
      // Check if all referenced prompts exist
      flow.steps.forEach(step => {
        if (step.type === 'GENERATE') {
          const config = step.config as any;
          const promptExists = prompts.some(p => p.name === config.promptName);
          if (!promptExists) {
            errors.push(`Flow ${flow.name} references non-existent prompt: ${config.promptName}`);
          }
        }
      });

      // Check if flow has at least one step
      if (flow.steps.length === 0) {
        warnings.push(`Flow ${flow.name} has no steps`);
      }

      // Check if input/output schemas are defined
      if (!flow.inputSchema) {
        warnings.push(`Flow ${flow.name} missing input schema`);
      }
      if (!flow.outputSchema) {
        warnings.push(`Flow ${flow.name} missing output schema`);
      }
    });

    // Validate each prompt
    prompts.forEach(prompt => {
      // Check if variables are defined
      if (prompt.variables.length === 0 && prompt.templateContent.includes('{{')) {
        warnings.push(`Prompt ${prompt.name} has template variables but no variable definitions`);
      }

      // Check if template content exists
      if (!prompt.templateContent || prompt.templateContent.trim().length === 0) {
        errors.push(`Prompt ${prompt.name} has empty template content`);
      }
    });

    console.log(`   ✓ Validated ${flows.length} flows`);
    console.log(`   ✓ Validated ${prompts.length} prompts`);
    
    if (errors.length > 0) {
      console.log(`   ⚠️  Found ${errors.length} errors`);
    }
    if (warnings.length > 0) {
      console.log(`   ⚠️  Found ${warnings.length} warnings`);
    }

    return { errors, warnings };
  }

  /**
   * Filter flows by migration phase
   */
  private filterFlowsByPhase(flows: any[], phase: 1 | 2 | 3 | 'all'): any[] {
    if (phase === 'all') return flows;
    return flows.filter(f => f.migrationPhase === phase);
  }

  /**
   * Count total prompts
   */
  private countPrompts(promptResults: any[]): number {
    return promptResults.reduce((sum, r) => sum + r.prompts.length, 0);
  }

  /**
   * Save report to file
   */
  private saveReport(name: string, data: any): void {
    const outputPath = join(this.outputDir, `${name}-report.json`);
    
    // Create output directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`   📄 Report saved: ${outputPath}`);
  }

  /**
   * Load report from file
   */
  private loadReport(name: string): any {
    const filePath = join(this.outputDir, `${name}-report.json`);
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  }

  /**
   * Generate summary report
   */
  private generateSummary(data: {
    flowsMigrated: number;
    promptsCreated: number;
    uploadedFlows: number;
    uploadedPrompts: number;
    errors: string[];
    warnings: string[];
    duration: number;
  }): string {
    const { flowsMigrated, promptsCreated, uploadedFlows, uploadedPrompts, errors, warnings, duration } = data;

    const durationMin = Math.floor(duration / 60000);
    const durationSec = Math.floor((duration % 60000) / 1000);

    let summary = `
╔══════════════════════════════════════════════════════════════════════╗
║                    MIGRATION SUMMARY                                 ║
╚══════════════════════════════════════════════════════════════════════╝

✨ Migration Completed Successfully!

📊 Statistics:
   Flows Migrated:        ${flowsMigrated}
   Prompts Created:       ${promptsCreated}
   Flows Uploaded:        ${uploadedFlows}
   Prompts Uploaded:      ${uploadedPrompts}
   Duration:              ${durationMin}m ${durationSec}s

`;

    if (errors.length > 0) {
      summary += `\n❌ Errors (${errors.length}):\n`;
      errors.forEach(err => summary += `   • ${err}\n`);
    }

    if (warnings.length > 0) {
      summary += `\n⚠️  Warnings (${warnings.length}):\n`;
      warnings.forEach(warn => summary += `   • ${warn}\n`);
    }

    if (errors.length === 0 && warnings.length === 0) {
      summary += `\n✅ No errors or warnings!\n`;
    }

    summary += `\n📁 Output Directory: ${this.outputDir}`;
    summary += `\n📄 Generated Files:`;
    summary += `\n   • analysis-report.json`;
    summary += `\n   • prompts-report.json`;
    summary += `\n   • flow-configs-report.json`;
    summary += `\n   • prompt-configs-report.json`;
    summary += `\n   • validation-report.json`;

    summary += `\n\n🎯 Next Steps:`;
    summary += `\n   1. Review validation report`;
    summary += `\n   2. Test migrated flows`;
    summary += `\n   3. Compare outputs with original`;
    summary += `\n   4. Deploy to staging`;
    summary += `\n   5. Monitor performance`;

    return summary;
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    phase: 'all',
    dryRun: args.includes('--dry-run'),
    skipAnalysis: args.includes('--skip-analysis'),
    skipExtraction: args.includes('--skip-extraction'),
    skipUpload: args.includes('--skip-upload'),
  };

  // Parse phase argument
  const phaseArg = args.find(arg => arg.startsWith('--phase='));
  if (phaseArg) {
    const phase = phaseArg.split('=')[1];
    if (phase === '1' || phase === '2' || phase === '3') {
      options.phase = parseInt(phase) as 1 | 2 | 3;
    }
  }

  const migrator = new BatchMigrator(options);
  
  migrator.migrate(options).then(result => {
    if (result.success) {
      console.log('\n✨ Migration completed successfully!');
      process.exit(0);
    } else {
      console.error('\n❌ Migration completed with errors');
      process.exit(1);
    }
  }).catch(error => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
}

export default BatchMigrator;
