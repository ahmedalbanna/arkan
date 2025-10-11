/**
 * إعداد Jest للاختبارات
 */

// Mock للـ Genkit AI
jest.mock('@genkit-ai/core', () => ({
    ai: {
        definePrompt: jest.fn(() => jest.fn().mockResolvedValue({ output: {} })),
        defineFlow: jest.fn(() => jest.fn().mockResolvedValue({ output: {} })),
        generate: jest.fn().mockResolvedValue({ output: {} }),
    },
}));

// Mock للـ genkit module
jest.mock('@/ai/genkit', () => ({
    ai: {
        definePrompt: jest.fn(() => jest.fn().mockResolvedValue({ output: {} })),
        defineFlow: jest.fn(() => jest.fn().mockResolvedValue({ output: {} })),
        generate: jest.fn().mockResolvedValue({ output: {} }),
    },
}));

// Mock للـ Genkit Google AI
jest.mock('@genkit-ai/googleai', () => ({
    gemini20Flash: {
        generate: jest.fn().mockResolvedValue({ output: {} }),
    },
    gemini15Pro: {
        generate: jest.fn().mockResolvedValue({ output: {} }),
    },
}));

jest.mock('@/ai/prompts/generate-diagrams', () => ({
    generateDiagramPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/generate-plantuml', () => ({
    generatePlantUMLPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/ai-proofread-document', () => ({
    aiProofreadPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/detect-ai-content', () => ({
    detectAIPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/grammar-checker', () => ({
    grammarCheckPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/humanize-text', () => ({
    humanizePrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/manipulate-text', () => ({
    manipulateTextPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/paraphrase-text', () => ({
    paraphrasePrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/plagiarism-check', () => ({
    plagiarismCheckPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/summarize-text', () => ({
    summarizePrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

// Mock للـ prompts modules
jest.mock('@/ai/prompts/academic-solver', () => ({
    analysisPrompt: jest.fn().mockResolvedValue({ output: {} }),
    solvePrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/generate-theoretical-lecture', () => ({
    generateTheoreticalLecturePrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/generate-session-plan', () => ({
    generateSessionPlanPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/analyze-context', () => ({
    analysisPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/fact-checker', () => ({
    factCheckPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/ai-researcher', () => ({
    aiResearcherPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/evaluate-report', () => ({
    evaluateReportPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/image-to-text', () => ({
    imageToTextPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/generate-codebase', () => ({
    generateCodebasePrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/generate-agent-config', () => ({
    generateAgentConfigPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/generate-citation', () => ({
    generateCitationPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/generate-code', () => ({
    generateCodePrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/generate-diagrams', () => ({
    generateDiagramPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/generate-quiz', () => ({
    multipleChoiceQuizPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

jest.mock('@/ai/prompts/generate-ideas', () => ({
    generateIdeasPrompt: jest.fn().mockResolvedValue({ output: {} }),
}));

// Mock للـ genkit modules
jest.mock('genkit', () => ({
    z: {
        object: jest.fn(),
        string: jest.fn(),
        number: jest.fn(),
        boolean: jest.fn(),
        array: jest.fn(),
        optional: jest.fn(),
        nullable: jest.fn(),
        infer: jest.fn(),
    },
}));

// إعدادات عامة للاختبارات
beforeEach(() => {
    jest.clearAllMocks();
});

// Mock console methods لتجنب الضوضاء في الاختبارات
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Mock للـ Date
const mockDate = new Date('2024-01-01T00:00:00.000Z');
global.Date = jest.fn(() => mockDate);
global.Date.UTC = jest.fn(() => mockDate.getTime());
global.Date.parse = jest.fn(() => mockDate.getTime());
global.Date.now = jest.fn(() => mockDate.getTime());

// Mock للـ Math.random
global.Math.random = jest.fn(() => 0.5);

// Mock للـ setTimeout و setInterval
global.setTimeout = jest.fn((fn) => fn());
global.setInterval = jest.fn((fn) => fn());
global.clearTimeout = jest.fn();
global.clearInterval = jest.fn();

// Mock للـ fetch
global.fetch = jest.fn();

// Mock للـ crypto
global.crypto = {
    randomUUID: jest.fn(() => 'mock-uuid'),
};

// Mock للـ process
global.process = {
    ...process,
    env: {
        ...process.env,
        NODE_ENV: 'test',
    },
};
