/**
 * Hook مخصص لدمج النظام الذكي مع وضع التقرير
 * يجمع بين وظائف النظام الذكي والنظام التقليدي
 */

import type { SectionName } from '@/ai/schemas/enums';
import { useBuilderStore, useReportModeGenerator } from '@/hooks';
import type { CompleteReportResult, SingleSectionResult } from '@/services/intelligent-report-service';
import { useCallback, useMemo, useState } from 'react';
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

    // تصدير قسم
    const exportSection = useCallback((sectionName: SectionName) => {
        const content = project?.sections?.[sectionName];
        if (content) {
            // منطق التصدير
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${sectionName}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`تم تصدير ${sectionName} بنجاح!`);
        }
    }, [project]);

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

        return {
            total: totalCount,
            intelligent: intelligentCount,
            traditional: traditionalCount,
            averageIntelligentQuality: intelligentQuality,
            hasIntelligentSections: intelligentCount > 0,
            hasTraditionalSections: traditionalCount > 0
        };
    }, [allGeneratedSections, intelligentSections, traditionalReport.generatedSections, sectionMetadata]);

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
        previewSection,

        // معلومات إضافية
        isGenerating: traditionalReport.isAnythingGenerating,
        project
    };
}
