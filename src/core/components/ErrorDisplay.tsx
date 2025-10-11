/**
 * مكونات واجهة المستخدم لمعالجة الأخطاء
 * توفر واجهات مستخدم جميلة ومفيدة للأخطاء المختلفة
 */

import { EnhancedError } from '../types/error-types';

interface ErrorDisplayProps {
    error: EnhancedError;
    onRetry?: () => void;
    onReport?: () => void;
    onDismiss?: () => void;
    showDetails?: boolean;
    variant?: 'inline' | 'modal' | 'banner' | 'toast';
}

export function ErrorDisplay({
    error,
    onRetry,
    onReport,
    onDismiss,
    showDetails = false,
    variant = 'inline'
}: ErrorDisplayProps) {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 border-red-500 text-red-800';
            case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
            case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
            case 'low': return 'bg-blue-100 border-blue-500 text-blue-800';
            default: return 'bg-gray-100 border-gray-500 text-gray-800';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return '🚨';
            case 'high': return '⚠️';
            case 'medium': return '⚠️';
            case 'low': return 'ℹ️';
            default: return '❌';
        }
    };

    const baseClasses = `border-l-4 p-4 rounded-r-lg ${getSeverityColor(error.severity)}`;

    if (variant === 'toast') {
        return (
            <div className={`fixed top-4 right-4 z-50 max-w-sm ${baseClasses} shadow-lg`}>
                <div className="flex items-start">
                    <span className="text-xl mr-2">{getSeverityIcon(error.severity)}</span>
                    <div className="flex-1">
                        <h4 className="font-semibold">{error.userMessage}</h4>
                        <p className="text-sm mt-1">{error.userGuidance}</p>
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="text-sm underline mt-2 hover:no-underline"
                            >
                                إغلاق
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'banner') {
        return (
            <div className={`w-full ${baseClasses}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-xl mr-3">{getSeverityIcon(error.severity)}</span>
                        <div>
                            <h4 className="font-semibold">{error.userMessage}</h4>
                            <p className="text-sm mt-1">{error.userGuidance}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {onRetry && error.isRetryable && (
                            <button
                                onClick={onRetry}
                                className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-50"
                            >
                                إعادة المحاولة
                            </button>
                        )}
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-50"
                            >
                                إغلاق
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'modal') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className={`max-w-md w-full mx-4 ${baseClasses} shadow-xl`}>
                    <div className="flex items-start">
                        <span className="text-3xl mr-3">{getSeverityIcon(error.severity)}</span>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{error.userMessage}</h3>
                            <p className="text-sm mb-4">{error.userGuidance}</p>

                            {error.suggestedActions && error.suggestedActions.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium mb-2">الإجراءات المقترحة:</h4>
                                    <ul className="text-sm list-disc list-inside">
                                        {error.suggestedActions.map((action, index) => (
                                            <li key={index}>{action}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {showDetails && (
                                <details className="mb-4">
                                    <summary className="text-sm cursor-pointer hover:underline">
                                        تفاصيل تقنية
                                    </summary>
                                    <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                                        {error.technicalDetails}
                                    </pre>
                                </details>
                            )}

                            <div className="flex gap-2 justify-end">
                                {onRetry && error.isRetryable && (
                                    <button
                                        onClick={onRetry}
                                        className="px-4 py-2 bg-white rounded hover:bg-gray-50"
                                    >
                                        إعادة المحاولة
                                    </button>
                                )}
                                {onReport && (
                                    <button
                                        onClick={onReport}
                                        className="px-4 py-2 bg-white rounded hover:bg-gray-50"
                                    >
                                        الإبلاغ
                                    </button>
                                )}
                                {onDismiss && (
                                    <button
                                        onClick={onDismiss}
                                        className="px-4 py-2 bg-white rounded hover:bg-gray-50"
                                    >
                                        إغلاق
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // variant === 'inline'
    return (
        <div className={baseClasses}>
            <div className="flex items-start">
                <span className="text-xl mr-3">{getSeverityIcon(error.severity)}</span>
                <div className="flex-1">
                    <h4 className="font-semibold">{error.userMessage}</h4>
                    <p className="text-sm mt-1">{error.userGuidance}</p>

                    {error.suggestedActions && error.suggestedActions.length > 0 && (
                        <div className="mt-3">
                            <h5 className="text-sm font-medium mb-1">الإجراءات المقترحة:</h5>
                            <ul className="text-sm list-disc list-inside">
                                {error.suggestedActions.map((action, index) => (
                                    <li key={index}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {showDetails && (
                        <details className="mt-3">
                            <summary className="text-sm cursor-pointer hover:underline">
                                تفاصيل تقنية
                            </summary>
                            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                                {error.technicalDetails}
                            </pre>
                        </details>
                    )}

                    <div className="flex gap-2 mt-3">
                        {onRetry && error.isRetryable && (
                            <button
                                onClick={onRetry}
                                className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-50"
                            >
                                إعادة المحاولة
                            </button>
                        )}
                        {onReport && (
                            <button
                                onClick={onReport}
                                className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-50"
                            >
                                الإبلاغ
                            </button>
                        )}
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-50"
                            >
                                إغلاق
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// مكون لمعالجة أخطاء الشبكة
export function NetworkErrorDisplay({ error, onRetry }: { error: EnhancedError; onRetry?: () => void }) {
    return (
        <ErrorDisplay
            error={error}
            onRetry={onRetry}
            variant="banner"
            showDetails={false}
        />
    );
}

// مكون لمعالجة أخطاء التحقق من الصحة
export function ValidationErrorDisplay({ error, onDismiss }: { error: EnhancedError; onDismiss?: () => void }) {
    return (
        <ErrorDisplay
            error={error}
            onDismiss={onDismiss}
            variant="inline"
            showDetails={false}
        />
    );
}

// مكون لمعالجة الأخطاء الحرجة
export function CriticalErrorDisplay({ error, onRetry, onReport }: {
    error: EnhancedError;
    onRetry?: () => void;
    onReport?: () => void;
}) {
    return (
        <ErrorDisplay
            error={error}
            onRetry={onRetry}
            onReport={onReport}
            variant="modal"
            showDetails={true}
        />
    );
}

// مكون لمعالجة أخطاء التحميل
export function LoadingErrorDisplay({ error, onRetry }: { error: EnhancedError; onRetry?: () => void }) {
    return (
        <div className="text-center py-8">
            <div className="text-6xl mb-4">😞</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{error.userMessage}</h3>
            <p className="text-gray-600 mb-4">{error.userGuidance}</p>
            {onRetry && error.isRetryable && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    المحاولة مرة أخرى
                </button>
            )}
        </div>
    );
}

export default ErrorDisplay;
