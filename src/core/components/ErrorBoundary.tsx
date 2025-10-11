/**
 * Error Boundary للمكونات الحرجة
 * يوفر معالجة شاملة للأخطاء مع استراتيجيات التعافي الذكية
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorCategory, ErrorSeverity } from '../types/error-types';
import { EnhancedErrorHandler } from '../utils/enhanced-error-handler';
import { ErrorMonitoringService } from '../utils/error-monitoring';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    operationId?: string;
    enableRecovery?: boolean;
    enableReporting?: boolean;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
    recoveryAttempts: number;
    isRecovering: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private errorMonitoringService: ErrorMonitoringService;
    private maxRecoveryAttempts = 3;
    private recoveryTimeout: NodeJS.Timeout | null = null;

    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.state = {
            hasError: false,
            recoveryAttempts: 0,
            isRecovering: false
        };

        this.errorMonitoringService = ErrorMonitoringService.getInstance();
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const { onError, category = 'ai_generation', severity = 'medium', operationId = 'error-boundary' } = this.props;

        // تسجيل الخطأ
        this.logError(error, errorInfo, category, severity, operationId);

        // استدعاء callback إذا كان موجوداً
        if (onError) {
            onError(error, errorInfo);
        }

        // تحديث الحالة
        this.setState({
            error,
            errorInfo
        });
    }

    private async logError(
        error: Error,
        errorInfo: ErrorInfo,
        category: ErrorCategory,
        severity: ErrorSeverity,
        operationId: string
    ) {
        try {
            // استخدام معالجة الأخطاء المحسنة
            const errorResult = await EnhancedErrorHandler.handleWithRetry(
                async () => {
                    // إنشاء خطأ محسن
                    const enhancedError = {
                        code: 'COMPONENT_ERROR' as keyof typeof import('../types/error-types').ERROR_MESSAGES,
                        message: error.message,
                        category,
                        severity,
                        userMessage: 'حدث خطأ في المكون. يرجى المحاولة مرة أخرى.',
                        userGuidance: 'يمكنك إعادة تحميل الصفحة أو المحاولة مرة أخرى.',
                        suggestedActions: ['إعادة تحميل الصفحة', 'المحاولة مرة أخرى', 'التواصل مع الدعم'],
                        technicalDetails: `${error.message}\n\nStack Trace:\n${error.stack}\n\nComponent Stack:\n${errorInfo.componentStack}`,
                        isRetryable: true,
                        retryAfter: 5,
                        fallbackAvailable: true,
                        timestamp: new Date().toISOString(),
                        context: {
                            componentStack: errorInfo.componentStack,
                            operationId,
                            errorBoundary: true
                        }
                    };

                    // تسجيل في خدمة المراقبة
                    this.errorMonitoringService.recordError(enhancedError);

                    return enhancedError;
                },
                {
                    operationId: `${operationId}-error-logging`,
                    category: 'ai_generation',
                    severity: 'low'
                }
            );

            if (!errorResult.success) {
                console.error('Failed to log error in ErrorBoundary:', errorResult.error);
            }
        } catch (loggingError) {
            console.error('Error in ErrorBoundary logging:', loggingError);
        }
    }

    private handleRecovery = async () => {
        const { enableRecovery = true } = this.props;

        if (!enableRecovery || this.state.recoveryAttempts >= this.maxRecoveryAttempts) {
            return;
        }

        this.setState({ isRecovering: true });

        try {
            // محاولة التعافي
            const recoveryResult = await EnhancedErrorHandler.handleWithRetry(
                async () => {
                    // محاكاة عملية التعافي
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // إعادة تعيين الحالة
                    this.setState({
                        hasError: false,
                        error: undefined,
                        errorInfo: undefined,
                        recoveryAttempts: this.state.recoveryAttempts + 1,
                        isRecovering: false
                    });
                },
                {
                    operationId: 'error-boundary-recovery',
                    category: 'ai_generation',
                    severity: 'medium'
                }
            );

            if (!recoveryResult.success) {
                this.setState({ isRecovering: false });
            }
        } catch (recoveryError) {
            console.error('Recovery failed:', recoveryError);
            this.setState({ isRecovering: false });
        }
    };

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            recoveryAttempts: 0,
            isRecovering: false
        });
    };

    private handleReportError = () => {
        const { error, errorInfo } = this.state;

        if (error && errorInfo) {
            // إرسال تقرير الخطأ
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'error_boundary_report', {
                    error_message: error.message,
                    error_stack: error.stack,
                    component_stack: errorInfo.componentStack,
                    recovery_attempts: this.state.recoveryAttempts
                });
            }
        }
    };

    componentWillUnmount() {
        if (this.recoveryTimeout) {
            clearTimeout(this.recoveryTimeout);
        }
    }

    render() {
        const { hasError, error, isRecovering } = this.state;
        const { children, fallback, enableRecovery = true, enableReporting = true } = this.props;

        if (hasError) {
            // استخدام fallback مخصص إذا كان موجوداً
            if (fallback) {
                return fallback;
            }

            // عرض واجهة خطأ افتراضية
            return (
                <div className="error-boundary-container p-6 max-w-md mx-auto mt-8 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-center">
                        <div className="text-red-600 text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-red-800 mb-2">
                            حدث خطأ في المكون
                        </h2>
                        <p className="text-red-600 mb-4">
                            نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى أو إعادة تحميل الصفحة.
                        </p>

                        {enableReporting && (
                            <div className="mb-4">
                                <button
                                    onClick={this.handleReportError}
                                    className="text-sm text-red-500 hover:text-red-700 underline"
                                >
                                    الإبلاغ عن هذا الخطأ
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2 justify-center">
                            {enableRecovery && this.state.recoveryAttempts < this.maxRecoveryAttempts && (
                                <button
                                    onClick={this.handleRecovery}
                                    disabled={isRecovering}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isRecovering ? 'جاري المحاولة...' : 'المحاولة مرة أخرى'}
                                </button>
                            )}

                            <button
                                onClick={this.handleReset}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                إعادة تعيين
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-600">
                                    تفاصيل الخطأ (للمطورين)
                                </summary>
                                <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-auto">
                                    {error.message}
                                    {'\n\n'}
                                    {error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return children;
    }
}

// Hook لاستخدام Error Boundary في المكونات الوظيفية
export function useErrorBoundary() {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = React.useCallback(() => {
        setError(null);
    }, []);

    const captureError = React.useCallback((error: Error) => {
        setError(error);
    }, []);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return { captureError, resetError };
}

// HOC لتفعيل Error Boundary على مكون
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}

export default ErrorBoundary;
