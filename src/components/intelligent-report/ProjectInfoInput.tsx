/**
 * مكون إدخال معلومات المشروع
 * يوفر بديل للمقترحات عند عدم توفرها
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useDefaultReportConfig } from '@/hooks/use-report-validation';
import { FileText, Plus, Save, X } from 'lucide-react';
import { useCallback, useState } from 'react';

interface ProjectInfo {
    title: string;
    description: string;
    objectives: string[];
    scope: string;
    methodology: string;
    timeline: string;
    additionalInfo: string;
}

interface ProjectInfoInputProps {
    initialData?: Partial<ProjectInfo>;
    onSave: (projectInfo: ProjectInfo) => void;
    onCancel?: () => void;
    className?: string;
}

export function ProjectInfoInput({
    initialData,
    onSave,
    onCancel,
    className
}: ProjectInfoInputProps) {
    const { defaultProjectInfo, suggestedContextTypes } = useDefaultReportConfig();

    const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        objectives: initialData?.objectives || [],
        scope: initialData?.scope || '',
        methodology: initialData?.methodology || '',
        timeline: initialData?.timeline || '',
        additionalInfo: initialData?.additionalInfo || ''
    });

    const [newObjective, setNewObjective] = useState('');

    const handleInputChange = useCallback((field: keyof ProjectInfo, value: string) => {
        setProjectInfo(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const addObjective = useCallback(() => {
        if (newObjective.trim()) {
            setProjectInfo(prev => ({
                ...prev,
                objectives: [...prev.objectives, newObjective.trim()]
            }));
            setNewObjective('');
        }
    }, [newObjective]);

    const removeObjective = useCallback((index: number) => {
        setProjectInfo(prev => ({
            ...prev,
            objectives: prev.objectives.filter((_, i) => i !== index)
        }));
    }, []);

    const handleSave = useCallback(() => {
        // التحقق من وجود المعلومات الأساسية
        if (!projectInfo.title.trim() || !projectInfo.description.trim()) {
            alert('يرجى إدخال عنوان ووصف المشروع على الأقل');
            return;
        }
        onSave(projectInfo);
    }, [projectInfo, onSave]);

    // حساب نسبة الاكتمال
    const completionFields = [
        projectInfo.title,
        projectInfo.description,
        projectInfo.objectives.length > 0 ? 'yes' : '',
        projectInfo.scope,
        projectInfo.methodology,
        projectInfo.timeline
    ];
    const completedFields = completionFields.filter(field => field.trim()).length;
    const completionPercentage = Math.round((completedFields / completionFields.length) * 100);

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <CardTitle>معلومات المشروع</CardTitle>
                    </div>
                    <Badge variant={completionPercentage > 60 ? "default" : "secondary"}>
                        {completionPercentage}% مكتمل
                    </Badge>
                </div>
                <CardDescription>
                    أدخل معلومات أساسية عن مشروعك لتحسين جودة التقرير المولد
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="basic" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
                        <TabsTrigger value="details">التفاصيل</TabsTrigger>
                        <TabsTrigger value="context">السياق الإضافي</TabsTrigger>
                    </TabsList>

                    {/* المعلومات الأساسية */}
                    <TabsContent value="basic" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">عنوان المشروع *</Label>
                            <Input
                                id="title"
                                value={projectInfo.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="أدخل عنوان مشروعك..."
                                className="text-right"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">وصف المشروع *</Label>
                            <Textarea
                                id="description"
                                value={projectInfo.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="اكتب وصفاً شاملاً لمشروعك، ما يهدف إليه، وما المشكلة التي يحلها..."
                                rows={4}
                                className="text-right"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>أهداف المشروع</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={newObjective}
                                    onChange={(e) => setNewObjective(e.target.value)}
                                    placeholder="أضف هدفاً للمشروع..."
                                    className="flex-1 text-right"
                                    onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addObjective}
                                    disabled={!newObjective.trim()}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {projectInfo.objectives.map((objective, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                        <span className="flex-1 text-sm text-right">{objective}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeObjective(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* التفاصيل */}
                    <TabsContent value="details" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="scope">نطاق المشروع</Label>
                            <Textarea
                                id="scope"
                                value={projectInfo.scope}
                                onChange={(e) => handleInputChange('scope', e.target.value)}
                                placeholder="حدد نطاق المشروع - ما سيتم تغطيته وما لن يتم تغطيته..."
                                rows={3}
                                className="text-right"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="methodology">المنهجية والأدوات</Label>
                            <Textarea
                                id="methodology"
                                value={projectInfo.methodology}
                                onChange={(e) => handleInputChange('methodology', e.target.value)}
                                placeholder="اذكر المنهجية المستخدمة، الأدوات، التقنيات، وطرق العمل..."
                                rows={3}
                                className="text-right"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timeline">الجدول الزمني</Label>
                            <Textarea
                                id="timeline"
                                value={projectInfo.timeline}
                                onChange={(e) => handleInputChange('timeline', e.target.value)}
                                placeholder="اذكر المراحل الزمنية للمشروع والمعالم المهمة..."
                                rows={3}
                                className="text-right"
                            />
                        </div>
                    </TabsContent>

                    {/* السياق الإضافي */}
                    <TabsContent value="context" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="additionalInfo">معلومات إضافية</Label>
                            <Textarea
                                id="additionalInfo"
                                value={projectInfo.additionalInfo}
                                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                                placeholder="أي معلومات إضافية تراها مفيدة للتقرير (خلفية نظرية، مراجع، متطلبات خاصة، إلخ)..."
                                rows={4}
                                className="text-right"
                            />
                        </div>

                        {/* اقتراحات السياق */}
                        <div className="space-y-3">
                            <Label>اقتراحات لتحسين السياق:</Label>
                            {suggestedContextTypes.map((suggestion, index) => (
                                <Card key={index} className="p-3 bg-blue-50 dark:bg-blue-950">
                                    <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1">
                                        {suggestion.title}
                                    </h4>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                                        {suggestion.description}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => {
                                            const currentInfo = projectInfo.additionalInfo;
                                            const newInfo = currentInfo +
                                                (currentInfo ? '\n\n' : '') +
                                                `## ${suggestion.title}\n${suggestion.placeholder}`;
                                            handleInputChange('additionalInfo', newInfo);
                                        }}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        إضافة إلى المعلومات
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* أزرار التحكم */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        {completedFields} من {completionFields.length} حقول مكتملة
                    </div>
                    <div className="flex gap-2">
                        {onCancel && (
                            <Button variant="outline" onClick={onCancel}>
                                إلغاء
                            </Button>
                        )}
                        <Button onClick={handleSave} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            حفظ المعلومات
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
