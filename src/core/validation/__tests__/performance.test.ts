/**
 * اختبارات الأداء والتحميل لنظام Validation
 * تغطي اختبارات الأداء، الذاكرة، والتحميل العالي
 */

import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { z } from 'zod';
import { ValidationErrorFormatter } from '../error-formatter';
import { UnifiedValidator } from '../unified-validator';
import { StringValidators, UserValidators } from '../validators';

describe('Performance Tests', () => {
    let validator: UnifiedValidator;
    let performanceResults: Array<{
        test: string;
        duration: number;
        memory: number;
        iterations: number;
    }> = [];

    beforeAll(() => {
        // Clear performance results
        performanceResults = [];
        validator = new UnifiedValidator();
    });

    afterAll(() => {
        // Log performance results
        console.log('\n=== Performance Test Results ===');
        performanceResults.forEach(result => {
            console.log(`${result.test}: ${result.duration}ms (${result.iterations} iterations, ${result.memory}MB memory)`);
        });
    });

    describe('Basic Validation Performance', () => {
        test('should validate simple strings efficiently', async () => {
            const schema = z.string();
            const testData = 'test string';
            const iterations = 10000;

            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;

            for (let i = 0; i < iterations; i++) {
                const result = await validator.validate(schema, testData);
                expect(result.success).toBe(true);
            }

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const duration = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Simple String Validation',
                duration,
                memory: memoryUsed,
                iterations
            });

            expect(duration).toBeLessThan(1000); // Should complete within 1 second
            expect(memoryUsed).toBeLessThan(10); // Should use less than 10MB
        });

        test('should validate numbers efficiently', async () => {
            const schema = z.number();
            const testData = 42;
            const iterations = 10000;

            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;

            for (let i = 0; i < iterations; i++) {
                const result = await validator.validate(schema, testData);
                expect(result.success).toBe(true);
            }

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const duration = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Number Validation',
                duration,
                memory: memoryUsed,
                iterations
            });

            expect(duration).toBeLessThan(1000);
            expect(memoryUsed).toBeLessThan(10);
        });

        test('should validate emails efficiently', async () => {
            const schema = StringValidators.email;
            const testData = 'test@example.com';
            const iterations = 5000;

            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;

            for (let i = 0; i < iterations; i++) {
                const result = await validator.validate(schema, testData);
                expect(result.success).toBe(true);
            }

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const duration = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Email Validation',
                duration,
                memory: memoryUsed,
                iterations
            });

            expect(duration).toBeLessThan(1000);
            expect(memoryUsed).toBeLessThan(10);
        });
    });

    describe('Complex Object Validation Performance', () => {
        test('should validate complex user objects efficiently', async () => {
            const schema = UserValidators.registration;
            const testData = {
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                password: 'StrongPass123!',
                confirmPassword: 'StrongPass123!',
                termsAccepted: true
            };
            const iterations = 1000;

            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;

            for (let i = 0; i < iterations; i++) {
                const result = await validator.validate(schema, testData);
                expect(result.success).toBe(true);
            }

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const duration = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Complex User Object Validation',
                duration,
                memory: memoryUsed,
                iterations
            });

            expect(duration).toBeLessThan(2000);
            expect(memoryUsed).toBeLessThan(20);
        });

        test('should validate nested objects efficiently', async () => {
            const schema = z.object({
                user: z.object({
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
                }),
                metadata: z.object({
                    createdAt: z.date(),
                    updatedAt: z.date(),
                    version: z.number()
                })
            });

            const testData = {
                user: {
                    profile: {
                        personal: {
                            name: 'أحمد محمد',
                            age: 30
                        },
                        contact: {
                            email: 'ahmed@example.com',
                            phone: '+966501234567'
                        }
                    },
                    settings: {
                        theme: 'dark',
                        language: 'ar'
                    }
                },
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: 1
                }
            };
            const iterations = 500;

            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;

            for (let i = 0; i < iterations; i++) {
                const result = await validator.validate(schema, testData);
                expect(result.success).toBe(true);
            }

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const duration = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Nested Object Validation',
                duration,
                memory: memoryUsed,
                iterations
            });

            expect(duration).toBeLessThan(3000);
            expect(memoryUsed).toBeLessThan(30);
        });
    });

    describe('Array Validation Performance', () => {
        test('should validate large arrays efficiently', async () => {
            const schema = z.array(z.object({
                id: z.number(),
                name: z.string(),
                email: z.string().email(),
                age: z.number().min(18).max(100)
            }));

            const testData = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                name: `User ${i}`,
                email: `user${i}@example.com`,
                age: 20 + (i % 50)
            }));

            const iterations = 10;

            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;

            for (let i = 0; i < iterations; i++) {
                const result = await validator.validate(schema, testData);
                expect(result.success).toBe(true);
            }

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const duration = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Large Array Validation',
                duration,
                memory: memoryUsed,
                iterations
            });

            expect(duration).toBeLessThan(5000);
            expect(memoryUsed).toBeLessThan(50);
        });

        test('should validate arrays with complex objects efficiently', async () => {
            const schema = z.array(z.object({
                id: z.number(),
                user: z.object({
                    name: z.string(),
                    email: z.string().email(),
                    profile: z.object({
                        age: z.number(),
                        location: z.string(),
                        preferences: z.object({
                            theme: z.string(),
                            language: z.string(),
                            notifications: z.boolean()
                        })
                    })
                }),
                metadata: z.object({
                    createdAt: z.date(),
                    tags: z.array(z.string()),
                    score: z.number()
                })
            }));

            const testData = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                user: {
                    name: `User ${i}`,
                    email: `user${i}@example.com`,
                    profile: {
                        age: 20 + (i % 50),
                        location: `City ${i}`,
                        preferences: {
                            theme: 'dark',
                            language: 'ar',
                            notifications: true
                        }
                    }
                },
                metadata: {
                    createdAt: new Date(),
                    tags: [`tag${i}`, `category${i % 5}`],
                    score: Math.random() * 100
                }
            }));

            const iterations = 5;

            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;

            for (let i = 0; i < iterations; i++) {
                const result = await validator.validate(schema, testData);
                expect(result.success).toBe(true);
            }

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const duration = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Complex Array Validation',
                duration,
                memory: memoryUsed,
                iterations
            });

            expect(duration).toBeLessThan(3000);
            expect(memoryUsed).toBeLessThan(30);
        });
    });

    describe('Error Handling Performance', () => {
        test('should handle validation errors efficiently', async () => {
            const schema = z.object({
                name: z.string().min(3),
                email: z.string().email(),
                age: z.number().min(18)
            });

            const testData = {
                name: 'ab', // invalid
                email: 'invalid-email', // invalid
                age: 15 // invalid
            };

            const iterations = 1000;

            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;

            for (let i = 0; i < iterations; i++) {
                const result = await validator.validate(schema, testData);
                expect(result.success).toBe(false);
            }

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const duration = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Error Handling Performance',
                duration,
                memory: memoryUsed,
                iterations
            });

            expect(duration).toBeLessThan(2000);
            expect(memoryUsed).toBeLessThan(20);
        });

        test('should format errors efficiently', async () => {
            const errors = Array.from({ length: 1000 }, (_, i) => ({
                field: `field_${i}`,
                message: `Error message ${i}`,
                code: 'invalid_type',
                severity: 'error' as const,
                path: [`field_${i}`],
                value: `value_${i}`
            }));

            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;

            const formatted = errors.map(error => ValidationErrorFormatter.formatError(error));

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const duration = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Error Formatting Performance',
                duration,
                memory: memoryUsed,
                iterations: errors.length
            });

            expect(formatted).toHaveLength(1000);
            expect(duration).toBeLessThan(500);
            expect(memoryUsed).toBeLessThan(10);
        });
    });

    describe('Concurrent Validation Performance', () => {
        test('should handle concurrent validations efficiently', async () => {
            const schema = z.string().email();
            const testData = 'test@example.com';
            const concurrentValidations = 100;

            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;

            const promises = Array.from({ length: concurrentValidations }, () =>
                validator.validate(schema, testData)
            );

            const results = await Promise.all(promises);

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const duration = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Concurrent Validation Performance',
                duration,
                memory: memoryUsed,
                iterations: concurrentValidations
            });

            expect(results).toHaveLength(concurrentValidations);
            expect(results.every(r => r.success)).toBe(true);
            expect(duration).toBeLessThan(1000);
            expect(memoryUsed).toBeLessThan(20);
        });

        test('should handle mixed concurrent validations efficiently', async () => {
            const schemas = [
                z.string().email(),
                z.number().min(0),
                z.boolean(),
                z.date(),
                z.array(z.string())
            ];

            const testData = [
                'test@example.com',
                42,
                true,
                new Date(),
                ['item1', 'item2', 'item3']
            ];

            const concurrentValidations = 50;

            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;

            const promises = Array.from({ length: concurrentValidations }, (_, i) => {
                const schemaIndex = i % schemas.length;
                const dataIndex = i % testData.length;
                return UnifiedValidator.validate(schemas[schemaIndex], testData[dataIndex]);
            });

            const results = await Promise.all(promises);

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const duration = endTime - startTime;
            const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Mixed Concurrent Validation Performance',
                duration,
                memory: memoryUsed,
                iterations: concurrentValidations
            });

            expect(results).toHaveLength(concurrentValidations);
            expect(duration).toBeLessThan(1000);
            expect(memoryUsed).toBeLessThan(20);
        });
    });

    describe('Memory Management', () => {
        test('should not leak memory with repeated validations', async () => {
            const schema = z.object({
                data: z.string(),
                metadata: z.object({
                    timestamp: z.date(),
                    version: z.number(),
                    tags: z.array(z.string())
                })
            });

            const testData = {
                data: 'x'.repeat(10000), // 10KB string
                metadata: {
                    timestamp: new Date(),
                    version: 1,
                    tags: ['tag1', 'tag2', 'tag3']
                }
            };

            const iterations = 1000;
            const initialMemory = process.memoryUsage().heapUsed;

            for (let i = 0; i < iterations; i++) {
                const result = await validator.validate(schema, testData);
                expect(result.success).toBe(true);
            }

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Memory Leak Test',
                duration: 0,
                memory: memoryIncrease,
                iterations
            });

            // Memory increase should be reasonable (less than 50MB)
            expect(memoryIncrease).toBeLessThan(50);
        });

        test('should handle large objects without memory issues', async () => {
            const schema = z.object({
                data: z.string()
            });

            const largeData = {
                data: 'x'.repeat(1000000) // 1MB string
            };

            const iterations = 10;
            const initialMemory = process.memoryUsage().heapUsed;

            for (let i = 0; i < iterations; i++) {
                const result = await UnifiedValidator.validate(schema, largeData);
                expect(result.success).toBe(true);
            }

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

            performanceResults.push({
                test: 'Large Object Memory Test',
                duration: 0,
                memory: memoryIncrease,
                iterations
            });

            // Memory increase should be reasonable (less than 100MB)
            expect(memoryIncrease).toBeLessThan(100);
        });
    });

    describe('Stress Tests', () => {
        test('should handle high-frequency validations', async () => {
            const schema = z.string().email();
            const testData = 'test@example.com';
            const iterations = 50000;

            const startTime = performance.now();

            for (let i = 0; i < iterations; i++) {
                const result = await validator.validate(schema, testData);
                expect(result.success).toBe(true);
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            performanceResults.push({
                test: 'High-Frequency Validation',
                duration,
                memory: 0,
                iterations
            });

            // Should complete within 10 seconds
            expect(duration).toBeLessThan(10000);
        });

        test('should handle validation with complex transformations', async () => {
            const schema = z.string();
            const transformFn = (data: string) => data.toUpperCase();
            const testData = 'hello world';
            const iterations = 1000;

            const startTime = performance.now();

            for (let i = 0; i < iterations; i++) {
                const result = await validator.validateAndTransform(schema, transformFn, testData);
                expect(result.success).toBe(true);
                expect(result.data).toBe('HELLO WORLD');
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            performanceResults.push({
                test: 'Transform Validation',
                duration,
                memory: 0,
                iterations
            });

            expect(duration).toBeLessThan(2000);
        });
    });
});
