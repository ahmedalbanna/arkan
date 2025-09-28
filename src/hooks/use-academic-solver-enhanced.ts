'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { createAcademicSolverToolHook } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const academicSolverSchema = z.object({
    problem: z.string().min(10, 'Problem must be at least 10 characters.'),
    subject: z.enum(['math', 'physics', 'chemistry', 'biology', 'engineering', 'general']),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    showSteps: z.boolean().optional(),
    includeExplanation: z.boolean().optional(),
});

// القيم الافتراضية
const defaultValues = {
    problem: '',
    subject: 'general' as const,
    difficulty: 'medium' as const,
    showSteps: true,
    includeExplanation: true,
};

/**
 * Hook محسن للحل الأكاديمي
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useAcademicSolverEnhanced() {
    const { t } = useLocalization();

    const academicSolverTool = createAcademicSolverToolHook({
        toolName: 'academic-solver-enhanced',
        apiEndpoint: '/api/writing-tools/academic-solver',
        schema: academicSolverSchema,
        defaultValues,
        successMessage: t('academicSolver.successToast') || 'Problem solved successfully!',
        errorMessage: t('academicSolver.errorToast') || 'Failed to solve problem',
        enableFileUpload: true,
        acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown', 'image/jpeg', 'image/png'],
        solverType: 'general',
        customFeatures: {
            formatOutput: (data: any) => {
                if (data.solution) {
                    return {
                        solution: data.solution,
                        answer: data.answer,
                        steps: data.steps || [],
                        explanation: data.explanation,
                        metadata: {
                            difficulty: data.difficulty || 'medium',
                            timeEstimate: data.timeEstimate || 5, // دقائق
                            concepts: data.concepts || [],
                            subject: data.subject || 'general',
                        }
                    };
                }
                return data;
            },
            validateInput: (data: any) => {
                return data.problem?.length >= 10;
            },
            getSolutionSteps: (data: any) => {
                return data.steps || [];
            },
            getAnswer: (data: any) => {
                return data.answer;
            },
            getExplanation: (data: any) => {
                return data.explanation;
            },
            getRelatedProblems: (data: any) => {
                return data.relatedProblems || [];
            }
        }
    })();

    // معالج النسخ المخصص للحلول الأكاديمية
    const handleCopySolution = () => {
        const solution = academicSolverTool.solution;
        if (!solution) return;

        const textToCopy = `Problem: ${academicSolverTool.originalText}\n\nSolution:\n${solution.solution}\n\nAnswer: ${solution.answer}\n\nExplanation: ${solution.explanation}`;
        academicSolverTool.copyToClipboard(textToCopy);
    };

    return {
        // الترجمة
        t,

        // النموذج والحالة
        form: academicSolverTool.form,
        isProcessing: academicSolverTool.isProcessing,

        // النصوص والمحتوى
        originalText: academicSolverTool.originalText,
        processedText: academicSolverTool.processedText,
        solution: academicSolverTool.solution,

        // النسخ
        isCopied: academicSolverTool.isCopied,
        handleCopySolution,

        // المعالجة
        onSubmit: academicSolverTool.handleSubmit,
        reset: academicSolverTool.reset,

        // النتائج والوظائف المساعدة
        formatOutput: academicSolverTool.formatOutput,
        validateInput: academicSolverTool.validateInput,
        getSolutionSteps: academicSolverTool.getSolutionSteps,
        getAnswer: academicSolverTool.getAnswer,
        getExplanation: academicSolverTool.getExplanation,
        getRelatedProblems: academicSolverTool.getRelatedProblems,

        // الطفرة (للتوافق مع الكود الموجود)
        mutation: academicSolverTool.mutation,
    };
}
