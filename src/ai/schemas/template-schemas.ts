import { z } from 'zod';

// Base schema for common template fields
const BaseTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

// Agent Prompt schema
export const AgentPromptSchema = z.object({
    base: z.string().min(1, "Base prompt is required."),
    guidelines: z.array(z.object({
        text: z.string(),
        isDefault: z.boolean(),
    })).optional(),
    jsonStructure: z.any().optional(),
});


// DOCX Styles
export const DocxStyleOptionsSchema = z.object({}).passthrough(); // Use passthrough for complex, nested docx styles
export const DocxTemplateSchema = BaseTemplateSchema.extend({
  styles: DocxStyleOptionsSchema,
  imageUrl: z.string().url(),
  dataAiHint: z.string(),
});

// PPTX Styles
export const PptxStyleOptionsSchema = z.object({
  background: z.object({ color: z.string() }),
  title: z.object({
    fontFace: z.string(),
    fontSize: z.number(),
    bold: z.boolean(),
    color: z.string(),
    align: z.enum(['left', 'center', 'right']),
  }),
  body: z.object({
    fontFace: z.string(),
    fontSize: z.number(),
    color: z.string(),
    align: z.enum(['left', 'center', 'right']),
  }),
  bullet: z.object({ type: z.enum(['bullet', 'number']) }),
});
export const PptxTemplateSchema = BaseTemplateSchema.extend({
  styles: PptxStyleOptionsSchema,
  imageUrl: z.string().url(),
  dataAiHint: z.string(),
});

// Proposal Template
export const ProposalTemplateSchema = BaseTemplateSchema.extend({
  prompt: z.string(),
  guidelines: z.array(z.string()).optional(),
  jsonStructure: z.any().optional(),
});
export const CreateProposalTemplateSchema = ProposalTemplateSchema.omit({ id: true }).extend({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
});
export const UpdateProposalTemplateSchema = ProposalTemplateSchema.omit({ id: true }).partial();

// Report Generation Template
export const ReportGenerationTemplateSchema = BaseTemplateSchema.extend({
  sectionIds: z.array(z.string()).min(1, 'At least one agent must be selected.'),
  isDefault: z.boolean().optional(),
});
export const CreateReportTemplateSchema = ReportGenerationTemplateSchema.omit({ id: true }).extend({
    id: z.string().min(3).regex(/^[a-z0-9-]+$/),
});
export const UpdateReportTemplateSchema = ReportGenerationTemplateSchema.omit({ id: true }).partial();


// Presentation Generation Template
export const PresentationGenerationTemplateSchema = BaseTemplateSchema.extend({
  primaryAgentId: z.string(),
  relevantReportSectionIds: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
});
export const CreatePresentationTemplateSchema = PresentationGenerationTemplateSchema.omit({ id: true }).extend({
    id: z.string().min(3).regex(/^[a-z0-9-]+$/),
});
export const UpdatePresentationTemplateSchema = PresentationGenerationTemplateSchema.omit({ id: true }).partial();
