/**
 * مكون اختيار قوالب أقسام المقترح
 * يسمح للمستخدم باختيار قالب جاهز لقسم معين
 */

'use client';

import {
    type ProposalTemplate,
    applyTemplate,
    getSectionTemplates,
    validateTemplateVariables
} from '@/ai/templates/proposal-section-templates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    type ProposalSectionType,
    PROPOSAL_SECTION_TYPES
} from '@/services/intelligent-proposal-service';
import {
    AlertTriangle,
    CheckCircle,
    Eye,
    FileText as FileTemplate,
    FileText,
    Info,
    Layers,
    Settings,
    Sparkles,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProposalTemplateSelectorProps {
    sectionType: ProposalSectionType;
    onTemplateSelect: (template: ProposalTemplate, variables: Record<string, any>) => void;
    onCustomContent: (content: string) => void;
    className?: string;
}

export function ProposalTemplateSelector({
    sectionType,
    onTemplateSelect,
    onCustomContent,
    className
}: ProposalTemplateSelectorProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
    const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({});
    const [customContent, setCustomContent] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        isValid: boolean;
        missingRequired: string[];
        invalidTypes: string[];
    } | null>(null);

    const availableTemplates = getSectionTemplates(sectionType);
    const sectionInfo = PROPOSAL_SECTION_TYPES[sectionType];

    // تحديث المتغيرات عند تغيير القالب
    useEffect(() => {
        if (selectedTemplate) {
            const defaultVariables: Record<string, any> = {};
            Object.entries(selectedTemplate.variables).forEach(([key, config]) => {
                if (config.defaultValue !== undefined) {
                    defaultVariables[key] = config.defaultValue;
                } else {
                    switch (config.type) {
                        case 'text':
                            defaultVariables[key] = '';
                            break;
                        case 'number':
                            defaultVariables[key] = 0;
                            break;
                        case 'list':
                            defaultVariables[key] = [];
                            break;
                        case 'date':
                            defaultVariables[key] = new Date().toISOString().split('T')[0];
                            break;
                    }
                }
            });
            setTemplateVariables(defaultVariables);
        }
    }, [selectedTemplate]);

    // التحقق من صحة المتغيرات
    useEffect(() => {
        if (selectedTemplate) {
            const result = validateTemplateVariables(selectedTemplate, templateVariables);
            setValidationResult(result);
        }
    }, [selectedTemplate, templateVariables]);

    const handleVariableChange = (key: string, value: any) => {
        setTemplateVariables(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleListVariableChange = (key: string, value: string) => {
        const items = value.split('\n').filter(item => item.trim());
        handleVariableChange(key, items);
    };

    const handleUseTemplate = () => {
        if (selectedTemplate && validationResult?.isValid) {
            onTemplateSelect(selectedTemplate, templateVariables);
        }
    };

    const handleUseCustom = () => {
        if (customContent.trim()) {
            onCustomContent(customContent);
        }
    };

    const generatePreview = () => {
        if (selectedTemplate && validationResult?.isValid) {
            return applyTemplate(selectedTemplate, templateVariables);
        }
        return '';
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'basic': return 'bg-gray-500';
            case 'professional': return 'bg-blue-500';
            case 'academic': return 'bg-purple-500';
            case 'technical': return 'bg-green-500';
            case 'business': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'basic': return 'أساسي';
            case 'professional': return 'مهني';
            case 'academic': return 'أكاديمي';
            case 'technical': return 'تقني';
            case 'business': return 'تجاري';
            default: return category;
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* رأس المكون */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <FileTemplate className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">اختيار قالب القسم</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {sectionInfo.icon} {sectionInfo.title}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {availableTemplates.length} قالب متاح
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <FileTemplate className="h-4 w-4" />
                        القوالب الجاهزة
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        محتوى مخصص
                    </TabsTrigger>
                </TabsList>

                {/* القوالب الجاهزة */}
                <TabsContent value="templates" className="space-y-4">
                    {availableTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableTemplates.filter(template => template && template.id && template.description).map((template) => (
                                <Card
                                    key={template.id}
                                    className={`cursor-pointer transition-all hover:shadow-md ${selectedTemplate?.id === template.id
                                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                                        : ''
                                        }`}
                                    onClick={() => setSelectedTemplate(template)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-base">{template.name || 'قالب غير مسمى'}</CardTitle>
                                                    {selectedTemplate?.id === template.id && (
                                                        <CheckCircle className="h-4 w-4 text-blue-500" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {template.description || 'لا يوجد وصف متاح'}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className={`text-xs text-white ${getCategoryColor(template.category)}`}
                                            >
                                                {getCategoryLabel(template.category)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">الطول المقترح:</span>
                                                <span className="font-medium">{template.structure.suggestedLength} كلمة</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">النبرة:</span>
                                                <span className="font-medium">
                                                    {template.structure.tone === 'formal' ? 'رسمية' :
                                                        template.structure.tone === 'professional' ? 'مهنية' :
                                                            template.structure.tone === 'academic' ? 'أكاديمية' : 'تجارية'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {template.structure.keyPoints.slice(0, 3).map((point, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {point}
                                                    </Badge>
                                                ))}
                                                {template.structure.keyPoints.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{template.structure.keyPoints.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <FileTemplate className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">لا توجد قوالب متاحة</h3>
                                <p className="text-muted-foreground mb-4">
                                    لم يتم إنشاء قوالب لهذا النوع من الأقسام بعد
                                </p>
                                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                                    استخدم المحتوى المخصص
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* إعدادات القالب المحدد */}
                    {selectedTemplate && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    إعدادات القالب: {selectedTemplate.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(selectedTemplate.variables).map(([key, config]) => (
                                    <div key={key} className="space-y-2">
                                        <Label htmlFor={key} className="flex items-center gap-2">
                                            {config.description}
                                            {config.required && <span className="text-red-500">*</span>}
                                        </Label>

                                        {config.type === 'text' && (
                                            <Input
                                                id={key}
                                                value={templateVariables[key] || ''}
                                                onChange={(e) => handleVariableChange(key, e.target.value)}
                                                placeholder={`أدخل ${config.description}`}
                                                className={
                                                    config.required && !templateVariables[key]
                                                        ? 'border-red-300'
                                                        : ''
                                                }
                                            />
                                        )}

                                        {config.type === 'number' && (
                                            <Input
                                                id={key}
                                                type="number"
                                                value={templateVariables[key] || 0}
                                                onChange={(e) => handleVariableChange(key, Number(e.target.value))}
                                                placeholder={`أدخل ${config.description}`}
                                                className={
                                                    config.required && !templateVariables[key]
                                                        ? 'border-red-300'
                                                        : ''
                                                }
                                            />
                                        )}

                                        {config.type === 'list' && (
                                            <Textarea
                                                id={key}
                                                value={Array.isArray(templateVariables[key]) ? templateVariables[key].join('\n') : ''}
                                                onChange={(e) => handleListVariableChange(key, e.target.value)}
                                                placeholder={`أدخل ${config.description} (كل عنصر في سطر منفصل)`}
                                                rows={3}
                                                className={
                                                    config.required && (!templateVariables[key] || templateVariables[key].length === 0)
                                                        ? 'border-red-300'
                                                        : ''
                                                }
                                            />
                                        )}

                                        {config.type === 'date' && (
                                            <Input
                                                id={key}
                                                type="date"
                                                value={templateVariables[key] || ''}
                                                onChange={(e) => handleVariableChange(key, e.target.value)}
                                                className={
                                                    config.required && !templateVariables[key]
                                                        ? 'border-red-300'
                                                        : ''
                                                }
                                            />
                                        )}
                                    </div>
                                ))}

                                {/* رسائل التحقق */}
                                {validationResult && !validationResult.isValid && (
                                    <div className="space-y-2">
                                        {validationResult.missingRequired.length > 0 && (
                                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                                                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                                        حقول مطلوبة مفقودة:
                                                    </p>
                                                    <ul className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                        {validationResult.missingRequired.map(field => (
                                                            <li key={field}>• {selectedTemplate.variables[field].description}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* أزرار الإجراءات */}
                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        onClick={handleUseTemplate}
                                        disabled={!validationResult?.isValid}
                                        className="flex items-center gap-2"
                                    >
                                        <Zap className="h-4 w-4" />
                                        استخدام القالب
                                    </Button>

                                    <Dialog open={showPreview} onOpenChange={setShowPreview}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                disabled={!validationResult?.isValid}
                                                className="flex items-center gap-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                                معاينة
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                                            <DialogHeader>
                                                <DialogTitle>معاينة القالب</DialogTitle>
                                            </DialogHeader>
                                            <div className="overflow-y-auto">
                                                <div className="prose max-w-none p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <pre className="whitespace-pre-wrap font-sans text-sm">
                                                        {generatePreview()}
                                                    </pre>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* المحتوى المخصص */}
                <TabsContent value="custom" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                كتابة محتوى مخصص
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                اكتب محتوى القسم بنفسك أو استخدم نقطة انطلاق للذكاء الاصطناعي
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                value={customContent}
                                onChange={(e) => setCustomContent(e.target.value)}
                                placeholder={`اكتب محتوى ${sectionInfo.title} هنا...

يمكنك كتابة:
- النقاط الرئيسية التي تريد تغطيتها
- مخطط تفصيلي للقسم
- محتوى كامل جاهز
- توجيهات للذكاء الاصطناعي

سيقوم النظام الذكي بتحليل ما كتبته وتطويره إلى محتوى احترافي مكتمل.`}
                                rows={12}
                                className="resize-none"
                            />

                            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>نصيحة:</strong> حتى لو كتبت نقاط بسيطة، سيقوم النظام الذكي بتطويرها إلى محتوى احترافي مفصل.
                                </p>
                            </div>

                            <Button
                                onClick={handleUseCustom}
                                disabled={!customContent.trim()}
                                className="w-full flex items-center gap-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                استخدام المحتوى المخصص
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
