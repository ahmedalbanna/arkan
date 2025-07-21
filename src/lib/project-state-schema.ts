
'use server';

import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, PresentationSlideSchema } from '@/ai/schemas';

// This schema is defined in a separate, server-only file to prevent circular dependencies
// that can occur when client and server modules import from the same files (e.g., types.ts and schemas.ts).
export const ProjectStateSchema = z.object({
    projectIdea: z.string().optional(),
    proposal: z.lazy(() => ProjectProposalSchema).nullable(),
    sections: z.record(SectionNameSchema, z.string()).optional(),
    diagrams: z.record(DiagramTypeSchema, z.object({ plantUmlCode: z.string(), imageUrl: z.string() })).optional(),
    presentation: z.object({ history: z.array(z.object({ id: z.string(), name: z.string(), slides: z.array(PresentationSlideSchema) })) }).optional(),
});
