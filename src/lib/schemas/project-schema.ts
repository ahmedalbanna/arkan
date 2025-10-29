import { z } from 'zod';
export const ProjectStateSchema = z.object({
    currentProjectId: z.string().nullable().optional(),
    name: z.string().optional(),
    projectIdea: z.string().optional(),
    sections: z.record(z.string(), z.string()).optional(),
    externalContext: z.array(z.any()).nullable().optional(),
});