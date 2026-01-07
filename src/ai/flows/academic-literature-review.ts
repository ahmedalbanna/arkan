

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
import { z } from 'genkit';

// Input/Output Schemas
export const AcademicLiteratureReviewInputSchema = z.object({
  topic: z.string().min(10, 'Topic must be at least 10 characters').describe('The research topic for the literature review'),
  keywords: z.array(z.string()).min(1).describe('Key research keywords to focus on'),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA').describe('Citation style to use'),
  focusAreas: z.array(z.string()).optional().describe('Specific focus areas within the topic'),
  minLength: z.number().min(500).default(800).describe('Minimum word count for the review'),
  includeGaps: z.boolean().default(true).describe('Whether to identify research gaps'),
});

export const AcademicLiteratureReviewOutputSchema = z.object({
  literatureReview: z.string().describe('The complete literature review text'),
  structure: z.object({
    introduction: z.string(),
    mainBody: z.string(),
    researchGaps: z.string().optional(),
    conclusion: z.string(),
  }).describe('Structured sections of the review'),
  citations: z.object({
    totalCitations: z.number(),
    validCitations: z.number(),
    citationIssues: z.array(z.string()),
  }).describe('Citation validation results'),
  qualityMetrics: z.object({
    argumentStrength: z.enum(['strong', 'moderate', 'weak']),
    logicalFlowScore: z.number().min(0).max(1),
    recommendations: z.array(z.string()),
  }).describe('Quality assessment metrics'),
  metadata: z.object({
    wordCount: z.number(),
    citationCount: z.number(),
    keyThemes: z.array(z.string()),
  }),
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

    const draftPrompt = ai.definePrompt(
      {
        name: 'literatureReviewDraftPrompt',
        input: { schema: AcademicLiteratureReviewInputSchema },
        output: { schema: z.object({ draftText: z.string() }) },
        model: 'googleai/gemini-2.0-flash-lite',
      },
      `You are an expert academic researcher specializing in literature reviews.

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

**Important Citation Guidelines for ${citationStyle}:**
${getCitationGuidelines(citationStyle)}

Write the literature review now, including proper citations throughout.`
    );

    const { output: draftOutput } = await draftPrompt(input);

    if (!draftOutput?.draftText) {
      throw new Error('Failed to generate literature review draft');
    }

    const draftText = draftOutput.draftText;

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
      const refinementPrompt = ai.definePrompt(
        {
          name: 'literatureReviewRefinementPrompt',
          input: {
            schema: z.object({
              originalText: z.string(),
              citationIssues: z.array(z.string()),
              argumentSuggestions: z.array(z.string()),
              flowSuggestions: z.array(z.string()),
              citationStyle: z.string(),
            })
          },
          output: { schema: z.object({ refinedText: z.string() }) },
          model: 'googleai/gemini-2.0-flash-lite',
        },
        `You are an expert academic editor. Refine the following literature review based on the feedback below.

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

Provide the refined literature review text.`
      );

      const { output: refinedOutput } = await refinementPrompt({
        originalText: draftText,
        citationIssues: citationValidation.suggestions,
        argumentSuggestions: argumentAnalysis.suggestions,
        flowSuggestions: flowAnalysis.recommendations,
        citationStyle: citationStyle,
      });

      if (refinedOutput?.refinedText) {
        finalText = refinedOutput.refinedText;
      }
    }

    // ========================================================================
    // STEP 6: Extract Structure
    // ========================================================================
    console.log('STEP 6: Extracting document structure...');

    const structurePrompt = ai.definePrompt(
      {
        name: 'extractStructurePrompt',
        input: { schema: z.object({ text: z.string() }) },
        output: {
          schema: z.object({
            introduction: z.string(),
            mainBody: z.string(),
            researchGaps: z.string().optional(),
            conclusion: z.string(),
          })
        },
        model: 'googleai/gemini-2.0-flash-lite',
      },
      `Extract the main sections from the following literature review:

{{text}}

Return the sections as separate strings.`
    );

    const { output: structure } = await structurePrompt({ text: finalText });

    // ========================================================================
    // STEP 7: Calculate Metadata
    // ========================================================================
    const wordCount = finalText.split(/\s+/).length;
    const citationCount = citationValidation.totalCitations;
    const keyThemes = keywords;

    // ========================================================================
    // Return Final Output
    // ========================================================================
    return {
      literatureReview: finalText,
      structure: structure || {
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
    APA: '- In-text: (Author, Year) or (Author, Year, p. X) for quotes\n- Multiple authors: (Smith & Jones, 2020) or (Smith et al., 2020)',
    MLA: '- In-text: (Author Page) or (Author)\n- Multiple authors: (Smith and Jones 20)',
    Chicago: '- In-text: (Author Year, Page) or footnotes\n- Multiple authors: (Smith and Jones 2020)',
    Harvard: '- In-text: (Author Year) or (Author Year, p. X)\n- Multiple authors: (Smith and Jones 2020)',
    IEEE: '- In-text: [1], [2], [3] in numerical order\n- Multiple: [1]-[3] or [1, 5, 7]',
  };

  return guidelines[style] || guidelines.APA;
}
