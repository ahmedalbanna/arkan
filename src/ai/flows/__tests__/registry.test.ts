/**
 * اختبارات شاملة لـ Registry Flows
 * تغطي جميع وظائف سجل التدفقات والحالات الحدية ومعالجة الأخطاء
 */

import {
    createFlow,
    createGenkitFlow,
    FlowCategory,
    FlowRegistry
} from '../registry';

// Mock the AI system
jest.mock('@/ai/genkit', () => ({
    ai: {
        defineFlow: jest.fn((config, handler) => handler)
    }
}));

describe('Registry Flows', () => {
    describe('FlowRegistry', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            // Clear the registry before each test
            FlowRegistry.clear();
        });

        it('should register a new flow successfully', () => {
            // Arrange
            const mockFlow = {
                name: 'test-flow',
                description: 'تدفق تجريبي للاختبار',
                category: 'test' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async (input) => ({ output: 'test result', metadata: {} }))
            };

            // Act
            FlowRegistry.register(mockFlow);

            // Assert
            const retrievedFlow = FlowRegistry.get('test-flow');
            expect(retrievedFlow).toBeDefined();
            expect(retrievedFlow?.name).toBe('test-flow');
            expect(retrievedFlow?.description).toBe('تدفق تجريبي للاختبار');
        });

        it('should retrieve an existing flow by name', () => {
            // Arrange
            const mockFlow = {
                name: 'test-flow',
                description: 'تدفق تجريبي للاختبار',
                category: 'test' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async (input) => ({ output: 'test result', metadata: {} }))
            };

            FlowRegistry.register(mockFlow);

            // Act
            const retrievedFlow = FlowRegistry.get('test-flow');

            // Assert
            expect(retrievedFlow).toBeDefined();
            expect(retrievedFlow?.name).toBe('test-flow');
            expect(retrievedFlow?.handler).toBe(mockFlow.handler);
        });

        it('should return undefined for non-existent flow', () => {
            // Act
            const retrievedFlow = FlowRegistry.get('non-existent-flow');

            // Assert
            expect(retrievedFlow).toBeUndefined();
        });

        it('should return all registered flows', () => {
            // Arrange
            const flow1 = {
                name: 'flow-1',
                description: 'التدفق الأول',
                category: 'test' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            const flow2 = {
                name: 'flow-2',
                description: 'التدفق الثاني',
                category: 'test' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            FlowRegistry.register(flow1);
            FlowRegistry.register(flow2);

            // Act
            const allFlows = FlowRegistry.getAll();

            // Assert
            expect(allFlows.size).toBe(2);
            expect(allFlows.get('flow-1')).toBeDefined();
            expect(allFlows.get('flow-2')).toBeDefined();
        });

        it('should get flows by category', () => {
            // Arrange
            const academicFlow = {
                name: 'academic-flow',
                description: 'تدفق أكاديمي',
                category: 'academic' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            const analysisFlow = {
                name: 'analysis-flow',
                description: 'تدفق تحليل',
                category: 'analysis' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            FlowRegistry.register(academicFlow);
            FlowRegistry.register(analysisFlow);

            // Act
            const academicFlows = FlowRegistry.getByCategory('academic');
            const analysisFlows = FlowRegistry.getByCategory('analysis');

            // Assert
            expect(academicFlows).toHaveLength(1);
            expect(analysisFlows).toHaveLength(1);
            expect(academicFlows[0].name).toBe('academic-flow');
            expect(analysisFlows[0].name).toBe('analysis-flow');
        });

        it('should execute a registered flow correctly', async () => {
            // Arrange
            const executableFlow = {
                name: 'executable-flow',
                description: 'تدفق قابل للتنفيذ',
                category: 'test' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async (input) => ({
                    output: `تم تنفيذ التدفق مع المدخل: ${input.test}`,
                    metadata: { executed: true }
                }))
            };

            FlowRegistry.register(executableFlow);

            // Act
            const result = await FlowRegistry.execute('executable-flow', { test: 'test input' });

            // Assert
            expect(result.output).toBe('تم تنفيذ التدفق مع المدخل: test input');
            expect(result.metadata.executed).toBe(true);
        });

        it('should handle flow execution errors gracefully', async () => {
            // Arrange
            const errorFlow = {
                name: 'error-flow',
                description: 'تدفق ينتج خطأ',
                category: 'test' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async () => {
                    throw new Error('خطأ في التنفيذ');
                })
            };

            FlowRegistry.register(errorFlow);

            // Act & Assert
            await expect(FlowRegistry.execute('error-flow', {})).rejects.toThrow('خطأ في التنفيذ');
        });

        it('should throw error when executing non-existent flow', async () => {
            // Act & Assert
            await expect(FlowRegistry.execute('non-existent-flow', {})).rejects.toThrow("Flow 'non-existent-flow' not found");
        });

        it('should check if flow exists', () => {
            // Arrange
            const mockFlow = {
                name: 'existing-flow',
                description: 'تدفق موجود',
                category: 'test' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            FlowRegistry.register(mockFlow);

            // Act & Assert
            expect(FlowRegistry.has('existing-flow')).toBe(true);
            expect(FlowRegistry.has('non-existing-flow')).toBe(false);
        });

        it('should get registry statistics', () => {
            // Arrange
            const flow1 = {
                name: 'flow-1',
                description: 'التدفق الأول',
                category: 'academic' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            const flow2 = {
                name: 'flow-2',
                description: 'التدفق الثاني',
                category: 'analysis' as FlowCategory,
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
            expect(stats.categoryList).toContain('academic');
            expect(stats.categoryList).toContain('analysis');
        });
    });

    describe('createFlow', () => {
        beforeEach(() => {
            FlowRegistry.clear();
        });

        it('should create and register a flow successfully', () => {
            // Arrange
            const handler = jest.fn(async (input) => ({ output: 'created result', metadata: {} }));

            // Act
            const flow = createFlow(
                'created-flow',
                'test' as FlowCategory,
                'تدفق تم إنشاؤه',
                {} as any,
                {} as any,
                handler
            );

            // Assert
            expect(flow.name).toBe('created-flow');
            expect(flow.category).toBe('test');
            expect(flow.description).toBe('تدفق تم إنشاؤه');
            expect(flow.handler).toBe(handler);

            // Verify it's registered
            const retrievedFlow = FlowRegistry.get('created-flow');
            expect(retrievedFlow).toBeDefined();
            expect(retrievedFlow?.name).toBe('created-flow');
        });

        it('should handle different flow categories', () => {
            // Arrange
            const academicHandler = jest.fn();
            const analysisHandler = jest.fn();
            const contentHandler = jest.fn();

            // Act
            createFlow('academic-flow', 'academic' as FlowCategory, 'تدفق أكاديمي', {} as any, {} as any, academicHandler);
            createFlow('analysis-flow', 'analysis' as FlowCategory, 'تدفق تحليل', {} as any, {} as any, analysisHandler);
            createFlow('content-flow', 'content-generation' as FlowCategory, 'تدفق محتوى', {} as any, {} as any, contentHandler);

            // Assert
            expect(FlowRegistry.get('academic-flow')?.category).toBe('academic');
            expect(FlowRegistry.get('analysis-flow')?.category).toBe('analysis');
            expect(FlowRegistry.get('content-flow')?.category).toBe('content-generation');
        });

        it('should handle flow with complex input/output schemas', () => {
            // Arrange
            const inputSchema = {
                type: 'object',
                properties: {
                    text: { type: 'string' },
                    options: { type: 'object' }
                },
                required: ['text']
            };

            const outputSchema = {
                type: 'object',
                properties: {
                    result: { type: 'string' },
                    metadata: { type: 'object' }
                }
            };

            const handler = jest.fn(async (input) => ({
                result: `Processed: ${input.text}`,
                metadata: { processed: true }
            }));

            // Act
            const flow = createFlow('complex-flow', 'test' as FlowCategory, 'تدفق معقد', inputSchema, outputSchema, handler);

            // Assert
            expect(flow.inputSchema).toEqual(inputSchema);
            expect(flow.outputSchema).toEqual(outputSchema);
            expect(flow.handler).toBe(handler);
        });
    });

    describe('createGenkitFlow', () => {
        beforeEach(() => {
            FlowRegistry.clear();
        });

        it('should create a Genkit flow successfully', () => {
            // Arrange
            const flowName = 'test-genkit-flow';
            const category = 'test' as FlowCategory;
            const description = 'تدفق Genkit تجريبي';
            const inputSchema = {} as any;
            const outputSchema = {} as any;
            const handler = jest.fn(async (input) => ({ output: 'genkit result', metadata: {} }));

            // Act
            createGenkitFlow(flowName, category, description, inputSchema, outputSchema, handler);

            // Assert
            const retrievedFlow = FlowRegistry.get(flowName);
            expect(retrievedFlow).toBeDefined();
            expect(retrievedFlow?.name).toBe(flowName);
            expect(retrievedFlow?.category).toBe(category);
            expect(retrievedFlow?.description).toBe(description);
        });

        it('should handle different flow categories', () => {
            // Arrange
            const academicFlow = 'academic-flow';
            const analysisFlow = 'analysis-flow';
            const contentFlow = 'content-flow';

            // Act
            createGenkitFlow(academicFlow, 'academic' as FlowCategory, 'تدفق أكاديمي', {} as any, {} as any, jest.fn());
            createGenkitFlow(analysisFlow, 'analysis' as FlowCategory, 'تدفق تحليل', {} as any, {} as any, jest.fn());
            createGenkitFlow(contentFlow, 'content-generation' as FlowCategory, 'تدفق محتوى', {} as any, {} as any, jest.fn());

            // Assert
            expect(FlowRegistry.get(academicFlow)?.category).toBe('academic');
            expect(FlowRegistry.get(analysisFlow)?.category).toBe('analysis');
            expect(FlowRegistry.get(contentFlow)?.category).toBe('content-generation');
        });

        it('should handle flow with complex input/output schemas', () => {
            // Arrange
            const complexFlow = 'complex-flow';
            const inputSchema = {
                type: 'object',
                properties: {
                    text: { type: 'string' },
                    options: { type: 'object' }
                },
                required: ['text']
            };

            const outputSchema = {
                type: 'object',
                properties: {
                    result: { type: 'string' },
                    metadata: { type: 'object' }
                }
            };

            const handler = jest.fn(async (input) => ({
                result: `Processed: ${input.text}`,
                metadata: { processed: true }
            }));

            // Act
            createGenkitFlow(complexFlow, 'test' as FlowCategory, 'تدفق معقد', inputSchema, outputSchema, handler);

            // Assert
            const retrievedFlow = FlowRegistry.get(complexFlow);
            expect(retrievedFlow).toBeDefined();
            expect(retrievedFlow?.inputSchema).toEqual(inputSchema);
            expect(retrievedFlow?.outputSchema).toEqual(outputSchema);
        });

        it('should handle async flow handlers', async () => {
            // Arrange
            const asyncFlow = 'async-flow';
            const handler = jest.fn(async (input) => {
                // Simulate async operation
                await new Promise(resolve => setTimeout(resolve, 10));
                return { output: 'async result', metadata: { async: true } };
            });

            // Act
            createGenkitFlow(asyncFlow, 'test' as FlowCategory, 'تدفق غير متزامن', {} as any, {} as any, handler);

            // Assert
            const retrievedFlow = FlowRegistry.get(asyncFlow);
            const result = await retrievedFlow!.handler({ test: 'input' });
            expect(result.output).toBe('async result');
            expect(result.metadata.async).toBe(true);
        });

        it('should handle flow with error handling', async () => {
            // Arrange
            const errorHandlingFlow = 'error-handling-flow';
            const handler = jest.fn(async (input) => {
                if (input.shouldError) {
                    throw new Error('خطأ مقصود');
                }
                return { output: 'success', metadata: {} };
            });

            // Act
            createGenkitFlow(errorHandlingFlow, 'test' as FlowCategory, 'تدفق مع معالجة الأخطاء', {} as any, {} as any, handler);

            // Assert
            const retrievedFlow = FlowRegistry.get(errorHandlingFlow);

            // Test successful execution
            const successResult = await retrievedFlow!.handler({ shouldError: false });
            expect(successResult.output).toBe('success');

            // Test error handling
            await expect(retrievedFlow!.handler({ shouldError: true })).rejects.toThrow('خطأ مقصود');
        });
    });

    describe('Flow Management', () => {
        beforeEach(() => {
            FlowRegistry.clear();
        });

        it('should handle multiple flows with same category', () => {
            // Arrange
            const flow1 = {
                name: 'category-flow-1',
                description: 'التدفق الأول في الفئة',
                category: 'academic' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            const flow2 = {
                name: 'category-flow-2',
                description: 'التدفق الثاني في الفئة',
                category: 'academic' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn()
            };

            // Act
            FlowRegistry.register(flow1);
            FlowRegistry.register(flow2);

            // Assert
            expect(FlowRegistry.get('category-flow-1')).toBeDefined();
            expect(FlowRegistry.get('category-flow-2')).toBeDefined();
            expect(FlowRegistry.get('category-flow-1')?.category).toBe('academic');
            expect(FlowRegistry.get('category-flow-2')?.category).toBe('academic');
        });

        it('should handle flow with metadata', () => {
            // Arrange
            const metadataFlow = {
                name: 'metadata-flow',
                description: 'تدفق مع بيانات وصفية',
                category: 'test' as FlowCategory,
                inputSchema: {} as any,
                outputSchema: {} as any,
                handler: jest.fn(async (input) => ({
                    output: 'result with metadata',
                    metadata: {
                        version: '1.0.0',
                        author: 'Test Author',
                        timestamp: new Date().toISOString()
                    }
                }))
            };

            // Act
            FlowRegistry.register(metadataFlow);

            // Assert
            const retrievedFlow = FlowRegistry.get('metadata-flow');
            expect(retrievedFlow).toBeDefined();
        });

        it('should handle flow with validation', () => {
            // Arrange
            const validationFlow = {
                name: 'validation-flow',
                description: 'تدفق مع التحقق من صحة البيانات',
                category: 'test' as FlowCategory,
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

            // Act
            FlowRegistry.register(validationFlow);

            // Assert
            const retrievedFlow = FlowRegistry.get('validation-flow');
            expect(retrievedFlow).toBeDefined();
            expect(retrievedFlow?.inputSchema).toBeDefined();
        });
    });
});
