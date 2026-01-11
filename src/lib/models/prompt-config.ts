/**
 * Prompt Configuration Models
 * 
 * Defines TypeScript interfaces for dynamic prompt templates
 * stored in Firestore database.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Prompt variable types
 */
export type PromptVariableType = 'string' | 'number' | 'boolean' | 'array' | 'object';

/**
 * Prompt configuration status
 */
export type PromptStatus = 'draft' | 'active' | 'archived';

/**
 * Main prompt configuration interface
 */
export interface PromptConfiguration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  tags: string[];
  
  // Template content with variable placeholders
  templateContent: string; // Uses {{variable}} syntax
  systemPrompt?: string; // System/instruction prompt
  
  // Variables used in the template
  variables: PromptVariable[];
  
  // Schema definitions (Zod schema as JSON)
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  
  // Metadata
  version: number;
  status: PromptStatus;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  
  // Testing
  testCases?: PromptTestCase[];
  
  // Model preferences
  preferredModel?: string;
  fallbackModel?: string;
  
  // Settings
  settings?: PromptSettings;
}

/**
 * Variable definition in a prompt
 */
export interface PromptVariable {
  name: string;
  type: PromptVariableType;
  description: string;
  required: boolean;
  defaultValue?: any;
  
  // Validation
  validation?: PromptVariableValidation;
  
  // UI hints
  placeholder?: string;
  examples?: any[];
}

/**
 * Validation rules for prompt variables
 */
export interface PromptVariableValidation {
  // String validation
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex pattern
  
  // Number validation
  min?: number;
  max?: number;
  integer?: boolean;
  
  // Array validation
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  
  // Enum validation
  enum?: any[];
  
  // Custom validation message
  message?: string;
}

/**
 * Test case for prompt validation
 */
export interface PromptTestCase {
  id: string;
  name: string;
  description?: string;
  
  // Test input
  input: Record<string, any>;
  
  // Expected output (optional for validation)
  expectedOutput?: string;
  expectedPattern?: string; // Regex pattern for output validation
  
  // Test results
  lastRunAt?: Timestamp;
  passed?: boolean;
  actualOutput?: string;
  error?: string;
  duration?: number;
}

/**
 * Prompt execution settings
 */
export interface PromptSettings {
  // Generation parameters
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  
  // Safety
  stopSequences?: string[];
  
  // Formatting
  trimWhitespace?: boolean;
  removeEmptyLines?: boolean;
  
  // Caching
  cacheable?: boolean;
  cacheTTL?: number; // seconds
}

/**
 * Prompt version history entry
 */
export interface PromptVersion {
  promptId: string;
  version: number;
  configuration: PromptConfiguration;
  createdBy: string;
  createdAt: Timestamp;
  message?: string; // Commit message
  previousVersion?: number;
  
  // Performance metrics
  averageTokens?: number;
  averageDuration?: number;
  successRate?: number;
}

/**
 * Prompt usage statistics
 */
export interface PromptUsageStats {
  promptId: string;
  period: 'hour' | 'day' | 'week' | 'month';
  startDate: Timestamp;
  endDate: Timestamp;
  
  // Usage metrics
  executionCount: number;
  successCount: number;
  failureCount: number;
  
  // Performance metrics
  averageDuration: number;
  p95Duration: number;
  averageInputTokens: number;
  averageOutputTokens: number;
  
  // Quality metrics
  averageRating?: number;
  feedbackCount?: number;
}

/**
 * Prompt execution context
 */
export interface PromptExecutionContext {
  promptId: string;
  promptVersion: number;
  executionId: string;
  
  // Input
  variables: Record<string, any>;
  
  // Model settings
  model: string;
  temperature?: number;
  maxTokens?: number;
  
  // Metadata
  userId?: string;
  flowId?: string;
  stepId?: string;
}

/**
 * Prompt execution result
 */
export interface PromptExecutionResult {
  executionId: string;
  promptId: string;
  promptVersion: number;
  
  // Output
  output: string;
  renderedPrompt: string; // Final prompt with variables replaced
  
  // Metadata
  model: string;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  
  // Timing
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number;
  
  // Status
  status: 'success' | 'error';
  error?: string;
}

/**
 * Firestore collection names
 */
export const PROMPT_COLLECTIONS = {
  CONFIGURATIONS: 'promptTemplates',
  VERSIONS: 'promptVersions',
  EXECUTIONS: 'promptExecutions',
  STATS: 'promptStats',
} as const;

/**
 * Default prompt settings
 */
export const DEFAULT_PROMPT_SETTINGS: PromptSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
  trimWhitespace: true,
  removeEmptyLines: false,
  cacheable: true,
  cacheTTL: 3600, // 1 hour
};

/**
 * Template syntax patterns
 */
export const TEMPLATE_PATTERNS = {
  VARIABLE: /\{\{([^}]+)\}\}/g, // Matches {{variable}}
  CONDITIONAL: /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, // Matches {{#if condition}}...{{/if}}
  LOOP: /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, // Matches {{#each items}}...{{/each}}
} as const;

/**
 * Validation helpers
 */
export function validatePromptConfiguration(config: Partial<PromptConfiguration>): string[] {
  const errors: string[] = [];
  
  if (!config.name) {
    errors.push('Prompt name is required');
  }
  
  if (!config.displayName) {
    errors.push('Prompt display name is required');
  }
  
  if (!config.templateContent) {
    errors.push('Prompt template content is required');
  }
  
  if (!config.variables || config.variables.length === 0) {
    errors.push('Prompt must have at least one variable');
  }
  
  // Validate variables in template match variable definitions
  if (config.templateContent && config.variables) {
    const templateVars = extractVariablesFromTemplate(config.templateContent);
    const definedVars = new Set(config.variables.map(v => v.name));
    
    const undefinedVars = templateVars.filter(v => !definedVars.has(v));
    if (undefinedVars.length > 0) {
      errors.push(`Template uses undefined variables: ${undefinedVars.join(', ')}`);
    }
  }
  
  return errors;
}

