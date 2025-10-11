/**
 * إعدادات الاختبار
 * إعدادات مشتركة لجميع اختبارات نظام Validation
 */

import { afterAll, afterEach, beforeAll, beforeEach } from '@jest/globals';

// Mock Firebase
jest.mock('../../lib/firebase/client-init', () => ({
    getAuth: jest.fn(() => ({
        currentUser: null,
        signInWithEmailAndPassword: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChanged: jest.fn()
    })),
    getFirestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(),
                set: jest.fn(),
                update: jest.fn(),
                delete: jest.fn()
            })),
            add: jest.fn(),
            where: jest.fn()
        }))
    })),
    getDatabase: jest.fn(() => ({
        ref: jest.fn(() => ({
            set: jest.fn(),
            get: jest.fn(),
            update: jest.fn(),
            remove: jest.fn()
        }))
    })),
    initializeApp: jest.fn(() => ({})),
    getApp: jest.fn(() => ({})),
    getApps: jest.fn(() => [])
}));

// Mock Genkit
jest.mock('../../ai/genkit', () => ({
    googleAI: jest.fn(),
    genkit: jest.fn()
}));

// إعدادات الأداء
let performanceStartTime: number;
let memoryStartUsage: NodeJS.MemoryUsage;

// إعدادات Mock
const originalConsole = { ...console };

beforeAll(() => {
    // إعدادات عامة قبل بدء الاختبارات
    console.log('🚀 بدء اختبارات نظام Validation');

    // إعدادات الأداء
    performanceStartTime = performance.now();
    memoryStartUsage = process.memoryUsage();

    // إعدادات البيئة
    process.env.NODE_ENV = 'test';
    process.env.VALIDATION_TEST_MODE = 'true';
});

afterAll(() => {
    // تنظيف بعد انتهاء الاختبارات
    const performanceEndTime = performance.now();
    const memoryEndUsage = process.memoryUsage();

    const totalDuration = performanceEndTime - performanceStartTime;
    const memoryUsed = (memoryEndUsage.heapUsed - memoryStartUsage.heapUsed) / 1024 / 1024;

    console.log(`✅ انتهاء اختبارات نظام Validation`);
    console.log(`⏱️  المدة الإجمالية: ${totalDuration.toFixed(2)}ms`);
    console.log(`💾 الذاكرة المستخدمة: ${memoryUsed.toFixed(2)}MB`);

    // تنظيف البيئة
    delete process.env.VALIDATION_TEST_MODE;
});

beforeEach(() => {
    // إعدادات قبل كل اختبار
    jest.clearAllMocks();

    // إعادة تعيين console إذا لزم الأمر
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
});

afterEach(() => {
    // تنظيف بعد كل اختبار
    jest.restoreAllMocks();

    // تنظيف الذاكرة إذا كان متاحاً
    if (global.gc) {
        global.gc();
    }
});

// إعدادات مخصصة للاختبارات
export const testConfig = {
    // إعدادات الأداء
    performance: {
        maxDuration: 30000, // 30 seconds
        maxMemoryUsage: 100 * 1024 * 1024, // 100MB
        maxIterations: 10000
    },

    // إعدادات البيانات
    testData: {
        maxStringLength: 10000,
        maxArrayLength: 1000,
        maxObjectDepth: 10
    },

    // إعدادات الأخطاء
    errorHandling: {
        maxRetries: 3,
        retryDelay: 100, // ms
        timeout: 5000 // ms
    }
};

// دوال مساعدة للاختبارات
export const testHelpers = {
    // إنشاء بيانات اختبار عشوائية
    generateTestData: (type: string, count: number = 1) => {
        const data = [];
        for (let i = 0; i < count; i++) {
            switch (type) {
                case 'user':
                    data.push({
                        id: i,
                        name: `User ${i}`,
                        email: `user${i}@example.com`,
                        age: 20 + (i % 50)
                    });
                    break;
                case 'product':
                    data.push({
                        id: i,
                        name: `Product ${i}`,
                        price: 10 + (i % 1000),
                        category: `Category ${i % 10}`
                    });
                    break;
                default:
                    data.push({ id: i, value: `Value ${i}` });
            }
        }
        return data;
    },

    // قياس الأداء
    measurePerformance: async (fn: () => Promise<any>, iterations: number = 1) => {
        const startTime = performance.now();
        const startMemory = process.memoryUsage().heapUsed;

        for (let i = 0; i < iterations; i++) {
            await fn();
        }

        const endTime = performance.now();
        const endMemory = process.memoryUsage().heapUsed;

        return {
            duration: endTime - startTime,
            memoryUsed: (endMemory - startMemory) / 1024 / 1024, // MB
            iterations
        };
    },

    // إنشاء أخطاء اختبار
    createTestError: (type: string = 'validation') => {
        const errors = {
            validation: {
                field: 'testField',
                message: 'Test validation error',
                code: 'invalid_type',
                severity: 'error' as const,
                path: ['testField'],
                value: 'invalidValue'
            },
            network: {
                field: 'network',
                message: 'Network error',
                code: 'network_error',
                severity: 'high' as const,
                path: ['network'],
                value: null
            },
            system: {
                field: 'system',
                message: 'System error',
                code: 'system_error',
                severity: 'critical' as const,
                path: ['system'],
                value: undefined
            }
        };

        return errors[type as keyof typeof errors] || errors.validation;
    },

    // إنشاء تحذيرات اختبار
    createTestWarning: (type: string = 'empty_field') => {
        const warnings = {
            empty_field: {
                field: 'testField',
                message: 'Field is empty',
                code: 'EMPTY_FIELD',
                severity: 'warning' as const,
                path: ['testField'],
                value: ''
            },
            weak_password: {
                field: 'password',
                message: 'Password is weak',
                code: 'WEAK_PASSWORD',
                severity: 'warning' as const,
                path: ['password'],
                value: '123'
            },
            suspicious_input: {
                field: 'comment',
                message: 'Suspicious input detected',
                code: 'SUSPICIOUS_INPUT',
                severity: 'warning' as const,
                path: ['comment'],
                value: '<script>alert("xss")</script>'
            }
        };

        return warnings[type as keyof typeof warnings] || warnings.empty_field;
    }
};

// إعدادات Mock مخصصة
export const mockConfig = {
    // Mock للـ EnhancedErrorHandler
    enhancedErrorHandler: {
        handleWithRetry: jest.fn().mockResolvedValue({
            success: true,
            error: null
        })
    },

    // Mock للـ ErrorMonitoringService
    errorMonitoringService: {
        getInstance: jest.fn().mockReturnValue({
            logError: jest.fn(),
            logWarning: jest.fn(),
            logInfo: jest.fn()
        })
    }
};

// إعدادات البيانات الواقعية للاختبار
export const realWorldTestData = {
    // بيانات مستخدم حقيقية
    userRegistration: {
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
    },

    // بيانات منتج حقيقي
    product: {
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
    },

    // بيانات طلب AI حقيقي
    aiRequest: {
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
    }
};

// إعدادات الأداء المتقدمة
export const performanceConfig = {
    // حدود الأداء
    limits: {
        maxValidationTime: 1000, // 1 second
        maxMemoryUsage: 50 * 1024 * 1024, // 50MB
        maxConcurrentValidations: 100
    },

    // إعدادات الاختبار
    testSettings: {
        warmupIterations: 10,
        measurementIterations: 100,
        cooldownIterations: 5
    }
};

export default {
    testConfig,
    testHelpers,
    mockConfig,
    realWorldTestData,
    performanceConfig
};
