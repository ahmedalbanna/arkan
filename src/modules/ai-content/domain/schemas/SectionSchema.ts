
import { z } from 'zod';
import { 
  SectionTypeSchema, 
  type SectionType, 
  GenerationControlStateSchema,
  BaseSectionContextSchema
} from './ControlTypesSchema';

export { SectionTypeSchema, type SectionType };

export const SectionStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'failed']);
export type SectionStatus = z.infer<typeof SectionStatusSchema>;

export const SectionContextSchema = z.object({
  sections: z.record(z.string(), z.string()).optional(),
  externalContext: z.record(z.string(), z.string()).optional(),
});
export type SectionContext = z.infer<typeof SectionContextSchema>;

export const SectionPropertiesSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: SectionTypeSchema.optional(),
  content: z.string().optional(),
  status: SectionStatusSchema.optional(),
  progress: z.number().optional(),
  aiOutput: z.any().optional(),
  lastUpdated: z.string().optional(),
  with: z.array(z.string()).optional(),
  controls: z.any().optional(), // Use any for raw data, cast to GenerationControlState in class
  prompt: z.string().optional(),
  rules: z.array(z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  behaviors: z.array(z.string()).optional(),
  context: SectionContextSchema.optional(),
});

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
