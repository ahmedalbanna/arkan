/**
 * مكون Banner لعرض الأخطاء المهمة في أعلى الصفحة
 * مناسب للأخطاء التي تحتاج انتباه فوري
 */

import { EnhancedError, ErrorCategory, ErrorSeverity } from '@/core/types/error-types';
import { AlertTriangle, CheckCircle, Info, RefreshCw, X } from 'lucide-react';
import { Button } from '../button';
import { Card, CardContent } from '../card';

interface ErrorBannerProps {
    error: EnhancedError;
    onRetry?: () => void;
    onDismiss?: () => void;
    onFallback?: () => void;
    isRetrying?: boolean;
    className?: string;
}

export function ErrorBanner({
    error,
    onRetry,
    onDismiss,
    onFallback,
    isRetrying = false,
    className
}: ErrorBannerProps) {
    const getSeverityStyles = (severity: ErrorSeverity) => {
        switch (severity) {
            case 'low':
                return {
                    container: 'bg-blue-50 border-blue-200 text-blue-800',
                    icon: 'text-blue-500',
                    button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                };
            case 'medium':
                return {
                    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                    icon: 'text-yellow-500',
                    button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                };
            case 'high':
                return {
                    container: 'bg-orange-50 border-orange-200 text-orange-800',
                    icon: 'text-orange-500',
                    button: 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                };
            case 'critical':
                return {
                    container: 'bg-red-50 border-red-200 text-red-800',
                    icon: 'text-red-500',
                    button: 'bg-red-100 hover:bg-red-200 text-red-800'
                };
        }
    };

    const getErrorIcon = (category: ErrorCategory, severity: ErrorSeverity) => {
        if (severity === 'critical') {
            return <AlertTriangle className="h-5 w-5" />;
        }

        switch (category) {
            case 'network':
                return <AlertTriangle className="h-5 w-5" />;
            case 'ai_generation':
                return <AlertTriangle className="h-5 w-5" />;
            case 'authentication':
                return <AlertTriangle className="h-5 w-5" />;
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    const styles = getSeverityStyles(error.severity);

    return (
        <Card className={`border-l-4 ${styles.container} shadow-sm ${className}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 ${styles.icon}`}>
                            {getErrorIcon(error.category, error.severity)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm">
                                {error.userMessage}
                            </h3>
                            <p className="text-xs mt-1 opacity-90">
                                {error.userGuidance}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                        {/* أزرار الإجراءات */}
                        {error.isRetryable && onRetry && (
                            <Button
                                onClick={onRetry}
                                disabled={isRetrying}
                                size="sm"
                                variant="outline"
                                className={`${styles.button} border-0 h-7 px-3 text-xs`}
                            >
                                {isRetrying ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                    'إعادة المحاولة'
                                )}
                            </Button>
                        )}

                        {error.fallbackAvailable && onFallback && (
                            <Button
                                onClick={onFallback}
                                size="sm"
                                variant="outline"
                                className={`${styles.button} border-0 h-7 px-3 text-xs`}
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                حل بديل
                            </Button>
                        )}

                        {/* زر الإغلاق */}
                        {onDismiss && (
                            <Button
                                onClick={onDismiss}
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 hover:bg-black/10"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// مكون مبسط للاستخدام السريع
interface SimpleErrorBannerProps {
    message: string;
    type?: 'error' | 'warning' | 'info';
    onRetry?: () => void;
    onDismiss?: () => void;
    isRetrying?: boolean;
    className?: string;
}

export function SimpleErrorBanner({
    message,
    type = 'error',
    onRetry,
    onDismiss,
    isRetrying = false,
    className
}: SimpleErrorBannerProps) {
    const getTypeStyles = () => {
        switch (type) {
            case 'error':
                return {
                    container: 'bg-red-50 border-red-200 text-red-800',
                    icon: 'text-red-500',
                    button: 'bg-red-100 hover:bg-red-200 text-red-800'
                };
            case 'warning':
                return {
                    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                    icon: 'text-yellow-500',
                    button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                };
            case 'info':
                return {
                    container: 'bg-blue-50 border-blue-200 text-blue-800',
                    icon: 'text-blue-500',
                    button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <Card className={`border-l-4 ${styles.container} shadow-sm ${className}`}>
            <CardContent className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className={`flex-shrink-0 ${styles.icon}`}>
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{message}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        {onRetry && (
                            <Button
                                onClick={onRetry}
                                disabled={isRetrying}
                                size="sm"
                                variant="outline"
                                className={`${styles.button} border-0 h-6 px-2 text-xs`}
                            >
                                {isRetrying ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                    'إعادة المحاولة'
                                )}
                            </Button>
                        )}

                        {onDismiss && (
                            <Button
                                onClick={onDismiss}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-black/10"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
