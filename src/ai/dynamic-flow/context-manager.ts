/**
 * Context Manager
 * Week 1 - Day 3-4: Context Manager & Validator
 * 
 * Manages execution context, variable storage, and template resolution
 * for dynamic flow execution.
 */

import type { FlowConfiguration, StepResult } from '../../lib/models/flow-config';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Variable history entry for tracking changes
 */
export interface VariableHistoryEntry {
  value: any;
  timestamp: number;
  operation: 'set' | 'delete' | 'update';
  source?: string; // Step ID or operation source
}

/**
 * Variable type constraint
 */
export interface VariableConstraint {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  required?: boolean;
  validator?: (value: any) => boolean;
  errorMessage?: string;
}

/**
 * Options for variable operations
 */
export interface VariableOptions {
  immutable?: boolean;
  trackHistory?: boolean;
  constraint?: VariableConstraint;
  source?: string;
}

export interface ExecutionContext {
  id: string;
  traceId: string;
  input: any;
  config: FlowConfiguration;
  options: ExecutionOptions;
  variables: Map<string, any>;
  stepResults: Map<string, StepResult>;
  metrics: {
    successfulSteps: number;
    failedSteps: number;
    skippedSteps: number;
    totalTokens: number;
    totalCost: number;
    cacheHits: number;
    cacheMisses: number;
  };
  startTime: number;
  lastStepTime?: number;
  // Enhanced features
  immutableVariables?: Set<string>;
  variableHistory?: Map<string, VariableHistoryEntry[]>;
  variableConstraints?: Map<string, VariableConstraint>;
}

export interface ExecutionOptions {
  timeout?: number;
  userId?: string;
  sessionId?: string;
  dryRun?: boolean;
  debug?: boolean;
  variables?: Record<string, any>;
}

export interface ContextSnapshot {
  id: string;
  traceId: string;
  timestamp: number;
  variables: Record<string, any>;
  stepResults: Array<{ stepId: string; status: string; output: any }>;
  metrics: any;
  immutableVariables?: string[];
  variableHistory?: Record<string, VariableHistoryEntry[]>;
  variableConstraints?: Record<string, VariableConstraint>;
}

/**
 * Context Manager class
 * Handles variable storage, retrieval, and template string resolution
 */
export class ContextManager {
  private context: Map<string, any>;
  private readonly parentContext?: ContextManager;
  private readonly scopeStack: Map<string, any>[];
  private contexts: Map<string, ExecutionContext> = new Map();

  constructor(initialContext: Record<string, any> = {}, parent?: ContextManager) {
    this.context = new Map(Object.entries(initialContext));
    this.parentContext = parent;
    this.scopeStack = [];
  }

  // ============================================================================
  // Enhanced Context Management for Dynamic Flows
  // ============================================================================

  /**
   * Initialize a new execution context
   */
  async initialize(params: {
    input: any;
    config: FlowConfiguration;
    options: ExecutionOptions;
    traceId: string;
  }): Promise<ExecutionContext> {
    const context: ExecutionContext = {
      id: this.generateContextId(),
      traceId: params.traceId,
      input: params.input,
      config: params.config,
      options: params.options,
      variables: new Map(),
      stepResults: new Map(),
      metrics: {
        successfulSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        totalTokens: 0,
        totalCost: 0,
        cacheHits: 0,
        cacheMisses: 0
      },
      startTime: Date.now(),
      // Initialize enhanced features
      immutableVariables: new Set(),
      variableHistory: new Map(),
      variableConstraints: new Map()
    };

    // Initialize with any provided variables
    if (params.options.variables) {
      for (const [key, value] of Object.entries(params.options.variables)) {
        context.variables.set(key, value);
      }
    }

    this.contexts.set(context.id, context);
    return context;
  }

