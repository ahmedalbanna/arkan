/**
 * تدفقات الأكاديمي
 * يحتوي على جميع التدفقات المتعلقة بالتعليم والمحتوى الأكاديمي
 */

'use server';

import { createGenkitFlow, FlowCategory } from '@/ai/flows/registry';
import { ai } from '@/ai/genkit';

// استيراد المحفزات
import { analysisPrompt, solvePrompt } from '@/ai/prompts/academic-solver';
import { generateSessionPlanPrompt } from '@/ai/prompts/generate-session-plan';
import { generateTheoreticalLecturePrompt } from '@/ai/prompts/generate-theoretical-lecture';

// استيراد المخططات
import {
    AnalyzedDocumentSchema,
    AnalyzeDocumentInputSchema,
    CreateLectureUnitInputSchema,
    CreateLectureUnitOutputSchema,
    GenerateSessionPlanInputSchema,
    GenerateSessionPlanOutputSchema,
    GenerateTheoreticalLectureInputSchema,
    GenerateTheoreticalLectureOutputSchema,
    SolvedDocumentSchema,
    SolveDocumentInputSchema,
    type AnalyzedDocument,
    type CreateLectureUnitInput,
    type CreateLectureUnitOutput,
    type GenerateSessionPlanInput,
    type GenerateSessionPlanOutput,
    type GenerateTheoreticalLectureInput,
    type GenerateTheoreticalLectureOutput,
    type SolvedDocument,
    type SolveDocumentInput
} from '@/ai/schemas';
import { z } from 'zod';

// ===== تحليل المستندات الأكاديمية =====
createGenkitFlow(
    'analyze-academic-document',
    'academic' as FlowCategory,
    'تحليل المستندات الأكاديمية مثل الامتحانات والواجبات',
    AnalyzeDocumentInputSchema,
    AnalyzedDocumentSchema,
    async (input: z.infer<typeof AnalyzeDocumentInputSchema>) => {
        const { output } = await analysisPrompt(input);
        if (!output) {
            throw new Error('Analysis failed to produce an output.');
        }
        // تنظيف المحتوى المُولد
        output.structuredContent = output.structuredContent.replace(/---/g, '').trim();
        return output;
    }
);

// ===== حل المستندات الأكاديمية =====
createGenkitFlow(
    'solve-academic-document',
    'academic' as FlowCategory,
    'حل المستندات الأكاديمية مثل الامتحانات والواجبات',
    SolveDocumentInputSchema,
    SolvedDocumentSchema,
    async (input: SolveDocumentInput) => {
        const { output } = await solvePrompt(input);
        if (!output) {
            throw new Error('Solution failed to produce an output.');
        }
        // تنظيف المحتوى المُولد
        output.solutions = output.solutions.map((solution: any) => ({ ...solution, solution: solution.solution.replace(/---/g, '').trim() }));
        return output;
    }
);

// ===== توليد المحاضرات النظرية =====
createGenkitFlow(
    'generate-theoretical-lecture',
    'academic' as FlowCategory,
    'توليد المحاضرات النظرية للمواضيع الأكاديمية',
    GenerateTheoreticalLectureInputSchema,
    GenerateTheoreticalLectureOutputSchema,
    async (input: GenerateTheoreticalLectureInput) => {
        const { output } = await generateTheoreticalLecturePrompt(input);
        if (!output) {
            throw new Error("Theoretical lecture generation failed.");
        }
        return output;
    }
);

// ===== توليد خطط الجلسات =====
createGenkitFlow(
    'generate-session-plan',
    'academic' as FlowCategory,
    'توليد خطط الجلسات العملية والتعليمية',
    GenerateSessionPlanInputSchema,
    GenerateSessionPlanOutputSchema,
    async (input: GenerateSessionPlanInput) => {
        const { output } = await generateSessionPlanPrompt(input);
        if (!output) {
            throw new Error("Session plan generation failed.");
        }
        return output;
    }
);

// ===== إنشاء وحدة محاضرة كاملة =====
createGenkitFlow(
    'create-lecture-unit',
    'academic' as FlowCategory,
    'إنشاء وحدة محاضرة كاملة تشمل المحاضرة النظرية والجلسة العملية',
    CreateLectureUnitInputSchema,
    CreateLectureUnitOutputSchema,
    async (input: CreateLectureUnitInput) => {
        const { lectureTopic, subTopics, professorNotes, sessionDuration, numActivities, targetAudience } = input;

        // الخطوة 1: توليد المحاضرة النظرية
        console.log(`Generating theoretical lecture for: ${lectureTopic}`);
        const theoreticalLectureInput: GenerateTheoreticalLectureInput = {
            lectureTopic,
            subTopics,
            professorNotes,
            targetAudience
        };
        const theoreticalLectureOutput = await generateTheoreticalLecture(theoreticalLectureInput);
        console.log('Theoretical lecture generated successfully.');

        // الخطوة 2: توليد الجلسة العملية باستخدام محتوى المحاضرة الجديد
        console.log(`Generating practical session for: ${lectureTopic}`);
        const practicalSessionInput: GenerateSessionPlanInput = {
            chapterContent: theoreticalLectureOutput.lectureContent,
            sessionDuration,
            numActivities,
            targetAudience
        };
        const practicalSessionOutput = await generateSessionPlan(practicalSessionInput);
        console.log('Practical session generated successfully.');

        return {
            theoreticalLecture: theoreticalLectureOutput,
            practicalSession: practicalSessionOutput,
            progress: 'Generated complete lecture unit with both theoretical and practical components.' as const
        };
    }
);

