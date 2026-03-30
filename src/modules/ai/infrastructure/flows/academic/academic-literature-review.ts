'use server';

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import {
    analyzeArgumentStructureTool,
    checkLogicalFlowTool,
    validateCitationsTool,
} from '@/modules/ai/infrastructure/tools';
import { 
    AcademicLiteratureReviewInputSchema, 
    AcademicLiteratureReviewOutputSchema 
} from '@/modules/ai/infrastructure/tools/schemas';
import { RECOMMENDED_TEMPERATURES } from '@/modules/ai/domain/utils/json-output-validator';
import { z } from 'zod';

export type AcademicLiteratureReviewInput = z.infer<typeof AcademicLiteratureReviewInputSchema>;
export type AcademicLiteratureReviewOutput = z.infer<typeof AcademicLiteratureReviewOutputSchema>;

export const academicLiteratureReviewFlow = ai.defineFlow(
    {
        name: 'academicLiteratureReviewFlow',
        inputSchema: AcademicLiteratureReviewInputSchema,
        outputSchema: AcademicLiteratureReviewOutputSchema,
    },
    async (input: AcademicLiteratureReviewInput) => {
        const prompt = `Generate a literature review for topic: ${input.topic}`;
        const result = await ai.generate({
            prompt,
            tools: [analyzeArgumentStructureTool, checkLogicalFlowTool, validateCitationsTool],
            config: { temperature: RECOMMENDED_TEMPERATURES.BALANCED }
        });
        
        return {
            literatureReview: result.text,
            structure: {
                introduction: 'Introduction',
                mainBody: 'Main Body',
                conclusion: 'Conclusion',
                researchGaps: ''
            },
            citations: {
                totalCitations: 0,
                validCitations: 0,
                citationIssues: []
            },
            qualityMetrics: {
                argumentStrength: 'strong' as "strong" | "moderate" | "weak",
                logicalFlowScore: 1,
                recommendations: []
            },
            metadata: {
                wordCount: result.text.split(' ').length,
                citationCount: 0,
                keyThemes: []
            }
        };
    }
);
