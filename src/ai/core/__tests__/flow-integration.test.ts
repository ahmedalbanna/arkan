/**
 * اختبارات تكامل التدفقات المتخصصة مع النظام الذكي المحسن
 */

import { FlowIntegrationManager } from '../flow-integration-manager';
import { IntelligentAISystem, IntelligentSystemConfig } from '../intelligent-ai-system';
import { SpecializedQuickHelpers } from '../specialized-quick-helpers';
import { FlowType, UnifiedFlowConfig, UnifiedFlowInterface } from '../unified-flow-interface';

describe('Flow Integration Tests', () => {

    describe('FlowIntegrationManager', () => {
        test('should execute specialized flow successfully', async () => {
            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName: 'grammar-checker',
                category: 'text-processing',
                input: { text: 'This is a test text.' },
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.flowName).toBe('grammar-checker');
            expect(result.category).toBe('text-processing');
        });

        test('should handle non-existent flow gracefully', async () => {
            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName: 'non-existent-flow',
                category: 'content-generation',
                input: { text: 'test' }
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('غير مدعوم');
        });

        test('should get available flows by category', () => {
            const textProcessingFlows = FlowIntegrationManager.getAvailableFlows('text-processing');
            expect(textProcessingFlows).toBeInstanceOf(Array);
            expect(textProcessingFlows.length).toBeGreaterThan(0);

            const textFlow = textProcessingFlows.find(flow => flow.name === 'grammar-checker');
            expect(textFlow).toBeDefined();
            expect(textFlow?.category).toBe('text-processing');
        });

        test('should check flow availability', () => {
            expect(FlowIntegrationManager.isFlowAvailable('grammar-checker')).toBe(true);
            expect(FlowIntegrationManager.isFlowAvailable('non-existent-flow')).toBe(false);
        });

        test('should get flow info', () => {
            const flowInfo = FlowIntegrationManager.getFlowInfo('grammar-checker');
            expect(flowInfo).toBeDefined();
            expect(flowInfo?.category).toBe('text-processing');
            expect(flowInfo?.taskType).toBe('improvement');

            const nonExistentInfo = FlowIntegrationManager.getFlowInfo('non-existent-flow');
            expect(nonExistentInfo).toBeNull();
        });
    });

    describe('SpecializedQuickHelpers', () => {
        test('should analyze text successfully', async () => {
            const result = await SpecializedQuickHelpers.quickAnalyzeText(
                'This is a test text with some grammar issues.',
                'grammar'
            );

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
        });

        test('should improve text successfully', async () => {
            const result = await SpecializedQuickHelpers.quickImproveText(
                'This text needs improvement.',
                'rewrite'
            );

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
        });

        test('should summarize content successfully', async () => {
            const result = await SpecializedQuickHelpers.quickSummarizeContent(
                'This is a long text that needs to be summarized. It contains multiple sentences and should be condensed into a shorter version.',
                'text',
                'short'
            );

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
        });

        test('should generate content successfully', async () => {
            const result = await SpecializedQuickHelpers.quickGenerateContent(
                'text',
                { prompt: 'Write a short story about a robot.' }
            );

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
        });

        test('should research topic successfully', async () => {
            const result = await SpecializedQuickHelpers.quickResearch(
                'artificial intelligence',
                'moderate'
            );

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
        });

        test('should fact check text successfully', async () => {
            const result = await SpecializedQuickHelpers.quickFactCheck(
                'The Earth is flat.'
            );

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
        });

        test('should generate presentation successfully', async () => {
            const result = await SpecializedQuickHelpers.quickGeneratePresentation(
                'Introduction to Machine Learning',
                5,
                'professional'
            );

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
        });

        test('should generate project plan successfully', async () => {
            const result = await SpecializedQuickHelpers.quickGenerateProjectPlan(
                'Develop a mobile app for task management',
                'moderate'
            );

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
        });

        test('should get available flows', () => {
            const flows = SpecializedQuickHelpers.getAvailableFlows();
            expect(flows).toBeInstanceOf(Array);
            expect(flows.length).toBeGreaterThan(0);

            const textProcessingFlows = SpecializedQuickHelpers.getAvailableFlows('text-processing');
            expect(textProcessingFlows).toBeInstanceOf(Array);
        });

        test('should check flow availability', () => {
            expect(SpecializedQuickHelpers.isFlowAvailable('grammar-checker')).toBe(true);
            expect(SpecializedQuickHelpers.isFlowAvailable('non-existent-flow')).toBe(false);
        });
    });

    describe('UnifiedFlowInterface', () => {
        test('should execute intelligent flow successfully', async () => {
            const config: UnifiedFlowConfig = {
                flowType: 'intelligent',
                input: { text: 'Generate a business plan for a tech startup.' },
                options: {
                    domain: 'business',
                    enablePerformanceMonitoring: true,
                    enableErrorHandling: true
                }
            };

            const result = await UnifiedFlowInterface.executeFlow(config);

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.flowType).toBe('intelligent');
        });

        test('should execute specialized flow successfully', async () => {
            const config: UnifiedFlowConfig = {
                flowType: 'specialized',
                flowName: 'grammar-checker',
                category: 'text-processing',
                input: { text: 'This is a test text.' },
                options: {
                    enablePerformanceMonitoring: true,
                    enableErrorHandling: true
                }
            };

            const result = await UnifiedFlowInterface.executeFlow(config);

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.flowType).toBe('specialized');
            expect(result.flowName).toBe('grammar-checker');
        });

        test('should execute quick flow successfully', async () => {
            const config: UnifiedFlowConfig = {
                flowType: 'quick',
                flowName: 'analyze',
                input: { text: 'This is a test text for analysis.' }
            };

            const result = await UnifiedFlowInterface.executeFlow(config);

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.flowType).toBe('quick');
            expect(result.flowName).toBe('analyze');
        });

        test('should execute specialized quick flow successfully', async () => {
            const config: UnifiedFlowConfig = {
                flowType: 'specialized-quick',
                flowName: 'analyze-text',
                category: 'text-processing',
                input: { text: 'This is a test text.', type: 'grammar' }
            };

            const result = await UnifiedFlowInterface.executeFlow(config);

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.flowType).toBe('specialized-quick');
            expect(result.flowName).toBe('analyze-text');
        });

        test('should handle invalid flow type gracefully', async () => {
            const config: UnifiedFlowConfig = {
                flowType: 'invalid' as FlowType,
                input: { text: 'test' }
            };

            const result = await UnifiedFlowInterface.executeFlow(config);

            expect(result.success).toBe(false);
            expect(result.error).toContain('غير مدعوم');
        });

        test('should get available flows by type', () => {
            const intelligentFlows = UnifiedFlowInterface.getAvailableFlows('intelligent');
            expect(intelligentFlows).toBeInstanceOf(Array);
            expect(intelligentFlows.length).toBeGreaterThan(0);

            const specializedFlows = UnifiedFlowInterface.getAvailableFlows('specialized');
            expect(specializedFlows).toBeInstanceOf(Array);
            expect(specializedFlows.length).toBeGreaterThan(0);

            const quickFlows = UnifiedFlowInterface.getAvailableFlows('quick');
            expect(quickFlows).toBeInstanceOf(Array);
            expect(quickFlows.length).toBeGreaterThan(0);

            const specializedQuickFlows = UnifiedFlowInterface.getAvailableFlows('specialized-quick');
            expect(specializedQuickFlows).toBeInstanceOf(Array);
            expect(specializedQuickFlows.length).toBeGreaterThan(0);
        });

        test('should get all available flows when no type specified', () => {
            const allFlows = UnifiedFlowInterface.getAvailableFlows();
            expect(allFlows).toBeInstanceOf(Array);
            expect(allFlows.length).toBeGreaterThan(0);

            // يجب أن تحتوي على تدفقات من جميع الأنواع
            const flowTypes = new Set(allFlows.map(flow => flow.type));
            expect(flowTypes.has('intelligent')).toBe(true);
            expect(flowTypes.has('specialized')).toBe(true);
            expect(flowTypes.has('quick')).toBe(true);
            expect(flowTypes.has('specialized-quick')).toBe(true);
        });

        test('should check flow availability', () => {
            expect(UnifiedFlowInterface.isFlowAvailable('intelligent-generation', 'intelligent')).toBe(true);
            expect(UnifiedFlowInterface.isFlowAvailable('grammar-checker', 'specialized')).toBe(true);
            expect(UnifiedFlowInterface.isFlowAvailable('analyze', 'quick')).toBe(true);
            expect(UnifiedFlowInterface.isFlowAvailable('analyze-text', 'specialized-quick')).toBe(true);
            expect(UnifiedFlowInterface.isFlowAvailable('non-existent-flow', 'intelligent')).toBe(false);
        });

        test('should get flow info', () => {
            const intelligentFlowInfo = UnifiedFlowInterface.getFlowInfo('intelligent-generation', 'intelligent');
            expect(intelligentFlowInfo).toBeDefined();
            expect(intelligentFlowInfo?.type).toBe('intelligent');

            const specializedFlowInfo = UnifiedFlowInterface.getFlowInfo('grammar-checker', 'specialized');
            expect(specializedFlowInfo).toBeDefined();
            expect(specializedFlowInfo?.type).toBe('specialized');
            expect(specializedFlowInfo?.category).toBe('text-processing');

            const nonExistentFlowInfo = UnifiedFlowInterface.getFlowInfo('non-existent-flow', 'intelligent');
            expect(nonExistentFlowInfo).toBeNull();
        });

        test('should execute multi-step flow successfully', async () => {
            const steps = [
                {
                    name: 'analyze',
                    config: {
                        flowType: 'quick' as FlowType,
                        flowName: 'analyze',
                        input: { text: 'This is a test text.' }
                    }
                },
                {
                    name: 'improve',
                    config: {
                        flowType: 'quick' as FlowType,
                        flowName: 'improve',
                        input: { text: 'This is a test text.', focusArea: 'clarity' }
                    },
                    dependsOn: ['analyze']
                }
            ];

            const results = await UnifiedFlowInterface.executeMultiStepFlow(steps);

            expect(results).toBeInstanceOf(Array);
            expect(results.length).toBe(2);
            expect(results[0].stepName).toBe('analyze');
            expect(results[1].stepName).toBe('improve');
            expect(results[0].result.success).toBeDefined();
            expect(results[1].result.success).toBeDefined();
        });

        test('should handle multi-step flow with unmet dependencies', async () => {
            const steps = [
                {
                    name: 'step2',
                    config: {
                        flowType: 'quick' as FlowType,
                        flowName: 'analyze',
                        input: { text: 'test' }
                    },
                    dependsOn: ['step1'] // step1 غير موجود
                }
            ];

            await expect(UnifiedFlowInterface.executeMultiStepFlow(steps))
                .rejects.toThrow('لم تكتمل بعد');
        });
    });

    describe('IntelligentAISystem Integration', () => {
        test('should run intelligent flow with specialized flow support', async () => {
            const config: IntelligentSystemConfig = {
                userInput: 'Generate a comprehensive business plan for a tech startup.',
                taskType: 'generation',
                domain: 'business',
                externalContext: [
                    { fileName: 'market-research.pdf', content: 'Market analysis data...', type: 'pdf' }
                ],
                guidelines: ['Use professional tone', 'Include financial projections'],
                qualityThreshold: 80,
                maxIterations: 2,
                enableIterativeImprovement: true,
                enablePerformanceMonitoring: true,
                enableErrorHandling: true,
                enableContextOrganization: true
            };

            const result = await IntelligentAISystem.runIntelligentFlow(config);

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.contextAnalysis).toBeDefined();
            expect(result.organizedContext).toBeDefined();
        });

        test('should run specialized flow directly', async () => {
            const result = await IntelligentAISystem.runSpecializedFlow(
                'grammar-checker',
                { text: 'This is a test text with grammar issues.' },
                {
                    category: 'text-processing',
                    enablePerformanceMonitoring: true,
                    enableErrorHandling: true
                }
            );

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.flowName).toBe('grammar-checker');
            expect(result.category).toBe('text-processing');
        });

        test('should use specialized quick helpers', async () => {
            const result = await IntelligentAISystem.useSpecializedQuickHelpers(
                'analyze',
                { text: 'This is a test text.', type: 'grammar' }
            );

            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
            expect(result.executionTime).toBeGreaterThan(0);
        });

        test('should get available flows', () => {
            const flows = IntelligentAISystem.getAvailableFlows();
            expect(flows).toBeInstanceOf(Array);
            expect(flows.length).toBeGreaterThan(0);

            const textProcessingFlows = IntelligentAISystem.getAvailableFlows('text-processing');
            expect(textProcessingFlows).toBeInstanceOf(Array);
        });

        test('should check flow availability', () => {
            expect(IntelligentAISystem.isFlowAvailable('grammar-checker')).toBe(true);
            expect(IntelligentAISystem.isFlowAvailable('non-existent-flow')).toBe(false);
        });
    });

    describe('Error Handling', () => {
        test('should handle errors gracefully in specialized flows', async () => {
            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName: 'grammar-checker',
                category: 'text-processing',
                input: { text: null }, // إدخال غير صحيح
                enableErrorHandling: true
            });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('should handle errors gracefully in quick helpers', async () => {
            const result = await SpecializedQuickHelpers.quickAnalyzeText(
                '', // نص فارغ
                'grammar'
            );

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('should handle errors gracefully in unified interface', async () => {
            const config: UnifiedFlowConfig = {
                flowType: 'specialized',
                flowName: 'non-existent-flow',
                input: { text: 'test' }
            };

            const result = await UnifiedFlowInterface.executeFlow(config);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('Performance Monitoring', () => {
        test('should track execution time for specialized flows', async () => {
            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName: 'grammar-checker',
                category: 'text-processing',
                input: { text: 'This is a test text.' },
                enablePerformanceMonitoring: true
            });

            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.executionTime).toBeLessThan(10000); // يجب أن يكون أقل من 10 ثوان
        });

        test('should track execution time for quick helpers', async () => {
            const result = await SpecializedQuickHelpers.quickAnalyzeText(
                'This is a test text.',
                'grammar'
            );

            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.executionTime).toBeLessThan(5000); // يجب أن يكون أقل من 5 ثوان
        });

        test('should track execution time for unified interface', async () => {
            const config: UnifiedFlowConfig = {
                flowType: 'quick',
                flowName: 'analyze',
                input: { text: 'This is a test text.' }
            };

            const result = await UnifiedFlowInterface.executeFlow(config);

            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.executionTime).toBeLessThan(5000);
        });
    });
});
