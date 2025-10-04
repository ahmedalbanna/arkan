/**
 * مثال محسن لتطبيق نظام Loading States الجديد على مكون AIResearcherTool
 * يوضح كيفية تحسين تجربة المستخدم باستخدام النظام الجديد
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks';
import { exportComponentAsPDF } from '@/lib/pdf-exporter';
import { CheckCircle, Copy, FileDown, FileText, PlusCircle, Sparkles } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';

// استخدام النظام الجديد للـ Loading States
import {
    LoadingWrapper,
    useAsyncOperation
} from '@/components/ui';

// استخدام النظام الجديد في Dialog
function AddToProjectDialogEnhanced({
    researchMarkdown,
    researchTitle,
    onOpenChange
}: {
    researchMarkdown: string;
    researchTitle: string;
    onOpenChange: (open: boolean) => void;
}) {
    const { toast } = useToast();

    // استخدام hook للعمليات غير المتزامنة
    const { execute: executeProjectsFetch, isLoading: isLoadingProjects } = useAsyncOperation(
        'fetch-projects',
        {
            loadingMessage: 'جاري تحميل المشاريع...',
            successMessage: 'تم تحميل المشاريع',
            errorMessage: 'فشل في تحميل المشاريع',
        }
    );

    const { execute: executeAddToProject, isLoading: isLoadingAddToProject } = useAsyncOperation(
        'add-to-project',
        {
            loadingMessage: 'جاري إضافة البحث للمشروع...',
            successMessage: 'تم إضافة البحث للمشروع بنجاح',
            errorMessage: 'فشل في إضافة البحث للمشروع',
        }
    );

    // محاكاة تحميل المشاريع
    const [projects] = React.useState([
        { id: '1', name: 'مشروع البحث اليومي' },
        { id: '2', name: 'أبحاث الذكاء الاصطناعي' },
        { id: '3', name: 'دراسات تقنية' },
    ]);

    const [projectsLoaded, setProjectsLoaded] = React.useState(false);

    React.useEffect(() => {
        if (!projectsLoaded) {
            executeProjectsFetch(async () => {
                // محاكاة طلب API
                await new Promise(resolve => setTimeout(resolve, 1000));
                setProjectsLoaded(true);
                return projects;
            });
        }
    }, [projectsLoaded, executeProjectsFetch, projects]);

    const handleSelectProject = async (projectId: string) => {
        try {
            await executeAddToProject(async () => {
                // محاكاة إضافة البحث للمشروع
                await new Promise(resolve => setTimeout(resolve, 1500));

                toast({
                    title: 'نجح العمل',
                    description: `تمت إضافة البحث "${researchTitle}" للمشروع`,
                });

                onOpenChange(false);
            });
        } catch (error) {
            // معالجة الخطأ تتم تلقائياً في hook
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>إضافة البحث لمشروع</DialogTitle>
                <DialogDescription>
                    اختر المشروع الذي تريد إضافة البحث إليه
                </DialogDescription>
            </DialogHeader>

            <div className="max-h-96 overflow-y-auto">
                {/* استخدام LoadingWrapper مع Skeleton للتحميل */}
                <LoadingWrapper
                    loadingKey="fetch-projects"
                    variant="skeleton"
                >
                    <div className="space-y-2">
                        {projects?.map(project => (
                            <div key={project.id}>
                                <LoadingWrapper
                                    loadingKey={`add-to-project-${project.id}`}
                                    variant="spinner"
                                    delay={300}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => handleSelectProject(project.id)}
                                        disabled={isLoadingAddToProject}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        {project.name}
                                    </Button>
                                </LoadingWrapper>
                            </div>
                        ))}
                    </div>
                </LoadingWrapper>
            </div>
        </DialogContent>
    );
}

