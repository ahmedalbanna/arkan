/**
 * اختبارات المساعدات السريعة
 */

import { QuickAIHelpers, QuickHelpers } from '../quick-helpers';

// Mock للـ AI
jest.mock('@/ai/genkit', () => ({
    ai: {
        definePrompt: jest.fn(() => ({
            __prompt: 'mock-prompt'
        }))
    }
}));

// Mock للمكونات الأساسية
jest.mock('../context-analyzer', () => ({
    ContextAnalyzer: {
        analyzeContext: jest.fn()
    }
}));

jest.mock('../adaptive-model-selector', () => ({
    AdaptiveModelSelector: {
        selectOptimalModel: jest.fn()
    }
}));

jest.mock('../output-quality-validator', () => ({
    OutputQualityValidator: {
        validateOutput: jest.fn()
    }
}));

describe('QuickAIHelpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('quickAnalyze', () => {
        test('should analyze text successfully', async () => {
            const mockAnalysis = {
                contentType: 'technical' as const,
                complexityLevel: 'intermediate' as const,
                targetAudience: 'technical' as const,
                language: 'ar' as const,
                culturalContext: 'middle-east' as const,
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Technical content requires advanced reasoning'
                },
                specificRequirements: ['detailed analysis', 'technical accuracy']
            };

            const { ContextAnalyzer } = require('../context-analyzer');
            ContextAnalyzer.analyzeContext.mockResolvedValue(mockAnalysis);

            const result = await QuickAIHelpers.quickAnalyze('أنشئ نظام إدارة قاعدة بيانات');

            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                contentType: 'technical',
                complexity: 'intermediate',
                audience: 'technical',
                language: 'ar',
                culturalContext: 'middle-east',
                recommendedModel: 'googleai/gemini-1.5-pro',
                fallbackModel: 'googleai/gemini-2.0-flash',
                reasoning: 'Technical content requires advanced reasoning',
                specificRequirements: ['detailed analysis', 'technical accuracy']
            });
            expect(result.executionTime).toBeGreaterThan(0);
        });

        test('should handle analysis errors', async () => {
            const { ContextAnalyzer } = require('../context-analyzer');
            ContextAnalyzer.analyzeContext.mockRejectedValue(new Error('Analysis failed'));

            const result = await QuickAIHelpers.quickAnalyze('test text');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Analysis failed');
            expect(result.executionTime).toBeGreaterThan(0);
        });
    });

    describe('quickValidate', () => {
        test('should validate output successfully', async () => {
            const mockContextAnalysis = {
                contentType: 'technical' as const,
                complexityLevel: 'intermediate' as const,
                targetAudience: 'technical' as const,
                language: 'ar' as const,
                culturalContext: 'middle-east' as const,
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Technical content'
                },
                specificRequirements: []
            };

            const mockValidation = {
                metrics: {
                    overall: 85,
                    completeness: 90,
                    accuracy: 80,
                    relevance: 85,
                    clarity: 90,
                    structure: 85
                },
                issues: [
                    {
                        type: 'missing_content' as const,
                        description: 'Missing some details',
                        suggestion: 'Add more details'
                    }
                ],
                needsImprovement: false,
                suggestions: ['Improve clarity', 'Add examples']
            };

            const { ContextAnalyzer } = require('../context-analyzer');
            const { OutputQualityValidator } = require('../output-quality-validator');

            ContextAnalyzer.analyzeContext.mockResolvedValue(mockContextAnalysis);
            OutputQualityValidator.validateOutput.mockResolvedValue(mockValidation);

            const result = await QuickAIHelpers.quickValidate('output text', 'input text');

            expect(result.success).toBe(true);
            expect(result.data.score).toBe(85);
            expect(result.data.isGood).toBe(true);
            expect(result.data.needsImprovement).toBe(false);
            expect(result.data.mainIssues).toHaveLength(1);
            expect(result.data.metrics).toBeDefined();
            expect(result.data.suggestions).toHaveLength(2);
        });

        test('should handle validation errors', async () => {
            const { ContextAnalyzer } = require('../context-analyzer');
            ContextAnalyzer.analyzeContext.mockRejectedValue(new Error('Context analysis failed'));

            const result = await QuickAIHelpers.quickValidate('output', 'input');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Context analysis failed');
        });
    });

    describe('quickSummarize', () => {
        test('should summarize text successfully', async () => {
            const mockOutput = 'This is a summary of the text.';

            const { ai } = require('@/ai/genkit');
            const mockPrompt = {
                __prompt: 'mock-prompt'
            };
            ai.definePrompt.mockReturnValue(mockPrompt);

            // Mock the prompt execution
            mockPrompt.__prompt = jest.fn().mockResolvedValue({ output: mockOutput });

            const result = await QuickAIHelpers.quickSummarize('Long text to summarize', 'medium');

            expect(result.success).toBe(true);
            expect(result.data.summary).toBe(mockOutput);
            expect(result.data.originalLength).toBe('Long text to summarize'.length);
            expect(result.data.summaryLength).toBe(mockOutput.length);
            expect(result.data.length).toBe('medium');
        });

        test('should handle summarization errors', async () => {
            const { ai } = require('@/ai/genkit');
            ai.definePrompt.mockImplementation(() => {
                throw new Error('Prompt creation failed');
            });

            const result = await QuickAIHelpers.quickSummarize('test text', 'short');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Prompt creation failed');
        });
    });

    describe('quickFactCheck', () => {
        test('should fact-check text successfully', async () => {
            const mockOutput = `
        Claim: The Earth is round.
        Status: Verified
        Source: nasa.gov
        Originality Score: 95 points
      `;

            const { ai } = require('@/ai/genkit');
            const mockPrompt = {
                __prompt: 'mock-prompt'
            };
            ai.definePrompt.mockReturnValue(mockPrompt);
            mockPrompt.__prompt = jest.fn().mockResolvedValue({ output: mockOutput });

            const result = await QuickAIHelpers.quickFactCheck('The Earth is round.');

            expect(result.success).toBe(true);
            expect(result.data.claims).toBeDefined();
            expect(result.data.originalityScore).toBe(95);
            expect(result.data.overallAssessment).toBe('Verified');
        });
    });

    describe('quickResearch', () => {
        test('should research topic successfully', async () => {
            const mockOutput = `
        Research Summary: AI is transforming healthcare.

        Key Points:
        - AI improves diagnosis accuracy
        - Reduces treatment costs
        - Enhances patient care

        Sources:
        - https://example.com/ai-healthcare
        - https://research.org/medical-ai
      `;

            const { ai } = require('@/ai/genkit');
            const mockPrompt = {
                __prompt: 'mock-prompt'
            };
            ai.definePrompt.mockReturnValue(mockPrompt);
            mockPrompt.__prompt = jest.fn().mockResolvedValue({ output: mockOutput });

            const result = await QuickAIHelpers.quickResearch('AI in healthcare');

            expect(result.success).toBe(true);
            expect(result.data.summary).toBeDefined();
            expect(result.data.keyPoints).toBeDefined();
            expect(result.data.sources).toBeDefined();
            expect(result.data.topic).toBe('AI in healthcare');
        });
    });

    describe('quickImprove', () => {
        test('should improve text successfully', async () => {
            const originalText = 'This text needs improvement.';
            const improvedText = 'This text has been significantly improved with better structure and clarity.';

            const { ai } = require('@/ai/genkit');
            const mockPrompt = {
                __prompt: 'mock-prompt'
            };
            ai.definePrompt.mockReturnValue(mockPrompt);
            mockPrompt.__prompt = jest.fn().mockResolvedValue({ output: improvedText });

            const result = await QuickAIHelpers.quickImprove(originalText, 'clarity');

            expect(result.success).toBe(true);
            expect(result.data.improvedText).toBe(improvedText);
            expect(result.data.originalText).toBe(originalText);
            expect(result.data.focusArea).toBe('clarity');
            expect(result.data.improvements).toBeDefined();
        });
    });

    describe('quickTranslate', () => {
        test('should translate text successfully', async () => {
            const originalText = 'Hello world';
            const translatedText = 'مرحبا بالعالم';

            const { ai } = require('@/ai/genkit');
            const mockPrompt = {
                __prompt: 'mock-prompt'
            };
            ai.definePrompt.mockReturnValue(mockPrompt);
            mockPrompt.__prompt = jest.fn().mockResolvedValue({ output: translatedText });

            const result = await QuickAIHelpers.quickTranslate(originalText, 'ar');

            expect(result.success).toBe(true);
            expect(result.data.translatedText).toBe(translatedText);
            expect(result.data.originalText).toBe(originalText);
            expect(result.data.targetLanguage).toBe('ar');
            expect(result.data.translationQuality).toBeDefined();
        });
    });
});

