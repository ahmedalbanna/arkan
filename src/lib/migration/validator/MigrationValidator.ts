/**
 * Migration Validator
 * Week 5 - Day 5: Migration Validation Tools
 * 
 * Validates migrated flows to ensure correctness.
 */

import type { FlowConfiguration } from '../../models/flow-config';
import { SchemaValidator } from '../../../ai/dynamic-flow/schema-validator';

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

export interface ValidationError {
  type: 'schema' | 'step' | 'config' | 'reference';
  message: string;
  location?: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  type: 'optimization' | 'best-practice' | 'compatibility';
  message: string;
  location?: string;
}

// ============================================================================
// Migration Validator Class
// ============================================================================

export class MigrationValidator {
  /**
   * Validate a migrated flow configuration
   */
  validate(flow: FlowConfiguration): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate basic fields
    errors.push(...this.validateBasicFields(flow));

    // Validate schemas
    errors.push(...this.validateSchemas(flow));

    // Validate steps
    errors.push(...this.validateSteps(flow));

    // Validate references
    errors.push(...this.validateReferences(flow));

    // Check for warnings
    warnings.push(...this.checkWarnings(flow));

    // Calculate score
    const score = this.calculateScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }

  /**
   * Compare original and migrated flow outputs
   */
  async compareOutputs(
    originalOutput: any,
    migratedOutput: any
  ): Promise<ComparisonResult> {
    const differences: Difference[] = [];

    // Compare structure
    if (typeof originalOutput !== typeof migratedOutput) {
      differences.push({
        field: 'type',
        original: typeof originalOutput,
        migrated: typeof migratedOutput,
        severity: 'high',
      });
    }

    // Compare content (simplified)
    if (JSON.stringify(originalOutput) !== JSON.stringify(migratedOutput)) {
      differences.push({
        field: 'content',
        original: originalOutput,
        migrated: migratedOutput,
        severity: 'medium',
      });
    }

    const similarity = this.calculateSimilarity(originalOutput, migratedOutput);

    return {
      identical: differences.length === 0,
      similarity,
      differences,
    };
  }

  // ============================================================================
  // Private Validation Methods
  // ============================================================================

  private validateBasicFields(flow: FlowConfiguration): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!flow.id) {
      errors.push({
        type: 'config',
        message: 'Flow ID is required',
        severity: 'critical',
      });
    }

    if (!flow.name) {
      errors.push({
        type: 'config',
        message: 'Flow name is required',
        severity: 'critical',
      });
    }

    if (!flow.version || !/^\d+\.\d+\.\d+$/.test(flow.version)) {
      errors.push({
        type: 'config',
        message: 'Invalid version format (should be semver: X.Y.Z)',
        severity: 'error',
      });
    }

    if (flow.steps.length === 0) {
      errors.push({
        type: 'step',
        message: 'Flow must have at least one step',
        severity: 'critical',
      });
    }

    return errors;
  }

  private validateSchemas(flow: FlowConfiguration): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate input schema
    if (!flow.inputSchema || flow.inputSchema.fields.length === 0) {
      errors.push({
        type: 'schema',
        message: 'Input schema is missing or empty',
        location: 'inputSchema',
        severity: 'error',
      });
    }

    // Validate output schema
    if (!flow.outputSchema || flow.outputSchema.fields.length === 0) {
      errors.push({
        type: 'schema',
        message: 'Output schema is missing or empty',
        location: 'outputSchema',
        severity: 'error',
      });
    }

    return errors;
  }

  private validateSteps(flow: FlowConfiguration): ValidationError[] {
    const errors: ValidationError[] = [];
    const outputVariables = new Set<string>();

    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i];

      // Validate step has required fields
      if (!step.id || !step.name || !step.type) {
        errors.push({
          type: 'step',
          message: `Step ${i + 1} is missing required fields`,
          location: `steps[${i}]`,
          severity: 'critical',
        });
      }

      // Validate step config
      if (!step.config) {
        errors.push({
          type: 'step',
          message: `Step ${i + 1} is missing configuration`,
          location: `steps[${i}].config`,
          severity: 'critical',
        });
      }

      // Track output variables
      const outputVar = (step.config as any).outputVariable;
      if (outputVar) {
        outputVariables.add(outputVar);
      }
    }

    return errors;
  }

  private validateReferences(flow: FlowConfiguration): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check if output schema fields are produced by steps
    for (const field of flow.outputSchema.fields) {
      // This is a simplified check
      // In reality, you'd need to trace through step outputs
    }

    return errors;
  }

  private checkWarnings(flow: FlowConfiguration): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for optimization opportunities
    if (flow.steps.length > 10) {
      warnings.push({
        type: 'optimization',
        message: 'Flow has many steps - consider breaking into sub-flows',
      });
    }

    if (!flow.config.cache) {
      warnings.push({
        type: 'optimization',
        message: 'Caching is disabled - consider enabling for better performance',
      });
    }

    // Check best practices
    if (!flow.description) {
      warnings.push({
        type: 'best-practice',
        message: 'Flow description is empty - add description for clarity',
      });
    }

    if (flow.tags.length === 0) {
      warnings.push({
        type: 'best-practice',
        message: 'No tags defined - add tags for better organization',
      });
    }

    return warnings;
  }

  private calculateScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100;
    
    score -= errors.filter(e => e.severity === 'critical').length * 25;
    score -= errors.filter(e => e.severity === 'error').length * 10;
    score -= warnings.length * 2;

    return Math.max(0, score);
  }

  private calculateSimilarity(original: any, migrated: any): number {
    // Simple similarity calculation
    const orig = JSON.stringify(original);
    const migr = JSON.stringify(migrated);

    if (orig === migr) return 100;

    const maxLen = Math.max(orig.length, migr.length);
    const minLen = Math.min(orig.length, migr.length);

    return Math.round((minLen / maxLen) * 100);
  }
}

// ============================================================================
// Types
// ============================================================================

export interface ComparisonResult {
  identical: boolean;
  similarity: number;
  differences: Difference[];
}

export interface Difference {
  field: string;
  original: any;
  migrated: any;
  severity: 'low' | 'medium' | 'high';
}

// ============================================================================
// Utility Functions
// ============================================================================

export function validateMigration(flow: FlowConfiguration): ValidationResult {
  const validator = new MigrationValidator();
  return validator.validate(flow);
}

export async function compareFlowOutputs(
  original: any,
  migrated: any
): Promise<ComparisonResult> {
  const validator = new MigrationValidator();
  return validator.compareOutputs(original, migrated);
}
