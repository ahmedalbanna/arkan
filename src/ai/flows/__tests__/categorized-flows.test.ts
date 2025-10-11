/**
 * اختبار النظام الجديد للتدفقات المصنفة
 */

import { beforeEach, describe, expect, test } from '@jest/globals';
import { FlowCategory, FlowRegistry, UnifiedFlows } from '../../flows';

describe('النظام الجديد للتدفقات المصنفة', () => {
    beforeEach(() => {
        // مسح التدفقات المسجلة قبل كل اختبار
        FlowRegistry.clear();
    });

    describe('FlowRegistry', () => {
        test('يجب أن يسجل التدفقات بشكل صحيح', () => {
            const mockFlow = {
                name: 'test-flow',
                category: 'text-processing' as FlowCategory,
                description: 'تدفق اختبار',
                inputSchema: {},
                outputSchema: {},
                handler: async (input: any) => ({ result: 'test' })
            };

            FlowRegistry.register(mockFlow);

            expect(FlowRegistry.has('test-flow')).toBe(true);
            expect(FlowRegistry.get('test-flow')).toEqual(mockFlow);
        });

        test('يجب أن يحصل على التدفقات حسب الفئة', () => {
            const textFlow = {
                name: 'text-flow',
                category: 'text-processing' as FlowCategory,
                description: 'تدفق نصي',
                inputSchema: {},
                outputSchema: {},
                handler: async (input: any) => ({ result: 'text' })
            };

            const contentFlow = {
                name: 'content-flow',
                category: 'content-generation' as FlowCategory,
                description: 'تدفق محتوى',
                inputSchema: {},
                outputSchema: {},
                handler: async (input: any) => ({ result: 'content' })
            };

            FlowRegistry.register(textFlow);
            FlowRegistry.register(contentFlow);

            const textFlows = FlowRegistry.getByCategory('text-processing');
            const contentFlows = FlowRegistry.getByCategory('content-generation');

            expect(textFlows).toHaveLength(1);
            expect(textFlows[0].name).toBe('text-flow');

            expect(contentFlows).toHaveLength(1);
            expect(contentFlows[0].name).toBe('content-flow');
        });

        test('يجب أن ينفذ التدفقات بشكل صحيح', async () => {
            const mockFlow = {
                name: 'test-flow',
                category: 'text-processing' as FlowCategory,
                description: 'تدفق اختبار',
                inputSchema: {},
                outputSchema: {},
                handler: async (input: any) => ({ result: `processed: ${input.text}` })
            };

            FlowRegistry.register(mockFlow);

            const result = await FlowRegistry.execute('test-flow', { text: 'hello' });

            expect(result).toEqual({ result: 'processed: hello' });
        });

        test('يجب أن يرمي خطأ للتدفقات غير الموجودة', async () => {
            await expect(FlowRegistry.execute('non-existent-flow', {}))
                .rejects.toThrow("Flow 'non-existent-flow' not found");
        });

        test('يجب أن يحصل على الإحصائيات بشكل صحيح', () => {
            const flows = [
                {
                    name: 'flow1',
                    category: 'text-processing' as FlowCategory,
                    description: 'تدفق 1',
                    inputSchema: {},
                    outputSchema: {},
                    handler: async () => ({})
                },
                {
                    name: 'flow2',
                    category: 'text-processing' as FlowCategory,
                    description: 'تدفق 2',
                    inputSchema: {},
                    outputSchema: {},
                    handler: async () => ({})
                },
                {
                    name: 'flow3',
                    category: 'content-generation' as FlowCategory,
                    description: 'تدفق 3',
                    inputSchema: {},
                    outputSchema: {},
                    handler: async () => ({})
                }
            ];

            flows.forEach(flow => FlowRegistry.register(flow));

            const stats = FlowRegistry.getStats();

            expect(stats.totalFlows).toBe(3);
            expect(stats.flowsByCategory['text-processing']).toBe(2);
            expect(stats.flowsByCategory['content-generation']).toBe(1);
            expect(stats.categoryList).toContain('text-processing');
            expect(stats.categoryList).toContain('content-generation');
        });
    });

    describe('UnifiedFlows', () => {
        beforeEach(() => {
            // تسجيل تدفق اختبار
            FlowRegistry.register({
                name: 'test-flow',
                category: 'text-processing' as FlowCategory,
                description: 'تدفق اختبار',
                inputSchema: {},
                outputSchema: {},
                handler: async (input: any) => ({ result: `processed: ${input.text}` })
            });
        });

        test('يجب أن ينفذ التدفقات بشكل صحيح', async () => {
            const result = await UnifiedFlows.execute({
                flowName: 'test-flow',
                input: { text: 'hello' }
            });

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ result: 'processed: hello' });
            expect(result.flowName).toBe('test-flow');
            expect(result.category).toBe('text-processing');
            expect(result.executionTime).toBeGreaterThan(0);
        });

        test('يجب أن يتعامل مع الأخطاء بشكل صحيح', async () => {
            const result = await UnifiedFlows.execute({
                flowName: 'non-existent-flow',
                input: { text: 'hello' }
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('not found');
            expect(result.flowName).toBe('non-existent-flow');
        });

        test('يجب أن ينفذ التدفقات المتعددة بشكل صحيح', async () => {
            // تسجيل تدفق آخر
            FlowRegistry.register({
                name: 'test-flow-2',
                category: 'content-generation' as FlowCategory,
                description: 'تدفق اختبار 2',
                inputSchema: {},
                outputSchema: {},
                handler: async (input: any) => ({ result: `generated: ${input.prompt}` })
            });

            const results = await UnifiedFlows.executeMultiple([
                { flowName: 'test-flow', input: { text: 'hello' } },
                { flowName: 'test-flow-2', input: { prompt: 'world' } }
            ]);

            expect(results).toHaveLength(2);
            expect(results[0].success).toBe(true);
            expect(results[0].data).toEqual({ result: 'processed: hello' });
            expect(results[1].success).toBe(true);
            expect(results[1].data).toEqual({ result: 'generated: world' });
        });

        test('يجب أن ينفذ مع إعادة المحاولة بشكل صحيح', async () => {
            let attemptCount = 0;

            FlowRegistry.register({
                name: 'failing-flow',
                category: 'text-processing' as FlowCategory,
                description: 'تدفق فاشل',
                inputSchema: {},
                outputSchema: {},
                handler: async (input: any) => {
                    attemptCount++;
                    if (attemptCount < 3) {
                        throw new Error('Temporary failure');
                    }
                    return { result: 'success' };
                }
            });

            const result = await UnifiedFlows.executeWithRetry(
                { flowName: 'failing-flow', input: {} },
                3,
                10 // تأخير قصير للاختبار
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ result: 'success' });
            expect(attemptCount).toBe(3);
        });

        test('يجب أن يحصل على التدفقات المتاحة', () => {
            const flows = UnifiedFlows.getAvailableFlows();

            expect(flows).toHaveLength(1);
            expect(flows[0].name).toBe('test-flow');
            expect(flows[0].category).toBe('text-processing');
            expect(flows[0].description).toBe('تدفق اختبار');
        });

        test('يجب أن يحصل على التدفقات حسب الفئة', () => {
            const textFlows = UnifiedFlows.getFlowsByCategory('text-processing');

            expect(textFlows).toHaveLength(1);
            expect(textFlows[0].name).toBe('test-flow');
        });

        test('يجب أن يتحقق من وجود التدفقات', () => {
            expect(UnifiedFlows.hasFlow('test-flow')).toBe(true);
            expect(UnifiedFlows.hasFlow('non-existent-flow')).toBe(false);
        });

        test('يجب أن يحصل على معلومات التدفق', () => {
            const info = UnifiedFlows.getFlowInfo('test-flow');

            expect(info).not.toBeNull();
            expect(info?.name).toBe('test-flow');
            expect(info?.category).toBe('text-processing');
            expect(info?.description).toBe('تدفق اختبار');
        });

        test('يجب أن يحصل على الإحصائيات', () => {
            const stats = UnifiedFlows.getStats();

            expect(stats.totalFlows).toBe(1);
            expect(stats.flowsByCategory['text-processing']).toBe(1);
        });
    });
});
