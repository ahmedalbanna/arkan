
import { z } from 'zod';
import { PresentationToneSchema, ReportToneSchema, LanguageSchema, DiagramTypeSchema } from './enums';
import { AnalysisType, ManipulationType, ProcessingAction, UtilityAction } from '@/lib/models';

export const GenerationControlStateSchema = z.object({
    type: z.custom<AnalysisType>().default('generation'),
    
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
        diagram: z.boolean().default(false), // New
    }).default({ heading: true, paragraph: true, list: false, table: false, code: false, diagram: false }),
    wordCount: z.string().default(''),
    outputDiagramType: DiagramTypeSchema.optional(), // New

    // Diagram Controls
    diagramType: DiagramTypeSchema.default('useCase'),
    description: z.string().optional(),

    // Presentation Controls
    presentationTone: PresentationToneSchema.default('enthusiastic'),
    slideCount: z.string().default('10'),

    // Deprecated/Legacy
    instructionText: z.string().optional(),
    processingAction: z.custom<ProcessingAction>().default('extract-text'),
    utilityAction: z.custom<UtilityAction>().default('generate-toc'),
    manipulationType: z.custom<ManipulationType>().default('rewrite'),
    analysisType: z.custom<AnalysisType>().default('custom-analysis'),
    rewriteStyle: z.string().optional(),
    compressionRatio: z.number().optional(),
});

export type GenerationControlState = z.infer<typeof GenerationControlStateSchema>;

export const defaultControls: GenerationControlState = GenerationControlStateSchema.parse({});
