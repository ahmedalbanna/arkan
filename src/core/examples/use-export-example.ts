/**
 * مثال عملي لاستخدام نظام التصدير والقوالب الجديد
 */

import type { AnalyzedDocument, PresentationSlide, ProjectProposal, SolvedDocument } from '@/ai/schemas';
import {
    useAcademicExport,
    useDocxTemplate,
    usePptxTemplate,
    usePresentationExport,
    useProposalExport,
    useReportExport
} from '@/core';

/**
 * مثال شامل لاستخدام نظام التصدير والقوالب
 */
export function useExportExample() {
    // Export Hooks
    const proposalExport = useProposalExport();
    const reportExport = useReportExport();
    const presentationExport = usePresentationExport();
    const academicExport = useAcademicExport();

    // Template Hooks
    const docxTemplate = useDocxTemplate();
    const pptxTemplate = usePptxTemplate();

    // مثال: تصدير مقترح
    const exportProposalExample = async (proposal: ProjectProposal) => {
        try {
            // تصدير كـ PDF
            const pdfResult = await proposalExport.exportProposalAsPdf(proposal, {
                metadata: {
                    title: proposal.title,
                    author: 'Arkan AI',
                    subject: proposal.category,
                }
            });

            if (pdfResult.success) {
                console.log('PDF exported successfully:', pdfResult.fileName);
            }

            // تصدير كـ DOCX
            const docxResult = await proposalExport.exportProposalAsDocx(proposal, {
                templateId: 'modern-proposal-template',
                customStyles: {
                    title: { fontSize: 24, fontWeight: 'bold' },
                    body: { fontSize: 12, lineHeight: 1.5 }
                }
            });

            if (docxResult.success) {
                console.log('DOCX exported successfully:', docxResult.fileName);
            }

        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    // مثال: تصدير تقرير
    const exportReportExample = async (reportData: any) => {
        try {
            const result = await reportExport.exportReportAsDocx(reportData, {
                includeDiagrams: true,
                includeImages: true,
                templateId: 'professional-report-template',
                metadata: {
                    title: reportData.title,
                    author: 'Arkan AI',
                    subject: 'Project Report',
                }
            });

            if (result.success) {
                console.log('Report exported successfully:', result.fileName);
            }

        } catch (error) {
            console.error('Report export failed:', error);
        }
    };

    // مثال: تصدير عرض تقديمي
    const exportPresentationExample = async (slides: PresentationSlide[], title: string) => {
        try {
            const result = await presentationExport.exportPresentationAsPptx({
                slides,
                title,
                author: 'Arkan AI',
                subject: 'Business Presentation',
            }, {
                templateId: 'corporate-presentation-template',
                isRtl: false,
                fonts: {
                    primary: 'Arial',
                    secondary: 'Calibri',
                }
            });

            if (result.success) {
                console.log('Presentation exported successfully:', result.fileName);
            }

        } catch (error) {
            console.error('Presentation export failed:', error);
        }
    };

    // مثال: تصدير حل أكاديمي
    const exportAcademicExample = async (
        analyzedDoc: AnalyzedDocument,
        solvedDoc: SolvedDocument
    ) => {
        try {
            const result = await academicExport.exportAcademicAsDocx({
                analyzedDocument: analyzedDoc,
                solvedDocument: solvedDoc,
                title: analyzedDoc.title,
                subject: analyzedDoc.subject,
            }, {
                templateId: 'academic-solution-template',
                includeSteps: true,
                includeExplanation: true,
            });

            if (result.success) {
                console.log('Academic solution exported successfully:', result.fileName);
            }

        } catch (error) {
            console.error('Academic export failed:', error);
        }
    };

    // مثال: إنشاء قالب DOCX جديد
    const createDocxTemplateExample = async () => {
        try {
            const defaultStyles = docxTemplate.getDefaultDocxStyles();

            const templateId = await docxTemplate.createDocxTemplate(
                'Custom Business Template',
                'A professional template for business documents',
                defaultStyles
            );

            console.log('DOCX template created:', templateId);

            // تحديث نمط العنوان
            docxTemplate.updateDocxStyle(templateId, 'title', {
                fontSize: 28,
                fontWeight: 'bold',
                color: '#1a365d',
                alignment: 'center',
            });

            // تطبيق القالب
            docxTemplate.setActiveTemplate(templateId);

        } catch (error) {
            console.error('Template creation failed:', error);
        }
    };

    // مثال: إنشاء قالب PPTX جديد
    const createPptxTemplateExample = async () => {
        try {
            const defaultStyles = pptxTemplate.getDefaultPptxStyles();

            const templateId = await pptxTemplate.createPptxTemplate(
                'Modern Presentation Template',
                'A modern template for presentations',
                defaultStyles
            );

            console.log('PPTX template created:', templateId);

            // تحديث نمط الشريحة الرئيسية
            pptxTemplate.updatePptxStyle(templateId, 'title-slide', {
                backgroundColor: '#f7fafc',
                titleStyle: {
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: '#2d3748',
                    alignment: 'center',
                },
                subtitleStyle: {
                    fontSize: 24,
                    fontWeight: 'normal',
                    color: '#718096',
                    alignment: 'center',
                }
            });

            // تطبيق القالب
            pptxTemplate.setActiveTemplate(templateId);

        } catch (error) {
            console.error('Template creation failed:', error);
        }
    };

    // مثال: إدارة القوالب المتعددة
    const manageMultipleTemplatesExample = async () => {
        try {
            // إنشاء قوالب متعددة للمقترحات
            const proposalTemplates = await Promise.all([
                docxTemplate.createDocxTemplate('Formal Proposal', 'Formal business proposal template', docxTemplate.getDefaultDocxStyles()),
                docxTemplate.createDocxTemplate('Creative Proposal', 'Creative proposal template', docxTemplate.getDefaultDocxStyles()),
                docxTemplate.createDocxTemplate('Technical Proposal', 'Technical proposal template', docxTemplate.getDefaultDocxStyles()),
            ]);

            console.log('Created proposal templates:', proposalTemplates);

            // إنشاء قوالب متعددة للعروض التقديمية
            const presentationTemplates = await Promise.all([
                pptxTemplate.createPptxTemplate('Business Presentation', 'Professional business presentation', pptxTemplate.getDefaultPptxStyles()),
                pptxTemplate.createPptxTemplate('Academic Presentation', 'Academic presentation template', pptxTemplate.getDefaultPptxStyles()),
                pptxTemplate.createPptxTemplate('Creative Presentation', 'Creative presentation template', pptxTemplate.getDefaultPptxStyles()),
            ]);

            console.log('Created presentation templates:', presentationTemplates);

            // الحصول على القوالب حسب الفئة
            const businessTemplates = docxTemplate.getDocxTemplatesByCategory('proposal');
            const presentationTemplatesByCategory = pptxTemplate.getPptxTemplatesByCategory('presentation');

            console.log('Business templates:', businessTemplates);
            console.log('Presentation templates:', presentationTemplatesByCategory);

        } catch (error) {
            console.error('Multiple templates management failed:', error);
        }
    };

    return {
        // Export functions
        exportProposalExample,
        exportReportExample,
        exportPresentationExample,
        exportAcademicExample,

        // Template management functions
        createDocxTemplateExample,
        createPptxTemplateExample,
        manageMultipleTemplatesExample,

        // Export states
        isProposalExporting: proposalExport.isExporting,
        isReportExporting: reportExport.isExporting,
        isPresentationExporting: presentationExport.isExporting,
        isAcademicExporting: academicExport.isExporting,

        // Template states
        docxTemplates: docxTemplate.templates,
        pptxTemplates: pptxTemplate.templates,
        activeDocxTemplate: docxTemplate.activeTemplate,
        activePptxTemplate: pptxTemplate.activeTemplate,
    };
}
