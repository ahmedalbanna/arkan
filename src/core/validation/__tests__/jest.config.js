/**
 * تكوين Jest للاختبارات
 * إعدادات مخصصة لاختبارات نظام Validation
 */

export default {
    // بيئة الاختبار
    testEnvironment: 'node',

    // مسارات الملفات
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/?(*.)+(spec|test).ts'
    ],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },

    // إعدادات TypeScript
    preset: 'ts-jest',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    // إعدادات التغطية
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/**/node_modules/**'
    ],

    // إعدادات الأداء
    testTimeout: 30000, // 30 seconds
    maxWorkers: '50%',

    // إعدادات Mock
    clearMocks: true,
    restoreMocks: true,
    resetMocks: true,

    // إعدادات الإخراج
    verbose: true,
    silent: false,

    // إعدادات مخصصة للاختبارات
    setupFilesAfterEnv: ['<rootDir>/src/core/validation/__tests__/setup.ts'],

    // إعدادات الأداء
    globals: {
        'ts-jest': {
            tsconfig: {
                target: 'es2020',
                module: 'commonjs',
                lib: ['es2020'],
                allowJs: true,
                skipLibCheck: true,
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                strict: true,
                forceConsistentCasingInFileNames: true,
                moduleResolution: 'node',
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                experimentalDecorators: true,
                emitDecoratorMetadata: true
            }
        }
    },

    // إعدادات الاختبارات المتخصصة
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/'
    ],

    // إعدادات التغطية المتخصصة
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        },
        './src/core/validation/': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    },

    // إعدادات الأداء
    performance: {
        maxConcurrency: 10,
        maxRetries: 3
    }
};
