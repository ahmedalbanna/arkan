/**
 * مكون معاينة أقسام المقترح
 * يعرض القسم المولد مع خيارات التحرير والتحميل
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { type ProposalSectionResult } from '@/services/intelligent-proposal-service';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Copy,
    Download,
    Edit3,
    Eye,
    FileText,
    Share,
    Target,
    Zap
} from 'lucide-react';
import { useState } from 'react';

interface ProposalSectionPreviewProps {
    section: ProposalSectionResult;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (content: string) => void;
    onRegenerate?: () => void;
}

export function ProposalSectionPreview({
    section,
    isOpen,
    onClose,
    onEdit,
    onRegenerate
}: ProposalSectionPreviewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(section.content);

    const handleSaveEdit = () => {
        onEdit?.(editedContent);
        setIsEditing(false);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(section.content);
            // يمكن إضافة toast notification هنا
        } catch (error) {
            console.error('فشل في نسخ المحتوى:', error);
        }
    };

    const handleDownload = () => {
        const content = `# ${section.title}

${section.content}

---
معلومات التوليد:
- الجودة: ${section.qualityScore}/100
- عدد الكلمات: ${section.wordCount}
- وقت التوليد: ${section.metadata.executionTime}ms
- التكرارات: ${section.metadata.iterations}
`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${section.title.replace(/\s+/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getQualityColor = (score: number) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getQualityBadge = (score: number) => {
        if (score >= 85) return { variant: 'default' as const, label: 'ممتاز', color: 'bg-green-500' };
        if (score >= 70) return { variant: 'secondary' as const, label: 'جيد', color: 'bg-yellow-500' };
        return { variant: 'destructive' as const, label: 'يحتاج تحسين', color: 'bg-red-500' };
    };

    const qualityBadge = getQualityBadge(section.qualityScore);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">{section.title}</DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    معاينة القسم المولد
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={qualityBadge.variant} className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${qualityBadge.color}`}></div>
                                {qualityBadge.label}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {section.qualityScore}/100
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="content" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            المحتوى
                        </TabsTrigger>
                        <TabsTrigger value="edit" className="flex items-center gap-2">
                            <Edit3 className="h-4 w-4" />
                            تحرير
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            الإحصائيات
                        </TabsTrigger>
                    </TabsList>

                    {/* عرض المحتوى */}
                    <TabsContent value="content" className="flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto">
                            <div className="prose max-w-none p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                    {section.content}
                                </pre>
                            </div>
                        </div>
                    </TabsContent>

                    {/* تحرير المحتوى */}
                    <TabsContent value="edit" className="flex-1 overflow-hidden">
                        <div className="h-full flex flex-col gap-4">
                            <Textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="flex-1 resize-none font-mono text-sm"
                                placeholder="اكتب أو عدل المحتوى هنا..."
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSaveEdit}
                                    disabled={editedContent === section.content}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    حفظ التعديلات
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditedContent(section.content);
                                        setIsEditing(false);
                                    }}
                                >
                                    إلغاء
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* الإحصائيات والتحليل */}
                    <TabsContent value="stats" className="flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto space-y-6 p-4">
                            {/* إحصائيات أساسية */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{section.wordCount}</div>
                                    <div className="text-sm text-muted-foreground">كلمة</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                                    <div className={`text-2xl font-bold ${getQualityColor(section.qualityScore)}`}>
                                        {section.qualityScore}
                                    </div>
                                    <div className="text-sm text-muted-foreground">نقاط الجودة</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{section.metadata.executionTime}</div>
                                    <div className="text-sm text-muted-foreground">مللي ثانية</div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">{section.metadata.iterations}</div>
                                    <div className="text-sm text-muted-foreground">تكرار</div>
                                </div>
                            </div>

                            {/* تفاصيل الجودة */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">تحليل الجودة</h3>
                                <div className="space-y-3">
                                    {(section.metadata as any).qualityMetrics && Object.entries((section.metadata as any).qualityMetrics).map(([metric, score]: [string, any]) => (
                                        <div key={metric} className="flex items-center justify-between">
                                            <span className="text-sm capitalize">
                                                {metric === 'coherence' ? 'التماسك' :
                                                    metric === 'completeness' ? 'الاكتمال' :
                                                        metric === 'relevance' ? 'الصلة' :
                                                            metric === 'clarity' ? 'الوضوح' : metric}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${(score as number) >= 80 ? 'bg-green-500' :
                                                            (score as number) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${score as number}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium w-8">{score as number}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* التوصيات */}
                            {section.suggestions.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">توصيات للتحسين</h3>
                                    <ul className="space-y-2">
                                        {section.suggestions.map((suggestion, index) => (
                                            <li key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                                                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">{suggestion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* معلومات النموذج */}
                            {section.metadata.modelUsed && (
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">معلومات التوليد</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">النموذج المستخدم:</span>
                                            <span className="font-medium">{section.metadata.modelUsed}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">وقت التوليد:</span>
                                            <span className="font-medium">{section.metadata.executionTime}ms</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">عدد التكرارات:</span>
                                            <span className="font-medium">{section.metadata.iterations}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">حالة التحسين:</span>
                                            <span className="font-medium">
                                                {(section.metadata as any).improvedFromOriginal ? 'محسن' : 'أصلي'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* أزرار الإجراءات */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="flex items-center gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            نسخ
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            تحميل
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // يمكن إضافة وظيفة المشاركة هنا
                            }}
                            className="flex items-center gap-2"
                        >
                            <Share className="h-4 w-4" />
                            مشاركة
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        {onRegenerate && (
                            <Button
                                variant="outline"
                                onClick={onRegenerate}
                                className="flex items-center gap-2"
                            >
                                <Zap className="h-4 w-4" />
                                إعادة توليد
                            </Button>
                        )}
                        <Button onClick={onClose}>
                            إغلاق
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
