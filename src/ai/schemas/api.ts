

import { z } from 'zod';
import { AcademicDocumentTypeSchema } from './enums';
import { AnalyzedDocumentSchema, PresentationHistoryEntrySchema } from './flows';
import { ProjectPlanSchema, ProjectProposalSchema } from './project';
import { AgentPromptSchema } from './template-schemas';


export const ApiAnalyzeSchema = z.object({
    documentType: AcademicDocumentTypeSchema,
    markdown: z.string().min(20, 'Markdown content is too short.'),
});

export const ApiSolveSchema = z.object({
    analyzedDocument: AnalyzedDocumentSchema,
    contextMarkdown: z.string().optional(),
});

export const ApiUpdateAgentSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    prompt: z.union([z.string().min(10), AgentPromptSchema]).optional(),
    isEnabled: z.boolean().optional(),
    category: z.string().optional(),
});

export const ApiTranslatePresentationSchema = z.object({
    presentation: PresentationHistoryEntrySchema,
    targetLang: z.string(),
});

export const ApiTranslateProposalSchema = z.object({
    proposal: ProjectProposalSchema,
    targetLang: z.string(),
});

export const ApiTranslateTextSchema = z.object({
    text: z.string(),
    targetLang: z.string(),
});

export const ApiGeneratePresentationSchema = z.object({
    proposal: z.lazy(() => ProjectProposalSchema).nullable().optional(),
    projectPlan: z.lazy(() => ProjectPlanSchema).nullable().optional(),
    sourceDocuments: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
    })).min(1, "At least one source document is required."),
});
