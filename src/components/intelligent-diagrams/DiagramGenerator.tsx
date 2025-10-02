/**
 * مكون توليد المخططات الذكية
 * يدعم جميع أنواع مخططات PlantUML مع واجهة متقدمة
 */

'use client';

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
    useDiagramGenerator,
    useDiagramStats,
    type UseDiagramGeneratorConfig
} from '@/hooks/use-intelligent-diagrams';
import {
    DIAGRAM_TYPES,
    type DiagramResult,
    type DiagramType
} from '@/services/intelligent-diagram-service';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    Eye,
    Info,
    Palette,
    Play,
    RotateCcw,
    Settings,
    Sparkles,
    Target,
    Zap
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { DiagramPreview } from './DiagramPreview';
import { DiagramTypeSelector } from './DiagramTypeSelector';

interface DiagramGeneratorProps {
    initialType?: DiagramType;
    projectData?: any;
    sectionContent?: string;
    onDiagramGenerated?: (result: DiagramResult) => void;
    className?: string;
}

export function DiagramGenerator({
    initialType = 'class',
    projectData,
    sectionContent,
    onDiagramGenerated,
    className
}: DiagramGeneratorProps) {
    const [selectedType, setSelectedType] = useState<DiagramType>(initialType);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState<string[]>([]);
    const [stakeholders, setStakeholders] = useState<string[]>([]);
    const [technologies, setTechnologies] = useState<string[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    // إعدادات التصميم
    const [style, setStyle] = useState({
        theme: 'modern' as const,
        direction: 'top-bottom' as const,
        showDetails: true,
        includeNotes: true
    });

    const [complexity, setComplexity] = useState<'basic' | 'detailed' | 'comprehensive'>('detailed');
    const [language, setLanguage] = useState<'ar' | 'en'>('ar');

    // إعداد hook التوليد
    const generatorConfig: UseDiagramGeneratorConfig = {
        type: selectedType,
        title: title || DIAGRAM_TYPES[selectedType].title,
        description,
        context: {
            projectData,
            sectionContent,
            requirements,
            stakeholders,
            technologies
        },
        style,
        complexity,
        language,
        onSuccess: (result) => {
            onDiagramGenerated?.(result);
        }
    };

    const generator = useDiagramGenerator(generatorConfig);
    const stats = useDiagramStats();

    // معالجة تغيير نوع المخطط
    const handleTypeChange = useCallback((type: DiagramType) => {
        setSelectedType(type);
        const typeInfo = DIAGRAM_TYPES[type];
        if (!title) {
            setTitle(typeInfo.title);
        }
        if (!description) {
            setDescription(typeInfo.description);
        }
    }, [title, description]);

    // معالجة إضافة متطلب
    const handleAddRequirement = useCallback((requirement: string) => {
        if (requirement.trim() && !requirements.includes(requirement.trim())) {
            setRequirements(prev => [...prev, requirement.trim()]);
        }
    }, [requirements]);

    // معالجة إزالة متطلب
    const handleRemoveRequirement = useCallback((index: number) => {
        setRequirements(prev => prev.filter((_, i) => i !== index));
    }, []);

    // معالجة التحميل
    const handleDownload = useCallback(() => {
        if (!generator.result) return;

        const blob = new Blob([generator.result.plantUmlCode], {
            type: 'text/plain;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generator.result.title.replace(/\s+/g, '_')}.puml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [generator.result]);

    const diagramInfo = DIAGRAM_TYPES[selectedType];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* رأس المولد */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <Palette className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">مولد المخططات الذكي</CardTitle>
                                <p className="text-muted-foreground">
                                    إنشاء مخططات PlantUML احترافية بالذكاء الاصطناعي
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="default" className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                ذكي
                            </Badge>
                            <Badge variant="outline">{diagramInfo.icon} {diagramInfo.title}</Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* المحتوى الرئيسي */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* لوحة الإعدادات */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">الإعدادات الأساسية</TabsTrigger>
                            <TabsTrigger value="context">السياق والمحتوى</TabsTrigger>
                            <TabsTrigger value="style">التصميم والتنسيق</TabsTrigger>
                        </TabsList>

                        {/* الإعدادات الأساسية */}
                        <TabsContent value="basic" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        الإعدادات الأساسية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* اختيار نوع المخطط */}
                                    <DiagramTypeSelector
                                        selectedType={selectedType}
                                        onTypeChange={handleTypeChange}
                                    />

                                    {/* عنوان المخطط */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">عنوان المخطط</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={diagramInfo.title}
                                        />
                                    </div>

                                    {/* وصف المخطط */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">وصف المخطط</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder={diagramInfo.description}
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

                                    {/* اللغة */}
                                    <div className="space-y-2">
                                        <Label>لغة المخطط</Label>
                                        <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
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

                        {/* السياق والمحتوى */}
                        <TabsContent value="context" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="h-5 w-5" />
                                        السياق والمحتوى
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* المتطلبات */}
                                    <div className="space-y-2">
                                        <Label>المتطلبات والوظائف</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="أضف متطلب جديد..."
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddRequirement(e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    const input = document.querySelector('input[placeholder="أضف متطلب جديد..."]') as HTMLInputElement;
                                                    if (input?.value) {
                                                        handleAddRequirement(input.value);
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                إضافة
                                            </Button>
                                        </div>
                                        {requirements.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {requirements.map((req, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="cursor-pointer"
                                                        onClick={() => handleRemoveRequirement(index)}
                                                    >
                                                        {req} ×
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
                                            value={stakeholders.join('\n')}
                                            onChange={(e) => setStakeholders(e.target.value.split('\n').filter(s => s.trim()))}
                                            rows={3}
                                        />
                                    </div>

                                    {/* التقنيات */}
                                    <div className="space-y-2">
                                        <Label>التقنيات المستخدمة</Label>
                                        <Textarea
                                            placeholder="اكتب التقنيات، كل واحدة في سطر منفصل..."
                                            value={technologies.join('\n')}
                                            onChange={(e) => setTechnologies(e.target.value.split('\n').filter(t => t.trim()))}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* التصميم والتنسيق */}
                        <TabsContent value="style" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Palette className="h-5 w-5" />
                                        التصميم والتنسيق
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* الثيم */}
                                    <div className="space-y-2">
                                        <Label>ثيم المخطط</Label>
                                        <Select
                                            value={style.theme}
                                            onValueChange={(value: any) => setStyle(prev => ({ ...prev, theme: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="default">افتراضي</SelectItem>
                                                <SelectItem value="modern">حديث</SelectItem>
                                                <SelectItem value="minimal">بسيط</SelectItem>
                                                <SelectItem value="colorful">ملون</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* اتجاه المخطط */}
                                    <div className="space-y-2">
                                        <Label>اتجاه المخطط</Label>
                                        <Select
                                            value={style.direction}
                                            onValueChange={(value: any) => setStyle(prev => ({ ...prev, direction: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="top-bottom">من الأعلى للأسفل</SelectItem>
                                                <SelectItem value="left-right">من اليسار لليمين</SelectItem>
                                                <SelectItem value="bottom-top">من الأسفل للأعلى</SelectItem>
                                                <SelectItem value="right-left">من اليمين لليسار</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* خيارات العرض */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label>إظهار التفاصيل</Label>
                                                <p className="text-xs text-muted-foreground">
                                                    عرض التفاصيل الكاملة للعناصر
                                                </p>
                                            </div>
                                            <Switch
                                                checked={style.showDetails}
                                                onCheckedChange={(checked) => setStyle(prev => ({ ...prev, showDetails: checked }))}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label>تضمين الملاحظات</Label>
                                                <p className="text-xs text-muted-foreground">
                                                    إضافة ملاحظات توضيحية للمخطط
                                                </p>
                                            </div>
                                            <Switch
                                                checked={style.includeNotes}
                                                onCheckedChange={(checked) => setStyle(prev => ({ ...prev, includeNotes: checked }))}
                                            />
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
                                        onClick={generator.generateDiagram}
                                        disabled={generator.isGenerating}
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
                                                توليد المخطط
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
                                        {diagramInfo.complexity}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Zap className="h-4 w-4" />
                                        2-5 رصيد
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
                        </CardContent>
                    </Card>
                </div>

                {/* لوحة المعلومات والنتائج */}
                <div className="space-y-4">
                    {/* معلومات نوع المخطط */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {diagramInfo.icon} معلومات المخطط
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm font-medium mb-1">النوع</div>
                                <div className="text-xs text-muted-foreground">{diagramInfo.title}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">الوصف</div>
                                <div className="text-xs text-muted-foreground">{diagramInfo.description}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">الفئة</div>
                                <Badge variant="outline" className="text-xs">
                                    {diagramInfo.category === 'uml' ? 'UML' :
                                        diagramInfo.category === 'business' ? 'أعمال' :
                                            diagramInfo.category === 'technical' ? 'تقني' : 'تخطيط'}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">حالات الاستخدام</div>
                                <div className="space-y-1">
                                    {diagramInfo.useCases.map((useCase, index) => (
                                        <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                            {useCase}
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
                                        {generator.result.elementCount} عنصر - جودة: {generator.result.metadata.qualityScore}/100
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowPreview(true)}
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
                                        <span className="text-muted-foreground">عدد العناصر:</span>
                                        <span className="font-medium">{generator.elementCount}</span>
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
                                        <div className="font-semibold text-blue-600">{stats.totalGenerated}</div>
                                        <div className="text-xs text-muted-foreground">مخطط مولد</div>
                                    </div>
                                    <div className="text-center p-2 bg-green-50 dark:bg-green-900 rounded">
                                        <div className="font-semibold text-green-600">{stats.averageQuality.toFixed(1)}</div>
                                        <div className="text-xs text-muted-foreground">متوسط الجودة</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium mb-1">الأكثر استخداماً:</div>
                                    <div className="flex gap-1 flex-wrap">
                                        {stats.mostUsedTypes.slice(0, 3).map(type => (
                                            <Badge key={type} variant="outline" className="text-xs">
                                                {DIAGRAM_TYPES[type].icon} {DIAGRAM_TYPES[type].title}
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
            {showPreview && generator.result && (
                <DiagramPreview
                    diagram={generator.result}
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
}
