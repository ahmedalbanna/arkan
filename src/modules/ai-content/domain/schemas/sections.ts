import { z } from 'zod';
import { SectionStatusSchema, SectionTypeSchema, SectionContextSchema } from '../entities/Section';
import { GenerationControlStateSchema } from '../entities/ControlTypes';

export const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: SectionTypeSchema.default('report'),
  content: z.string().default(''),
  status: SectionStatusSchema.default('pending'),
  progress: z.number().min(0).max(100).default(0),
  aiOutput: z.any().nullable().default(null),
  lastUpdated: z.string().optional(),
  with: z.array(z.string()).default([]),
  controls: GenerationControlStateSchema.optional(),
  prompt: z.string().default(''),
  rules: z.array(z.string()).default([]),
  guidelines: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  behaviors: z.array(z.string()).default([]),
  context: SectionContextSchema.optional(),
});

export const CreateSectionSchema = SectionSchema.omit({ 
  lastUpdated: true,
  status: true,
  progress: true,
  aiOutput: true 
});

export const UpdateSectionSchema = SectionSchema.partial().extend({
  id: z.string()
});
