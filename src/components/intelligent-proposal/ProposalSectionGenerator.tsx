/**
 * مكون توليد أقسام المقترح الذكية
 * يدعم توليد جميع أقسام المقترح بواجهة متقدمة وذكية
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    useProposalSectionGenerator,
    useProposalSectionPreview,
    useProposalStats,
    type UseProposalSectionGeneratorConfig
} from '@/hooks/use-intelligent-proposal';
import {
    PROPOSAL_SECTION_TYPES,
    type ProposalComplexity,
    type ProposalSectionResult,
    type ProposalSectionType,
    type ProposalStyle
} from '@/services/intelligent-proposal-service';
import {
    AlertTriangle,
    BookOpen,
    Briefcase,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    Play,
    RotateCcw,
    Settings,
    Sparkles,
    Target,
    Zap
} from 'lucide-react';
import { useCallback, useState } from 'react';
// import { ProposalSectionPreview } from './ProposalSectionPreview';
import { ProposalSectionTypeSelector } from './ProposalSectionTypeSelector';
import { ProposalTemplateSelector } from './ProposalTemplateSelector';

interface ProposalSectionGeneratorProps {
    initialType?: ProposalSectionType;
    projectData?: any;
    existingSections?: Record<string, string>;
    onSectionGenerated?: (result: ProposalSectionResult) => void;
    className?: string;
}

export function ProposalSectionGenerator({
    initialType = 'executive_summary',
    projectData,
    existingSections,
    onSectionGenerated,
    className
}: ProposalSectionGeneratorProps) {
    const [selectedType, setSelectedType] = useState<ProposalSectionType>(initialType);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    // سياق المشروع
    const [projectContext, setProjectContext] = useState({
        title: projectData?.title || '',
        description: projectData?.description || '',
        domain: projectData?.domain || '',
        industry: projectData?.industry || '',
        targetAudience: projectData?.targetAudience || '',
        budget: projectData?.budget || 0,
        duration: projectData?.duration || 0,
        teamSize: projectData?.teamSize || 0,
        objectives: projectData?.objectives || [],
        requirements: projectData?.requirements || [],
        constraints: projectData?.constraints || [],
        stakeholders: projectData?.stakeholders || [],
        technologies: projectData?.technologies || []
    });

    // إعدادات الأسلوب
    const [style, setStyle] = useState<ProposalStyle>({
        tone: 'professional',
        length: 'moderate',
        format: 'structured',
        language: 'ar'
    });

    const [complexity, setComplexity] = useState<ProposalComplexity>('detailed');

    // إعدادات ذكية
    const [intelligentSettings, setIntelligentSettings] = useState({
        enableContextAnalysis: true,
        enableIterativeImprovement: true,
        enablePerformanceMonitoring: true,
        qualityThreshold: 80,
        maxIterations: 3,
        adaptiveModelSelection: true
    });

    // تفضيلات المخرجات
    const [outputPreferences, setOutputPreferences] = useState({
        includeOutline: true,
        includeKeyPoints: true,
        generateSuggestions: true,
        validateContent: true
    });

    // إعداد hook التوليد
    const generatorConfig: UseProposalSectionGeneratorConfig = {
        type: selectedType,
        projectContext,
        style,
        complexity,
        referenceContent: {
            existingSections,
            guidelines: 'اكتب محتوى احترافي ومفصل يناسب سياق المشروع'
        },
        intelligentSettings,
        onSuccess: (result) => {
            onSectionGenerated?.(result);
        }
    };

    const generator = useProposalSectionGenerator(generatorConfig);
    const stats = useProposalStats();
    const preview = useProposalSectionPreview();

    // معالجة تغيير نوع القسم
    const handleTypeChange = useCallback((type: ProposalSectionType) => {
        setSelectedType(type);
        const sectionInfo = PROPOSAL_SECTION_TYPES[type];
        if (!title) {
            setTitle(sectionInfo.title);
        }
        if (!description) {
            setDescription(sectionInfo.description);
        }
    }, [title, description]);

    // معالجة إضافة هدف
    const handleAddObjective = useCallback((objective: string) => {
        if (objective.trim() && !projectContext.objectives.includes(objective.trim())) {
            setProjectContext(prev => ({
                ...prev,
                objectives: [...prev.objectives, objective.trim()]
            }));
        }
    }, [projectContext.objectives]);

    // معالجة إزالة هدف
    const handleRemoveObjective = useCallback((index: number) => {
        setProjectContext(prev => ({
            ...prev,
            objectives: prev.objectives.filter((_, i) => i !== index)
        }));
    }, []);

    // معالجة التحميل
    const handleDownload = useCallback(() => {
        if (!generator.result) return;

        const content = `# ${generator.result.title}

${generator.result.content}

---
معلومات التوليد:
- الجودة: ${generator.result.qualityScore}/100
- عدد الكلمات: ${generator.result.wordCount}
- وقت التوليد: ${generator.result.metadata.executionTime}ms
- التكرارات: ${generator.result.metadata.iterations}
`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generator.result.title.replace(/\s+/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [generator.result]);

    const sectionInfo = PROPOSAL_SECTION_TYPES[selectedType];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* رأس المولد */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">مولد أقسام المقترح الذكي</CardTitle>
                                <p className="text-muted-foreground">
                                    إنشاء أقسام مقترح المشروع بالذكاء الاصطناعي المتقدم
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="default" className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                ذكي
                            </Badge>
                            <Badge variant="outline">{sectionInfo.icon} {sectionInfo.title}</Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* المحتوى الرئيسي */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* لوحة الإعدادات */}
                <div className="xl:col-span-3 space-y-6">
                    <Tabs defaultValue="section" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="section">إعدادات القسم</TabsTrigger>
                            <TabsTrigger value="template">القوالب</TabsTrigger>
                            <TabsTrigger value="project">سياق المشروع</TabsTrigger>
                            <TabsTrigger value="style">الأسلوب والتنسيق</TabsTrigger>
                            <TabsTrigger value="advanced">إعدادات متقدمة</TabsTrigger>
                        </TabsList>

                        {/* إعدادات القسم */}
                        <TabsContent value="section" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        إعدادات القسم
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* اختيار نوع القسم */}
                                    <ProposalSectionTypeSelector
                                        selectedType={selectedType}
                                        onTypeChange={handleTypeChange}
                                    />

                                    {/* عنوان القسم */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">عنوان القسم</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={sectionInfo.title}
                                        />
                                    </div>

                                    {/* وصف القسم */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">وصف إضافي (اختياري)</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="أضف أي متطلبات أو توجيهات خاصة لهذا القسم..."
                                            rows={3}
                                        />
                                    </div>

                                    {/* مستوى التفصيل */}
                                    <div className="space-y-2">
                                        <Label>مستوى التفصيل</Label>
                                        <Select value={complexity} onValueChange={(value: any) => setComplexity(value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="basic">أساسي - معلومات عامة</SelectItem>
                                                <SelectItem value="detailed">مفصل - تفاصيل متوسطة</SelectItem>
                                                <SelectItem value="comprehensive">شامل - تفاصيل كاملة</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* القوالب الجاهزة */}
                        <TabsContent value="template" className="space-y-4">
                            <ProposalTemplateSelector
                                sectionType={selectedType}
                                onTemplateSelect={(template, variables) => {
                                    // تطبيق القالب مع المتغيرات
                                    console.log('Template selected:', template, variables);
                                    // يمكن هنا تحديث حالة المحتوى أو بدء التوليد مباشرة
                                }}
                                onCustomContent={(content) => {
                                    // استخدام المحتوى المخصص
                                    console.log('Custom content:', content);
                                    // يمكن هنا تحديث حالة المحتوى أو بدء التوليد مباشرة
                                }}
                            />
                        </TabsContent>

                        {/* سياق المشروع */}
                        <TabsContent value="project" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5" />
                                        سياق المشروع
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* معلومات أساسية */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="projectTitle">عنوان المشروع</Label>
                                            <Input
                                                id="projectTitle"
                                                value={projectContext.title}
                                                onChange={(e) => setProjectContext(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="اسم المشروع"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="domain">المجال</Label>
                                            <Input
                                                id="domain"
                                                value={projectContext.domain}
                                                onChange={(e) => setProjectContext(prev => ({ ...prev, domain: e.target.value }))}
                                                placeholder="مجال المشروع (تقنية، تعليم، صحة...)"
                                            />
                                        </div>
                                    </div>

                                    {/* وصف المشروع */}
                                    <div className="space-y-2">
                                        <Label htmlFor="projectDescription">وصف المشروع</Label>
                                        <Textarea
                                            id="projectDescription"
                                            value={projectContext.description}
                                            onChange={(e) => setProjectContext(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="وصف شامل للمشروع وأهدافه..."
                                            rows={4}
                                        />
                                    </div>

                                    {/* معلومات إضافية */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="budget">الميزانية (ريال)</Label>
                                            <Input
                                                id="budget"
                                                type="number"
                                                value={projectContext.budget}
                                                onChange={(e) => setProjectContext(prev => ({ ...prev, budget: Number(e.target.value) }))}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">المدة (شهر)</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={projectContext.duration}
                                                onChange={(e) => setProjectContext(prev => ({ ...prev, duration: Number(e.target.value) }))}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="teamSize">حجم الفريق</Label>
                                            <Input
                                                id="teamSize"
                                                type="number"
                                                value={projectContext.teamSize}
                                                onChange={(e) => setProjectContext(prev => ({ ...prev, teamSize: Number(e.target.value) }))}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    {/* الأهداف */}
                                    <div className="space-y-2">
                                        <Label>أهداف المشروع</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="أضف هدف جديد..."
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddObjective(e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    const input = document.querySelector('input[placeholder="أضف هدف جديد..."]') as HTMLInputElement;
                                                    if (input?.value) {
                                                        handleAddObjective(input.value);
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                إضافة
                                            </Button>
                                        </div>
                                        {projectContext.objectives.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {projectContext.objectives.map((objective, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="cursor-pointer"
                                                        onClick={() => handleRemoveObjective(index)}
                                                    >
                                                        {objective} ×
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* أصحاب المصلحة */}
                                    <div className="space-y-2">
                                        <Label>أصحاب المصلحة</Label>
                                        <Textarea
                                            placeholder="اكتب أصحاب المصلحة، كل واحد في سطر منفصل..."
                                            value={projectContext.stakeholders.join('\n')}
                                            onChange={(e) => setProjectContext(prev => ({
                                                ...prev,
                                                stakeholders: e.target.value.split('\n').filter(s => s.trim())
                                            }))}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* الأسلوب والتنسيق */}
                        <TabsContent value="style" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        الأسلوب والتنسيق
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* نبرة الكتابة */}
                                    <div className="space-y-2">
                                        <Label>نبرة الكتابة</Label>
                                        <Select
                                            value={style.tone}
                                            onValueChange={(value: any) => setStyle(prev => ({ ...prev, tone: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="formal">رسمية</SelectItem>
                                                <SelectItem value="professional">مهنية</SelectItem>
                                                <SelectItem value="academic">أكاديمية</SelectItem>
                                                <SelectItem value="business">تجارية</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* طول المحتوى */}
                                    <div className="space-y-2">
                                        <Label>طول المحتوى</Label>
                                        <Select
                                            value={style.length}
                                            onValueChange={(value: any) => setStyle(prev => ({ ...prev, length: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="concise">موجز</SelectItem>
                                                <SelectItem value="moderate">متوسط</SelectItem>
                                                <SelectItem value="detailed">مفصل</SelectItem>
                                                <SelectItem value="extensive">مطول</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* تنسيق المحتوى */}
                                    <div className="space-y-2">
                                        <Label>تنسيق المحتوى</Label>
                                        <Select
                                            value={style.format}
                                            onValueChange={(value: any) => setStyle(prev => ({ ...prev, format: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="narrative">سردي</SelectItem>
                                                <SelectItem value="structured">منظم</SelectItem>
                                                <SelectItem value="bullet_points">نقاط</SelectItem>
                                                <SelectItem value="mixed">مختلط</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* اللغة */}
                                    <div className="space-y-2">
                                        <Label>لغة المحتوى</Label>
                                        <Select
                                            value={style.language}
                                            onValueChange={(value: any) => setStyle(prev => ({ ...prev, language: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ar">العربية</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* إعدادات متقدمة */}
                        <TabsContent value="advanced" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5" />
                                        إعدادات ذكية متقدمة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* عتبة الجودة */}
                                    <div className="space-y-2">
                                        <Label>عتبة الجودة المطلوبة: {intelligentSettings.qualityThreshold}%</Label>
                                        <input
                                            type="range"
                                            min="60"
                                            max="95"
                                            value={intelligentSettings.qualityThreshold}
                                            onChange={(e) => setIntelligentSettings(prev => ({
                                                ...prev,
                                                qualityThreshold: Number(e.target.value)
                                            }))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* عدد التكرارات */}
                                    <div className="space-y-2">
                                        <Label>عدد التكرارات القصوى</Label>
                                        <Select
                                            value={intelligentSettings.maxIterations.toString()}
                                            onValueChange={(value) => setIntelligentSettings(prev => ({
                                                ...prev,
                                                maxIterations: Number(value)
                                            }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 تكرار</SelectItem>
                                                <SelectItem value="2">2 تكرار</SelectItem>
                                                <SelectItem value="3">3 تكرارات</SelectItem>
                                                <SelectItem value="4">4 تكرارات</SelectItem>
                                                <SelectItem value="5">5 تكرارات</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* خيارات ذكية */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label>التحسين التكراري</Label>
                                                <p className="text-xs text-muted-foreground">
                                                    تحسين المحتوى عبر عدة تكرارات
                                                </p>
                                            </div>
                                            <Switch
                                                checked={intelligentSettings.enableIterativeImprovement}
                                                onCheckedChange={(checked) => setIntelligentSettings(prev => ({
                                                    ...prev,
                                                    enableIterativeImprovement: checked
                                                }))}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label>مراقبة الأداء</Label>
                                                <p className="text-xs text-muted-foreground">
                                                    تتبع أداء النظام والجودة
                                                </p>
                                            </div>
                                            <Switch
                                                checked={intelligentSettings.enablePerformanceMonitoring}
                                                onCheckedChange={(checked) => setIntelligentSettings(prev => ({
                                                    ...prev,
                                                    enablePerformanceMonitoring: checked
                                                }))}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label>اختيار النموذج التكيفي</Label>
                                                <p className="text-xs text-muted-foreground">
                                                    اختيار أفضل نموذج AI تلقائياً
                                                </p>
                                            </div>
                                            <Switch
                                                checked={intelligentSettings.adaptiveModelSelection}
                                                onCheckedChange={(checked) => setIntelligentSettings(prev => ({
                                                    ...prev,
                                                    adaptiveModelSelection: checked
                                                }))}
                                            />
                                        </div>
                                    </div>

                                    {/* تفضيلات المخرجات */}
                                    <div className="pt-4 border-t">
                                        <Label className="text-base font-semibold">تفضيلات المخرجات</Label>
                                        <div className="space-y-3 mt-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm">تضمين المخطط التفصيلي</Label>
                                                <Switch
                                                    checked={outputPreferences.includeOutline}
                                                    onCheckedChange={(checked) => setOutputPreferences(prev => ({
                                                        ...prev,
                                                        includeOutline: checked
                                                    }))}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm">تضمين النقاط الرئيسية</Label>
                                                <Switch
                                                    checked={outputPreferences.includeKeyPoints}
                                                    onCheckedChange={(checked) => setOutputPreferences(prev => ({
                                                        ...prev,
                                                        includeKeyPoints: checked
                                                    }))}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm">توليد اقتراحات التحسين</Label>
                                                <Switch
                                                    checked={outputPreferences.generateSuggestions}
                                                    onCheckedChange={(checked) => setOutputPreferences(prev => ({
                                                        ...prev,
                                                        generateSuggestions: checked
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* أزرار التحكم */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={generator.generateSection}
                                        disabled={generator.isGenerating || !projectContext.title || !projectContext.description}
                                        size="lg"
                                        className="flex items-center gap-2"
                                    >
                                        {generator.isGenerating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                جاري التوليد...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4" />
                                                توليد القسم
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={generator.reset}
                                        variant="outline"
                                        disabled={generator.isGenerating}
                                        className="flex items-center gap-2"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        إعادة تعيين
                                    </Button>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {generator.estimatedTime}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Target className="h-4 w-4" />
                                        {sectionInfo.complexity}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Zap className="h-4 w-4" />
                                        3-8 رصيد
                                    </div>
                                </div>
                            </div>

                            {/* شريط التقدم */}
                            {generator.isGenerating && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>{generator.progress.message}</span>
                                        <span>{generator.progress.percentage}%</span>
                                    </div>
                                    <Progress value={generator.progress.percentage} className="h-2" />
                                </div>
                            )}

                            {/* رسائل التحذير */}
                            {(!projectContext.title || !projectContext.description) && (
                                <Alert className="mt-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        يرجى تعبئة عنوان ووصف المشروع في تبويب "سياق المشروع" قبل التوليد
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* الشريط الجانبي */}
                <div className="space-y-4">
                    {/* معلومات نوع القسم */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {sectionInfo.icon} معلومات القسم
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm font-medium mb-1">النوع</div>
                                <div className="text-xs text-muted-foreground">{sectionInfo.title}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">الوصف</div>
                                <div className="text-xs text-muted-foreground">{sectionInfo.description}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">الفئة</div>
                                <Badge variant="outline" className="text-xs">
                                    {sectionInfo.category === 'overview' ? 'نظرة عامة' :
                                        sectionInfo.category === 'planning' ? 'تخطيط' :
                                            sectionInfo.category === 'execution' ? 'تنفيذ' :
                                                sectionInfo.category === 'management' ? 'إدارة' : 'تقييم'}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">الطول المتوقع</div>
                                <div className="text-xs text-muted-foreground">
                                    {sectionInfo.estimatedLength} كلمة تقريباً
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">العناصر الأساسية</div>
                                <div className="space-y-1">
                                    {sectionInfo.keyElements.map((element, index) => (
                                        <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                            {element}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* النتائج */}
                    {generator.result && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    النتيجة
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                            تم التوليد بنجاح
                                        </span>
                                    </div>
                                    <div className="text-xs text-green-600 dark:text-green-400">
                                        {generator.result.wordCount} كلمة - جودة: {generator.result.qualityScore}/100
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => preview.openPreview(generator.result!)}
                                        className="flex-1 flex items-center gap-1"
                                    >
                                        <Eye className="h-3 w-3" />
                                        معاينة
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownload}
                                        className="flex-1 flex items-center gap-1"
                                    >
                                        <Download className="h-3 w-3" />
                                        تحميل
                                    </Button>
                                </div>

                                {/* إحصائيات الأداء */}
                                <div className="pt-3 border-t space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">وقت التوليد:</span>
                                        <span className="font-medium">{generator.executionTime}ms</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">نقاط الجودة:</span>
                                        <span className="font-medium text-green-600">{generator.qualityScore}/100</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">التكرارات:</span>
                                        <span className="font-medium">{generator.iterations}</span>
                                    </div>
                                </div>

                                {/* التوصيات */}
                                {generator.result.suggestions.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">توصيات للتحسين:</div>
                                        <ul className="space-y-1">
                                            {generator.result.suggestions.slice(0, 3).map((suggestion, index) => (
                                                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                                                    <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                                    <span>{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* إحصائيات النظام */}
                    {stats.stats && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">إحصائيات النظام</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900 rounded">
                                        <div className="font-semibold text-blue-600">{stats.stats.totalGenerated}</div>
                                        <div className="text-xs text-muted-foreground">قسم مولد</div>
                                    </div>
                                    <div className="text-center p-2 bg-green-50 dark:bg-green-900 rounded">
                                        <div className="font-semibold text-green-600">{stats.stats.averageQuality.toFixed(1)}</div>
                                        <div className="text-xs text-muted-foreground">متوسط الجودة</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium mb-1">الأكثر استخداماً:</div>
                                    <div className="flex gap-1 flex-wrap">
                                        {stats.stats.mostUsedTypes.slice(0, 3).map(type => (
                                            <Badge key={type} variant="outline" className="text-xs">
                                                {PROPOSAL_SECTION_TYPES[type].icon} {PROPOSAL_SECTION_TYPES[type].title}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* نافذة المعاينة */}
            {preview.isPreviewOpen && preview.previewSection && (
                <ProposalSectionPreview
                    section={preview.previewSection}
                    isOpen={preview.isPreviewOpen}
                    onClose={preview.closePreview}
                />
            )}
        </div>
    );
}