/**
 * Extract variable names from template
 */
export function extractVariablesFromTemplate(template: string): string[] {
  const variables: string[] = [];
  const matches = template.matchAll(TEMPLATE_PATTERNS.VARIABLE);
  
  for (const match of matches) {
    const varName = match[1].trim();
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }
  
  return variables;
}

/**
 * Render template with variables
 */
export function renderTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let rendered = template;
  
  // Replace variables
  rendered = rendered.replace(TEMPLATE_PATTERNS.VARIABLE, (match, varName) => {
    const name = varName.trim();
    const value = variables[name];
    
    if (value === undefined) {
      console.warn(`Variable '${name}' not found in context`);
      return match; // Keep placeholder
    }
    
    return String(value);
  });
  
  // Handle conditionals
  rendered = rendered.replace(TEMPLATE_PATTERNS.CONDITIONAL, (match, condition, content) => {
    try {
      const conditionResult = evaluateCondition(condition.trim(), variables);
      return conditionResult ? content : '';
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return match;
    }
  });
  
  // Handle loops
  rendered = rendered.replace(TEMPLATE_PATTERNS.LOOP, (match, itemsVar, content) => {
    const items = variables[itemsVar.trim()];
    
    if (!Array.isArray(items)) {
      console.warn(`Variable '${itemsVar}' is not an array`);
      return match;
    }
    
    return items.map(item => {
      return content.replace(/\{\{this\}\}/g, String(item));
    }).join('\n');
  });
  
  return rendered;
}

/**
 * Evaluate simple condition (safe evaluation)
 */
function evaluateCondition(condition: string, variables: Record<string, any>): boolean {
  try {
    // Simple condition evaluation (only basic comparisons)
    const varName = condition.trim();
    const value = variables[varName];
    
    // Truthy check
    return Boolean(value);
  } catch (error) {
    console.error('Condition evaluation error:', error);
    return false;
  }
}

/**
 * Validate prompt input against schema
 */
export function validatePromptInput(
  input: Record<string, any>,
  variables: PromptVariable[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required variables
  for (const variable of variables) {
    if (variable.required && !(variable.name in input)) {
      errors.push(`Required variable '${variable.name}' is missing`);
      continue;
    }
    
    const value = input[variable.name];
    
    // Skip validation if optional and not provided
    if (!variable.required && value === undefined) {
      continue;
    }
    
    // Type validation
    if (value !== undefined && !validateVariableType(value, variable.type)) {
      errors.push(`Variable '${variable.name}' has invalid type (expected ${variable.type})`);
    }
    
    // Additional validation
    if (variable.validation) {
      const validationErrors = validateVariableValue(value, variable);
      errors.push(...validationErrors);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate variable type
 */
function validateVariableType(value: any, type: PromptVariableType): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return false;
  }
}

/**
 * Validate variable value against validation rules
 */
function validateVariableValue(value: any, variable: PromptVariable): string[] {
  const errors: string[] = [];
  const validation = variable.validation;
  
  if (!validation) return errors;
  
  // String validation
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      errors.push(`${variable.name} must be at least ${validation.minLength} characters`);
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      errors.push(`${variable.name} must be at most ${validation.maxLength} characters`);
    }
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        errors.push(validation.message || `${variable.name} does not match required pattern`);
      }
    }
  }
  
  // Number validation
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      errors.push(`${variable.name} must be at least ${validation.min}`);
    }
    if (validation.max !== undefined && value > validation.max) {
      errors.push(`${variable.name} must be at most ${validation.max}`);
    }
    if (validation.integer && !Number.isInteger(value)) {
      errors.push(`${variable.name} must be an integer`);
    }
  }
  
  // Array validation
  if (Array.isArray(value)) {
    if (validation.minItems && value.length < validation.minItems) {
      errors.push(`${variable.name} must have at least ${validation.minItems} items`);
    }
    if (validation.maxItems && value.length > validation.maxItems) {
      errors.push(`${variable.name} must have at most ${validation.maxItems} items`);
    }
    if (validation.uniqueItems) {
      const unique = new Set(value);
      if (unique.size !== value.length) {
        errors.push(`${variable.name} must have unique items`);
      }
    }
  }
  
  // Enum validation
  if (validation.enum && !validation.enum.includes(value)) {
    errors.push(`${variable.name} must be one of: ${validation.enum.join(', ')}`);
  }
  
  return errors;
}

/**
 * Create a new prompt configuration with defaults
 */
export function createPromptConfiguration(
  partial: Partial<PromptConfiguration>
): Omit<PromptConfiguration, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: partial.name || '',
    displayName: partial.displayName || '',
    description: partial.description || '',
    category: partial.category || 'general',
    tags: partial.tags || [],
    templateContent: partial.templateContent || '',
    systemPrompt: partial.systemPrompt,
    variables: partial.variables || [],
    inputSchema: partial.inputSchema || {},
    outputSchema: partial.outputSchema || {},
    version: 1,
    status: 'draft',
    createdBy: partial.createdBy || '',
    testCases: partial.testCases || [],
    settings: { ...DEFAULT_PROMPT_SETTINGS, ...partial.settings },
  } as Omit<PromptConfiguration, 'id' | 'createdAt' | 'updatedAt'>;
}
