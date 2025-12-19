
import { z } from 'zod';
import { LanguageSchema, ToneSchema } from './enums';
import { AnalysisType, ManipulationType, ProcessingAction, UtilityAction } from '@/lib/models';

export const GenerationControlStateSchema = z.object({
    type: z.custom<AnalysisType>().default('generation'),
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
    
    // Document Processing
    sourceFileId: z.string().optional(),
    processingAction: z.custom<ProcessingAction>().default('extract-text'),
    
    // Utilities
    utilityAction: z.custom<UtilityAction>().default('generate-toc'),
    
    // Text Manipulation
    manipulationType: z.custom<ManipulationType>().default('rewrite'),
    rewriteStyle: z.string().optional(),
    compressionRatio: z.number().optional(),
    targetReduction: z.number().optional(),
    targetLevel: z.string().optional(),
    focusAreas: z.array(z.string()).optional(),
    
    // Analysis
    analysisType: z.custom<AnalysisType>().default('custom-analysis'),
    question: z.string().optional(),
    factQuery: z.string().optional(),
});

export type GenerationControlState = z.infer<typeof GenerationControlStateSchema>;

export const defaultControls: GenerationControlState = GenerationControlStateSchema.parse({});