describe('QuickHelpers', () => {
    test('should provide simplified interface', () => {
        expect(QuickHelpers.analyze).toBe(QuickAIHelpers.quickAnalyze);
        expect(QuickHelpers.validate).toBe(QuickAIHelpers.quickValidate);
        expect(QuickHelpers.suggestModel).toBe(QuickAIHelpers.suggestModel);
        expect(QuickHelpers.summarize).toBe(QuickAIHelpers.quickSummarize);
        expect(QuickHelpers.factCheck).toBe(QuickAIHelpers.quickFactCheck);
        expect(QuickHelpers.research).toBe(QuickAIHelpers.quickResearch);
        expect(QuickHelpers.improve).toBe(QuickAIHelpers.quickImprove);
        expect(QuickHelpers.translate).toBe(QuickAIHelpers.quickTranslate);
    });
});

describe('Helper Methods', () => {
    describe('extractClaims', () => {
        test('should extract claims from fact-check output', () => {
            const output = `
        Claim: The Earth is round.
        Status: Verified
        Source: nasa.gov

        Claim: Water boils at 100°C.
        Status: Verified
        Source: scientific.org
      `;

            const claims = QuickAIHelpers['extractClaims'](output);

            expect(claims).toHaveLength(2);
            expect(claims[0].claim).toBe('The Earth is round.');
            expect(claims[1].claim).toBe('Water boils at 100°C.');
        });
    });

    describe('extractScore', () => {
        test('should extract originality score', () => {
            const output = 'The overall originality score is 85 points.';
            const score = QuickAIHelpers['extractScore'](output);
            expect(score).toBe(85);
        });

        test('should return 0 if no score found', () => {
            const output = 'No score mentioned here.';
            const score = QuickAIHelpers['extractScore'](output);
            expect(score).toBe(0);
        });
    });

    describe('extractKeyPoints', () => {
        test('should extract key points from research output', () => {
            const output = `
        Research Summary:

        - AI improves diagnosis accuracy
        - Reduces treatment costs
        - Enhances patient care
        1. Better outcomes
        2. Lower costs
      `;

            const keyPoints = QuickAIHelpers['extractKeyPoints'](output);

            expect(keyPoints).toHaveLength(5);
            expect(keyPoints[0]).toBe('AI improves diagnosis accuracy');
            expect(keyPoints[1]).toBe('Reduces treatment costs');
        });
    });

    describe('assessResearchDepth', () => {
        test('should assess research depth correctly', () => {
            const shortOutput = 'Short research.';
            const mediumOutput = 'Medium length research with some details and analysis.'.repeat(20);
            const longOutput = 'Very detailed research with comprehensive analysis and extensive information.'.repeat(50);

            expect(QuickAIHelpers['assessResearchDepth'](shortOutput)).toBe('shallow');
            expect(QuickAIHelpers['assessResearchDepth'](mediumOutput)).toBe('moderate');
            expect(QuickAIHelpers['assessResearchDepth'](longOutput)).toBe('deep');
        });
    });

    describe('assessTranslationQuality', () => {
        test('should assess translation quality correctly', () => {
            const original = 'Hello world';
            const excellent = 'مرحبا بالعالم';
            const good = 'مرحبا';
            const fair = 'مرحبا بالعالم الجميل';

            expect(QuickAIHelpers['assessTranslationQuality'](original, excellent)).toBe('excellent');
            expect(QuickAIHelpers['assessTranslationQuality'](original, good)).toBe('good');
            expect(QuickAIHelpers['assessTranslationQuality'](original, fair)).toBe('fair');
        });
    });
});
