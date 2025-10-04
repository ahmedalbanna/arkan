/**
 * مكونات UI محسنة للتعافي من الأخطاء
 * توفر واجهات مستخدم واضحة ومفيدة عند حدوث الأخطاء
 */

import { EnhancedError, ErrorCategory, ErrorSeverity } from '@/core/types/error-types';
import { AlertTriangle, Download, FileText, RefreshCw, Shield, Wifi, WifiOff, Zap } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Progress } from './progress';

interface ErrorRecoveryProps {
    error: EnhancedError;
    onRetry?: () => void;
    onFallback?: () => void;
    onDismiss?: () => void;
    isRetrying?: boolean;
    retryProgress?: number;
    className?: string;
}

export function ErrorRecovery({
    error,
    onRetry,
    onFallback,
    onDismiss,
    isRetrying = false,
    retryProgress = 0,
    className
}: ErrorRecoveryProps) {
    const getErrorIcon = (category: ErrorCategory) => {
        switch (category) {
            case 'network':
                return <WifiOff className="h-5 w-5" />;
            case 'authentication':
                return <Shield className="h-5 w-5" />;
            case 'validation':
                return <FileText className="h-5 w-5" />;
            case 'ai_generation':
                return <Zap className="h-5 w-5" />;
            default:
                return <AlertTriangle className="h-5 w-5" />;
        }
    };

    const getSeverityColor = (severity: ErrorSeverity) => {
        switch (severity) {
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    const getCategoryLabel = (category: ErrorCategory) => {
        const labels = {
            network: 'شبكة',
            authentication: 'مصادقة',
            validation: 'تحقق',
            ai_generation: 'ذكاء اصطناعي',
            file_upload: 'رفع ملف',
            export: 'تصدير',
            database: 'قاعدة بيانات',
            permission: 'صلاحيات',
            rate_limit: 'حد المعدل',
            system: 'نظام',
            user_input: 'إدخال مستخدم',
            external_service: 'خدمة خارجية'
        };
        return labels[category] || 'غير محدد';
    };

    return (
        <Card className={`border-l-4 border-l-red-500 ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="text-red-500">
                            {getErrorIcon(error.category)}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{error.userMessage}</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                                {error.userGuidance}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(error.severity)}>
                            {error.severity}
                        </Badge>
                        <Badge variant="outline">
                            {getCategoryLabel(error.category)}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* إرشادات المستخدم */}
                {error.suggestedActions.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">الإجراءات المقترحة:</h4>
                        <ul className="space-y-1">
                            {error.suggestedActions.map((action, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-center">
                                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-2" />
                                    {action}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* شريط التقدم لإعادة المحاولة */}
                {isRetrying && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>جاري إعادة المحاولة...</span>
                            <span>{Math.round(retryProgress)}%</span>
                        </div>
                        <Progress value={retryProgress} className="h-2" />
                    </div>
                )}

                {/* أزرار الإجراءات */}
                <div className="flex items-center space-x-2 pt-2">
                    {error.isRetryable && onRetry && (
                        <Button
                            onClick={onRetry}
                            disabled={isRetrying}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                            <span>إعادة المحاولة</span>
                        </Button>
                    )}

                    {error.fallbackAvailable && onFallback && (
                        <Button
                            onClick={onFallback}
                            variant="secondary"
                            size="sm"
                            className="flex items-center space-x-2"
                        >
                            <Download className="h-4 w-4" />
                            <span>حل احتياطي</span>
                        </Button>
                    )}

                    {onDismiss && (
                        <Button
                            onClick={onDismiss}
                            variant="ghost"
                            size="sm"
                        >
                            إغلاق
                        </Button>
                    )}
                </div>

                {/* تفاصيل تقنية (قابلة للتوسيع) */}
                {error.technicalDetails && (
                    <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">
                            تفاصيل تقنية
                        </summary>
                        <div className="mt-2 p-2 bg-muted rounded-md font-mono">
                            {error.technicalDetails}
                        </div>
                    </details>
                )}
            </CardContent>
        </Card>
    );
}

// مكون للخطأ البسيط
interface SimpleErrorProps {
    message: string;
    onRetry?: () => void;
    isRetrying?: boolean;
    className?: string;
}

export function SimpleError({ message, onRetry, isRetrying, className }: SimpleErrorProps) {
    return (
        <div className={`flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
            <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-800">{message}</span>
            </div>

            {onRetry && (
                <Button
                    onClick={onRetry}
                    disabled={isRetrying}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>إعادة المحاولة</span>
                </Button>
            )}
        </div>
    );
}

// مكون لحالة الاتصال
interface ConnectionStatusProps {
    isOnline: boolean;
    onRetry?: () => void;
    className?: string;
}

export function ConnectionStatus({ isOnline, onRetry, className }: ConnectionStatusProps) {
    if (isOnline) {
        return (
            <div className={`flex items-center space-x-2 text-green-600 ${className}`}>
                <Wifi className="h-4 w-4" />
                <span className="text-sm">متصل بالإنترنت</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
            <div className="flex items-center space-x-2 text-yellow-800">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">غير متصل بالإنترنت</span>
            </div>

            {onRetry && (
                <Button
                    onClick={onRetry}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    <span>إعادة المحاولة</span>
                </Button>
            )}
        </div>
    );
}

// مكون لإشعار الخطأ المدمج
interface InlineErrorProps {
    error: EnhancedError;
    onRetry?: () => void;
    isRetrying?: boolean;
    className?: string;
}

export function InlineError({ error, onRetry, isRetrying, className }: InlineErrorProps) {
    return (
        <div className={`flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-red-800">{error.userMessage}</p>
                <p className="text-sm text-red-700">{error.userGuidance}</p>

                {error.isRetryable && onRetry && (
                    <Button
                        onClick={onRetry}
                        disabled={isRetrying}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                        <span>إعادة المحاولة</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
