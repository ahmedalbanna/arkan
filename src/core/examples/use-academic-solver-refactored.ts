
import { z } from 'zod';
import { createAcademicSolverToolHook } from '../hooks/academic-solver-tools/use-academic-solver-factory';

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
export const useAcademicSolverLogic = createAcademicSolverToolHook({
    toolName: 'academic-solver',
    apiEndpoint: '/api/writing-tools/academic-solver',
    schema: academicSolverSchema,
    defaultValues,
    successMessage: 'Problem solved successfully!',
    errorMessage: 'Failed to solve problem',
    enableFileUpload: true,
    acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown', 'image/jpeg', 'image/png'],
    solverType: 'general',
    customFeatures: {
        formatOutput: (data: any) => {
            if (!data) return null;
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
});
