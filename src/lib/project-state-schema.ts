
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, PresentationSlideSchema, ProjectPlanSchema } from '@/ai/schemas';

// This schema is defined in a separate, server-only file to prevent circular dependencies
// that can occur when client and server modules import from the same files (e.g., types.ts and schemas.ts).
export const ProjectStateSchema = z.object({
    name: z.string().optional(),
    projectIdea: z.string().optional(),
    proposal: z.lazy(() => ProjectProposalSchema).nullable(),
    sections: z.record(SectionNameSchema, z.string()).optional(),
    diagrams: z.record(DiagramTypeSchema, z.object({ plantUmlCode: z.string(), imageUrl: z.string() })).optional(),
    presentation: z.object({ history: z.array(z.object({ id: z.string(), name: z.string(), slides: z.array(PresentationSlideSchema) })) }).optional(),
    codeGenerator: z.object({ prompt: z.string(), html: z.string(), css: z.string(), javascript: z.string() }).optional(),
    codebase: z.object({ files: z.array(z.object({ path: z.string(), content: z.string() })) }).nullable().optional(),
    externalContext: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
    })).nullable().optional(),
    teamId: z.string().optional(), // Add teamId to associate project with a team
    projectPlan: z.lazy(() => ProjectPlanSchema).nullable().optional(),
});
