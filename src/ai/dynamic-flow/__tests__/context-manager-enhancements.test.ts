/**
 * Tests for Context Manager enhancements:
 * - Variable Immutability
 * - Variable Versioning/History
 * - Variable Type Constraints
 */

import { ContextManager } from '../context-manager';
import type { ExecutionContext, VariableConstraint } from '../context-manager';

describe('ContextManager - Enhanced Features', () => {
  let contextManager: ContextManager;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    contextManager = new ContextManager();
    mockContext = {
      id: 'ctx-1',
      traceId: 'trace-1',
      input: {},
      config: {} as any,
      options: {},
      variables: new Map(),
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
      immutableVariables: new Set(),
      variableHistory: new Map(),
      variableConstraints: new Map(),
    };
  });

  describe('Variable Immutability', () => {
    it('should allow setting an immutable variable', () => {
      contextManager.setVariable(mockContext, 'apiKey', 'secret123', { immutable: true });

      expect(mockContext.variables.get('apiKey')).toBe('secret123');
      expect(contextManager.isImmutable(mockContext, 'apiKey')).toBe(true);
    });

    it('should throw error when trying to modify immutable variable', () => {
      contextManager.setVariable(mockContext, 'userId', 'user123', { immutable: true });

      expect(() => {
        contextManager.setVariable(mockContext, 'userId', 'user456');
      }).toThrow('Cannot modify immutable variable: userId');
    });

    it('should allow setting multiple immutable variables', () => {
      contextManager.setVariable(mockContext, 'var1', 'value1', { immutable: true });
      contextManager.setVariable(mockContext, 'var2', 'value2', { immutable: true });

      expect(contextManager.isImmutable(mockContext, 'var1')).toBe(true);
      expect(contextManager.isImmutable(mockContext, 'var2')).toBe(true);
    });

    it('should use setImmutableVariable helper method', () => {
      contextManager.setImmutableVariable(mockContext, 'constant', 42);

      expect(mockContext.variables.get('constant')).toBe(42);
      expect(contextManager.isImmutable(mockContext, 'constant')).toBe(true);

      expect(() => {
        contextManager.setVariable(mockContext, 'constant', 100);
      }).toThrow();
    });

    it('should not mark regular variables as immutable', () => {
      contextManager.setVariable(mockContext, 'mutableVar', 'value');

      expect(contextManager.isImmutable(mockContext, 'mutableVar')).toBe(false);
      
      // Should allow modification
      contextManager.setVariable(mockContext, 'mutableVar', 'newValue');
      expect(mockContext.variables.get('mutableVar')).toBe('newValue');
    });
  });

  describe('Variable History Tracking', () => {
    it('should track variable history by default', () => {
      contextManager.setVariable(mockContext, 'counter', 1);
      contextManager.setVariable(mockContext, 'counter', 2);
      contextManager.setVariable(mockContext, 'counter', 3);

      const history = contextManager.getVariableHistory(mockContext, 'counter');

      expect(history).toHaveLength(3);
      expect(history[0].value).toBe(1);
      expect(history[0].operation).toBe('set');
      expect(history[1].value).toBe(2);
      expect(history[1].operation).toBe('update');
      expect(history[2].value).toBe(3);
      expect(history[2].operation).toBe('update');
    });

    it('should track operation source in history', () => {
      contextManager.setVariable(mockContext, 'data', 'initial', { source: 'step1' });
      contextManager.setVariable(mockContext, 'data', 'updated', { source: 'step2' });

      const history = contextManager.getVariableHistory(mockContext, 'data');

      expect(history[0].source).toBe('step1');
      expect(history[1].source).toBe('step2');
    });

    it('should get variable value at specific timestamp', () => {
      contextManager.setVariable(mockContext, 'status', 'pending');
      contextManager.setVariable(mockContext, 'status', 'processing');
      contextManager.setVariable(mockContext, 'status', 'completed');

      const history = contextManager.getVariableHistory(mockContext, 'status');
      
      expect(history).toHaveLength(3);
      expect(history[0].value).toBe('pending');
      expect(history[1].value).toBe('processing');
      expect(history[2].value).toBe('completed');
      
      // Test with future timestamp - should return last value
      const futureTime = Date.now() + 10000;
      const valueInFuture = contextManager.getVariableAtTime(
        mockContext,
        'status',
        futureTime
      );
      expect(valueInFuture).toBe('completed');
      
      // Test with very old timestamp - should return undefined
      const pastTime = history[0].timestamp - 1000;
      const valueInPast = contextManager.getVariableAtTime(
        mockContext,
        'status',
        pastTime
      );
      expect(valueInPast).toBeUndefined();
    });

    it('should track timestamp for each change', () => {
      const before = Date.now();
      contextManager.setVariable(mockContext, 'test', 'value');
      const after = Date.now();

      const history = contextManager.getVariableHistory(mockContext, 'test');

      expect(history[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(history[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('should get all variable changes', () => {
      contextManager.setVariable(mockContext, 'var1', 'value1');
      contextManager.setVariable(mockContext, 'var2', 'value2');
      contextManager.setVariable(mockContext, 'var1', 'value1-updated');

      const allChanges = contextManager.getAllVariableChanges(mockContext);

      expect(allChanges.size).toBe(2);
      expect(allChanges.get('var1')).toHaveLength(2);
      expect(allChanges.get('var2')).toHaveLength(1);
    });

    it('should deep clone values in history', () => {
      const obj = { nested: { value: 42 } };
      contextManager.setVariable(mockContext, 'object', obj);
      
      // Modify original object
      obj.nested.value = 100;

      const history = contextManager.getVariableHistory(mockContext, 'object');
      
      // History should have the original value
      expect(history[0].value.nested.value).toBe(42);
    });
  });

  describe('Variable Type Constraints', () => {
    it('should validate string type constraint', () => {
      const constraint: VariableConstraint = {
        type: 'string',
      };

      contextManager.setVariable(mockContext, 'name', 'John', { constraint });
      expect(mockContext.variables.get('name')).toBe('John');

      expect(() => {
        contextManager.setVariable(mockContext, 'name', 123);
      }).toThrow('must be of type "string" but got "number"');
    });

    it('should validate number type constraint', () => {
      const constraint: VariableConstraint = {
        type: 'number',
      };

      contextManager.setVariable(mockContext, 'age', 25, { constraint });
      expect(mockContext.variables.get('age')).toBe(25);

      expect(() => {
        contextManager.setVariable(mockContext, 'age', 'twenty-five');
      }).toThrow('must be of type "number" but got "string"');
    });

    it('should validate boolean type constraint', () => {
      const constraint: VariableConstraint = {
        type: 'boolean',
      };

      contextManager.setVariable(mockContext, 'isActive', true, { constraint });
      expect(mockContext.variables.get('isActive')).toBe(true);

      expect(() => {
        contextManager.setVariable(mockContext, 'isActive', 'true');
      }).toThrow('must be of type "boolean" but got "string"');
    });

    it('should validate array type constraint', () => {
      const constraint: VariableConstraint = {
        type: 'array',
      };

      contextManager.setVariable(mockContext, 'items', [1, 2, 3], { constraint });
      expect(mockContext.variables.get('items')).toEqual([1, 2, 3]);

      expect(() => {
        contextManager.setVariable(mockContext, 'items', 'not-an-array');
      }).toThrow('must be of type "array" but got "string"');
    });

    it('should validate object type constraint', () => {
      const constraint: VariableConstraint = {
        type: 'object',
      };

      contextManager.setVariable(mockContext, 'user', { name: 'John' }, { constraint });
      expect(mockContext.variables.get('user')).toEqual({ name: 'John' });

      expect(() => {
        contextManager.setVariable(mockContext, 'user', 'not-an-object');
      }).toThrow('must be of type "object" but got "string"');
    });

    it('should handle required constraint', () => {
      const constraint: VariableConstraint = {
        type: 'string',
        required: true,
      };

      expect(() => {
        contextManager.setVariable(mockContext, 'required', null, { constraint });
      }).toThrow('is required but got null');

      expect(() => {
        contextManager.setVariable(mockContext, 'required', undefined, { constraint });
      }).toThrow('is required but got undefined');
    });

    it('should use custom validator', () => {
      const constraint: VariableConstraint = {
        type: 'number',
        validator: (value: number) => value > 0 && value < 100,
        errorMessage: 'Value must be between 0 and 100',
      };

      contextManager.setVariable(mockContext, 'percentage', 50, { constraint });
      expect(mockContext.variables.get('percentage')).toBe(50);

      expect(() => {
        contextManager.setVariable(mockContext, 'percentage', 150);
      }).toThrow('failed custom validation');
      expect(() => {
        contextManager.setVariable(mockContext, 'percentage', 150);
      }).toThrow('must be between 0 and 100');
    });

    it('should set and get variable constraints', () => {
      const constraint: VariableConstraint = {
        type: 'string',
        required: true,
      };

      contextManager.setVariableConstraint(mockContext, 'username', constraint);

      const retrieved = contextManager.getVariableConstraint(mockContext, 'username');
      expect(retrieved).toEqual(constraint);
    });

    it('should validate existing value when setting constraint', () => {
      contextManager.setVariable(mockContext, 'count', 'not-a-number');

      expect(() => {
        contextManager.setVariableConstraint(mockContext, 'count', { type: 'number' });
      }).toThrow('must be of type "number" but got "string"');
    });

    it('should enforce constraint on subsequent updates', () => {
      contextManager.setVariable(mockContext, 'score', 100, {
        constraint: { type: 'number' },
      });

      // Constraint should be stored and enforced on next update
      expect(() => {
        contextManager.setVariable(mockContext, 'score', 'invalid');
      }).toThrow('must be of type "number"');
    });

    it('should allow any type with "any" constraint', () => {
      const constraint: VariableConstraint = {
        type: 'any',
      };

      contextManager.setVariable(mockContext, 'flexible', 'string', { constraint });
      contextManager.setVariable(mockContext, 'flexible', 123, { constraint });
      contextManager.setVariable(mockContext, 'flexible', true, { constraint });
      contextManager.setVariable(mockContext, 'flexible', [1, 2, 3], { constraint });

      // All should succeed
      expect(mockContext.variables.get('flexible')).toEqual([1, 2, 3]);
    });
  });

  describe('Combined Features', () => {
    it('should support immutable variables with type constraints', () => {
      contextManager.setVariable(mockContext, 'apiKey', 'sk-123456', {
        immutable: true,
        constraint: { type: 'string', required: true },
      });

      expect(mockContext.variables.get('apiKey')).toBe('sk-123456');
      expect(contextManager.isImmutable(mockContext, 'apiKey')).toBe(true);

      expect(() => {
        contextManager.setVariable(mockContext, 'apiKey', 'new-key');
      }).toThrow('Cannot modify immutable variable');
    });

    it('should track history with type constraints', () => {
      const constraint: VariableConstraint = {
        type: 'number',
        validator: (v) => v >= 0,
      };

      contextManager.setVariable(mockContext, 'balance', 0, { constraint });
      contextManager.setVariable(mockContext, 'balance', 100, { constraint });
      contextManager.setVariable(mockContext, 'balance', 250, { constraint });

      const history = contextManager.getVariableHistory(mockContext, 'balance');
      expect(history).toHaveLength(3);
      expect(history.map(h => h.value)).toEqual([0, 100, 250]);

      expect(() => {
        contextManager.setVariable(mockContext, 'balance', -50);
      }).toThrow('failed custom validation');
    });

    it('should include enhanced features in snapshot', () => {
      contextManager.setImmutableVariable(mockContext, 'id', 'user123');
      contextManager.setVariable(mockContext, 'status', 'active', {
        constraint: { type: 'string' },
      });

      const snapshot = contextManager.snapshot(mockContext);

      expect(snapshot.immutableVariables).toContain('id');
      expect(snapshot.variableConstraints).toHaveProperty('status');
      expect(snapshot.variableHistory).toHaveProperty('id');
      expect(snapshot.variableHistory).toHaveProperty('status');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined context features gracefully', () => {
      const minimalContext = {
        ...mockContext,
        immutableVariables: undefined,
        variableHistory: undefined,
        variableConstraints: undefined,
      };

      // Should not throw
      contextManager.setVariable(minimalContext, 'test', 'value');
      expect(minimalContext.variables.get('test')).toBe('value');
    });

    it('should return empty history for non-existent variable', () => {
      const history = contextManager.getVariableHistory(mockContext, 'nonExistent');
      expect(history).toEqual([]);
    });

    it('should return false for immutability check on non-existent variable', () => {
      expect(contextManager.isImmutable(mockContext, 'nonExistent')).toBe(false);
    });

    it('should return undefined for constraint on non-existent variable', () => {
      expect(contextManager.getVariableConstraint(mockContext, 'nonExistent')).toBeUndefined();
    });

    it('should handle null and undefined values with constraints', () => {
      const constraint: VariableConstraint = {
        type: 'string',
        required: false, // Not required
      };

      contextManager.setVariable(mockContext, 'optional', null, { constraint });
      expect(mockContext.variables.get('optional')).toBe(null);

      contextManager.setVariable(mockContext, 'optional', undefined, { constraint });
      expect(mockContext.variables.get('optional')).toBe(undefined);
    });
  });
});

describe('ContextManager - Enhanced Features Integration', () => {
  it('should have all three features implemented', () => {
    const fs = require('fs');
    const code = fs.readFileSync('src/ai/dynamic-flow/context-manager.ts', 'utf8');

    // Immutability
    expect(code).toContain('immutableVariables');
    expect(code).toContain('setImmutableVariable');
    expect(code).toContain('isImmutable');

    // History
    expect(code).toContain('variableHistory');
    expect(code).toContain('VariableHistoryEntry');
    expect(code).toContain('getVariableHistory');
    expect(code).toContain('getVariableAtTime');

    // Constraints
    expect(code).toContain('variableConstraints');
    expect(code).toContain('VariableConstraint');
    expect(code).toContain('setVariableConstraint');
    expect(code).toContain('validateConstraint');
  });
});
