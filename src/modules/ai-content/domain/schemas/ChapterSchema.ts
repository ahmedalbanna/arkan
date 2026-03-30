
import { z } from 'zod';
import { SectionPropertiesSchema } from './SectionSchema';

export const ChapterPropertiesSchema = z.object({
  id: z.string(),
  title: z.string(),
  itemType: z.literal('chapter').optional(),
  sections: z.array(SectionPropertiesSchema).optional(),
});

export const ChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  sections: z.array(SectionPropertiesSchema).default([]),
});

export const CreateChapterSchema = ChapterSchema.omit({
  sections: true
}).extend({
  sections: z.array(z.string()).optional() // IDs
});

export const UpdateChapterSchema = ChapterSchema.partial().extend({
  id: z.string()
});
