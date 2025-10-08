import { z } from 'zod';
import { TaskTypeSchema } from './task-types';

export const ModelConfigSchema = z.object({
  modelId: z.string(),
  temperature: z.number().min(0).max(1),
  maxOutputTokens: z.number().int().positive(),
  topP: z.number().min(0).max(1).optional(),
  topK: z.number().int().positive().optional(),
  reasoning: z.string(),
});

export const ModelSelectionCriteriaSchema = z.object({
  taskType: TaskTypeSchema,
  contentComplexity: z.enum(['low', 'medium', 'high', 'expert']),
  outputLength: z.enum(['short', 'medium', 'long', 'very_long']),
  accuracyRequirement: z.enum(['standard', 'high', 'critical']),
  speedRequirement: z.enum(['fast', 'balanced', 'quality_first']),
  contextSize: z.number().nonnegative(),
  languageRequirement: z.enum(['ar', 'en', 'multilingual']),
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type ModelSelectionCriteria = z.infer<typeof ModelSelectionCriteriaSchema>;
