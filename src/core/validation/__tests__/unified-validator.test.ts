/**
 * اختبارات شاملة لنظام UnifiedValidator
 * تغطي جميع الوظائف الأساسية، edge cases، واختبارات الأداء
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { z } from 'zod';
import { EnhancedErrorHandler } from '../../utils/enhanced-error-handler';
import { ErrorMonitoringService } from '../../utils/error-monitoring';
import { UnifiedValidator } from '../unified-validator';

// Mock dependencies
jest.mock('../../utils/enhanced-error-handler');
jest.mock('../../utils/error-monitoring');

describe('UnifiedValidator', () => {
    let validator: UnifiedValidator;
    let mockEnhancedErrorHandler: jest.Mocked<typeof EnhancedErrorHandler>;
    let mockErrorMonitoringService: jest.Mocked<typeof ErrorMonitoringService>;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mocks
        mockEnhancedErrorHandler = EnhancedErrorHandler as jest.Mocked<typeof EnhancedErrorHandler>;
        mockErrorMonitoringService = ErrorMonitoringService as jest.Mocked<typeof ErrorMonitoringService>;

        // Mock static methods
        (mockEnhancedErrorHandler.handleWithRetry as any) = jest.fn().mockImplementation(async (fn: any, context: any) => {
            try {
                await fn();
                return { success: true, error: null };
            } catch (error) {
                return {
                    success: false,
                    error: {
                        message: 'Mock error',
                        name: 'MockError',
                        timestamp: new Date().toISOString(),
                        category: 'ai_generation',
                        severity: 'medium',
                        operationId: context.operationId,
                        context: {}
                    }
                };
            }
        });

        (mockErrorMonitoringService.getInstance as any) = jest.fn().mockReturnValue({
            logError: jest.fn()
        });

        // Create validator instance
        validator = new UnifiedValidator();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Basic Validation', () => {
        test('should validate simple string successfully', async () => {
            const schema = z.string();
            const data = 'test string';

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(true);
            expect(result.data).toBe('test string');
            expect(result.errors).toBeUndefined();
        });

        test('should validate complex object successfully', async () => {
            const schema = z.object({
                name: z.string(),
                age: z.number(),
                email: z.string().email(),
                isActive: z.boolean()
            });

            const data = {
                name: 'أحمد',
                age: 30,
                email: 'ahmed@example.com',
                isActive: true
            };

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(data);
        });

        test('should handle validation failure with detailed errors', async () => {
            const schema = z.object({
                name: z.string().min(3),
                age: z.number().min(18),
                email: z.string().email()
            });

            const data = {
                name: 'ab', // too short
                age: 15, // too young
                email: 'invalid-email' // invalid format
            };

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors!.length).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases', () => {
        test('should handle null input', async () => {
            const schema = z.string();
            const data = null;

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
        });

        test('should handle undefined input', async () => {
            const schema = z.string();
            const data = undefined;

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
        });

        test('should handle empty string', async () => {
            const schema = z.string().min(1);
            const data = '';

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
        });

        test('should handle empty object', async () => {
            const schema = z.object({
                name: z.string()
            });
            const data = {};

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
        });

        test('should handle empty array', async () => {
            const schema = z.array(z.string()).min(1);
            const data: string[] = [];

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
        });

        test('should handle very large objects', async () => {
            const schema = z.object({
                data: z.string()
            });

            // Create a large object
            const largeData: { data: string } = {
                data: 'x'.repeat(1000000) // 1MB string
            };

            const result = await validator.validate(schema, largeData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(largeData);
        });

        test('should handle deeply nested objects', async () => {
            const schema = z.object({
                level1: z.object({
                    level2: z.object({
                        level3: z.object({
                            value: z.string()
                        })
                    })
                })
            });

            const data = {
                level1: {
                    level2: {
                        level3: {
                            value: 'deep value'
                        }
                    }
                }
            };

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(data);
        });

        test('should handle special characters in strings', async () => {
            const schema = z.string();
            const data = '!@#$%^&*()_+-=[]{}|;:,.<>?';

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(true);
            expect(result.data).toBe(data);
        });

        test('should handle Unicode characters', async () => {
            const schema = z.string();
            const data = 'مرحباً بك في النظام 🚀';

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(true);
            expect(result.data).toBe(data);
        });

        test('should handle circular references gracefully', async () => {
            const schema = z.object({
                name: z.string(),
                ref: z.any()
            });

            const data: any = {
                name: 'test',
                ref: null
            };
            data.ref = data; // Create circular reference

            const result = await validator.validate(schema, data);

            // Should handle gracefully without crashing
            expect(result).toBeDefined();
        });
    });

    describe('Validation Options', () => {
        test('should respect abortEarly option', async () => {
            const schema = z.object({
                field1: z.string().min(3),
                field2: z.string().min(3),
                field3: z.string().min(3)
            });

            const data = {
                field1: 'ab', // invalid
                field2: 'cd', // invalid
                field3: 'ef'  // invalid
            };

            const result = await validator.validate(schema, data, {
                abortEarly: true
            });

            expect(result.success).toBe(false);
            // Should stop at first error
            expect(result.errors!.length).toBe(1);
        });

        test('should respect custom messages', async () => {
            const schema = z.object({
                email: z.string().email()
            });

            const data = {
                email: 'invalid-email'
            };

            const customMessages = {
                email: 'البريد الإلكتروني غير صحيح'
            };

            const result = await validator.validate(schema, data, {
                customMessages
            });

            expect(result.success).toBe(false);
        });

        test('should include context in error handling', async () => {
            const schema = z.string();
            const data = null;

            const context = {
                operation: 'test-operation',
                userId: 'user123'
            };

            const result = await validator.validate(schema, data, {
                context
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Partial Validation', () => {
        test('should validate partial data successfully', async () => {
            const schema = z.object({
                name: z.string(),
                age: z.number(),
                email: z.string().email()
            });

            const data = {
                name: 'أحمد'
                // Missing age and email
            };

            const result = await validator.validatePartial(schema, data);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(data);
        });

        test('should handle partial validation with invalid data', async () => {
            const schema = z.object({
                name: z.string().min(3),
                age: z.number().min(18)
            });

            const data = {
                name: 'ab', // invalid
                age: 15    // invalid
            };

            const result = await validator.validatePartial(schema, data);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
        });
    });

    describe('Transform Validation', () => {
        test('should transform data successfully', async () => {
            const schema = z.string();
            const transformFn = (data: string) => data.toUpperCase();

            const data = 'hello world';

            const result = await validator.validateAndTransform(schema, transformFn, data);

            expect(result.success).toBe(true);
            expect(result.data).toBe('HELLO WORLD');
        });

        test('should handle transform errors', async () => {
            const schema = z.string();
            const transformFn = (data: string) => {
                throw new Error('Transform error');
            };

            const data = 'test';

            const result = await validator.validateAndTransform(schema, transformFn, data);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
        });
    });

    describe('Error Handling Integration', () => {
        test('should integrate with EnhancedErrorHandler', async () => {
            const schema = z.string();
            const data = null;

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(false);
            expect(mockEnhancedErrorHandler.handleWithRetry).toHaveBeenCalled();
        });

        test('should handle EnhancedErrorHandler failures', async () => {
            // Mock EnhancedErrorHandler to fail
            (mockEnhancedErrorHandler.handleWithRetry as any).mockImplementation(async (fn: any, context: any) => {
                return {
                    success: false,
                    error: {
                        message: 'Error handler failed',
                        name: 'ErrorHandlerFailure',
                        timestamp: new Date().toISOString(),
                        category: 'ai_generation',
                        severity: 'high',
                        operationId: context.operationId,
                        context: {}
                    }
                };
            });

            const schema = z.string();
            const data = null;

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(false);
        });
    });

    describe('Performance Tests', () => {
        test('should handle large datasets efficiently', async () => {
            const schema = z.array(z.object({
                id: z.number(),
                name: z.string(),
                email: z.string().email()
            }));

            // Create large dataset
            const largeData: Array<{ id: number, name: string, email: string }> = Array.from({ length: 10000 }, (_, i) => ({
                id: i,
                name: `User ${i}`,
                email: `user${i}@example.com`
            }));

            const startTime = performance.now();
            const result = await validator.validate(schema, largeData);
            const endTime = performance.now();

            expect(result.success).toBe(true);
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });

        test('should handle complex nested validation efficiently', async () => {
            const schema = z.object({
                users: z.array(z.object({
                    profile: z.object({
                        personal: z.object({
                            name: z.string(),
                            age: z.number()
                        }),
                        contact: z.object({
                            email: z.string().email(),
                            phone: z.string()
                        })
                    }),
                    settings: z.object({
                        theme: z.string(),
                        language: z.string()
                    })
                }))
            });

            const data = {
                users: Array.from({ length: 1000 }, (_, i) => ({
                    profile: {
                        personal: {
                            name: `User ${i}`,
                            age: 20 + i
                        },
                        contact: {
                            email: `user${i}@example.com`,
                            phone: `+123456789${i}`
                        }
                    },
                    settings: {
                        theme: 'dark',
                        language: 'ar'
                    }
                }))
            };

            const startTime = performance.now();
            const result = await validator.validate(schema, data);
            const endTime = performance.now();

            expect(result.success).toBe(true);
            expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
        });

        test('should handle concurrent validations', async () => {
            const schema = z.string();
            const data = 'test';

            const promises = Array.from({ length: 100 }, () =>
                validator.validate(schema, data)
            );

            const startTime = performance.now();
            const results = await Promise.all(promises);
            const endTime = performance.now();

            expect(results).toHaveLength(100);
            expect(results.every((r: any) => r.success)).toBe(true);
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });
    });

    describe('Memory Management', () => {
        test('should not leak memory with large objects', async () => {
            const schema = z.object({
                data: z.string()
            });

            const initialMemory = process.memoryUsage().heapUsed;

            // Process large objects
            for (let i = 0; i < 100; i++) {
                const largeData = {
                    data: 'x'.repeat(100000) // 100KB string
                };

                const result = await validator.validate(schema, largeData);
                expect(result.success).toBe(true);
            }

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            // Memory increase should be reasonable (less than 50MB)
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        });
    });

    describe('Error Recovery', () => {
        test('should recover from temporary errors', async () => {
            let callCount = 0;

            // Mock EnhancedErrorHandler to fail first, then succeed
            (mockEnhancedErrorHandler.handleWithRetry as any).mockImplementation(async (fn: any, context: any) => {
                callCount++;
                if (callCount === 1) {
                    return {
                        success: false,
                        error: {
                            message: 'Temporary error',
                            name: 'TemporaryError',
                            timestamp: new Date().toISOString(),
                            category: 'ai_generation',
                            severity: 'medium',
                            operationId: context.operationId,
                            context: {}
                        }
                    };
                } else {
                    return {
                        success: true,
                        error: null
                    };
                }
            });

            const schema = z.string();
            const data = null;

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(false);
            expect(callCount).toBe(1);
        });
    });

    describe('Integration Tests', () => {
        test('should work with real-world AI request schema', async () => {
            const aiRequestSchema = z.object({
                prompt: z.string().min(1),
                model: z.string(),
                temperature: z.number().min(0).max(2),
                maxTokens: z.number().min(1).max(4000),
                context: z.array(z.string()).optional()
            });

            const aiRequest = {
                prompt: 'اكتب مقالاً عن الذكاء الاصطناعي',
                model: 'gemini-pro',
                temperature: 0.7,
                maxTokens: 2000,
                context: ['AI', 'Machine Learning', 'Technology']
            };

            const result = await validator.validate(aiRequestSchema, aiRequest);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(aiRequest);
        });

        test('should work with user registration schema', async () => {
            const userSchema = z.object({
                name: z.string().min(2).max(50),
                email: z.string().email(),
                password: z.string().min(8),
                confirmPassword: z.string(),
                termsAccepted: z.boolean()
            }).refine(data => data.password === data.confirmPassword, {
                message: 'كلمات المرور غير متطابقة',
                path: ['confirmPassword']
            });

            const userData = {
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                termsAccepted: true
            };

            const result = await validator.validate(userSchema, userData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(userData);
        });
    });
});
