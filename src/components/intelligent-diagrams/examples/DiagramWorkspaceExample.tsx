/**
 * مثال شامل لمساحة عمل المخططات الذكية
 * يوضح كيفية استخدام جميع مكونات المخططات معاً
 */

'use client';

import {
    DiagramGenerator,
    DiagramLibrary,
    type DiagramResult
} from '@/components/intelligent-diagrams';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    useDiagramStats,
    type SavedDiagram
} from '@/hooks/use-intelligent-diagrams';
import { toast } from '@/hooks/use-toast';
import {
    Info,
    Library,
    Palette,
    Plus,
    Sparkles,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import { useState } from 'react';

// بيانات وهمية للمشروع
const mockProjectData = {
    title: "نظام إدارة المكتبة الذكي",
    description: "نظام شامل لإدارة المكتبات الرقمية مع ميزات الذكاء الاصطناعي",
    requirements: [
        "إدارة الكتب والمؤلفين",
        "نظام الاستعارة والإرجاع",
        "البحث الذكي في المحتوى",
        "تتبع المستخدمين والإحصائيات",
        "نظام التوصيات الذكي",
        "إدارة المخزون والتقارير"
    ],
    stakeholders: [
        "أمناء المكتبات",
        "القراء والمستخدمين",
        "الإدارة العليا",
        "فريق تطوير النظام",
        "مسؤولو تقنية المعلومات"
    ],
    technologies: [
        "React.js",
        "Node.js",
        "PostgreSQL",
        "Redis",
        "Docker",
        "AWS",
        "TensorFlow",
        "Elasticsearch"
    ]
};

const mockSectionContent = `
# تحليل النظام

## نظرة عامة
نظام إدارة المكتبة الذكي هو حل شامل يهدف إلى رقمنة وتحسين عمليات المكتبة التقليدية.

## المتطلبات الوظيفية
1. إدارة فهرس الكتب
2. نظام الاستعارة الإلكتروني
3. البحث المتقدم والتصفية
4. تتبع المستخدمين والإحصائيات
5. نظام التوصيات المبني على الذكاء الاصطناعي

## المتطلبات غير الوظيفية
- الأداء: استجابة أقل من 2 ثانية
- الأمان: تشفير البيانات الحساسة
- التوفر: 99.9% uptime
- قابلية التوسع: دعم 10,000 مستخدم متزامن
`;

export function DiagramWorkspaceExample() {
    const [activeTab, setActiveTab] = useState<'generator' | 'library' | 'stats'>('generator');
    const [selectedDiagram, setSelectedDiagram] = useState<SavedDiagram | null>(null);
    const [recentDiagrams, setRecentDiagrams] = useState<DiagramResult[]>([]);

    const stats = useDiagramStats();

    // معالجة توليد مخطط جديد
    const handleDiagramGenerated = (result: DiagramResult) => {
        setRecentDiagrams(prev => [result, ...prev.slice(0, 4)]);
        toast({
            title: "تم التوليد بنجاح! 🎉",
            description: `تم إنشاء مخطط "${result.title}" بجودة ${result.metadata.qualityScore}/100`,
        });
    };

    // معالجة اختيار مخطط من المكتبة
    const handleSelectFromLibrary = (diagram: SavedDiagram) => {
        setSelectedDiagram(diagram);
        setActiveTab('generator');
        toast({
            title: "تم تحميل المخطط",
            description: `تم تحميل "${diagram.title}" للتحرير`,
        });
    };

    // معالجة إنشاء مخطط جديد
    const handleCreateNew = () => {
        setSelectedDiagram(null);
        setActiveTab('generator');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* رأس الصفحة */}
                <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Palette className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl mb-2">
                                        مساحة عمل المخططات الذكية
                                    </CardTitle>
                                    <p className="text-white/90">
                                        إنشاء وإدارة مخططات PlantUML احترافية بالذكاء الاصطناعي
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-white/90">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{stats.totalGenerated || 0}</div>
                                    <div className="text-sm">مخطط مولد</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{stats.averageQuality?.toFixed(1) || '0'}</div>
                                    <div className="text-sm">متوسط الجودة</div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* شريط التنقل */}
                <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                    <TabsList className="grid w-full grid-cols-3 lg:w-96">
                        <TabsTrigger value="generator" className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            المولد
                        </TabsTrigger>
                        <TabsTrigger value="library" className="flex items-center gap-2">
                            <Library className="h-4 w-4" />
                            المكتبة
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            الإحصائيات
                        </TabsTrigger>
                    </TabsList>

                    {/* مولد المخططات */}
                    <TabsContent value="generator" className="space-y-6">
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                            {/* المولد الرئيسي */}
                            <div className="xl:col-span-3">
                                <DiagramGenerator
                                    projectData={mockProjectData}
                                    sectionContent={mockSectionContent}
                                    onDiagramGenerated={handleDiagramGenerated}
                                />
                            </div>

                            {/* الشريط الجانبي */}
                            <div className="space-y-4">
                                {/* المخططات الحديثة */}
                                {recentDiagrams.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-purple-500" />
                                                المخططات الحديثة
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {recentDiagrams.map((diagram, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="text-sm font-medium truncate">
                                                            {diagram.title}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <Badge variant="outline" className="text-xs">
                                                            {diagram.type}
                                                        </Badge>
                                                        <span>{diagram.metadata.qualityScore}/100</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* نصائح وإرشادات */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Info className="h-5 w-5 text-blue-500" />
                                            نصائح ذكية
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Alert>
                                            <Target className="h-4 w-4" />
                                            <AlertDescription className="text-sm">
                                                استخدم وصفاً مفصلاً للحصول على مخططات أكثر دقة
                                            </AlertDescription>
                                        </Alert>
                                        <Alert>
                                            <Users className="h-4 w-4" />
                                            <AlertDescription className="text-sm">
                                                أضف أصحاب المصلحة لمخططات أكثر شمولية
                                            </AlertDescription>
                                        </Alert>
                                        <Alert>
                                            <Sparkles className="h-4 w-4" />
                                            <AlertDescription className="text-sm">
                                                جرب أنواع مخططات مختلفة لنفس المشروع
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>

                                {/* بيانات المشروع */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">بيانات المشروع</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <div className="text-sm font-medium mb-1">المشروع</div>
                                            <div className="text-xs text-muted-foreground">
                                                {mockProjectData.title}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium mb-1">المتطلبات</div>
                                            <div className="text-xs text-muted-foreground">
                                                {mockProjectData.requirements.length} متطلب
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium mb-1">التقنيات</div>
                                            <div className="flex flex-wrap gap-1">
                                                {mockProjectData.technologies.slice(0, 3).map((tech, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                                {mockProjectData.technologies.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{mockProjectData.technologies.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* مكتبة المخططات */}
                    <TabsContent value="library">
                        <DiagramLibrary
                            onSelectDiagram={handleSelectFromLibrary}
                            onCreateNew={handleCreateNew}
                        />
                    </TabsContent>

                    {/* الإحصائيات */}
                    <TabsContent value="stats" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <Palette className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{stats.totalGenerated || 0}</div>
                                            <div className="text-sm text-muted-foreground">مخطط مولد</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                            <Target className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">
                                                {stats.averageQuality?.toFixed(1) || '0'}
                                            </div>
                                            <div className="text-sm text-muted-foreground">متوسط الجودة</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                            <TrendingUp className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">
                                                {stats.mostUsedTypes?.length || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">أنواع مستخدمة</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                            <Users className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">
                                                {recentDiagrams.length}
                                            </div>
                                            <div className="text-sm text-muted-foreground">في هذه الجلسة</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* الأنواع الأكثر استخداماً */}
                        {stats.mostUsedTypes && stats.mostUsedTypes.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        الأنواع الأكثر استخداماً
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {stats.mostUsedTypes.slice(0, 6).map((type, index) => (
                                            <div
                                                key={type}
                                                className="flex items-center gap-3 p-3 border rounded-lg"
                                            >
                                                <div className="text-2xl">
                                                    {/* يمكن إضافة أيقونة نوع المخطط هنا */}
                                                    📊
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{type}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        المرتبة #{index + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* رسالة إرشادية */}
                        <Card>
                            <CardContent className="p-6 text-center">
                                <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                                <h3 className="text-lg font-semibold mb-2">ابدأ في إنشاء المخططات</h3>
                                <p className="text-muted-foreground mb-4">
                                    استخدم مولد المخططات الذكي لإنشاء مخططات احترافية بسهولة
                                </p>
                                <Button onClick={() => setActiveTab('generator')} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    إنشاء مخطط جديد
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
