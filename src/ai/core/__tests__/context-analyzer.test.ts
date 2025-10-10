/**
 * اختبارات شاملة لتحليل السياق (ContextAnalyzer)
 * يغطي جميع وظائف تحليل السياق وفهم المتطلبات
 */

import { ContextAnalysisSchema, ContextAnalyzer } from '../context-analyzer';
import { ContextOrganizer } from '../context-organizer';

// Mock لمنظم السياقات
jest.mock('../context-organizer', () => ({
    ContextOrganizer: {
        organizeContexts: jest.fn().mockReturnValue({
            foundational: [],
            conceptual: [],
            procedural: [],
            reference: [],
            guidelines: [],
            statistics: {
                totalItems: 0,
                byType: {},
                byPriority: {},
                averageRelevance: 0
            }
        })
    }
}));

describe('ContextAnalyzer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('analyzeContext', () => {
        it('should analyze basic context correctly', async () => {
            const input = {
                userInput: 'أنشئ خطة عمل لمشروع تقني',
                projectType: 'technical',
                externalContext: [
                    {
                        fileName: 'requirements.txt',
                        content: 'متطلبات المشروع التقني',
                        type: 'context'
                    }
                ],
                guidelines: ['يجب أن يكون المحتوى مهنياً']
            };

            const result = await ContextAnalyzer.analyzeContext(input);

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

        it('should detect technical content type', async () => {
            const technicalInputs = [
                'أنشئ نظام إدارة قاعدة بيانات',
                'تطوير API متقدم',
                'معمارية النظام التقني',
                'خوارزمية تحليل البيانات'
            ];

            for (const input of technicalInputs) {
                const result = await ContextAnalyzer.analyzeContext({
                    userInput: input
                });

                expect(result.contentType).toBe('technical');
            }
        });

        it('should detect business content type', async () => {
            const businessInputs = [
                'أنشئ خطة عمل تجارية',
                'تحليل السوق والمنافسين',
                'استراتيجية التسويق',
                'دراسة الجدوى المالية'
            ];

            for (const input of businessInputs) {
                const result = await ContextAnalyzer.analyzeContext({
                    userInput: input
                });

                expect(result.contentType).toBe('business');
            }
        });

        it('should detect academic content type', async () => {
            const academicInputs = [
                'بحث أكاديمي حول الذكاء الاصطناعي',
                'دراسة علمية شاملة',
                'تحليل منهجي للبيانات',
                'أطروحة الدكتوراه'
            ];

            for (const input of academicInputs) {
                const result = await ContextAnalyzer.analyzeContext({
                    userInput: input
                });

                expect(result.contentType).toBe('academic');
            }
        });

        it('should detect creative content type', async () => {
            const creativeInputs = [
                'اكتب قصة قصيرة إبداعية',
                'تصميم حملة إعلانية',
                'محتوى تسويقي جذاب',
                'سرد قصصي مميز'
            ];

            for (const input of creativeInputs) {
                const result = await ContextAnalyzer.analyzeContext({
                    userInput: input
                });

                expect(result.contentType).toBe('creative');
            }
        });

        it('should detect mixed content type', async () => {
            const mixedInput = 'أنشئ خطة عمل تقنية مع تحليل السوق وإبداع تسويقي';

            const result = await ContextAnalyzer.analyzeContext({
                userInput: mixedInput
            });

            expect(result.contentType).toBe('mixed');
        });

        it('should assess complexity levels correctly', async () => {
            // Basic complexity
            const basicResult = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ قائمة بسيطة'
            });
            expect(basicResult.complexityLevel).toBe('basic');

            // Intermediate complexity
            const intermediateResult = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ خطة عمل متوسطة التعقيد مع تحليل السوق',
                externalContext: [
                    {
                        fileName: 'market-data.txt',
                        content: 'بيانات السوق',
                        type: 'context'
                    }
                ]
            });
            expect(intermediateResult.complexityLevel).toBe('intermediate');

            // Advanced complexity
            const advancedResult = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ نظام إدارة متقدم مع معمارية معقدة وتحسين الأداء',
                externalContext: [
                    {
                        fileName: 'architecture.md',
                        content: 'معمارية النظام المعقدة',
                        type: 'context'
                    },
                    {
                        fileName: 'performance.txt',
                        content: 'متطلبات الأداء',
                        type: 'context'
                    }
                ]
            });
            expect(advancedResult.complexityLevel).toBe('advanced');

            // Expert complexity
            const expertResult = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ نظام إدارة متقدم مع معمارية معقدة وتحسين الأداء وتكامل متعدد الأنظمة',
                externalContext: [
                    {
                        fileName: 'architecture.md',
                        content: 'معمارية النظام المعقدة',
                        type: 'context'
                    },
                    {
                        fileName: 'performance.txt',
                        content: 'متطلبات الأداء',
                        type: 'context'
                    },
                    {
                        fileName: 'integration.txt',
                        content: 'متطلبات التكامل',
                        type: 'context'
                    }
                ]
            });
            expect(expertResult.complexityLevel).toBe('expert');
        });

        it('should identify target audience correctly', async () => {
            // Student audience
            const studentResult = await ContextAnalyzer.analyzeContext({
                userInput: 'حل واجب الطالب في البرمجة'
            });
            expect(studentResult.targetAudience).toBe('student');

            // Academic audience
            const academicResult = await ContextAnalyzer.analyzeContext({
                userInput: 'بحث أكاديمي شامل'
            });
            expect(academicResult.targetAudience).toBe('academic');

            // Executive audience
            const executiveResult = await ContextAnalyzer.analyzeContext({
                userInput: 'استراتيجية إدارية للتنفيذيين'
            });
            expect(executiveResult.targetAudience).toBe('executive');

            // Technical audience
            const technicalResult = await ContextAnalyzer.analyzeContext({
                userInput: 'تطوير تقني للمهندسين'
            });
            expect(technicalResult.targetAudience).toBe('technical');

            // General audience
            const generalResult = await ContextAnalyzer.analyzeContext({
                userInput: 'محتوى عام للجمهور'
            });
            expect(generalResult.targetAudience).toBe('general');
        });

        it('should detect language correctly', async () => {
            // Arabic text
            const arabicResult = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ خطة عمل باللغة العربية'
            });
            expect(arabicResult.language).toBe('ar');

            // English text
            const englishResult = await ContextAnalyzer.analyzeContext({
                userInput: 'Create a business plan in English'
            });
            expect(englishResult.language).toBe('en');
        });

        it('should detect cultural context correctly', async () => {
            // Middle East context
            const middleEastResult = await ContextAnalyzer.analyzeContext({
                userInput: 'خطة عمل للشرق الأوسط والخليج العربي'
            });
            expect(middleEastResult.culturalContext).toBe('middle-east');

            // Western context
            const westernResult = await ContextAnalyzer.analyzeContext({
                userInput: 'Business plan for Western Europe and America'
            });
            expect(westernResult.culturalContext).toBe('western');

            // Global context
            const globalResult = await ContextAnalyzer.analyzeContext({
                userInput: 'خطة عمل عالمية'
            });
            expect(globalResult.culturalContext).toBe('global');
        });

        it('should extract requirements correctly', async () => {
            const input = {
                userInput: 'يجب أن يكون النظام آمناً. يجب أن يدعم المستخدمين المتعددين. يجب أن يكون سريعاً.',
                guidelines: ['يجب أن يكون المحتوى مهنياً', 'يجب أن يكون واضحاً']
            };

            const result = await ContextAnalyzer.analyzeContext(input);

            expect(result.specificRequirements).toContain('يجب أن يكون النظام آمناً');
            expect(result.specificRequirements).toContain('يجب أن يدعم المستخدمين المتعددين');
            expect(result.specificRequirements).toContain('يجب أن يكون سريعاً');
            expect(result.specificRequirements).toContain('يجب أن يكون المحتوى مهنياً');
            expect(result.specificRequirements).toContain('يجب أن يكون واضحاً');
        });

        it('should analyze available context correctly', async () => {
            const externalContext = [
                {
                    fileName: 'requirements.txt',
                    content: 'متطلبات المشروع',
                    type: 'context'
                },
                {
                    fileName: 'example.md',
                    content: 'مثال على التطبيق',
                    type: 'example'
                },
                {
                    fileName: 'questions.txt',
                    content: 'أسئلة شائعة',
                    type: 'questions'
                },
                {
                    fileName: 'textbook.pdf',
                    content: 'كتاب مرجعي',
                    type: 'textbook'
                },
                {
                    fileName: 'guidelines.md',
                    content: 'إرشادات التطوير',
                    type: 'guidelines'
                }
            ];

            const result = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ نظام إدارة',
                externalContext,
                guidelines: ['إرشاد 1', 'إرشاد 2']
            });

            expect(result.availableContext.files).toHaveLength(5);
            expect(result.availableContext.guidelines).toHaveLength(2);
            expect(result.availableContext.guidelines).toContain('إرشاد 1');
            expect(result.availableContext.guidelines).toContain('إرشاد 2');

            // Check file relevance
            result.availableContext.files.forEach(file => {
                expect(file.relevance).toBeGreaterThanOrEqual(0);
                expect(file.relevance).toBeLessThanOrEqual(1);
            });
        });

        it('should organize contexts when external context is provided', async () => {
            const externalContext = [
                {
                    fileName: 'requirements.txt',
                    content: 'متطلبات المشروع',
                    type: 'context'
                },
                {
                    fileName: 'example.md',
                    content: 'مثال على التطبيق',
                    type: 'example'
                }
            ];

            const result = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ نظام إدارة',
                externalContext,
                targetSection: 'المقدمة'
            });

            expect(ContextOrganizer.organizeContexts).toHaveBeenCalled();
            expect(result.availableContext.organizedContext).toBeDefined();
        });

        it('should recommend appropriate models', async () => {
            // Technical content should recommend Pro model
            const technicalResult = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ نظام إدارة قاعدة بيانات متقدم'
            });
            expect(technicalResult.modelRecommendation.primary).toContain('gemini-1.5-pro');

            // Creative content should recommend Pro model
            const creativeResult = await ContextAnalyzer.analyzeContext({
                userInput: 'اكتب قصة قصيرة إبداعية'
            });
            expect(creativeResult.modelRecommendation.primary).toContain('gemini-1.5-pro');

            // Executive audience should recommend Pro model
            const executiveResult = await ContextAnalyzer.analyzeContext({
                userInput: 'استراتيجية إدارية للتنفيذيين'
            });
            expect(executiveResult.modelRecommendation.primary).toContain('gemini-1.5-pro');

            // General content should recommend Flash model
            const generalResult = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ قائمة بسيطة'
            });
            expect(generalResult.modelRecommendation.primary).toContain('gemini-2.0-flash');
        });

        it('should handle empty input gracefully', async () => {
            const result = await ContextAnalyzer.analyzeContext({
                userInput: ''
            });

            expect(result).toBeDefined();
            expect(result.contentType).toBeDefined();
            expect(result.complexityLevel).toBeDefined();
            expect(result.targetAudience).toBeDefined();
        });

        it('should handle very long input', async () => {
            const longInput = 'أ'.repeat(10000);

            const result = await ContextAnalyzer.analyzeContext({
                userInput: longInput
            });

            expect(result).toBeDefined();
            expect(result.complexityLevel).toBe('expert');
        });

        it('should handle special characters and emojis', async () => {
            const specialInput = 'أنشئ خطة عمل 🚀 لمشروع تقني #AI #MachineLearning';

            const result = await ContextAnalyzer.analyzeContext({
                userInput: specialInput
            });

            expect(result).toBeDefined();
            expect(result.language).toBe('ar');
        });

        it('should handle mixed language input', async () => {
            const mixedInput = 'أنشئ business plan لمشروع تقني مع AI capabilities';

            const result = await ContextAnalyzer.analyzeContext({
                userInput: mixedInput
            });

            expect(result).toBeDefined();
            expect(result.language).toBeDefined();
        });

        it('should validate result against schema', async () => {
            const result = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ خطة عمل',
                externalContext: [
                    {
                        fileName: 'requirements.txt',
                        content: 'متطلبات المشروع',
                        type: 'context'
                    }
                ],
                guidelines: ['يجب أن يكون المحتوى مهنياً']
            });

            // Validate against schema
            const validation = ContextAnalysisSchema.safeParse(result);
            expect(validation.success).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle null and undefined values', async () => {
            const result = await ContextAnalyzer.analyzeContext({
                userInput: 'test',
                externalContext: undefined,
                guidelines: undefined,
                projectType: undefined,
                previousOutput: undefined,
                targetSection: undefined
            });

            expect(result).toBeDefined();
            expect(result.availableContext.files).toHaveLength(0);
            expect(result.availableContext.guidelines).toHaveLength(0);
        });

        it('should handle malformed external context', async () => {
            const malformedContext = [
                {
                    fileName: 'file1.txt',
                    content: null as any,
                    type: 'context'
                },
                {
                    fileName: '',
                    content: 'valid content',
                    type: 'context'
                }
            ];

            const result = await ContextAnalyzer.analyzeContext({
                userInput: 'test',
                externalContext: malformedContext
            });

            expect(result).toBeDefined();
            expect(result.availableContext.files).toHaveLength(2);
        });

        it('should handle concurrent analysis requests', async () => {
            const requests = Array.from({ length: 5 }, (_, i) =>
                ContextAnalyzer.analyzeContext({
                    userInput: `طلب ${i}`
                })
            );

            const results = await Promise.all(requests);

            expect(results).toHaveLength(5);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.contentType).toBeDefined();
                expect(result.complexityLevel).toBeDefined();
            });
        });

        it('should handle very large external context', async () => {
            const largeContext = Array.from({ length: 100 }, (_, i) => ({
                fileName: `file${i}.txt`,
                content: `محتوى الملف ${i}`.repeat(100),
                type: 'context'
            }));

            const result = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ تقرير شامل',
                externalContext: largeContext
            });

            expect(result).toBeDefined();
            expect(result.availableContext.files).toHaveLength(100);
            expect(result.complexityLevel).toBe('expert');
        });
    });

    describe('Performance Tests', () => {
        it('should complete analysis within reasonable time', async () => {
            const startTime = Date.now();

            await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ نظام إدارة متقدم مع معمارية معقدة',
                externalContext: Array.from({ length: 10 }, (_, i) => ({
                    fileName: `file${i}.txt`,
                    content: `محتوى الملف ${i}`,
                    type: 'context'
                }))
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete within 1 second
            expect(duration).toBeLessThan(1000);
        });

        it('should handle memory efficiently', async () => {
            const initialMemory = process.memoryUsage().heapUsed;

            // Process multiple large contexts
            for (let i = 0; i < 10; i++) {
                await ContextAnalyzer.analyzeContext({
                    userInput: `طلب ${i}`,
                    externalContext: Array.from({ length: 50 }, (_, j) => ({
                        fileName: `file${j}.txt`,
                        content: `محتوى الملف ${j}`.repeat(50),
                        type: 'context'
                    }))
                });
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            // Memory increase should be reasonable (less than 50MB)
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        });
    });

    describe('Integration with ContextOrganizer', () => {
        it('should integrate with ContextOrganizer correctly', async () => {
            const mockOrganizedContext = {
                foundational: [
                    {
                        fileName: 'requirements.txt',
                        content: 'متطلبات المشروع',
                        type: 'context',
                        relevance: 0.9,
                        knowledgeLevel: 'foundational',
                        priority: 'critical'
                    }
                ],
                conceptual: [],
                procedural: [],
                reference: [],
                guidelines: [],
                statistics: {
                    totalItems: 1,
                    byType: { context: 1 },
                    byPriority: { critical: 1 },
                    averageRelevance: 0.9
                }
            };

            (ContextOrganizer.organizeContexts as jest.Mock).mockReturnValue(mockOrganizedContext);

            const result = await ContextAnalyzer.analyzeContext({
                userInput: 'أنشئ نظام إدارة',
                externalContext: [
                    {
                        fileName: 'requirements.txt',
                        content: 'متطلبات المشروع',
                        type: 'context'
                    }
                ]
            });

            expect(ContextOrganizer.organizeContexts).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        fileName: 'requirements.txt',
                        content: 'متطلبات المشروع',
                        type: 'context'
                    })
                ]),
                undefined,
                expect.any(Array)
            );

            expect(result.availableContext.organizedContext).toEqual(mockOrganizedContext);
        });
    });
});
