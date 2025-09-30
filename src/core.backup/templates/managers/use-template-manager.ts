/**
 * Hook أساسي لإدارة القوالب
 */

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type {
    Template,
    TemplateCategory,
    TemplateFormat,
    TemplateManagerOptions,
    TemplateManagerResult,
    TemplateStyle
} from '../types/template-types';

// مفاتيح الاستعلام
const TEMPLATES_QUERY_KEY = 'templates';

export function useTemplateManager(options: TemplateManagerOptions = {}): TemplateManagerResult {
    const { firebaseUser } = useAuth();
    const { toast } = useToast();
    const { t } = useLocalization();
    const queryClient = useQueryClient();

    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // جلب القوالب
    const { data: templates = {}, isLoading } = useQuery({
        queryKey: [TEMPLATES_QUERY_KEY],
        queryFn: async () => {
            if (!firebaseUser) return {};

            const token = await firebaseUser.getIdToken();
            const response = await fetch('/api/templates', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch templates');
            }

            return response.json();
        },
        enabled: !!firebaseUser,
    });

    // تحديث القالب
    const updateMutation = useMutation({
        mutationFn: async ({ templateId, updates }: { templateId: string; updates: Partial<Template> }) => {
            if (!firebaseUser) throw new Error('User not authenticated');

            const token = await firebaseUser.getIdToken();
            const response = await fetch(`/api/templates/${templateId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Failed to update template');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
            toast({
                title: t('templates.updateSuccess') || 'Template Updated',
                description: t('templates.updateSuccessDesc') || 'Template has been updated successfully',
            });
        },
        onError: (error: Error) => {
            setError(error.message);
            toast({
                title: t('templates.updateError') || 'Update Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // إنشاء قالب جديد
    const createMutation = useMutation({
        mutationFn: async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
            if (!firebaseUser) throw new Error('User not authenticated');

            const token = await firebaseUser.getIdToken();
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(template),
            });

            if (!response.ok) {
                throw new Error('Failed to create template');
            }

            return response.json();
        },
        onSuccess: (newTemplate) => {
            queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
            toast({
                title: t('templates.createSuccess') || 'Template Created',
                description: t('templates.createSuccessDesc') || 'Template has been created successfully',
            });
            return newTemplate.id;
        },
        onError: (error: Error) => {
            setError(error.message);
            toast({
                title: t('templates.createError') || 'Creation Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // حذف القالب
    const deleteMutation = useMutation({
        mutationFn: async (templateId: string) => {
            if (!firebaseUser) throw new Error('User not authenticated');

            const token = await firebaseUser.getIdToken();
            const response = await fetch(`/api/templates/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete template');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
            toast({
                title: t('templates.deleteSuccess') || 'Template Deleted',
                description: t('templates.deleteSuccessDesc') || 'Template has been deleted successfully',
            });
        },
        onError: (error: Error) => {
            setError(error.message);
            toast({
                title: t('templates.deleteError') || 'Deletion Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // تعيين القالب النشط
    const setActiveTemplate = useCallback((templateId: string) => {
        setActiveTemplateId(templateId);
        options.onTemplateChange?.(templateId, { isActive: true });
    }, [options]);

    // إنشاء قالب جديد
    const createTemplate = useCallback(async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        return createMutation.mutateAsync(template);
    }, [createMutation]);

    // تحديث القالب
    const updateTemplate = useCallback(async (templateId: string, updates: Partial<Template>) => {
        await updateMutation.mutateAsync({ templateId, updates });
    }, [updateMutation]);

    // حذف القالب
    const deleteTemplate = useCallback(async (templateId: string) => {
        await deleteMutation.mutateAsync(templateId);
    }, [deleteMutation]);

    // نسخ القالب
    const duplicateTemplate = useCallback(async (templateId: string, newName: string): Promise<string> => {
        const originalTemplate = templates[templateId];
        if (!originalTemplate) {
            throw new Error('Template not found');
        }

        const duplicatedTemplate: Omit<Template, 'id' | 'createdAt' | 'updatedAt'> = {
            ...originalTemplate,
            name: newName,
            isDefault: false,
            isActive: false,
        };

        return createTemplate(duplicatedTemplate);
    }, [templates, createTemplate]);

    // تحديث النمط
    const updateStyle = useCallback((templateId: string, styleId: string, properties: Record<string, any>) => {
        const template = templates[templateId];
        if (!template) return;

        const updatedStyles = {
            ...template.styles,
            [styleId]: {
                ...template.styles[styleId],
                properties: {
                    ...template.styles[styleId]?.properties,
                    ...properties,
                },
            },
        };

        // تحديث محلي فوري
        queryClient.setQueryData([TEMPLATES_QUERY_KEY], (old: Record<string, Template> | undefined) => {
            if (!old) return {};
            return {
                ...old,
                [templateId]: {
                    ...old[templateId],
                    styles: updatedStyles,
                },
            };
        });

        options.onStyleChange?.(templateId, styleId, properties);

        // حفظ تلقائي إذا كان مفعلاً
        if (options.autoSave) {
            updateTemplate(templateId, { styles: updatedStyles });
        }
    }, [templates, queryClient, options, updateTemplate]);

    // إضافة نمط جديد
    const addStyle = useCallback((templateId: string, style: TemplateStyle) => {
        const template = templates[templateId];
        if (!template) return;

        const updatedStyles = {
            ...template.styles,
            [style.id]: style,
        };

        updateTemplate(templateId, { styles: updatedStyles });
    }, [templates, updateTemplate]);

    // إزالة النمط
    const removeStyle = useCallback((templateId: string, styleId: string) => {
        const template = templates[templateId];
        if (!template) return;

        const updatedStyles = { ...template.styles };
        delete updatedStyles[styleId];

        updateTemplate(templateId, { styles: updatedStyles });
    }, [templates, updateTemplate]);

    // الحصول على القوالب حسب الفئة
    const getTemplatesByCategory = useCallback((category: TemplateCategory): Template[] => {
        return Object.values(templates).filter(template => template.category === category);
    }, [templates]);

    // الحصول على القوالب حسب التنسيق
    const getTemplatesByFormat = useCallback((format: TemplateFormat): Template[] => {
        return Object.values(templates).filter(template => template.format === format);
    }, [templates]);

    // التحقق من صحة القالب
    const validateTemplate = useCallback((template: Template): boolean => {
        return !!(
            template.name &&
            template.format &&
            template.category &&
            Object.keys(template.styles).length > 0
        );
    }, []);

    // تصدير القالب
    const exportTemplate = useCallback(async (templateId: string): Promise<Blob> => {
        const template = templates[templateId];
        if (!template) {
            throw new Error('Template not found');
        }

        const templateData = JSON.stringify(template, null, 2);
        return new Blob([templateData], { type: 'application/json' });
    }, [templates]);

    // استيراد القالب
    const importTemplate = useCallback(async (file: File): Promise<string> => {
        const content = await file.text();
        const template = JSON.parse(content) as Template;

        if (!validateTemplate(template)) {
            throw new Error('Invalid template format');
        }

        return createTemplate(template);
    }, [validateTemplate, createTemplate]);

    // القالب النشط
    const activeTemplate = activeTemplateId ? templates[activeTemplateId] : null;

    return {
        templates,
        activeTemplate,
        isLoading,
        isSaving: updateMutation.isPending || createMutation.isPending || deleteMutation.isPending,
        error,
        setActiveTemplate,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
        updateStyle,
        addStyle,
        removeStyle,
        getTemplatesByCategory,
        getTemplatesByFormat,
        validateTemplate,
        exportTemplate,
        importTemplate,
    };
}
