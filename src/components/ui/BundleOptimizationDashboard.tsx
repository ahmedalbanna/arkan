/**
 * لوحة تحكم تحسين Bundle محسنة
 * يوفر واجهة شاملة لمراقبة وتحسين Bundle Size
 */

import {
    AlertCircle,
    BarChart3,
    CheckCircle,
    Clock,
    Package,
    Settings,
    TrendingUp,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BundleMetrics {
    totalSize: number;
    jsSize: number;
    cssSize: number;
    imageSize: number;
    fontSize: number;
    loadTime: number;
    renderTime: number;
    cacheHitRate: number;
}

interface OptimizationAction {
    id: string;
    name: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    status: 'completed' | 'in-progress' | 'pending';
    estimatedSavings: number;
}

/**
 * لوحة تحكم تحسين Bundle
 */
export const BundleOptimizationDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<BundleMetrics>({
        totalSize: 0,
        jsSize: 0,
        cssSize: 0,
        imageSize: 0,
        fontSize: 0,
        loadTime: 0,
        renderTime: 0,
        cacheHitRate: 0
    });

    const [optimizations, setOptimizations] = useState<OptimizationAction[]>([
        {
            id: '1',
            name: 'Code Splitting',
            description: 'تقسيم الكود إلى أجزاء أصغر',
            impact: 'high',
            status: 'completed',
            estimatedSavings: 30
        },
        {
            id: '2',
            name: 'Lazy Loading',
            description: 'تحميل المكونات عند الحاجة',
            impact: 'high',
            status: 'completed',
            estimatedSavings: 25
        },
        {
            id: '3',
            name: 'Tree Shaking',
            description: 'إزالة الكود غير المستخدم',
            impact: 'medium',
            status: 'in-progress',
            estimatedSavings: 15
        },
        {
            id: '4',
            name: 'Image Optimization',
            description: 'تحسين الصور وتنسيقاتها',
            impact: 'medium',
            status: 'pending',
            estimatedSavings: 20
        },
        {
            id: '5',
            name: 'Bundle Compression',
            description: 'ضغط الملفات',
            impact: 'high',
            status: 'pending',
            estimatedSavings: 40
        }
    ]);

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        analyzeBundle();
    }, []);

    const analyzeBundle = async () => {
        setIsAnalyzing(true);

        try {
            // محاكاة تحليل Bundle
            const mockMetrics: BundleMetrics = {
                totalSize: 2.5 * 1024 * 1024, // 2.5MB
                jsSize: 1.8 * 1024 * 1024, // 1.8MB
                cssSize: 200 * 1024, // 200KB
                imageSize: 300 * 1024, // 300KB
                fontSize: 200 * 1024, // 200KB
                loadTime: 1200, // 1.2s
                renderTime: 300, // 300ms
                cacheHitRate: 85 // 85%
            };

            setMetrics(mockMetrics);
        } catch (error) {
            console.error('خطأ في تحليل Bundle:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTime = (ms: number) => {
        return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-500 bg-red-50';
            case 'medium': return 'text-yellow-500 bg-yellow-50';
            case 'low': return 'text-green-500 bg-green-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'pending': return <AlertCircle className="h-4 w-4 text-gray-500" />;
            default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const totalSavings = optimizations
        .filter(opt => opt.status === 'completed')
        .reduce((sum, opt) => sum + opt.estimatedSavings, 0);

    if (isAnalyzing) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <BarChart3 className="h-8 w-8 animate-pulse mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">جاري تحليل Bundle...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* العنوان والأزرار */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">لوحة تحكم تحسين Bundle</h1>
                    <p className="text-muted-foreground">مراقبة وتحسين أداء التطبيق</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={analyzeBundle}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        إعادة التحليل
                    </button>
                    <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90">
                        <Settings className="h-4 w-4 mr-2" />
                        الإعدادات
                    </button>
                </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                        <Package className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">الحجم الإجمالي</span>
                    </div>
                    <p className="text-2xl font-bold">{formatBytes(metrics.totalSize)}</p>
                </div>

                <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">وقت التحميل</span>
                    </div>
                    <p className="text-2xl font-bold">{formatTime(metrics.loadTime)}</p>
                </div>

                <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">التحسينات المطبقة</span>
                    </div>
                    <p className="text-2xl font-bold">{totalSavings}%</p>
                </div>

                <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                        <Zap className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium">معدل التخزين المؤقت</span>
                    </div>
                    <p className="text-2xl font-bold">{metrics.cacheHitRate}%</p>
                </div>
            </div>

            {/* تفاصيل الحجم */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">توزيع الحجم</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">JavaScript</span>
                            <span className="text-sm font-mono">{formatBytes(metrics.jsSize)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">CSS</span>
                            <span className="text-sm font-mono">{formatBytes(metrics.cssSize)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">الصور</span>
                            <span className="text-sm font-mono">{formatBytes(metrics.imageSize)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">الخطوط</span>
                            <span className="text-sm font-mono">{formatBytes(metrics.fontSize)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">أداء التحميل</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">وقت التحميل الأولي</span>
                            <span className="text-sm font-mono">{formatTime(metrics.loadTime)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">وقت العرض</span>
                            <span className="text-sm font-mono">{formatTime(metrics.renderTime)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">معدل التخزين المؤقت</span>
                            <span className="text-sm font-mono">{metrics.cacheHitRate}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* قائمة التحسينات */}
            <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">التحسينات المتاحة</h3>
                <div className="space-y-4">
                    {optimizations.map((optimization) => (
                        <div key={optimization.id} className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                            <div className="flex-shrink-0 mt-1">
                                {getStatusIcon(optimization.status)}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium">{optimization.name}</h4>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(optimization.impact)}`}>
                                        {optimization.impact}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-500">
                                        -{optimization.estimatedSavings}%
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{optimization.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BundleOptimizationDashboard;
