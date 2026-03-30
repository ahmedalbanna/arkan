import { z } from 'zod';
import { SectionPropertiesSchema } from '../entities/Section';

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
