#!/usr/bin/env tsx
/**
 * Validate Pilot Flow Configurations
 * 
 * Validates that all pilot flow configurations are correctly structured
 * and can be executed by the dynamic flow executor.
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

// Define validation schemas
const StepSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['retrieve', 'generate', 'tool', 'format', 'transform']),
  config: z.record(z.any()),
  outputMapping: z.record(z.string()).optional(),
});

const FlowConfigSchema = z.object({
  name: z.string(),
  version: z.number(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.any()),
    required: z.array(z.string()),
  }),
  outputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.any()),
    required: z.array(z.string()),
  }),
  steps: z.array(StepSchema),
  metadata: z.record(z.any()),
});

interface ValidationResult {
  flowName: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  stepCount: number;
}

function validateConfig(configPath: string): ValidationResult {
  const flowName = path.basename(configPath, '.json');
  const result: ValidationResult = {
    flowName,
    valid: true,
    errors: [],
    warnings: [],
    stepCount: 0,
  };

  try {
    // Read and parse config
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // Validate against schema
    const validation = FlowConfigSchema.safeParse(configData);
    
    if (!validation.success) {
      result.valid = false;
      result.errors.push(...validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      return result;
    }

    const config = validation.data;
    result.stepCount = config.steps.length;

    // Additional validation checks
    
    // Check if all steps have unique IDs
    const stepIds = new Set<string>();
    config.steps.forEach((step, idx) => {
      if (stepIds.has(step.id)) {
        result.errors.push(`Duplicate step ID: ${step.id}`);
        result.valid = false;
      }
      stepIds.add(step.id);
    });

    // Check if generate steps have required config
    config.steps.forEach(step => {
      if (step.type === 'generate') {
        if (!step.config.model) {
          result.errors.push(`Step ${step.id}: generate step missing 'model' config`);
          result.valid = false;
        }
        if (!step.config.systemPrompt && !step.config.userPromptTemplate) {
          result.errors.push(`Step ${step.id}: generate step missing prompt templates`);
          result.valid = false;
        }
        if (!step.config.outputKey) {
          result.warnings.push(`Step ${step.id}: generate step missing 'outputKey'`);
        }
      }
    });

    // Check if transform steps have required config
    config.steps.forEach(step => {
      if (step.type === 'transform') {
        if (!step.config.operation) {
          result.errors.push(`Step ${step.id}: transform step missing 'operation' config`);
          result.valid = false;
        }
        if (!step.config.inputKey) {
          result.warnings.push(`Step ${step.id}: transform step missing 'inputKey'`);
        }
      }
    });

    // Check if last step has output mapping
    const lastStep = config.steps[config.steps.length - 1];
    if (!lastStep.outputMapping) {
      result.warnings.push('Last step missing outputMapping - outputs may not be returned correctly');
    }

    // Check if output schema matches output mapping
    if (lastStep.outputMapping) {
      const outputKeys = Object.keys(lastStep.outputMapping);
      const schemaKeys = config.outputSchema.required || [];
      
      schemaKeys.forEach(key => {
        if (!outputKeys.includes(key)) {
          result.warnings.push(`Output schema requires '${key}' but it's not in output mapping`);
        }
      });
    }

  } catch (error) {
    result.valid = false;
    result.errors.push(`Failed to parse or validate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

async function validatePilotConfigs(): Promise<void> {
  console.log('🔍 Validating Pilot Flow Configurations\n');

  const pilotDir = path.join(process.cwd(), 'migration-configs/pilot');
  const configFiles = fs.readdirSync(pilotDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(pilotDir, f));

  console.log(`📋 Found ${configFiles.length} configurations to validate\n`);

  const results: ValidationResult[] = [];

  for (const configPath of configFiles) {
    const result = validateConfig(configPath);
    results.push(result);

    console.log(`\n📄 ${result.flowName}`);
    console.log(`   Steps: ${result.stepCount}`);
    
    if (result.valid) {
      console.log(`   ✅ Valid`);
    } else {
      console.log(`   ❌ Invalid`);
    }

    if (result.errors.length > 0) {
      console.log(`   Errors:`);
      result.errors.forEach(err => console.log(`      - ${err}`));
    }

    if (result.warnings.length > 0) {
      console.log(`   Warnings:`);
      result.warnings.forEach(warn => console.log(`      - ${warn}`));
    }
  }

  // Summary
  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.filter(r => !r.valid).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log('\n' + '='.repeat(80));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`\nTotal Configurations: ${results.length}`);
  console.log(`✅ Valid: ${validCount}`);
  console.log(`❌ Invalid: ${invalidCount}`);
  console.log(`⚠️  Total Errors: ${totalErrors}`);
  console.log(`⚠️  Total Warnings: ${totalWarnings}`);

  if (invalidCount > 0) {
    console.log('\nInvalid configurations:');
    results.filter(r => !r.valid).forEach(r => {
      console.log(`  ❌ ${r.flowName}`);
    });
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Save validation report
  const reportPath = path.join(process.cwd(), 'migration-reports', 'pilot-validation-report.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalConfigs: results.length,
    valid: validCount,
    invalid: invalidCount,
    totalErrors,
    totalWarnings,
    results,
  }, null, 2));
  
  console.log(`📄 Validation report saved: ${reportPath}\n`);

  if (invalidCount > 0) {
    process.exit(1);
  }
}

// Main execution
async function main() {
  try {
    await validatePilotConfigs();
    console.log('✅ Validation complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Validation failed:', error);
    process.exit(1);
  }
}

main();
