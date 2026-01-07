
import type { PptxStyleOptions } from '@/ai/schemas/template-schemas';
import z from 'zod';
import { type BaseTemplateProperties } from './template';

// Corresponds to PptxTemplateSchema from the Zod schemas
export interface PptxTemplateProperties extends BaseTemplateProperties {
  styles: PptxStyleOptions;
  imageUrl: string;
  dataAiHint: string;
  templateUrl?: string; // Optional URL to a .pptx file
}

export const PptxTemplatePropertiesSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  styles: z.array(z.string()),
  imageUrl: z.string().optional(),
  createdAt: z.string(),
});
export const DocxTemplatePropertiesSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  styles: z.array(z.string()),
  imageUrl: z.string().optional(),
  createdAt: z.string(),
})
