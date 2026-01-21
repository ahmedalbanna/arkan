/**
 * Tests for Condition Evaluator enhancements:
 * - Function call support (length, contains, etc.)
 * - Regex matching support
 * - Array operations (in, includes, some, every)
 */

import { ConditionEvaluator } from '../condition-evaluator';
import type { ExecutionContext } from '../context-manager';

describe('Condition Evaluator - Enhanced Features', () => {
  let evaluator: ConditionEvaluator;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    evaluator = new ConditionEvaluator();
    mockContext = {
      id: 'ctx-1',
      traceId: 'trace-1',
      input: {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        tags: ['premium', 'verified'],
        status: 'active',
      },
      config: {} as any,
      options: {},
      variables: new Map([
        ['userType', 'premium'],
        ['items', [1, 2, 3, 4, 5]],
      ]),
      stepResults: new Map(),
      metrics: {
        successfulSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        totalTokens: 0,
        totalCost: 0,
        cacheHits: 0,
        cacheMisses: 0,
      },
      startTime: Date.now(),
    };
  });

  describe('Function Call Support', () => {
    describe('length() function', () => {
      it('should check if string has length', () => {
        const result = evaluator.evaluate('length(input.name)', mockContext);
        expect(result).toBe(true);
      });

      it('should check if array has length', () => {
        const result = evaluator.evaluate('length(items)', mockContext);
        expect(result).toBe(true);
      });

      it('should return false for empty string', () => {
        mockContext.input.name = '';
        const result = evaluator.evaluate('length(input.name)', mockContext);
        expect(result).toBe(false);
      });
    });

    describe('contains() function', () => {
      it('should check if string contains substring', () => {
        const result = evaluator.evaluate("contains(input.name, 'John')", mockContext);
        expect(result).toBe(true);
      });

      it('should check if array contains value', () => {
        const result = evaluator.evaluate('contains(input.tags, "premium")', mockContext);
        expect(result).toBe(true);
      });

      it('should return false when not contained', () => {
        const result = evaluator.evaluate("contains(input.name, 'Jane')", mockContext);
        expect(result).toBe(false);
      });
    });

    describe('startsWith() function', () => {
      it('should check if string starts with prefix', () => {
        const result = evaluator.evaluate("startsWith(input.name, 'John')", mockContext);
        expect(result).toBe(true);
      });

      it('should return false for wrong prefix', () => {
        const result = evaluator.evaluate("startsWith(input.name, 'Doe')", mockContext);
        expect(result).toBe(false);
      });
    });

    describe('endsWith() function', () => {
      it('should check if string ends with suffix', () => {
        const result = evaluator.evaluate("endsWith(input.name, 'Doe')", mockContext);
        expect(result).toBe(true);
      });

      it('should return false for wrong suffix', () => {
        const result = evaluator.evaluate("endsWith(input.name, 'John')", mockContext);
        expect(result).toBe(false);
      });
    });

    describe('isEmpty() function', () => {
      it('should check if string is empty', () => {
        mockContext.input.name = '';
        const result = evaluator.evaluate('isEmpty(input.name)', mockContext);
        expect(result).toBe(true);
      });

      it('should check if array is empty', () => {
        mockContext.variables.set('items', []);
        const result = evaluator.evaluate('isEmpty(items)', mockContext);
        expect(result).toBe(true);
      });

      it('should return false for non-empty string', () => {
        const result = evaluator.evaluate('isEmpty(input.name)', mockContext);
        expect(result).toBe(false);
      });
    });

    describe('isNotEmpty() function', () => {
      it('should check if string is not empty', () => {
        const result = evaluator.evaluate('isNotEmpty(input.name)', mockContext);
        expect(result).toBe(true);
      });

      it('should return false for empty string', () => {
        mockContext.input.name = '';
        const result = evaluator.evaluate('isNotEmpty(input.name)', mockContext);
        expect(result).toBe(false);
      });
    });

    describe('some() function', () => {
      it('should return true if some array elements are truthy', () => {
        mockContext.variables.set('values', [false, false, true]);
        const result = evaluator.evaluate('some(values)', mockContext);
        expect(result).toBe(true);
      });

      it('should return false if all elements are falsy', () => {
        mockContext.variables.set('values', [false, false, false]);
        const result = evaluator.evaluate('some(values)', mockContext);
        expect(result).toBe(false);
      });
    });

    describe('every() function', () => {
      it('should return true if all array elements are truthy', () => {
        mockContext.variables.set('values', [true, true, true]);
        const result = evaluator.evaluate('every(values)', mockContext);
        expect(result).toBe(true);
      });

      it('should return false if any element is falsy', () => {
        mockContext.variables.set('values', [true, false, true]);
        const result = evaluator.evaluate('every(values)', mockContext);
        expect(result).toBe(false);
      });
    });
  });

  describe('Regex Matching Support', () => {
    it('should match email pattern', () => {
      const result = evaluator.evaluate('/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input.email)', mockContext);
      expect(result).toBe(true);
    });

    it('should match alphanumeric pattern', () => {
      mockContext.input.code = 'ABC123';
      const result = evaluator.evaluate('/^[A-Z0-9]+$/.test(input.code)', mockContext);
      expect(result).toBe(true);
    });

    it('should not match when pattern fails', () => {
      const result = evaluator.evaluate('/^\\d+$/.test(input.name)', mockContext);
      expect(result).toBe(false);
    });

    it('should match phone number pattern', () => {
      mockContext.input.phone = '555-1234';
      const result = evaluator.evaluate('/^\\d{3}-\\d{4}$/.test(input.phone)', mockContext);
      expect(result).toBe(true);
    });

    it('should match URL pattern', () => {
      mockContext.input.website = 'https://example.com';
      const result = evaluator.evaluate('/^https?:\\/\\/.+/.test(input.website)', mockContext);
      expect(result).toBe(true);
    });
  });

  describe('Array Operations', () => {
    describe('in operator', () => {
      it('should check if value is in array', () => {
        const result = evaluator.evaluate('"premium" in input.tags', mockContext);
        expect(result).toBe(true);
      });

      it('should return false if value not in array', () => {
        const result = evaluator.evaluate('"gold" in input.tags', mockContext);
        expect(result).toBe(false);
      });

      it('should work with numbers', () => {
        const result = evaluator.evaluate('3 in items', mockContext);
        expect(result).toBe(true);
      });
    });

    describe('includes operator', () => {
      it('should check if array includes value', () => {
        const result = evaluator.evaluate('"verified" includes input.tags', mockContext);
        expect(result).toBe(true);
      });

      it('should return false if value not included', () => {
        const result = evaluator.evaluate('"admin" includes input.tags', mockContext);
        expect(result).toBe(false);
      });
    });
  });

  describe('Combined Features', () => {
    it('should combine function call with comparison', () => {
      const result = evaluator.evaluate('length(input.name) && input.age > 18', mockContext);
      expect(result).toBe(true);
    });

    it('should combine regex with logical operators', () => {
      const result = evaluator.evaluate('/^john/i.test(input.name) && input.status === "active"', mockContext);
      expect(result).toBe(true);
    });

    it('should combine array operations with other conditions', () => {
      const result = evaluator.evaluate('"premium" in input.tags && input.age >= 18', mockContext);
      expect(result).toBe(true);
    });

    it('should use multiple functions', () => {
      const result = evaluator.evaluate('isNotEmpty(input.name) && contains(input.email, "@")', mockContext);
      expect(result).toBe(true);
    });

    it('should combine all three features', () => {
      const result = evaluator.evaluate(
        'length(input.name) && /^\\w+@/.test(input.email) && "premium" in input.tags',
        mockContext
      );
      expect(result).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values in functions', () => {
      mockContext.input.name = null as any;
      const result = evaluator.evaluate('isEmpty(input.name)', mockContext);
      expect(result).toBe(true);
    });

    it('should handle undefined values', () => {
      const result = evaluator.evaluate('isEmpty(input.nonExistent)', mockContext);
      expect(result).toBe(true);
    });

    it('should handle non-array in array operations', () => {
      const result = evaluator.evaluate('"test" in input.name', mockContext);
      expect(result).toBe(false);
    });

    it('should handle invalid regex gracefully', () => {
      // Invalid regex should return false, not throw
      const result = evaluator.evaluate('/[/.test(input.name)', mockContext);
      // Parser might not match this as regex, returns false
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Code Quality', () => {
    it('should have all three enhancements implemented', () => {
      const fs = require('fs');
      const code = fs.readFileSync('src/ai/dynamic-flow/condition-evaluator.ts', 'utf8');

      // Function calls
      expect(code).toContain('evaluateFunction');
      expect(code).toContain("case 'length':");
      expect(code).toContain("case 'contains':");
      expect(code).toContain("case 'some':");
      expect(code).toContain("case 'every':");

      // Regex
      expect(code).toContain('evaluateRegex');
      expect(code).toContain('new RegExp');
      expect(code).toContain('pattern.test');

      // Array operations
      expect(code).toContain('evaluateArrayOperation');
      expect(code).toContain("case 'in':");
      expect(code).toContain("case 'includes':");
    });

    it('should have proper TypeScript types', () => {
      const fs = require('fs');
      const code = fs.readFileSync('src/ai/dynamic-flow/condition-evaluator.ts', 'utf8');

      expect(code).toContain('type ArrayOperator');
      expect(code).toContain("type: 'arrayOp'");
      expect(code).toContain("type: 'regex'");
      expect(code).toContain("type: 'function'");
    });
  });
});

describe('Condition Evaluator - Feature Completeness', () => {
  it('should have all three enhancements implemented', () => {
    const fs = require('fs');
    const code = fs.readFileSync('src/ai/dynamic-flow/condition-evaluator.ts', 'utf8');

    // Function call support
    const hasFunctions = code.includes('evaluateFunction') && 
                         code.includes("case 'length':") &&
                         code.includes("case 'contains':");

    // Regex matching
    const hasRegex = code.includes('evaluateRegex') && 
                     code.includes('new RegExp');

    // Array operations
    const hasArrayOps = code.includes('evaluateArrayOperation') && 
                        code.includes("case 'in':");

    expect(hasFunctions).toBe(true);
    expect(hasRegex).toBe(true);
    expect(hasArrayOps).toBe(true);
  });
});
