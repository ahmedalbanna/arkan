/**
 * لوحة التحليل المتقدم للسياق مع دعم المحتوى متعدد الوسائط
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AdvancedContextAnalysisService } from '@/services/advanced-context-analysis-service';
import {
    AlertCircle,
    Brain,
    CheckCircle,
    Eye,
    FileCode,
    FileText,
    ImageIcon,
    Link,
    Search,
    Table,
    Target
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface AdvancedContextAnalysisPanelProps {
    contextFiles: Array<{
        fileName: string;
        content: string;
        type: string;
    }>;
    reportSections?: Record<string, string>;
    onAnalysisResult?: (analysis: any) => void;
    onRecommendationsGenerated?: (recommendations: any) => void;
    className?: string;
}

interface ContextAnalysisSummary {
    totalItems: number;
    mediaTypeDistribution: Record<string, number>;
    averageQuality: number;
    keyTopics: string[];
    mainEntities: string[];
    sentimentDistribution: Record<string, number>;
}

export function AdvancedContextAnalysisPanel({
    contextFiles,
    reportSections = {},
    onAnalysisResult,
    onRecommendationsGenerated,
    className
}: AdvancedContextAnalysisPanelProps) {

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [advancedContextItems, setAdvancedContextItems] = useState<any[]>([]);
    const [analysisSummary, setAnalysisSummary] = useState<ContextAnalysisSummary | null>(null);

    // البحث الدلالي
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // المراجع المتقاطعة
    const [crossReferences, setCrossReferences] = useState<any>(null);
    const [crossReferencesAnalyzed, setCrossReferencesAnalyzed] = useState(false);

    // التوصيات المتقدمة
    const [advancedRecommendations, setAdvancedRecommendations] = useState<any>(null);

    // تحليل السياق المتقدم عند تغيير الملفات
    useEffect(() => {
        if (contextFiles && contextFiles.length > 0) {
            analyzeAdvancedContext();
        }
    }, [contextFiles]);

    // تحليل السياق المتقدم
    const analyzeAdvancedContext = useCallback(async () => {
        if (!contextFiles || contextFiles.length === 0) return;

        setIsAnalyzing(true);
        setAnalysisComplete(false);

        try {
            console.log('🔍 بدء التحليل المتقدم للسياق...');

            // التحليل المتقدم للمحتوى متعدد الوسائط
            const analyzedItems = await AdvancedContextAnalysisService.analyzeMultimodalContext(contextFiles);

            setAdvancedContextItems(analyzedItems);

            // إنشاء ملخص التحليل
            const summary = createAnalysisSummary(analyzedItems);
            setAnalysisSummary(summary);

            onAnalysisResult?.(analyzedItems);

            // تحليل المراجع المتقاطعة إذا كان هناك أقسام
            if (Object.keys(reportSections).length > 0) {
                await analyzeCrossReferences(analyzedItems);
            }

            // توليد التوصيات المتقدمة
            await generateAdvancedRecommendations(analyzedItems);

            setAnalysisComplete(true);
            console.log('✅ تم التحليل المتقدم بنجاح');

        } catch (error) {
            console.error('خطأ في التحليل المتقدم:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [contextFiles, reportSections, onAnalysisResult]);

    // البحث الدلالي المتقدم
    const performSemanticSearch = useCallback(async () => {
        if (!searchQuery.trim() || advancedContextItems.length === 0) return;

        setIsSearching(true);
        try {
            const results = await AdvancedContextAnalysisService.semanticSearch(
                searchQuery,
                advancedContextItems,
                {
                    minRelevance: 0.4,
                    maxResults: 10,
                    contextRelevance: true
                }
            );

            setSearchResults(results);
            console.log(`🔎 تم العثور على ${results.length} نتيجة`);

        } catch (error) {
            console.error('خطأ في البحث الدلالي:', error);
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, advancedContextItems]);

    // تحليل المراجع المتقاطعة
    const analyzeCrossReferences = async (items: any[]) => {
        try {
            const crossRefs = await AdvancedContextAnalysisService.detectCrossReferences(
                reportSections,
                items
            );
            setCrossReferences(crossRefs);
            setCrossReferencesAnalyzed(true);
        } catch (error) {
            console.error('خطأ في تحليل المراجع المتقاطعة:', error);
        }
    };

    // توليد التوصيات المتقدمة
    const generateAdvancedRecommendations = async (items: any[]) => {
        try {
            const recommendations = await AdvancedContextAnalysisService.generateAdvancedRecommendations(
                items,
                reportSections
            );
            setAdvancedRecommendations(recommendations);
            onRecommendationsGenerated?.(recommendations);
        } catch (error) {
            console.error('خطأ في توليد التوصيات:', error);
        }
    };

    // إنشاء ملخص التحليل
    const createAnalysisSummary = (items: any[]): ContextAnalysisSummary => {
        const mediaTypeDistribution: Record<string, number> = {};
        let totalQuality = 0;
        const allTopics = new Set<string>();
        const allEntities = new Set<string>();
        const sentimentDistribution: Record<string, number> = {};

        items.forEach(item => {
            // توزيع أنواع الوسائط
            mediaTypeDistribution[item.type] = (mediaTypeDistribution[item.type] || 0) + 1;

            // جودة المحتوى
            totalQuality += item.metadata.quality;

            // المواضيع والكيانات
            item.semanticAnalysis.topics.forEach((topic: string) => allTopics.add(topic));
            item.semanticAnalysis.entities.forEach((entity: any) =>
                allEntities.add(entity.text));

            // توزيع المشاعر
            const sentiment = item.semanticAnalysis.sentiment;
            sentimentDistribution[sentiment] = (sentimentDistribution[sentiment] || 0) + 1;
        });

        return {
            totalItems: items.length,
            mediaTypeDistribution,
            averageQuality: totalQuality / items.length,
            keyTopics: Array.from(allTopics).slice(0, 10),
            mainEntities: Array.from(allEntities).slice(0, 15),
            sentimentDistribution
        };
    };

    // الحصول على أيقونة نوع الوسائط
    const getMediaTypeIcon = (type: string) => {
        switch (type) {
            case 'image': return <ImageIcon className="h-4 w-4" />;
            case 'table': return <Table className="h-4 w-4" />;
            case 'code': return <FileCode className="h-4 w-4" />;
            case 'pdf': return <FileText className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    // الحصول على لون المشاعر
    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900';
            case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900';
            case 'neutral': return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
        }
    };

    if (!contextFiles || contextFiles.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    لا توجد ملفات سياق متاحة للتحليل المتقدم. رفع ملفات لتشغيل التحليل الشامل.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* حالة التحليل */}
            {isAnalyzing && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div>
                                <div className="font-medium">التحليل المتقدم للسياق في التقدم...</div>
                                <div className="text-sm text-muted-foreground">
                                    جاري تحليل المحتوى متعدد الوسائط والعلاقات الدلالية
                                </div>
                            </div>
                        </div>
                        <Progress value={Math.random() * 80 + 20} className="mt-3 h-2" />
                    </CardContent>
                </Card>
            )}

            {/* ملخص التحليل */}
            {analysisSummary && analysisComplete && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                            <CheckCircle className="h-5 w-5" />
                            ملخص التحليل المتقدم
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* إحصائيات أساسية */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="text-lg font-semibold text-blue-600">
                                    {analysisSummary.totalItems}
                                </div>
                                <div className="text-xs text-muted-foreground">إجمالي العناصر</div>
                            </div>
                            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="text-lg font-semibold text-green-600">
                                    {analysisSummary.averageQuality.toFixed(0)}
                                </div>
                                <div className="text-xs text-muted-foreground">متوسط الجودة</div>
                            </div>
                            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="text-lg font-semibold text-purple-600">
                                    {analysisSummary.keyTopics.length}
                                </div>
                                <div className="text-xs text-muted-foreground">المواضيع الرئيسية</div>
                            </div>
                            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="text-lg font-semibold text-orange-600">
                                    {analysisSummary.mainEntities.length}
                                </div>
                                <div className="text-xs text-muted-foreground">الكيانات المذكورة</div>
                            </div>
                        </div>

                        {/* توزيع أنواع الوسائط */}
                        <div>
                            <div className="text-sm font-medium mb-2">أنواع الوسائط</div>
                            <div className="flex gap-2 flex-wrap">
                                {Object.entries(analysisSummary.mediaTypeDistribution).map(([type, count]) => (
                                    <Badge key={type} variant="outline" className="flex items-center gap-1">
                                        {getMediaTypeIcon(type)}
                                        {type}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* المواضيع الرئيسية */}
                        <div>
                            <div className="text-sm font-medium mb-2">المواضيع الرئيسية</div>
                            <div className="flex gap-1 flex-wrap">
                                {analysisSummary.keyTopics.map(topic => (
                                    <Badge key={topic} variant="default" className="text-xs">
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* البحث الدلالي */}
            {analysisComplete && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            البحث الدلالي المتقدم
                        </CardTitle>
                        <CardDescription>
                            ابحث في المحتوى باستخدام الذكاء الاصطناعي لفهم المعنى والسياق
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="ابحث في المحتوى عن مواضيع أو مفاهيم معينة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && performSemanticSearch()}
                            />
                            <Button
                                onClick={performSemanticSearch}
                                disabled={isSearching || !searchQuery.trim()}
                                className="flex items-center gap-2"
                            >
                                {isSearching ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                                بحث
                            </Button>
                        </div>

                        {/* نتائج البحث */}
                        {searchResults.length > 0 && (
                            <div className="space-y-3">
                                <div className="text-sm font-medium">
                                    نتائج البحث ({searchResults.length})
                                </div>
                                {searchResults.map((result, index) => (
                                    <Card key={index} className="border-blue-200">
                                        <CardContent className="p-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    {getMediaTypeIcon(result.item.type)}
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {result.item.fileName}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            نوع: {result.item.type} | صلة: {(result.relevanceScore * 100).toFixed(0)}%
                                                        </div>
                                                        <div className="text-xs mt-1">
                                                            {result.explanation}
                                                        </div>
                                                        {result.matchedTerms.length > 0 && (
                                                            <div className="flex gap-1 mt-2">
                                                                {result.matchedTerms.map(term => (
                                                                    <Badge key={term} variant="secondary" className="text-xs">
                                                                        {term}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* المراجع المتقاطعة */}
            {crossReferences && crossReferencesAnalyzed && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Link className="h-5 w-5" />
                            تحليل المراجع المتقاطعة
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {crossReferences.sections.length > 0 && (
                            <div>
                                <div className="text-sm font-medium mb-3">مراجع الأقسام</div>
                                <div className="space-y-2">
                                    {crossReferences.sections.map((section: any, index: number) => (
                                        <div key={index} className="flex items-center gap-3 p-2 border rounded">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{section.sectionName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {section.references.length} مرجع
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {crossReferences.circularReferences.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    <div className="text-sm font-medium">مراجع دائرية (قد تحتاج انتباه)</div>
                                </div>
                                {crossReferences.circularReferences.map((ref: any, index: number) => (
                                    <div key={index} className="text-xs p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                                        {ref.description} - {ref.suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* التوصيات المتقدمة */}
            {advancedRecommendations && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            التوصيات الذكية المتقدمة
                        </CardTitle>
                        <CardDescription>
                            اقتراحات مبنية على تحليل شامل للمحتوى والعلاقات
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* اقتراحات المحتوى */}
                        {advancedRecommendations.contentSuggestions.length > 0 && (
                            <div>
                                <div className="text-sm font-medium mb-2">اقتراحات محتوى</div>
                                <div className="space-y-2">
                                    {advancedRecommendations.contentSuggestions.slice(0, 5).map((suggestion: any, index: number) => (
                                        <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                                            <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                                            <div>
                                                <div className="text-sm font-medium">{suggestion.suggestion}</div>
                                                <div className="text-xs text-muted-foreground">{suggestion.reasoning}</div>
                                                <Badge variant="outline" className="text-xs mt-1">
                                                    أولوية: {suggestion.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* المحتوى المفقود */}
                        {advancedRecommendations.missingContent.length > 0 && (
                            <div>
                                <div className="text-sm font-medium mb-2">المحتوى المفقود</div>
                                <div className="space-y-2">
                                    {advancedRecommendations.missingContent.map((missing: any, index: number) => (
                                        <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-950 rounded">
                                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                                            <div>
                                                <div className="text-sm font-medium">{missing.topic}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    مفقود في: {missing.suggestedLocation}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    مصادر متاحة: {missing.availableSources.join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
