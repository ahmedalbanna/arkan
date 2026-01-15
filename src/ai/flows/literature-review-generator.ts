
'use server';

/**
 * @fileOverview An AI agent for generating comprehensive literature reviews.
 */

import { ai } from '@/ai/genkit';
import { LiteratureReviewInputSchema, LiteratureReviewOutputSchema, type LiteratureReviewInput, type LiteratureReviewOutput } from '@/ai/schemas';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

const literatureReviewPrompt = ai.definePrompt({
  name: 'literatureReviewPrompt',
  input: { schema: LiteratureReviewInputSchema },
  output: { schema: LiteratureReviewOutputSchema },
  model: 'ollama/llama3.1:latest',

  prompt: `You are an expert academic researcher specializing in literature reviews. Your task is to create a comprehensive, well-structured literature review on the given topic.

${getJsonPromptInstructions(`{
  "introduction": "Context and scope of the literature review",
  "mainBody": "Thematically organized review with critical analysis",
  "conclusion": "Summary of key findings and identified gaps",
  "sources": [
    {
      "title": "Source Title",
      "url": "https://example.com/source",
      "summary": "Brief summary of the source",
      "relevance": "Why this source is relevant"
    }
  ],
  "gaps": ["Gap 1", "Gap 2", "..."]
}`)}

**Your Process:**
1.  **Topic Understanding:** Analyze the research topic and any specified focus areas to understand the scope and key themes.
2.  **Source Identification:** Identify and gather relevant academic sources, research papers, and authoritative publications.
    - Target approximately {{{numberOfSources}}} sources (or 10 if not specified)
    - Focus on sources from: {{{timeRange}}} (if specified)
3.  **Source Analysis:** For each source, analyze its:
    - Main contributions and findings
    - Methodology and approach
    - Relevance to the topic
    - Relationship to other sources
4.  **Theme Organization:** Organize the literature review by themes, topics, or chronological order as appropriate.
5.  **Synthesis:** Synthesize findings from multiple sources, identifying:
    - Common themes and patterns
    - Conflicting viewpoints
    - Gaps in the current literature
    - Emerging trends
6.  **Structure Creation:** Create a well-structured literature review with:
    - Introduction: Context, scope, and objectives
    - Main Body: Organized by themes with critical analysis
    - Conclusion: Summary of key findings and identified gaps

**Topic:**
---
{{{topic}}}
---

**Focus Areas (if specified):**
{{{focusAreas}}}
---

**Quality Standards:**
- Use academic and scholarly sources
- Provide critical analysis, not just summaries
- Identify relationships between different sources
- Highlight gaps and areas for future research
- Maintain academic writing style
- Cite all sources with complete URLs
- Ensure logical flow and coherence

**Output Requirements:**
- Introduction should set the context and define the scope
- Main body should be organized thematically with clear subsections
- Each source should be properly analyzed and contextualized
- Conclusion should synthesize key findings and identify gaps
- All sources must have valid URLs and be properly documented
`,
  config: {
    responseSchema: LiteratureReviewOutputSchema,
    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
    maxOutputTokens: 8192,
  },
});

const literatureReviewFlow = ai.defineFlow({
  name: 'literatureReviewFlow',
  inputSchema: LiteratureReviewInputSchema,
  outputSchema: LiteratureReviewOutputSchema,
}, async (input) => {
  try {
    const { output } = await literatureReviewPrompt(input);
    
    if (!output) {
      throw new Error('Literature Review Generator failed to produce an output.');
    }

    // التحقق والتنظيف باستخدام الدالة المساعدة
    const validationResult = validateJsonOutput({
      schema: LiteratureReviewOutputSchema,
      output,
      flowName: 'literatureReviewFlow',
      attemptRecovery: true,
      enableLogging: true,
    });

    if (!validationResult.success) {
      throw new Error(validationResult.error || 'Failed to validate literature review output');
    }

    return validationResult.data!;
  } catch (error) {
    console.error('Error in literatureReviewFlow:', error);
    throw new Error(`Literature Review Generator failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export async function generateLiteratureReview(input: LiteratureReviewInput): Promise<LiteratureReviewOutput> {
  const validation = LiteratureReviewInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateLiteratureReview: ${validation.error.message}`);
  }
  return literatureReviewFlow(validation.data);
}

