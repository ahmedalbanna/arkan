import { table } from 'console';
import { sub } from 'date-fns';
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
    valign: z.enum(['top', 'middle', 'bottom']).optional(),
  }),
  body: z.object({
    fontFace: z.string(),
    fontSize: z.number(),
    color: z.string(),
    align: z.enum(['left', 'center', 'right']),
    lineSpacing: z.number(),
    valign: z.enum(['top', 'middle', 'bottom']),
  }),
  bullet: z.object({
    type: z.enum(['bullet', 'number']),
    code: z.any().optional(), // Allow any type for 'code' property
  }),
  subtitle: z.object({
    fontFace: z.string().optional(),
    fontFamily: z.string().optional(),
    fontSize: z.number(),
    italic: z.boolean(),
    color: z.string(),
  }),
  blockquote: z.object({
    color: z.string(),
    italic: z.boolean(),
    indent: z.number(),
  }),
  table: z.object({
    border: z.object({ type: z.string(), pt: z.number(), color: z.string() }).optional(),
    fontFace: z.string(),
    fontSize: z.number(),
    color: z.string(),
    valign: z.enum(['top', 'middle', 'bottom']),
    align: z.enum(['left', 'center', 'right']),
  }),
  tableHeaderStyle: z.object({
    bold: z.boolean(),
    fill: z.object({ color: z.string() }),
    color: z.string().optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    valign: z.enum(['top', 'middle', 'bottom']).optional(),
    fontFace: z.string().optional(),
    fontSize: z.number().optional(),
  }),
  tableCellStyle: z.object({
    fontFace: z.string().optional(),
    fontSize: z.number().optional(),
    color: z.string().optional(),
    valign: z.enum(['top', 'middle', 'bottom']).optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
  }),
  code: z.object({
    fontFace: z.string(),
    fontSize: z.number(),
    color: z.string().optional(),
    fill: z.object({ color: z.string() }),
    margin: z.number(),
    valign: z.enum(['top', 'middle', 'bottom']).optional(),
  }),
  link: z.object({
    color: z.string(),
    underline: z.boolean(),
  }),
  inlineCode: z.object({
    fontFace: z.string(),
    color: z.string(),
    highlight: z.string(),
    fontSize: z.number().optional(),
  }),
  footnote: z.object({
    fontFace: z.string().optional(),
    fontSize: z.number(),
    color: z.string(),
    lineColor: z.string().optional(),
  }).optional(),
  border: z.object({
    type: z.string(),
    pt: z.number(),
    color: z.string(),
  }),
});

// PPTX Template
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
