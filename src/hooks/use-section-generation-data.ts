'use client';

import { ContextItem, ContextOrganizer, createOrganizedPrompt } from '@/ai/core/context-organizer';
import { useBuilderStore } from '@/hooks';
import { useContextSelector } from '@/hooks/use-context-selector';
import { useGenerationUIStore } from '@/hooks/useGenerationUIStore';
import { useCallback } from 'react';

/**
 * Hook محسن لجمع البيانات من SectionAccordionItem
 * يجمع السياق المحدد، إعدادات التوليد، والإرشادات
 */
export function useSectionGenerationData(itemKey: string) {
    const { project } = useBuilderStore();
    const {
        controlState,
        guidelineState,
        oneTimeInstructions
    } = useGenerationUIStore();

    const {
        proposal,
        projectPlan,
        currentSelection,
        selectedSections,
        selectedDiagrams,
        selectedExternalContext,
        hasContext
    } = useContextSelector(itemKey);

    /**
     * جمع البيانات المطلوبة للتوليد مع تنظيم السياقات حسب المعرفة
     */
    const getGenerationData = useCallback(() => {
        // إعدادات التوليد
        const controls = controlState[itemKey] || {
            formality: 50,
            tone: 'professional' as const,
            wordCount: ''
        };

        // الإرشادات والتعليمات
        const guidelines = guidelineState[itemKey];
        const oneTimeInstruction = oneTimeInstructions[itemKey];

        // تجميع جميع السياقات المحددة
        const allContexts: ContextItem[] = [];

        // إضافة السياق الخارجي المحدد
        selectedExternalContext.forEach(item => {
            allContexts.push({
                fileName: item.fileName,
                content: item.content,
                type: item.type as any, // سيتم التحقق من الصحة في ContextOrganizer
                metadata: {
                    wordCount: item.content.length,
                    language: item.content.match(/[\u0600-\u06FF]/) ? 'ar' : 'en'
                }
            });
        });

        // إضافة الأقسام المحددة كسياق
        selectedSections.forEach(({ key, content }) => {
            allContexts.push({
                fileName: `section-${key}`,
                content: content,
                type: 'context',
                metadata: {
                    wordCount: content.length,
                    language: content.match(/[\u0600-\u06FF]/) ? 'ar' : 'en'
                }
            });
        });

        // إضافة الرسوم البيانية المحددة كسياق
        selectedDiagrams.forEach(({ key, content }) => {
            allContexts.push({
                fileName: `diagram-${key}`,
                content: content,
                type: 'context',
                metadata: {
                    wordCount: content.length,
                    language: content.match(/[\u0600-\u06FF]/) ? 'ar' : 'en'
                }
            });
        });

        // تنظيم السياقات حسب المعرفة والأهمية
        const organizedContext = allContexts.length > 0
            ? ContextOrganizer.organizeContexts(
                allContexts,
                itemKey, // القسم المستهدف
                [
                    ...(guidelines?.custom || []),
                    ...(oneTimeInstruction ? [oneTimeInstruction] : [])
                ] // المتطلبات المحددة
            )
            : null;

        // إنشاء مطالبة منظمة من السياقات
        const organizedPrompt = organizedContext ? createOrganizedPrompt(organizedContext) : '';

        // السياق المحدد (للتوافق مع النظام القديم)
        const contextData = {
            proposal: currentSelection.proposal ? proposal : null,
            projectPlan: currentSelection.projectPlan ? projectPlan : null,
            sections: selectedSections.reduce((acc, { key, content }) => {
                acc[key] = content;
                return acc;
            }, {} as Record<string, string>),
            diagrams: selectedDiagrams.reduce((acc, { key, content }) => {
                acc[key] = content;
                return acc;
            }, {} as Record<string, string>),
            externalContext: selectedExternalContext.map(item => ({
                fileName: item.fileName,
                content: item.content,
                type: item.type
            }))
        };

        // إعدادات التوليد المحسنة
        const generationSettings = {
            style: {
                formality: controls.formality,
                tone: controls.tone,
                wordCount: controls.wordCount ? parseInt(controls.wordCount) : undefined
            },
            guidelines: {
                default: guidelines?.checked || [],
                custom: guidelines?.custom || [],
                oneTime: oneTimeInstruction || ''
            },
            context: contextData,
            hasContext,
            organizedContext, // السياقات المنظمة حسب المعرفة
            organizedPrompt // المطالبة المنظمة
        };

        return {
            itemKey,
            generationSettings,
            contextData,
            controls,
            guidelines,
            oneTimeInstruction,
            organizedContext,
            organizedPrompt,
            hasContext
        };
    }, [
        itemKey,
        controlState,
        guidelineState,
        oneTimeInstructions,
        proposal,
        projectPlan,
        currentSelection,
        selectedSections,
        selectedDiagrams,
        selectedExternalContext,
        hasContext
    ]);

    /**
     * تحضير البيانات للـ API مع السياقات المنظمة
     */
    const prepareApiData = useCallback((additionalData: any = {}) => {
        const generationData = getGenerationData();

        return {
            // البيانات الأساسية
            sectionToGenerate: itemKey,
            ...additionalData,

            // السياق المحدد (للتوافق مع النظام القديم)
            proposal: generationData.contextData.proposal,
            projectPlan: generationData.contextData.projectPlan,
            otherSections: generationData.contextData.sections,
            otherDiagrams: generationData.contextData.diagrams,
            externalContext: generationData.contextData.externalContext,

            // السياقات المنظمة حسب المعرفة (النظام الجديد)
            organizedContext: generationData.organizedContext ? {
                guidelines: generationData.organizedContext.guidelines,
                foundational: generationData.organizedContext.foundational,
                conceptual: generationData.organizedContext.conceptual,
                procedural: generationData.organizedContext.procedural,
                reference: generationData.organizedContext.reference,
                statistics: generationData.organizedContext.statistics
            } : null,

            // المطالبة المنظمة
            organizedPrompt: generationData.organizedPrompt,

            // إعدادات التوليد
            style: generationData.generationSettings.style,

            // الإرشادات والتعليمات
            guidelines: generationData.guidelines?.custom || [],
            oneTimeInstructions: generationData.oneTimeInstruction || '',
            selectedGuidelines: generationData.guidelines?.checked || [],

            // معلومات إضافية
            hasContext: generationData.hasContext,
            generationMetadata: {
                formality: generationData.controls.formality,
                tone: generationData.controls.tone,
                wordCount: generationData.controls.wordCount,
                timestamp: new Date().toISOString(),
                organizedContextCount: generationData.organizedContext?.statistics.totalItems || 0
            }
        };
    }, [itemKey, getGenerationData]);

    /**
     * التحقق من صحة البيانات
     */
    const validateData = useCallback(() => {
        const generationData = getGenerationData();

        const errors: string[] = [];

        // التحقق من وجود السياق
        if (!generationData.hasContext) {
            errors.push('No context selected for generation');
        }

        // التحقق من إعدادات التوليد
        if (generationData.controls.formality < 0 || generationData.controls.formality > 100) {
            errors.push('Formality must be between 0 and 100');
        }

        // التحقق من عدد الكلمات
        if (generationData.controls.wordCount &&
            (isNaN(parseInt(generationData.controls.wordCount)) || parseInt(generationData.controls.wordCount) < 0)) {
            errors.push('Word count must be a positive number');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, [getGenerationData]);

    return {
        getGenerationData,
        prepareApiData,
        validateData,
        hasContext,
        controls: controlState[itemKey],
        guidelines: guidelineState[itemKey],
        oneTimeInstruction: oneTimeInstructions[itemKey],
        // البيانات الجديدة للسياقات المنظمة
        organizedContext: getGenerationData().organizedContext,
        organizedPrompt: getGenerationData().organizedPrompt,
        contextStatistics: getGenerationData().organizedContext?.statistics
    };
}
