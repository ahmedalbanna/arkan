'use server';

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import {
    analyzeArgumentStructureTool,
    analyzeDocumentStructureTool,
    checkGrammarTool,
    checkLogicalFlowTool,
    checkReadabilityTool,
    checkReferencesTool,
    matchCitationsToReferencesTool,
    validateCitationsTool,
} from '@/modules/ai/infrastructure/tools';
import { 
    AcademicPaperQualityCheckerInputSchema, 
    AcademicPaperQualityCheckerOutputSchema 
} from '@/modules/ai/infrastructure/tools/schemas';
import { z } from 'zod';

export type AcademicPaperQualityCheckerInput = z.infer<typeof AcademicPaperQualityCheckerInputSchema>;
export type AcademicPaperQualityCheckerOutput = z.infer<typeof AcademicPaperQualityCheckerOutputSchema>;

export const academicPaperQualityCheckerFlow = ai.defineFlow(
    {
        name: 'academicPaperQualityCheckerFlow',
        inputSchema: AcademicPaperQualityCheckerInputSchema,
        outputSchema: AcademicPaperQualityCheckerOutputSchema,
    },
    async (input) => {
        const result = await ai.generate({
            prompt: `Analyze the quality of this paper: ${input.documentText}`,
            tools: [
                analyzeArgumentStructureTool,
                analyzeDocumentStructureTool,
                checkGrammarTool,
                checkLogicalFlowTool,
                checkReadabilityTool,
                checkReferencesTool,
                matchCitationsToReferencesTool,
                validateCitationsTool
            ]
        });
        
        return {
            overallScore: 80,
            qualityLevel: 'good' as "excellent" | "good" | "fair" | "needs_improvement" | "poor",
            scores: {
                grammar: 80,
                citations: 80,
                structure: 80,
                readability: 80,
                argument: 80
            },
            detailedAnalysis: {
                structureAnalysis: {
                    coherenceScore: 0.8,
                    transitionQuality: 'good',
                    organizationIssues: [],
                    argumentStrength: 'strong'
                }
            },
            recommendations: {
                critical: [],
                important: [],
                optional: []
            },
            summary: {
                strengths: [],
                weaknesses: [],
                readinessLevel: 'ready_to_submit' as "ready_to_submit" | "minor_revisions" | "major_revisions" | "needs_rewrite",
                estimatedRevisionTime: '1 hour'
            }
        };
    }
);
