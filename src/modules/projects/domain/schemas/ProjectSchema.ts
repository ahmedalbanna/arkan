
import { z } from 'zod';
import { 
  SectionPropertiesSchema, 
  ChapterPropertiesSchema,
  LanguageSchema,
  ToneSchema,
  BehaviorSchema
} from '@/modules/ai-content/domain/schemas';

// Schema for metadata, ensuring author and updated fields are strings
export const MetaSchema = z.object({
  author: z.string().min(1, 'Author is required').optional(), // Made optional to match ProjectProperties
  version: z.string().default('1.0.0').optional(),
  updated: z.string().datetime('Invalid date format').optional(),
  created: z.string().datetime('Invalid date format').optional(),
  tags: z.array(z.string()).default([]).optional(),
});

// A discriminated union to handle both Chapters and Sections in the content array
const ContentItemSchema = z.discriminatedUnion('itemType', [
  ChapterPropertiesSchema.extend({ itemType: z.literal('chapter') }),
  SectionPropertiesSchema.extend({ itemType: z.literal('section') }),
]);

// The main schema for a Project
export const ProjectSchema = z.object({
  id: z.string().optional(), // ID is optional as it might be generated on creation
  name: z.string().min(1, 'Project name is required').default('Untitled Project'),
  meta: MetaSchema,
  content: z.array(ContentItemSchema).default([]),
});

// Full properties schema for mapping to ProjectProperties
export const ProjectPropertiesSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  projectDescription: z.string().optional(),
  projectType: z.string().optional(),
  specialization: z.string().optional(),
  university: z.string().optional(),
  supervisor: z.string().optional(),
  course: z.string().optional(),
  educationalLevel: z.string().optional(),
  teamMembers: z.array(z.string()).optional(),
  logoUrl: z.string().optional(),
  universityLogoUrl: z.string().optional(),
  content: z.array(z.any()).optional(), // Any here to simplify circular dependency / deep structures
  externalContext: z.array(z.any()).optional(),
  meta: MetaSchema.optional(),
  tableOfContentsMarkdown: z.string().optional(),
  activeSectionId: z.string().optional(),
  language: LanguageSchema.optional(),
  complexity: z.number().optional(),
  formality: z.number().optional(),
  tone: ToneSchema.optional(),
  behaviors: z.array(BehaviorSchema).optional(),
  rules: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  citationStyle: z.string().optional(),
});

// This type can be inferred and used in the application
export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
export type ProjectPropertiesSchemaType = z.infer<typeof ProjectPropertiesSchema>;