// ===== تصدير الدوال للاستخدام الخارجي =====

export async function analyzeAcademicDocument(input: z.infer<typeof AnalyzeDocumentInputSchema>): Promise<AnalyzedDocument> {
    const validation = AnalyzeDocumentInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for analyzeAcademicDocument: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'analyzeAcademicDocumentFlow',
        inputSchema: AnalyzeDocumentInputSchema,
        outputSchema: AnalyzedDocumentSchema
    }, async (input) => {
        const { output } = await analysisPrompt(input);
        if (!output) throw new Error('Analysis failed to produce an output.');
        output.structuredContent = output.structuredContent.replace(/---/g, '').trim();
        return output;
    })(validation.data);
}

export async function solveAcademicDocument(input: SolveDocumentInput): Promise<SolvedDocument> {
    const validation = SolveDocumentInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for solveAcademicDocument: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'solveAcademicDocumentFlow',
        inputSchema: SolveDocumentInputSchema,
        outputSchema: SolvedDocumentSchema
    }, async (input) => {
        const { output } = await solvePrompt(input);
        if (!output) throw new Error('Solution failed to produce an output.');
        output.solutions = output.solutions.map((solution: any) => ({ ...solution, solution: solution.solution.replace(/---/g, '').trim() }));
        return output;
    })(validation.data);
}

export async function generateTheoreticalLecture(input: GenerateTheoreticalLectureInput): Promise<GenerateTheoreticalLectureOutput> {
    const validation = GenerateTheoreticalLectureInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateTheoreticalLecture: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateTheoreticalLectureFlow',
        inputSchema: GenerateTheoreticalLectureInputSchema,
        outputSchema: GenerateTheoreticalLectureOutputSchema
    }, async (input) => {
        const { output } = await generateTheoreticalLecturePrompt(input);
        if (!output) throw new Error("Theoretical lecture generation failed.");
        return output;
    })(validation.data);
}

export async function generateSessionPlan(input: GenerateSessionPlanInput): Promise<GenerateSessionPlanOutput> {
    const validation = GenerateSessionPlanInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateSessionPlan: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateSessionPlanFlow',
        inputSchema: GenerateSessionPlanInputSchema,
        outputSchema: GenerateSessionPlanOutputSchema
    }, async (input) => {
        const { output } = await generateSessionPlanPrompt(input);
        if (!output) throw new Error("Session plan generation failed.");
        return output;
    })(validation.data);
}

export async function createLectureUnit(input: CreateLectureUnitInput): Promise<CreateLectureUnitOutput> {
    const validation = CreateLectureUnitInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for createLectureUnit: ${JSON.stringify(validation.error.format())}`);
    }

    const { lectureTopic, subTopics, professorNotes, sessionDuration, numActivities, targetAudience } = validation.data;

    // الخطوة 1: توليد المحاضرة النظرية
    console.log(`Generating theoretical lecture for: ${lectureTopic}`);
    const theoreticalLectureInput: GenerateTheoreticalLectureInput = {
        lectureTopic,
        subTopics,
        professorNotes,
        targetAudience
    };
    const theoreticalLectureOutput = await generateTheoreticalLecture(theoreticalLectureInput);
    console.log('Theoretical lecture generated successfully.');

    // الخطوة 2: توليد الجلسة العملية باستخدام محتوى المحاضرة الجديد
    console.log(`Generating practical session for: ${lectureTopic}`);
    const practicalSessionInput: GenerateSessionPlanInput = {
        chapterContent: theoreticalLectureOutput.lectureContent,
        sessionDuration,
        numActivities,
        targetAudience
    };
    const practicalSessionOutput = await generateSessionPlan(practicalSessionInput);
    console.log('Practical session generated successfully.');

    return {
        theoreticalLecture: theoreticalLectureOutput,
        practicalSession: practicalSessionOutput,
        // progress: 'Generated complete lecture unit with both theoretical and practical components.' as const
    };
}
