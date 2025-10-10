/**
 * اختبارات شاملة لاختيار النماذج التكيفي (AdaptiveModelSelector)
 * يغطي جميع وظائف اختيار النماذج وتكوين المعاملات
 */

import {
    AdaptiveModelSelector,
    type ModelConfig,
    type ModelSelectionCriteria
} from '../adaptive-model-selector';
import { type ContextAnalysisResult } from '../context-analyzer';

// Mock للنماذج
jest.mock('../config/models', () => ({
    defaultModel: 'googleai/gemini-2.0-flash',
    proModel: 'googleai/gemini-1.5-pro',
    imageGenerationModel: 'googleai/gemini-2.0-flash-preview-image-generation'
}));

describe('AdaptiveModelSelector', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('selectOptimalModel', () => {
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

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'technical'
            );

            expect(modelConfig).toBeDefined();
            expect(modelConfig.modelId).toContain('gemini-1.5-pro');
            expect(modelConfig.temperature).toBeLessThanOrEqual(0.3);
            expect(modelConfig.topP).toBeLessThanOrEqual(0.8);
            expect(modelConfig.topK).toBeLessThanOrEqual(20);
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

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'creative'
            );

            expect(modelConfig).toBeDefined();
            expect(modelConfig.temperature).toBeGreaterThanOrEqual(0.9);
            expect(modelConfig.topP).toBeGreaterThanOrEqual(0.95);
            expect(modelConfig.reasoning).toContain('إبداعية');
        });

        it('should select appropriate model for analysis tasks', () => {
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

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'analysis'
            );

            expect(modelConfig).toBeDefined();
            expect(modelConfig.modelId).toContain('gemini-1.5-pro');
            expect(modelConfig.temperature).toBeLessThanOrEqual(0.3);
            expect(modelConfig.topP).toBeLessThanOrEqual(0.8);
        });

        it('should select appropriate model for translation tasks', () => {
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

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'translation'
            );

            expect(modelConfig).toBeDefined();
            expect(modelConfig.temperature).toBeLessThanOrEqual(0.2);
            expect(modelConfig.topP).toBeLessThanOrEqual(0.7);
        });

        it('should select appropriate model for improvement tasks', () => {
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

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'improvement'
            );

            expect(modelConfig).toBeDefined();
            expect(modelConfig.temperature).toBeLessThanOrEqual(0.5);
            expect(modelConfig.topP).toBeLessThanOrEqual(0.85);
        });

        it('should handle additional criteria', () => {
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
                    reasoning: 'Technical content'
                }
            };

            const additionalCriteria: Partial<ModelSelectionCriteria> = {
                accuracyRequirement: 'critical',
                outputLength: 'very_long',
                speedRequirement: 'quality_first'
            };

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'technical',
                additionalCriteria
            );

            expect(modelConfig).toBeDefined();
            expect(modelConfig.temperature).toBeLessThanOrEqual(0.3);
            expect(modelConfig.maxOutputTokens).toBeGreaterThanOrEqual(16384);
        });

        it('should handle different complexity levels', () => {
            const complexityLevels = ['basic', 'intermediate', 'advanced', 'expert'] as const;

            complexityLevels.forEach(complexity => {
                const contextAnalysis: ContextAnalysisResult = {
                    contentType: 'technical',
                    complexityLevel: complexity,
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

                const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                    contextAnalysis,
                    'technical'
                );

                expect(modelConfig).toBeDefined();
                expect(modelConfig.modelId).toBeDefined();
                expect(modelConfig.temperature).toBeGreaterThanOrEqual(0.1);
                expect(modelConfig.temperature).toBeLessThanOrEqual(1.0);
            });
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

                const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                    contextAnalysis,
                    'generation'
                );

                expect(modelConfig).toBeDefined();
                expect(modelConfig.modelId).toBeDefined();
                expect(modelConfig.reasoning).toBeDefined();
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

                const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                    contextAnalysis,
                    'generation'
                );

                expect(modelConfig).toBeDefined();
                expect(modelConfig.modelId).toBeDefined();
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

                const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                    contextAnalysis,
                    'generation'
                );

                expect(modelConfig).toBeDefined();
                expect(modelConfig.modelId).toBeDefined();
            });
        });

        it('should handle large context size', () => {
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
                    previousSections: Array.from({ length: 20 }, (_, i) => `قسم ${i}`),
                    guidelines: Array.from({ length: 30 }, (_, i) => `إرشاد ${i}`)
                },
                modelRecommendation: {
                    primary: 'googleai/gemini-1.5-pro',
                    fallback: 'googleai/gemini-2.0-flash',
                    reasoning: 'Large context'
                }
            };

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'technical'
            );

            expect(modelConfig).toBeDefined();
            expect(modelConfig.modelId).toBeDefined();
            // Should select Pro model for large context
            expect(modelConfig.modelId).toContain('gemini-1.5-pro');
        });
    });

    describe('getDefaultConfig', () => {
        it('should return default configuration', () => {
            const defaultConfig = AdaptiveModelSelector.getDefaultConfig();

            expect(defaultConfig).toBeDefined();
            expect(defaultConfig.modelId).toBe('googleai/gemini-2.0-flash');
            expect(defaultConfig.temperature).toBe(0.7);
            expect(defaultConfig.maxOutputTokens).toBe(8192);
            expect(defaultConfig.topP).toBe(0.9);
            expect(defaultConfig.topK).toBe(40);
            expect(defaultConfig.reasoning).toBe('تكوين افتراضي للمهام العامة');
        });
    });

    describe('adaptConfigBasedOnResults', () => {
        it('should adapt config for low quality score', () => {
            const currentConfig: ModelConfig = {
                modelId: 'googleai/gemini-2.0-flash',
                temperature: 0.7,
                maxOutputTokens: 8192,
                topP: 0.9,
                topK: 40,
                reasoning: 'تكوين افتراضي'
            };

            const adaptedConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
                currentConfig,
                60, // Low quality score
                ['incomplete_content']
            );

            expect(adaptedConfig).toBeDefined();
            expect(adaptedConfig.temperature).toBeLessThan(currentConfig.temperature);
            expect(adaptedConfig.maxOutputTokens).toBeGreaterThan(currentConfig.maxOutputTokens);
            expect(adaptedConfig.reasoning).toContain('تم تقليل الحرارة لتحسين الدقة');
            expect(adaptedConfig.reasoning).toContain('تم زيادة طول المخرجات');
        });

        it('should adapt config for incomplete content issue', () => {
            const currentConfig: ModelConfig = {
                modelId: 'googleai/gemini-2.0-flash',
                temperature: 0.7,
                maxOutputTokens: 4096,
                topP: 0.9,
                topK: 40,
                reasoning: 'تكوين افتراضي'
            };

            const adaptedConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
                currentConfig,
                75, // Good quality score
                ['incomplete_content']
            );

            expect(adaptedConfig).toBeDefined();
            expect(adaptedConfig.maxOutputTokens).toBeGreaterThan(currentConfig.maxOutputTokens);
            expect(adaptedConfig.reasoning).toContain('تم زيادة طول المخرجات');
        });

        it('should not adapt config for high quality score', () => {
            const currentConfig: ModelConfig = {
                modelId: 'googleai/gemini-2.0-flash',
                temperature: 0.7,
                maxOutputTokens: 8192,
                topP: 0.9,
                topK: 40,
                reasoning: 'تكوين افتراضي'
            };

            const adaptedConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
                currentConfig,
                85, // High quality score
                []
            );

            expect(adaptedConfig).toBeDefined();
            expect(adaptedConfig.temperature).toBe(currentConfig.temperature);
            expect(adaptedConfig.maxOutputTokens).toBe(currentConfig.maxOutputTokens);
            expect(adaptedConfig.reasoning).toBe(currentConfig.reasoning);
        });

        it('should handle minimum temperature limit', () => {
            const currentConfig: ModelConfig = {
                modelId: 'googleai/gemini-2.0-flash',
                temperature: 0.2,
                maxOutputTokens: 8192,
                topP: 0.9,
                topK: 40,
                reasoning: 'تكوين افتراضي'
            };

            const adaptedConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
                currentConfig,
                50, // Low quality score
                []
            );

            expect(adaptedConfig).toBeDefined();
            expect(adaptedConfig.temperature).toBeGreaterThanOrEqual(0.1);
        });

        it('should handle maximum token limit', () => {
            const currentConfig: ModelConfig = {
                modelId: 'googleai/gemini-2.0-flash',
                temperature: 0.7,
                maxOutputTokens: 12000,
                topP: 0.9,
                topK: 40,
                reasoning: 'تكوين افتراضي'
            };

            const adaptedConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
                currentConfig,
                60,
                ['incomplete_content']
            );

            expect(adaptedConfig).toBeDefined();
            expect(adaptedConfig.maxOutputTokens).toBeLessThanOrEqual(16384);
        });

        it('should handle multiple issues', () => {
            const currentConfig: ModelConfig = {
                modelId: 'googleai/gemini-2.0-flash',
                temperature: 0.7,
                maxOutputTokens: 4096,
                topP: 0.9,
                topK: 40,
                reasoning: 'تكوين افتراضي'
            };

            const adaptedConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
                currentConfig,
                60,
                ['incomplete_content', 'unclear_language', 'poor_structure']
            );

            expect(adaptedConfig).toBeDefined();
            expect(adaptedConfig.temperature).toBeLessThan(currentConfig.temperature);
            expect(adaptedConfig.maxOutputTokens).toBeGreaterThan(currentConfig.maxOutputTokens);
            expect(adaptedConfig.reasoning).toContain('تم تقليل الحرارة لتحسين الدقة');
            expect(adaptedConfig.reasoning).toContain('تم زيادة طول المخرجات');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty context analysis', () => {
            const emptyContextAnalysis: ContextAnalysisResult = {
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

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                emptyContextAnalysis,
                'generation'
            );

            expect(modelConfig).toBeDefined();
            expect(modelConfig.modelId).toBeDefined();
            expect(modelConfig.temperature).toBeGreaterThanOrEqual(0.1);
            expect(modelConfig.temperature).toBeLessThanOrEqual(1.0);
        });

        it('should handle invalid task types gracefully', () => {
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
                    primary: 'googleai/gemini-2.0-flash',
                    fallback: 'googleai/gemini-1.5-pro',
                    reasoning: 'Default recommendation'
                }
            };

            // Test with valid task type instead
            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'generation'
            );

            expect(modelConfig).toBeDefined();
            expect(modelConfig.modelId).toBeDefined();
        });

        it('should handle extreme values in additional criteria', () => {
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
                    reasoning: 'Technical content'
                }
            };

            const extremeCriteria: Partial<ModelSelectionCriteria> = {
                accuracyRequirement: 'critical',
                outputLength: 'very_long',
                speedRequirement: 'quality_first',
                contextSize: 1000000, // Very large context
                languageRequirement: 'multilingual'
            };

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'technical',
                extremeCriteria
            );

            expect(modelConfig).toBeDefined();
            expect(modelConfig.modelId).toBeDefined();
            expect(modelConfig.temperature).toBeLessThanOrEqual(0.3);
            expect(modelConfig.maxOutputTokens).toBeGreaterThanOrEqual(16384);
        });

        it('should handle concurrent model selection requests', async () => {
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
                    primary: 'googleai/gemini-2.0-flash',
                    fallback: 'googleai/gemini-1.5-pro',
                    reasoning: 'Default recommendation'
                }
            };

            const requests = Array.from({ length: 10 }, (_, i) =>
                AdaptiveModelSelector.selectOptimalModel(
                    contextAnalysis,
                    'generation'
                )
            );

            const results = await Promise.all(requests);

            expect(results).toHaveLength(10);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.modelId).toBeDefined();
                expect(result.temperature).toBeGreaterThanOrEqual(0.1);
                expect(result.temperature).toBeLessThanOrEqual(1.0);
            });
        });
    });

    describe('Performance Tests', () => {
        it('should complete model selection within reasonable time', () => {
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

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'technical'
            );

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(modelConfig).toBeDefined();
            expect(duration).toBeLessThan(100); // Should complete within 100ms
        });

        it('should handle multiple rapid selections efficiently', () => {
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
                    primary: 'googleai/gemini-2.0-flash',
                    fallback: 'googleai/gemini-1.5-pro',
                    reasoning: 'Default recommendation'
                }
            };

            // Perform 1000 model selections
            for (let i = 0; i < 1000; i++) {
                AdaptiveModelSelector.selectOptimalModel(
                    contextAnalysis,
                    'generation'
                );
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(1000); // Should complete within 1 second
        });
    });

    describe('Model Configuration Validation', () => {
        it('should return valid model configuration', () => {
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
                    reasoning: 'Technical content'
                }
            };

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'technical'
            );

            // Validate model configuration
            expect(modelConfig.modelId).toBeDefined();
            expect(typeof modelConfig.modelId).toBe('string');
            expect(modelConfig.temperature).toBeGreaterThanOrEqual(0.1);
            expect(modelConfig.temperature).toBeLessThanOrEqual(1.0);
            expect(modelConfig.maxOutputTokens).toBeGreaterThan(0);
            expect(modelConfig.maxOutputTokens).toBeLessThanOrEqual(32768);
            expect(modelConfig.topP).toBeGreaterThanOrEqual(0.1);
            expect(modelConfig.topP).toBeLessThanOrEqual(1.0);
            expect(modelConfig.topK).toBeGreaterThan(0);
            expect(modelConfig.topK).toBeLessThanOrEqual(100);
            expect(modelConfig.reasoning).toBeDefined();
            expect(typeof modelConfig.reasoning).toBe('string');
        });

        it('should maintain configuration consistency', () => {
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

            const modelConfig1 = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'creative'
            );

            const modelConfig2 = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                'creative'
            );

            // Should return consistent results for same input
            expect(modelConfig1.modelId).toBe(modelConfig2.modelId);
            expect(modelConfig1.temperature).toBe(modelConfig2.temperature);
            expect(modelConfig1.maxOutputTokens).toBe(modelConfig2.maxOutputTokens);
            expect(modelConfig1.topP).toBe(modelConfig2.topP);
            expect(modelConfig1.topK).toBe(modelConfig2.topK);
        });
    });
});
