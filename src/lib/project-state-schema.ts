

import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, PresentationSlideSchema, ProjectPlanSchema } from '@/ai/schemas';
import type { Codebase } from '@/ai/flows/generate-codebase';
import { AcademicDocumentTypeSchema, AnalyzedDocumentSchema, SolvedDocumentSchema } from '@/ai/flows/academic-solver.shared';

// This schema is defined in a separate, server-only file to prevent circular dependencies
// that can occur when client and server modules import from the same files (e.g., types.ts and schemas.ts).
export const ProjectStateSchema = z.object({
    name: z.string().optional(),
    projectIdea: z.string().optional(),
    proposal: z.lazy(() => ProjectProposalSchema).nullable(),
    sections: z.record(SectionNameSchema, z.string()).optional(),
    diagrams: z.record(DiagramTypeSchema, z.object({
        plantUmlCode: z.string(),
        imageUrl: z.string(),
        explanation: z.string().optional(),
    })).optional(),
    presentation: z.object({ history: z.array(z.object({ id: z.string(), name: z.string(), slides: z.array(PresentationSlideSchema) })) }).optional(),
    codeGenerator: z.object({ prompt: z.string(), html: z.string(), css: z.string(), javascript: z.string(), codebase: z.object({ files: z.array(z.object({ path: z.string(), content: z.string() })) }).nullable() }).optional(),
    externalContext: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
        type: z.enum(['context', 'example']),
    })).nullable().optional(),
    teamId: z.string().nullable().optional(), // Add teamId to associate project with a team
    projectPlan: z.lazy(() => ProjectPlanSchema).nullable().optional(),
    academicSolver: z.object({
        stage: z.enum(["idle", "parsing", "analyzing", "readyToSolve", "solving", "solved"]),
        documentType: AcademicDocumentTypeSchema.nullable(),
        analyzedDocument: AnalyzedDocumentSchema.nullable(),
        solvedDocument: SolvedDocumentSchema.nullable(),
        questionDocuments: z.array(z.object({ fileName: z.string(), content: z.string() })),
        externalContext: z.array(z.object({ fileName: z.string(), content: z.string() })),
    }).optional(),
});
