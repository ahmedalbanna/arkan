'use client';

import { ContextItem, ContextOrganizer, createOrganizedPrompt } from '@/ai/core/context-organizer';
import { useBuilderStore } from '@/hooks';
import { useContextSelector } from '@/hooks/use-context-selector';
import { useGenerationUIStore } from '@/hooks/useGenerationUIStore';
import { ContextFileData } from '@/lib/models/context-manager';
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
        const controls = controlState[itemKey] || {
            formality: 50,
            tone: 'professional' as const,
            wordCount: ''
        };

        const guidelines = guidelineState[itemKey];
        const oneTimeInstruction = oneTimeInstructions[itemKey];

        const allContexts: ContextItem[] = [];

        // CORRECTED: Added explicit types for item
        (selectedExternalContext || []).forEach((item: ContextFileData) => {
            const content = item.content || '';
            allContexts.push({
                fileName: item.fileName,
                content: content,
                type: item.type as any,
                metadata: {
                    wordCount: content.length,
                    language: content.match(/[\u0600-\u06FF]/) ? 'ar' : 'en'
                }
            });
        });

        // CORRECTED: Added explicit types for key and content
        (selectedSections || []).forEach(({ key, content }: { key: string, content: string }) => {
            const safeContent = content || '';
            allContexts.push({
                fileName: `section-${key}`,
                content: safeContent,
                type: 'context',
                metadata: {
                    wordCount: safeContent.length,
                    language: safeContent.match(/[\u0600-\u06FF]/) ? 'ar' : 'en'
                }
            });
        });

        // CORRECTED: Added explicit types for key and content
        (selectedDiagrams || []).forEach(({ key, content }: { key: string, content: string }) => {
            const safeContent = content || '';
            allContexts.push({
                fileName: `diagram-${key}`,
                content: safeContent,
                type: 'context',
                metadata: {
                    wordCount: safeContent.length,
                    language: safeContent.match(/[\u0600-\u06FF]/) ? 'ar' : 'en'
                }
            });
        });

        const organizedContext = allContexts.length > 0
            ? ContextOrganizer.organizeContexts(
                allContexts,
                itemKey,
                [
                    ...(guidelines?.custom || []),
                    ...(oneTimeInstruction ? [oneTimeInstruction] : [])
                ]
            )
            : null;

        const organizedPrompt = organizedContext ? createOrganizedPrompt(organizedContext) : '';

        const contextData = {
            proposal: currentSelection.proposal ? proposal : null,
            projectPlan: currentSelection.projectPlan ? projectPlan : null,
            sections: (selectedSections || []).reduce((acc, { key, content }) => {
                acc[key] = content || '';
                return acc;
            }, {} as Record<string, string>),
            diagrams: (selectedDiagrams || []).reduce((acc, { key, content }) => {
                acc[key] = content || '';
                return acc;
            }, {} as Record<string, string>),
            // CORRECTED: Added explicit type for item
            externalContext: (selectedExternalContext || []).map((item: ContextFileData) => ({
                fileName: item.fileName,
                content: item.content || '',
                type: item.type
            }))
        };

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
            organizedContext,
            organizedPrompt
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

    const prepareApiData = useCallback((additionalData: any = {}) => {
        const generationData = getGenerationData();

        const generateStyleInstructionText = (style: {
            formality: number;
            tone: string;
            wordCount?: number;
        }): string => {
            const instructions: string[] = [];
            let formalityDesc = "balanced";
            if (style.formality < 33) {
                formalityDesc = "informal";
            } else if (style.formality > 66) {
                formalityDesc = "very formal";
            }
            instructions.push(`- The writing style should be ${formalityDesc}.`);

            if (style.tone && style.tone !== "none") {
                instructions.push(`- Adopt a ${style.tone} tone.`);
            }
            if (style.wordCount) {
                instructions.push(`- The response should be approximately ${style.wordCount} words long.`);
            }
            return instructions.join('\n');
        };

        const styleInstructionText = generateStyleInstructionText(generationData.generationSettings.style);

        const instructionText = [
            generationData.oneTimeInstruction || '',
            styleInstructionText
        ].filter(Boolean).join('\n\n');

        const flatOtherSections = (selectedSections || []).reduce((acc, { key, content }) => {
            acc[key] = content || '';
            return acc;
        }, {} as Record<string, string>);

        const flatOtherDiagrams = (selectedDiagrams || []).reduce((acc, { key, content }) => {
            acc[key] = content || '';
            return acc;
        }, {} as Record<string, string>);

        const externalContext = generationData.contextData.externalContext || [];
        // CORRECTED: Added explicit types for item, fileName, and content
        const contextFiles = externalContext
            .filter((item: any) => item.type === 'context' || item.type === 'textbook' || item.type === 'question')
            .map(({ fileName, content }: { fileName: string, content: string }) => ({ fileName, content }));

        // CORRECTED: Added explicit types for item, fileName, and content
        const exampleFiles = externalContext
            .filter((item: any) => item.type === 'example')
            .map(({ fileName, content }: { fileName: string, content: string }) => ({ fileName, content }));
            
        const guidelines = [
            ...(generationData.guidelines?.checked || []),
            ...(generationData.guidelines?.custom || [])
        ];

        return {
            sectionToGenerate: itemKey,
            ...additionalData,
            proposal: generationData.contextData.proposal,
            projectPlan: generationData.contextData.projectPlan,
            otherSections: flatOtherSections,
            otherDiagrams: flatOtherDiagrams,
            contextFiles: contextFiles,
            exampleFiles: exampleFiles,
            guidelines: guidelines,
            instructionText: instructionText, // Renamed from oneTimeInstruction
        };
    }, [itemKey, getGenerationData, selectedSections, selectedDiagrams]);

    const validateData = useCallback(() => {
        const generationData = getGenerationData();
        const errors: string[] = [];

        if (!generationData.hasContext) {
            errors.push('No context selected for generation');
        }

        if (generationData.controls.formality < 0 || generationData.controls.formality > 100) {
            errors.push('Formality must be between 0 and 100');
        }

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
        organizedContext: getGenerationData().organizedContext,
        organizedPrompt: getGenerationData().organizedPrompt,
        contextStatistics: getGenerationData().organizedContext?.statistics
    };
}
