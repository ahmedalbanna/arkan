/**
 * مكون تحليل Bundle محسن
 * يوفر تحليل شامل لحجم الحزمة
 */

import { AlertTriangle, BarChart3, Package, TrendingDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BundleAnalysis {
    totalSize: number;
    jsSize: number;
    cssSize: number;
    imageSize: number;
    fontSize: number;
    largestChunks: Array<{
        name: string;
        size: number;
        percentage: number;
    }>;
    recommendations: string[];
}

interface BundleAnalyzerProps {
    onAnalysisComplete?: (analysis: BundleAnalysis) => void;
}

/**
 * مكون تحليل Bundle
 */
export const BundleAnalyzer: React.FC<BundleAnalyzerProps> = ({
    onAnalysisComplete
}) => {
    const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyzeBundle = async () => {
        setIsAnalyzing(true);

        try {
            // محاكاة تحليل Bundle
            const mockAnalysis: BundleAnalysis = {
                totalSize: 2.5 * 1024 * 1024, // 2.5MB
                jsSize: 1.8 * 1024 * 1024, // 1.8MB
                cssSize: 200 * 1024, // 200KB
                imageSize: 300 * 1024, // 300KB
                fontSize: 200 * 1024, // 200KB
                largestChunks: [
                    { name: 'vendor.js', size: 800 * 1024, percentage: 32 },
                    { name: 'app.js', size: 600 * 1024, percentage: 24 },
                    { name: 'components.js', size: 400 * 1024, percentage: 16 },
                    { name: 'utils.js', size: 200 * 1024, percentage: 8 },
                    { name: 'styles.css', size: 200 * 1024, percentage: 8 }
                ],
                recommendations: [
                    'استخدم Code Splitting للمكونات الثقيلة',
                    'حسن استيرادات المكتبات الخارجية',
                    'استخدم Lazy Loading للصور',
                    'فعل ضغط Gzip/Brotli',
                    'احذف الكود غير المستخدم'
                ]
            };

            setAnalysis(mockAnalysis);
            onAnalysisComplete?.(mockAnalysis);
        } catch (error) {
            console.error('خطأ في تحليل Bundle:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        analyzeBundle();
    }, []);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

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

    if (!analysis) {
        return (
            <div className="text-center p-8">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="text-sm text-muted-foreground">فشل في تحليل Bundle</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ملخص الحجم */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                        <Package className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">الحجم الإجمالي</span>
                    </div>
                    <p className="text-2xl font-bold">{formatBytes(analysis.totalSize)}</p>
                </div>

                <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">JavaScript</span>
                    </div>
                    <p className="text-2xl font-bold">{formatBytes(analysis.jsSize)}</p>
                </div>

                <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                        <TrendingDown className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">CSS</span>
                    </div>
                    <p className="text-2xl font-bold">{formatBytes(analysis.cssSize)}</p>
                </div>

                <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                        <Package className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium">الصور</span>
                    </div>
                    <p className="text-2xl font-bold">{formatBytes(analysis.imageSize)}</p>
                </div>
            </div>

            {/* أكبر الأجزاء */}
            <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">أكبر أجزاء Bundle</h3>
                <div className="space-y-3">
                    {analysis.largestChunks.map((chunk, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-sm font-medium">{chunk.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">{chunk.percentage}%</span>
                                <span className="text-sm font-mono">{formatBytes(chunk.size)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* التوصيات */}
            <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">توصيات التحسين</h3>
                <div className="space-y-2">
                    {analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                            <span className="text-sm">{recommendation}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BundleAnalyzer;
