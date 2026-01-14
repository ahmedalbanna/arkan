/**
 * Condition Evaluator for Dynamic Flows
 * Week 1 - Day 4: Condition Evaluator
 * 
 * Safely evaluates conditional expressions for branching logic in flows.
 * Uses a secure expression parser instead of eval() to prevent code injection.
 */

import type { ExecutionContext } from './context-manager';

// ============================================================================
// Condition Evaluator Class
// ============================================================================

export class ConditionEvaluator {
  /**
   * Evaluate a conditional expression against execution context
   * 
   * @param expression - The condition to evaluate (e.g., "input.userType === 'premium'")
   * @param context - The execution context
   * @returns boolean result of the evaluation
   */
  evaluate(expression: string, context: ExecutionContext): boolean {
    try {
      // Sanitize the expression
      const sanitized = this.sanitizeExpression(expression);

      // Build safe variable scope
      const scope = this.buildScope(context);

      // Parse and evaluate the expression safely
      return this.safeEvaluate(sanitized, scope);
    } catch (error) {
      console.error('Condition evaluation failed:', error);
      throw new ConditionEvaluationError(
        `Failed to evaluate condition: ${expression}`,
        { expression, error }
      );
    }
  }

  /**
   * Validate that an expression is safe and well-formed
   */
  validate(expression: string): ValidationResult {
    const errors: string[] = [];

    // Check for empty expression
    if (!expression || expression.trim() === '') {
      errors.push('Expression cannot be empty');
      return { valid: false, errors };
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\(/i,
      /Function\(/i,
      /require\(/i,
      /import\s+/i,
      /__proto__/i,
      /constructor/i,
      /process\./i,
      /global\./i,
      /\bwindow\b/i,
      /\bdocument\b/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(expression)) {
        errors.push(`Expression contains potentially dangerous pattern: ${pattern}`);
      }
    }

    // Check for valid syntax (basic check)
    try {
      this.parseExpression(expression);
    } catch (error) {
      errors.push(`Invalid syntax: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize expression to prevent injection
   */
  private sanitizeExpression(expression: string): string {
    // Remove comments
    let sanitized = expression
      .replace(/\/\*[\s\S]*?\*\//g, '')  // Block comments
      .replace(/\/\/.*/g, '');            // Line comments

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Build safe scope object from context
   */
  private buildScope(context: ExecutionContext): Record<string, any> {
    const scope: Record<string, any> = {
      // Input variables
      input: context.input,
      
      // Context variables
      ...Object.fromEntries(context.variables),
      
      // Step results
      steps: Object.fromEntries(
        Array.from(context.stepResults.entries()).map(([id, result]) => [
          id,
          result.output
        ])
      ),
      
      // Metadata
      meta: {
        stepCount: context.stepResults.size,
        duration: Date.now() - context.startTime,
        traceId: context.traceId
      }
    };

    return scope;
  }

  /**
   * Safely evaluate expression without using eval()
   * Uses Function constructor with restricted scope
   */
  private safeEvaluate(expression: string, scope: Record<string, any>): boolean {
    // Parse the expression into tokens
    const parsed = this.parseExpression(expression);
    
    // Evaluate the parsed expression
    return this.evaluateParsedExpression(parsed, scope);
  }

  /**
   * Parse expression into evaluable structure
   */
  private parseExpression(expression: string): ParsedExpression {
    // Simple expression parser for common cases
    // Supports: comparisons, logical operators, property access
    
    expression = expression.trim();

    // Handle logical operators (AND, OR)
    if (expression.includes('&&') || expression.includes('||')) {
      return this.parseLogicalExpression(expression);
    }

    // Handle comparison operators
    const comparisonMatch = expression.match(/^(.+?)\s*(===|!==|==|!=|<=|>=|<|>)\s*(.+)$/);
    if (comparisonMatch) {
      return {
        type: 'comparison',
        left: comparisonMatch[1].trim(),
        operator: comparisonMatch[2] as ComparisonOperator,
        right: comparisonMatch[3].trim()
      };
    }

    // Handle negation
    if (expression.startsWith('!')) {
      return {
        type: 'negation',
        expression: this.parseExpression(expression.substring(1).trim())
      };
    }

    // Simple variable or value
    return {
      type: 'value',
      value: expression
    };
  }

  /**
   * Parse logical expression (AND/OR)
   */
  private parseLogicalExpression(expression: string): ParsedExpression {
    // Split by || first (lower precedence)
    const orParts = this.splitByOperator(expression, '||');
    if (orParts.length > 1) {
      return {
        type: 'logical',
        operator: '||',
        operands: orParts.map(part => this.parseExpression(part))
      };
    }

    // Split by && (higher precedence)
    const andParts = this.splitByOperator(expression, '&&');
    if (andParts.length > 1) {
      return {
        type: 'logical',
        operator: '&&',
        operands: andParts.map(part => this.parseExpression(part))
      };
    }

    return this.parseExpression(expression);
  }

  /**
   * Split expression by operator, respecting parentheses
   */
  private splitByOperator(expression: string, operator: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    let i = 0;

    while (i < expression.length) {
      const char = expression[i];
      
      if (char === '(') {
        depth++;
        current += char;
      } else if (char === ')') {
        depth--;
        current += char;
      } else if (depth === 0 && expression.substring(i, i + operator.length) === operator) {
        parts.push(current.trim());
        current = '';
        i += operator.length - 1;
      } else {
        current += char;
      }
      
      i++;
    }

    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts.length > 1 ? parts : [expression];
  }

  /**
   * Evaluate parsed expression
   */
  private evaluateParsedExpression(parsed: ParsedExpression, scope: Record<string, any>): boolean {
    switch (parsed.type) {
      case 'comparison':
        const left = this.resolveValue(parsed.left!, scope);
        const right = this.resolveValue(parsed.right!, scope);
        return this.compareValues(left, right, parsed.operator!);

      case 'logical':
        if (parsed.operator === '&&') {
          return parsed.operands!.every(op => this.evaluateParsedExpression(op, scope));
        } else if (parsed.operator === '||') {
          return parsed.operands!.some(op => this.evaluateParsedExpression(op, scope));
        }
        return false;

      case 'negation':
        return !this.evaluateParsedExpression(parsed.expression!, scope);

      case 'value':
        const value = this.resolveValue(parsed.value!, scope);
        return Boolean(value);

      default:
        return false;
    }
  }

  /**
   * Resolve a value from scope or parse as literal
   */
  private resolveValue(value: string, scope: Record<string, any>): any {
    value = value.trim();

    // Handle parentheses
    if (value.startsWith('(') && value.endsWith(')')) {
      value = value.substring(1, value.length - 1).trim();
    }

    // Boolean literals
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Null/undefined
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;

    // Number literals
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return parseFloat(value);
    }

    // String literals (single or double quotes)
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.substring(1, value.length - 1);
    }

    // Property access (e.g., input.userType or steps.step1.result)
    const parts = value.split('.');
    let current: any = scope;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Compare two values using operator
   */
  private compareValues(left: any, right: any, operator: ComparisonOperator): boolean {
    switch (operator) {
      case '===': return left === right;
      case '!==': return left !== right;
      case '==': return left == right;
      case '!=': return left != right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      default: return false;
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

type ComparisonOperator = '===' | '!==' | '==' | '!=' | '<' | '>' | '<=' | '>=';
type LogicalOperator = '&&' | '||';

type ParsedExpression = 
  | {
      type: 'comparison';
      left: string;
      operator: ComparisonOperator;
      right: string;
    }
  | {
      type: 'logical';
      operator: LogicalOperator;
      operands: ParsedExpression[];
    }
  | {
      type: 'negation';
      expression: ParsedExpression;
    }
  | {
      type: 'value';
      value: string;
    };

// ============================================================================
// Custom Errors
// ============================================================================

export class ConditionEvaluationError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ConditionEvaluationError';
  }
}
