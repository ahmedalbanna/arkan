/**
 * Context Manager
 * 
 * Manages data flow and variable context between flow steps.
 * Handles variable storage, retrieval, and template resolution.
 */

/**
 * Context Manager for managing step-to-step data flow
 */
export class ContextManager {
  private variables: Map<string, any> = new Map();
  private history: Array<{ stepId: string; stepName: string; data: any; timestamp: number }> = [];
  private readonly initialData: Record<string, any>;

  constructor(initialData: Record<string, any> = {}) {
    this.initialData = { ...initialData };
    
    // Initialize with input data
    for (const [key, value] of Object.entries(initialData)) {
      this.variables.set(key, value);
    }
  }

  /**
   * Update context from step output
   */
  updateFromStep(
    stepId: string,
    stepName: string,
    output: any,
    mapping?: Record<string, string>
  ): void {
    // Store in history
    this.history.push({
      stepId,
      stepName,
      data: output,
      timestamp: Date.now(),
    });

    if (mapping) {
      // Use custom mapping to extract data from output
      for (const [targetVar, sourceExpression] of Object.entries(mapping)) {
        const value = this.resolveExpression(sourceExpression, output);
        this.variables.set(targetVar, value);
      }
    } else {
      // Default behavior: merge output into context
      if (typeof output === 'object' && output !== null && !Array.isArray(output)) {
        // Merge object properties into context
        for (const [key, value] of Object.entries(output)) {
          this.variables.set(key, value);
        }
      } else {
        // Store primitive or array as 'lastResult'
        this.variables.set('lastResult', output);
      }
    }

    // Always store the raw step output with stepId prefix
    this.variables.set(`step_${stepId}_output`, output);
  }

  /**
   * Get variable value
   */
  get(key: string): any {
    return this.variables.get(key);
  }

  /**
   * Set variable value
   */
  set(key: string, value: any): void {
    this.variables.set(key, value);
  }

  /**
   * Check if variable exists
   */
  has(key: string): boolean {
    return this.variables.has(key);
  }

  /**
   * Delete variable
   */
  delete(key: string): boolean {
    return this.variables.delete(key);
  }

  /**
   * Get all variables as an object
   */
  getAllVariables(): Record<string, any> {
    return Object.fromEntries(this.variables);
  }

  /**
   * Get initial input data
   */
  getInitialData(): Record<string, any> {
    return { ...this.initialData };
  }

