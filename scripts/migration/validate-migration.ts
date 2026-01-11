/**
 * Migration Validation Script
 * 
 * Validates migrated flows and prompts for correctness, completeness,
 * and compatibility with the dynamic flow system.
 */

import { FlowConfiguration } from '@/lib/models/flow-config';
import { PromptConfiguration } from '@/lib/models/prompt-config';
import { z } from 'zod';

interface ValidationError {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  location?: string;
  suggestion?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
  score: number; // 0-100
}

export class MigrationValidator {
  /**
   * Validate flow configuration
   */
  public validateFlow(flow: FlowConfiguration): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // Required fields validation
    this.validateRequiredFields(flow, errors);

    // Schema validation
    this.validateSchemas(flow, errors, warnings);

    // Step validation
    this.validateSteps(flow, errors, warnings);

    // Naming conventions
    this.validateNamingConventions(flow, warnings);

    // Best practices
    this.validateBestPractices(flow, info);

    const score = this.calculateScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
      score,
    };
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(
    flow: FlowConfiguration,
    errors: ValidationError[]
  ): void {
    if (!flow.name || flow.name.trim().length === 0) {
      errors.push({
        severity: 'error',
        category: 'Required Field',
        message: 'Flow name is required',
        suggestion: 'Add a unique flow name using kebab-case',
      });
    }

    if (!flow.displayName || flow.displayName.trim().length === 0) {
      errors.push({
        severity: 'error',
        category: 'Required Field',
        message: 'Display name is required',
        suggestion: 'Add a human-readable display name',
      });
    }

    if (!flow.steps || flow.steps.length === 0) {
      errors.push({
        severity: 'error',
        category: 'Required Field',
        message: 'Flow must have at least one step',
        suggestion: 'Add steps to define the flow logic',
      });
    }
  }

  /**
   * Validate schemas
   */
  private validateSchemas(
    flow: FlowConfiguration,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    if (!flow.inputSchema) {
      warnings.push({
        severity: 'warning',
        category: 'Schema',
        message: 'Input schema is missing',
        suggestion: 'Define input schema for type safety',
      });
    } else {
      this.validateJSONSchema(flow.inputSchema, 'input', errors);
    }

    if (!flow.outputSchema) {
      warnings.push({
        severity: 'warning',
        category: 'Schema',
        message: 'Output schema is missing',
        suggestion: 'Define output schema for type safety',
      });
    } else {
      this.validateJSONSchema(flow.outputSchema, 'output', errors);
    }
  }

  /**
   * Validate JSON schema
   */
  private validateJSONSchema(
    schema: any,
    type: string,
    errors: ValidationError[]
  ): void {
    if (!schema.type) {
      errors.push({
        severity: 'error',
        category: 'Schema',
        message: `${type} schema missing 'type' property`,
        location: `${type}Schema`,
      });
    }

    if (schema.type === 'object' && !schema.properties) {
      errors.push({
        severity: 'error',
        category: 'Schema',
        message: `${type} schema missing 'properties'`,
        location: `${type}Schema`,
      });
    }
  }

  /**
   * Validate steps
   */
  private validateSteps(
    flow: FlowConfiguration,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    flow.steps.forEach((step, index) => {
      // Validate step ID
      if (!step.id) {
        errors.push({
          severity: 'error',
          category: 'Step',
          message: `Step ${index + 1} missing ID`,
          location: `steps[${index}]`,
        });
      }

      // Validate step type
      const validTypes = ['GENERATE', 'RETRIEVE', 'TOOL', 'FORMAT', 'CONDITION', 'LOOP'];
      if (!validTypes.includes(step.type)) {
        errors.push({
          severity: 'error',
          category: 'Step',
          message: `Invalid step type: ${step.type}`,
          location: `steps[${index}]`,
          suggestion: `Use one of: ${validTypes.join(', ')}`,
        });
      }

      // Validate step config
      this.validateStepConfig(step, index, errors, warnings);

      // Validate step schemas
      if (!step.inputSchema) {
        warnings.push({
          severity: 'warning',
          category: 'Step',
          message: `Step ${index + 1} (${step.name}) missing input schema`,
          location: `steps[${index}]`,
        });
      }

      if (!step.outputSchema) {
        warnings.push({
          severity: 'warning',
          category: 'Step',
          message: `Step ${index + 1} (${step.name}) missing output schema`,
          location: `steps[${index}]`,
        });
      }
    });

    // Check for duplicate step IDs
    const stepIds = flow.steps.map(s => s.id);
    const duplicates = stepIds.filter((id, index) => stepIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      errors.push({
        severity: 'error',
        category: 'Step',
        message: `Duplicate step IDs found: ${duplicates.join(', ')}`,
        suggestion: 'Ensure all step IDs are unique',
      });
    }
  }

  /**
   * Validate step configuration
   */
  private validateStepConfig(
    step: any,
    index: number,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    if (!step.config) {
      errors.push({
        severity: 'error',
        category: 'Step Config',
        message: `Step ${index + 1} missing config`,
        location: `steps[${index}].config`,
      });
      return;
    }

    switch (step.type) {
      case 'GENERATE':
        if (!step.config.promptName) {
          errors.push({
            severity: 'error',
            category: 'Step Config',
            message: `GENERATE step ${index + 1} missing promptName`,
            location: `steps[${index}].config`,
          });
        }
        break;

      case 'RETRIEVE':
        if (!step.config.query) {
          errors.push({
            severity: 'error',
            category: 'Step Config',
            message: `RETRIEVE step ${index + 1} missing query`,
            location: `steps[${index}].config`,
          });
        }
        if (!step.config.collection) {
          warnings.push({
            severity: 'warning',
            category: 'Step Config',
            message: `RETRIEVE step ${index + 1} missing collection name`,
            location: `steps[${index}].config`,
          });
        }
        break;

      case 'TOOL':
        if (!step.config.toolName) {
          errors.push({
            severity: 'error',
            category: 'Step Config',
            message: `TOOL step ${index + 1} missing toolName`,
            location: `steps[${index}].config`,
          });
        }
        break;

      case 'FORMAT':
        if (!step.config.format) {
          warnings.push({
            severity: 'warning',
            category: 'Step Config',
            message: `FORMAT step ${index + 1} missing format type`,
            location: `steps[${index}].config`,
          });
        }
        break;

      case 'CONDITION':
        if (!step.config.expression) {
          errors.push({
            severity: 'error',
            category: 'Step Config',
            message: `CONDITION step ${index + 1} missing expression`,
            location: `steps[${index}].config`,
          });
        }
        break;

      case 'LOOP':
        if (!step.config.items) {
          errors.push({
            severity: 'error',
            category: 'Step Config',
            message: `LOOP step ${index + 1} missing items`,
            location: `steps[${index}].config`,
          });
        }
        break;
    }
  }

  /**
   * Validate naming conventions
   */
  private validateNamingConventions(
    flow: FlowConfiguration,
    warnings: ValidationError[]
  ): void {
    // Flow name should be kebab-case
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(flow.name)) {
      warnings.push({
        severity: 'warning',
        category: 'Naming',
        message: 'Flow name should use kebab-case',
        location: 'name',
        suggestion: 'Use lowercase letters, numbers, and hyphens only',
      });
    }

    // Check for reserved names
    const reservedNames = ['test', 'debug', 'admin', 'system'];
    if (reservedNames.some(reserved => flow.name.includes(reserved))) {
      warnings.push({
        severity: 'warning',
        category: 'Naming',
        message: 'Flow name contains reserved word',
        location: 'name',
      });
    }
  }

  /**
   * Validate best practices
   */
  private validateBestPractices(
    flow: FlowConfiguration,
    info: ValidationError[]
  ): void {
    // Description should be meaningful
    if (flow.description && flow.description.length < 20) {
      info.push({
        severity: 'info',
        category: 'Best Practice',
        message: 'Consider adding a more detailed description',
        location: 'description',
      });
    }

    // Tags help with organization
    if (!flow.tags || flow.tags.length === 0) {
      info.push({
        severity: 'info',
        category: 'Best Practice',
        message: 'Consider adding tags for better organization',
        location: 'tags',
      });
    }

    // Too many steps might indicate complexity
    if (flow.steps && flow.steps.length > 10) {
      info.push({
        severity: 'info',
        category: 'Best Practice',
        message: 'Flow has many steps, consider breaking into smaller flows',
        location: 'steps',
      });
    }

    // Version should follow semver
    if (flow.version && !/^\d+\.\d+\.\d+$/.test(flow.version)) {
      info.push({
        severity: 'info',
        category: 'Best Practice',
        message: 'Version should follow semantic versioning (x.y.z)',
        location: 'version',
      });
    }
  }

  /**
   * Validate prompt configuration
   */
  public validatePrompt(prompt: PromptConfiguration): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // Required fields
    if (!prompt.name || prompt.name.trim().length === 0) {
      errors.push({
        severity: 'error',
        category: 'Required Field',
        message: 'Prompt name is required',
      });
    }

    if (!prompt.templateContent || prompt.templateContent.trim().length === 0) {
      errors.push({
        severity: 'error',
        category: 'Required Field',
        message: 'Template content is required',
      });
    }

    // Validate variables
    if (prompt.templateContent) {
      this.validatePromptVariables(prompt, errors, warnings);
    }

    // Naming conventions
    if (prompt.name && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(prompt.name)) {
      warnings.push({
        severity: 'warning',
        category: 'Naming',
        message: 'Prompt name should use kebab-case',
      });
    }

    const score = this.calculateScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
      score,
    };
  }

  /**
   * Validate prompt variables
   */
  private validatePromptVariables(
    prompt: PromptConfiguration,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Extract variables from template
    const templateVars = new Set<string>();
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(prompt.templateContent)) !== null) {
      const varName = match[1].trim().split('.')[0];
      templateVars.add(varName);
    }

    // Check if all template variables are defined
    const definedVars = new Set(prompt.variables.map(v => v.name));
    
    templateVars.forEach(varName => {
      if (!definedVars.has(varName)) {
        warnings.push({
          severity: 'warning',
          category: 'Variables',
          message: `Template uses undefined variable: {{${varName}}}`,
          suggestion: 'Add variable definition or remove from template',
        });
      }
    });

    // Check for unused variables
    definedVars.forEach(varName => {
      if (!templateVars.has(varName)) {
        info.push({
          severity: 'info',
          category: 'Variables',
          message: `Variable '${varName}' is defined but not used`,
        });
      }
    });
  }

  /**
   * Calculate validation score
   */
  private calculateScore(errors: ValidationError[], warnings: ValidationError[]): number {
    let score = 100;
    score -= errors.length * 20; // Each error reduces score by 20
    score -= warnings.length * 5; // Each warning reduces score by 5
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Validate multiple flows
   */
  public validateFlows(flows: FlowConfiguration[]): {
    results: Map<string, ValidationResult>;
    summary: {
      total: number;
      valid: number;
      invalid: number;
      averageScore: number;
    };
  } {
    const results = new Map<string, ValidationResult>();

    flows.forEach(flow => {
      const result = this.validateFlow(flow);
      results.set(flow.name, result);
    });

    const validCount = Array.from(results.values()).filter(r => r.valid).length;
    const averageScore =
      Array.from(results.values()).reduce((sum, r) => sum + r.score, 0) / flows.length;

    return {
      results,
      summary: {
        total: flows.length,
        valid: validCount,
        invalid: flows.length - validCount,
        averageScore,
      },
    };
  }

  /**
   * Print validation results
   */
  public printResults(flowName: string, result: ValidationResult): void {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Validation: ${flowName}`);
    console.log(`Score: ${result.score}/100 ${this.getScoreEmoji(result.score)}`);
    console.log(`Status: ${result.valid ? '✅ Valid' : '❌ Invalid'}`);
    console.log('='.repeat(70));

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(err => {
        console.log(`   • [${err.category}] ${err.message}`);
        if (err.location) console.log(`     Location: ${err.location}`);
        if (err.suggestion) console.log(`     💡 ${err.suggestion}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warn => {
        console.log(`   • [${warn.category}] ${warn.message}`);
        if (warn.suggestion) console.log(`     💡 ${warn.suggestion}`);
      });
    }

    if (result.info.length > 0) {
      console.log('\nℹ️  Info:');
      result.info.forEach(info => {
        console.log(`   • [${info.category}] ${info.message}`);
      });
    }

    if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
      console.log('\n✅ All checks passed!');
    }
  }

  /**
   * Get score emoji
   */
  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🌟';
    if (score >= 75) return '✅';
    if (score >= 60) return '⚠️';
    return '❌';
  }
}

// CLI Usage
if (require.main === module) {
  console.log('Migration Validation Tool');
  console.log('Usage: ts-node validate-migration.ts');
  console.log('\nValidates flow and prompt configurations for correctness.');
}

export default MigrationValidator;
