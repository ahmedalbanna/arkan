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
// Helper for common run properties (IRunOptions)
const DocxRunPropertiesSchema = z.object({
  size: z.union([z.number(), z.string()]).optional(),
  bold: z.boolean().optional(),
  italics: z.boolean().optional(),
  color: z.string().optional(),
  font: z.union([z.string(), z.object({ name: z.string().optional() })]).optional(),
  // Add other IRunOptions properties as needed, or use .passthrough()
}).passthrough();

// Helper for common paragraph properties (Omit<IParagraphOptions, 'children'>)
const DocxParagraphPropertiesSchema = z.object({
  spacing: z.object({
    after: z.number().optional(),
    before: z.number().optional(),
    line: z.number().optional(),
  }).optional(),
  alignment: z.any().optional(), // AlignmentType is an enum, z.any() for simplicity
  indent: z.object({
    left: z.number().optional(),
    hanging: z.number().optional(),
  }).optional(),
  border: z.any().optional(), // Border properties are complex, z.any() for simplicity
  shading: z.object({
    type: z.any().optional(), // ShadingType enum
    fill: z.string().optional(),
  }).optional(),
  bidirectional: z.boolean().optional(),
  outlineLevel: z.number().optional(),
  // Add other IParagraphOptions properties as needed, or use .passthrough()
}).passthrough();

// Schema for IParagraphStyleOptions
const DocxParagraphStyleOptionsSchema = z.object({
  id: z.string(),
  name: z.string(),
  basedOn: z.string().optional(),
  next: z.string().optional(),
  quickFormat: z.boolean().optional(),
  run: DocxRunPropertiesSchema.optional(),
  paragraph: DocxParagraphPropertiesSchema.optional(),
  table: z.any().optional(), // Table properties are complex
  tableRow: z.any().optional(),
  tableCell: z.any().optional(),
  conditionalFormatting: z.any().optional(),
  // Add other IParagraphStyleOptions properties as needed, or use .passthrough()
}).passthrough();

// Schema for ICharacterStyleOptions
const DocxCharacterStyleOptionsSchema = z.object({
  id: z.string(),
  name: z.string(),
  basedOn: z.string().optional(),
  run: DocxRunPropertiesSchema.optional(),
  // Add other ICharacterStyleOptions properties as needed, or use .passthrough()
}).passthrough();

// Schema for IStylesOptions (main styles object)
export const DocxStyleOptionsSchema = z.object({
  default: z.object({
    document: z.object({
      run: DocxRunPropertiesSchema.optional(),
    }).optional(),
    heading1: DocxParagraphStyleOptionsSchema.optional(),
    heading2: DocxParagraphStyleOptionsSchema.optional(),
    heading3: DocxParagraphStyleOptionsSchema.optional(),
    heading4: DocxParagraphStyleOptionsSchema.optional(),
    heading5: DocxParagraphStyleOptionsSchema.optional(),
    heading6: DocxParagraphStyleOptionsSchema.optional(),
  }).optional(),
  paragraphStyles: z.array(DocxParagraphStyleOptionsSchema).optional(),
  characterStyles: z.array(DocxCharacterStyleOptionsSchema).optional(),
  // Add other IStylesOptions properties as needed, or use .passthrough()
}).passthrough();

// DOCX Template
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
    fontFace: z.string(),
    fontSize: z.number(),
    color: z.string(),
    italic: z.boolean(),
    indent: z.number(),
    lineSpacing: z.number().optional(),
    valign: z.enum(['top', 'middle', 'bottom']).optional(),
  }),
  table: z.object({
    color: z.string(),
    fontFace: z.string(),
    fontSize: z.number(),
    align: z.enum(['left', 'center', 'right']),
    valign: z.enum(['top', 'middle', 'bottom']),
    border: z.object({ type: z.enum(['none', 'solid', 'dash']), color: z.string(), pt: z.number() }).optional(),
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
