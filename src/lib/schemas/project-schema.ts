import { z } from 'zod';

const SectionDataSchema = z.object({
    title: z.string(),
    content: z.string(),
});

export const ProjectStateSchema = z.object({
    currentProjectId: z.string().nullable().optional(),
    name: z.string().optional(),
    projectIdea: z.string().optional(),
    sections: z.record(z.string(), SectionDataSchema).optional(),
    sectionsOrder: z.array(z.string()).optional(),
    externalContext: z.array(z.any()).nullable().optional(),
});