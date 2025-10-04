/**
 * لوحة تحكم الأخطاء للمطورين
 * توفر رؤية شاملة عن الأخطاء وإحصائيات مفصلة
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedError, ErrorCategory, ErrorSeverity } from '@/core/types/error-types';
import { ErrorMonitoringService } from '@/core/utils/error-monitoring';
import {
    Activity,
    AlertTriangle,
    Download,
    RefreshCw,
    Shield,
    Trash2,
    TrendingUp,
    Wifi,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function ErrorDashboard() {
    const [metrics, setMetrics] = useState<any>(null);
    const [trends, setTrends] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [errorHistory, setErrorHistory] = useState<EnhancedError[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'hour' | 'day' | 'week' | 'month'>('day');

    const monitoringService = ErrorMonitoringService.getInstance();

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // تحديث كل 30 ثانية
        return () => clearInterval(interval);
    }, [selectedPeriod]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const stats = monitoringService.getDetailedStats();
            setMetrics(stats.metrics);
            setTrends(stats.trends);
            setAlerts(stats.alerts);
            setErrorHistory(stats.topErrors);
        } catch (error) {
            console.error('Failed to load error data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityColor = (severity: ErrorSeverity) => {
        switch (severity) {
            case 'low': return 'bg-blue-100 text-blue-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'critical': return 'bg-red-100 text-red-800';
        }
    };

    const getCategoryIcon = (category: ErrorCategory) => {
        switch (category) {
            case 'network': return <Wifi className="h-4 w-4" />;
            case 'authentication': return <Shield className="h-4 w-4" />;
            case 'ai_generation': return <Zap className="h-4 w-4" />;
            default: return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const exportData = () => {
        const data = monitoringService.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const cleanupData = () => {
        monitoringService.cleanup(7); // الاحتفاظ بآخر 7 أيام فقط
        loadData();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">جاري تحميل البيانات...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* العنوان والإجراءات */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">لوحة تحكم الأخطاء</h1>
                    <p className="text-muted-foreground">مراقبة شاملة للأخطاء وإحصائيات النظام</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={loadData} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        تحديث
                    </Button>
                    <Button onClick={exportData} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        تصدير
                    </Button>
                    <Button onClick={cleanupData} variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        تنظيف
                    </Button>
                </div>
            </div>

            {/* التنبيهات النشطة */}
            {alerts.filter(alert => alert.isActive && alert.lastTriggered).length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>تنبيهات نشطة</AlertTitle>
                    <AlertDescription>
                        {alerts.filter(alert => alert.isActive && alert.lastTriggered).length} تنبيه نشط
                    </AlertDescription>
                </Alert>
            )}

            {/* البطاقات الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الأخطاء</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalErrors || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            آخر 24 ساعة
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الأخطاء الحرجة</CardTitle>
                        <Shield className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {metrics?.errorsBySeverity?.critical || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            تتطلب انتباه فوري
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {metrics?.retrySuccessRate || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            إعادة المحاولة الناجحة
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الاستخدام الاحتياطي</CardTitle>
                        <Zap className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {metrics?.fallbackUsageRate || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            استخدام الحلول الاحتياطية
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* التبويبات */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
                    <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
                    <TabsTrigger value="history">التاريخ</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* الأخطاء حسب الفئة */}
                        <Card>
                            <CardHeader>
                                <CardTitle>الأخطاء حسب الفئة</CardTitle>
                                <CardDescription>توزيع الأخطاء حسب نوعها</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(metrics?.errorsByCategory || {}).map(([category, count]) => (
                                        <div key={category} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {getCategoryIcon(category as ErrorCategory)}
                                                <span className="text-sm font-medium">{category}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-muted-foreground">{count as number}</span>
                                                <Progress
                                                    value={(count as number) / (metrics?.totalErrors || 1) * 100}
                                                    className="w-20 h-2"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* الأخطاء حسب الشدة */}
                        <Card>
                            <CardHeader>
                                <CardTitle>الأخطاء حسب الشدة</CardTitle>
                                <CardDescription>توزيع الأخطاء حسب مستوى الخطورة</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(metrics?.errorsBySeverity || {}).map(([severity, count]) => (
                                        <div key={severity} className="flex items-center justify-between">
                                            <Badge className={getSeverityColor(severity as ErrorSeverity)}>
                                                {severity}
                                            </Badge>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-muted-foreground">{count as number}</span>
                                                <Progress
                                                    value={(count as number) / (metrics?.totalErrors || 1) * 100}
                                                    className="w-20 h-2"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="trends" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>اتجاهات الأخطاء</CardTitle>
                            <CardDescription>تطور الأخطاء عبر الوقت</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                                <p>مخطط الاتجاهات قيد التطوير</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>التنبيهات</CardTitle>
                            <CardDescription>إدارة تنبيهات الأخطاء</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                                                {alert.isActive ? 'نشط' : 'غير نشط'}
                                            </Badge>
                                            <div>
                                                <p className="font-medium">{alert.condition}</p>
                                                <p className="text-sm text-muted-foreground">{alert.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">
                                                {alert.count} مرة
                                            </span>
                                            {alert.lastTriggered && (
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(alert.lastTriggered).toLocaleString('ar-SA')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>الأخطاء الأكثر شيوعاً</CardTitle>
                            <CardDescription>قائمة بأكثر الأخطاء تكراراً</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {errorHistory.map((error, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Badge variant="outline">#{index + 1}</Badge>
                                            <div>
                                                <p className="font-medium">{error.code}</p>
                                                <p className="text-sm text-muted-foreground">{error.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getSeverityColor(error.severity)}>
                                                {error.severity}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {error.count} مرة
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
