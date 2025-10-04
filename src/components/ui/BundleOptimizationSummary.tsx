/**
 * ملخص تحسين Bundle محسن
 * يوفر نظرة شاملة على تحسينات Bundle Size
 */

import { AlertCircle, CheckCircle, Clock, Package, TrendingUp, Zap } from 'lucide-react';
import React from 'react';

interface OptimizationResult {
    beforeSize: number;
    afterSize: number;
    improvement: number;
    optimizations: Array<{
        name: string;
        description: string;
        impact: 'high' | 'medium' | 'low';
        status: 'completed' | 'in-progress' | 'pending';
    }>;
}

interface BundleOptimizationSummaryProps {
    results: OptimizationResult;
}

/**
 * مكون ملخص تحسين Bundle
 */
export const BundleOptimizationSummary: React.FC<BundleOptimizationSummaryProps> = ({
    results
}) => {
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-green-500';
            default: return 'text-gray-500';
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

    return (
        <div className="space-y-6">
            {/* ملخص التحسين */}
            <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">ملخص تحسين Bundle Size</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Package className="h-8 w-8 text-blue-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">الحجم قبل التحسين</p>
                        <p className="text-2xl font-bold">{formatBytes(results.beforeSize)}</p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">الحجم بعد التحسين</p>
                        <p className="text-2xl font-bold">{formatBytes(results.afterSize)}</p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Zap className="h-8 w-8 text-purple-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">نسبة التحسين</p>
                        <p className="text-2xl font-bold text-green-500">{results.improvement.toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            {/* تفاصيل التحسينات */}
            <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">تفاصيل التحسينات</h3>

                <div className="space-y-4">
                    {results.optimizations.map((optimization, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                            <div className="flex-shrink-0 mt-1">
                                {getStatusIcon(optimization.status)}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium">{optimization.name}</h4>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(optimization.impact)} bg-muted`}>
                                        {optimization.impact}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{optimization.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* إحصائيات إضافية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">التحسينات المطبقة</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Code Splitting</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Lazy Loading</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Tree Shaking</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Image Optimization</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Bundle Compression</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">النتائج المتوقعة</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">تحسين وقت التحميل</span>
                            <span className="text-sm font-medium text-green-500">+{results.improvement.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">تقليل استهلاك البيانات</span>
                            <span className="text-sm font-medium text-green-500">+{results.improvement.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">تحسين تجربة المستخدم</span>
                            <span className="text-sm font-medium text-green-500">+{results.improvement.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">تحسين SEO</span>
                            <span className="text-sm font-medium text-green-500">+{results.improvement.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BundleOptimizationSummary;
