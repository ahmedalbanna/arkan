/**
 * Context Manager Tests
 * Week 1 - Day 3-4: Testing Context Manager
 */

import { ContextManager, createContext, resolveTemplate, extractTemplateVariables } from '../context-manager';

describe('ContextManager', () => {
  describe('Basic Variable Management', () => {
    test('should set and get variables', () => {
      const ctx = new ContextManager();
      ctx.set('name', 'Ahmed');
      ctx.set('age', 25);
      
      expect(ctx.get('name')).toBe('Ahmed');
      expect(ctx.get('age')).toBe(25);
    });

    test('should check if variable exists', () => {
      const ctx = new ContextManager({ name: 'Ahmed' });
      
      expect(ctx.has('name')).toBe(true);
      expect(ctx.has('nonexistent')).toBe(false);
    });

    test('should delete variables', () => {
      const ctx = new ContextManager({ name: 'Ahmed' });
      
      expect(ctx.has('name')).toBe(true);
      ctx.delete('name');
      expect(ctx.has('name')).toBe(false);
    });

    test('should get all variables', () => {
      const ctx = new ContextManager({ name: 'Ahmed', age: 25 });
      
      const all = ctx.getAll();
      expect(all).toEqual({ name: 'Ahmed', age: 25 });
    });

    test('should clear all variables', () => {
      const ctx = new ContextManager({ name: 'Ahmed', age: 25 });
      
      ctx.clear();
      expect(ctx.size()).toBe(0);
    });

    test('should return correct size', () => {
      const ctx = new ContextManager({ name: 'Ahmed', age: 25 });
      
      expect(ctx.size()).toBe(2);
    });
  });

  describe('Nested Object Access', () => {
    test('should access nested properties with dot notation', () => {
      const ctx = new ContextManager({
        user: {
          name: 'Ahmed',
          address: {
            city: 'Cairo',
            country: 'Egypt'
          }
        }
      });

      expect(ctx.get('user.name')).toBe('Ahmed');
      expect(ctx.get('user.address.city')).toBe('Cairo');
      expect(ctx.get('user.address.country')).toBe('Egypt');
    });

    test('should return undefined for non-existent nested paths', () => {
      const ctx = new ContextManager({
        user: { name: 'Ahmed' }
      });

      expect(ctx.get('user.nonexistent')).toBeUndefined();
      expect(ctx.get('user.address.city')).toBeUndefined();
    });

    test('should handle array access', () => {
      const ctx = new ContextManager({
        items: ['apple', 'banana', 'orange']
      });

      expect(ctx.get('items[0]')).toBe('apple');
      expect(ctx.get('items[1]')).toBe('banana');
      expect(ctx.get('items[2]')).toBe('orange');
    });

    test('should handle nested array and object access', () => {
      const ctx = new ContextManager({
        users: [
          { name: 'Ahmed', age: 25 },
          { name: 'Sara', age: 30 }
        ]
      });

      expect(ctx.get('users[0].name')).toBe('Ahmed');
      expect(ctx.get('users[1].age')).toBe(30);
    });
  });

  describe('Scope Management', () => {
    test('should push and pop scopes', () => {
      const ctx = new ContextManager({ global: 'value' });
      
      ctx.pushScope({ local: 'scoped' });
      expect(ctx.get('local')).toBe('scoped');
      expect(ctx.get('global')).toBe('value');
      
      ctx.popScope();
      expect(ctx.get('local')).toBeUndefined();
      expect(ctx.get('global')).toBe('value');
    });

    test('should handle multiple scope levels', () => {
      const ctx = new ContextManager({ level0: 'base' });
      
      ctx.pushScope({ level1: 'first' });
      ctx.pushScope({ level2: 'second' });
      
      expect(ctx.get('level0')).toBe('base');
      expect(ctx.get('level1')).toBe('first');
      expect(ctx.get('level2')).toBe('second');
      expect(ctx.getScopeDepth()).toBe(2);
      
      ctx.popScope();
      expect(ctx.get('level2')).toBeUndefined();
      expect(ctx.getScopeDepth()).toBe(1);
    });

    test('should shadow variables in inner scopes', () => {
      const ctx = new ContextManager({ name: 'Global' });
      
      ctx.pushScope({ name: 'Local' });
      expect(ctx.get('name')).toBe('Local');
      
      ctx.popScope();
      expect(ctx.get('name')).toBe('Global');
    });
  });

  describe('Template Resolution', () => {
    test('should resolve simple templates', () => {
      const ctx = new ContextManager({ name: 'Ahmed', age: 25 });
      
      const result = ctx.resolve('Hello {{name}}, you are {{age}} years old');
      expect(result).toBe('Hello Ahmed, you are 25 years old');
    });

    test('should resolve nested property templates', () => {
      const ctx = new ContextManager({
        user: { name: 'Ahmed', city: 'Cairo' }
      });
      
      const result = ctx.resolve('{{user.name}} lives in {{user.city}}');
      expect(result).toBe('Ahmed lives in Cairo');
    });

    test('should resolve array access templates', () => {
      const ctx = new ContextManager({
        colors: ['red', 'green', 'blue']
      });
      
      const result = ctx.resolve('First: {{colors[0]}}, Second: {{colors[1]}}');
      expect(result).toBe('First: red, Second: green');
    });

    test('should handle default values', () => {
      const ctx = new ContextManager({ name: 'Ahmed' });
      
      const result = ctx.resolve('Hello {{name|Guest}}, City: {{city|Unknown}}');
      expect(result).toBe('Hello Ahmed, City: Unknown');
    });

    test('should leave unresolved variables as-is', () => {
      const ctx = new ContextManager({});
      
      const result = ctx.resolve('Hello {{name}}');
      expect(result).toBe('Hello {{name}}');
    });

    test('should handle multiple variables in template', () => {
      const ctx = new ContextManager({
        firstName: 'Ahmed',
        lastName: 'Ali',
        title: 'Dr.'
      });
      
      const result = ctx.resolve('{{title}} {{firstName}} {{lastName}}');
      expect(result).toBe('Dr. Ahmed Ali');
    });
  });

  describe('Object Resolution', () => {
    test('should resolve templates in objects', () => {
      const ctx = new ContextManager({ name: 'Ahmed', city: 'Cairo' });
      
      const obj = {
        greeting: 'Hello {{name}}',
        location: 'City: {{city}}'
      };
      
      const resolved = ctx.resolveObject(obj);
      expect(resolved).toEqual({
        greeting: 'Hello Ahmed',
        location: 'City: Cairo'
      });
    });

    test('should resolve templates in nested objects', () => {
      const ctx = new ContextManager({ name: 'Ahmed' });
      
      const obj = {
        user: {
          greeting: 'Hello {{name}}',
          nested: {
            message: 'Welcome {{name}}'
          }
        }
      };
      
      const resolved = ctx.resolveObject(obj);
      expect(resolved.user.greeting).toBe('Hello Ahmed');
      expect(resolved.user.nested.message).toBe('Welcome Ahmed');
    });

    test('should resolve templates in arrays', () => {
      const ctx = new ContextManager({ name: 'Ahmed' });
      
      const arr = ['Hello {{name}}', 'Welcome {{name}}'];
      
      const resolved = ctx.resolveObject(arr);
      expect(resolved).toEqual(['Hello Ahmed', 'Welcome Ahmed']);
    });
  });

  describe('Template Variable Detection', () => {
    test('should detect if string has template variables', () => {
      const ctx = new ContextManager();
      
      expect(ctx.hasTemplateVariables('Hello {{name}}')).toBe(true);
      expect(ctx.hasTemplateVariables('Hello world')).toBe(false);
    });

    test('should extract variable names from template', () => {
      const ctx = new ContextManager();
      
      const vars = ctx.extractVariables('Hello {{name}}, you are {{age}} years old');
      expect(vars).toEqual(['name', 'age']);
    });

    test('should extract base variable names from nested paths', () => {
      const ctx = new ContextManager();
      
      const vars = ctx.extractVariables('{{user.name}} lives in {{user.city}}');
      expect(vars).toEqual(['user']);
    });

    test('should not duplicate variable names', () => {
      const ctx = new ContextManager();
      
      const vars = ctx.extractVariables('{{name}} and {{name}} again');
      expect(vars).toEqual(['name']);
    });
  });

  describe('Parent-Child Contexts', () => {
    test('should access parent context variables', () => {
      const parent = new ContextManager({ parentVar: 'parent' });
      const child = parent.createChild({ childVar: 'child' });
      
      expect(child.get('childVar')).toBe('child');
      expect(child.get('parentVar')).toBe('parent');
    });

    test('should override parent variables', () => {
      const parent = new ContextManager({ name: 'Parent' });
      const child = parent.createChild({ name: 'Child' });
      
      expect(child.get('name')).toBe('Child');
      expect(parent.get('name')).toBe('Parent');
    });
  });

  describe('Utility Methods', () => {
    test('should merge contexts', () => {
      const ctx1 = new ContextManager({ a: 1, b: 2 });
      const ctx2 = new ContextManager({ b: 3, c: 4 });
      
      ctx1.merge(ctx2);
      
      expect(ctx1.get('a')).toBe(1);
      expect(ctx1.get('b')).toBe(3); // Overwritten
      expect(ctx1.get('c')).toBe(4);
    });

    test('should merge plain objects', () => {
      const ctx = new ContextManager({ a: 1 });
      
      ctx.merge({ b: 2, c: 3 });
      
      expect(ctx.getAll()).toEqual({ a: 1, b: 2, c: 3 });
    });

    test('should clone context', () => {
      const ctx = new ContextManager({ name: 'Ahmed', age: 25 });
      const cloned = ctx.clone();
      
      expect(cloned.getAll()).toEqual(ctx.getAll());
      
      // Modify clone, original should be unchanged
      cloned.set('name', 'Sara');
      expect(ctx.get('name')).toBe('Ahmed');
      expect(cloned.get('name')).toBe('Sara');
    });

    test('should export to JSON', () => {
      const ctx = new ContextManager({ name: 'Ahmed', age: 25 });
      const json = ctx.toJSON();
      
      expect(json).toEqual({ name: 'Ahmed', age: 25 });
    });

    test('should import from JSON', () => {
      const ctx = new ContextManager();
      ctx.fromJSON({ name: 'Ahmed', age: 25 });
      
      expect(ctx.get('name')).toBe('Ahmed');
      expect(ctx.get('age')).toBe(25);
    });

    test('should validate required variables', () => {
      const ctx = new ContextManager({ name: 'Ahmed', age: 25 });
      
      const result1 = ctx.validateRequired(['name', 'age']);
      expect(result1.valid).toBe(true);
      expect(result1.missing).toEqual([]);
      
      const result2 = ctx.validateRequired(['name', 'city']);
      expect(result2.valid).toBe(false);
      expect(result2.missing).toEqual(['city']);
    });
  });

  describe('Utility Functions', () => {
    test('createContext should create context manager', () => {
      const ctx = createContext({ name: 'Ahmed' });
      
      expect(ctx.get('name')).toBe('Ahmed');
    });

    test('resolveTemplate should resolve template with context', () => {
      const result = resolveTemplate('Hello {{name}}', { name: 'Ahmed' });
      
      expect(result).toBe('Hello Ahmed');
    });

    test('extractTemplateVariables should extract variables', () => {
      const vars = extractTemplateVariables('Hello {{name}}, age {{age}}');
      
      expect(vars).toEqual(['name', 'age']);
    });
  });
});