  /**
   * Update context with step results
   */
  async updateContext(
    context: ExecutionContext,
    step: any,
    result: StepResult
  ): Promise<void> {
    // Store step result
    context.stepResults.set(step.id, result);
    context.lastStepTime = Date.now();

    // Apply output mapping to context variables
    if (step.contextMapping?.output && result.output) {
      for (const [outputPath, contextVar] of Object.entries(step.contextMapping.output)) {
        const value = this.extractValue(result.output, outputPath);
        context.variables.set(contextVar, value);
      }
    }

    // Update metrics
    if (result.metrics) {
      context.metrics.totalTokens += result.metrics.tokens || 0;
      context.metrics.totalCost += result.metrics.cost || 0;

      if (result.metrics.cacheHit) {
        context.metrics.cacheHits++;
      } else {
        context.metrics.cacheMisses++;
      }
    }
  }

  /**
   * Get variable value from context
   */
  getVariable(context: ExecutionContext, name: string): any {
    // Check explicit variables first
    if (context.variables.has(name)) {
      return context.variables.get(name);
    }

    // Check input with path notation (input.fieldName)
    if (name.startsWith('input.')) {
      const path = name.substring(6);
      return this.extractValue(context.input, path);
    }

    // Check step results with path notation (stepId.outputField)
    if (name.includes('.')) {
      const [stepId, ...pathParts] = name.split('.');
      const stepResult = context.stepResults.get(stepId);
      if (stepResult?.output) {
        return this.extractValue(stepResult.output, pathParts.join('.'));
      }
    }

    // Check for special variables
    if (name === 'context.stepCount') {
      return context.stepResults.size;
    }
    if (name === 'context.duration') {
      return Date.now() - context.startTime;
    }

    return undefined;
  }

  /**
   * Set variable in context with enhanced features
   */
  setVariable(
    context: ExecutionContext, 
    name: string, 
    value: any,
    options?: VariableOptions
  ): void {
    // Check if variable is immutable
    if (context.immutableVariables?.has(name)) {
      throw new Error(
        `Cannot modify immutable variable: ${name}. Variable was marked as immutable and cannot be changed.`
      );
    }

    // Validate type constraint if exists
    const constraint = context.variableConstraints?.get(name) || options?.constraint;
    if (constraint) {
      this.validateConstraint(name, value, constraint);
      // Store constraint for future validations
      if (options?.constraint && context.variableConstraints) {
        context.variableConstraints.set(name, options.constraint);
      }
    }

    // Track history if enabled
    if (options?.trackHistory !== false && context.variableHistory) {
      const history = context.variableHistory.get(name) || [];
      const operation = context.variables.has(name) ? 'update' : 'set';
      
      history.push({
        value: this.deepClone(value),
        timestamp: Date.now(),
        operation,
        source: options?.source
      });
      
      context.variableHistory.set(name, history);
    }

    // Set the variable
    context.variables.set(name, value);

    // Mark as immutable if specified
    if (options?.immutable && context.immutableVariables) {
      context.immutableVariables.add(name);
    }
  }

  /**
   * Set variable with immutability protection
   */
  setImmutableVariable(
    context: ExecutionContext,
    name: string,
    value: any,
    options?: Omit<VariableOptions, 'immutable'>
  ): void {
    this.setVariable(context, name, value, { ...options, immutable: true });
  }

  /**
   * Check if a variable is immutable
   */
  isImmutable(context: ExecutionContext, name: string): boolean {
    return context.immutableVariables?.has(name) || false;
  }

  /**
   * Get variable history
   */
  getVariableHistory(context: ExecutionContext, name: string): VariableHistoryEntry[] {
    return context.variableHistory?.get(name) || [];
  }

