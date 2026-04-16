
import { z } from 'zod';

const ProjectSectionNodeSchema = z.object({
  kind: z.literal('section'),
  id: z.string(),
  title: z.string(),
  type: z.string().optional(),
  content: z.string().optional(),
  lastUpdated: z.string().optional(),
  controls: z.record(z.unknown()).optional(),
  context: z
    .object({
      sections: z.record(z.string()).optional(),
      externalContext: z.record(z.string()).optional(),
    })
    .optional(),
});

const ProjectChapterNodeSchema = z.object({
  kind: z.literal('chapter'),
  id: z.string(),
  title: z.string(),
  sections: z.array(ProjectSectionNodeSchema),
});

// Schema for metadata, ensuring author and updated fields are strings
export const MetaSchema = z.object({
  author: z.string().min(1, 'Author is required').optional(), // Made optional to match ProjectProperties
  version: z.string().default('1.0.0').optional(),
  updated: z.string().datetime('Invalid date format').optional(),
  created: z.string().datetime('Invalid date format').optional(),
  tags: z.array(z.string()).default([]).optional(),
});

// A discriminated union to handle both chapters and sections in the content array
const ContentItemSchema = z.discriminatedUnion('kind', [ProjectChapterNodeSchema, ProjectSectionNodeSchema]);

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
  language: z.string().optional(),
  complexity: z.number().optional(),
  formality: z.number().optional(),
  tone: z.string().optional(),
  behaviors: z.array(z.record(z.unknown())).optional(),
  rules: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  citationStyle: z.string().optional(),
});

// This type can be inferred and used in the application
export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
export type ProjectPropertiesSchemaType = z.infer<typeof ProjectPropertiesSchema>;
