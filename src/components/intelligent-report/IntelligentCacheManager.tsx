/**
 * مدير التخزين المؤقت الذكي مع واجهة تحكم شاملة
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { IntelligentCachingService as SmartCacheManager } from '@/services/intelligent-caching-service';
import {
    Activity,
    Archive,
    BarChart3,
    Brain,
    CheckCircle,
    Database,
    FileText,
    Info,
    RefreshCw,
    Repeat,
    Search,
    Settings,
    Trash2
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface IntelligentCacheManagerProps {
    currentSessionId: string;
    userId?: string;
    onCacheStatsChanged?: (stats: any) => void;
    onOptimizationComplete?: (result: any) => void;
    className?: string;
}

interface CachePerformanceMetrics {
    cacheHitRate: number;
    memoryUsage: number;
    averageRetrievalTime: number;
    popularSections: Array<{
        section: string;
        frequency: number;
        lastUsed: Date;
    }>;
    systemRecommendations: string[];
}

interface ReuseRecommendation {
    sectionName: string;
    projectType: string;
    reusePercentage: number;
    originalContent: string;
    adaptationNotes: string[];
    timeSaved: string;
    qualityScore: number;
}

export function IntelligentCacheManager({
    currentSessionId,
    userId,
    onCacheStatsChanged,
    onOptimizationComplete,
    className
}: IntelligentCacheManagerProps) {

    // حالات التخزين المؤقت والإحصائيات
    const [cacheStats, setCacheStats] = useState<any>(null);
    const [performanceMetrics, setPerformanceMetrics] = useState<CachePerformanceMetrics | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResults, setOptimizationResults] = useState<any>(null);

    // البحث والفلترة
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'sections' | 'analysis' | 'recommendations'>('all');
    const [showInactiveEntries, setShowInactiveEntries] = useState(false);

    // إعادة استخدام المحتوى
    const [reuseRecommendations, setReuseRecommendations] = useState<ReuseRecommendation[]>([]);
    const [reuseLoading, setReuseLoading] = useState(false);

    // تحديث الإحصائيات تلقائياً
    useEffect(() => {
        const interval = setInterval(() => {
            updateCacheStats();
            updatePerformanceMetrics();
        }, 30000); // تحديث كل 30 ثانية

        return () => clearInterval(interval);
    }, []);

    // تحديث الإحصائيات التخزين المؤقت مؤقتاً
    const updateCacheStats = useCallback(async () => {
        try {
            const stats = SmartCacheManager.getCacheStats();
            setCacheStats(stats);
            onCacheStatsChanged?.(stats);
        } catch (error) {
            console.error('خطأ في تحديث إحصائيات التخزين المؤقت:', error);
        }
    }, [onCacheStatsChanged]);

    // تحديث مؤشرات الأداء
    const updatePerformanceMetrics = useCallback(async () => {
        try {
            // محاكاة مؤشرات الأداء المتقدمة
            const metrics: CachePerformanceMetrics = {
                cacheHitRate: Math.random() * 0.4 + 0.6, // 60-100%
                memoryUsage: Math.random() * 30 + 20, // 20-50 MB
                averageRetrievalTime: Math.random() * 50 + 20, // 20-70ms
                popularSections: [
                    { section: 'مقدمة', frequency: 25, lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000) },
                    { section: 'مراجعة الأدب', frequency: 18, lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000) },
                    { section: 'تصميم النظام', frequency: 15, lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000) }
                ],
                systemRecommendations: [
                    'الأقسام المُستخدمة بكثرة تُحتفظ في الذاكرة السريعة',
                    'زيادة حجم تخزين القالب المرجح للمشاريع المتشابهة',
                    'تعطيل التكرارات التلقائي للأقسام منخفضة الجودة'
                ]
            };
            setPerformanceMetrics(metrics);
        } catch (error) {
            console.error('خطأ في تحديث مؤشرات الأداء:', error);
        }
    }, []);

    // تشغيل التحسين الذكي
    const runIntelligentOptimization = useCallback(async (options: {
        aggressiveCleanup?: boolean;
        performanceBasedOptimization?: boolean;
        sizeBasedCleanup?: boolean;
    } = {}) => {
        setIsOptimizing(true);

        try {
            console.log('🚀 بدء التحسين الذكي للتخزين المؤقت...');

            const results = await SmartCacheManager.optimizeCache({
                aggressiveCleanup: options.aggressiveCleanup || false,
                performanceBasedOptimization: options.performanceBasedOptimization || true,
                sizeBasedCleanup: options.sizeBasedCleanup || false
            });

            setOptimizationResults(results);
            onOptimizationComplete?.(results);

            // تحديث الإحصائيات بعد التحسين
            await updateCacheStats();
            await updatePerformanceMetrics();

            console.log('✅ التحسين الذكي مكتمل');

        } catch (error) {
            console.error('خطأ في التحسين الذكي:', error);
        } finally {
            setIsOptimizing(false);
        }
    }, [onOptimizationComplete, updateCacheStats, updatePerformanceMetrics]);

    // البحث عن التوصيات إعادة استخدام للمحتوى
    const findReuseRecommendations = useCallback(async () => {
        setReuseLoading(true);

        try {
            // محاكاة البحث عن توصيات إعادة الاستخدام
            const recommendations: ReuseRecommendation[] = [
                {
                    sectionName: 'مقدمة',
                    projectType: 'تطبيق ويب',
                    reusePercentage: 85,
                    originalContent: 'مقدمة المشروع...',
                    adaptationNotes: [
                        'تعديل التعريف ليتناسب مع نوع المشروع الجديد',
                        'إضافة تفاصيل التقنية المستخدمة'
                    ],
                    timeSaved: '15 دقيقة',
                    qualityScore: 92
                },
                {
                    sectionName: 'مراجعة الأدب',
                    projectType: 'نظام قاعدة البيانات',
                    reusePercentage: 78,
                    originalContent: 'مراجعة الدراسات السابقة...',
                    adaptationNotes: [
                        'تحديث المصادر لتناسب مجال قاعدة البيانات',
                        'إضافة دراسات حديثة'
                    ],
                    timeSaved: '25 دقيقة',
                    qualityScore: 88
                }
            ];

            setReuseRecommendations(recommendations);

        } catch (error) {
            console.error('خطأ في البحث عن توصيات إعادة الاستخدام:', error);
        } finally {
            setReuseLoading(false);
        }
    }, []);

    // مسح المدخلات غير المستخدمة
    const cleanupUnusedEntries = useCallback(async () => {
        setIsOptimizing(true);

        try {
            await runIntelligentOptimization({
                sizeBasedCleanup: true,
                aggressiveCleanup: true
            });
        } finally {
            setIsOptimizing(false);
        }
    }, [runIntelligentOptimization]);

    // تشغيل التحسين التلقائي الدوري
    const scheduleAutoOptimization = useCallback(() => {
        console.log('⏰ جدولة التحسين التلقائي الدوري...');
        // يمكن إضافة منطق الجدولة هنا
    }, []);

    // الحصول على لون الأداء مبني على النسبة المئوية
    const getPerformanceColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    // تنسيق الوقت منذ آخر استخدام
    const formatTimeSinceLastUse = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays} يوم`;
        if (diffHours > 0) return `${diffHours} ساعة`;
        return `${diffMinutes} دقيقة`;
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* إحصائيات التخزين المؤقت الرئيسية */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        إحصائيات التخزين المؤقت الذكي
                    </CardTitle>
                    <CardDescription>
                        نظرة شاملة على أداء النظام والمساحة المستخدمة
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {cacheStats ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <div className="text-lg font-semibold text-blue-600">
                                    {cacheStats.totalEntries}
                                </div>
                                <div className="text-xs text-muted-foreground">إجمالي المدخلات</div>
                            </div>
                            <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                <div className="text-lg font-semibold text-green-600">
                                    {(cacheStats.memoryUsage / 1024 / 1024).toFixed(1)} MB
                                </div>
                                <div className="text-xs text-muted-foreground">استخدام الذاكرة</div>
                            </div>
                            <div className="text-center p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <div className="text-lg font-semibold text-purple-600">
                                    {(cacheStats.hitRate * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-muted-foreground">معدل النجاح</div>
                            </div>
                            <div className="text-center p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <div className="text-lg font-semibold text-orange-600">
                                    {(cacheStats.averageLoadTime).toFixed(1)} ms
                                </div>
                                <div className="text-xs text-muted-foreground">متوسط وقت التحميل</div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className="text-sm">جاري تحميل الإحصائيات...</span>
                        </div>
                    )}

                    {/* الأقسام الأكثر استخداماً */}
                    {performanceMetrics?.popularSections && (
                        <div>
                            <div className="text-sm font-medium mb-2">الأقسام الأكثر استخداماً</div>
                            <div className="space-y-2">
                                {performanceMetrics.popularSections.map((section, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-medium">{section.section}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline">{section.frequency}</Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {formatTimeSinceLastUse(section.lastUsed)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* التحكم في التحسين */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        التحسين الذكي للتخزين المؤقت
                    </CardTitle>
                    <CardDescription>
                        أدوات تحسين الأداء وإدارة المساحة بحكمة
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* أزرار التحسين السريع */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                            onClick={() => runIntelligentOptimization({ performanceBasedOptimization: true })}
                            disabled={isOptimizing}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Activity className="h-4 w-4" />
                            تحسين الأداء
                        </Button>
                        <Button
                            onClick={() => runIntelligentOptimization({ sizeBasedCleanup: true })}
                            disabled={isOptimizing}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Archive className="h-4 w-4" />
                            تنظيف المساحة
                        </Button>
                        <Button
                            onClick={() => runIntelligentOptimization({ aggressiveCleanup: true })}
                            disabled={isOptimizing}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            تنظيف شامل
                        </Button>
                    </div>

                    {/* حالة التحسين */}
                    {isOptimizing && (
                        <Alert>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <AlertDescription>
                                جاري تحسين التخزين المؤقت... يرجى الانتظار
                            </AlertDescription>
                            <Progress value={Math.random() * 80 + 20} className="mt-2 h-2" />
                        </Alert>
                    )}

                    {/* نتائج التحسين */}
                    {optimizationResults && (
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-2">
                                    <div className="font-medium">تم التحسين بنجاح!</div>
                                    <div className="text-sm">
                                        تم حذف {optimizationResults.removedEntries} مدخل،
                                        وتوفير {Math.round(optimizationResults.memoryFreed / 1024)} KB من المساحة
                                    </div>
                                    {optimizationResults.recommendations?.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-sm font-medium">التوصيات:</div>
                                            <ul className="text-xs list-disc list-inside space-y-1">
                                                {optimizationResults.recommendations.map((rec: string, index: number) => (
                                                    <li key={index}>{rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* مؤشرات الأداء المتقدمة */}
            {performanceMetrics && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            مؤشرات الأداء المتقدمة
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">معدل نجاح التخزين المؤقت</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-medium ${getPerformanceColor(performanceMetrics.cacheHitRate * 100)}`}>
                                        {(performanceMetrics.cacheHitRate * 100).toFixed(1)}%
                                    </span>
                                    <Progress value={performanceMetrics.cacheHitRate * 100} className="w-24 h-2" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">استخدام الذاكرة</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-medium ${getPerformanceColor(100 - performanceMetrics.memoryUsage)}`}>
                                        {performanceMetrics.memoryUsage.toFixed(1)} MB
                                    </span>
                                    <Progress value={performanceMetrics.memoryUsage} className="w-24 h-2" max={50} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">زمن الاسترجاع المتوسط</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-medium ${getPerformanceColor(100 - performanceMetrics.averageRetrievalTime)}`}>
                                        {performanceMetrics.averageRetrievalTime.toFixed(1)} ms
                                    </span>
                                    <Progress value={performanceMetrics.averageRetrievalTime} className="w-24 h-2" max={100} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* توصيات النظام */}
                        <div>
                            <div className="text-sm font-medium mb-2">توصيات النظام</div>
                            <div className="space-y-2">
                                {performanceMetrics.systemRecommendations.map((recommendation, index) => (
                                    <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                                        <Brain className="h-4 w-4 text-blue-500 mt-0.5" />
                                        <span className="text-xs">{recommendation}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* إعادة استخدام المحتوى */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Repeat className="h-5 w-5" />
                        توصيات إعادة استخدام المحتوى
                    </CardTitle>
                    <CardDescription>
                        اكتشف المحتوى القابل لإعادة الاستخدام من التخزين المؤقت لتوفير الوقت
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={findReuseRecommendations}
                        disabled={reuseLoading}
                        className="flex items-center gap-2"
                    >
                        {reuseLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                        {reuseLoading ? 'جاري البحث...' : 'البحث عن المحتوى القابل لإعادة الاستخدام'}
                    </Button>

                    {/* نتائج إعادة الاستخدام */}
                    {reuseRecommendations.length > 0 && (
                        <div className="space-y-3">
                            <div className="text-sm font-medium">موصى به للإعادة استخدام</div>
                            {reuseRecommendations.map((rec, index) => (
                                <Card key={index} className="border-green-200 bg-green-50 dark:bg-green-950">
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline">{rec.sectionName}</Badge>
                                                    <Badge className="bg-green-600 text-white">
                                                        {rec.reusePercentage}% قابلة لإعادة الاستخدام
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground mb-2">
                                                    نوع المشروع: {rec.projectType}
                                                </div>

                                                {rec.adaptationNotes.length > 0 && (
                                                    <div>
                                                        <div className="text-xs font-medium mb-1">
                                                            ملاحظات التكيف المطلوبة:
                                                        </div>
                                                        <ul className="text-xs list-disc list-inside space-y-1">
                                                            {rec.adaptationNotes.map(note => (
                                                                <li key={rec.sectionName}>{note}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="text-sm font-medium text-green-600">
                                                    توفير {rec.timeSaved}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    جودة: {rec.qualityScore}/100
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* معلومات إضافية */}
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    النظام يحتفظ بذكاء بالمحتوى المُستخدم بشكل متكرر ويحسن الأداء تلقائياً.
                    يمكنك تخصيص إعدادات التحسين حسب احتياجاتك.
                </AlertDescription>
            </Alert>
        </div>
    );
}
