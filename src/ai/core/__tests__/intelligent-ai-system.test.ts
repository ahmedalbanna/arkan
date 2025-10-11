/**
 * اختبارات شاملة لنظام الذكاء الاصطناعي المحسن
 * يغطي جميع المكونات والتدفقات الرئيسية
 */

import {
    ContextAnalyzer,
    IntelligentAISystem,
    PerformanceMonitor,
    QuickAIHelpers,
    type ContextAnalysisResult
} from '../index';

// Mock للخدمات الخارجية
jest.mock('../config/models', () => ({
    defaultModel: 'googleai/gemini-2.0-flash',
    proModel: 'googleai/gemini-1.5-pro',
    imageGenerationModel: 'googleai/gemini-2.0-flash-preview-image-generation'
}));

// Mock للـ AI flows
jest.mock('../../flows', () => ({
    generateContent: jest.fn(),
    analyzeContent: jest.fn(),
    translateContent: jest.fn(),
    improveContent: jest.fn()
}));

describe('IntelligentAISystem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // مسح بيانات الأداء قبل كل اختبار
        PerformanceMonitor.clearOldData(0);
    });

    describe('runIntelligentFlow', () => {
        it('should run complete intelligent flow successfully', async () => {
            const config = {
                userInput: 'أنشئ خطة عمل لمشروع تقني',
                taskType: 'generation' as const,
                domain: 'business',
                externalContext: [
                    {
                        fileName: 'requirements.txt',
                        content: 'متطلبات المشروع التقني',
                        type: 'context'
                    }
                ],
                guidelines: ['يجب أن يكون المحتوى مهنياً'],
                qualityThreshold: 85,
                maxIterations: 3,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            // التحقق من النتيجة
            expect(result).toBeDefined();
            expect(result.output).toBeDefined();
            expect(result.qualityScore).toBeGreaterThanOrEqual(0);
            expect(result.iterations).toBeGreaterThan(0);
            expect(result.modelUsed).toBeDefined();
            expect(result.contextAnalysis).toBeDefined();
            expect(result.performanceSessionId).toBeDefined();
            expect(result.performanceMetrics).toBeDefined();

            // التحقق من مراقبة الأداء
            expect(result.performanceMetrics?.executionTime).toBeGreaterThan(0);
            expect(result.performanceMetrics?.qualityScore).toBeGreaterThan(0);
        });

        it('should handle simple generation without iterative improvement', async () => {
            const config = {
                userInput: 'ترجم هذه الجملة إلى الإنجليزية',
                taskType: 'translation' as const,
                domain: 'language',
                enableIterativeImprovement: false,
                enablePerformanceMonitoring: false
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.output).toBeDefined();
            expect(result.iterations).toBe(1);
            expect(result.performanceSessionId).toBeNull();
        });

        it('should handle complex technical content', async () => {
            const config = {
                userInput: 'أنشئ نظام إدارة قاعدة بيانات متقدم مع واجهة ويب حديثة',
                taskType: 'generation' as const,
                domain: 'software_engineering',
                externalContext: [
                    {
                        fileName: 'database-schema.sql',
                        content: 'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));',
                        type: 'context'
                    },
                    {
                        fileName: 'api-specs.json',
                        content: '{"endpoints": ["/users", "/posts"]}',
                        type: 'example'
                    }
                ],
                guidelines: [
                    'يجب أن يكون النظام آمناً',
                    'يجب أن يدعم المستخدمين المتعددين',
                    'يجب أن يكون سريعاً'
                ],
                qualityThreshold: 90,
                maxIterations: 5
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.contextAnalysis.contentType).toBe('technical');
            expect(result.contextAnalysis.complexityLevel).toBe('advanced');
            expect(result.modelUsed).toContain('gemini-1.5-pro');
        });

        it('should handle creative content generation', async () => {
            const config = {
                userInput: 'اكتب قصة قصيرة عن المستقبل',
                taskType: 'generation' as const,
                domain: 'creative_writing',
                guidelines: [
                    'يجب أن تكون القصة إبداعية',
                    'استخدم اللغة العربية الفصحى',
                    'ركز على الخيال العلمي'
                ]
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.contextAnalysis.contentType).toBe('creative');
            expect(result.contextAnalysis.targetAudience).toBe('general');
        });

        it('should handle academic content analysis', async () => {
            const config = {
                userInput: 'حلل هذه الدراسة البحثية حول الذكاء الاصطناعي',
                taskType: 'analysis' as const,
                domain: 'academic_research',
                externalContext: [
                    {
                        fileName: 'research-paper.pdf',
                        content: 'دراسة شاملة حول تطبيقات الذكاء الاصطناعي في التعليم',
                        type: 'textbook'
                    }
                ],
                guidelines: [
                    'يجب أن يكون التحليل علمياً',
                    'استخدم المراجع الأكاديمية',
                    'قدم توصيات عملية'
                ]
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.contextAnalysis.contentType).toBe('academic');
            expect(result.contextAnalysis.targetAudience).toBe('academic');
        });

        it('should handle error cases gracefully', async () => {
            const config = {
                userInput: '', // مدخل فارغ
                taskType: 'generation' as const,
                domain: 'test'
            };

            await expect(IntelligentAISystem.runIntelligentFlow(config))
                .rejects.toThrow();
        });

        it('should handle network errors', async () => {
            // Mock network error
            jest.spyOn(console, 'error').mockImplementation(() => { });

            const config = {
                userInput: 'test input',
                taskType: 'generation' as const,
                domain: 'test',
                enablePerformanceMonitoring: true
            };

            // Mock error in context analysis
            jest.spyOn(ContextAnalyzer, 'analyzeContext').mockRejectedValueOnce(
                new Error('Network error')
            );

            await expect(IntelligentAISystem.runIntelligentFlow(config))
                .rejects.toThrow('Network error');
        });
    });

    describe('analyzeContext', () => {
        it('should analyze context correctly', async () => {
            const result = await IntelligentAISystem.analyzeContext(
                'أنشئ نظام إدارة قاعدة بيانات',
                [
                    {
                        fileName: 'schema.sql',
                        content: 'CREATE TABLE users (id INT PRIMARY KEY);',
                        type: 'context'
                    }
                ]
            );

            expect(result).toBeDefined();
            expect(result.contentType).toBeDefined();
            expect(result.complexityLevel).toBeDefined();
            expect(result.targetAudience).toBeDefined();
            expect(result.language).toBeDefined();
            expect(result.culturalContext).toBeDefined();
            expect(result.specificRequirements).toBeInstanceOf(Array);
            expect(result.availableContext).toBeDefined();
            expect(result.modelRecommendation).toBeDefined();
        });

        it('should handle empty external context', async () => {
            const result = await IntelligentAISystem.analyzeContext(
                'أنشئ خطة عمل بسيطة'
            );

            expect(result).toBeDefined();
            expect(result.availableContext.files).toHaveLength(0);
        });
    });

    describe('selectModel', () => {
        it('should select appropriate model for technical content', () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'technical',
                complexityLevel: 'expert',
                targetAudience: 'technical',
                language: 'ar',
                culturalContext: 'middle-east',
                specificRequirements: ['دقة عالية'],
                availableContext: {
                    files: [],
                    previousSections: [],
                    guidelines: []
                },
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Technical content requires advanced reasoning'
                }
            };

            const modelConfig = IntelligentAISystem.selectModel(contextAnalysis, 'generation');

            expect(modelConfig).toBeDefined();
            expect(modelConfig.modelId).toContain('gemini-1.5-pro');
            expect(modelConfig.temperature).toBeLessThanOrEqual(0.3);
            expect(modelConfig.reasoning).toBeDefined();
        });

        it('should select appropriate model for creative content', () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'creative',
                complexityLevel: 'intermediate',
                targetAudience: 'general',
                language: 'ar',
                culturalContext: 'middle-east',
                specificRequirements: [],
                availableContext: {
                    files: [],
                    previousSections: [],
                    guidelines: []
                },
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Creative content benefits from advanced models'
                }
            };

            const modelConfig = IntelligentAISystem.selectModel(contextAnalysis, 'generation');

            expect(modelConfig).toBeDefined();
            expect(modelConfig.temperature).toBeGreaterThanOrEqual(0.9);
            expect(modelConfig.topP).toBeGreaterThanOrEqual(0.95);
        });
    });

    describe('validateOutput', () => {
        it('should validate output quality correctly', async () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'business',
                complexityLevel: 'intermediate',
                targetAudience: 'executive',
                language: 'ar',
                culturalContext: 'middle-east',
                specificRequirements: ['يجب أن يكون المحتوى مهنياً'],
                availableContext: {
                    files: [],
                    previousSections: [],
                    guidelines: []
                },
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Business content requires professional quality'
                }
            };

            const output = 'هذا محتوى مهني عالي الجودة يلبي جميع المتطلبات المطلوبة.';
            const originalInput = 'أنشئ خطة عمل مهنية';

            const validation = await IntelligentAISystem.validateOutput(
                output,
                originalInput,
                contextAnalysis
            );

            expect(validation).toBeDefined();
            expect(validation.isValid).toBeDefined();
            expect(validation.metrics).toBeDefined();
            expect(validation.metrics.overall).toBeGreaterThanOrEqual(0);
            expect(validation.metrics.overall).toBeLessThanOrEqual(100);
            expect(validation.issues).toBeInstanceOf(Array);
            expect(validation.suggestions).toBeInstanceOf(Array);
        });
    });

    describe('buildSmartPrompt', () => {
        it('should build smart prompt correctly', () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'technical',
                complexityLevel: 'advanced',
                targetAudience: 'technical',
                language: 'ar',
                culturalContext: 'middle-east',
                specificRequirements: ['دقة عالية'],
                availableContext: {
                    files: [],
                    previousSections: [],
                    guidelines: []
                },
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Technical content requires precision'
                }
            };

            const config = {
                taskType: 'generation' as const,
                domain: 'software_engineering',
                contextAnalysis,
                userInput: 'أنشئ نظام إدارة قاعدة بيانات',
                externalContext: [
                    {
                        fileName: 'schema.sql',
                        content: 'CREATE TABLE users (id INT PRIMARY KEY);',
                        type: 'context'
                    }
                ]
            };

            const prompt = IntelligentAISystem.buildSmartPrompt(config);

            expect(prompt).toBeDefined();
            expect(typeof prompt).toBe('string');
            expect(prompt.length).toBeGreaterThan(0);
            expect(prompt).toContain('أنشئ نظام إدارة قاعدة بيانات');
        });
    });

    describe('Performance Monitoring', () => {
        it('should generate performance report', () => {
            const report = IntelligentAISystem.getPerformanceReport();

            expect(report).toBeDefined();
            expect(report.totalSessions).toBeGreaterThanOrEqual(0);
            expect(report.averageExecutionTime).toBeGreaterThanOrEqual(0);
            expect(report.averageQualityScore).toBeGreaterThanOrEqual(0);
            expect(report.successRate).toBeGreaterThanOrEqual(0);
            expect(report.mostCommonErrors).toBeInstanceOf(Array);
            expect(report.performanceTrends).toBeInstanceOf(Array);
            expect(report.modelUsageStats).toBeInstanceOf(Array);
            expect(report.recommendations).toBeInstanceOf(Array);
        });

        it('should get quick performance stats', () => {
            const stats = IntelligentAISystem.getQuickPerformanceStats();

            expect(stats).toBeDefined();
            expect(stats.activeSessions).toBeGreaterThanOrEqual(0);
            expect(stats.completedSessions).toBeGreaterThanOrEqual(0);
            expect(stats.avgQualityToday).toBeGreaterThanOrEqual(0);
            expect(stats.avgExecutionTimeToday).toBeGreaterThanOrEqual(0);
        });

        it('should export performance data', () => {
            const jsonData = IntelligentAISystem.exportPerformanceData('json');
            const csvData = IntelligentAISystem.exportPerformanceData('csv');

            expect(jsonData).toBeDefined();
            expect(csvData).toBeDefined();
            expect(typeof jsonData).toBe('string');
            expect(typeof csvData).toBe('string');
        });

        it('should clear old performance data', () => {
            const removedCount = IntelligentAISystem.clearOldPerformanceData(30);

            expect(removedCount).toBeGreaterThanOrEqual(0);
        });
    });
});

