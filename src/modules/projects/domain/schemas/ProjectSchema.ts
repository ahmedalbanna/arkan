
import { z } from 'zod';

// Schema for metadata, ensuring author and updated fields are strings
const MetaSchema = z.object({
  author: z.string().min(1, 'Author is required'),
  title: z.string().default('Untitled Project'),
  updated: z.string().datetime('Invalid date format'),
  created: z.string().datetime('Invalid date format').optional(),
  tags: z.array(z.string()).default([]),
});

// Base schema for a Section
const SectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().default('Untitled Section'),
  content: z.string().default(''),
  itemType: z.literal('section'),
});

// Schema for a Chapter, which can contain sections
const ChapterSchema = z.object({
  id: z.string().min(1),
  title: z.string().default('Untitled Chapter'),
  itemType: z.literal('chapter'),
  sections: z.array(SectionSchema).default([]),
});

// A discriminated union to handle both Chapters and Sections in the content array
const ContentItemSchema = z.discriminatedUnion('itemType', [
  ChapterSchema,
  SectionSchema,
]);

// The main schema for a Project
export const ProjectSchema = z.object({
  id: z.string().optional(), // ID is optional as it might be generated on creation
  meta: MetaSchema,
  content: z.array(ContentItemSchema).default([]),
});

// This type can be inferred and used in the application
export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
