'use server';

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import {
    analyzeDocumentStructureTool,
    analyzeToneTool,
    checkLogicalFlowTool,
} from '@/modules/ai/infrastructure/tools';
import { 
    ProfessionalDocumentWriterInputSchema, 
    ProfessionalDocumentWriterOutputSchema 
} from '@/modules/ai/infrastructure/tools/schemas';
import { RECOMMENDED_TEMPERATURES } from '@/modules/ai/domain/utils/json-output-validator';
import { z } from 'zod';

export type ProfessionalDocumentWriterInput = z.infer<typeof ProfessionalDocumentWriterInputSchema>;
export type ProfessionalDocumentWriterOutput = z.infer<typeof ProfessionalDocumentWriterOutputSchema>;

export const professionalDocumentWriterFlow = ai.defineFlow(
    {
        name: 'professionalDocumentWriterFlow',
        inputSchema: ProfessionalDocumentWriterInputSchema,
        outputSchema: ProfessionalDocumentWriterOutputSchema,
    },
    async (input) => {
        const result = await ai.generate({
            prompt: `Write a professional document for audience ${input.targetAudience} with purpose ${input.purpose}`,
            tools: [analyzeDocumentStructureTool, analyzeToneTool, checkLogicalFlowTool],
            config: { temperature: RECOMMENDED_TEMPERATURES.BALANCED }
        });
        
        const text = result.text || '';
        
        return {
            document: text,
            structure: {
                introduction: 'Introduction',
                mainSections: [],
                conclusion: 'Conclusion'
            },
            qualityMetrics: {
                structureScore: 80,
                flowScore: 80,
                toneAlignment: 0.8,
                wordCount: text.split(' ').length
            },
            improvements: {
                applied: [],
                suggestions: []
            }
        };
    }
);
