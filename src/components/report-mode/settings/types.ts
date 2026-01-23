/**
 * Types for Project Settings
 */

import { z } from 'zod';
import { LanguageSchema, BehaviorSchema, CitationStyleSchema } from '@/lib/models';

export const settingsSchema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  projectDescription: z.string().optional(),
  projectType: z.string().optional(),
  specialization: z.string().optional(),
  university: z.string().optional(),
  supervisor: z.string().optional(),
  course: z.string().optional(),
  educationalLevel: z.string().optional(),
  teamMembers: z.string().optional(),
  language: LanguageSchema.optional(),
  complexity: z.number().min(0).max(100).optional(),
  formality: z.number().min(0).max(100).optional(),
  tone: z.string().optional(),
  behaviors: z.array(BehaviorSchema).optional(),
  rules: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  citationStyle: z.string().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
