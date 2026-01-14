/**
 * Template Engine for Dynamic Flows
 * Week 1 - Day 3: Template Engine
 * 
 * Handles dynamic prompt rendering with variable substitution using Handlebars-style syntax.
 * Supports conditionals, loops, and custom helper functions.
 */

import Handlebars from 'handlebars';
import type { ExecutionContext } from './context-manager';

// ============================================================================
// Template Engine Class
// ============================================================================

export class TemplateEngine {
  private handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerHelpers();
  }

  /**
   * Render template with context variables
   */
  render(template: string, context: ExecutionContext): string {
    try {
      const compiled = this.handlebars.compile(template);
      const variables = this.buildVariableObject(context);
      return compiled(variables);
    } catch (error) {
      throw new TemplateRenderError(
        `Failed to render template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { template, error }
      );
    }
  }

  /**
   * Validate template syntax
   */
  validate(template: string): ValidationResult {
    try {
      this.handlebars.compile(template);
      return { valid: true, errors: [] };
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Extract variable names from template
   */
  extractVariables(template: string): string[] {
    const variables = new Set<string>();
    
    try {
      const ast = Handlebars.parse(template);
      this.walkAST(ast, (node: any) => {
        if (node.type === 'PathExpression') {
          variables.add(node.original);
        }
      });
    } catch (error) {
      console.error('Failed to extract variables:', error);
    }

    return Array.from(variables);
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHelpers(): void {
    // String helpers
    this.handlebars.registerHelper('uppercase', (str: string) => 
      str ? str.toUpperCase() : ''
    );
    
    this.handlebars.registerHelper('lowercase', (str: string) => 
      str ? str.toLowerCase() : ''
    );
    
    this.handlebars.registerHelper('truncate', (str: string, length: number) => 
      str && str.length > length ? str.substring(0, length) + '...' : str
    );

    this.handlebars.registerHelper('capitalize', (str: string) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
    );

    // Array helpers
    this.handlebars.registerHelper('join', (arr: any[], separator: string) => 
      Array.isArray(arr) ? arr.join(separator || ', ') : ''
    );
    
    this.handlebars.registerHelper('first', (arr: any[]) => 
      Array.isArray(arr) && arr.length > 0 ? arr[0] : null
    );
    
    this.handlebars.registerHelper('last', (arr: any[]) => 
      Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : null
    );

    this.handlebars.registerHelper('length', (arr: any[]) =>
      Array.isArray(arr) ? arr.length : 0
    );

    // Conditional helpers
    this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    this.handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
    this.handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    this.handlebars.registerHelper('lt', (a: number, b: number) => a < b);
    this.handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
    this.handlebars.registerHelper('lte', (a: number, b: number) => a <= b);
    this.handlebars.registerHelper('and', (...args: any[]) => {
      // Remove Handlebars options object
      args.pop();
      return args.every(Boolean);
    });
    this.handlebars.registerHelper('or', (...args: any[]) => {
      // Remove Handlebars options object
      args.pop();
      return args.some(Boolean);
    });
    this.handlebars.registerHelper('not', (value: any) => !value);

    // Number helpers
    this.handlebars.registerHelper('add', (a: number, b: number) => a + b);
    this.handlebars.registerHelper('subtract', (a: number, b: number) => a - b);
    this.handlebars.registerHelper('multiply', (a: number, b: number) => a * b);
    this.handlebars.registerHelper('divide', (a: number, b: number) => b !== 0 ? a / b : 0);
    this.handlebars.registerHelper('round', (num: number, decimals: number = 0) => 
      Number(num.toFixed(decimals))
    );

    // Date helpers
    this.handlebars.registerHelper('formatDate', (date: Date | string, format: string = 'YYYY-MM-DD') => {
      try {
        const d = typeof date === 'string' ? new Date(date) : date;
        // Simple date formatting (in production, use date-fns or similar)
        return d.toISOString().split('T')[0];
      } catch {
        return '';
      }
    });

    // JSON helpers
    this.handlebars.registerHelper('json', (obj: any, pretty: boolean = false) => {
      try {
        return JSON.stringify(obj, null, pretty ? 2 : 0);
      } catch {
        return '';
      }
    });

    // Default value helper
    this.handlebars.registerHelper('default', (value: any, defaultValue: any) =>
      value !== null && value !== undefined ? value : defaultValue
    );
  }

  /**
   * Build variable object from execution context
   */
  private buildVariableObject(context: ExecutionContext): Record<string, any> {
    const variables: Record<string, any> = {
      input: context.input,
      ...Object.fromEntries(context.variables)
    };

    // Add step results
    for (const [stepId, result] of context.stepResults) {
      variables[stepId] = result.output;
    }

    // Add metadata
    variables.context = {
      stepCount: context.stepResults.size,
      duration: Date.now() - context.startTime,
      traceId: context.traceId
    };

    return variables;
  }

  /**
   * Walk AST and execute callback for each node
   */
  private walkAST(node: any, callback: (node: any) => void): void {
    if (!node) return;

    callback(node);

    if (node.body) {
      if (Array.isArray(node.body)) {
        node.body.forEach((child: any) => this.walkAST(child, callback));
      } else {
        this.walkAST(node.body, callback);
      }
    }

    if (node.program) {
      this.walkAST(node.program, callback);
    }

    if (node.inverse) {
      this.walkAST(node.inverse, callback);
    }

    if (node.params) {
      node.params.forEach((param: any) => this.walkAST(param, callback));
    }

    if (node.hash) {
      Object.values(node.hash.pairs || {}).forEach((pair: any) => {
        this.walkAST(pair.value, callback);
      });
    }
  }
}

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================================================
// Custom Errors
// ============================================================================

export class TemplateRenderError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TemplateRenderError';
  }
}
