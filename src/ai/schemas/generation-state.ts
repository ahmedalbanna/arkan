
import { z } from 'zod';
import { LanguageSchema, SectionTypeSchema, ToneSchema } from './enums';
import { AnalysisType, ManipulationType, ProcessingAction } from '@/lib/models';

export const GenerationControlStateSchema = z.object({
    type: SectionTypeSchema.default('generation'),
    formality: z.number().min(0).max(100).default(50),
    complexity: z.number().min(0).max(100).default(50),
    tone: ToneSchema.default('professional'),
    language: LanguageSchema.default('default'),
    outputStyle: z.object({
        heading: z.boolean().default(true),
        paragraph: z.boolean().default(true),
        list: z.boolean().default(false),
        table: z.boolean().default(false),
        code: z.boolean().default(false),
    }).default({ heading: true, paragraph: true, list: false, table: false, code: false }),
    wordCount: z.string().default(''),
    instructionText: z.string().optional(),

    // Text manipulation
    manipulationType: z.custom<ManipulationType>().default('rewrite'),
    rewriteStyle: z.string().optional().default('Formal'),
    compressionRatio: z.number().optional().default(50),
    targetAudience: z.string().optional(),
    targetLevel: z.enum(['elementary', 'middle-school', 'high-school', 'college', 'graduate']).optional(),
    targetReduction: z.number().optional().default(0),
    focusAreas: z.array(z.string()).optional().default([]),

    // Analysis
    analysisType: z.custom<AnalysisType>().default('custom-analysis'),
    question: z.string().optional(),
    factQuery: z.string().optional(),

    // Document Processing
    sourceFileId: z.string().optional(),
    processingAction: z.custom<ProcessingAction>().default('extract-text'),
});

export type GenerationControlState = z.infer<typeof GenerationControlStateSchema>;

export const defaultControls: GenerationControlState = GenerationControlStateSchema.parse({});
