/**
 * اختبارات شاملة لبناء المحفزات الذكي (IntelligentPromptBuilder)
 * يغطي جميع وظائف بناء المحفزات وتجميعها
 */

import { type ContextAnalysisResult } from '../context-analyzer';
import {
    IntelligentPromptBuilder,
    type PromptBuildingConfig,
    type PromptTemplate
} from '../intelligent-prompt-builder';

describe('IntelligentPromptBuilder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('buildPrompt', () => {
        it('should build prompt for generation task', () => {
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

            const config: PromptBuildingConfig = {
                taskType: 'generation',
                domain: 'business',
                contextAnalysis,
                userInput: 'أنشئ خطة عمل لمشروع تقني',
                externalContext: [
                    {
                        fileName: 'requirements.txt',
                        content: 'متطلبات المشروع',
                        type: 'context'
                    }
                ]
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.system).toBeDefined();
            expect(promptTemplate.context).toBeDefined();
            expect(promptTemplate.instructions).toBeDefined();
            expect(promptTemplate.outputFormat).toBeDefined();
            expect(typeof promptTemplate.system).toBe('string');
            expect(typeof promptTemplate.context).toBe('string');
            expect(typeof promptTemplate.instructions).toBe('string');
            expect(typeof promptTemplate.outputFormat).toBe('string');
        });

        it('should build prompt for analysis task', () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'academic',
                complexityLevel: 'advanced',
                targetAudience: 'academic',
                language: 'ar',
                culturalContext: 'middle-east',
                specificRequirements: ['تحليل دقيق'],
                availableContext: {
                    files: [],
                    previousSections: [],
                    guidelines: []
                },
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Analysis requires precision'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'analysis',
                domain: 'academic_research',
                contextAnalysis,
                userInput: 'حلل هذه الدراسة البحثية',
                externalContext: [
                    {
                        fileName: 'research-paper.pdf',
                        content: 'دراسة شاملة حول الذكاء الاصطناعي',
                        type: 'textbook'
                    }
                ]
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.system).toContain('تحليل');
            expect(promptTemplate.instructions).toContain('تحليل دقيق');
        });

        it('should build prompt for translation task', () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'mixed',
                complexityLevel: 'basic',
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
                    primary: 'googleai/gemini-2.0-flash',
                    fallback: 'googleai/gemini-1.5-pro',
                    reasoning: 'Translation requires speed'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'translation',
                domain: 'language',
                contextAnalysis,
                userInput: 'ترجم هذا النص إلى الإنجليزية'
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.system).toContain('ترجمة');
            expect(promptTemplate.instructions).toContain('ترجم');
        });

        it('should build prompt for improvement task', () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'business',
                complexityLevel: 'intermediate',
                targetAudience: 'executive',
                language: 'ar',
                culturalContext: 'middle-east',
                specificRequirements: ['تحسين المحتوى'],
                availableContext: {
                    files: [],
                    previousSections: [],
                    guidelines: []
                },
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Improvement requires analysis'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'improvement',
                domain: 'content_writing',
                contextAnalysis,
                userInput: 'حسن هذا النص',
                previousOutput: 'النص الحالي الذي يحتاج تحسين',
                iterationCount: 2
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.system).toContain('تحسين');
            expect(promptTemplate.instructions).toContain('حسن');
        });

        it('should include external context in prompt', () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'technical',
                complexityLevel: 'advanced',
                targetAudience: 'technical',
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
                    reasoning: 'Technical content'
                }
            };

            const externalContext = [
                {
                    fileName: 'requirements.txt',
                    content: 'متطلبات النظام التقني',
                    type: 'context'
                },
                {
                    fileName: 'example.md',
                    content: 'مثال على التطبيق',
                    type: 'example'
                },
                {
                    fileName: 'guidelines.md',
                    content: 'إرشادات التطوير',
                    type: 'guidelines'
                }
            ];

            const config: PromptBuildingConfig = {
                taskType: 'generation',
                domain: 'software_engineering',
                contextAnalysis,
                userInput: 'أنشئ نظام إدارة',
                externalContext
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.context).toContain('requirements.txt');
            expect(promptTemplate.context).toContain('متطلبات النظام التقني');
            expect(promptTemplate.context).toContain('example.md');
            expect(promptTemplate.context).toContain('مثال على التطبيق');
            expect(promptTemplate.context).toContain('guidelines.md');
            expect(promptTemplate.context).toContain('إرشادات التطوير');
        });

        it('should handle different content types', () => {
            const contentTypes = ['technical', 'business', 'academic', 'creative', 'mixed'] as const;

            contentTypes.forEach(contentType => {
                const contextAnalysis: ContextAnalysisResult = {
                    contentType,
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
                        reasoning: 'Content type specific'
                    }
                };

                const config: PromptBuildingConfig = {
                    taskType: 'generation',
                    domain: 'test',
                    contextAnalysis,
                    userInput: 'أنشئ محتوى'
                };

                const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

                expect(promptTemplate).toBeDefined();
                expect(promptTemplate.system).toBeDefined();
                expect(promptTemplate.instructions).toBeDefined();
            });
        });

        it('should handle different complexity levels', () => {
            const complexityLevels = ['basic', 'intermediate', 'advanced', 'expert'] as const;

            complexityLevels.forEach(complexityLevel => {
                const contextAnalysis: ContextAnalysisResult = {
                    contentType: 'technical',
                    complexityLevel,
                    targetAudience: 'technical',
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
                        reasoning: 'Complexity specific'
                    }
                };

                const config: PromptBuildingConfig = {
                    taskType: 'generation',
                    domain: 'test',
                    contextAnalysis,
                    userInput: 'أنشئ محتوى'
                };

                const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

                expect(promptTemplate).toBeDefined();
                expect(promptTemplate.system).toBeDefined();
                expect(promptTemplate.instructions).toBeDefined();
            });
        });

        it('should handle different target audiences', () => {
            const audiences = ['general', 'technical', 'executive', 'academic', 'student'] as const;

            audiences.forEach(audience => {
                const contextAnalysis: ContextAnalysisResult = {
                    contentType: 'business',
                    complexityLevel: 'intermediate',
                    targetAudience: audience,
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
                        reasoning: 'Audience specific'
                    }
                };

                const config: PromptBuildingConfig = {
                    taskType: 'generation',
                    domain: 'test',
                    contextAnalysis,
                    userInput: 'أنشئ محتوى'
                };

                const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

                expect(promptTemplate).toBeDefined();
                expect(promptTemplate.system).toBeDefined();
                expect(promptTemplate.instructions).toBeDefined();
            });
        });

        it('should handle different languages', () => {
            const languages = ['ar', 'en'] as const;

            languages.forEach(language => {
                const contextAnalysis: ContextAnalysisResult = {
                    contentType: 'business',
                    complexityLevel: 'intermediate',
                    targetAudience: 'general',
                    language,
                    culturalContext: language === 'ar' ? 'middle-east' : 'western',
                    specificRequirements: [],
                    availableContext: {
                        files: [],
                        previousSections: [],
                        guidelines: []
                    },
                    modelRecommendation: {
                        primary: 'googleai/gemini-1.5-pro',
                        fallback: 'googleai/gemini-2.0-flash',
                        reasoning: 'Language specific'
                    }
                };

                const config: PromptBuildingConfig = {
                    taskType: 'generation',
                    domain: 'test',
                    contextAnalysis,
                    userInput: language === 'ar' ? 'أنشئ محتوى' : 'Create content'
                };

                const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

                expect(promptTemplate).toBeDefined();
                expect(promptTemplate.system).toBeDefined();
                expect(promptTemplate.instructions).toBeDefined();
            });
        });

        it('should include specific requirements in prompt', () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'business',
                complexityLevel: 'intermediate',
                targetAudience: 'executive',
                language: 'ar',
                culturalContext: 'middle-east',
                specificRequirements: [
                    'يجب أن يكون المحتوى مهنياً',
                    'يجب أن يكون واضحاً',
                    'يجب أن يكون شاملاً'
                ],
                availableContext: {
                    files: [],
                    previousSections: [],
                    guidelines: []
                },
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Business content'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'generation',
                domain: 'business',
                contextAnalysis,
                userInput: 'أنشئ خطة عمل'
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.instructions).toContain('يجب أن يكون المحتوى مهنياً');
            expect(promptTemplate.instructions).toContain('يجب أن يكون واضحاً');
            expect(promptTemplate.instructions).toContain('يجب أن يكون شاملاً');
        });

        it('should handle iterative improvement prompts', () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'business',
                complexityLevel: 'intermediate',
                targetAudience: 'executive',
                language: 'ar',
                culturalContext: 'middle-east',
                specificRequirements: ['تحسين المحتوى'],
                availableContext: {
                    files: [],
                    previousSections: [],
                    guidelines: []
                },
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Improvement requires analysis'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'improvement',
                domain: 'content_writing',
                contextAnalysis,
                userInput: 'حسن هذا النص',
                previousOutput: 'النص الحالي',
                iterationCount: 3
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.instructions).toContain('النص الحالي');
            expect(promptTemplate.instructions).toContain('تحسين');
        });
    });

    describe('compilePrompt', () => {
        it('should compile prompt template correctly', () => {
            const promptTemplate: PromptTemplate = {
                system: 'أنت مساعد ذكي متخصص في إنشاء المحتوى المهني.',
                context: 'السياق: أنشئ خطة عمل لمشروع تقني',
                instructions: 'التعليمات: يجب أن يكون المحتوى مهنياً وواضحاً.',
                examples: 'الأمثلة: مثال على خطة عمل ناجحة...',
                constraints: 'القيود: يجب أن يكون المحتوى باللغة العربية.',
                outputFormat: 'التنسيق: قدم المحتوى في شكل منظم مع عناوين واضحة.'
            };

            const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);

            expect(compiledPrompt).toBeDefined();
            expect(typeof compiledPrompt).toBe('string');
            expect(compiledPrompt).toContain('أنت مساعد ذكي متخصص في إنشاء المحتوى المهني.');
            expect(compiledPrompt).toContain('السياق: أنشئ خطة عمل لمشروع تقني');
            expect(compiledPrompt).toContain('التعليمات: يجب أن يكون المحتوى مهنياً وواضحاً.');
            expect(compiledPrompt).toContain('الأمثلة: مثال على خطة عمل ناجحة...');
            expect(compiledPrompt).toContain('القيود: يجب أن يكون المحتوى باللغة العربية.');
            expect(compiledPrompt).toContain('التنسيق: قدم المحتوى في شكل منظم مع عناوين واضحة.');
        });

        it('should handle template with missing optional sections', () => {
            const promptTemplate: PromptTemplate = {
                system: 'أنت مساعد ذكي.',
                context: 'السياق: مهمة بسيطة',
                instructions: 'التعليمات: أنجز المهمة.',
                outputFormat: 'التنسيق: قدم النتيجة.'
            };

            const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);

            expect(compiledPrompt).toBeDefined();
            expect(typeof compiledPrompt).toBe('string');
            expect(compiledPrompt).toContain('أنت مساعد ذكي.');
            expect(compiledPrompt).toContain('السياق: مهمة بسيطة');
            expect(compiledPrompt).toContain('التعليمات: أنجز المهمة.');
            expect(compiledPrompt).toContain('التنسيق: قدم النتيجة.');
        });

        it('should handle empty template sections', () => {
            const promptTemplate: PromptTemplate = {
                system: '',
                context: '',
                instructions: '',
                examples: '',
                constraints: '',
                outputFormat: ''
            };

            const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);

            expect(compiledPrompt).toBeDefined();
            expect(typeof compiledPrompt).toBe('string');
        });

        it('should maintain proper formatting in compiled prompt', () => {
            const promptTemplate: PromptTemplate = {
                system: 'System prompt',
                context: 'Context information',
                instructions: 'Task instructions',
                examples: 'Example content',
                constraints: 'Constraints and limitations',
                outputFormat: 'Output format requirements'
            };

            const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);

            expect(compiledPrompt).toBeDefined();
            expect(compiledPrompt).toContain('System prompt');
            expect(compiledPrompt).toContain('Context information');
            expect(compiledPrompt).toContain('Task instructions');
            expect(compiledPrompt).toContain('Example content');
            expect(compiledPrompt).toContain('Constraints and limitations');
            expect(compiledPrompt).toContain('Output format requirements');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty user input', () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'mixed',
                complexityLevel: 'basic',
                targetAudience: 'general',
                language: 'ar',
                culturalContext: 'global',
                specificRequirements: [],
                availableContext: {
                    files: [],
                    previousSections: [],
                    guidelines: []
                },
                modelRecommendation: {
                    primary: 'googleai/gemini-2.0-flash',
                    fallback: 'googleai/gemini-1.5-pro',
                    reasoning: 'Default recommendation'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'generation',
                domain: 'test',
                contextAnalysis,
                userInput: ''
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.system).toBeDefined();
            expect(promptTemplate.instructions).toBeDefined();
        });

        it('should handle very long user input', () => {
            const longInput = 'أ'.repeat(10000);

            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'technical',
                complexityLevel: 'expert',
                targetAudience: 'technical',
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
                    reasoning: 'Long input requires advanced model'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'generation',
                domain: 'test',
                contextAnalysis,
                userInput: longInput
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.context).toContain(longInput.substring(0, 100));
        });

        it('should handle special characters and emojis', () => {
            const specialInput = 'أنشئ خطة عمل 🚀 لمشروع تقني #AI #MachineLearning';

            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'business',
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
                    reasoning: 'Special characters'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'generation',
                domain: 'test',
                contextAnalysis,
                userInput: specialInput
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.context).toContain('🚀');
            expect(promptTemplate.context).toContain('#AI');
            expect(promptTemplate.context).toContain('#MachineLearning');
        });

        it('should handle mixed language input', () => {
            const mixedInput = 'أنشئ business plan لمشروع تقني مع AI capabilities';

            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'business',
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
                    reasoning: 'Mixed language'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'generation',
                domain: 'test',
                contextAnalysis,
                userInput: mixedInput
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.context).toContain('business plan');
            expect(promptTemplate.context).toContain('AI capabilities');
        });

        it('should handle large external context', () => {
            const largeContext = Array.from({ length: 100 }, (_, i) => ({
                fileName: `file${i}.txt`,
                content: `محتوى الملف ${i}`.repeat(100),
                type: 'context'
            }));

            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'technical',
                complexityLevel: 'expert',
                targetAudience: 'technical',
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
                    reasoning: 'Large context'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'generation',
                domain: 'test',
                contextAnalysis,
                userInput: 'أنشئ تقرير شامل',
                externalContext: largeContext
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            expect(promptTemplate).toBeDefined();
            expect(promptTemplate.context).toBeDefined();
            expect(promptTemplate.context.length).toBeGreaterThan(0);
        });

        it('should handle concurrent prompt building requests', async () => {
            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'business',
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
                    reasoning: 'Concurrent requests'
                }
            };

            const requests = Array.from({ length: 10 }, (_, i) => {
                const config: PromptBuildingConfig = {
                    taskType: 'generation',
                    domain: 'test',
                    contextAnalysis,
                    userInput: `طلب ${i}`
                };
                return IntelligentPromptBuilder.buildPrompt(config);
            });

            const results = await Promise.all(requests);

            expect(results).toHaveLength(10);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.system).toBeDefined();
                expect(result.instructions).toBeDefined();
            });
        });
    });

    describe('Performance Tests', () => {
        it('should complete prompt building within reasonable time', () => {
            const startTime = Date.now();

            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'technical',
                complexityLevel: 'expert',
                targetAudience: 'technical',
                language: 'ar',
                culturalContext: 'middle-east',
                specificRequirements: Array.from({ length: 100 }, (_, i) => `متطلب ${i}`),
                availableContext: {
                    files: Array.from({ length: 50 }, (_, i) => ({
                        name: `file${i}.txt`,
                        type: 'context',
                        relevance: 0.8
                    })),
                    previousSections: [],
                    guidelines: []
                },
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Complex technical content'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'generation',
                domain: 'software_engineering',
                contextAnalysis,
                userInput: 'أنشئ نظام إدارة متقدم',
                externalContext: Array.from({ length: 20 }, (_, i) => ({
                    fileName: `file${i}.txt`,
                    content: `محتوى الملف ${i}`,
                    type: 'context'
                }))
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(promptTemplate).toBeDefined();
            expect(duration).toBeLessThan(100); // Should complete within 100ms
        });

        it('should handle multiple rapid prompt building efficiently', () => {
            const startTime = Date.now();

            const contextAnalysis: ContextAnalysisResult = {
                contentType: 'business',
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
                    reasoning: 'Default recommendation'
                }
            };

            // Build 1000 prompts
            for (let i = 0; i < 1000; i++) {
                const config: PromptBuildingConfig = {
                    taskType: 'generation',
                    domain: 'test',
                    contextAnalysis,
                    userInput: `طلب ${i}`
                };
                IntelligentPromptBuilder.buildPrompt(config);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(1000); // Should complete within 1 second
        });
    });

    describe('Prompt Template Validation', () => {
        it('should return valid prompt template structure', () => {
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
                    reasoning: 'Business content'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'generation',
                domain: 'business',
                contextAnalysis,
                userInput: 'أنشئ خطة عمل'
            };

            const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);

            // Validate template structure
            expect(promptTemplate.system).toBeDefined();
            expect(typeof promptTemplate.system).toBe('string');
            expect(promptTemplate.context).toBeDefined();
            expect(typeof promptTemplate.context).toBe('string');
            expect(promptTemplate.instructions).toBeDefined();
            expect(typeof promptTemplate.instructions).toBe('string');
            expect(promptTemplate.outputFormat).toBeDefined();
            expect(typeof promptTemplate.outputFormat).toBe('string');

            // Optional fields
            if (promptTemplate.examples) {
                expect(typeof promptTemplate.examples).toBe('string');
            }
            if (promptTemplate.constraints) {
                expect(typeof promptTemplate.constraints).toBe('string');
            }
        });

        it('should maintain consistency for same input', () => {
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
                    reasoning: 'Creative content'
                }
            };

            const config: PromptBuildingConfig = {
                taskType: 'generation',
                domain: 'creative_writing',
                contextAnalysis,
                userInput: 'اكتب قصة قصيرة'
            };

            const promptTemplate1 = IntelligentPromptBuilder.buildPrompt(config);
            const promptTemplate2 = IntelligentPromptBuilder.buildPrompt(config);

            // Should return consistent results for same input
            expect(promptTemplate1.system).toBe(promptTemplate2.system);
            expect(promptTemplate1.context).toBe(promptTemplate2.context);
            expect(promptTemplate1.instructions).toBe(promptTemplate2.instructions);
            expect(promptTemplate1.outputFormat).toBe(promptTemplate2.outputFormat);
        });
    });
});
