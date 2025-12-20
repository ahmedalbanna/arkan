

import { z } from 'zod';
import { DiagramTypeSchema, LanguageSchema, PresentationToneSchema, PresentationTypeSchema, ReportToneSchema } from './enums';

export const GenerationControlStateSchema = z.object({
    // Report Controls
    formality: z.number().min(0).max(100).default(50),
    complexity: z.number().min(0).max(100).default(50),
    academicLevel: z.number().min(0).max(100).default(50),
    styleFocus: z.number().min(0).max(100).default(50).describe('A slider from 0 (analytical) to 100 (creative writer).'),
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
    programmingLanguage: z.string().optional(), // New field for code language

    // Presentation Controls
    presentationType: PresentationTypeSchema.default('informative'),
    presentationTone: PresentationToneSchema.default('enthusiastic'),
});

export type GenerationControlState = z.infer<typeof GenerationControlStateSchema>;

export const defaultControls: GenerationControlState = GenerationControlStateSchema.parse({});
