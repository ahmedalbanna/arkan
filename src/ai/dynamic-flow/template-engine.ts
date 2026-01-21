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
  private templateCache: Map<string, CompiledTemplate>;
  private customHelpers: Map<string, HelperFunction>;
  private templateVersions: Map<string, TemplateVersion[]>;

  constructor() {
    this.handlebars = Handlebars.create();
    this.templateCache = new Map();
    this.customHelpers = new Map();
    this.templateVersions = new Map();
    this.registerHelpers();
  }

  /**
   * Render template with context variables (with caching)
   */
  render(template: string, context: ExecutionContext, useCache: boolean = true): string {
    try {
      const compiled = useCache ? this.getCompiledTemplate(template) : this.handlebars.compile(template);
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
   * Get or compile template with caching
   */
  private getCompiledTemplate(template: string): HandlebarsTemplateDelegate {
    const hash = this.hashTemplate(template);
    
    // Check cache
    const cached = this.templateCache.get(hash);
    if (cached) {
      cached.hitCount++;
      return cached.compiled;
    }

    // Compile and cache
    const compiled = this.handlebars.compile(template);
    this.templateCache.set(hash, {
      compiled,
      hash,
      timestamp: Date.now(),
      hitCount: 0,
    });

    return compiled;
  }

  /**
   * Generate hash for template (for caching)
   */
  private hashTemplate(template: string): string {
    // Simple hash function (for production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < template.length; i++) {
      const char = template.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    let totalHits = 0;
    for (const entry of this.templateCache.values()) {
      totalHits += entry.hitCount;
    }

    return {
      size: this.templateCache.size,
      totalHits,
      avgHitsPerTemplate: this.templateCache.size > 0 ? totalHits / this.templateCache.size : 0,
    };
  }

  /**
   * Register a custom helper
   */
  registerHelper(name: string, fn: HelperFunction, options?: HelperOptions): void {
    // Store in custom helpers map
    this.customHelpers.set(name, fn);
    
    // Register with Handlebars
    this.handlebars.registerHelper(name, fn);
  }

  /**
   * Unregister a custom helper
   */
  unregisterHelper(name: string): boolean {
    if (this.customHelpers.has(name)) {
      this.customHelpers.delete(name);
      this.handlebars.unregisterHelper(name);
      return true;
    }
    return false;
  }

  /**
   * Get all registered custom helpers
   */
  getCustomHelpers(): string[] {
    return Array.from(this.customHelpers.keys());
  }

  /**
   * Check if helper exists
   */
  hasHelper(name: string): boolean {
    return this.customHelpers.has(name);
  }

  /**
   * Save template version
   */
  saveTemplateVersion(
    templateId: string,
    template: string,
    metadata?: { author?: string; changelog?: string }
  ): TemplateVersion {
    const versions = this.templateVersions.get(templateId) || [];
    const version: TemplateVersion = {
      version: versions.length + 1,
      template,
      timestamp: Date.now(),
      hash: this.hashTemplate(template),
      author: metadata?.author,
      changelog: metadata?.changelog,
    };

    versions.push(version);
    this.templateVersions.set(templateId, versions);

    return version;
  }

  /**
   * Get template version history
   */
  getTemplateVersions(templateId: string): TemplateVersion[] {
    return this.templateVersions.get(templateId) || [];
  }

  /**
   * Get specific template version
   */
  getTemplateVersion(templateId: string, version: number): TemplateVersion | null {
    const versions = this.templateVersions.get(templateId);
    if (!versions) return null;

    return versions.find(v => v.version === version) || null;
  }

  /**
   * Get latest template version
   */
  getLatestTemplateVersion(templateId: string): TemplateVersion | null {
    const versions = this.templateVersions.get(templateId);
    if (!versions || versions.length === 0) return null;

    return versions[versions.length - 1];
  }

  /**
   * Compare two template versions
   */
  compareTemplateVersions(
    templateId: string,
    version1: number,
    version2: number
  ): { changes: string[]; v1: TemplateVersion | null; v2: TemplateVersion | null } {
    const v1 = this.getTemplateVersion(templateId, version1);
    const v2 = this.getTemplateVersion(templateId, version2);

    const changes: string[] = [];

    if (!v1 || !v2) {
      return { changes: ['One or both versions not found'], v1, v2 };
    }

    if (v1.hash !== v2.hash) {
      changes.push('Template content changed');
    }

    if (v1.author !== v2.author) {
      changes.push(`Author changed: ${v1.author} → ${v2.author}`);
    }

    if (v2.changelog) {
      changes.push(`Changelog: ${v2.changelog}`);
    }

    return { changes, v1, v2 };
  }

  /**
   * Rollback to previous version
   */
  rollbackTemplateVersion(templateId: string, targetVersion: number): TemplateVersion | null {
    const version = this.getTemplateVersion(templateId, targetVersion);
    if (!version) return null;

    // Save as new version with rollback note
    return this.saveTemplateVersion(templateId, version.template, {
      author: 'system',
      changelog: `Rolled back to version ${targetVersion}`,
    });
  }

  /**
   * Delete template version history
   */
  deleteTemplateVersions(templateId: string): boolean {
    return this.templateVersions.delete(templateId);
  }

  /**
   * Get all template IDs with versions
   */
  getAllTemplateIds(): string[] {
    return Array.from(this.templateVersions.keys());
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

/**
 * Template version information
 */
export interface TemplateVersion {
  version: number;
  template: string;
  timestamp: number;
  hash: string;
  author?: string;
  changelog?: string;
}

/**
 * Compiled template with metadata
 */
export interface CompiledTemplate {
  compiled: HandlebarsTemplateDelegate;
  hash: string;
  timestamp: number;
  version?: number;
  hitCount: number;
}

/**
 * Custom helper function type
 */
export type HelperFunction = (...args: any[]) => any;

/**
 * Helper registration options
 */
export interface HelperOptions {
  description?: string;
  async?: boolean;
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
