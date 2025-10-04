/**
 * مكون Toast محسن لعرض الأخطاء مع تجربة مستخدم ممتازة
 * يوفر رسائل واضحة وإجراءات مفيدة للمستخدم
 */

import { EnhancedError, ErrorCategory, ErrorSeverity } from '@/core/types/error-types';
import { AlertTriangle, CheckCircle, Info, RefreshCw, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../button';
import { Card, CardContent } from '../card';
import { Progress } from '../progress';

interface ErrorToastProps {
    error: EnhancedError;
    onRetry?: () => void;
    onDismiss?: () => void;
    onFallback?: () => void;
    isRetrying?: boolean;
    retryProgress?: number;
    autoDismiss?: boolean;
    autoDismissDelay?: number;
    className?: string;
}

export function ErrorToast({
    error,
    onRetry,
    onDismiss,
    onFallback,
    isRetrying = false,
    retryProgress = 0,
    autoDismiss = true,
    autoDismissDelay = 5000,
    className
}: ErrorToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [dismissProgress, setDismissProgress] = useState(0);

    // إدارة الإغلاق التلقائي
    useEffect(() => {
        if (autoDismiss && error.severity !== 'critical') {
            const interval = setInterval(() => {
                setDismissProgress(prev => {
                    const newProgress = prev + (100 / (autoDismissDelay / 100));
                    if (newProgress >= 100) {
                        handleDismiss();
                        return 100;
                    }
                    return newProgress;
                });
            }, 100);

            return () => clearInterval(interval);
        }
    }, [autoDismiss, autoDismissDelay, error.severity]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => onDismiss?.(), 300);
    };

    const getErrorIcon = (category: ErrorCategory, severity: ErrorSeverity) => {
        if (severity === 'critical') {
            return <AlertTriangle className="h-5 w-5 text-red-500" />;
        }

        switch (category) {
            case 'network':
                return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            case 'ai_generation':
                return <Zap className="h-5 w-5 text-purple-500" />;
            case 'authentication':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getSeverityColor = (severity: ErrorSeverity) => {
        switch (severity) {
            case 'low': return 'border-l-blue-500 bg-blue-50';
            case 'medium': return 'border-l-yellow-500 bg-yellow-50';
            case 'high': return 'border-l-orange-500 bg-orange-50';
            case 'critical': return 'border-l-red-500 bg-red-50';
        }
    };

    const getSeverityTextColor = (severity: ErrorSeverity) => {
        switch (severity) {
            case 'low': return 'text-blue-800';
            case 'medium': return 'text-yellow-800';
            case 'high': return 'text-orange-800';
            case 'critical': return 'text-red-800';
        }
    };

    if (!isVisible) return null;

    return (
        <Card className={`border-l-4 ${getSeverityColor(error.severity)} shadow-lg animate-slide-in-right ${className}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-0.5">
                            {getErrorIcon(error.category, error.severity)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className={`font-medium ${getSeverityTextColor(error.severity)}`}>
                                {error.userMessage}
                            </h4>

                            <p className="text-sm text-gray-600 mt-1">
                                {error.userGuidance}
                            </p>

                            {/* إجراءات مقترحة */}
                            {error.suggestedActions.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">اقتراحات:</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        {error.suggestedActions.slice(0, 2).map((action, index) => (
                                            <li key={index} className="flex items-center space-x-1">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                                <span>{action}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* شريط التقدم لإعادة المحاولة */}
                            {isRetrying && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                        <span>جاري إعادة المحاولة...</span>
                                        <span>{Math.round(retryProgress)}%</span>
                                    </div>
                                    <Progress value={retryProgress} className="h-1" />
                                </div>
                            )}

                            {/* شريط التقدم للإغلاق التلقائي */}
                            {autoDismiss && error.severity !== 'critical' && (
                                <div className="mt-2">
                                    <Progress value={dismissProgress} className="h-1" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                        {/* أزرار الإجراءات */}
                        {error.isRetryable && onRetry && !isRetrying && (
                            <Button
                                onClick={onRetry}
                                size="sm"
                                variant="outline"
                                className="flex items-center space-x-1"
                            >
                                <RefreshCw className="h-3 w-3" />
                                <span>إعادة المحاولة</span>
                            </Button>
                        )}

                        {error.fallbackAvailable && onFallback && (
                            <Button
                                onClick={onFallback}
                                size="sm"
                                variant="outline"
                                className="flex items-center space-x-1"
                            >
                                <CheckCircle className="h-3 w-3" />
                                <span>حل بديل</span>
                            </Button>
                        )}

                        {/* زر الإغلاق */}
                        <Button
                            onClick={handleDismiss}
                            size="sm"
                            variant="ghost"
                            className="p-1 h-6 w-6"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// مكون مبسط للاستخدام السريع
interface SimpleErrorToastProps {
    message: string;
    type?: 'error' | 'warning' | 'info';
    onRetry?: () => void;
    onDismiss?: () => void;
    isRetrying?: boolean;
}

export function SimpleErrorToast({
    message,
    type = 'error',
    onRetry,
    onDismiss,
    isRetrying = false
}: SimpleErrorToastProps) {
    const getTypeColor = () => {
        switch (type) {
            case 'error': return 'border-l-red-500 bg-red-50 text-red-800';
            case 'warning': return 'border-l-yellow-500 bg-yellow-50 text-yellow-800';
            case 'info': return 'border-l-blue-500 bg-blue-50 text-blue-800';
        }
    };

    const getTypeIcon = () => {
        switch (type) {
            case 'error': return <AlertTriangle className="h-4 w-4" />;
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            case 'info': return <Info className="h-4 w-4" />;
        }
    };

    return (
        <Card className={`border-l-4 ${getTypeColor()} shadow-md animate-slide-in-right`}>
            <CardContent className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {getTypeIcon()}
                        <span className="text-sm font-medium">{message}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        {onRetry && (
                            <Button
                                onClick={onRetry}
                                size="sm"
                                variant="outline"
                                disabled={isRetrying}
                                className="h-6 px-2 text-xs"
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
                                className="h-6 w-6 p-0"
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
