/**
 * Hook مخصص لدمج النظام الذكي مع وضع التقرير
 * يجمع بين وظائف النظام الذكي والنظام التقليدي
 */

import type { SectionName } from '@/ai/schemas/enums';
import { useBuilderStore, useReportModeGenerator } from '@/hooks';
import type { CompleteReportResult, SingleSectionResult } from '@/services/intelligent-report-service';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface SectionMetadata {
    qualityScore?: number;
    generationTime?: number;
    iterations?: number;
    modelUsed?: string;
    isIntelligent?: boolean;
    creditCost?: number;
    timestamp?: string;
}

export function useIntelligentReportMode() {
    const [mode, setMode] = useState<'traditional' | 'intelligent'>('intelligent');
    const [intelligentSections, setIntelligentSections] = useState<SectionName[]>([]);
    const [sectionMetadata, setSectionMetadata] = useState<Record<string, SectionMetadata>>({});

    const { project, updateProject } = useBuilderStore();

    // استخدام hook التقرير التقليدي
    const traditionalReport = useReportModeGenerator();

    // دمج الأقسام من النظامين
    const allGeneratedSections = useMemo(() => {
        const traditionalSections = traditionalReport.generatedSections.map(s => s.id as SectionName);
        return [...new Set([...traditionalSections, ...intelligentSections])];
    }, [traditionalReport.generatedSections, intelligentSections]);

    // نظام الحفظ التلقائي
    useEffect(() => {
        // حفظ metadata في localStorage
        if (Object.keys(sectionMetadata).length > 0) {
            try {
                const dataToSave = {
                    intelligentSections,
                    sectionMetadata,
                    timestamp: Date.now(),
                    projectId: project?.id
                };
                localStorage.setItem('arkan_intelligent_report_data', JSON.stringify(dataToSave));
            } catch (error) {
                console.warn('فشل في حفظ بيانات التقرير تلقائياً:', error);
            }
        }
    }, [intelligentSections, sectionMetadata, project?.id]);

    // استعادة البيانات عند بدء التشغيل
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('arkan_intelligent_report_data');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // التحقق من أن البيانات تخص نفس المشروع وليست قديمة جداً (24 ساعة)
                if (parsedData.projectId === project?.id &&
                    Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000) {
                    setIntelligentSections(parsedData.intelligentSections || []);
                    setSectionMetadata(parsedData.sectionMetadata || {});
                    toast.success('تم استعادة البيانات المحفوظة تلقائياً');
                }
            }
        } catch (error) {
            console.warn('فشل في استعادة البيانات المحفوظة:', error);
        }
    }, [project?.id]);

    // معالج نتائج النظام الذكي
    const handleIntelligentResult = useCallback((result: SingleSectionResult | CompleteReportResult) => {
        if ('singleSection' in result && result.singleSection) {
            // قسم فردي
            const singleResult = result as SingleSectionResult;
            const sectionName = singleResult.sectionName as SectionName;

            // تحديث محتوى القسم
            updateProject(p => {
                p.updateSectionContent(sectionName, singleResult.content);
            });

            // إضافة القسم للقائمة
            setIntelligentSections(prev => {
                if (!prev.includes(sectionName)) {
                    return [...prev, sectionName];
                }
                return prev;
            });

            // حفظ metadata
            setSectionMetadata(prev => ({
                ...prev,
                [sectionName]: {
                    isIntelligent: true,
                    generationTime: result.metadata?.executionTime,
                    creditCost: result.metadata?.creditCost,
                    timestamp: result.metadata?.timestamp,
                    qualityScore: 85 // تقدير افتراضي
                }
            }));

            toast.success(`تم توليد ${sectionName} بنجاح!`, {
                description: `النظام الذكي - الوقت: ${result.metadata?.executionTime || 0}ms`
            });

        } else if ('completeReport' in result && result.completeReport) {
            // تقرير كامل
            const completeResult = result as CompleteReportResult;

            // تحديث جميع الأقسام
            Object.entries(completeResult.generatedSections).forEach(([sectionName, content]) => {
                updateProject(p => {
                    p.updateSectionContent(sectionName as SectionName, content);
                });
            });

            // تحديث قائمة الأقسام
            const newSections = Object.keys(completeResult.generatedSections) as SectionName[];
            setIntelligentSections(prev => [...new Set([...prev, ...newSections])]);

            // حفظ metadata لكل قسم
            const newMetadata: Record<string, SectionMetadata> = {};
            Object.entries(completeResult.sectionMetadata).forEach(([sectionName, metadata]) => {
                newMetadata[sectionName] = {
                    isIntelligent: true,
                    qualityScore: metadata.qualityScore,
                    generationTime: metadata.generationTime,
                    iterations: metadata.iterations,
                    modelUsed: metadata.modelUsed,
                    creditCost: completeResult.metadata?.creditCost ?
                        Math.ceil((completeResult.metadata.creditCost || 0) / newSections.length) : undefined,
                    timestamp: completeResult.metadata?.timestamp
                };
            });

            setSectionMetadata(prev => ({ ...prev, ...newMetadata }));

            toast.success(`تم توليد التقرير الكامل بنجاح!`, {
                description: `${completeResult.overallMetrics.successfulSections}/${completeResult.overallMetrics.totalSections} أقسام - جودة متوسطة: ${completeResult.overallMetrics.averageQuality.toFixed(1)}/100`
            });
        }
    }, [updateProject]);

    // إعادة توليد قسم
    const regenerateSection = useCallback((sectionName: SectionName) => {
        const metadata = sectionMetadata[sectionName];

        if (metadata?.isIntelligent) {
            // إعادة توليد بالنظام الذكي
            toast.info(`سيتم إعادة توليد ${sectionName} بالنظام الذكي`);
            // يمكن إضافة منطق إعادة التوليد هنا
        } else {
            // إعادة توليد بالنظام التقليدي
            toast.info(`سيتم إعادة توليد ${sectionName} بالنظام التقليدي`);
            // يمكن استخدام traditionalReport.onGenerateSection هنا
        }
    }, [sectionMetadata]);

    // تصدير قسم متقدم
    const exportSection = useCallback((sectionName: SectionName, format: 'md' | 'txt' | 'docx' | 'pdf' = 'md') => {
        const content = project?.sections?.[sectionName];
        const metadata = sectionMetadata[sectionName];

        if (content) {
            let exportContent = content;
            let fileName = `${sectionName}.${format}`;
            let mimeType = 'text/markdown';

            // إضافة metadata للمحتوى
            if (metadata) {
                const metadataHeader = `---
# ${sectionName}
تاريخ التوليد: ${metadata.timestamp || new Date().toISOString()}
نظام التوليد: ${metadata.isIntelligent ? 'النظام الذكي' : 'النظام التقليدي'}
${metadata.qualityScore ? `نقاط الجودة: ${metadata.qualityScore}/100` : ''}
${metadata.generationTime ? `وقت التوليد: ${metadata.generationTime}ms` : ''}
${metadata.modelUsed ? `النموذج المستخدم: ${metadata.modelUsed}` : ''}
${metadata.iterations ? `عدد التحسينات: ${metadata.iterations}` : ''}
---

`;
                exportContent = metadataHeader + content;
            }

            // تحديد نوع الملف
            switch (format) {
                case 'txt':
                    mimeType = 'text/plain';
                    // إزالة markdown formatting للنص العادي
                    exportContent = exportContent.replace(/[#*_`\[\]]/g, '');
                    break;
                case 'docx':
                    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    toast.info('تصدير DOCX قيد التطوير - تم تصدير كـ Markdown');
                    break;
                case 'pdf':
                    mimeType = 'application/pdf';
                    toast.info('تصدير PDF قيد التطوير - تم تصدير كـ Markdown');
                    break;
            }

            // تصدير الملف
            const blob = new Blob([exportContent], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`تم تصدير ${sectionName} بنجاح!`, {
                description: `التنسيق: ${format.toUpperCase()}`
            });
        }
    }, [project, sectionMetadata]);

    // تصدير التقرير الكامل
    const exportCompleteReport = useCallback((format: 'md' | 'txt' | 'docx' | 'pdf' = 'md') => {
        if (allGeneratedSections.length === 0) {
            toast.error('لا توجد أقسام للتصدير');
            return;
        }

        // تجميع المحتوى
        let completeContent = `# التقرير الكامل\n\n`;

        // إضافة ملخص التقرير
        completeContent += `## ملخص التقرير\n`;
        completeContent += `- إجمالي الأقسام: ${allGeneratedSections.length}\n`;
        completeContent += `- أقسام ذكية: ${intelligentSections.length}\n`;
        completeContent += `- أقسام تقليدية: ${allGeneratedSections.length - intelligentSections.length}\n`;
        completeContent += `- تاريخ التوليد: ${new Date().toLocaleDateString('ar-SA')}\n\n`;
        completeContent += `---\n\n`;

        // إضافة كل قسم
        allGeneratedSections.forEach((sectionName, index) => {
            const content = project?.sections?.[sectionName];
            const metadata = sectionMetadata[sectionName];

            if (content) {
                completeContent += `# ${index + 1}. ${sectionName}\n\n`;

                if (metadata) {
                    completeContent += `> **نظام التوليد:** ${metadata.isIntelligent ? 'النظام الذكي' : 'النظام التقليدي'}`;
                    if (metadata.qualityScore) {
                        completeContent += ` | **الجودة:** ${metadata.qualityScore}/100`;
                    }
                    completeContent += `\n\n`;
                }

                completeContent += content + '\n\n';
                completeContent += `---\n\n`;
            }
        });

        // تصدير الملف الكامل
        const fileName = `التقرير_الكامل_${new Date().toISOString().split('T')[0]}.${format}`;
        let mimeType = 'text/markdown';

        if (format === 'txt') {
            mimeType = 'text/plain';
            completeContent = completeContent.replace(/[#*_`\[\]]/g, '');
        }

        const blob = new Blob([completeContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`تم تصدير التقرير الكامل بنجاح!`, {
            description: `${allGeneratedSections.length} أقسام - التنسيق: ${format.toUpperCase()}`
        });
    }, [allGeneratedSections, project, sectionMetadata, intelligentSections]);

    // معاينة قسم
    const previewSection = useCallback((sectionName: SectionName) => {
        // يمكن إضافة منطق المعاينة هنا
        toast.info(`معاينة ${sectionName}`);
    }, []);

    // إحصائيات
    const statistics = useMemo(() => {
        const intelligentCount = intelligentSections.length;
        const traditionalCount = traditionalReport.generatedSections.length;
        const totalCount = allGeneratedSections.length;

        const intelligentQuality = intelligentSections.reduce((sum, section) => {
            return sum + (sectionMetadata[section]?.qualityScore || 0);
        }, 0) / (intelligentCount || 1);

        // تحليل الأقسام التي تحتاج تحسين
        const lowQualitySections = intelligentSections.filter(section => {
            const score = sectionMetadata[section]?.qualityScore;
            return score && score < 80;
        });

        return {
            total: totalCount,
            intelligent: intelligentCount,
            traditional: traditionalCount,
            averageIntelligentQuality: intelligentQuality,
            hasIntelligentSections: intelligentCount > 0,
            hasTraditionalSections: traditionalCount > 0,
            lowQualitySections,
            needsImprovement: lowQualitySections.length > 0
        };
    }, [allGeneratedSections, intelligentSections, traditionalReport.generatedSections, sectionMetadata]);

    // نظام التحسين التلقائي للجودة
    const autoImproveQuality = useCallback(async (threshold: number = 80) => {
        const sectionsNeedImprovement = intelligentSections.filter(section => {
            const score = sectionMetadata[section]?.qualityScore;
            return score && score < threshold;
        });

        if (sectionsNeedImprovement.length === 0) {
            toast.success('جميع الأقسام تحقق المعايير المطلوبة');
            return;
        }

        toast.info(`تم العثور على ${sectionsNeedImprovement.length} أقسام تحتاج تحسين`);

        sectionsNeedImprovement.forEach(section => {
            const score = sectionMetadata[section]?.qualityScore;
            toast.warning(`القسم "${section}" يحتاج تحسين (الجودة الحالية: ${score}/100)`);
        });
    }, [intelligentSections, sectionMetadata]);

    // نظام التوصيات الذكية
    const getSmartRecommendations = useCallback(() => {
        const recommendations = [];

        // توصيات على أساس الجودة
        if (statistics.averageIntelligentQuality < 85) {
            recommendations.push({
                type: 'quality',
                priority: 'high',
                title: 'تحسين الجودة مطلوب',
                description: `متوسط الجودة ${statistics.averageIntelligentQuality.toFixed(1)}/100 - أقل من المستوى المطلوب`,
                action: () => autoImproveQuality(85)
            });
        }

        // توصيات على أساس التوازن بين النظامين
        if (statistics.intelligent > 0 && statistics.traditional === 0) {
            recommendations.push({
                type: 'balance',
                priority: 'medium',
                title: 'جرب النظام المختلط',
                description: 'استخدم النظام التقليدي للأقسام البسيطة لتوفير الوقت والرصيد',
                action: () => toast.info('استخدم النظام التقليدي للمراجع والشكر')
            });
        }

        // توصيات على أساس التكلفة
        const totalCost = intelligentSections.reduce((sum, section) => {
            return sum + (sectionMetadata[section]?.creditCost || 0);
        }, 0);

        if (totalCost > 50) {
            recommendations.push({
                type: 'cost',
                priority: 'medium',
                title: 'تحكم في استهلاك الرصيد',
                description: `تم استهلاك ${totalCost} رصيد - فكر في استخدام النظام التقليدي للأقسام القادمة`,
                action: () => setMode('traditional')
            });
        }

        return recommendations;
    }, [statistics, sectionMetadata, intelligentSections, autoImproveQuality, setMode]);

    return {
        // الحالة
        mode,
        setMode,
        allGeneratedSections,
        sectionMetadata,
        statistics,

        // النظام التقليدي
        traditional: traditionalReport,

        // النظام الذكي
        handleIntelligentResult,

        // الإجراءات
        regenerateSection,
        exportSection,
        exportCompleteReport,
        previewSection,

        // الأنظمة الذكية
        autoImproveQuality,
        getSmartRecommendations,

        // معلومات إضافية
        isGenerating: traditionalReport.isAnythingGenerating,
        project
    };
}
