
import { z } from 'zod';
import { PresentationToneSchema, ReportToneSchema, LanguageSchema, DiagramTypeSchema, PresentationTypeSchema } from './enums';

export const GenerationControlStateSchema = z.object({
    // Report Controls
    formality: z.number().min(0).max(100).default(50),
    complexity: z.number().min(0).max(100).default(50),
    tone: ReportToneSchema.default('professional'),
    language: LanguageSchema.default('default'),
    outputStyle: z.object({
        heading: z.boolean().default(true),
        paragraph: z.boolean().default(true),
        list: z.boolean().default(false),
        table: z.boolean().default(false),
        code: z.boolean().default(false),
        diagram: z.boolean().default(false), 
    }).default({ heading: true, paragraph: true, list: false, table: false, code: false, diagram: false }),
    wordCount: z.string().default(''),
    outputDiagramType: DiagramTypeSchema.optional(),

    // Presentation Controls
    presentationType: PresentationTypeSchema.default('informative'),
    presentationTone: PresentationToneSchema.default('enthusiastic'),
    slideCount: z.string().default('10'),
});

export type GenerationControlState = z.infer<typeof GenerationControlStateSchema>;

export const defaultControls: GenerationControlState = GenerationControlStateSchema.parse({});
