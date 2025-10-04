/**
 * مكون Modal محسن لعرض الأخطاء التفصيلية
 * يوفر واجهة شاملة لفهم وحل المشاكل
 */

import { EnhancedError, ErrorCategory, ErrorSeverity } from '@/core/types/error-types';
import { AlertTriangle, Copy, Download, RefreshCw, Shield, Wifi, Zap } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../badge';
import { Button } from '../button';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../dialog';
import { Progress } from '../progress';
import { Separator } from '../separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

interface ErrorModalProps {
    error: EnhancedError;
    isOpen: boolean;
    onClose: () => void;
    onRetry?: () => void;
    onFallback?: () => void;
    isRetrying?: boolean;
    retryProgress?: number;
    showTechnicalDetails?: boolean;
}

export function ErrorModal({
    error,
    isOpen,
    onClose,
    onRetry,
    onFallback,
    isRetrying = false,
    retryProgress = 0,
    showTechnicalDetails = false
}: ErrorModalProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [copied, setCopied] = useState(false);

    const getErrorIcon = (category: ErrorCategory) => {
        switch (category) {
            case 'network':
                return <Wifi className="h-6 w-6 text-orange-500" />;
            case 'authentication':
                return <Shield className="h-6 w-6 text-red-500" />;
            case 'ai_generation':
                return <Zap className="h-6 w-6 text-purple-500" />;
            case 'file_upload':
                return <Download className="h-6 w-6 text-blue-500" />;
            default:
                return <AlertTriangle className="h-6 w-6 text-gray-500" />;
        }
    };

    const getSeverityColor = (severity: ErrorSeverity) => {
        switch (severity) {
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    const getCategoryLabel = (category: ErrorCategory) => {
        switch (category) {
            case 'network': return 'شبكة';
            case 'authentication': return 'مصادقة';
            case 'validation': return 'تحقق';
            case 'ai_generation': return 'ذكاء اصطناعي';
            case 'file_upload': return 'رفع ملف';
            case 'export': return 'تصدير';
            case 'database': return 'قاعدة بيانات';
            case 'permission': return 'صلاحيات';
            case 'rate_limit': return 'حد المعدل';
            case 'system': return 'نظام';
            case 'user_input': return 'إدخال مستخدم';
            case 'external_service': return 'خدمة خارجية';
        }
    };

    const copyErrorDetails = async () => {
        const errorDetails = {
            code: error.code,
            message: error.message,
            category: error.category,
            severity: error.severity,
            timestamp: error.timestamp,
            context: error.context
        };

        try {
            await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy error details:', err);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3">
                        {getErrorIcon(error.category)}
                        <span>تفاصيل الخطأ</span>
                    </DialogTitle>
                    <DialogDescription>
                        حدث خطأ أثناء تنفيذ العملية. يمكنك مراجعة التفاصيل أدناه.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* معلومات أساسية */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{error.userMessage}</CardTitle>
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
                        <CardContent>
                            <p className="text-sm text-gray-600">{error.userGuidance}</p>
                        </CardContent>
                    </Card>

                    {/* التبويبات */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                            <TabsTrigger value="actions">الإجراءات</TabsTrigger>
                            {showTechnicalDetails && (
                                <TabsTrigger value="technical">تفاصيل تقنية</TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">الإجراءات المقترحة</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {error.suggestedActions.map((action, index) => (
                                            <li key={index} className="flex items-start space-x-2">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                                <span className="text-sm">{action}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">معلومات إضافية</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">الوقت:</span>
                                        <span className="text-sm font-medium">
                                            {new Date(error.timestamp).toLocaleString('ar-SA')}
                                        </span>
                                    </div>
                                    {error.sessionId && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">معرف الجلسة:</span>
                                            <span className="text-sm font-medium font-mono">
                                                {error.sessionId.slice(0, 8)}...
                                            </span>
                                        </div>
                                    )}
                                    {error.requestId && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">معرف الطلب:</span>
                                            <span className="text-sm font-medium font-mono">
                                                {error.requestId.slice(0, 8)}...
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="actions" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">خيارات التعافي</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* إعادة المحاولة */}
                                    {error.isRetryable && onRetry && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">إعادة المحاولة</span>
                                                <Button
                                                    onClick={onRetry}
                                                    disabled={isRetrying}
                                                    size="sm"
                                                    className="flex items-center space-x-2"
                                                >
                                                    <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                                                    <span>{isRetrying ? 'جاري المحاولة...' : 'إعادة المحاولة'}</span>
                                                </Button>
                                            </div>

                                            {isRetrying && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-gray-600">
                                                        <span>التقدم:</span>
                                                        <span>{Math.round(retryProgress)}%</span>
                                                    </div>
                                                    <Progress value={retryProgress} className="h-2" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Separator />

                                    {/* الحل الاحتياطي */}
                                    {error.fallbackAvailable && onFallback && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">حل بديل</span>
                                                <Button
                                                    onClick={onFallback}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    استخدام الحل البديل
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                يمكننا تجربة طريقة أخرى لإنجاز المهمة
                                            </p>
                                        </div>
                                    )}

                                    <Separator />

                                    {/* إغلاق */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">إغلاق</span>
                                            <Button
                                                onClick={onClose}
                                                variant="outline"
                                                size="sm"
                                            >
                                                إغلاق
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            إغلاق هذا النافذة والاستمرار
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {showTechnicalDetails && (
                            <TabsContent value="technical" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">التفاصيل التقنية</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">رمز الخطأ:</span>
                                                <span className="text-sm font-medium font-mono">{error.code}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">الفئة:</span>
                                                <span className="text-sm font-medium">{error.category}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">الشدة:</span>
                                                <span className="text-sm font-medium">{error.severity}</span>
                                            </div>
                                        </div>

                                        {error.technicalDetails && (
                                            <div className="space-y-2">
                                                <span className="text-sm text-gray-600">التفاصيل التقنية:</span>
                                                <div className="bg-gray-100 p-3 rounded-md">
                                                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                                                        {error.technicalDetails}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}

                                        {error.context && Object.keys(error.context).length > 0 && (
                                            <div className="space-y-2">
                                                <span className="text-sm text-gray-600">السياق:</span>
                                                <div className="bg-gray-100 p-3 rounded-md">
                                                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                                                        {JSON.stringify(error.context, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end">
                                            <Button
                                                onClick={copyErrorDetails}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center space-x-2"
                                            >
                                                <Copy className="h-4 w-4" />
                                                <span>{copied ? 'تم النسخ!' : 'نسخ التفاصيل'}</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
