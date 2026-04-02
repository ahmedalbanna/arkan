/**
 * WritingToolRegistry Unit Tests
 *
 * NOTE: WritingToolRegistry throws if imported in the browser (typeof window !== 'undefined').
 * Jest runs in jsdom, so we must delete `window` before the module is loaded.
 */

// Remove `window` so the registry's browser-guard doesn't throw in jsdom
delete (global as any).window;

import 'reflect-metadata';

// ---------------------------------------------------------------------------
// Mock all Genkit flows with correct export names from flows/index.ts
// ---------------------------------------------------------------------------
jest.mock('@/modules/ai/infrastructure/flows', () => ({
  // writing
  paraphraseText: jest.fn(),
  summarizeText: jest.fn(),
  humanizeText: jest.fn(),
  grammarCheck: jest.fn(),
  manipulateText: jest.fn(),
  textStyleTune: jest.fn(),
  translateText: jest.fn(),
  writeDocument: jest.fn(),
  rewriteText: jest.fn(),
  summarizeTextWithRatio: jest.fn(),
  readabilityEnhancer: jest.fn(),
  concisenessChecker: jest.fn(),
  clarityAdvisor: jest.fn(),
  generateText: jest.fn(),
  // academic
  aiResearcher: jest.fn(),
  createLectureUnit: jest.fn(),
  generateCitation: jest.fn(),
  generateQuiz: jest.fn(),
  solveAssignments: jest.fn(),
  generateLiteratureReview: jest.fn(),
  generateTheoreticalLecture: jest.fn(),
  // generation
  generateIdeas: jest.fn(),
  generateProjectBlueprint: jest.fn(),
  generateReportSection: jest.fn(),
  generateSessionPlan: jest.fn(),
  generateUiDescription: jest.fn(),
  generateChapterContent: jest.fn(),
  generateToc: jest.fn(),
  topicExplainer: jest.fn(),
  generateImage: jest.fn(),
  generatePlantUML: jest.fn(),
  // analysis
  factCheckText: jest.fn(),
  plagiarismCheck: jest.fn(),
  sentenceStructureCheck: jest.fn(),
  detectAiContent: jest.fn(),
  checkBias: jest.fn(),
  // document
  summarizeDocument: jest.fn(),
  rewriteToMarkdown: jest.fn(),
  imageToText: jest.fn(),
}));

// Mock Genkit service to prevent server-only module loading
jest.mock('@/modules/ai/infrastructure/services/Genkit', () => ({
  ai: {
    defineFlow: jest.fn((_cfg: any, impl: any) => impl),
    definePrompt: jest.fn(() => jest.fn()),
  },
  MODEL_BY_TASK: {},
}));

import { WritingToolRegistry } from '../WritingToolRegistry';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WritingToolRegistry', () => {
  let registry: WritingToolRegistry;

  beforeEach(() => {
    registry = new WritingToolRegistry();
  });

  // ── getTool ────────────────────────────────────────────────────────────────

  describe('getTool', () => {
    it('returns a ToolConfig for "summarize"', () => {
      const config = registry.getTool('summarize');
      expect(config).toBeDefined();
      expect(config).toHaveProperty('flow');
      expect(config).toHaveProperty('schema');
      expect(config).toHaveProperty('creditCost');
    });

    it('returns a ToolConfig for the alias "summarizer"', () => {
      expect(registry.getTool('summarizer')).toBeDefined();
    });

    it('returns a ToolConfig for "paraphrase" with isFreeForGuests=true', () => {
      const config = registry.getTool('paraphrase');
      expect(config).toBeDefined();
      expect(config?.isFreeForGuests).toBe(true);
    });

    it('returns a ToolConfig for the alias "paraphraser"', () => {
      expect(registry.getTool('paraphraser')).toBeDefined();
    });

    it('returns a ToolConfig for "humanize"', () => {
      const config = registry.getTool('humanize');
      expect(config).toBeDefined();
      expect(config?.isFreeForGuests).toBe(true);
    });

    it('returns a ToolConfig for "grammar-checker" with creditCost=1', () => {
      const config = registry.getTool('grammar-checker');
      expect(config).toBeDefined();
      expect(config?.creditCost).toBe(1);
    });

    it('returns a ToolConfig for "translator"', () => {
      expect(registry.getTool('translator')).toBeDefined();
    });

    it('returns a ToolConfig for "write-document" with creditCost=2', () => {
      const config = registry.getTool('write-document');
      expect(config).toBeDefined();
      expect(config?.creditCost).toBe(2);
    });

    it('returns undefined for an unknown tool name', () => {
      expect(registry.getTool('nonexistent-tool')).toBeUndefined();
    });

    it('returns undefined for an empty string', () => {
      expect(registry.getTool('')).toBeUndefined();
    });

    it('is case-sensitive — uppercase does not match', () => {
      expect(registry.getTool('SUMMARIZE')).toBeUndefined();
    });
  });

  // ── getAllTools ────────────────────────────────────────────────────────────

  describe('getAllTools', () => {
    it('returns a non-empty array of strings', () => {
      const tools = registry.getAllTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('includes core writing tools', () => {
      const tools = registry.getAllTools();
      expect(tools).toContain('summarize');
      expect(tools).toContain('paraphrase');
      expect(tools).toContain('humanize');
      expect(tools).toContain('grammar-checker');
    });

    it('includes academic tools', () => {
      const tools = registry.getAllTools();
      expect(tools).toContain('generate-quiz');
      expect(tools).toContain('generate-citation');
    });

    it('includes generation tools', () => {
      const tools = registry.getAllTools();
      expect(tools).toContain('generate-ideas');
      expect(tools).toContain('topic-explainer');
    });

    it('returns a consistent list on multiple calls', () => {
      const first = registry.getAllTools();
      const second = registry.getAllTools();
      expect(first).toEqual(second);
    });
  });

  // ── ToolConfig structure ───────────────────────────────────────────────────

  describe('ToolConfig structure', () => {
    it('every registered tool has a non-negative creditCost', () => {
      for (const name of registry.getAllTools()) {
        const config = registry.getTool(name);
        expect(config?.creditCost).toBeGreaterThanOrEqual(0);
      }
    });

    it('every registered tool has a schema with safeParse method', () => {
      for (const name of registry.getAllTools()) {
        const config = registry.getTool(name);
        expect(typeof config?.schema?.safeParse).toBe('function');
      }
    });

    it('"write-document" is NOT free for guests', () => {
      const config = registry.getTool('write-document');
      expect(config?.isFreeForGuests).toBeFalsy();
    });

    it('commonly free tools all have isFreeForGuests=true', () => {
      const freeTools = ['paraphrase', 'summarize', 'humanize', 'grammar-checker', 'translator'];
      for (const name of freeTools) {
        const config = registry.getTool(name);
        expect(config?.isFreeForGuests).toBe(true);
      }
    });
  });
});