export function AIResearcherToolEnhanced() {
    const { toast } = useToast();

    // استخدام النظام الجديد للعمليات الرئيسية
    const { execute: executeResearch, isLoading: isResearching } = useAsyncOperation(
        'ai-research',
        {
            loadingMessage: 'جاري البحث العلمي بالذكاء الاصطناعي...',
            successMessage: 'تم انتهاء البحث سليم',
            errorMessage: 'فشل في البحث، يرجى المحاولة مرة أخرى',
            timeout: 30000, // مهلة 30 ثانية
            hasCancelOption: true,
        }
    );

    const [topic, setTopic] = React.useState('');
    const [results, setResults] = React.useState('');
    const [markdownResult, setMarkdownResult] = React.useState('');
    const reportRef = React.useRef<HTMLDivElement>(null);
    const [isCopied, setIsCopied] = React.useState(false);
    const [isAddToProjectOpen, setIsAddToProjectOpen] = React.useState(false);

    // محاكاة البحث
    const handleResearch = async () => {
        if (!topic.trim()) {
            toast({
                title: 'خطأ في المدخلات',
                description: 'يرجى إدخال موضوع البحث',
                variant: 'destructive',
            });
            return;
        }

        try {
            const researchResult = await executeResearch(async () => {
                // محاكاة البحث
                await new Promise(resolve => setTimeout(resolve, 3000));

                const markdown = `# تقرير البحث: ${topic}

## ملخص البحث
تم إجراء بحث شامل حول **${topic}** باستخدام أحدث تقنيات الذكاء الاصطناعي.

### النتائج الرئيسية
1. **نتيجة أولى**: شرح مفصل عن أول نتيجة مهمة
2. **نتيجة ثانية**: تفاصيل حول النتيجة الثانتة
3. **نتيجة ثالثة**: معلومات إضافية حول الموضوع

### التحليل المفصل
هذا القسم يحتوي على تحليل مفصل للموضوع مع إشارات لأهم المصادر والمراجع.

### التوصيات
بناءً على النتائج، نوصي بـ:
- تطبيق النتائج في المجال العملي
- إجراء دراسات إضافية في المجالات ذات الصلة
- تطوير أدوات جديدة بناءً على البحث

---
*تم إنتاج هذا التقرير باستخدام نظام Arkan للذكاء الاصطناعي*`;

                return { topic, markdown };
            });

            setResults(researchResult.topic);
            setMarkdownResult(researchResult.markdown);
        } catch (error) {
            // تم معالجة الخطأ في hook
        }
    };

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(markdownResult);
            setIsCopied(true);
            toast({
                title: 'تم النسخ',
                description: 'تم نسخ النتائج للذاكرة المؤقتة',
            });

            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            toast({
                title: 'فشل النسخ',
                description: 'فشل في نسخ النتائج',
                variant: 'destructive',
            });
        }
    };

    const handleExportPdf = () => {
        if (reportRef.current) {
            exportComponentAsPDF(reportRef.current, 'ai_research_report.pdf');
            toast({
                title: 'تم التصدير',
                description: 'تم تصدير التقرير كـ PDF',
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>باحث الذكاء الاصطناعي المحسن</CardTitle>
                <CardDescription>
                    نظام بحث ذكي مدعوم بالذكاء الاصطناعي مع تجربة تحميل محسنة
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <form onSubmit={(e) => { e.preventDefault(); handleResearch(); }} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="research-topic">موضوع البحث</Label>
                        <Input
                            id="research-topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="أدخل موضوع البحث المطلوب..."
                            disabled={isResearching}
                        />
                    </div>

                    <LoadingWrapper
                        loadingKey="ai-research"
                        variant="spinner"
                        size="lg"
                        showLabel
                    >
                        <Button type="submit" disabled={isResearching} className="w-full">
                            <Sparkles className="mr-2 h-4 w-4" />
                            بدء البحث الذكي
                        </Button>
                    </LoadingWrapper>
                </form>

                {/* عرض النتائج مع LoadingWrapper */}
                {results && (
                    <div className="space-y-4 pt-6 border-t">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                تقرير البحث المولد
                            </h3>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                                    {isCopied ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                                    نسخ النتائج
                                </Button>
                                <Dialog open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            إضافة لمشروع
                                        </Button>
                                    </DialogTrigger>
                                    <AddToProjectDialogEnhanced
                                        researchMarkdown={markdownResult}
                                        researchTitle={topic}
                                        onOpenChange={setIsAddToProjectOpen}
                                    />
                                </Dialog>
                            </div>
                        </div>

                        <ScrollArea className="h-[60vh] rounded-md border">
                            <div className="prose dark:prose-invert max-w-none p-6" ref={reportRef}>
                                <ReactMarkdown>{markdownResult}</ReactMarkdown>
                            </div>
                        </ScrollArea>

                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={handleExportPdf}>
                                <FileDown className="mr-2 h-4 w-4" />
                                تصدير PDF
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default AIResearcherToolEnhanced;
