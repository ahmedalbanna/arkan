

/**
 * @fileOverview Academic Literature Review Flow
 *
 * This flow generates a comprehensive literature review with proper citations,
 * using AI and professional writing tools to ensure quality and accuracy.
 *
 * Flow Architecture:
 * 1. Generate initial literature review draft
 * 2. Validate citations using citation tools
 * 3. Check argument structure
 * 4. Refine based on tool feedback
 * 5. Return polished literature review
 */

import { ai } from '@/ai/genkit';
import {
    analyzeArgumentStructureTool,
    checkLogicalFlowTool,
    validateCitationsTool,
} from '@/ai/tools';
import { getJsonPromptInstructions, RECOMMENDED_TEMPERATURES, validateJsonOutput } from '@/ai/utils/json-output-validator';
import { z } from 'zod';
// import { AcademicLiteratureReviewInputSchema, AcademicLiteratureReviewOutputSchema } from '../tools/schemas'; // File not found

// Temporary fallback schemas
const AcademicLiteratureReviewInputSchema = z.object({
  topic: z.string(),
  focusAreas: z.array(z.string()).optional(),
  minLength: z.number().optional(),
  includeGaps: z.boolean().optional(),
});
const AcademicLiteratureReviewOutputSchema = z.object({
  review: z.string(),
});

export type AcademicLiteratureReviewInput = z.infer<typeof AcademicLiteratureReviewInputSchema>;
export type AcademicLiteratureReviewOutput = z.infer<typeof AcademicLiteratureReviewOutputSchema>;

/**
 * Academic Literature Review Flow
 *
 * Generates high-quality academic literature reviews with:
 * - Proper citation formatting
 * - Strong argument structure
 * - Logical flow
 * - Research gap identification
 */
