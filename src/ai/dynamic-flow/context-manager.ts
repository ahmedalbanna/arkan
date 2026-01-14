/**
 * Context Manager
 * Week 1 - Day 3-4: Context Manager & Validator
 * 
 * Manages execution context, variable storage, and template resolution
 * for dynamic flow execution.
 */

/**
 * Context Manager class
 * Handles variable storage, retrieval, and template string resolution
 */
export class ContextManager {
  private context: Map<string, any>;
  private readonly parentContext?: ContextManager;
  private readonly scopeStack: Map<string, any>[];

  constructor(initialContext: Record<string, any> = {}, parent?: ContextManager) {
    this.context = new Map(Object.entries(initialContext));
    this.parentContext = parent;
    this.scopeStack = [];
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