describe('QuickAIHelpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('quickAnalyze', () => {
        it('should perform quick analysis', async () => {
            const result = await QuickAIHelpers.quickAnalyze('أنشئ خطة عمل لمشروع تقني');

            expect(result).toBeDefined();
            expect(result.contentType).toBeDefined();
            expect(result.complexity).toBeDefined();
            expect(result.audience).toBeDefined();
            expect(result.language).toBeDefined();
            expect(result.recommendedModel).toBeDefined();
        });

        it('should handle empty input', async () => {
            const result = await QuickAIHelpers.quickAnalyze('');

            expect(result).toBeDefined();
            expect(result.contentType).toBeDefined();
        });
    });

    describe('quickValidate', () => {
        it('should perform quick validation', async () => {
            const result = await QuickAIHelpers.quickValidate(
                'هذا محتوى عالي الجودة',
                'أنشئ محتوى عالي الجودة'
            );

            expect(result).toBeDefined();
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);
            expect(typeof result.isGood).toBe('boolean');
            expect(typeof result.needsImprovement).toBe('boolean');
            expect(result.mainIssues).toBeInstanceOf(Array);
        });
    });

    describe('suggestModel', () => {
        it('should suggest appropriate model', async () => {
            const result = await QuickAIHelpers.suggestModel(
                'أنشئ نظام إدارة قاعدة بيانات',
                'generation'
            );

            expect(result).toBeDefined();
            expect(result.model).toBeDefined();
            expect(result.reasoning).toBeDefined();
            expect(result.temperature).toBeGreaterThanOrEqual(0);
            expect(result.temperature).toBeLessThanOrEqual(1);
            expect(result.maxTokens).toBeGreaterThan(0);
        });

        it('should suggest different models for different task types', async () => {
            const generationResult = await QuickAIHelpers.suggestModel('أنشئ محتوى', 'generation');
            const analysisResult = await QuickAIHelpers.suggestModel('حلل هذا المحتوى', 'analysis');
            const translationResult = await QuickAIHelpers.suggestModel('ترجم هذا النص', 'translation');

            expect(generationResult.model).toBeDefined();
            expect(analysisResult.model).toBeDefined();
            expect(translationResult.model).toBeDefined();
        });
    });
});

describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle very long input', async () => {
        const longInput = 'أ'.repeat(10000);

        const result = await IntelligentAISystem.runIntelligentFlow({
            userInput: longInput,
            taskType: 'generation',
            domain: 'test'
        });

        expect(result).toBeDefined();
        expect(result.contextAnalysis.complexityLevel).toBe('expert');
    });

    it('should handle special characters and emojis', async () => {
        const specialInput = 'أنشئ خطة عمل 🚀 لمشروع تقني #AI #MachineLearning';

        const result = await IntelligentAISystem.runIntelligentFlow({
            userInput: specialInput,
            taskType: 'generation',
            domain: 'test'
        });

        expect(result).toBeDefined();
    });

    it('should handle mixed language input', async () => {
        const mixedInput = 'أنشئ business plan لمشروع تقني مع AI capabilities';

        const result = await IntelligentAISystem.runIntelligentFlow({
            userInput: mixedInput,
            taskType: 'generation',
            domain: 'test'
        });

        expect(result).toBeDefined();
        expect(result.contextAnalysis.language).toBeDefined();
    });

    it('should handle multiple external contexts', async () => {
        const externalContext = Array.from({ length: 20 }, (_, i) => ({
            fileName: `file${i}.txt`,
            content: `محتوى الملف ${i}`,
            type: 'context'
        }));

        const result = await IntelligentAISystem.runIntelligentFlow({
            userInput: 'أنشئ تقرير شامل',
            taskType: 'generation',
            domain: 'test',
            externalContext
        });

        expect(result).toBeDefined();
        expect(result.contextAnalysis.availableContext.files).toHaveLength(20);
    });

    it('should handle concurrent requests', async () => {
        const requests = Array.from({ length: 5 }, (_, i) =>
            IntelligentAISystem.runIntelligentFlow({
                userInput: `طلب ${i}`,
                taskType: 'generation',
                domain: 'test'
            })
        );

        const results = await Promise.all(requests);

        expect(results).toHaveLength(5);
        results.forEach(result => {
            expect(result).toBeDefined();
        });
    });
});

