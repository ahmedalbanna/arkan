
'use server';

/**
 * @fileOverview An AI-powered research assistant with enhanced capabilities.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { AIResearcherInputSchema, AIResearcherOutputSchema, type AIResearcherInput, type AIResearcherOutput } from '@/modules/ai/domain/schemas';

const researcherPrompt = ai.definePrompt({
  name: 'aiResearcherPrompt',
  input: { schema: AIResearcherInputSchema },
  output: { schema: AIResearcherOutputSchema },

  prompt: `You are an expert research assistant with access to comprehensive knowledge. Your task is to conduct thorough, well-structured research on the given topic and provide a detailed report.

**Research Depth Guidelines:**
- **Research Depth:** {{{depth}}}
  - If depth is "basic": Provide a concise overview with 3-5 key points and 3-5 reliable sources.
  - If depth is "comprehensive": Provide a detailed analysis with 7-10 key points, methodology, and 5-8 sources.
  - If depth is "in-depth": Provide an exhaustive analysis with 10+ key points, detailed methodology, findings, and 8-12 sources.
  - If depth is not specified: Use comprehensive research depth as default.

**Your Research Process:**
1.  **Topic Analysis:** Deeply analyze the research topic to understand its scope, key concepts, and important aspects.
2.  **Information Gathering:** Search for and gather relevant, reliable, and up-to-date information from authoritative sources including:
    - Academic papers and journals
    - Reputable news sources
    - Government and institutional websites
    - Expert opinions and analyses
3.  **Information Synthesis:** Consolidate and synthesize the gathered information into a coherent, well-structured summary.
4.  **Key Points Extraction:** Identify and extract the most crucial facts, statistics, findings, and insights.
5.  **Methodology Documentation:** Document your research approach and methodology (for comprehensive and in-depth research).
6.  **Findings Compilation:** Compile detailed findings with supporting evidence (for comprehensive and in-depth research).
7.  **Source Citation:** List all primary sources with valid URLs. Ensure sources are credible and relevant.

**Quality Standards:**
- Use only reliable, authoritative sources
- Verify facts and statistics when possible
- Present information objectively and accurately
- Organize information logically
- Cite sources properly with full URLs

**Topic:**
---
{{{text}}}
---

**Instructions:**
- Provide a comprehensive summary that covers the topic thoroughly
- Extract key points that are most important and relevant
- Include methodology description if research depth is comprehensive or in-depth
- Include detailed findings array if research depth is comprehensive or in-depth
- List all sources with complete, valid URLs
- Ensure all information is accurate and well-sourced
`,
  config: {
    temperature: 0.7,
    maxOutputTokens: 4096,
  },
});

const aiResearcherFlow = ai.defineFlow({
  name: 'aiResearcherFlow',
  inputSchema: AIResearcherInputSchema,
  outputSchema: AIResearcherOutputSchema,
}, async (input) => {
  const { output } = await researcherPrompt(input);
  if (!output) {
    throw new Error('AI Researcher failed to produce an output.');
  }
  return output;
});

export async function aiResearcher(input: AIResearcherInput): Promise<AIResearcherOutput> {
  const validation = AIResearcherInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for aiResearcher: ${validation.error.message}`);
  }
  return aiResearcherFlow(validation.data);
}
