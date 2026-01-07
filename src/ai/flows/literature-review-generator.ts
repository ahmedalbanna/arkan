
'use server';

/**
 * @fileOverview An AI agent for generating comprehensive literature reviews.
 */

import { ai } from '@/ai/genkit';
import { LiteratureReviewInputSchema, LiteratureReviewOutputSchema, type LiteratureReviewInput, type LiteratureReviewOutput } from '@/lib/schemas';

const literatureReviewPrompt = ai.definePrompt({
  name: 'literatureReviewPrompt',
  input: { schema: LiteratureReviewInputSchema },
  output: { schema: LiteratureReviewOutputSchema },
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are an expert academic researcher specializing in literature reviews. Your task is to create a comprehensive, well-structured literature review on the given topic.

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
    temperature: 0.7,
    maxOutputTokens: 8192,
  },
});

const literatureReviewFlow = ai.defineFlow({
  name: 'literatureReviewFlow',
  inputSchema: LiteratureReviewInputSchema,
  outputSchema: LiteratureReviewOutputSchema,
}, async (input) => {
  const { output } = await literatureReviewPrompt(input);
  if (!output) {
    throw new Error('Literature Review Generator failed to produce an output.');
  }
  return output;
});

export async function literatureReviewGenerator(input: LiteratureReviewInput): Promise<LiteratureReviewOutput> {
  const validation = LiteratureReviewInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateLiteratureReview: ${validation.error.message}`);
  }
  return literatureReviewFlow(validation.data);
}

