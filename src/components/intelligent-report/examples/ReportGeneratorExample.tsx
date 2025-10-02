/**
 * مثال شامل لاستخدام مولد التقارير الذكي
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompleteReportResult, SingleSectionResult } from '@/services/intelligent-report-service';
import {
    Brain,
    Download,
    Eye,
    FileText,
    Settings,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { IntelligentReportGenerator } from '../IntelligentReportGenerator';

export function ReportGeneratorExample() {
    const [generatedReport, setGeneratedReport] = useState<SingleSectionResult | CompleteReportResult | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    // بيانات مثال للمشروع
    const mockProposal = {
        projectTitle: "نظام إدارة المكتبة الذكي",
        projectDescription: "نظام شامل لإدارة المكتبة باستخدام الذكاء الاصطناعي لتحسين تجربة المستخدم وتبسيط العمليات الإدارية",
        objectives: [
            "رقمنة جميع عمليات المكتبة (الإعارة، الإرجاع، الفهرسة)",
            "تطوير نظام بحث ذكي يستخدم معالجة اللغة الطبيعية",
            "إنشاء نظام توصيات شخصي للمستخدمين",
            "تحسين كفاءة إدارة المخزون والموارد",
            "توفير واجهة مستخدم سهلة ومتجاوبة"
        ],
        targetAudience: "الطلاب، أعضاء هيئة التدريس، الباحثون، موظفو المكتبة",
        scope: "يشمل النظام إدارة المستخدمين، فهرسة الكتب، نظام الإعارة والإرجاع، البحث الذكي، التوصيات الشخصية، والتقارير الإدارية. لا يشمل إدارة المخزون المادي للمكتبة.",
        methodology: "Agile Scrum مع دورات تطوير مدتها أسبوعين",
        timeline: "6 أشهر موزعة على 4 مراحل رئيسية",
        budget: {
            total: 250000,
            currency: "SAR",
            breakdown: {
                development: 150000,
                design: 50000,
                testing: 30000,
                deployment: 20000
            }
        },
        stakeholders: [
            "إدارة المكتبة الجامعية",
            "قسم تقنية المعلومات",
            "الطلاب وأعضاء هيئة التدريس",
            "موظفو المكتبة"
        ],
        risks: [
            "مقاومة التغيير من الموظفين",
            "تحديات تكامل البيانات القديمة",
            "قيود الميزانية والوقت",
            "متطلبات أمن البيانات الصارمة"
        ],
        team: [
            { role: "مدير مشروع", count: 1, experience: "5+ سنوات" },
            { role: "محلل نظم", count: 1, experience: "3+ سنوات" },
            { role: "مطور واجهة أمامية", count: 2, experience: "2+ سنوات" },
            { role: "مطور واجهة خلفية", count: 2, experience: "3+ سنوات" },
            { role: "مهندس ذكاء اصطناعي", count: 1, experience: "4+ سنوات" },
            { role: "مختبر جودة", count: 1, experience: "2+ سنوات" },
            { role: "مصمم UI/UX", count: 1, experience: "3+ سنوات" }
        ]
    };

    const mockProjectPlan = {
        phases: [
            {
                phaseName: "التحليل والتخطيط",
                duration: "4 أسابيع",
                tasks: [
                    {
                        status: "Done" as const,
                        title: "جمع وتحليل المتطلبات",
                        description: "اجتماعات مع أصحاب المصلحة وتحليل الاحتياجات",
                        acceptanceCriteria: ["وثيقة متطلبات معتمدة", "مصفوفة أصحاب المصلحة"]
                    },
                    {
                        status: "Done" as const,
                        title: "دراسة الجدوى التقنية والاقتصادية",
                        description: "تقييم الحلول التقنية المتاحة والتكاليف",
                        acceptanceCriteria: ["تقرير جدوى مكتمل", "مقارنة التقنيات"]
                    },
                    {
                        status: "In Progress" as const,
                        title: "تصميم المعمارية العامة",
                        description: "تصميم الهيكل العام للنظام والتقنيات المستخدمة",
                        acceptanceCriteria: ["مخطط معمارية معتمد", "اختيار التقنيات"]
                    }
                ]
            },
            {
                phaseName: "التصميم والنمذجة",
                duration: "6 أسابيع",
                tasks: [
                    {
                        status: "To Do" as const,
                        title: "تصميم قاعدة البيانات",
                        description: "تصميم مخططات ERD وهيكل قاعدة البيانات",
                        acceptanceCriteria: ["مخطط قاعدة بيانات معتمد", "قاموس البيانات"]
                    },
                    {
                        status: "To Do" as const,
                        title: "تصميم واجهة المستخدم",
                        description: "إنشاء نماذج أولية وتصاميم تفاعلية",
                        acceptanceCriteria: ["نماذج أولية معتمدة", "دليل التصميم"]
                    },
                    {
                        status: "To Do" as const,
                        title: "تصميم APIs والخدمات",
                        description: "تحديد واجهات البرمجة والخدمات المطلوبة",
                        acceptanceCriteria: ["وثائق API", "مخططات التكامل"]
                    }
                ]
            },
            {
                phaseName: "التطوير والبرمجة",
                duration: "12 أسبوع",
                tasks: [
                    {
                        status: "To Do" as const,
                        title: "تطوير الواجهة الخلفية",
                        description: "بناء APIs وقاعدة البيانات والخدمات الأساسية",
                        acceptanceCriteria: ["APIs تعمل بكفاءة", "قاعدة بيانات مُحسنة"]
                    },
                    {
                        status: "To Do" as const,
                        title: "تطوير الواجهة الأمامية",
                        description: "بناء واجهة المستخدم التفاعلية",
                        acceptanceCriteria: ["واجهة مستخدم متكاملة", "تجربة مستخدم محسنة"]
                    },
                    {
                        status: "To Do" as const,
                        title: "تطوير نظام الذكاء الاصطناعي",
                        description: "تطوير خوارزميات البحث والتوصيات",
                        acceptanceCriteria: ["نظام بحث ذكي", "محرك توصيات فعال"]
                    }
                ]
            },
            {
                phaseName: "الاختبار والنشر",
                duration: "4 أسابيع",
                tasks: [
                    {
                        status: "To Do" as const,
                        title: "اختبار النظام الشامل",
                        description: "اختبارات وظيفية وغير وظيفية شاملة",
                        acceptanceCriteria: ["تقرير اختبارات شامل", "معدل نجاح 95%+"]
                    },
                    {
                        status: "To Do" as const,
                        title: "النشر والتدريب",
                        description: "نشر النظام وتدريب المستخدمين",
                        acceptanceCriteria: ["النظام يعمل في الإنتاج", "المستخدمون مدربون"]
                    }
                ]
            }
        ]
    };

    const handleReportGenerated = (result: SingleSectionResult | CompleteReportResult) => {
        setGeneratedReport(result);
        console.log('تم توليد التقرير:', result);
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handleDownload = () => {
        if (!generatedReport) return;

        // محاكاة تحميل التقرير
        const content = 'singleSection' in generatedReport
            ? generatedReport.content
            : Object.values(generatedReport.generatedSections).join('\n\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'intelligent-report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* رأس الصفحة */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <Brain className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">مولد التقارير الذكي</CardTitle>
                                <p className="text-muted-foreground">
                                    مثال تفاعلي لاستخدام النظام الذكي لتوليد التقارير المهنية
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="default" className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                نظام ذكي
                            </Badge>
                            <Badge variant="outline">مثال تفاعلي</Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* المحتوى الرئيسي */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* مولد التقارير */}
                <div className="xl:col-span-3">
                    <IntelligentReportGenerator
                        initialProposal={mockProposal}
                        initialProjectPlan={mockProjectPlan}
                        onReportGenerated={handleReportGenerated}
                    />
                </div>

                {/* لوحة النتائج */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                النتائج
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {generatedReport ? (
                                <div className="space-y-3">
                                    <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                تم التوليد بنجاح
                                            </span>
                                        </div>
                                        <div className="text-xs text-green-600 dark:text-green-400">
                                            {'singleSection' in generatedReport
                                                ? `قسم: ${generatedReport.sectionName}`
                                                : `${Object.keys(generatedReport.generatedSections).length} أقسام`
                                            }
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePreview}
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

                                    {/* معلومات الأداء */}
                                    <div className="pt-3 border-t space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">وقت التنفيذ:</span>
                                            <span className="font-medium">
                                                {generatedReport.metadata?.executionTime || 0}ms
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">التكلفة:</span>
                                            <span className="font-medium">
                                                {generatedReport.metadata?.creditCost || 0} رصيد
                                            </span>
                                        </div>
                                        {'completeReport' in generatedReport && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">متوسط الجودة:</span>
                                                <span className="font-medium text-green-600">
                                                    {generatedReport.overallMetrics.averageQuality.toFixed(1)}/100
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">لم يتم توليد أي تقرير بعد</p>
                                    <p className="text-xs">ابدأ بتوليد قسم أو تقرير كامل</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* معلومات المشروع المثال */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Settings className="h-5 w-5" />
                                بيانات المشروع المثال
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm font-medium mb-1">عنوان المشروع</div>
                                <div className="text-xs text-muted-foreground">
                                    {mockProposal.projectTitle}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">المدة الزمنية</div>
                                <div className="text-xs text-muted-foreground">
                                    {mockProposal.timeline}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">الميزانية</div>
                                <div className="text-xs text-muted-foreground">
                                    {mockProposal.budget.total.toLocaleString()} {mockProposal.budget.currency}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">المنهجية</div>
                                <div className="text-xs text-muted-foreground">
                                    {mockProposal.methodology}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* نافذة المعاينة */}
            {showPreview && generatedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>معاينة التقرير</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreview(false)}
                            >
                                إغلاق
                            </Button>
                        </CardHeader>
                        <CardContent className="overflow-y-auto max-h-[60vh]">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                {'singleSection' in generatedReport ? (
                                    <div>
                                        <h2>{generatedReport.sectionName}</h2>
                                        <div className="whitespace-pre-wrap">
                                            {generatedReport.content}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(generatedReport.generatedSections).map(([section, content]) => (
                                            <div key={section}>
                                                <h2 className="border-b pb-2">{section}</h2>
                                                <div className="whitespace-pre-wrap">
                                                    {content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
