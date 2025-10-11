/**
 * اختبارات شاملة لـ Zod validation schemas
 * يغطي جميع الـ schemas المعرفة والدوال المساعدة
 */

import { z } from 'zod';
import {
    AIRequestSchema,
    ContentTypeSchema,
    EmailSchema,
    EnhancedErrorSchema,
    // Error Schemas
    ErrorCategorySchema,
    ErrorSeveritySchema,
    // Export Schemas
    ExportConfigSchema,
    FormDataSchema,
    ISODateSchema,
    MemoryConfigSchema,
    // Memory Schemas
    MemoryStatsSchema,
    // AI Schemas
    ModelConfigSchema,
    // Common Schemas
    NonEmptyStringSchema,
    NonNegativeNumberSchema,
    PDFExportSchema,
    PercentageSchema,
    // Performance Schemas
    PerformanceMetricsSchema,
    PositiveNumberSchema,
    UploadConfigSchema,
    // File Schemas
    UploadedFileSchema,
    UrlSchema,
    // User Input Schemas
    UserInputSchema,
    WordExportSchema,
    mergeSchemas,
    partialValidate,
    // Utility Functions
    safeValidate,
    validateWithArabicErrors
} from '../validation-schemas';

describe('Validation Schemas', () => {
    describe('Common Schemas', () => {
        describe('NonEmptyStringSchema', () => {
            it('should accept non-empty strings', () => {
                expect(() => NonEmptyStringSchema.parse('test')).not.toThrow();
                expect(() => NonEmptyStringSchema.parse('hello world')).not.toThrow();
            });

            it('should reject empty strings', () => {
                expect(() => NonEmptyStringSchema.parse('')).toThrow();
            });

            it('should reject non-strings', () => {
                expect(() => NonEmptyStringSchema.parse(123)).toThrow();
                expect(() => NonEmptyStringSchema.parse(null)).toThrow();
                expect(() => NonEmptyStringSchema.parse(undefined)).toThrow();
            });
        });

        describe('EmailSchema', () => {
            it('should accept valid emails', () => {
                const validEmails = [
                    'test@example.com',
                    'user.name@domain.co.uk',
                    'test+tag@gmail.com'
                ];

                validEmails.forEach(email => {
                    expect(() => EmailSchema.parse(email)).not.toThrow();
                });
            });

            it('should reject invalid emails', () => {
                const invalidEmails = [
                    'notanemail',
                    '@example.com',
                    'test@',
                    'test@.com',
                    ''
                ];

                invalidEmails.forEach(email => {
                    expect(() => EmailSchema.parse(email)).toThrow();
                });
            });
        });

        describe('UrlSchema', () => {
            it('should accept valid URLs', () => {
                const validUrls = [
                    'https://example.com',
                    'http://test.org',
                    'https://sub.domain.com/path?query=value'
                ];

                validUrls.forEach(url => {
                    expect(() => UrlSchema.parse(url)).not.toThrow();
                });
            });

            it('should reject invalid URLs', () => {
                const invalidUrls = [
                    'not-a-url',
                    'ftp://example.com',
                    'example.com',
                    ''
                ];

                invalidUrls.forEach(url => {
                    expect(() => UrlSchema.parse(url)).toThrow();
                });
            });
        });

        describe('Number Schemas', () => {
            it('should validate positive numbers', () => {
                expect(() => PositiveNumberSchema.parse(1)).not.toThrow();
                expect(() => PositiveNumberSchema.parse(100)).not.toThrow();
                expect(() => PositiveNumberSchema.parse(0.1)).not.toThrow();
            });

            it('should reject zero and negative numbers for positive schema', () => {
                expect(() => PositiveNumberSchema.parse(0)).toThrow();
                expect(() => PositiveNumberSchema.parse(-1)).toThrow();
            });

            it('should validate non-negative numbers', () => {
                expect(() => NonNegativeNumberSchema.parse(0)).not.toThrow();
                expect(() => NonNegativeNumberSchema.parse(100)).not.toThrow();
            });

            it('should reject negative numbers for non-negative schema', () => {
                expect(() => NonNegativeNumberSchema.parse(-1)).toThrow();
            });

            it('should validate percentages', () => {
                expect(() => PercentageSchema.parse(0)).not.toThrow();
                expect(() => PercentageSchema.parse(50)).not.toThrow();
                expect(() => PercentageSchema.parse(100)).not.toThrow();
            });

            it('should reject out of range percentages', () => {
                expect(() => PercentageSchema.parse(-1)).toThrow();
                expect(() => PercentageSchema.parse(101)).toThrow();
            });
        });

        describe('ISODateSchema', () => {
            it('should accept valid ISO dates', () => {
                const validDates = [
                    new Date().toISOString(),
                    '2024-01-01T00:00:00.000Z',
                    '2023-12-31T23:59:59.999Z'
                ];

                validDates.forEach(date => {
                    expect(() => ISODateSchema.parse(date)).not.toThrow();
                });
            });

            it('should reject invalid dates', () => {
                const invalidDates = [
                    '2024-01-01',
                    'not-a-date',
                    '01/01/2024',
                    ''
                ];

                invalidDates.forEach(date => {
                    expect(() => ISODateSchema.parse(date)).toThrow();
                });
            });
        });
    });

    describe('Error Handling Schemas', () => {
        describe('ErrorCategorySchema', () => {
            it('should accept valid error categories', () => {
                const categories = [
                    'network',
                    'authentication',
                    'validation',
                    'ai_generation',
                    'system'
                ];

                categories.forEach(category => {
                    expect(() => ErrorCategorySchema.parse(category)).not.toThrow();
                });
            });

            it('should reject invalid categories', () => {
                expect(() => ErrorCategorySchema.parse('invalid')).toThrow();
            });
        });

        describe('ErrorSeveritySchema', () => {
            it('should accept valid severities', () => {
                const severities = ['low', 'medium', 'high', 'critical'];

                severities.forEach(severity => {
                    expect(() => ErrorSeveritySchema.parse(severity)).not.toThrow();
                });
            });

            it('should reject invalid severities', () => {
                expect(() => ErrorSeveritySchema.parse('invalid')).toThrow();
            });
        });

        describe('EnhancedErrorSchema', () => {
            it('should validate complete error object', () => {
                const error = {
                    code: 'TEST_ERROR',
                    message: 'Test error message',
                    category: 'system',
                    severity: 'medium',
                    userMessage: 'خطأ في النظام',
                    userGuidance: 'يرجى المحاولة مرة أخرى',
                    suggestedActions: ['أعد المحاولة'],
                    isRetryable: true,
                    fallbackAvailable: false,
                    timestamp: new Date().toISOString()
                };

                expect(() => EnhancedErrorSchema.parse(error)).not.toThrow();
            });

            it('should reject incomplete error object', () => {
                const incompleteError = {
                    code: 'TEST_ERROR',
                    message: 'Test'
                    // Missing required fields
                };

                expect(() => EnhancedErrorSchema.parse(incompleteError)).toThrow();
            });

            it('should accept optional fields', () => {
                const errorWithOptional = {
                    code: 'TEST_ERROR',
                    message: 'Test error message',
                    category: 'system',
                    severity: 'medium',
                    userMessage: 'خطأ',
                    userGuidance: 'guidance',
                    suggestedActions: [],
                    isRetryable: true,
                    fallbackAvailable: false,
                    timestamp: new Date().toISOString(),
                    technicalDetails: 'Additional details',
                    context: { userId: '123' },
                    retryAfter: 5,
                    stack: 'Error stack trace'
                };

                expect(() => EnhancedErrorSchema.parse(errorWithOptional)).not.toThrow();
            });
        });
    });

    describe('AI System Schemas', () => {
        describe('ModelConfigSchema', () => {
            it('should validate model configuration', () => {
                const config = {
                    modelId: 'gemini-1.5-pro',
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                    topP: 0.9,
                    topK: 40,
                    reasoning: 'Default model'
                };

                expect(() => ModelConfigSchema.parse(config)).not.toThrow();
            });

            it('should enforce temperature range', () => {
                const invalidConfig = {
                    modelId: 'test',
                    temperature: 1.5, // Invalid
                    maxOutputTokens: 1000
                };

                expect(() => ModelConfigSchema.parse(invalidConfig)).toThrow();
            });

            it('should require positive maxOutputTokens', () => {
                const invalidConfig = {
                    modelId: 'test',
                    temperature: 0.5,
                    maxOutputTokens: -100 // Invalid
                };

                expect(() => ModelConfigSchema.parse(invalidConfig)).toThrow();
            });
        });

        describe('ContentTypeSchema', () => {
            it('should accept valid content types', () => {
                const types = ['technical', 'business', 'academic', 'creative', 'mixed'];

                types.forEach(type => {
                    expect(() => ContentTypeSchema.parse(type)).not.toThrow();
                });
            });
        });

        describe('AIRequestSchema', () => {
            it('should validate complete AI request', () => {
                const request = {
                    userInput: 'أنشئ نظام إدارة',
                    taskType: 'generation',
                    domain: 'software',
                    externalContext: [
                        {
                            fileName: 'context.txt',
                            content: 'محتوى السياق',
                            type: 'context'
                        }
                    ],
                    guidelines: ['استخدم أفضل الممارسات'],
                    qualityThreshold: 85,
                    maxIterations: 3,
                    enableIterativeImprovement: true,
                    enablePerformanceMonitoring: true
                };

                expect(() => AIRequestSchema.parse(request)).not.toThrow();
            });

            it('should validate minimal AI request', () => {
                const request = {
                    userInput: 'test',
                    taskType: 'generation',
                    domain: 'test'
                };

                expect(() => AIRequestSchema.parse(request)).not.toThrow();
            });

            it('should reject empty user input', () => {
                const request = {
                    userInput: '',
                    taskType: 'generation',
                    domain: 'test'
                };

                expect(() => AIRequestSchema.parse(request)).toThrow();
            });
        });
    });

    describe('Performance Monitoring Schemas', () => {
        describe('PerformanceMetricsSchema', () => {
            it('should validate performance metrics', () => {
                const metrics = {
                    executionTime: 1500,
                    contextAnalysisTime: 200,
                    modelSelectionTime: 100,
                    promptBuildingTime: 300,
                    generationTime: 800,
                    qualityValidationTime: 100,
                    qualityScore: 85,
                    improvementIterations: 2,
                    tokensUsed: 1500,
                    memoryUsage: 256,
                    successRate: 0.95,
                    errorCount: 1
                };

                expect(() => PerformanceMetricsSchema.parse(metrics)).not.toThrow();
            });

            it('should reject invalid quality score', () => {
                const metrics = {
                    executionTime: 1000,
                    qualityScore: 150, // Invalid
                    improvementIterations: 0,
                    tokensUsed: 100,
                    memoryUsage: 100,
                    successRate: 0.9,
                    errorCount: 0
                };

                expect(() => PerformanceMetricsSchema.parse(metrics)).toThrow();
            });

            it('should reject negative times', () => {
                const metrics = {
                    executionTime: -100, // Invalid
                    qualityScore: 85,
                    improvementIterations: 0,
                    tokensUsed: 100,
                    memoryUsage: 100,
                    successRate: 0.9,
                    errorCount: 0
                };

                expect(() => PerformanceMetricsSchema.parse(metrics)).toThrow();
            });
        });
    });

    describe('Memory Management Schemas', () => {
        describe('MemoryStatsSchema', () => {
            it('should validate memory stats', () => {
                const stats = {
                    used: 5000000,
                    total: 50000000,
                    limit: 100000000,
                    percentage: 0.1,
                    timestamp: Date.now()
                };

                expect(() => MemoryStatsSchema.parse(stats)).not.toThrow();
            });

            it('should enforce percentage range', () => {
                const stats = {
                    used: 1000,
                    total: 10000,
                    limit: 100000,
                    percentage: 1.5, // Invalid
                    timestamp: Date.now()
                };

                expect(() => MemoryStatsSchema.parse(stats)).toThrow();
            });
        });

        describe('MemoryConfigSchema', () => {
            it('should validate memory config', () => {
                const config = {
                    maxCacheSize: 50 * 1024 * 1024,
                    maxEntries: 1000,
                    cleanupInterval: 30000,
                    warningThreshold: 0.7,
                    criticalThreshold: 0.9
                };

                expect(() => MemoryConfigSchema.parse(config)).not.toThrow();
            });

            it('should enforce threshold range', () => {
                const config = {
                    maxCacheSize: 1000,
                    maxEntries: 100,
                    cleanupInterval: 1000,
                    warningThreshold: 1.5, // Invalid
                    criticalThreshold: 0.9
                };

                expect(() => MemoryConfigSchema.parse(config)).toThrow();
            });
        });
    });

    describe('User Input Schemas', () => {
        describe('UserInputSchema', () => {
            it('should validate user input', () => {
                const input = {
                    text: 'Test input',
                    language: 'ar',
                    metadata: { source: 'web' }
                };

                expect(() => UserInputSchema.parse(input)).not.toThrow();
            });

            it('should apply default language', () => {
                const input = {
                    text: 'Test input'
                };

                const result = UserInputSchema.parse(input);
                expect(result.language).toBe('ar');
            });

            it('should reject empty text', () => {
                const input = {
                    text: ''
                };

                expect(() => UserInputSchema.parse(input)).toThrow();
            });
        });

        describe('FormDataSchema', () => {
            it('should validate form data', () => {
                const formData = {
                    title: 'Test Title',
                    description: 'Test description',
                    content: 'Test content',
                    category: 'test',
                    tags: ['tag1', 'tag2']
                };

                expect(() => FormDataSchema.parse(formData)).not.toThrow();
            });

            it('should allow minimal form data', () => {
                const formData = {
                    content: 'Required content'
                };

                expect(() => FormDataSchema.parse(formData)).not.toThrow();
            });
        });
    });

    describe('File Upload Schemas', () => {
        describe('UploadedFileSchema', () => {
            it('should validate uploaded file', () => {
                const file = {
                    id: '123',
                    name: 'test.pdf',
                    size: 1024,
                    type: 'application/pdf',
                    lastModified: Date.now()
                };

                expect(() => UploadedFileSchema.parse(file)).not.toThrow();
            });

            it('should reject negative file size', () => {
                const file = {
                    id: '123',
                    name: 'test.pdf',
                    size: -100, // Invalid
                    type: 'application/pdf'
                };

                expect(() => UploadedFileSchema.parse(file)).toThrow();
            });
        });

        describe('UploadConfigSchema', () => {
            it('should apply default values', () => {
                const config = {};

                const result = UploadConfigSchema.parse(config);
                expect(result.maxFileSize).toBe(10 * 1024 * 1024);
                expect(result.maxFiles).toBe(10);
                expect(result.autoProcess).toBe(true);
            });

            it('should accept custom values', () => {
                const config = {
                    maxFileSize: 5 * 1024 * 1024,
                    allowedTypes: ['text/plain'],
                    maxFiles: 5,
                    autoProcess: false
                };

                expect(() => UploadConfigSchema.parse(config)).not.toThrow();
            });
        });
    });

    describe('Export Configuration Schemas', () => {
        describe('ExportConfigSchema', () => {
            it('should validate export config', () => {
                const config = {
                    format: 'pdf',
                    includeMetadata: true,
                    includeTimestamp: true,
                    compression: false,
                    quality: 'high'
                };

                expect(() => ExportConfigSchema.parse(config)).not.toThrow();
            });

            it('should apply defaults', () => {
                const config = {
                    format: 'pdf'
                };

                const result = ExportConfigSchema.parse(config);
                expect(result.includeMetadata).toBe(true);
                expect(result.quality).toBe('high');
            });
        });

        describe('PDFExportSchema', () => {
            it('should validate PDF export config', () => {
                const config = {
                    format: 'pdf' as const,
                    pageSize: 'A4' as const,
                    orientation: 'portrait' as const,
                    margins: {
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20
                    }
                };

                expect(() => PDFExportSchema.parse(config)).not.toThrow();
            });
        });

        describe('WordExportSchema', () => {
            it('should validate Word export config', () => {
                const config = {
                    format: 'docx' as const,
                    styles: {
                        fontSize: 12,
                        fontFamily: 'Arial',
                        lineSpacing: 1.5
                    }
                };

                expect(() => WordExportSchema.parse(config)).not.toThrow();
            });
        });
    });

    describe('Utility Functions', () => {
        describe('safeValidate', () => {
            it('should return success for valid data', () => {
                const result = safeValidate(NonEmptyStringSchema, 'test');

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toBe('test');
                }
            });

            it('should return errors for invalid data', () => {
                const result = safeValidate(NonEmptyStringSchema, '');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toBeDefined();
                }
            });
        });

        describe('validateWithArabicErrors', () => {
            it('should return Arabic error messages', () => {
                const result = validateWithArabicErrors(NonEmptyStringSchema, '');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toBeDefined();
                    expect(Array.isArray(result.errors)).toBe(true);
                }
            });
        });

        describe('partialValidate', () => {
            it('should allow partial data', () => {
                const partialData = {
                    userInput: 'test'
                    // Missing other required fields
                };

                const result = partialValidate(AIRequestSchema, partialData);
                expect(result.success).toBe(true);
            });
        });

        describe('mergeSchemas', () => {
            it('should merge two schemas', () => {
                const schema1 = z.object({ a: z.string() });
                const schema2 = z.object({ b: z.number() });

                const merged = mergeSchemas(schema1, schema2);

                const validData = { a: 'test', b: 123 };
                expect(() => merged.parse(validData)).not.toThrow();

                const invalidData = { a: 'test' }; // Missing b
                expect(() => merged.parse(invalidData)).toThrow();
            });
        });
    });
});

