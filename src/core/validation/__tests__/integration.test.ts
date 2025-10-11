/**
 * اختبارات التكامل لنظام Validation
 * تغطي التكامل مع المكونات الأخرى والسيناريوهات الواقعية
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { z } from 'zod';
import { EnhancedErrorHandler } from '../../utils/enhanced-error-handler';
import { ErrorMonitoringService } from '../../utils/error-monitoring';
import { UnifiedValidator } from '../unified-validator';

// Mock dependencies
jest.mock('../../utils/enhanced-error-handler');
jest.mock('../../utils/error-monitoring');

describe('Validation System Integration', () => {
    let validator: UnifiedValidator;
    let mockEnhancedErrorHandler: jest.Mocked<typeof EnhancedErrorHandler>;
    let mockErrorMonitoringService: jest.Mocked<typeof ErrorMonitoringService>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEnhancedErrorHandler = EnhancedErrorHandler as jest.Mocked<typeof EnhancedErrorHandler>;
        mockErrorMonitoringService = ErrorMonitoringService as jest.Mocked<typeof ErrorMonitoringService>;

        mockEnhancedErrorHandler.handleWithRetry = jest.fn().mockResolvedValue({
            success: true,
            error: null
        });

        mockErrorMonitoringService.getInstance = jest.fn().mockReturnValue({
            logError: jest.fn()
        });

        validator = new UnifiedValidator();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Real-World Scenarios', () => {
        test('should handle complete user registration flow', async () => {
            const userRegistrationData = {
                name: 'أحمد محمد علي',
                email: 'ahmed.mohamed@example.com',
                password: 'StrongPassword123!',
                confirmPassword: 'StrongPassword123!',
                phone: '+966501234567',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'male',
                country: 'SA',
                city: 'الرياض',
                termsAccepted: true,
                newsletterSubscription: false
            };

            const userSchema = z.object({
                name: z.string().min(2).max(50),
                email: z.string().email(),
                password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
                confirmPassword: z.string(),
                phone: z.string().regex(/^\+966\d{9}$/),
                dateOfBirth: z.date().max(new Date()),
                gender: z.enum(['male', 'female']),
                country: z.string().length(2),
                city: z.string().min(1),
                termsAccepted: z.boolean().refine(val => val === true),
                newsletterSubscription: z.boolean()
            }).refine(data => data.password === data.confirmPassword, {
                message: 'كلمات المرور غير متطابقة',
                path: ['confirmPassword']
            });

            const result = await validator.validate(userSchema, userRegistrationData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(userRegistrationData);
        });

        test('should handle e-commerce product validation', async () => {
            const productData = {
                name: 'جهاز كمبيوتر محمول',
                description: 'جهاز كمبيوتر محمول عالي الأداء',
                price: 2500.99,
                currency: 'SAR',
                category: 'Electronics',
                subcategory: 'Laptops',
                brand: 'Dell',
                model: 'XPS 13',
                sku: 'DELL-XPS13-001',
                stock: 50,
                weight: 1.3,
                dimensions: {
                    length: 30.5,
                    width: 20.3,
                    height: 1.5
                },
                images: [
                    'https://example.com/image1.jpg',
                    'https://example.com/image2.jpg'
                ],
                tags: ['laptop', 'dell', 'xps', 'premium'],
                specifications: {
                    processor: 'Intel Core i7',
                    memory: '16GB RAM',
                    storage: '512GB SSD',
                    display: '13.3 inch'
                },
                isActive: true,
                isFeatured: false,
                seoTitle: 'جهاز كمبيوتر محمول Dell XPS 13',
                seoDescription: 'جهاز كمبيوتر محمول عالي الأداء من Dell'
            };

            const productSchema = z.object({
                name: z.string().min(1).max(100),
                description: z.string().min(10).max(1000),
                price: z.number().min(0),
                currency: z.string().length(3),
                category: z.string().min(1),
                subcategory: z.string().min(1),
                brand: z.string().min(1),
                model: z.string().min(1),
                sku: z.string().min(1),
                stock: z.number().int().min(0),
                weight: z.number().min(0),
                dimensions: z.object({
                    length: z.number().min(0),
                    width: z.number().min(0),
                    height: z.number().min(0)
                }),
                images: z.array(z.string().url()).min(1),
                tags: z.array(z.string()).min(1),
                specifications: z.record(z.string()),
                isActive: z.boolean(),
                isFeatured: z.boolean(),
                seoTitle: z.string().max(60),
                seoDescription: z.string().max(160)
            });

            const result = await validator.validate(productSchema, productData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(productData);
        });

        test('should handle AI request validation', async () => {
            const aiRequestData = {
                prompt: 'اكتب مقالاً عن الذكاء الاصطناعي وتطبيقاته في الطب',
                model: 'gemini-pro',
                temperature: 0.7,
                maxTokens: 2000,
                topP: 0.9,
                frequencyPenalty: 0.1,
                presencePenalty: 0.1,
                context: [
                    'الذكاء الاصطناعي',
                    'الطب',
                    'التشخيص الطبي',
                    'العلاج الشخصي'
                ],
                userPreferences: {
                    language: 'ar',
                    tone: 'professional',
                    length: 'medium',
                    style: 'academic'
                },
                metadata: {
                    userId: 'user123',
                    sessionId: 'session456',
                    requestId: 'req789',
                    timestamp: new Date(),
                    source: 'web-app'
                }
            };

            const aiRequestSchema = z.object({
                prompt: z.string().min(1).max(10000),
                model: z.enum(['gemini-pro', 'gpt-4', 'claude-3']),
                temperature: z.number().min(0).max(2),
                maxTokens: z.number().min(1).max(4000),
                topP: z.number().min(0).max(1),
                frequencyPenalty: z.number().min(-2).max(2),
                presencePenalty: z.number().min(-2).max(2),
                context: z.array(z.string()).max(10),
                userPreferences: z.object({
                    language: z.string(),
                    tone: z.string(),
                    length: z.string(),
                    style: z.string()
                }),
                metadata: z.object({
                    userId: z.string(),
                    sessionId: z.string(),
                    requestId: z.string(),
                    timestamp: z.date(),
                    source: z.string()
                })
            });

            const result = await validator.validate(aiRequestSchema, aiRequestData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(aiRequestData);
        });
    });

    describe('Error Handling Integration', () => {
        test('should integrate with EnhancedErrorHandler for validation errors', async () => {
            const schema = z.object({
                email: z.string().email(),
                password: z.string().min(8)
            });

            const invalidData = {
                email: 'invalid-email',
                password: '123'
            };

            const result = await validator.validate(schema, invalidData);

            expect(result.success).toBe(false);
            expect(result.enhancedError).toBeDefined();
            expect(mockEnhancedErrorHandler.handleWithRetry).toHaveBeenCalled();
        });

        test('should handle EnhancedErrorHandler failures gracefully', async () => {
            // Mock EnhancedErrorHandler to fail
            mockEnhancedErrorHandler.handleWithRetry.mockResolvedValue({
                success: false,
                error: {
                    message: 'Error handler failed',
                    name: 'ErrorHandlerFailure',
                    timestamp: new Date().toISOString(),
                    category: 'ai_generation',
                    severity: 'high',
                    operationId: 'test',
                    context: {}
                }
            });

            const schema = z.string();
            const invalidData = null;

            const result = await validator.validate(schema, invalidData);

            expect(result.success).toBe(false);
            expect(result.enhancedError).toBeDefined();
        });

        test('should log errors through ErrorMonitoringService', async () => {
            const schema = z.string().email();
            const invalidData = 'not-an-email';

            await validator.validate(schema, invalidData);

            expect(mockErrorMonitoringService.getInstance).toHaveBeenCalled();
        });
    });

    describe('Form Validation Integration', () => {
        test('should handle multi-step form validation', async () => {
            // Step 1: Personal Information
            const personalInfoSchema = z.object({
                firstName: z.string().min(2),
                lastName: z.string().min(2),
                email: z.string().email(),
                phone: z.string().regex(/^\+966\d{9}$/)
            });

            const personalInfo = {
                firstName: 'أحمد',
                lastName: 'محمد',
                email: 'ahmed@example.com',
                phone: '+966501234567'
            };

            const step1Result = await validator.validate(personalInfoSchema, personalInfo);
            expect(step1Result.success).toBe(true);

            // Step 2: Address Information
            const addressSchema = z.object({
                street: z.string().min(5),
                city: z.string().min(2),
                state: z.string().min(2),
                zipCode: z.string().regex(/^\d{5}$/),
                country: z.string().length(2)
            });

            const addressInfo = {
                street: 'شارع الملك فهد',
                city: 'الرياض',
                state: 'الرياض',
                zipCode: '12345',
                country: 'SA'
            };

            const step2Result = await validator.validate(addressSchema, addressInfo);
            expect(step2Result.success).toBe(true);

            // Step 3: Payment Information
            const paymentSchema = z.object({
                cardNumber: z.string().regex(/^\d{16}$/),
                expiryDate: z.string().regex(/^\d{2}\/\d{2}$/),
                cvv: z.string().regex(/^\d{3}$/),
                cardholderName: z.string().min(2)
            });

            const paymentInfo = {
                cardNumber: '1234567890123456',
                expiryDate: '12/25',
                cvv: '123',
                cardholderName: 'أحمد محمد'
            };

            const step3Result = await validator.validate(paymentSchema, paymentInfo);
            expect(step3Result.success).toBe(true);
        });

        test('should handle form validation with conditional fields', async () => {
            const formSchema = z.object({
                type: z.enum(['individual', 'business']),
                name: z.string().min(2),
                email: z.string().email(),
                phone: z.string().regex(/^\+966\d{9}$/),
                // Conditional fields based on type
                businessName: z.string().optional(),
                businessLicense: z.string().optional(),
                taxId: z.string().optional()
            }).refine(data => {
                if (data.type === 'business') {
                    return data.businessName && data.businessLicense && data.taxId;
                }
                return true;
            }, {
                message: 'Business fields are required for business type',
                path: ['businessName']
            });

            // Test individual type
            const individualData = {
                type: 'individual',
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                phone: '+966501234567'
            };

            const individualResult = await validator.validate(formSchema, individualData);
            expect(individualResult.success).toBe(true);

            // Test business type
            const businessData = {
                type: 'business',
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                phone: '+966501234567',
                businessName: 'شركة التكنولوجيا',
                businessLicense: 'LIC123456',
                taxId: 'TAX789012'
            };

            const businessResult = await validator.validate(formSchema, businessData);
            expect(businessResult.success).toBe(true);

            // Test business type with missing fields
            const incompleteBusinessData = {
                type: 'business',
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                phone: '+966501234567'
                // Missing business fields
            };

            const incompleteResult = await validator.validate(formSchema, incompleteBusinessData);
            expect(incompleteResult.success).toBe(false);
        });
    });

    describe('API Integration', () => {
        test('should handle API request validation', async () => {
            const apiRequestSchema = z.object({
                method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
                endpoint: z.string().startsWith('/'),
                headers: z.record(z.string()),
                body: z.any().optional(),
                query: z.record(z.string()).optional(),
                timestamp: z.date(),
                requestId: z.string().uuid()
            });

            const apiRequest = {
                method: 'POST',
                endpoint: '/api/users',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer token123'
                },
                body: {
                    name: 'أحمد محمد',
                    email: 'ahmed@example.com'
                },
                query: {
                    include: 'profile'
                },
                timestamp: new Date(),
                requestId: '550e8400-e29b-41d4-a716-446655440000'
            };

            const result = await validator.validate(apiRequestSchema, apiRequest);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(apiRequest);
        });

        test('should handle API response validation', async () => {
            const apiResponseSchema = z.object({
                success: z.boolean(),
                data: z.any().optional(),
                error: z.object({
                    code: z.string(),
                    message: z.string(),
                    details: z.any().optional()
                }).optional(),
                metadata: z.object({
                    timestamp: z.date(),
                    requestId: z.string(),
                    version: z.string()
                })
            });

            const successResponse = {
                success: true,
                data: {
                    id: 123,
                    name: 'أحمد محمد',
                    email: 'ahmed@example.com'
                },
                metadata: {
                    timestamp: new Date(),
                    requestId: '550e8400-e29b-41d4-a716-446655440000',
                    version: '1.0.0'
                }
            };

            const successResult = await validator.validate(apiResponseSchema, successResponse);
            expect(successResult.success).toBe(true);

            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: {
                        field: 'email',
                        reason: 'Invalid email format'
                    }
                },
                metadata: {
                    timestamp: new Date(),
                    requestId: '550e8400-e29b-41d4-a716-446655440000',
                    version: '1.0.0'
                }
            };

            const errorResult = await validator.validate(apiResponseSchema, errorResponse);
            expect(errorResult.success).toBe(true);
        });
    });

    describe('Database Integration', () => {
        test('should handle database entity validation', async () => {
            const userEntitySchema = z.object({
                id: z.number().int().positive(),
                uuid: z.string().uuid(),
                name: z.string().min(2).max(100),
                email: z.string().email(),
                passwordHash: z.string().min(32),
                isActive: z.boolean(),
                createdAt: z.date(),
                updatedAt: z.date(),
                lastLoginAt: z.date().optional(),
                profile: z.object({
                    avatar: z.string().url().optional(),
                    bio: z.string().max(500).optional(),
                    location: z.string().optional(),
                    website: z.string().url().optional()
                }).optional(),
                settings: z.object({
                    theme: z.enum(['light', 'dark']),
                    language: z.string(),
                    notifications: z.boolean(),
                    privacy: z.enum(['public', 'private', 'friends'])
                }),
                roles: z.array(z.string()),
                permissions: z.array(z.string())
            });

            const userEntity = {
                id: 1,
                uuid: '550e8400-e29b-41d4-a716-446655440000',
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                passwordHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
                isActive: true,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-12-01'),
                lastLoginAt: new Date('2023-11-30'),
                profile: {
                    avatar: 'https://example.com/avatar.jpg',
                    bio: 'مطور برمجيات',
                    location: 'الرياض، السعودية',
                    website: 'https://ahmed.dev'
                },
                settings: {
                    theme: 'dark',
                    language: 'ar',
                    notifications: true,
                    privacy: 'friends'
                },
                roles: ['user', 'premium'],
                permissions: ['read', 'write', 'delete']
            };

            const result = await validator.validate(userEntitySchema, userEntity);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(userEntity);
        });
    });

    describe('Error Recovery and Fallback', () => {
        test('should handle validation with fallback values', async () => {
            const schema = z.object({
                name: z.string().min(2),
                age: z.number().min(18),
                email: z.string().email()
            });

            const partialData = {
                name: 'أحمد',
                age: 25
                // Missing email
            };

            const result = await validator.validatePartial(schema, partialData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(partialData);
        });

        test('should handle validation with default values', async () => {
            const schema = z.object({
                name: z.string().min(2),
                age: z.number().min(18).default(25),
                email: z.string().email(),
                isActive: z.boolean().default(true)
            });

            const data = {
                name: 'أحمد',
                email: 'ahmed@example.com'
                // Missing age and isActive
            };

            const result = await validator.validate(schema, data);

            expect(result.success).toBe(true);
            expect(result.data?.age).toBe(25);
            expect(result.data?.isActive).toBe(true);
        });
    });

    describe('Performance Integration', () => {
        test('should handle high-volume validation efficiently', async () => {
            const schema = z.object({
                id: z.number(),
                name: z.string(),
                email: z.string().email(),
                status: z.enum(['active', 'inactive', 'pending'])
            });

            const testData = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                name: `User ${i}`,
                email: `user${i}@example.com`,
                status: ['active', 'inactive', 'pending'][i % 3] as 'active' | 'inactive' | 'pending'
            }));

            const startTime = performance.now();
            const results = await Promise.all(
                testData.map(data => validator.validate(schema, data))
            );
            const endTime = performance.now();

            expect(results).toHaveLength(1000);
            expect(results.every((r: any) => r.success)).toBe(true);
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
        });
    });
});
