/**
 * Condition Evaluator Tests
 */

import { ConditionEvaluator, ConditionEvaluationError } from '../condition-evaluator';
import { ContextManager } from '../context-manager';
import type { FlowConfiguration } from '../../../lib/models/flow-config';

describe('ConditionEvaluator', () => {
  let evaluator: ConditionEvaluator;
  let contextManager: ContextManager;
  let context: any;

  beforeEach(async () => {
    evaluator = new ConditionEvaluator();
    contextManager = new ContextManager();
    
    // Create a mock context
    context = await contextManager.initialize({
      input: {
        userType: 'premium',
        age: 25,
        name: 'John',
        items: ['a', 'b', 'c']
      },
      config: {} as FlowConfiguration,
      options: {},
      traceId: 'test_trace'
    });

    context.variables.set('isActive', true);
    context.variables.set('count', 10);
  });

  describe('evaluate', () => {
    describe('comparison operators', () => {
      it('should evaluate equality (===)', () => {
        expect(evaluator.evaluate('input.userType === "premium"', context)).toBe(true);
        expect(evaluator.evaluate('input.userType === "free"', context)).toBe(false);
      });

      it('should evaluate inequality (!==)', () => {
        expect(evaluator.evaluate('input.userType !== "free"', context)).toBe(true);
        expect(evaluator.evaluate('input.userType !== "premium"', context)).toBe(false);
      });

      it('should evaluate less than (<)', () => {
        expect(evaluator.evaluate('input.age < 30', context)).toBe(true);
        expect(evaluator.evaluate('input.age < 20', context)).toBe(false);
      });

      it('should evaluate greater than (>)', () => {
        expect(evaluator.evaluate('input.age > 20', context)).toBe(true);
        expect(evaluator.evaluate('input.age > 30', context)).toBe(false);
      });

      it('should evaluate less than or equal (<=)', () => {
        expect(evaluator.evaluate('input.age <= 25', context)).toBe(true);
        expect(evaluator.evaluate('input.age <= 24', context)).toBe(false);
      });

      it('should evaluate greater than or equal (>=)', () => {
        expect(evaluator.evaluate('input.age >= 25', context)).toBe(true);
        expect(evaluator.evaluate('input.age >= 26', context)).toBe(false);
      });
    });

    describe('logical operators', () => {
      it('should evaluate AND (&&)', () => {
        expect(evaluator.evaluate('input.age > 20 && input.userType === "premium"', context))
          .toBe(true);
        expect(evaluator.evaluate('input.age > 30 && input.userType === "premium"', context))
          .toBe(false);
      });

      it('should evaluate OR (||)', () => {
        expect(evaluator.evaluate('input.age > 30 || input.userType === "premium"', context))
          .toBe(true);
        expect(evaluator.evaluate('input.age > 30 || input.userType === "free"', context))
          .toBe(false);
      });

      it('should handle complex logical expressions', () => {
        const expr = '(input.age > 20 && input.userType === "premium") || input.name === "Admin"';
        expect(evaluator.evaluate(expr, context)).toBe(true);
      });
    });

    describe('negation', () => {
      it('should evaluate NOT (!)', () => {
        expect(evaluator.evaluate('!isActive', context)).toBe(false);
        context.variables.set('isActive', false);
        expect(evaluator.evaluate('!isActive', context)).toBe(true);
      });
    });

    describe('literal values', () => {
      it('should handle boolean literals', () => {
        expect(evaluator.evaluate('true', context)).toBe(true);
        expect(evaluator.evaluate('false', context)).toBe(false);
      });

      it('should handle number literals', () => {
        expect(evaluator.evaluate('count > 5', context)).toBe(true);
        expect(evaluator.evaluate('42 > 40', context)).toBe(true);
      });

      it('should handle string literals', () => {
        expect(evaluator.evaluate('input.name === "John"', context)).toBe(true);
        expect(evaluator.evaluate("input.name === 'John'", context)).toBe(true);
      });

      it('should handle null and undefined', () => {
        expect(evaluator.evaluate('input.missing === null', context)).toBe(false);
        expect(evaluator.evaluate('input.missing === undefined', context)).toBe(true);
      });
    });

    describe('property access', () => {
      it('should access nested properties', () => {
        expect(evaluator.evaluate('input.userType === "premium"', context)).toBe(true);
      });

      it('should access step results', () => {
        context.stepResults.set('step1', {
          status: 'success',
          output: { result: 'success' }
        });
        expect(evaluator.evaluate('steps.step1.result === "success"', context)).toBe(true);
      });
    });
  });

  describe('validate', () => {
    it('should validate correct expressions', () => {
      const result = evaluator.validate('input.age > 18');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty expressions', () => {
      const result = evaluator.validate('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expression cannot be empty');
    });

    it('should reject dangerous patterns', () => {
      const dangerousExpressions = [
        'eval("code")',
        'Function("code")',
        'require("module")',
        'import something',
        'obj.__proto__',
        'obj.constructor',
        'process.exit()',
      ];

      dangerousExpressions.forEach(expr => {
        const result = evaluator.validate(expr);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('error handling', () => {
    it('should throw ConditionEvaluationError on invalid expression', () => {
      expect(() => evaluator.evaluate('invalid expression with @#$', context))
        .toThrow(ConditionEvaluationError);
    });

    it('should handle missing variables gracefully', () => {
      const result = evaluator.evaluate('input.nonexistent === "value"', context);
      expect(result).toBe(false);
    });
  });
});
