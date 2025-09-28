/**
 * Hook محسن للقوالب يستخدم النظام الجديد من src/core
 */

'use client';

import type { TemplateCategory, TemplateFormat } from '@/core';
import {
    useDocxTemplate,
    usePptxTemplate
} from '@/core';

export interface TemplateEnhancedOptions {
    autoSave?: boolean;
    validateStyles?: boolean;
}

export function useTemplatesEnhanced() {
    // Template Hooks من النظام الجديد
    const docxTemplate = useDocxTemplate();
    const pptxTemplate = usePptxTemplate();

    // إنشاء قالب جديد
    const createTemplate = async (
        name: string,
        description: string,
        format: TemplateFormat,
        category: TemplateCategory,
        styles: Record<string, any> = {}
    ) => {
        switch (format) {
            case 'docx':
                return docxTemplate.createDocxTemplate(name, description, styles);
            case 'pptx':
                return pptxTemplate.createPptxTemplate(name, description, styles);
            default:
                throw new Error(`Unsupported template format: ${format}`);
        }
    };

    // تحديث قالب
    const updateTemplate = async (
        templateId: string,
        format: TemplateFormat,
        updates: any
    ) => {
        switch (format) {
            case 'docx':
                return docxTemplate.updateDocxTemplate(templateId, updates);
            case 'pptx':
                return pptxTemplate.updatePptxTemplate(templateId, updates);
            default:
                throw new Error(`Unsupported template format: ${format}`);
        }
    };

    // حذف قالب
    const deleteTemplate = async (
        templateId: string,
        format: TemplateFormat
    ) => {
        switch (format) {
            case 'docx':
                return docxTemplate.deleteDocxTemplate(templateId);
            case 'pptx':
                return pptxTemplate.deletePptxTemplate(templateId);
            default:
                throw new Error(`Unsupported template format: ${format}`);
        }
    };

    // تحديث نمط
    const updateStyle = (
        templateId: string,
        format: TemplateFormat,
        styleId: string,
        properties: Record<string, any>
    ) => {
        switch (format) {
            case 'docx':
                return docxTemplate.updateDocxStyle(templateId, styleId, properties);
            case 'pptx':
                return pptxTemplate.updatePptxStyle(templateId, styleId, properties);
            default:
                throw new Error(`Unsupported template format: ${format}`);
        }
    };

    // إضافة نمط جديد
    const addStyle = (
        templateId: string,
        format: TemplateFormat,
        style: any
    ) => {
        switch (format) {
            case 'docx':
                return docxTemplate.addDocxStyle(templateId, style);
            case 'pptx':
                return pptxTemplate.addPptxStyle(templateId, style);
            default:
                throw new Error(`Unsupported template format: ${format}`);
        }
    };

    // إزالة نمط
    const removeStyle = (
        templateId: string,
        format: TemplateFormat,
        styleId: string
    ) => {
        switch (format) {
            case 'docx':
                return docxTemplate.removeDocxStyle(templateId, styleId);
            case 'pptx':
                return pptxTemplate.removePptxStyle(templateId, styleId);
            default:
                throw new Error(`Unsupported template format: ${format}`);
        }
    };

    // تعيين القالب النشط
    const setActiveTemplate = (
        templateId: string,
        format: TemplateFormat
    ) => {
        switch (format) {
            case 'docx':
                return docxTemplate.setActiveTemplate(templateId);
            case 'pptx':
                return pptxTemplate.setActiveTemplate(templateId);
            default:
                throw new Error(`Unsupported template format: ${format}`);
        }
    };

    // الحصول على القوالب حسب الفئة
    const getTemplatesByCategory = (category: TemplateCategory) => {
        const docxTemplates = docxTemplate.getDocxTemplatesByCategory(category);
        const pptxTemplates = pptxTemplate.getPptxTemplatesByCategory(category);

        return {
            docx: docxTemplates,
            pptx: pptxTemplates,
            all: [...docxTemplates, ...pptxTemplates]
        };
    };

    // الحصول على الأنماط الافتراضية
    const getDefaultStyles = (format: TemplateFormat) => {
        switch (format) {
            case 'docx':
                return docxTemplate.getDefaultDocxStyles();
            case 'pptx':
                return pptxTemplate.getDefaultPptxStyles();
            default:
                return {};
        }
    };

    // التحقق من صحة القالب
    const validateTemplate = (template: any, format: TemplateFormat) => {
        switch (format) {
            case 'docx':
                return docxTemplate.validateDocxTemplate(template);
            case 'pptx':
                return pptxTemplate.validatePptxTemplate(template);
            default:
                return false;
        }
    };

    // تصدير القالب
    const exportTemplate = async (templateId: string, format: TemplateFormat) => {
        switch (format) {
            case 'docx':
                return docxTemplate.exportTemplate?.(templateId);
            case 'pptx':
                return pptxTemplate.exportTemplate?.(templateId);
            default:
                throw new Error(`Unsupported template format: ${format}`);
        }
    };

    // استيراد القالب
    const importTemplate = async (file: File, format: TemplateFormat) => {
        switch (format) {
            case 'docx':
                return docxTemplate.importTemplate?.(file);
            case 'pptx':
                return pptxTemplate.importTemplate?.(file);
            default:
                throw new Error(`Unsupported template format: ${format}`);
        }
    };

    // الحالة العامة
    const isLoading = docxTemplate.isLoading || pptxTemplate.isLoading;
    const isSaving = docxTemplate.isSaving || pptxTemplate.isSaving;

    return {
        // وظائف إدارة القوالب
        createTemplate,
        updateTemplate,
        deleteTemplate,

        // وظائف إدارة الأنماط
        updateStyle,
        addStyle,
        removeStyle,

        // وظائف إدارة القوالب النشطة
        setActiveTemplate,

        // وظائف مساعدة
        getTemplatesByCategory,
        getDefaultStyles,
        validateTemplate,
        exportTemplate,
        importTemplate,

        // الحالة
        isLoading,
        isSaving,

        // القوالب
        templates: {
            docx: docxTemplate.templates,
            pptx: pptxTemplate.templates,
        },

        // القوالب النشطة
        activeTemplates: {
            docx: docxTemplate.activeTemplate,
            pptx: pptxTemplate.activeTemplate,
        },

        // الحالة التفصيلية
        docxTemplate,
        pptxTemplate,
    };
}