  /**
   * Get variable at specific point in time
   */
  getVariableAtTime(context: ExecutionContext, name: string, timestamp: number): any {
    const history = this.getVariableHistory(context, name);
    
    // Find the last entry before or at the timestamp
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].timestamp <= timestamp) {
        return history[i].value;
      }
    }
    
    return undefined;
  }

  /**
   * Get all variable changes
   */
  getAllVariableChanges(context: ExecutionContext): Map<string, VariableHistoryEntry[]> {
    return context.variableHistory || new Map();
  }

  /**
   * Set variable constraint
   */
  setVariableConstraint(
    context: ExecutionContext,
    name: string,
    constraint: VariableConstraint
  ): void {
    if (!context.variableConstraints) {
      context.variableConstraints = new Map();
    }
    
    // Validate existing value if variable already exists
    if (context.variables.has(name)) {
      const currentValue = context.variables.get(name);
      this.validateConstraint(name, currentValue, constraint);
    }
    
    context.variableConstraints.set(name, constraint);
  }

  /**
   * Get variable constraint
   */
  getVariableConstraint(context: ExecutionContext, name: string): VariableConstraint | undefined {
    return context.variableConstraints?.get(name);
  }

  /**
   * Validate value against constraint
   */
  private validateConstraint(name: string, value: any, constraint: VariableConstraint): void {
    // Check required
    if (constraint.required && (value === null || value === undefined)) {
      throw new Error(
        `Variable "${name}" is required but got ${value}. ${constraint.errorMessage || ''}`
      );
    }

    // Skip validation if value is null/undefined and not required
    if (value === null || value === undefined) {
      return;
    }

    // Check type
    if (constraint.type !== 'any') {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      
      if (actualType !== constraint.type) {
        throw new Error(
          `Variable "${name}" must be of type "${constraint.type}" but got "${actualType}". ${constraint.errorMessage || ''}`
        );
      }
    }

    // Run custom validator if provided
    if (constraint.validator) {
      try {
        const isValid = constraint.validator(value);
        if (!isValid) {
          throw new Error(
            `Variable "${name}" failed custom validation. ${constraint.errorMessage || ''}`
          );
        }
      } catch (error) {
        throw new Error(
          `Variable "${name}" validation error: ${error instanceof Error ? error.message : 'Unknown error'}. ${constraint.errorMessage || ''}`
        );
      }
    }
  }

  /**
   * Deep clone a value for history tracking
   */
  private deepClone(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(item => this.deepClone(item));
    }

    if (value instanceof Date) {
      return new Date(value);
    }

    if (value instanceof Map) {
      return new Map(Array.from(value.entries()).map(([k, v]) => [k, this.deepClone(v)]));
    }

    if (value instanceof Set) {
      return new Set(Array.from(value).map(v => this.deepClone(v)));
    }

    const cloned: any = {};
    for (const [key, val] of Object.entries(value)) {
      cloned[key] = this.deepClone(val);
    }
    return cloned;
  }

  /**
   * Extract output from context
   */
  extractOutput(
    context: ExecutionContext,
    outputMapping?: Record<string, string>
  ): any {
    if (outputMapping) {
      // Build output object from mapping
      const output: any = {};
      for (const [outputKey, contextPath] of Object.entries(outputMapping)) {
        output[outputKey] = this.getVariable(context, contextPath);
      }
      return output;
    }

    // Default: return last step output
    const lastStepResult = Array.from(context.stepResults.values()).pop();
    return lastStepResult?.output || null;
  }

  /**
   * Create context snapshot for debugging
   */
  snapshot(context: ExecutionContext): ContextSnapshot {
    return {
      id: context.id,
      traceId: context.traceId,
      timestamp: Date.now(),
      variables: Object.fromEntries(context.variables),
      stepResults: Array.from(context.stepResults.entries()).map(([id, result]) => ({
        stepId: id,
        status: result.status,
        output: result.output
      })),
      metrics: { ...context.metrics },
      immutableVariables: context.immutableVariables ? Array.from(context.immutableVariables) : [],
      variableHistory: context.variableHistory ? Object.fromEntries(context.variableHistory) : {},
      variableConstraints: context.variableConstraints ? Object.fromEntries(context.variableConstraints) : {}
    };
  }

  /**
   * Clean up context after execution
   */
  async cleanup(contextId: string): Promise<void> {
    this.contexts.delete(contextId);
  }

  /**
   * Extract value from object using path
   */
  private extractValue(obj: any, path: string): any {
    if (!path) return obj;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      // Handle array indices
      const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, key, index] = arrayMatch;
        current = current?.[key]?.[parseInt(index)];
      } else {
        current = current?.[part];
      }

      if (current === undefined) {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Generate unique context ID
   */
  private generateContextId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // Variable Management
  // ============================================================================

  /**
   * Set a variable in the context
   */
  set(key: string, value: any): void {
    this.context.set(key, value);
  }

  /**
   * Get a variable from context
   * Supports dot notation for nested access: "user.name"
   */
  get(key: string): any {
    // Try current scope stack first (for loops/nested contexts)
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      const scope = this.scopeStack[i];
      if (scope.has(key)) {
        return this.resolveNestedPath(scope.get(key), key);
      }
    }

    // Try current context
    if (this.context.has(key)) {
      return this.resolveNestedPath(this.context.get(key), key);
    }

    // Try parent context
    if (this.parentContext) {
      return this.parentContext.get(key);
    }

    // Handle dot notation
    if (key.includes('.')) {
      return this.getNestedValue(key);
    }

    return undefined;
  }

  /**
   * Check if a variable exists
   */
  has(key: string): boolean {
    // Check scope stack
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      if (this.scopeStack[i].has(key)) {
        return true;
      }
    }

    // Check current context
    if (this.context.has(key)) {
      return true;
    }

    // Check parent
    if (this.parentContext) {
      return this.parentContext.has(key);
    }

    // Check for nested path
    if (key.includes('.')) {
      return this.getNestedValue(key) !== undefined;
    }

    return false;
  }

  /**
   * Delete a variable from context
   */
  delete(key: string): boolean {
    return this.context.delete(key);
  }

  /**
   * Get all variables as a plain object
   */
  getAll(): Record<string, any> {
    const result: Record<string, any> = {};

    // Start with parent context if exists
    if (this.parentContext) {
      Object.assign(result, this.parentContext.getAll());
    }

    // Add current context
    this.context.forEach((value, key) => {
      result[key] = value;
    });

    // Add scope stack
    this.scopeStack.forEach(scope => {
      scope.forEach((value, key) => {
        result[key] = value;
      });
    });

    return result;
  }

  /**
   * Clear all variables
   */
  clear(): void {
    this.context.clear();
    this.scopeStack.length = 0;
  }

  /**
   * Get the number of variables
   */
  size(): number {
    return this.context.size;
  }

  // ============================================================================
  // Scope Management (for loops and nested contexts)
  // ============================================================================

  /**
   * Push a new scope onto the stack
   */
  pushScope(variables: Record<string, any> = {}): void {
    this.scopeStack.push(new Map(Object.entries(variables)));
  }

  /**
   * Pop the current scope from the stack
   */
  popScope(): void {
    this.scopeStack.pop();
  }

  /**
   * Get current scope depth
   */
  getScopeDepth(): number {
    return this.scopeStack.length;
  }

  // ============================================================================
  // Template Resolution
  // ============================================================================

  /**
   * Resolve template string with variables
   * Supports:
   * - Simple: "Hello {{name}}"
   * - Nested: "User: {{user.name}}"
   * - Array access: "First item: {{items[0]}}"
   * - Default values: "Hello {{name|Guest}}"
   */
  resolve(template: string): string {
    if (typeof template !== 'string') {
      return String(template);
    }

    return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      const trimmed = expression.trim();
      
      // Check for default value syntax: {{variable|default}}
      if (trimmed.includes('|')) {
        const [varPath, defaultValue] = trimmed.split('|').map(s => s.trim());
        const value = this.evaluateExpression(varPath);
        return value !== undefined && value !== null ? String(value) : defaultValue;
      }

      // Regular variable resolution
      const value = this.evaluateExpression(trimmed);
      return value !== undefined && value !== null ? String(value) : match;
    });
  }

  /**
   * Resolve an object recursively, replacing all template strings
   */
  resolveObject<T>(obj: T): T {
    if (typeof obj === 'string') {
      return this.resolve(obj) as any;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveObject(item)) as any;
    }

    if (obj !== null && typeof obj === 'object') {
      const resolved: any = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveObject(value);
      }
      return resolved;
    }

    return obj;
  }

  /**
   * Check if a string contains template variables
   */
  hasTemplateVariables(str: string): boolean {
    return /\{\{[^}]+\}\}/.test(str);
  }

  /**
   * Extract all variable names from a template string
   */
  extractVariables(template: string): string[] {
    const matches = template.matchAll(/\{\{([^}]+)\}\}/g);
    const variables: string[] = [];

    for (const match of matches) {
      const expression = match[1].trim();
      
      // Handle default value syntax
      const varName = expression.includes('|') 
        ? expression.split('|')[0].trim() 
        : expression;
      
      // Extract base variable name (before dots or brackets)
      const baseName = varName.split(/[.\[]/, 1)[0];
      
      if (!variables.includes(baseName)) {
        variables.push(baseName);
      }
    }

    return variables;
  }

  // ============================================================================
  // Expression Evaluation
  // ============================================================================

  /**
   * Evaluate an expression (variable path)
   * Supports: user.name, items[0], user.addresses[0].city
   */
  private evaluateExpression(expression: string): any {
    try {
      // Handle array access: items[0]
      if (expression.includes('[')) {
        return this.evaluateArrayAccess(expression);
      }

      // Handle dot notation: user.name
      if (expression.includes('.')) {
        return this.getNestedValue(expression);
      }

      // Simple variable
      return this.get(expression);
    } catch (error) {
      console.warn(`Failed to evaluate expression: ${expression}`, error);
      return undefined;
    }
  }

  /**
   * Get nested value using dot notation
   */
  private getNestedValue(path: string): any {
    const parts = path.split('.');
    let value: any = this.get(parts[0]);

    for (let i = 1; i < parts.length; i++) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[parts[i]];
    }

    return value;
  }

  /**
   * Evaluate array access expressions
   */
  private evaluateArrayAccess(expression: string): any {
    // Parse: items[0] or user.addresses[0].city
    const parts = expression.split(/[\[\].]/).filter(p => p);
    let value: any = this.get(parts[0]);

    for (let i = 1; i < parts.length; i++) {
      if (value === null || value === undefined) {
        return undefined;
      }

      const part = parts[i];
      
      // Check if it's a number (array index)
      if (/^\d+$/.test(part)) {
        value = value[parseInt(part, 10)];
      } else {
        value = value[part];
      }
    }

    return value;
  }

  /**
   * Resolve nested path if the key contains dots
   */
  private resolveNestedPath(value: any, key: string): any {
    if (!key.includes('.')) {
      return value;
    }

    const parts = key.split('.');
    let result = value;

    for (let i = 1; i < parts.length; i++) {
      if (result === null || result === undefined) {
        return undefined;
      }
      result = result[parts[i]];
    }

    return result;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Create a child context (for nested flows or parallel execution)
   */
  createChild(initialContext: Record<string, any> = {}): ContextManager {
    return new ContextManager(initialContext, this);
  }

  /**
   * Merge another context into this one
   */
  merge(other: ContextManager | Record<string, any>): void {
    if (other instanceof ContextManager) {
      const otherData = other.getAll();
      Object.entries(otherData).forEach(([key, value]) => {
        this.set(key, value);
      });
    } else {
      Object.entries(other).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
  }

  /**
   * Clone the current context
   */
  clone(): ContextManager {
    const cloned = new ContextManager(this.getAll());
    
    // Clone scope stack
    this.scopeStack.forEach(scope => {
      const scopeObj: Record<string, any> = {};
      scope.forEach((value, key) => {
        scopeObj[key] = value;
      });
      cloned.pushScope(scopeObj);
    });

    return cloned;
  }

  /**
   * Export context as JSON
   */
  toJSON(): Record<string, any> {
    return this.getAll();
  }

  /**
   * Import context from JSON
   */
  fromJSON(json: Record<string, any>): void {
    this.clear();
    Object.entries(json).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * Debug: Get a string representation of the context
   */
  toString(): string {
    const data = this.getAll();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Validate that all required variables are present
   */
  validateRequired(requiredVars: string[]): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const varName of requiredVars) {
      if (!this.has(varName)) {
        missing.push(varName);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a context manager from an object
 */
export function createContext(initialContext: Record<string, any> = {}): ContextManager {
  return new ContextManager(initialContext);
}

/**
 * Resolve a template string with context
 */
export function resolveTemplate(template: string, context: Record<string, any>): string {
  const manager = new ContextManager(context);
  return manager.resolve(template);
}

/**
 * Extract variables from a template
 */
export function extractTemplateVariables(template: string): string[] {
  const manager = new ContextManager();
  return manager.extractVariables(template);
}

// Export types
export type { ContextManager as IContextManager };
