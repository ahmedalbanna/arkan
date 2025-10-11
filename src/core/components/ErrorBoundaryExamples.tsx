/**
 * أمثلة على استخدام Error Boundaries في المكونات المختلفة
 * توضح كيفية تطبيق معالجة الأخطاء في سيناريوهات مختلفة
 */

import { useState } from 'react';
import { useErrorHandler, useNetworkErrorHandler, useValidationErrorHandler } from '../hooks/use-error-handler';
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
import { ErrorDisplay, NetworkErrorDisplay, ValidationErrorDisplay } from './ErrorDisplay';

// مثال 1: مكون مع Error Boundary مباشر
export function ExampleComponentWithErrorBoundary() {
    const [shouldThrow, setShouldThrow] = useState(false);

    if (shouldThrow) {
        throw new Error('مثال على خطأ في المكون');
    }

    return (
        <div className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">مثال على Error Boundary</h3>
            <p className="mb-4">هذا المكون محمي بـ Error Boundary</p>
            <button
                onClick={() => setShouldThrow(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                إلقاء خطأ للاختبار
            </button>
        </div>
    );
}

// مثال 2: مكون مع useErrorHandler
export function ExampleComponentWithErrorHandler() {
    const { error, handleError, clearError, retry, isRetrying } = useErrorHandler({
        category: 'ai_generation',
        severity: 'medium',
        operationId: 'example-component',
        enableRetry: true,
        maxRetries: 3
    });

    const simulateError = async () => {
        try {
            // محاكاة عملية قد تفشل
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (Math.random() < 0.5) {
                        reject(new Error('فشلت العملية عشوائياً'));
                    } else {
                        resolve('نجحت العملية');
                    }
                }, 1000);
            });
        } catch (err) {
            await handleError(err, { operation: 'simulate-error' });
        }
    };

    return (
        <div className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">مثال على useErrorHandler</h3>

            {error && (
                <ErrorDisplay
                    error={error}
                    onRetry={retry}
                    onDismiss={clearError}
                    variant="inline"
                />
            )}

            <div className="mt-4 space-x-2">
                <button
                    onClick={simulateError}
                    disabled={isRetrying}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isRetrying ? 'جاري المحاولة...' : 'محاكاة خطأ'}
                </button>

                {error && (
                    <button
                        onClick={clearError}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        مسح الخطأ
                    </button>
                )}
            </div>
        </div>
    );
}

// مثال 3: مكون مع معالجة أخطاء الشبكة
export function ExampleNetworkComponent() {
    const { error, handleNetworkError, retry, isRetrying } = useNetworkErrorHandler();
    const [data, setData] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            // محاكاة طلب شبكة قد يفشل
            const response = await fetch('/api/simulate-network-error');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const result = await response.text();
            setData(result);
        } catch (err) {
            await handleNetworkError(err);
        }
    };

    return (
        <div className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">مثال على معالجة أخطاء الشبكة</h3>

            {error && (
                <NetworkErrorDisplay
                    error={error}
                    onRetry={retry}
                />
            )}

            {data && (
                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
                    <p className="text-green-800">تم جلب البيانات بنجاح: {data}</p>
                </div>
            )}

            <div className="mt-4">
                <button
                    onClick={fetchData}
                    disabled={isRetrying}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {isRetrying ? 'جاري الجلب...' : 'جلب البيانات'}
                </button>
            </div>
        </div>
    );
}

// مثال 4: مكون مع معالجة أخطاء التحقق من الصحة
export function ExampleValidationComponent() {
    const { error, handleValidationError, clearError } = useValidationErrorHandler();
    const [email, setEmail] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const validateEmail = async () => {
        setIsValidating(true);

        try {
            // محاكاة التحقق من صحة البريد الإلكتروني
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (!email.includes('@')) {
                        reject(new Error('البريد الإلكتروني غير صحيح'));
                    } else {
                        resolve(true);
                    }
                }, 500);
            });

            clearError();
        } catch (err) {
            await handleValidationError(err, 'email');
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">مثال على معالجة أخطاء التحقق من الصحة</h3>

            {error && (
                <ValidationErrorDisplay
                    error={error}
                    onDismiss={clearError}
                />
            )}

            <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                    البريد الإلكتروني:
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل بريدك الإلكتروني"
                />
            </div>

            <div className="mt-4">
                <button
                    onClick={validateEmail}
                    disabled={isValidating || !email}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                    {isValidating ? 'جاري التحقق...' : 'التحقق من الصحة'}
                </button>
            </div>
        </div>
    );
}

