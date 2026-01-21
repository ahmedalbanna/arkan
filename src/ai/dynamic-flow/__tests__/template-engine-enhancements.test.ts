/**
 * Tests for Template Engine enhancements:
 * - Custom helper registration API
 * - Template caching (compile once, use many)
 * - Template versioning
 */

import { TemplateEngine } from '../template-engine';
import type { ExecutionContext } from '../context-manager';

describe('Template Engine - Enhanced Features', () => {
  let engine: TemplateEngine;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    engine = new TemplateEngine();
    mockContext = {
      id: 'ctx-1',
      traceId: 'trace-1',
      input: { name: 'John', age: 30 },
      config: {} as any,
      options: {},
      variables: new Map([['status', 'active']]),
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

  describe('Custom Helper Registration API', () => {
    it('should register a custom helper', () => {
      engine.registerHelper('reverse', (str: string) => {
        return str.split('').reverse().join('');
      });

      expect(engine.hasHelper('reverse')).toBe(true);
    });

    it('should use registered custom helper in templates', () => {
      engine.registerHelper('double', (num: number) => num * 2);

      const template = 'Age doubled: {{double input.age}}';
      const result = engine.render(template, mockContext);

      expect(result).toBe('Age doubled: 60');
    });

    it('should unregister a custom helper', () => {
      engine.registerHelper('test', () => 'test');
      expect(engine.hasHelper('test')).toBe(true);

      const removed = engine.unregisterHelper('test');
      expect(removed).toBe(true);
      expect(engine.hasHelper('test')).toBe(false);
    });

    it('should return false when unregistering non-existent helper', () => {
      const removed = engine.unregisterHelper('nonExistent');
      expect(removed).toBe(false);
    });

    it('should get all custom helpers', () => {
      engine.registerHelper('helper1', () => 'test1');
      engine.registerHelper('helper2', () => 'test2');
      engine.registerHelper('helper3', () => 'test3');

      const helpers = engine.getCustomHelpers();
      expect(helpers).toContain('helper1');
      expect(helpers).toContain('helper2');
      expect(helpers).toContain('helper3');
      expect(helpers.length).toBeGreaterThanOrEqual(3);
    });

    it('should register helper with complex logic', () => {
      engine.registerHelper('formatCurrency', (amount: number) => {
        return `$${amount.toFixed(2)}`;
      });

      mockContext.input.price = 99.99;
      const template = 'Price: {{formatCurrency input.price}}';
      const result = engine.render(template, mockContext);

      expect(result).toBe('Price: $99.99');
    });

    it('should register helper with multiple arguments', () => {
      engine.registerHelper('range', (start: number, end: number) => {
        const result = [];
        for (let i = start; i <= end; i++) {
          result.push(i);
        }
        return result.join(', ');
      });

      const template = 'Numbers: {{range 1 5}}';
      const result = engine.render(template, mockContext);

      expect(result).toBe('Numbers: 1, 2, 3, 4, 5');
    });
  });

  describe('Template Caching', () => {
    it('should cache compiled templates by default', () => {
      const template = 'Hello {{input.name}}!';

      // First render
      const result1 = engine.render(template, mockContext);
      const stats1 = engine.getCacheStats();

      // Second render (should use cache)
      const result2 = engine.render(template, mockContext);
      const stats2 = engine.getCacheStats();

      expect(result1).toBe('Hello John!');
      expect(result2).toBe('Hello John!');
      expect(stats2.totalHits).toBe(1); // One cache hit
    });

    it('should not cache when useCache is false', () => {
      const template = 'Hello {{input.name}}!';

      const result1 = engine.render(template, mockContext, false);
      const result2 = engine.render(template, mockContext, false);

      const stats = engine.getCacheStats();
      expect(stats.totalHits).toBe(0); // No cache hits
    });

    it('should generate same hash for identical templates', () => {
      const template1 = 'Hello {{name}}';
      const template2 = 'Hello {{name}}';

      engine.render(template1, mockContext);
      engine.render(template2, mockContext);

      const stats = engine.getCacheStats();
      expect(stats.size).toBe(1); // Only one cached template
      expect(stats.totalHits).toBe(1); // One cache hit
    });

    it('should generate different hash for different templates', () => {
      const template1 = 'Hello {{name}}';
      const template2 = 'Goodbye {{name}}';

      engine.render(template1, mockContext);
      engine.render(template2, mockContext);

      const stats = engine.getCacheStats();
      expect(stats.size).toBe(2); // Two different cached templates
    });

    it('should track cache hit count', () => {
      const template = 'Test {{input.name}}';

      // Render multiple times
      engine.render(template, mockContext);
      engine.render(template, mockContext);
      engine.render(template, mockContext);
      engine.render(template, mockContext);

      const stats = engine.getCacheStats();
      expect(stats.totalHits).toBe(3); // First is miss, next 3 are hits
    });

    it('should clear cache', () => {
      const template = 'Hello {{input.name}}';

      engine.render(template, mockContext);
      let stats = engine.getCacheStats();
      expect(stats.size).toBe(1);

      engine.clearCache();
      stats = engine.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.totalHits).toBe(0);
    });

    it('should provide cache statistics', () => {
      const template1 = 'Template 1';
      const template2 = 'Template 2';

      engine.render(template1, mockContext);
      engine.render(template1, mockContext);
      engine.render(template2, mockContext);

      const stats = engine.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('totalHits');
      expect(stats).toHaveProperty('avgHitsPerTemplate');
      expect(stats.size).toBe(2);
      expect(stats.totalHits).toBe(1);
      expect(stats.avgHitsPerTemplate).toBe(0.5);
    });
  });

  describe('Template Versioning', () => {
    it('should save template version', () => {
      const template = 'Hello {{name}}';
      const version = engine.saveTemplateVersion('greeting', template, {
        author: 'John',
        changelog: 'Initial version',
      });

      expect(version.version).toBe(1);
      expect(version.template).toBe(template);
      expect(version.author).toBe('John');
      expect(version.changelog).toBe('Initial version');
      expect(version.hash).toBeDefined();
      expect(version.timestamp).toBeDefined();
    });

    it('should increment version numbers', () => {
      const v1 = engine.saveTemplateVersion('test', 'Version 1');
      const v2 = engine.saveTemplateVersion('test', 'Version 2');
      const v3 = engine.saveTemplateVersion('test', 'Version 3');

      expect(v1.version).toBe(1);
      expect(v2.version).toBe(2);
      expect(v3.version).toBe(3);
    });

    it('should get all versions of a template', () => {
      engine.saveTemplateVersion('doc', 'V1');
      engine.saveTemplateVersion('doc', 'V2');
      engine.saveTemplateVersion('doc', 'V3');

      const versions = engine.getTemplateVersions('doc');
      expect(versions).toHaveLength(3);
      expect(versions[0].template).toBe('V1');
      expect(versions[1].template).toBe('V2');
      expect(versions[2].template).toBe('V3');
    });

    it('should get specific version', () => {
      engine.saveTemplateVersion('test', 'V1');
      engine.saveTemplateVersion('test', 'V2');
      engine.saveTemplateVersion('test', 'V3');

      const v2 = engine.getTemplateVersion('test', 2);
      expect(v2).not.toBeNull();
      expect(v2?.version).toBe(2);
      expect(v2?.template).toBe('V2');
    });

    it('should return null for non-existent version', () => {
      engine.saveTemplateVersion('test', 'V1');

      const v999 = engine.getTemplateVersion('test', 999);
      expect(v999).toBeNull();
    });

    it('should get latest version', () => {
      engine.saveTemplateVersion('test', 'V1');
      engine.saveTemplateVersion('test', 'V2');
      engine.saveTemplateVersion('test', 'V3');

      const latest = engine.getLatestTemplateVersion('test');
      expect(latest).not.toBeNull();
      expect(latest?.version).toBe(3);
      expect(latest?.template).toBe('V3');
    });

    it('should compare two versions', () => {
      engine.saveTemplateVersion('test', 'Hello {{name}}', { author: 'Alice' });
      engine.saveTemplateVersion('test', 'Hi {{name}}!', { 
        author: 'Bob',
        changelog: 'Made it more casual'
      });

      const comparison = engine.compareTemplateVersions('test', 1, 2);
      expect(comparison.changes).toContain('Template content changed');
      expect(comparison.changes).toContain('Author changed: Alice → Bob');
      expect(comparison.changes).toContain('Changelog: Made it more casual');
      expect(comparison.v1).not.toBeNull();
      expect(comparison.v2).not.toBeNull();
    });

    it('should rollback to previous version', () => {
      engine.saveTemplateVersion('test', 'V1');
      engine.saveTemplateVersion('test', 'V2');
      engine.saveTemplateVersion('test', 'V3');

      const rollback = engine.rollbackTemplateVersion('test', 1);
      expect(rollback).not.toBeNull();
      expect(rollback?.version).toBe(4); // New version
      expect(rollback?.template).toBe('V1'); // Same content as V1
      expect(rollback?.changelog).toContain('Rolled back to version 1');
    });

    it('should delete template version history', () => {
      engine.saveTemplateVersion('test', 'V1');
      engine.saveTemplateVersion('test', 'V2');

      const deleted = engine.deleteTemplateVersions('test');
      expect(deleted).toBe(true);

      const versions = engine.getTemplateVersions('test');
      expect(versions).toHaveLength(0);
    });

    it('should get all template IDs', () => {
      engine.saveTemplateVersion('template1', 'T1');
      engine.saveTemplateVersion('template2', 'T2');
      engine.saveTemplateVersion('template3', 'T3');

      const ids = engine.getAllTemplateIds();
      expect(ids).toContain('template1');
      expect(ids).toContain('template2');
      expect(ids).toContain('template3');
      expect(ids.length).toBe(3);
    });

    it('should handle version metadata', () => {
      const version = engine.saveTemplateVersion('test', 'Content', {
        author: 'Jane Doe',
        changelog: 'Added new feature'
      });

      expect(version.author).toBe('Jane Doe');
      expect(version.changelog).toBe('Added new feature');
      expect(version.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Combined Features', () => {
    it('should cache templates with custom helpers', () => {
      engine.registerHelper('shout', (str: string) => str.toUpperCase() + '!!!');

      const template = '{{shout input.name}}';

      const result1 = engine.render(template, mockContext);
      const result2 = engine.render(template, mockContext);

      expect(result1).toBe('JOHN!!!');
      expect(result2).toBe('JOHN!!!');

      const stats = engine.getCacheStats();
      expect(stats.totalHits).toBe(1); // Second render used cache
    });

    it('should version templates and render specific versions', () => {
      const v1Template = 'Hello {{input.name}}';
      const v2Template = 'Greetings {{input.name}}!';

      engine.saveTemplateVersion('greeting', v1Template);
      engine.saveTemplateVersion('greeting', v2Template);

      // Render latest version
      const latest = engine.getLatestTemplateVersion('greeting');
      const resultLatest = engine.render(latest!.template, mockContext);
      expect(resultLatest).toBe('Greetings John!');

      // Render specific version
      const v1 = engine.getTemplateVersion('greeting', 1);
      const resultV1 = engine.render(v1!.template, mockContext);
      expect(resultV1).toBe('Hello John');
    });

    it('should track cache and versions separately', () => {
      const template = 'Test {{input.name}}';

      // Save as version
      engine.saveTemplateVersion('test', template);

      // Render (will cache)
      engine.render(template, mockContext);
      engine.render(template, mockContext);

      // Check both systems
      const versions = engine.getTemplateVersions('test');
      const cacheStats = engine.getCacheStats();

      expect(versions).toHaveLength(1);
      expect(cacheStats.size).toBeGreaterThan(0);
    });
  });

  describe('Code Quality', () => {
    it('should have all enhancements implemented', () => {
      const fs = require('fs');
      const code = fs.readFileSync('src/ai/dynamic-flow/template-engine.ts', 'utf8');

      // Custom helpers
      expect(code).toContain('registerHelper');
      expect(code).toContain('unregisterHelper');
      expect(code).toContain('getCustomHelpers');
      expect(code).toContain('hasHelper');

      // Caching
      expect(code).toContain('templateCache');
      expect(code).toContain('getCompiledTemplate');
      expect(code).toContain('clearCache');
      expect(code).toContain('getCacheStats');

      // Versioning
      expect(code).toContain('templateVersions');
      expect(code).toContain('saveTemplateVersion');
      expect(code).toContain('getTemplateVersions');
      expect(code).toContain('compareTemplateVersions');
      expect(code).toContain('rollbackTemplateVersion');
    });

    it('should have proper TypeScript types', () => {
      const fs = require('fs');
      const code = fs.readFileSync('src/ai/dynamic-flow/template-engine.ts', 'utf8');

      expect(code).toContain('interface TemplateVersion');
      expect(code).toContain('interface CompiledTemplate');
      expect(code).toContain('type HelperFunction');
      expect(code).toContain('interface HelperOptions');
    });
  });
});

describe('Template Engine - Feature Completeness', () => {
  it('should have all three enhancements implemented', () => {
    const fs = require('fs');
    const code = fs.readFileSync('src/ai/dynamic-flow/template-engine.ts', 'utf8');

    // Custom helper registration API
    const hasHelperAPI = code.includes('registerHelper') && 
                         code.includes('customHelpers');

    // Template caching
    const hasCaching = code.includes('templateCache') && 
                       code.includes('getCompiledTemplate');

    // Template versioning
    const hasVersioning = code.includes('templateVersions') && 
                          code.includes('saveTemplateVersion');

    expect(hasHelperAPI).toBe(true);
    expect(hasCaching).toBe(true);
    expect(hasVersioning).toBe(true);
  });
});