describe('Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should integrate all components correctly', async () => {
        const config = {
            userInput: 'أنشئ نظام إدارة متكامل',
            taskType: 'generation' as const,
            domain: 'software_engineering',
            externalContext: [
                {
                    fileName: 'requirements.txt',
                    content: 'متطلبات النظام',
                    type: 'context'
                },
                {
                    fileName: 'example.md',
                    content: 'مثال على النظام',
                    type: 'example'
                }
            ],
            guidelines: [
                'يجب أن يكون النظام آمناً',
                'يجب أن يكون سريعاً'
            ],
            qualityThreshold: 85,
            maxIterations: 3,
            enableIterativeImprovement: true,
            enablePerformanceMonitoring: true
        };

        const result = await IntelligentAISystem.runIntelligentFlow(config);

        // التحقق من التكامل الكامل
        expect(result).toBeDefined();
        expect(result.output).toBeDefined();
        expect(result.qualityScore).toBeGreaterThanOrEqual(0);
        expect(result.iterations).toBeGreaterThan(0);
        expect(result.modelUsed).toBeDefined();
        expect(result.contextAnalysis).toBeDefined();
        expect(result.session).toBeDefined();
        expect(result.performanceSessionId).toBeDefined();
        expect(result.performanceMetrics).toBeDefined();

        // التحقق من جودة التحليل
        expect(result.contextAnalysis.contentType).toBeDefined();
        expect(result.contextAnalysis.complexityLevel).toBeDefined();
        expect(result.contextAnalysis.targetAudience).toBeDefined();
        expect(result.contextAnalysis.specificRequirements).toContain('يجب أن يكون النظام آمناً');
        expect(result.contextAnalysis.specificRequirements).toContain('يجب أن يكون سريعاً');

        // التحقق من تنظيم السياق
        if (result.contextAnalysis.availableContext.organizedContext) {
            expect(result.contextAnalysis.availableContext.organizedContext.foundational).toBeInstanceOf(Array);
            expect(result.contextAnalysis.availableContext.organizedContext.conceptual).toBeInstanceOf(Array);
            expect(result.contextAnalysis.availableContext.organizedContext.procedural).toBeInstanceOf(Array);
            expect(result.contextAnalysis.availableContext.organizedContext.reference).toBeInstanceOf(Array);
            expect(result.contextAnalysis.availableContext.organizedContext.guidelines).toBeInstanceOf(Array);
            expect(result.contextAnalysis.availableContext.organizedContext.statistics).toBeDefined();
        }

        // التحقق من جلسة التحسين التكراري
        expect(result.session.iterations).toBeInstanceOf(Array);
        expect(result.session.iterations.length).toBeGreaterThan(0);
        expect(result.session.finalOutput).toBeDefined();
        expect(result.session.totalImprovementScore).toBeGreaterThanOrEqual(0);
        expect(result.session.status).toBe('completed');

        // التحقق من مقاييس الأداء
        expect(result.performanceMetrics?.executionTime).toBeGreaterThan(0);
        expect(result.performanceMetrics?.qualityScore).toBeGreaterThan(0);
        expect(result.performanceMetrics?.successRate).toBeGreaterThanOrEqual(0);
    });

    it('should handle end-to-end workflow with error recovery', async () => {
        // Mock error in first attempt
        let attemptCount = 0;
        const originalAnalyzeContext = ContextAnalyzer.analyzeContext;
        jest.spyOn(ContextAnalyzer, 'analyzeContext').mockImplementation(async (input) => {
            attemptCount++;
            if (attemptCount === 1) {
                throw new Error('Network error');
            }
            return originalAnalyzeContext(input);
        });

        const config = {
            userInput: 'أنشئ خطة عمل',
            taskType: 'generation' as const,
            domain: 'business',
            enablePerformanceMonitoring: true
        };

        // Should succeed on retry
        const result = await IntelligentAISystem.runIntelligentFlow(config);

        expect(result).toBeDefined();
        expect(attemptCount).toBe(2);
    });
});
