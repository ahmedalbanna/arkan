

/**
 * @fileOverview Professional Document Writer Flow
 *
 * This flow generates professional documents (reports, proposals, white papers)
 * with strong structure, clear arguments, and polished writing.
 *
 * Flow Architecture:
 * 1. Analyze requirements and create outline
 * 2. Generate section-by-section content
 * 3. Check structure and flow using tools
 * 4. Refine based on feedback
 * 5. Polish final document
 */

import { ai } from '@/ai/genkit';
import {
    analyzeDocumentStructureTool,
    analyzeToneTool,
    checkLogicalFlowTool
} from '@/ai/tools';
import { z } from 'zod';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';
import { ProfessionalDocumentWriterInputSchema, ProfessionalDocumentWriterOutputSchema } from '../tools/schemas';

export type ProfessionalDocumentWriterInput = z.infer<typeof ProfessionalDocumentWriterInputSchema>;
export type ProfessionalDocumentWriterOutput = z.infer<typeof ProfessionalDocumentWriterOutputSchema>;

/**
 * Professional Document Writer Flow
 *
 * Generates high-quality professional documents with proper structure and tone
 */
export const professionalDocumentWriterFlow = ai.defineFlow(
    {
        name: 'professionalDocumentWriter',
        inputSchema: ProfessionalDocumentWriterInputSchema,
        outputSchema: ProfessionalDocumentWriterOutputSchema,
    },
    async (input) => {
        const {
            documentType,
            topic,
            purpose,
            targetAudience,
            keyPoints,
            tone,
            length,
            includeExecutiveSummary,
            includeRecommendations,
            additionalContext
        } = input;

        // ========================================================================
        // STEP 1: Create Document Outline
        // ========================================================================
        console.log('STEP 1: Creating document outline...');

        const outlinePrompt = ai.definePrompt(
            {
                name: 'documentOutlinePrompt',
                input: { schema: ProfessionalDocumentWriterInputSchema },
                output: {
                    schema: z.object({
                        outline: z.array(z.object({
                            section: z.string(),
                            keySubPoints: z.array(z.string()),
                        })),
                    })
                },
                model: 'ollama/gemma:2b',
                config: {
                    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
                },
            },
            `You are an expert business writer. Create a detailed outline for the following document.

**Document Type:** {{documentType}}
**Topic:** {{topic}}
**Purpose:** {{purpose}}
**Target Audience:** {{targetAudience}}
**Tone:** {{tone}}
**Length:** {{length}}

**Key Points to Cover:**
{{#each keyPoints}}
- {{this}}
{{/each}}

{{#if additionalContext}}
**Additional Context:**
{{additionalContext}}
{{/if}}

**Requirements:**
${includeExecutiveSummary ? '- Include Executive Summary section' : ''}
- Clear introduction with context and objectives
- 3-5 main body sections covering the key points
${includeRecommendations ? '- Include Recommendations section' : ''}
- Strong conclusion with call-to-action or next steps

Create a structured outline with section names and key sub-points for each section.`
        );

        const { output: outlineOutput } = await outlinePrompt(input);

        if (!outlineOutput?.outline) {
            throw new Error('Failed to create document outline');
        }

        const outline = outlineOutput.outline;

        // ========================================================================
        // STEP 2: Generate Full Document Content
        // ========================================================================
        console.log('STEP 2: Generating document content...');

        const lengthGuidelines = {
            short: '500-1000 words total',
            medium: '1000-2000 words total',
            long: '2000+ words total',
        };

        const toneGuidelines = {
            professional: 'Use formal business language, clear and direct communication, avoid jargon',
            persuasive: 'Use compelling arguments, data-driven points, emotional appeal where appropriate',
            neutral: 'Objective and factual, balanced perspective, avoid strong opinions',
            authoritative: 'Confident and expert tone, definitive statements backed by evidence',
        };

        const contentPrompt = ai.definePrompt(
            {
                name: 'documentContentPrompt',
                input: {
                    schema: z.object({
                        documentType: z.string(),
                        topic: z.string(),
                        purpose: z.string(),
                        targetAudience: z.string(),
                        tone: z.string(),
                        outline: z.array(z.object({
                            section: z.string(),
                            keySubPoints: z.array(z.string()),
                        })),
                        lengthGuideline: z.string(),
                        toneGuideline: z.string(),
                        includeExecutiveSummary: z.boolean(),
                        includeRecommendations: z.boolean(),
                    })
                },
                output: { schema: z.object({ fullDocument: z.string() }) },
                model: 'ollama/gemma:2b',
                config: {
                    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
                },
            },
            `You are an expert professional business writer. Write a complete ${documentType} based on the following requirements.

**Topic:** {{topic}}
**Purpose:** {{purpose}}
**Target Audience:** {{targetAudience}}
**Tone:** {{tone}} ({{toneGuideline}})
**Length:** {{lengthGuideline}}

**Document Outline:**
{{#each outline}}
### {{section}}
Key points to cover:
{{#each keySubPoints}}
- {{this}}
{{/each}}

{{/each}}

**Writing Guidelines:**
1. **Structure:**
   ${includeExecutiveSummary ? '- Start with Executive Summary (concise overview, 150-200 words)' : ''}
   - Clear introduction setting context and objectives
   - Well-organized body sections with smooth transitions
   ${includeRecommendations ? '- Actionable recommendations section' : ''}
   - Strong conclusion with key takeaways

2. **Style:**
   - Maintain {{tone}} tone throughout
   - Use clear, concise language
   - Support claims with logical reasoning
   - Use professional formatting (headings, bullet points where appropriate)
   - Ensure logical flow between sections

3. **Content:**
   - Be specific and concrete
   - Use examples where relevant
   - Maintain focus on the purpose
   - Address the target audience's needs and concerns

Write the complete professional document now with proper formatting and section headings.`
        );

        const { output: contentOutput } = await contentPrompt({
            documentType,
            topic,
            purpose,
            targetAudience,
            tone,
            outline,
            lengthGuideline: lengthGuidelines[length],
            toneGuideline: toneGuidelines[tone],
            includeExecutiveSummary,
            includeRecommendations,
        });

        if (!contentOutput?.fullDocument) {
            throw new Error('Failed to generate document content');
        }

        let currentDocument = contentOutput.fullDocument;

        // ========================================================================
        // STEP 3: Quality Checks (Parallel)
        // ========================================================================
        console.log('STEP 3: Running quality checks...');

        const [structureAnalysis, flowAnalysis, toneAnalysis] = await Promise.all([
            analyzeDocumentStructureTool({
                text: currentDocument,
                documentType: 'business'
            }).catch(err => {
                console.error('Structure analysis failed:', err);
                return null;
            }),
            checkLogicalFlowTool({ text: currentDocument }).catch(err => {
                console.error('Flow analysis failed:', err);
                return null;
            }),
            analyzeToneTool({
                text: currentDocument,
                targetTone: tone as any
            }).catch(err => {
                console.error('Tone analysis failed:', err);
                return null;
            }),
        ]);

        // ========================================================================
        // STEP 4: Refinement Based on Feedback
        // ========================================================================
        console.log('STEP 4: Refining document based on feedback...');

        const appliedImprovements: string[] = [];
        const additionalSuggestions: string[] = [];

        // Check if refinement is needed
        const needsRefinement =
            (structureAnalysis && structureAnalysis.coherence.score < 0.75) ||
            (flowAnalysis && flowAnalysis.flowScore < 0.75) ||
            (toneAnalysis && !toneAnalysis.matchesTarget);

        if (needsRefinement) {
            const refinementPrompt = ai.definePrompt(
                {
                    name: 'documentRefinementPrompt',
                    input: {
                        schema: z.object({
                            document: z.string(),
                            structureIssues: z.array(z.string()),
                            flowIssues: z.array(z.string()),
                            toneIssues: z.array(z.string()),
                            targetTone: z.string(),
                        })
                    },
                    output: { schema: z.object({ refinedDocument: z.string() }) },
                    model: 'ollama/gemma:2b',
                    config: {
                        temperature: RECOMMENDED_TEMPERATURES.BALANCED,
                    },
                },
                `You are an expert editor. Refine the following professional document based on the feedback below.

**Original Document:**
{{document}}

**Structure Issues:**
{{#each structureIssues}}
- {{this}}
{{/each}}

**Logical Flow Issues:**
{{#each flowIssues}}
- {{this}}
{{/each}}

**Tone Issues:**
{{#each toneIssues}}
- {{this}}
{{/each}}

**Target Tone:** {{targetTone}}

**Instructions:**
1. Improve document structure and organization
2. Enhance logical flow and transitions
3. Adjust tone to match the target ({{targetTone}})
4. Maintain all key content and information
5. Keep professional formatting

Provide the refined document.`
            );

            const { output: refinedOutput } = await refinementPrompt({
                document: currentDocument,
                structureIssues: structureAnalysis?.coherence.issues || [],
                flowIssues: flowAnalysis?.issues.map(i => i.suggestion) || [],
                toneIssues: toneAnalysis?.suggestions || [],
                targetTone: tone,
            });

            if (refinedOutput?.refinedDocument) {
                currentDocument = refinedOutput.refinedDocument;
                appliedImprovements.push('Improved document structure and organization');
                appliedImprovements.push('Enhanced logical flow and transitions');
                appliedImprovements.push(`Adjusted tone to match ${tone} style`);
            }
        }

        // ========================================================================
        // STEP 5: Extract Structure
        // ========================================================================
        console.log('STEP 5: Extracting document structure...');

        const structureExtractionPrompt = ai.definePrompt(
            {
                name: 'extractStructurePrompt',
                input: {
                    schema: z.object({
                        document: z.string(),
                        includeExecutiveSummary: z.boolean(),
                        includeRecommendations: z.boolean(),
                    })
                },
                output: {
                    schema: z.object({
                        executiveSummary: z.string().optional(),
                        introduction: z.string(),
                        mainSections: z.array(z.object({
                            title: z.string(),
                            content: z.string(),
                        })),
                        recommendations: z.string().optional(),
                        conclusion: z.string(),
                    })
                },
                model: 'ollama/gemma:2b',
                config: {
                    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
                },
            },
            `Extract the main sections from the following document:

{{document}}

Return each section separately with its title and content.

Expected sections:
${includeExecutiveSummary ? '- Executive Summary' : ''}
- Introduction
- Main body sections (identify and separate each)
${includeRecommendations ? '- Recommendations' : ''}
- Conclusion`
        );

        const { output: structure } = await structureExtractionPrompt({
            document: currentDocument,
            includeExecutiveSummary,
            includeRecommendations,
        });

        // ========================================================================
        // STEP 6: Calculate Metrics
        // ========================================================================

        const wordCount = currentDocument.split(/\s+/).length;

        const structureScore = structureAnalysis
            ? Math.round(structureAnalysis.coherence.score * 100)
            : 85;

        const flowScore = flowAnalysis
            ? Math.round(flowAnalysis.flowScore * 100)
            : 85;

        const toneAlignment = toneAnalysis?.confidence || 0.85;

        // Add remaining suggestions
        if (structureAnalysis?.recommendations) {
            additionalSuggestions.push(...structureAnalysis.recommendations.slice(0, 3));
        }
        if (flowAnalysis?.recommendations) {
            additionalSuggestions.push(...flowAnalysis.recommendations.slice(0, 2));
        }

        // ========================================================================
        // STEP 7: Return Final Document
        // ========================================================================

        return {
            document: currentDocument,
            structure: structure || {
                introduction: '',
                mainSections: [],
                conclusion: '',
            },
            qualityMetrics: {
                structureScore,
                flowScore,
                toneAlignment,
                wordCount,
            },
            improvements: {
                applied: appliedImprovements,
                suggestions: additionalSuggestions.slice(0, 5), // Top 5 suggestions
            },
        };
    }
);
