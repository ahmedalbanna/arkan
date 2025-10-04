/**
 * Hook محسن لأدوات العروض التقديمية يستخدم النظام الجديد من src/core
 */

'use client';

import { useLocalization } from '@/context/LocalizationContext';
import {
    createAdvancedPresentationToolHook,
    createPresentationToolHook
} from '@/core';
import { z } from 'zod';

// مخططات التحقق من البيانات
const presentationOutlineSchema = z.object({
    topic: z.string().min(5, 'Topic must be at least 5 characters long.'),
    audience: z.string().optional(),
    duration: z.number().min(5).max(180).optional(), // 5 minutes to 3 hours
    style: z.enum(['professional', 'creative', 'academic', 'casual']).optional(),
    includeSlides: z.boolean().optional(),
});

const presentationGeneratorSchema = z.object({
    topic: z.string().min(5, 'Topic must be at least 5 characters long.'),
    slides: z.array(z.object({
        title: z.string(),
        content: z.string(),
        type: z.enum(['title', 'content', 'image', 'chart', 'conclusion']).optional(),
    })).optional(),
    template: z.string().optional(),
    theme: z.enum(['light', 'dark', 'colorful', 'minimal']).optional(),
});

const presentationTemplateManagerSchema = z.object({
    templateId: z.string().min(1, 'Template ID is required.'),
    name: z.string().optional(),
    description: z.string().optional(),
    styles: z.any().optional(),
});

export function usePresentationToolsEnhanced() {
    const { t } = useLocalization();

    // Presentation Outline Hook
    const usePresentationOutline = createPresentationToolHook({
        toolName: 'presentation-outline',
        apiEndpoint: 'presentation-outline',
        schema: presentationOutlineSchema,
        defaultValues: {
            topic: '',
            audience: 'general',
            duration: 30, // 30 minutes default
            style: 'professional',
            includeSlides: true,
        },
        successMessage: t('writingTools.presentationOutline.successToast') || 'Presentation outline generated successfully!',
        errorMessage: t('writingTools.presentationOutline.errorToast') || 'Failed to generate presentation outline',
        enableFileUpload: false,
        presentationType: 'outline',
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.outline) {
                    return {
                        topic: data.topic,
                        outline: data.outline,
                        audience: data.audience,
                        duration: data.duration,
                        style: data.style,
                        metadata: {
                            slideCount: data.outline.length,
                            estimatedDuration: data.outline.length * 2, // 2 minutes per slide
                            difficulty: data.difficulty || 'medium',
                            targetAudience: data.targetAudience || 'General',
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.topic?.length >= 5;
            },
            getPresentationSections: () => [
                'Introduction',
                'Main Content',
                'Examples',
                'Conclusion',
                'Q&A'
            ],
            getSlideCount: (data: any) => {
                return data.outline?.length || 0;
            },
            getEstimatedDuration: (data: any) => {
                return (data.outline?.length || 0) * 2; // 2 minutes per slide
            },
        }
    });

    // Presentation Generator Hook
    const usePresentationGenerator = createAdvancedPresentationToolHook({
        toolName: 'presentation-generator',
        apiEndpoint: 'presentation-generator',
        schema: presentationGeneratorSchema,
        defaultValues: {
            topic: '',
            slides: [],
            template: 'default',
            theme: 'light',
        },
        successMessage: t('writingTools.presentationGenerator.successToast') || 'Presentation generated successfully!',
        errorMessage: t('writingTools.presentationGenerator.errorToast') || 'Failed to generate presentation',
        enableFileUpload: true,
        acceptedFileTypes: ['text/plain', 'text/markdown', 'application/pdf'],
        presentationType: 'slides',
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.presentation) {
                    return {
                        topic: data.topic,
                        presentation: data.presentation,
                        slides: data.slides || [],
                        template: data.template,
                        theme: data.theme,
                        metadata: {
                            slideCount: data.slides?.length || 0,
                            estimatedDuration: (data.slides?.length || 0) * 2,
                            complexity: data.complexity || 'medium',
                            generatedAt: new Date().toISOString(),
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.topic?.length >= 5;
            },
            getPresentationSections: () => [
                'Title Slide',
                'Agenda',
                'Main Content',
                'Examples',
                'Conclusion',
                'Thank You'
            ],
            getSlideCount: (data: any) => {
                return data.slides?.length || 0;
            },
            getEstimatedDuration: (data: any) => {
                return (data.slides?.length || 0) * 2;
            },
            getPresentationMetrics: (data: any) => {
                return {
                    slideCount: data.slides?.length || 0,
                    estimatedDuration: (data.slides?.length || 0) * 2,
                    complexity: data.complexity || 'medium',
                    theme: data.theme || 'light',
                    template: data.template || 'default',
                };
            },
            exportPresentation: (data: any) => {
                console.log('Exporting presentation:', data);
                // Implement actual export logic here
            },
        }
    });

    // Presentation Template Manager Hook
    const usePresentationTemplateManager = createPresentationToolHook({
        toolName: 'presentation-template-manager',
        apiEndpoint: 'presentation-template-manager',
        schema: presentationTemplateManagerSchema,
        defaultValues: {
            templateId: '',
            name: '',
            description: '',
            styles: {},
        },
        successMessage: t('writingTools.presentationTemplateManager.successToast') || 'Template managed successfully!',
        errorMessage: t('writingTools.presentationTemplateManager.errorToast') || 'Failed to manage template',
        enableFileUpload: true,
        acceptedFileTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        presentationType: 'template',
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.template) {
                    return {
                        templateId: data.templateId,
                        template: data.template,
                        name: data.name,
                        description: data.description,
                        styles: data.styles || {},
                        metadata: {
                            slideCount: data.slideCount || 0,
                            lastModified: data.lastModified || new Date().toISOString(),
                            version: data.version || '1.0.0',
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.templateId?.length >= 1;
            },
            getPresentationSections: () => [
                'Title Slide',
                'Content Slide',
                'Image Slide',
                'Chart Slide',
                'Conclusion Slide'
            ],
            getSlideCount: (data: any) => {
                return data.slideCount || 0;
            },
            getEstimatedDuration: (data: any) => {
                return (data.slideCount || 0) * 2;
            },
        }
    });

    return {
        // Presentation Tools
        usePresentationOutline,
        usePresentationGenerator,
        usePresentationTemplateManager,

        // Helper Functions
        getPresentationStyles: () => [
            'professional', 'creative', 'academic', 'casual'
        ],

        getPresentationThemes: () => [
            'light', 'dark', 'colorful', 'minimal'
        ],

        getSlideTypes: () => [
            'title', 'content', 'image', 'chart', 'conclusion'
        ],

        getSupportedFileTypes: () => [
            'text/plain',
            'text/markdown',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ],

        getDurationOptions: () => [
            { value: 5, label: '5 minutes' },
            { value: 10, label: '10 minutes' },
            { value: 15, label: '15 minutes' },
            { value: 30, label: '30 minutes' },
            { value: 45, label: '45 minutes' },
            { value: 60, label: '1 hour' },
            { value: 90, label: '1.5 hours' },
            { value: 120, label: '2 hours' },
            { value: 180, label: '3 hours' },
        ],
    };
}
