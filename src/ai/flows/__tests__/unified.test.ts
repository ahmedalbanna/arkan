/**
 * اختبارات شاملة لـ Unified Flows
 * تغطي جميع وظائف التدفق الموحد والحالات الحدية ومعالجة الأخطاء
 */

import { FlowRegistry } from '../registry';
import {
    UnifiedFlowRequest,
    UnifiedFlows
} from '../unified';

// Mock the AI system
jest.mock('@/ai/genkit', () => ({
    ai: {
        defineFlow: jest.fn((config, handler) => handler)
    }
}));

describe('Unified Flows', () => {
    describe('UnifiedFlows', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            // Clear the registry before each test
            FlowRegistry.clear();
        });

        it('should execute a registered flow successfully', async () => {
            // Arrange
            const mockFlow = {
                name: 'test-flow',
                description: 'تدفق تجريبي',
                category: 'test' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async (input) => ({
                    output: `تم تنفيذ التدفق مع المدخل: ${input.test}`,
                    metadata: { executed: true }
                }))
            };

            FlowRegistry.register(mockFlow);

            const request: UnifiedFlowRequest = {
                flowName: 'test-flow',
                input: { test: 'test input' },
                category: 'test' as any
            };

            // Act
            const result = await UnifiedFlows.execute(request);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data.output).toBe('تم تنفيذ التدفق مع المدخل: test input');
            expect(result.data.metadata.executed).toBe(true);
            expect(result.flowName).toBe('test-flow');
            expect(result.category).toBe('test');
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
        });

        it('should handle flow execution errors', async () => {
            // Arrange
            const errorFlow = {
                name: 'error-flow',
                description: 'تدفق ينتج خطأ',
                category: 'test' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async () => {
                    throw new Error('خطأ في التنفيذ');
                })
            };

            FlowRegistry.register(errorFlow);

            const request: UnifiedFlowRequest = {
                flowName: 'error-flow',
                input: {},
                category: 'test' as any
            };

            // Act
            const result = await UnifiedFlows.execute(request);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toBe('خطأ في التنفيذ');
            expect(result.flowName).toBe('error-flow');
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
        });

        it('should handle non-existent flow', async () => {
            // Arrange
            const request: UnifiedFlowRequest = {
                flowName: 'non-existent-flow',
                input: {},
                category: 'test' as any
            };

            // Act
            const result = await UnifiedFlows.execute(request);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toBe("Flow 'non-existent-flow' not found");
            expect(result.flowName).toBe('non-existent-flow');
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
        });

        it('should handle different flow categories', async () => {
            // Arrange
            const academicFlow = {
                name: 'academic-flow',
                description: 'تدفق أكاديمي',
                category: 'academic' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async () => ({ output: 'academic result' }))
            };

            const analysisFlow = {
                name: 'analysis-flow',
                description: 'تدفق تحليل',
                category: 'analysis' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async () => ({ output: 'analysis result' }))
            };

            FlowRegistry.register(academicFlow);
            FlowRegistry.register(analysisFlow);

            // Act
            const academicResult = await UnifiedFlows.execute({
                flowName: 'academic-flow',
                input: {},
                category: 'academic' as any
            });

            const analysisResult = await UnifiedFlows.execute({
                flowName: 'analysis-flow',
                input: {},
                category: 'analysis' as any
            });

            // Assert
            expect(academicResult.success).toBe(true);
            expect(academicResult.data.output).toBe('academic result');
            expect(academicResult.category).toBe('academic');

            expect(analysisResult.success).toBe(true);
            expect(analysisResult.data.output).toBe('analysis result');
            expect(analysisResult.category).toBe('analysis');
        });

        it('should measure execution time correctly', async () => {
            // Arrange
            const slowFlow = {
                name: 'slow-flow',
                description: 'تدفق بطيء',
                category: 'test' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async () => {
                    // Simulate slow operation
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return { output: 'slow result' };
                })
            };

            FlowRegistry.register(slowFlow);

            const request: UnifiedFlowRequest = {
                flowName: 'slow-flow',
                input: {},
                category: 'test' as any
            };

            // Act
            const result = await UnifiedFlows.execute(request);

            // Assert
            expect(result.success).toBe(true);
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
            expect(result.executionTime).toBeLessThan(200);
        });

        it('should handle complex input data', async () => {
            // Arrange
            const complexFlow = {
                name: 'complex-flow',
                description: 'تدفق معقد',
                category: 'test' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async (input) => ({
                    output: `Processed: ${JSON.stringify(input)}`,
                    metadata: { processed: true }
                }))
            };

            FlowRegistry.register(complexFlow);

            const complexInput = {
                text: 'نص معقد',
                options: {
                    language: 'ar',
                    format: 'markdown'
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            const request: UnifiedFlowRequest = {
                flowName: 'complex-flow',
                input: complexInput,
                category: 'test' as any
            };

            // Act
            const result = await UnifiedFlows.execute(request);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data.output).toContain('Processed:');
            expect(result.data.metadata.processed).toBe(true);
        });

        it('should handle flow with validation', async () => {
            // Arrange
            const validationFlow = {
                name: 'validation-flow',
                description: 'تدفق مع التحقق',
                category: 'test' as any,
                inputSchema: {
                    type: 'object',
                    properties: {
                        requiredField: { type: 'string' }
                    },
                    required: ['requiredField']
                } as any,
                outputSchema: {} as any,
                handler: jest.fn(async (input) => {
                    if (!input.requiredField) {
                        throw new Error('المجال المطلوب مفقود');
                    }
                    return { output: 'validated', metadata: {} };
                })
            };

            FlowRegistry.register(validationFlow);

            // Test with valid input
            const validRequest: UnifiedFlowRequest = {
                flowName: 'validation-flow',
                input: { requiredField: 'test value' },
                category: 'test' as any
            };

            const validResult = await UnifiedFlows.execute(validRequest);

            // Test with invalid input
            const invalidRequest: UnifiedFlowRequest = {
                flowName: 'validation-flow',
                input: {},
                category: 'test' as any
            };

            const invalidResult = await UnifiedFlows.execute(invalidRequest);

            // Assert
            expect(validResult.success).toBe(true);
            expect(validResult.data.output).toBe('validated');

            expect(invalidResult.success).toBe(false);
            expect(invalidResult.error).toBe('المجال المطلوب مفقود');
        });

        it('should handle multiple concurrent executions', async () => {
            // Arrange
            const concurrentFlow = {
                name: 'concurrent-flow',
                description: 'تدفق متزامن',
                category: 'test' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async (input) => {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    return { output: `Concurrent result ${input.id}`, metadata: {} };
                })
            };

            FlowRegistry.register(concurrentFlow);

            // Act
            const promises = Array.from({ length: 5 }, (_, i) =>
                UnifiedFlows.execute({
                    flowName: 'concurrent-flow',
                    input: { id: i },
                    category: 'test' as any
                })
            );

            const results = await Promise.all(promises);

            // Assert
            expect(results).toHaveLength(5);
            results.forEach((result, index) => {
                expect(result.success).toBe(true);
                expect(result.data.output).toBe(`Concurrent result ${index}`);
            });
        });
    });

    describe('Flow Registry Integration', () => {
        beforeEach(() => {
            FlowRegistry.clear();
        });

        it('should work with FlowRegistry', () => {
            // Arrange
            const testFlow = {
                name: 'registry-test-flow',
                description: 'تدفق اختبار السجل',
                category: 'test' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            // Act
            FlowRegistry.register(testFlow);

            // Assert
            expect(FlowRegistry.has('registry-test-flow')).toBe(true);
            expect(FlowRegistry.get('registry-test-flow')).toBeDefined();
        });

        it('should handle flow statistics', () => {
            // Arrange
            const flow1 = {
                name: 'stats-flow-1',
                description: 'تدفق الإحصائيات 1',
                category: 'academic' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            const flow2 = {
                name: 'stats-flow-2',
                description: 'تدفق الإحصائيات 2',
                category: 'analysis' as any,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            FlowRegistry.register(flow1);
            FlowRegistry.register(flow2);

            // Act
            const stats = FlowRegistry.getStats();

            // Assert
            expect(stats.totalFlows).toBe(2);
            expect(stats.flowsByCategory.academic).toBe(1);
            expect(stats.flowsByCategory.analysis).toBe(1);
        });
    });
});