export const academicLiteratureReviewFlow = ai.defineFlow(
    {
        name: 'academicLiteratureReview',
        inputSchema: AcademicLiteratureReviewInputSchema,
        outputSchema: AcademicLiteratureReviewOutputSchema,
    },
    async (input) => {
        const { topic, keywords, citationStyle, focusAreas, minLength, includeGaps } = input;

        // ========================================================================
        // STEP 1: Generate Initial Draft
        // ========================================================================
        console.log('STEP 1: Generating initial literature review draft...');

        const draftOutputSchema = z.object({ draftText: z.string() });

        const draftPrompt = ai.definePrompt(
            {
                name: 'literatureReviewDraftPrompt',
                input: { schema: AcademicLiteratureReviewInputSchema },
                output: { schema: draftOutputSchema },
                model: 'ollama/llama3.1:latest',
                config: {
                    responseSchema: draftOutputSchema,
                    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
                },
            },
            `You are an expert academic researcher specializing in literature reviews.

${getJsonPromptInstructions(`{
  "draftText": "Complete literature review text with introduction, body, gaps analysis, conclusion, and proper citations"
}`)}

**Task:** Write a comprehensive literature review on the following topic.

**Topic:** {{topic}}

**Keywords:** {{keywords}}

**Citation Style:** {{citationStyle}}

{{#if focusAreas}}
**Focus Areas:**
{{#each focusAreas}}
- {{this}}
{{/each}}
{{/if}}

**Requirements:**
1. Minimum length: {{minLength}} words
2. Use proper {{citationStyle}} in-text citations (e.g., (Author, Year) for APA)
3. Include multiple perspectives and recent research (2020-2024)
4. Organize into clear sections:
   - Introduction (context and importance)
   - Main body (thematic or chronological organization)
   {{#if includeGaps}}
   - Research gaps identification
   {{/if}}
   - Conclusion (synthesis and future directions)
5. Maintain critical and analytical tone
6. Ensure logical flow between paragraphs

**Important Citation Guidelines for {{citationStyle}}:**
${getCitationGuidelines(citationStyle || 'APA')}

**JSON Output:**`
        );

        const { output: draftOutput } = await draftPrompt(input);

        if (!draftOutput) {
            throw new Error('Failed to generate literature review draft - no output');
        }

        // التحقق والتنظيف
        const draftValidation = validateJsonOutput({
            schema: draftOutputSchema,
            output: draftOutput,
            flowName: 'academicLiteratureReview[draft]',
            attemptRecovery: true,
            enableLogging: true,
            fallbackFn: (rawOutput) => {
                if (typeof rawOutput === 'string') {
                    return { draftText: rawOutput };
                }
                return null;
            },
        });

        if (!draftValidation.success || !draftValidation.data?.draftText) {
            throw new Error('Failed to generate valid literature review draft');
        }

        const draftText = draftValidation.data.draftText;

        // ========================================================================
        // STEP 2: Validate Citations
        // ========================================================================
        console.log('STEP 2: Validating citations...');

        const citationValidation = await validateCitationsTool({
            text: draftText,
            citationStyle: citationStyle,
        });

        // ========================================================================
        // STEP 3: Check Argument Structure
        // ========================================================================
        console.log('STEP 3: Analyzing argument structure...');

        const argumentAnalysis = await analyzeArgumentStructureTool({
            text: draftText,
        });

        // ========================================================================
        // STEP 4: Check Logical Flow
        // ========================================================================
        console.log('STEP 4: Checking logical flow...');

        const flowAnalysis = await checkLogicalFlowTool({
            text: draftText,
        });

        // ========================================================================
        // STEP 5: Refine Based on Feedback
        // ========================================================================
        console.log('STEP 5: Refining based on tool feedback...');

        const hasIssues =
            citationValidation.invalidCitations > 0 ||
            argumentAnalysis.overallStrength === 'weak' ||
            flowAnalysis.flowScore < 0.7;

        let finalText = draftText;

        if (hasIssues) {
            const refinementOutputSchema = z.object({ refinedText: z.string() });
            const refinementInputSchema = z.object({
                originalText: z.string(),
                citationIssues: z.array(z.string()),
                argumentSuggestions: z.array(z.string()),
                flowSuggestions: z.array(z.string()),
                citationStyle: z.string(),
            });

            const refinementPrompt = ai.definePrompt(
                {
                    name: 'literatureReviewRefinementPrompt',
                    input: { schema: refinementInputSchema },
                    output: { schema: refinementOutputSchema },
                    model: 'ollama/llama3.1:latest',
                    config: {
                        responseSchema: refinementOutputSchema,
                        temperature: RECOMMENDED_TEMPERATURES.PRECISE,
                    },
                },
                `You are an expert academic editor. Refine the following literature review based on the feedback below.

${getJsonPromptInstructions(`{
  "refinedText": "Complete refined literature review text with all improvements applied"
}`)}

**Original Text:**
{{originalText}}

**Citation Issues ({{citationStyle}} style):**
{{#each citationIssues}}
- {{this}}
{{/each}}

**Argument Structure Suggestions:**
{{#each argumentSuggestions}}
- {{this}}
{{/each}}

**Logical Flow Suggestions:**
{{#each flowSuggestions}}
- {{this}}
{{/each}}

**Instructions:**
1. Fix all citation formatting issues according to {{citationStyle}} style
2. Strengthen argument structure by addressing the suggestions
3. Improve logical flow and transitions
4. Maintain the original content and ideas
5. Keep the academic tone and critical analysis

**JSON Output:**`
            );

            const { output: refinedOutput } = await refinementPrompt({
                originalText: draftText,
                citationIssues: citationValidation.suggestions,
                argumentSuggestions: argumentAnalysis.suggestions,
                flowSuggestions: flowAnalysis.recommendations,
                citationStyle: citationStyle,
            });

            if (!refinedOutput) {
                console.warn('Refinement failed - no output, using original draft');
                finalText = draftText;
            } else {
                // التحقق والتنظيف
                const refinementValidation = validateJsonOutput({
                    schema: refinementOutputSchema,
                    output: refinedOutput,
                    flowName: 'academicLiteratureReview[refinement]',
                    attemptRecovery: true,
                    enableLogging: true,
                    fallbackFn: (rawOutput) => {
                        if (typeof rawOutput === 'string') {
                            return { refinedText: rawOutput };
                        }
                        return null;
                    },
                });

                if (!refinementValidation.success || !refinementValidation.data?.refinedText) {
                    console.warn('Refinement validation failed, using original draft');
                    finalText = draftText;
                } else {
                    finalText = refinementValidation.data.refinedText;
                }
            }
        }

        // ========================================================================
        // STEP 6: Extract Structure
        // ========================================================================
        console.log('STEP 6: Extracting document structure...');

        const structureOutputSchema = z.object({
            introduction: z.string(),
            mainBody: z.string(),
            researchGaps: z.string().optional(),
            conclusion: z.string(),
        });

        const structurePrompt = ai.definePrompt(
            {
                name: 'extractStructurePrompt',
                input: { schema: z.object({ text: z.string() }) },
                output: { schema: structureOutputSchema },
                model: 'ollama/llama3.1:latest',
                config: {
                    responseSchema: structureOutputSchema,
                    temperature: RECOMMENDED_TEMPERATURES.PRECISE,
                },
            },
            `You are a text analysis expert. Extract the main sections from the following literature review.

${getJsonPromptInstructions(`{
  "introduction": "Introduction section text",
  "mainBody": "Main body section text",
  "researchGaps": "Research gaps section text (optional)",
  "conclusion": "Conclusion section text"
}`)}

**Literature Review Text:**
{{text}}

**Instructions:**
1. Identify and extract the introduction section
2. Extract the main body (all content between introduction and conclusion)
3. If present, extract the research gaps section
4. Extract the conclusion section
5. Return each section as a separate string

**JSON Output:`
        );

        const { output: structure } = await structurePrompt({ text: finalText });

        // التحقق والتنظيف
        let validatedStructure = null;
        if (structure) {
            const structureValidation = validateJsonOutput({
                schema: structureOutputSchema,
                output: structure,
                flowName: 'academicLiteratureReview[structure]',
                attemptRecovery: true,
                enableLogging: true,
            });

            if (structureValidation.success) {
                validatedStructure = structureValidation.data;
            }
        }

        // ========================================================================
        // STEP 7: Calculate Metadata
        // ========================================================================
        const wordCount = finalText.split(/\s+/).length;
        const citationCount = citationValidation.totalCitations;
        const keyThemes = Array.isArray(keywords) ? keywords : [];


        // ========================================================================
        // Return Final Output
        // ========================================================================
        return {
            literatureReview: finalText,
            structure: validatedStructure || {
                introduction: '',
                mainBody: finalText,
                conclusion: '',
            },
            citations: {
                totalCitations: citationValidation.totalCitations,
                validCitations: citationValidation.validCitations,
                citationIssues: citationValidation.suggestions,
            },
            qualityMetrics: {
                argumentStrength: argumentAnalysis.overallStrength,
                logicalFlowScore: flowAnalysis.flowScore,
                recommendations: [
                    ...argumentAnalysis.suggestions,
                    ...flowAnalysis.recommendations,
                ].slice(0, 5), // Top 5 recommendations
            },
            metadata: {
                wordCount,
                citationCount,
                keyThemes,
            },
        };
    }
);

/**
 * Helper function to get citation guidelines for different styles
 */
function getCitationGuidelines(style: string): string {
    const guidelines: Record<string, string> = {
        APA: '- In-text: (Author, Year) or (Author, Year, p. X) for quotes\n- Multiple authors: (Smith & Jones, 2020) or (Smith et al., 2020) for 3+ authors',
        MLA: '- In-text: (Author Page) or (Author)\n- Multiple authors: (Smith and Jones 20) or (Smith et al. 25)',
        Chicago: '- In-text: (Author Year, Page) or footnotes\n- Multiple authors: (Smith and Jones 2020)',
        Harvard: '- In-text: (Author Year) or (Author Year, p. X)\n- Multiple authors: (Smith and Jones 2020)',
        IEEE: '- In-text: [1], [2], [3] in numerical order\n- Multiple: [1]-[3] or [1, 5, 7]',
    };

    return guidelines[style] || guidelines.APA;
}