// مثال 5: مكون مع HOC
const ExampleComponentWithHOC = withErrorBoundary(
    function ExampleComponent() {
        const [shouldThrow, setShouldThrow] = useState(false);

        if (shouldThrow) {
            throw new Error('خطأ في المكون المحمي بـ HOC');
        }

        return (
            <div className="p-4 border rounded">
                <h3 className="text-lg font-semibold mb-2">مكون محمي بـ HOC</h3>
                <p className="mb-4">هذا المكون محمي بـ withErrorBoundary</p>
                <button
                    onClick={() => setShouldThrow(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    إلقاء خطأ للاختبار
                </button>
            </div>
        );
    },
    {
        category: 'ai_generation',
        severity: 'medium',
        operationId: 'example-hoc',
        enableRecovery: true,
        enableReporting: true
    }
);

// مثال 6: مكون مع Error Boundary مخصص
export function ExampleCustomErrorBoundary() {
    return (
        <ErrorBoundary
            category="ai_generation"
            severity="high"
            operationId="custom-error-boundary"
            enableRecovery={true}
            enableReporting={true}
            onError={(error, errorInfo) => {
                console.log('Custom error handler:', error, errorInfo);
            }}
            fallback={
                <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">
                        خطأ مخصص في المكون
                    </h2>
                    <p className="text-red-600">
                        تم التعامل مع هذا الخطأ باستخدام fallback مخصص
                    </p>
                </div>
            }
        >
            <ExampleComponentWithErrorBoundary />
        </ErrorBoundary>
    );
}

// مثال 7: مكون مع معالجة أخطاء متعددة المستويات
export function ExampleMultiLevelErrorHandling() {
    const [level, setLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

    const getErrorHandler = () => {
        switch (level) {
            case 'critical':
                return useErrorHandler({
                    category: 'ai_generation',
                    severity: 'critical',
                    operationId: 'critical-error',
                    enableRetry: false,
                    enableReporting: true
                });
            case 'high':
                return useErrorHandler({
                    category: 'ai_generation',
                    severity: 'high',
                    operationId: 'high-error',
                    enableRetry: true,
                    maxRetries: 2,
                    enableReporting: true
                });
            case 'medium':
                return useErrorHandler({
                    category: 'ai_generation',
                    severity: 'medium',
                    operationId: 'medium-error',
                    enableRetry: true,
                    maxRetries: 3,
                    enableReporting: false
                });
            default:
                return useErrorHandler({
                    category: 'ai_generation',
                    severity: 'low',
                    operationId: 'low-error',
                    enableRetry: true,
                    maxRetries: 5,
                    enableReporting: false
                });
        }
    };

    const { error, handleError, clearError, retry } = getErrorHandler();

    const simulateError = async () => {
        const errorMessage = `خطأ ${level} المستوى`;
        await handleError(new Error(errorMessage), { level });
    };

    return (
        <div className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">معالجة أخطاء متعددة المستويات</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    مستوى الخطأ:
                </label>
                <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="low">منخفض</option>
                    <option value="medium">متوسط</option>
                    <option value="high">عالي</option>
                    <option value="critical">حرج</option>
                </select>
            </div>

            {error && (
                <ErrorDisplay
                    error={error}
                    onRetry={retry}
                    onDismiss={clearError}
                    variant="inline"
                    showDetails={level === 'critical' || level === 'high'}
                />
            )}

            <div className="mt-4">
                <button
                    onClick={simulateError}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                    محاكاة خطأ {level} المستوى
                </button>
            </div>
        </div>
    );
}

// مكون رئيسي يجمع جميع الأمثلة
export function ErrorBoundaryExamples() {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-center mb-8">
                أمثلة على Error Boundaries
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExampleComponentWithErrorBoundary />
                <ExampleComponentWithErrorHandler />
                <ExampleNetworkComponent />
                <ExampleValidationComponent />
                <ExampleCustomErrorBoundary />
                <ExampleMultiLevelErrorHandling />
            </div>

            <div className="mt-8">
                <ExampleComponentWithHOC />
            </div>
        </div>
    );
}

export default ErrorBoundaryExamples;