  /**
   * Resolve template string with variables
   * Supports {{variable}} syntax
   */
  resolve(template: string): string {
    if (typeof template !== 'string') {
      return String(template);
    }

    return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      const trimmed = expression.trim();
      
      // Handle nested property access: {{object.property}}
      if (trimmed.includes('.')) {
        const value = this.resolveExpression(trimmed);
        return value !== undefined ? String(value) : match;
      }
      
      // Simple variable lookup
      const value = this.get(trimmed);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Resolve expression from context (supports nested properties)
   * Example: "user.name" or "items[0].title"
   */
  resolveExpression(expression: string, data?: any): any {
    const source = data || this.getAllVariables();
    
    // Split by dots for nested property access
    const parts = expression.split('.');
    let current: any = source;

    for (const part of parts) {
      // Handle array indexing: items[0]
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      
      if (arrayMatch) {
        const [, arrayName, index] = arrayMatch;
        current = current?.[arrayName]?.[parseInt(index, 10)];
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
   * Get execution history
   */
  getHistory(): Array<{ stepId: string; stepName: string; data: any; timestamp: number }> {
    return [...this.history];
  }

  /**
   * Get history for specific step
   */
  getStepHistory(stepId: string): any | undefined {
    const entry = this.history.find(h => h.stepId === stepId);
    return entry?.data;
  }

  /**
   * Get final output from context
   * Attempts to extract meaningful output based on conventions
   */
  getFinalOutput(): Record<string, any> {
    const output: Record<string, any> = {};
    
    // Get all non-internal variables
    for (const [key, value] of this.variables.entries()) {
      // Skip step-specific outputs (internal bookkeeping)
      if (!key.startsWith('step_')) {
        output[key] = value;
      }
    }
    
    return output;
  }

  /**
   * Create a snapshot of current context state
   */
  snapshot(): Record<string, any> {
    return {
      variables: this.getAllVariables(),
      history: this.getHistory(),
      timestamp: Date.now(),
    };
  }

  /**
   * Restore context from snapshot
   */
  restore(snapshot: { variables: Record<string, any>; history: any[] }): void {
    this.variables.clear();
    
    for (const [key, value] of Object.entries(snapshot.variables)) {
      this.variables.set(key, value);
    }
    
    this.history = snapshot.history || [];
  }

  /**
   * Clear all variables (except initial data)
   */
  clear(): void {
    this.variables.clear();
    this.history = [];
    
    // Restore initial data
    for (const [key, value] of Object.entries(this.initialData)) {
      this.variables.set(key, value);
    }
  }

  /**
   * Clone the context manager
   */
  clone(): ContextManager {
    const cloned = new ContextManager(this.initialData);
    
    for (const [key, value] of this.variables.entries()) {
      cloned.set(key, this.deepClone(value));
    }
    
    cloned.history = this.history.map(h => ({ ...h, data: this.deepClone(h.data) }));
    
    return cloned;
  }

  /**
   * Deep clone a value
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
      const cloned = new Map();
      value.forEach((v, k) => cloned.set(k, this.deepClone(v)));
      return cloned;
    }
    
    if (value instanceof Set) {
      return new Set(Array.from(value).map(item => this.deepClone(item)));
    }
    
    // Plain object
    const cloned: any = {};
    for (const [key, val] of Object.entries(value)) {
      cloned[key] = this.deepClone(val);
    }
    return cloned;
  }

  /**
   * Merge another context into this one
   */
  merge(other: ContextManager): void {
    for (const [key, value] of other.variables.entries()) {
      this.variables.set(key, value);
    }
    
    this.history.push(...other.history);
  }

  /**
   * Get context size (for debugging/monitoring)
   */
  getSize(): { variableCount: number; historySize: number; approximateSizeKB: number } {
    const json = JSON.stringify(this.getAllVariables());
    const approximateSizeKB = new TextEncoder().encode(json).length / 1024;
    
    return {
      variableCount: this.variables.size,
      historySize: this.history.length,
      approximateSizeKB: Math.round(approximateSizeKB * 100) / 100,
    };
  }

  /**
   * Debug: Print context state
   */
  debug(): string {
    const vars = this.getAllVariables();
    const size = this.getSize();
    
    let output = '=== Context Manager Debug ===\n';
    output += `Variables: ${size.variableCount}\n`;
    output += `History: ${size.historySize} entries\n`;
    output += `Size: ${size.approximateSizeKB} KB\n\n`;
    
    output += 'Variables:\n';
    for (const [key, value] of Object.entries(vars)) {
      const valueStr = typeof value === 'object' 
        ? JSON.stringify(value).substring(0, 100) + '...'
        : String(value);
      output += `  ${key}: ${valueStr}\n`;
    }
    
    output += '\nHistory:\n';
    this.history.forEach((entry, index) => {
      output += `  ${index + 1}. ${entry.stepName} (${entry.stepId})\n`;
    });
    
    return output;
  }

  /**
   * Evaluate a simple condition expression
   * Returns true/false based on context variables
   */
  evaluateCondition(condition: string): boolean {
    try {
      // Get all variables for evaluation
      const vars = this.getAllVariables();
      
      // Create a safe evaluation context
      // Only allow basic comparisons, no function calls
      const safeCondition = condition
        .replace(/[^a-zA-Z0-9._\s<>=!&|()]/g, '') // Remove dangerous characters
        .trim();
      
      // Simple variable existence check
      if (!safeCondition.includes(' ')) {
        const value = this.resolveExpression(safeCondition);
        return Boolean(value);
      }
      
      // For complex conditions, use Function constructor with limited scope
      const varNames = Object.keys(vars);
      const varValues = Object.values(vars);
      
      try {
        const func = new Function(...varNames, `return (${safeCondition});`);
        return Boolean(func(...varValues));
      } catch {
        console.warn(`Failed to evaluate condition: ${condition}`);
        return false;
      }
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }
}

/**
 * Create a context manager with initial data
 */
export function createContextManager(initialData: Record<string, any> = {}): ContextManager {
  return new ContextManager(initialData);
}
