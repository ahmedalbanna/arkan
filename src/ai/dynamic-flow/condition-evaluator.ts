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
    // Supports: comparisons, logical operators, property access, function calls, regex, array ops
    
    expression = expression.trim();

    // Handle logical operators (AND, OR)
    if (expression.includes('&&') || expression.includes('||')) {
      return this.parseLogicalExpression(expression);
    }

    // Handle array operations (in, includes)
    const inMatch = expression.match(/^(.+?)\s+(in|includes)\s+(.+)$/);
    if (inMatch) {
      return {
        type: 'arrayOp',
        operator: inMatch[2] as ArrayOperator,
        left: inMatch[1].trim(),
        right: inMatch[3].trim()
      };
    }

    // Handle regex matching (with optional flags)
    const regexMatch = expression.match(/^\/(.+?)\/([gimsuvy]*)\.test\((.+)\)$/);
    if (regexMatch) {
      return {
        type: 'regex',
        pattern: regexMatch[1],
        flags: regexMatch[2] || undefined,
        value: regexMatch[3].trim()
      };
    }

    // Handle function calls
    const functionMatch = expression.match(/^(\w+)\((.+)\)$/);
    if (functionMatch) {
      // Split args by comma, but respect nested structures
      const argsString = functionMatch[2];
      const args = this.splitFunctionArgs(argsString);
      return {
        type: 'function',
        name: functionMatch[1],
        args: args
      };
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
   * Split function arguments by comma, respecting quotes and nested structures
   */
  private splitFunctionArgs(argsString: string): string[] {
    const args: string[] = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];
      
      if ((char === '"' || char === "'") && argsString[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
        current += char;
      } else if (inString) {
        current += char;
      } else if (char === '(') {
        depth++;
        current += char;
      } else if (char === ')') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        args.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      args.push(current.trim());
    }

    return args;
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

      case 'arrayOp':
        return this.evaluateArrayOperation(parsed, scope);

      case 'regex':
        return this.evaluateRegex(parsed, scope);

      case 'function':
        return this.evaluateFunction(parsed, scope);

      case 'value':
        const value = this.resolveValue(parsed.value!, scope);
        return Boolean(value);

      default:
        return false;
    }
  }

  /**
   * Evaluate array operations (in, includes, some, every)
   */
  private evaluateArrayOperation(parsed: ParsedExpression, scope: Record<string, any>): boolean {
    const item = this.resolveValue(parsed.left!, scope);
    const array = this.resolveValue(parsed.right!, scope);

    if (!Array.isArray(array)) {
      return false;
    }

    switch (parsed.operator) {
      case 'in':
      case 'includes':
        return array.includes(item);
      default:
        return false;
    }
  }

  /**
   * Evaluate regex matching
   */
  private evaluateRegex(parsed: ParsedExpression, scope: Record<string, any>): boolean {
    try {
      const pattern = new RegExp(parsed.pattern!, parsed.flags);
      const value = String(this.resolveValue(parsed.value!, scope));
      return pattern.test(value);
    } catch (error) {
      console.error('Regex evaluation error:', error);
      return false;
    }
  }

  /**
   * Evaluate function calls
   */
  private evaluateFunction(parsed: ParsedExpression, scope: Record<string, any>): boolean {
    const funcName = parsed.name!;
    const args = parsed.args!.map(arg => this.resolveValue(arg, scope));

    switch (funcName) {
      case 'length':
        return typeof args[0] === 'string' || Array.isArray(args[0]) ? args[0].length > 0 : false;

      case 'contains':
        if (typeof args[0] === 'string' && args.length > 1) {
          return args[0].includes(String(args[1]));
        }
        if (Array.isArray(args[0]) && args.length > 1) {
          return args[0].includes(args[1]);
        }
        return false;

      case 'startsWith':
        return typeof args[0] === 'string' && args.length > 1 ? args[0].startsWith(String(args[1])) : false;

      case 'endsWith':
        return typeof args[0] === 'string' && args.length > 1 ? args[0].endsWith(String(args[1])) : false;

      case 'isEmpty':
        if (args[0] === null || args[0] === undefined) return true;
        if (typeof args[0] === 'string') return args[0].length === 0;
        if (Array.isArray(args[0])) return args[0].length === 0;
        if (typeof args[0] === 'object') return Object.keys(args[0]).length === 0;
        return false;

      case 'isNotEmpty':
        return !this.evaluateFunction({ ...parsed, name: 'isEmpty' }, scope);

      case 'some':
        // Array.some() - check if at least one element satisfies condition
        // Usage: some(array) where array elements are truthy/falsy
        return Array.isArray(args[0]) ? args[0].some(Boolean) : false;

      case 'every':
        // Array.every() - check if all elements satisfy condition
        // Usage: every(array) where array elements are truthy/falsy
        return Array.isArray(args[0]) ? args[0].every(Boolean) : false;

      default:
        console.warn(`Unknown function: ${funcName}`);
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
type ArrayOperator = 'in' | 'includes';

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
      type: 'arrayOp';
      operator: ArrayOperator;
      left: string;
      right: string;
    }
  | {
      type: 'regex';
      pattern: string;
      flags?: string;
      value: string;
    }
  | {
      type: 'function';
      name: string;
      args: string[];
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
