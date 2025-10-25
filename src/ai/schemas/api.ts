
import { z } from 'zod';
import { AgentPromptSchema } from './template-schemas';

export const ApiUpdateAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  prompt: z.union([z.string().min(10), AgentPromptSchema]).optional(),
  isEnabled: z.boolean().optional(),
  category: z.string().optional(),
});

export const ApiTranslateTextSchema = z.object({
  text: z.string(),
  targetLang: z.string(),
});
