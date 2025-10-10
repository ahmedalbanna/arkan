import { AdaptiveModelSelector } from '../adaptive-model-selector';
import { AIErrorHandler } from '../ai-error-handler';
import { ContextAnalyzer } from '../context-analyzer';
import { ContextOrganizer } from '../context-organizer';
import { IntelligentAISystem } from '../index';
import { IntelligentPromptBuilder } from '../intelligent-prompt-builder';
import { IterativeImprovementEngine } from '../iterative-improvement-engine';
import { OutputQualityValidator } from '../output-quality-validator';
import { PerformanceMonitor } from '../performance-monitor';

describe('AI System Integration Tests', () => {
    let mockContextAnalysis: any;

    beforeEach(() => {
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
    });
    describe('Full AI Flow Integration', () => {
        it('should execute complete intelligent flow successfully', async () => {
            const config = {
                userInput: 'اكتب تقرير شامل عن حالة المشروع الحالي',
                taskType: 'generation' as const,
                domain: 'business',
                externalContext: [
                    {
                        fileName: 'project-data.xlsx',
                        content: 'بيانات المشروع المالية والإحصائية',
                        type: 'spreadsheet'
                    },
                    {
                        fileName: 'meeting-notes.txt',
                        content: 'ملاحظات الاجتماع الأخير',
                        type: 'text'
                    }
                ],
                guidelines: [
                    'استخدم البيانات المرفقة',
                    'ركز على الإنجازات والتحديات',
                    'قدم توصيات واضحة'
                ],
                qualityThreshold: 0.8,
                maxIterations: 3,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.output).toBeDefined();
            expect(result.output.length).toBeGreaterThan(0);
            expect(result.qualityScore).toBeGreaterThan(0.7);
            expect(result.iterations).toBeGreaterThan(0);
            expect(result.modelUsed).toBeDefined();
            expect(result.contextAnalysis).toBeDefined();
            expect(result.performanceSessionId).toBeDefined();
        });

        it('should handle business report generation flow', async () => {
            const config = {
                userInput: 'اكتب تقرير مالي شامل للربع الأخير',
                taskType: 'generation' as const,
                domain: 'business',
                externalContext: [
                    {
                        fileName: 'financial-data.xlsx',
                        content: 'البيانات المالية للربع الأخير',
                        type: 'spreadsheet'
                    },
                    {
                        fileName: 'market-analysis.pdf',
                        content: 'تحليل السوق والمنافسين',
                        type: 'document'
                    }
                ],
                guidelines: [
                    'استخدم البيانات المالية المرفقة',
                    'قارن مع الأرباع السابقة',
                    'قدم تحليل شامل للأداء'
                ],
                qualityThreshold: 0.85,
                maxIterations: 2,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.output).toBeDefined();
            expect(result.output.length).toBeGreaterThan(100);
            expect(result.qualityScore).toBeGreaterThan(0.8);
            expect(result.iterations).toBeGreaterThan(0);
            expect(result.modelUsed).toBeDefined();
            expect(result.contextAnalysis).toBeDefined();
        });

        it('should handle technical documentation flow', async () => {
            const config = {
                userInput: 'اكتب وثائق تقنية شاملة للنظام',
                taskType: 'generation' as const,
                domain: 'technical',
                externalContext: [
                    {
                        fileName: 'system-architecture.pdf',
                        content: 'مخططات النظام والمعمارية',
                        type: 'document'
                    },
                    {
                        fileName: 'api-endpoints.json',
                        content: 'قائمة نقاط API',
                        type: 'code'
                    }
                ],
                guidelines: [
                    'استخدم المخططات المرفقة',
                    'اشرح الواجهات والوظائف',
                    'قدم أمثلة عملية'
                ],
                qualityThreshold: 0.8,
                maxIterations: 3,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.output).toBeDefined();
            expect(result.output.length).toBeGreaterThan(100);
            expect(result.qualityScore).toBeGreaterThan(0.7);
            expect(result.iterations).toBeGreaterThan(0);
            expect(result.modelUsed).toBeDefined();
            expect(result.contextAnalysis).toBeDefined();
        });

        it('should handle academic research flow', async () => {
            const config = {
                userInput: 'اكتب بحث أكاديمي عن تأثير الذكاء الاصطناعي على التعليم',
                taskType: 'generation' as const,
                domain: 'academic',
                externalContext: [
                    {
                        fileName: 'research-papers.pdf',
                        content: 'أوراق بحثية عن الذكاء الاصطناعي في التعليم',
                        type: 'document'
                    },
                    {
                        fileName: 'statistics-data.xlsx',
                        content: 'إحصائيات استخدام الذكاء الاصطناعي في التعليم',
                        type: 'spreadsheet'
                    }
                ],
                guidelines: [
                    'استخدم المراجع الأكاديمية',
                    'اتبع معايير الكتابة الأكاديمية',
                    'قدم تحليل نقدي'
                ],
                qualityThreshold: 0.9,
                maxIterations: 4,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.output).toBeDefined();
            expect(result.output.length).toBeGreaterThan(200);
            expect(result.qualityScore).toBeGreaterThan(0.8);
            expect(result.iterations).toBeGreaterThan(0);
            expect(result.modelUsed).toBeDefined();
            expect(result.contextAnalysis).toBeDefined();
        });

        it('should handle creative writing flow', async () => {
            const config = {
                userInput: 'اكتب قصة قصيرة عن مغامرة في الفضاء',
                taskType: 'generation' as const,
                domain: 'creative',
                externalContext: [
                    {
                        fileName: 'character-profiles.txt',
                        content: 'ملفات الشخصيات الرئيسية',
                        type: 'text'
                    },
                    {
                        fileName: 'plot-outline.txt',
                        content: 'مخطط القصة والأحداث',
                        type: 'text'
                    }
                ],
                guidelines: [
                    'استخدم الشخصيات المحددة',
                    'اتبع مخطط القصة',
                    'اجعل القصة مثيرة ومشوقة'
                ],
                qualityThreshold: 0.7,
                maxIterations: 2,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.output).toBeDefined();
            expect(result.output.length).toBeGreaterThan(100);
            expect(result.qualityScore).toBeGreaterThan(0.6);
            expect(result.iterationsUsed).toBeGreaterThan(0);
            expect(result.modelUsed).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
        });
    });

    describe('Component Integration Tests', () => {
        it('should integrate context analysis with model selection', async () => {
            const context = {
                userInput: 'اكتب تقرير شامل عن حالة المشروع',
                projectType: 'business',
                externalContext: [
                    {
                        fileName: 'project-data.xlsx',
                        content: 'بيانات المشروع',
                        type: 'spreadsheet'
                    }
                ],
                guidelines: ['استخدم البيانات المرفقة'],
                previousOutput: '',
                targetSection: 'executive-summary'
            };

            const analysisResult = await ContextAnalyzer.analyzeContext(context);
            const modelConfig = AdaptiveModelSelector.selectOptimalModel(analysisResult, 'generation');

            expect(analysisResult).toBeDefined();
            expect(analysisResult.contentType).toBeDefined();
            expect(analysisResult.complexityLevel).toBeDefined();
            expect(analysisResult.targetAudience).toBeDefined();
            expect(analysisResult.modelRecommendation).toBeDefined();

            expect(modelConfig).toBeDefined();
            expect(modelConfig.modelId).toBeDefined();
            expect(modelConfig.temperature).toBeGreaterThan(0);
            expect(modelConfig.maxOutputTokens).toBeGreaterThan(0);
            expect(modelConfig.reasoning).toBeDefined();
        });

        it('should integrate prompt building with quality validation', async () => {
            const context = {
                userInput: 'اكتب تقرير شامل',
                taskType: 'generation' as const,
                domain: 'business',
                externalContext: [
                    {
                        fileName: 'data.xlsx',
                        content: 'بيانات المشروع',
                        type: 'spreadsheet'
                    }
                ],
                guidelines: ['استخدم البيانات المرفقة'],
                previousOutput: '',
                targetSection: 'main-content'
            };

            const promptConfig = {
                taskType: 'generation' as const,
                domain: 'business',
                contextAnalysis: mockContextAnalysis,
                userInput: 'اكتب تقرير شامل',
                externalContext: context.externalContext,
                guidelines: context.guidelines,
                previousOutput: context.previousOutput,
                targetSection: context.targetSection
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(promptConfig);
            const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);

            const output = 'هذا تقرير شامل عن حالة المشروع يحتوي على تحليل مفصل للأداء المالي والإنجازات المحققة.';
            const qualityResult = await OutputQualityValidator.validateOutput(output, context.userInput, mockContextAnalysis);

            expect(promptTemplate).toBeDefined();
            expect(compiledPrompt).toBeDefined();
            expect(promptTemplate.system).toBeDefined();
            expect(promptTemplate.context).toBeDefined();
            expect(promptTemplate.instructions).toBeDefined();
            expect(promptTemplate.examples).toBeDefined();
            expect(promptTemplate.constraints).toBeDefined();
            expect(promptTemplate.outputFormat).toBeDefined();

            expect(qualityResult).toBeDefined();
            expect(qualityResult.metrics.overall).toBeGreaterThan(0);
            expect(qualityResult.metrics).toBeDefined();
            expect(qualityResult.isValid).toBeDefined();
            expect(qualityResult.issues).toBeDefined();
        });

        it('should integrate iterative improvement with performance monitoring', async () => {
            const initialOutput = 'نص قصير يحتاج تحسين.';
            const context = {
                userInput: 'اكتب تقرير شامل',
                taskType: 'generation' as const,
                domain: 'business',
                qualityThreshold: 0.8,
                maxIterations: 3
            };

            const sessionId = PerformanceMonitor.startSession({
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            });

            const improvementResult = await IterativeImprovementEngine.runImprovementSession(
                initialOutput,
                'generation',
                'business',
                [],
                {
                    maxIterations: 3,
                    qualityThreshold: 0.8
                }
            );

            PerformanceMonitor.recordQualityMetrics(sessionId, {
                qualityScore: improvementResult.iterations[improvementResult.iterations.length - 1]?.qualityScore || 0,
                improvementIterations: improvementResult.iterations.length
            });

            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(improvementResult).toBeDefined();
            expect(improvementResult.finalOutput).toBeDefined();
            expect(improvementResult.iterations.length).toBeGreaterThan(0);
            expect(improvementResult.iterations[improvementResult.iterations.length - 1]?.qualityScore).toBeGreaterThan(0);

            expect(session).toBeDefined();
            expect(session?.metrics.qualityScore).toBeGreaterThan(0);
            expect(session?.metrics.improvementIterations).toBeGreaterThan(0);
        });

        it('should integrate error handling with context organization', async () => {
            const contexts = [
                {
                    fileName: 'data.xlsx',
                    content: 'بيانات المشروع',
                    type: 'context' as const,
                    relevance: 0.8,
                    knowledgeLevel: 'foundational' as const,
                    priority: 'important' as const
                }
            ];

            const organizedContext = ContextOrganizer.organizeContexts(contexts);
            const error = new Error('API timeout');
            const errorResult = await AIErrorHandler.handleAIError(error, {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            });

            expect(organizedContext).toBeDefined();
            expect(organizedContext.foundational).toBeDefined();
            expect(organizedContext.conceptual).toBeDefined();
            expect(organizedContext.reference).toBeDefined();

            expect(errorResult).toBeDefined();
            expect(errorResult.success).toBe(false);
            expect(errorResult.error).toBeDefined();
            expect(errorResult.strategies).toBeDefined();
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle API timeout errors gracefully', async () => {
            const config = {
                userInput: 'اكتب تقرير شامل',
                taskType: 'generation' as const,
                domain: 'business',
                externalContext: [],
                guidelines: ['اكتب نص مفيد'],
                qualityThreshold: 0.7,
                maxIterations: 2,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            // Mock API timeout error
            const originalRunIntelligentFlow = IntelligentAISystem.runIntelligentFlow;
            IntelligentAISystem.runIntelligentFlow = jest.fn().mockRejectedValue(new Error('API timeout after 30 seconds'));

            try {
                await IntelligentAISystem.runIntelligentFlow(config);
            } catch (error) {
                const errorResult = await AIErrorHandler.handleAIError(error as Error, {
                    model: 'googleai/gemini-1.5-pro',
                    prompt: 'اكتب تقرير شامل',
                    input: 'اكتب تقرير شامل',
                    attempt: 1,
                    maxAttempts: 3
                });

                expect(errorResult).toBeDefined();
                expect(errorResult.success).toBe(false);
                expect(errorResult.error).toBeDefined();
                expect(errorResult.strategies).toBeDefined();
            }

            // Restore original function
            IntelligentAISystem.runIntelligentFlow = originalRunIntelligentFlow;
        });

        it('should handle rate limit errors gracefully', async () => {
            const config = {
                userInput: 'اكتب تقرير شامل',
                taskType: 'generation' as const,
                domain: 'business',
                externalContext: [],
                guidelines: ['اكتب نص مفيد'],
                qualityThreshold: 0.7,
                maxIterations: 2,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            // Mock rate limit error
            const originalRunIntelligentFlow = IntelligentAISystem.runIntelligentFlow;
            IntelligentAISystem.runIntelligentFlow = jest.fn().mockRejectedValue(new Error('Rate limit exceeded: 100 requests per minute'));

            try {
                await IntelligentAISystem.runIntelligentFlow(config);
            } catch (error) {
                const errorResult = await AIErrorHandler.handleAIError(error as Error, {
                    model: 'googleai/gemini-1.5-pro',
                    prompt: 'اكتب تقرير شامل',
                    input: 'اكتب تقرير شامل',
                    attempt: 1,
                    maxAttempts: 3
                });

                expect(errorResult).toBeDefined();
                expect(errorResult.success).toBe(false);
                expect(errorResult.error).toBeDefined();
                expect(errorResult.strategies).toBeDefined();
            }

            // Restore original function
            IntelligentAISystem.runIntelligentFlow = originalRunIntelligentFlow;
        });

        it('should handle authentication errors gracefully', async () => {
            const config = {
                userInput: 'اكتب تقرير شامل',
                taskType: 'generation' as const,
                domain: 'business',
                externalContext: [],
                guidelines: ['اكتب نص مفيد'],
                qualityThreshold: 0.7,
                maxIterations: 2,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            // Mock authentication error
            const originalRunIntelligentFlow = IntelligentAISystem.runIntelligentFlow;
            IntelligentAISystem.runIntelligentFlow = jest.fn().mockRejectedValue(new Error('Authentication failed: Invalid API key'));

            try {
                await IntelligentAISystem.runIntelligentFlow(config);
            } catch (error) {
                const errorResult = await AIErrorHandler.handleAIError(error as Error, {
                    model: 'googleai/gemini-1.5-pro',
                    prompt: 'اكتب تقرير شامل',
                    input: 'اكتب تقرير شامل',
                    attempt: 1,
                    maxAttempts: 3
                });

                expect(errorResult).toBeDefined();
                expect(errorResult.success).toBe(false);
                expect(errorResult.error).toBeDefined();
                expect(errorResult.strategies).toBeDefined();
            }

            // Restore original function
            IntelligentAISystem.runIntelligentFlow = originalRunIntelligentFlow;
        });
    });

    describe('Performance Integration Tests', () => {
        it('should monitor performance throughout the flow', async () => {
            const config = {
                userInput: 'اكتب تقرير شامل عن حالة المشروع',
                taskType: 'generation' as const,
                domain: 'business',
                externalContext: [
                    {
                        fileName: 'project-data.xlsx',
                        content: 'بيانات المشروع',
                        type: 'spreadsheet'
                    }
                ],
                guidelines: ['استخدم البيانات المرفقة'],
                qualityThreshold: 0.8,
                maxIterations: 2,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            const sessionId = PerformanceMonitor.startSession({
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل عن حالة المشروع'
            });

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            PerformanceMonitor.recordQualityMetrics(sessionId, {
                qualityScore: result.qualityScore,
                improvementIterations: result.iterationsUsed
            });

            PerformanceMonitor.recordResourceUsage(sessionId, {
                tokensUsed: 1000,
                modelSwitches: 1
            });

            const session = PerformanceMonitor.endSession(sessionId, result.success);

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.executionTime).toBeGreaterThan(0);

            expect(session).toBeDefined();
            expect(session?.metrics.executionTime).toBeGreaterThan(0);
            expect(session?.metrics.qualityScore).toBeGreaterThan(0);
            expect(session?.metrics.tokensUsed).toBeGreaterThan(0);
        });

        it('should generate performance report after multiple operations', async () => {
            const configs = [
                {
                    userInput: 'اكتب تقرير شامل',
                    taskType: 'generation' as const,
                    domain: 'business',
                    externalContext: [],
                    guidelines: ['اكتب نص مفيد'],
                    qualityThreshold: 0.7,
                    maxIterations: 2,
                    enableIterativeImprovement: true,
                    enablePerformanceMonitoring: true
                },
                {
                    userInput: 'حلل البيانات المرفقة',
                    taskType: 'analysis' as const,
                    domain: 'technical',
                    externalContext: [],
                    guidelines: ['حلل البيانات'],
                    qualityThreshold: 0.8,
                    maxIterations: 2,
                    enableIterativeImprovement: true,
                    enablePerformanceMonitoring: true
                }
            ];

            for (const config of configs) {
                const sessionId = PerformanceMonitor.startSession({
                    taskType: config.taskType,
                    domain: config.domain,
                    userInput: config.userInput
                });

                const result = await IntelligentAISystem.runIntelligentFlow(config);

                PerformanceMonitor.recordQualityMetrics(sessionId, {
                    qualityScore: result.qualityScore,
                    improvementIterations: result.iterationsUsed
                });

                PerformanceMonitor.endSession(sessionId, result.success);
            }

            const report = PerformanceMonitor.generatePerformanceReport();

            expect(report).toBeDefined();
            expect(report.totalSessions).toBeGreaterThan(0);
            expect(report.averageExecutionTime).toBeGreaterThan(0);
            expect(report.averageQualityScore).toBeGreaterThan(0);
            expect(report.successRate).toBeGreaterThan(0);
            expect(report.mostCommonErrors).toBeDefined();
            expect(report.performanceTrends).toBeDefined();
            expect(report.modelUsageStats).toBeDefined();
            expect(report.recommendations).toBeDefined();
        });
    });

    describe('Edge Cases Integration', () => {
        it('should handle empty external context', async () => {
            const config = {
                userInput: 'اكتب نص مفيد',
                taskType: 'generation' as const,
                domain: 'general',
                externalContext: [],
                guidelines: ['اكتب نص مفيد'],
                qualityThreshold: 0.7,
                maxIterations: 2,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.output).toBeDefined();
            expect(result.output.length).toBeGreaterThan(0);
            expect(result.qualityScore).toBeGreaterThan(0);
        });

        it('should handle very long user input', async () => {
            const longInput = 'اكتب تقرير شامل '.repeat(100);
            const config = {
                userInput: longInput,
                taskType: 'generation' as const,
                domain: 'business',
                externalContext: [],
                guidelines: ['اكتب نص مفيد'],
                qualityThreshold: 0.7,
                maxIterations: 2,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.output).toBeDefined();
            expect(result.output.length).toBeGreaterThan(0);
            expect(result.qualityScore).toBeGreaterThan(0);
        });

        it('should handle different quality thresholds', async () => {
            const qualityThresholds = [0.5, 0.7, 0.9];

            for (const threshold of qualityThresholds) {
                const config = {
                    userInput: 'اكتب نص مفيد',
                    taskType: 'generation' as const,
                    domain: 'general',
                    externalContext: [],
                    guidelines: ['اكتب نص مفيد'],
                    qualityThreshold: threshold,
                    maxIterations: 2,
                    enableIterativeImprovement: true,
                    enablePerformanceMonitoring: true
                };

                const result = await IntelligentAISystem.runIntelligentFlow(config);

                expect(result).toBeDefined();
                expect(result.success).toBe(true);
                expect(result.output).toBeDefined();
                expect(result.output.length).toBeGreaterThan(0);
                expect(result.qualityScore).toBeGreaterThan(0);
            }
        });

        it('should handle different max iterations', async () => {
            const maxIterations = [1, 3, 5];

            for (const iterations of maxIterations) {
                const config = {
                    userInput: 'اكتب نص مفيد',
                    taskType: 'generation' as const,
                    domain: 'general',
                    externalContext: [],
                    guidelines: ['اكتب نص مفيد'],
                    qualityThreshold: 0.7,
                    maxIterations: iterations,
                    enableIterativeImprovement: true,
                    enablePerformanceMonitoring: true
                };

                const result = await IntelligentAISystem.runIntelligentFlow(config);

                expect(result).toBeDefined();
                expect(result.success).toBe(true);
                expect(result.output).toBeDefined();
                expect(result.output.length).toBeGreaterThan(0);
                expect(result.iterationsUsed).toBeLessThanOrEqual(iterations);
            }
        });
    });
});
