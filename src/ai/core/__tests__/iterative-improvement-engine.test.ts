/**
 * اختبارات محرك التحسين التكراري
 */

import { ContextAnalysisResult } from '../context-analyzer';
import { ImprovementSession, IterativeImprovementEngine } from '../iterative-improvement-engine';

// Mock للتبعيات
jest.mock('../context-analyzer');
jest.mock('../adaptive-model-selector');
jest.mock('../intelligent-prompt-builder');
jest.mock('../output-quality-validator');

describe('IterativeImprovementEngine', () => {
    let mockContextAnalysis: ContextAnalysisResult;

    beforeEach(() => {
        // إعداد mock للتحليل السياقي
        mockContextAnalysis = {
            contentType: 'technical',
            complexityLevel: 'intermediate',
            targetAudience: 'technical',
            language: 'ar',
            culturalContext: 'middle-east',
            specificRequirements: ['دقة', 'وضوح'],
            availableContext: {
                files: [],
                previousSections: [],
                guidelines: []
            },
            modelRecommendation: {
                primary: 'googleai/gemini-1.5-pro',
                fallback: 'googleai/gemini-1.5-flash',
                reasoning: 'مناسب للمحتوى التقني'
            }
        };

        // Mock للتبعيات
        const { ContextAnalyzer } = require('../context-analyzer');
        const { AdaptiveModelSelector } = require('../adaptive-model-selector');
        const { IntelligentPromptBuilder } = require('../intelligent-prompt-builder');
        const { OutputQualityValidator } = require('../output-quality-validator');

        ContextAnalyzer.analyzeContext = jest.fn().mockResolvedValue(mockContextAnalysis);
        AdaptiveModelSelector.selectOptimalModel = jest.fn().mockReturnValue({
            modelId: 'googleai/gemini-1.5-pro',
            temperature: 0.7,
            maxOutputTokens: 2000,
            reasoning: 'مناسب للمحتوى التقني'
        });
        IntelligentPromptBuilder.buildPrompt = jest.fn().mockReturnValue({
            system: 'أنت مساعد ذكي',
            context: 'السياق',
            instructions: 'التعليمات',
            examples: [],
            constraints: [],
            outputFormat: 'نص'
        });
        IntelligentPromptBuilder.compilePrompt = jest.fn().mockReturnValue('prompt محدد');
        OutputQualityValidator.validateOutput = jest.fn().mockResolvedValue({
            isValid: true,
            metrics: {
                overall: 85,
                completeness: 90,
                accuracy: 80,
                clarity: 85,
                structure: 90,
                relevance: 85
            },
            issues: [],
            suggestions: ['تحسين الوضوح'],
            needsImprovement: false,
            improvementPrompt: undefined
        });
    });

    describe('runImprovementSession', () => {
        test('يجب أن يشغل جلسة تحسين تكرارية كاملة', async () => {
            const result = await IterativeImprovementEngine.runImprovementSession(
                'اكتب تقرير تقني عن الذكاء الاصطناعي',
                'generation',
                'technology',
                [],
                { maxIterations: 2, qualityThreshold: 80 }
            );

            expect(result).toBeDefined();
            expect(result.sessionId).toBeDefined();
            expect(result.originalInput).toBe('اكتب تقرير تقني عن الذكاء الاصطناعي');
            expect(result.contextAnalysis).toEqual(mockContextAnalysis);
            expect(result.iterations).toHaveLength(2);
            expect(result.status).toBe('completed');
            expect(result.maxIterations).toBe(2);
            expect(result.qualityThreshold).toBe(80);
        });

        test('يجب أن يتوقف عند الوصول للجودة المطلوبة', async () => {
            const { OutputQualityValidator } = require('../output-quality-validator');
            OutputQualityValidator.validateOutput = jest.fn().mockResolvedValue({
                isValid: true,
                metrics: {
                    overall: 90,
                    completeness: 95,
                    accuracy: 85,
                    clarity: 90,
                    structure: 95,
                    relevance: 90
                },
                issues: [],
                suggestions: [],
                needsImprovement: false,
                improvementPrompt: undefined
            });

            const result = await IterativeImprovementEngine.runImprovementSession(
                'اكتب مقال قصير',
                'generation',
                'general',
                [],
                { maxIterations: 5, qualityThreshold: 85 }
            );

            expect(result.iterations).toHaveLength(1);
            expect(result.status).toBe('completed');
        });

        test('يجب أن يحترم الحد الأقصى للتكرارات', async () => {
            const result = await IterativeImprovementEngine.runImprovementSession(
                'اكتب محتوى معقد',
                'generation',
                'academic',
                [],
                { maxIterations: 3, qualityThreshold: 95 }
            );

            expect(result.iterations).toHaveLength(3);
            expect(result.status).toBe('completed');
        });

        test('يجب أن يتعامل مع أنواع مختلفة من المحتوى', async () => {
            const testCases = [
                { taskType: 'generation', domain: 'business' },
                { taskType: 'analysis', domain: 'academic' },
                { taskType: 'translation', domain: 'general' },
                { taskType: 'improvement', domain: 'creative' }
            ];

            for (const testCase of testCases) {
                const result = await IterativeImprovementEngine.runImprovementSession(
                    'محتوى للاختبار',
                    testCase.taskType as any,
                    testCase.domain,
                    [],
                    { maxIterations: 1 }
                );

                expect(result).toBeDefined();
                expect(result.iterations).toHaveLength(1);
            }
        });

        test('يجب أن يتعامل مع السياق الخارجي', async () => {
            const externalContext = [
                { fileName: 'doc1.pdf', content: 'محتوى المرجع', type: 'reference' },
                { fileName: 'doc2.docx', content: 'محتوى إضافي', type: 'context' }
            ];

            const result = await IterativeImprovementEngine.runImprovementSession(
                'اكتب تقرير بناءً على المراجع',
                'generation',
                'academic',
                externalContext,
                { maxIterations: 1 }
            );

            expect(result).toBeDefined();
            expect(result.iterations).toHaveLength(1);
        });

        test('يجب أن يتعامل مع الأخطاء بشكل صحيح', async () => {
            const { ContextAnalyzer } = require('../context-analyzer');
            ContextAnalyzer.analyzeContext = jest.fn().mockRejectedValue(new Error('خطأ في التحليل'));

            const result = await IterativeImprovementEngine.runImprovementSession(
                'محتوى للاختبار',
                'generation',
                'general',
                [],
                { maxIterations: 1 }
            );

            expect(result.status).toBe('failed');
            expect(result.iterations).toHaveLength(0);
        });
    });

    describe('analyzeImprovementTrend', () => {
        test('يجب أن يحلل اتجاه التحسين بشكل صحيح', () => {
            const session: ImprovementSession = {
                sessionId: 'test-session',
                originalInput: 'محتوى للاختبار',
                contextAnalysis: mockContextAnalysis,
                iterations: [
                    {
                        iterationNumber: 1,
                        input: 'محتوى للاختبار',
                        output: 'محتوى أول',
                        qualityScore: 70,
                        issues: ['وضوح منخفض'],
                        improvements: ['تحسين الوضوح'],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    },
                    {
                        iterationNumber: 2,
                        input: 'محتوى محسن',
                        output: 'محتوى ثاني',
                        qualityScore: 85,
                        issues: [],
                        improvements: [],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    }
                ],
                finalOutput: 'محتوى ثاني',
                totalImprovementScore: 15,
                status: 'completed',
                maxIterations: 2,
                qualityThreshold: 80
            };

            const trend = IterativeImprovementEngine.analyzeImprovementTrend(session);

            expect(trend.trend).toBe('improving');
            expect(trend.averageImprovement).toBe(15);
            expect(trend.bestIteration).toBe(2);
            expect(trend.recommendations).toContain('التحسين يسير في الاتجاه الصحيح');
        });

        test('يجب أن يتعامل مع الاتجاه المتراجع', () => {
            const session: ImprovementSession = {
                sessionId: 'test-session',
                originalInput: 'محتوى للاختبار',
                contextAnalysis: mockContextAnalysis,
                iterations: [
                    {
                        iterationNumber: 1,
                        input: 'محتوى للاختبار',
                        output: 'محتوى أول',
                        qualityScore: 85,
                        issues: [],
                        improvements: [],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    },
                    {
                        iterationNumber: 2,
                        input: 'محتوى محسن',
                        output: 'محتوى ثاني',
                        qualityScore: 70,
                        issues: ['جودة منخفضة'],
                        improvements: ['تحسين الجودة'],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    }
                ],
                finalOutput: 'محتوى ثاني',
                totalImprovementScore: -15,
                status: 'completed',
                maxIterations: 2,
                qualityThreshold: 80
            };

            const trend = IterativeImprovementEngine.analyzeImprovementTrend(session);

            expect(trend.trend).toBe('declining');
            expect(trend.averageImprovement).toBe(-15);
            expect(trend.bestIteration).toBe(1);
            expect(trend.recommendations).toContain('جودة المخرجات تتراجع - راجع الاستراتيجية');
        });

        test('يجب أن يتعامل مع الاتجاه المستقر', () => {
            const session: ImprovementSession = {
                sessionId: 'test-session',
                originalInput: 'محتوى للاختبار',
                contextAnalysis: mockContextAnalysis,
                iterations: [
                    {
                        iterationNumber: 1,
                        input: 'محتوى للاختبار',
                        output: 'محتوى أول',
                        qualityScore: 80,
                        issues: [],
                        improvements: [],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    },
                    {
                        iterationNumber: 2,
                        input: 'محتوى محسن',
                        output: 'محتوى ثاني',
                        qualityScore: 82,
                        issues: [],
                        improvements: [],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    }
                ],
                finalOutput: 'محتوى ثاني',
                totalImprovementScore: 2,
                status: 'completed',
                maxIterations: 2,
                qualityThreshold: 80
            };

            const trend = IterativeImprovementEngine.analyzeImprovementTrend(session);

            expect(trend.trend).toBe('stable');
            expect(trend.averageImprovement).toBe(2);
            expect(trend.bestIteration).toBe(2);
            expect(trend.recommendations).toContain('التحسين محدود - قد تحتاج لتغيير النهج');
        });

        test('يجب أن يتعامل مع التكرار الواحد', () => {
            const session: ImprovementSession = {
                sessionId: 'test-session',
                originalInput: 'محتوى للاختبار',
                contextAnalysis: mockContextAnalysis,
                iterations: [
                    {
                        iterationNumber: 1,
                        input: 'محتوى للاختبار',
                        output: 'محتوى أول',
                        qualityScore: 80,
                        issues: [],
                        improvements: [],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    }
                ],
                finalOutput: 'محتوى أول',
                totalImprovementScore: 0,
                status: 'completed',
                maxIterations: 1,
                qualityThreshold: 80
            };

            const trend = IterativeImprovementEngine.analyzeImprovementTrend(session);

            expect(trend.trend).toBe('stable');
            expect(trend.averageImprovement).toBe(0);
            expect(trend.bestIteration).toBe(1);
            expect(trend.recommendations).toContain('يحتاج المزيد من التكرارات للتقييم');
        });
    });

    describe('getBestOutput', () => {
        test('يجب أن يعيد أفضل مخرجات من الجلسة', () => {
            const session: ImprovementSession = {
                sessionId: 'test-session',
                originalInput: 'محتوى للاختبار',
                contextAnalysis: mockContextAnalysis,
                iterations: [
                    {
                        iterationNumber: 1,
                        input: 'محتوى للاختبار',
                        output: 'محتوى أول',
                        qualityScore: 70,
                        issues: ['وضوح منخفض'],
                        improvements: ['تحسين الوضوح'],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    },
                    {
                        iterationNumber: 2,
                        input: 'محتوى محسن',
                        output: 'محتوى ثاني',
                        qualityScore: 85,
                        issues: [],
                        improvements: [],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    },
                    {
                        iterationNumber: 3,
                        input: 'محتوى محسن أكثر',
                        output: 'محتوى ثالث',
                        qualityScore: 80,
                        issues: ['تحسين طفيف'],
                        improvements: ['تحسين طفيف'],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    }
                ],
                finalOutput: 'محتوى ثالث',
                totalImprovementScore: 10,
                status: 'completed',
                maxIterations: 3,
                qualityThreshold: 80
            };

            const bestOutput = IterativeImprovementEngine.getBestOutput(session);

            expect(bestOutput.output).toBe('محتوى ثاني');
            expect(bestOutput.iterationNumber).toBe(2);
            expect(bestOutput.qualityScore).toBe(85);
        });

        test('يجب أن يتعامل مع الجلسة الفارغة', () => {
            const session: ImprovementSession = {
                sessionId: 'test-session',
                originalInput: 'محتوى للاختبار',
                contextAnalysis: mockContextAnalysis,
                iterations: [],
                finalOutput: '',
                totalImprovementScore: 0,
                status: 'failed',
                maxIterations: 1,
                qualityThreshold: 80
            };

            const bestOutput = IterativeImprovementEngine.getBestOutput(session);

            expect(bestOutput.output).toBe('');
            expect(bestOutput.iterationNumber).toBe(0);
            expect(bestOutput.qualityScore).toBe(0);
        });
    });

    describe('generateSessionReport', () => {
        test('يجب أن ينتج تقرير مفصل عن الجلسة', () => {
            const session: ImprovementSession = {
                sessionId: 'test-session-123',
                originalInput: 'اكتب تقرير تقني',
                contextAnalysis: mockContextAnalysis,
                iterations: [
                    {
                        iterationNumber: 1,
                        input: 'اكتب تقرير تقني',
                        output: 'تقرير أول',
                        qualityScore: 70,
                        issues: ['وضوح منخفض', 'معلومات ناقصة'],
                        improvements: ['تحسين الوضوح', 'إضافة معلومات'],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    },
                    {
                        iterationNumber: 2,
                        input: 'اكتب تقرير تقني محسن',
                        output: 'تقرير ثاني',
                        qualityScore: 85,
                        issues: [],
                        improvements: [],
                        modelUsed: 'googleai/gemini-1.5-pro',
                        timestamp: new Date()
                    }
                ],
                finalOutput: 'تقرير ثاني',
                totalImprovementScore: 15,
                status: 'completed',
                maxIterations: 2,
                qualityThreshold: 80
            };

            const report = IterativeImprovementEngine.generateSessionReport(session);

            expect(report).toContain('تقرير جلسة التحسين التكراري');
            expect(report).toContain('test-session-123');
            expect(report).toContain('completed');
            expect(report).toContain('2');
            expect(report).toContain('15.0');
            expect(report).toContain('تحليل الاتجاه');
            expect(report).toContain('التوصيات');
            expect(report).toContain('تفاصيل التكرارات');
        });
    });

    describe('saveSession and loadSession', () => {
        test('يجب أن يحفظ الجلسة', async () => {
            const session: ImprovementSession = {
                sessionId: 'test-session',
                originalInput: 'محتوى للاختبار',
                contextAnalysis: mockContextAnalysis,
                iterations: [],
                finalOutput: '',
                totalImprovementScore: 0,
                status: 'completed',
                maxIterations: 1,
                qualityThreshold: 80
            };

            // يجب ألا يرمي خطأ
            await expect(IterativeImprovementEngine.saveSession(session)).resolves.toBeUndefined();
        });

        test('يجب أن يسترجع الجلسة', async () => {
            const result = await IterativeImprovementEngine.loadSession('test-session-id');

            // في التطبيق الحقيقي، سيتم استرجاع الجلسة من قاعدة البيانات
            // حالياً، يعيد null
            expect(result).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        test('يجب أن يتعامل مع المخرجات الفارغة', async () => {
            const { OutputQualityValidator } = require('../output-quality-validator');
            OutputQualityValidator.validateOutput = jest.fn().mockResolvedValue({
                isValid: false,
                metrics: {
                    overall: 0,
                    completeness: 0,
                    accuracy: 0,
                    clarity: 0,
                    structure: 0,
                    relevance: 0
                },
                issues: ['محتوى فارغ'],
                suggestions: ['أضف محتوى'],
                needsImprovement: true,
                improvementPrompt: 'أضف محتوى مفيد'
            });

            const result = await IterativeImprovementEngine.runImprovementSession(
                '',
                'generation',
                'general',
                [],
                { maxIterations: 1 }
            );

            expect(result.iterations).toHaveLength(1);
            expect(result.iterations[0].qualityScore).toBe(0);
        });

        test('يجب أن يتعامل مع المخرجات الطويلة جداً', async () => {
            const longOutput = 'محتوى طويل جداً '.repeat(1000);
            const { OutputQualityValidator } = require('../output-quality-validator');
            OutputQualityValidator.validateOutput = jest.fn().mockResolvedValue({
                isValid: true,
                metrics: {
                    overall: 75,
                    completeness: 80,
                    accuracy: 70,
                    clarity: 75,
                    structure: 80,
                    relevance: 75
                },
                issues: ['محتوى طويل جداً'],
                suggestions: ['تقصير المحتوى'],
                needsImprovement: true,
                improvementPrompt: 'اختصر المحتوى'
            });

            const result = await IterativeImprovementEngine.runImprovementSession(
                'اكتب محتوى طويل جداً',
                'generation',
                'general',
                [],
                { maxIterations: 1 }
            );

            expect(result.iterations).toHaveLength(1);
            expect(result.iterations[0].qualityScore).toBe(75);
        });

        test('يجب أن يتعامل مع الأحرف الخاصة', async () => {
            const result = await IterativeImprovementEngine.runImprovementSession(
                'اكتب محتوى يحتوي على أحرف خاصة: @#$%^&*()',
                'generation',
                'general',
                [],
                { maxIterations: 1 }
            );

            expect(result.iterations).toHaveLength(1);
            expect(result.iterations[0].input).toContain('@#$%^&*()');
        });

        test('يجب أن يتعامل مع المحتوى متعدد اللغات', async () => {
            const result = await IterativeImprovementEngine.runImprovementSession(
                'Write content in English and Arabic: اكتب محتوى بالعربية والإنجليزية',
                'generation',
                'general',
                [],
                { maxIterations: 1 }
            );

            expect(result.iterations).toHaveLength(1);
            expect(result.iterations[0].input).toContain('English');
            expect(result.iterations[0].input).toContain('العربية');
        });

        test('يجب أن يتعامل مع الحد الأقصى للتكرارات = 0', async () => {
            const result = await IterativeImprovementEngine.runImprovementSession(
                'محتوى للاختبار',
                'generation',
                'general',
                [],
                { maxIterations: 0 }
            );

            expect(result.iterations).toHaveLength(0);
            expect(result.status).toBe('failed');
        });

        test('يجب أن يتعامل مع عتبة الجودة العالية جداً', async () => {
            const result = await IterativeImprovementEngine.runImprovementSession(
                'محتوى للاختبار',
                'generation',
                'general',
                [],
                { maxIterations: 1, qualityThreshold: 100 }
            );

            expect(result.iterations).toHaveLength(1);
            expect(result.status).toBe('completed');
        });
    });
});
