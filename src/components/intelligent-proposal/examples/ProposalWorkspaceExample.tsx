/**
 * مثال شامل لمساحة عمل أقسام المقترح الذكية
 * يوضح كيفية استخدام جميع مكونات أقسام المقترح معاً
 */

'use client';

import {
    ProposalSectionGenerator,
    type ProposalSectionResult,
    type ProposalSectionType
} from '@/components/intelligent-proposal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    useCompleteProposalGenerator,
    useProposalBuilder,
    useProposalStats
} from '@/hooks/use-intelligent-proposal';
import {
    PROPOSAL_SECTION_TYPES,
    type CompleteProposalGenerationOptions
} from '@/services/intelligent-proposal-service';
import {
    BookOpen,
    CheckCircle,
    Clock,
    FileText,
    Info,
    Plus,
    Sparkles,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// بيانات وهمية للمشروع
const mockProjectData = {
    title: "نظام إدارة المستشفيات الذكي",
    description: "نظام شامل لإدارة المستشفيات والمراكز الطبية مع ميزات الذكاء الاصطناعي لتحسين جودة الرعاية الصحية",
    domain: "الرعاية الصحية",
    industry: "تقنية المعلومات الطبية",
    targetAudience: "المستشفيات والمراكز الطبية",
    budget: 2500000,
    duration: 18,
    teamSize: 12,
    objectives: [
        "تحسين كفاءة إدارة المرضى",
        "تقليل أوقات الانتظار",
        "تحسين جودة الرعاية الصحية",
        "رقمنة السجلات الطبية",
        "تحسين التواصل بين الأقسام الطبية"
    ],
    requirements: [
        "نظام إدارة المرضى",
        "نظام السجلات الطبية الإلكترونية",
        "نظام إدارة المواعيد",
        "نظام إدارة المخزون الطبي",
        "نظام التقارير والإحصائيات",
        "تطبيق جوال للمرضى",
        "لوحة تحكم للإدارة"
    ],
    constraints: [
        "الامتثال لمعايير الخصوصية الطبية",
        "التكامل مع الأنظمة الموجودة",
        "دعم اللغة العربية والإنجليزية",
        "توفر النظام 24/7"
    ],
    stakeholders: [
        "إدارة المستشفى",
        "الأطباء والممرضين",
        "المرضى وأسرهم",
        "قسم تقنية المعلومات",
        "وزارة الصحة",
        "شركات التأمين الصحي"
    ],
    technologies: [
        "React.js",
        "Node.js",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "Docker",
        "Kubernetes",
        "AWS",
        "TensorFlow",
        "FHIR",
        "HL7"
    ]
};

export function ProposalWorkspaceExample() {
    const [activeTab, setActiveTab] = useState<'generator' | 'builder' | 'stats'>('generator');
    const [selectedSection, setSelectedSection] = useState<ProposalSectionType>('executive_summary');
    const [generatedSections, setGeneratedSections] = useState<Record<string, ProposalSectionResult>>({});

    const stats = useProposalStats();
    const completeGenerator = useCompleteProposalGenerator();
    const builder = useProposalBuilder();

    // معالجة توليد قسم جديد
    const handleSectionGenerated = (result: ProposalSectionResult) => {
        setGeneratedSections(prev => ({
            ...prev,
            [result.type]: result
        }));

        toast.success('تم توليد القسم بنجاح! 🎉', {
            description: `${result.title} - جودة: ${result.qualityScore}/100`
        });
    };

    // معالجة توليد مقترح كامل
    const handleGenerateCompleteProposal = () => {
        const sectionsToGenerate: ProposalSectionType[] = [
            'executive_summary',
            'problem_statement',
            'objectives',
            'scope',
            'methodology',
            'timeline',
            'budget',
            'team',
            'deliverables',
            'risk_assessment',
            'success_criteria',
            'conclusion'
        ];

        const options: CompleteProposalGenerationOptions = {
            projectContext: mockProjectData,
            sectionsToGenerate,
            style: {
                tone: 'professional',
                length: 'detailed',
                format: 'structured',
                language: 'ar'
            },
            complexity: 'detailed',
            intelligentSettings: {
                generateInOrder: true,
                useIntelligentDependencies: true,
                enableCrossReferencing: true,
                enableConsistencyCheck: true,
                qualityThreshold: 85,
                maxRetries: 3
            }
        };

        completeGenerator.generateCompleteProposal(options);
    };

    // حساب الإحصائيات
    const totalSections = Object.keys(generatedSections).length;
    const averageQuality = totalSections > 0 ?
        Object.values(generatedSections).reduce((sum, section) => sum + section.qualityScore, 0) / totalSections : 0;
    const totalWords = Object.values(generatedSections).reduce((sum, section) => sum + section.wordCount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* رأس الصفحة */}
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl mb-2">
                                        مساحة عمل أقسام المقترح الذكية
                                    </CardTitle>
                                    <p className="text-white/90">
                                        إنشاء وإدارة أقسام مقترح المشروع بالذكاء الاصطناعي المتقدم
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-white/90">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{totalSections}</div>
                                    <div className="text-sm">قسم مولد</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{Math.round(averageQuality)}</div>
                                    <div className="text-sm">متوسط الجودة</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{totalWords}</div>
                                    <div className="text-sm">إجمالي الكلمات</div>
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
                        <TabsTrigger value="builder" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            البناء الذكي
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            الإحصائيات
                        </TabsTrigger>
                    </TabsList>

                    {/* مولد الأقسام */}
                    <TabsContent value="generator" className="space-y-6">
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                            {/* المولد الرئيسي */}
                            <div className="xl:col-span-3">
                                <ProposalSectionGenerator
                                    initialType={selectedSection}
                                    projectData={mockProjectData}
                                    existingSections={Object.fromEntries(
                                        Object.entries(generatedSections).map(([key, section]) => [key, section.content])
                                    )}
                                    onSectionGenerated={handleSectionGenerated}
                                />
                            </div>

                            {/* الشريط الجانبي */}
                            <div className="space-y-4">
                                {/* اختيار سريع للأقسام */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Target className="h-5 w-5 text-blue-500" />
                                            أقسام سريعة
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {(['executive_summary', 'problem_statement', 'objectives', 'methodology'] as ProposalSectionType[]).map((type) => (
                                            <Button
                                                key={type}
                                                variant={selectedSection === type ? "default" : "outline"}
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => setSelectedSection(type)}
                                            >
                                                <span className="mr-2">{PROPOSAL_SECTION_TYPES[type].icon}</span>
                                                {PROPOSAL_SECTION_TYPES[type].title}
                                                {generatedSections[type] && (
                                                    <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
                                                )}
                                            </Button>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* الأقسام المولدة */}
                                {totalSections > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                الأقسام المولدة
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {Object.entries(generatedSections).map(([type, section]) => (
                                                <div
                                                    key={type}
                                                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm">{PROPOSAL_SECTION_TYPES[type as ProposalSectionType].icon}</span>
                                                        <div className="text-sm font-medium truncate">
                                                            {section.title}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>{section.wordCount} كلمة</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {section.qualityScore}/100
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

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
                                            <div className="text-sm font-medium mb-1">المجال</div>
                                            <div className="text-xs text-muted-foreground">
                                                {mockProjectData.domain}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium mb-1">الميزانية</div>
                                            <div className="text-xs text-muted-foreground">
                                                {mockProjectData.budget.toLocaleString()} ريال
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium mb-1">المدة</div>
                                            <div className="text-xs text-muted-foreground">
                                                {mockProjectData.duration} شهر
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* البناء الذكي للمقترح الكامل */}
                    <TabsContent value="builder" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* إعدادات البناء */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            بناء مقترح كامل
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertDescription>
                                                سيتم توليد جميع أقسام المقترح بشكل متسق ومترابط باستخدام الذكاء الاصطناعي المتقدم
                                            </AlertDescription>
                                        </Alert>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">12</div>
                                                <div className="text-sm text-muted-foreground">قسم</div>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">~4000</div>
                                                <div className="text-sm text-muted-foreground">كلمة</div>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl font-bold text-purple-600">~20</div>
                                                <div className="text-sm text-muted-foreground">دقيقة قراءة</div>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl font-bold text-orange-600">~8</div>
                                                <div className="text-sm text-muted-foreground">دقيقة توليد</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <Button
                                                onClick={handleGenerateCompleteProposal}
                                                disabled={completeGenerator.isGenerating}
                                                size="lg"
                                                className="flex items-center gap-2"
                                            >
                                                {completeGenerator.isGenerating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        جاري التوليد...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-4 w-4" />
                                                        توليد مقترح كامل
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* شريط التقدم */}
                                        {completeGenerator.isGenerating && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>{completeGenerator.progress.message}</span>
                                                    <span>{completeGenerator.progress.percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${completeGenerator.progress.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-muted-foreground text-center">
                                                    {completeGenerator.progress.completedSections} من {completeGenerator.progress.totalSections} أقسام
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* النتائج */}
                                {completeGenerator.result && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                تم إنجاز المقترح الكامل
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                    <span className="font-medium text-green-800 dark:text-green-200">
                                                        تم توليد المقترح بنجاح
                                                    </span>
                                                </div>
                                                <div className="text-sm text-green-600 dark:text-green-400">
                                                    {completeGenerator.result.performanceMetrics.sectionsGenerated} أقسام -
                                                    جودة: {Math.round(completeGenerator.result.overallQuality)}/100 -
                                                    {completeGenerator.result.totalWordCount} كلمة
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-sm font-medium mb-1">الجودة الإجمالية</div>
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {Math.round(completeGenerator.result.overallQuality)}/100
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium mb-1">وقت التوليد</div>
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {Math.round(completeGenerator.result.performanceMetrics.totalExecutionTime / 1000)}s
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-sm font-medium mb-2">الأقسام المولدة:</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.keys(completeGenerator.result.sections).map((sectionType) => (
                                                        <Badge key={sectionType} variant="outline" className="justify-start">
                                                            <span className="mr-1">{PROPOSAL_SECTION_TYPES[sectionType as ProposalSectionType].icon}</span>
                                                            {PROPOSAL_SECTION_TYPES[sectionType as ProposalSectionType].title}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* معلومات جانبية */}
                            <div className="space-y-4">
                                {/* نصائح */}
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
                                                المقترح الكامل يضمن الاتساق بين جميع الأقسام
                                            </AlertDescription>
                                        </Alert>
                                        <Alert>
                                            <Users className="h-4 w-4" />
                                            <AlertDescription className="text-sm">
                                                يتم مراعاة جميع أصحاب المصلحة في كل قسم
                                            </AlertDescription>
                                        </Alert>
                                        <Alert>
                                            <Clock className="h-4 w-4" />
                                            <AlertDescription className="text-sm">
                                                التوليد يتم بترتيب منطقي حسب التبعيات
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>

                                {/* الأقسام المتضمنة */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">الأقسام المتضمنة</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {[
                                                'executive_summary', 'problem_statement', 'objectives', 'scope',
                                                'methodology', 'timeline', 'budget', 'team', 'deliverables',
                                                'risk_assessment', 'success_criteria', 'conclusion'
                                            ].map((type) => (
                                                <div key={type} className="flex items-center gap-2 text-sm">
                                                    <span>{PROPOSAL_SECTION_TYPES[type as ProposalSectionType].icon}</span>
                                                    <span>{PROPOSAL_SECTION_TYPES[type as ProposalSectionType].title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* الإحصائيات */}
                    <TabsContent value="stats" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{stats.stats?.totalGenerated || 0}</div>
                                            <div className="text-sm text-muted-foreground">قسم مولد</div>
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
                                                {stats.stats?.averageQuality?.toFixed(1) || '0'}
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
                                            <BookOpen className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">
                                                {stats.stats?.averageWordCount || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">متوسط الكلمات</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                            <Clock className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">
                                                {Math.round((stats.stats?.averageGenerationTime || 0) / 1000)}s
                                            </div>
                                            <div className="text-sm text-muted-foreground">متوسط التوليد</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* الأقسام الأكثر استخداماً */}
                        {stats.stats?.mostUsedTypes && stats.stats.mostUsedTypes.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        الأقسام الأكثر استخداماً
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {stats.stats.mostUsedTypes.slice(0, 6).map((type, index) => (
                                            <div
                                                key={type}
                                                className="flex items-center gap-3 p-3 border rounded-lg"
                                            >
                                                <div className="text-2xl">
                                                    {PROPOSAL_SECTION_TYPES[type].icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{PROPOSAL_SECTION_TYPES[type].title}</div>
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
                                <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                                <h3 className="text-lg font-semibold mb-2">ابدأ في إنشاء أقسام المقترح</h3>
                                <p className="text-muted-foreground mb-4">
                                    استخدم مولد أقسام المقترح الذكي لإنشاء مقترحات احترافية بسهولة
                                </p>
                                <Button onClick={() => setActiveTab('generator')} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    إنشاء قسم جديد
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
