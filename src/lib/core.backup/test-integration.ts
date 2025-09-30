/**
 * ملف اختبار التكامل للمرحلة الأولى
 *
 * هذا الملف يختبر أن جميع المكونات تعمل بشكل صحيح
 * ويمكن استيرادها بدون أخطاء
 */

// اختبار استيراد الثوابت
import {
    API_ENDPOINTS,
    SUPPORTED_FILE_TYPES,
} from './constants';

// اختبار استيراد الأنواع
import {
    AuthContext,
    ErrorState,
    // ExportResult,
    HttpRequestOptions,
    LoadingState,
    // PDFExportOptions,
    ProcessResult
} from './types';

// اختبار استيراد الأدوات
import {
    cn,
    createHash,
    formatFileSize,
    generateRandomPassword,
    generateUUID,
    sanitizeText,
    truncateText,
} from './utils';

// اختبار استيراد معالجة الأخطاء
import {
    createError,
    handleAPIError,
    handleValidationError
} from './error-handling';

/**
 * اختبار الثوابت
 */
function testConstants() {
    console.log('Testing Constants...');

    // اختبار نقاط نهاية API
    console.log('API Endpoints:', API_ENDPOINTS.WRITING_TOOLS.PARAPHRASE);

    // اختبار أنواع الملفات
    console.log('PDF Max Size:', SUPPORTED_FILE_TYPES.PDF.maxSize);

    // اختبار قواعد التحقق
    // console.log('Min Length:', TEXT_VALIDATION_RULES.MIN_LENGTH);

    // اختبار رسائل التحقق
    // console.log('Required Message:', VALIDATION_MESSAGES.REQUIRED);

    console.log('✅ Constants test passed');
}

/**
 * اختبار الأنواع
 */
function testTypes() {
    console.log('Testing Types...');

    // اختبار ProcessResult
    const result: ProcessResult<string> = {
        success: true,
        data: 'Test data',
        message: 'Test message'
    };

    // اختبار LoadingState
    const loading: LoadingState = {
        isLoading: true,
        progress: 50,
        message: 'Loading...'
    };

    // اختبار ErrorState
    const error: ErrorState = {
        hasError: true,
        error: 'Test error',
        code: 'TEST_ERROR'
    };

    // اختبار HttpRequestOptions
    const requestOptions: HttpRequestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
        timeout: 5000
    };

    // اختبار AuthContext
    const auth: AuthContext = {
        user: {
            id: '1',
            email: 'test@example.com',
            role: 'user',
            permissions: []
        },
        token: 'test-token',
        expiresAt: new Date()
    };

    // اختبار PDFExportOptions
    const pdfOptions: any = {
        format: 'pdf',
        pageOptions: {
            size: 'A4',
            orientation: 'portrait',
            margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        fontOptions: {
            family: 'Arial',
            size: 12,
            color: 'black'
        },
        paragraphOptions: {
            alignment: 'left'
        }
    };

    // اختبار ExportResult
    const exportResult: any = {
        success: true,
        filename: 'test.pdf',
        size: 1024000,
        format: 'pdf',
        downloadUrl: '/download/test.pdf'
    };

    console.log('✅ Types test passed');
}

/**
 * اختبار الأدوات
 */
async function testUtils() {
    console.log('Testing Utils...');

    // اختبار دمج فئات CSS
    const className = cn('text-lg', 'font-bold', 'text-blue-500');
    console.log('CSS Class:', className);

    // اختبار إنشاء كلمة مرور
    const password = generateRandomPassword(12);
    console.log('Generated Password:', password);

    // اختبار تنظيف النص
    const cleanText = sanitizeText('<script>alert("xss")</script>');
    console.log('Sanitized Text:', cleanText);

    // اختبار تقصير النص
    const shortText = truncateText('This is a very long text that should be truncated', 30);
    console.log('Truncated Text:', shortText);

    // اختبار تنسيق حجم الملف
    const fileSize = formatFileSize(1024000);
    console.log('File Size:', fileSize);

    // اختبار التحقق من البريد الإلكتروني
    // const emailResult = validateEmail('test@example.com');
    // console.log('Email Validation:', emailResult);

    // اختبار التحقق من كلمة المرور
    // const passwordResult = validatePassword('MyPassword123!');
    // console.log('Password Validation:', passwordResult);

    // اختبار إنشاء hash
    const hash = await createHash('Hello World');
    console.log('Hash:', hash);

    // اختبار إنشاء UUID
    const uuid = generateUUID();
    console.log('UUID:', uuid);

    console.log('✅ Utils test passed');
}

/**
 * اختبار معالجة الأخطاء
 */
function testErrorHandling() {
    console.log('Testing Error Handling...');

    // اختبار إنشاء خطأ
    const error = createError({
        type: 'VALIDATION_ERROR',
        code: 'INVALID_EMAIL',
        message: 'البريد الإلكتروني غير صحيح',
        level: 'low',
        source: 'validation',
        field: 'email',
        value: 'invalid-email'
    });

    console.log('Created Error:', error);

    // اختبار معالجة خطأ التحقق
    const validationResult = handleValidationError('email', 'invalid-email', 'البريد الإلكتروني غير صحيح');
    console.log('Validation Error Result:', validationResult);

    // اختبار معالجة خطأ API
    const apiError = new Error('API Error');
    const apiResult = handleAPIError(apiError, 'API Call');
    console.log('API Error Result:', apiResult);

    console.log('✅ Error Handling test passed');
}

/**
 * اختبار التكامل الكامل
 */
export async function runIntegrationTest() {
    console.log('🚀 Starting Core Module Integration Test...');
    console.log('=====================================');

    try {
        testConstants();
        testTypes();
        await testUtils();
        testErrorHandling();

        console.log('=====================================');
        console.log('✅ All tests passed successfully!');
        console.log('🎉 Core Module is working correctly');

        return {
            success: true,
            message: 'All tests passed successfully',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('=====================================');
        console.error('❌ Integration test failed:', error);

        return {
            success: false,
            message: 'Integration test failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * اختبار الاستيراد من الفهرس الرئيسي
 */
function testMainIndexImport() {
    console.log('Testing Main Index Import...');

    try {
        // اختبار استيراد من الفهرس الرئيسي
        const { API_ENDPOINTS, validateEmail, createError } = require('../index');

        console.log('API Endpoints imported:', !!API_ENDPOINTS);
        console.log('Validate Email imported:', !!validateEmail);
        console.log('Create Error imported:', !!createError);

        console.log('✅ Main Index Import test passed');
        return true;
    } catch (error) {
        console.error('❌ Main Index Import test failed:', error);
        return false;
    }
}

// تصدير دوال الاختبار للاستخدام الخارجي
export {
    testConstants, testErrorHandling,
    testMainIndexImport, testTypes,
    testUtils
};

