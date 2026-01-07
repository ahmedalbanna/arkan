
'use server';

/**
 * @fileOverview An AI agent for retrieving specific facts and information.
 */

import { ai } from '@/ai/genkit';
import { FactRetrievalInputSchema, FactRetrievalOutputSchema, type FactRetrievalInput, type FactRetrievalOutput } from '@/lib/schemas';

const factRetrievalPrompt = ai.definePrompt({
    name: 'factRetrievalPrompt',
    input: { schema: FactRetrievalInputSchema },
    output: { schema: FactRetrievalOutputSchema },
    model: 'googleai/gemini-2.5-flash-lite',
    prompt: `You are an expert fact-checker and information retrieval specialist. Your task is to retrieve accurate, verifiable facts based on the user's query.

**Your Process:**
1.  **Query Analysis:** Understand what specific fact or information is being requested.
2.  **Information Retrieval:**
    - **Use Web Search:** {{{useWebSearch}}} (if true, search the web for current information; if false, use training knowledge)
    - If using web search: Verify from multiple reliable sources and prioritize authoritative sources (government sites, academic institutions, reputable organizations)
    - If not using web search: Use training knowledge but clearly indicate if information may be outdated
3.  **Fact Extraction:** Extract the specific fact or information requested.
4.  **Source Documentation:**
    - **Require Source:** {{{requireSource}}} (if true, MUST provide a source URL; if false, source is optional)
    - **Source Quality:** Ensure the source is reliable and authoritative
    - **Verification Date:** Note when the fact was verified or the date of the source
5.  **Confidence Assessment:** Assess confidence level based on:
    - Source reliability
    - Consistency across sources
    - Recency of information
6.  **Related Facts:** Identify related facts that might be of interest.

**Fact Query:**
---
{{{factQuery}}}
---

**Output Requirements:**
- Provide the fact clearly and concisely
{{#if requireSource}}
- **MUST** include a source URL (this is required)
{{/if}}
- Include source title if available
- Note verification date or source date
- Assess confidence level (high/medium/low)
- Include related facts if relevant
- Ensure accuracy and verifiability
`,
    config: {
        temperature: 0.3,
        maxOutputTokens: 2048,
    },
});

const factRetrievalFlow = ai.defineFlow({
    name: 'factRetrievalFlow',
    inputSchema: FactRetrievalInputSchema,
    outputSchema: FactRetrievalOutputSchema,
}, async (input) => {
    const { output } = await factRetrievalPrompt(input);
    if (!output) {
        throw new Error('Fact Retrieval failed to produce an output.');
    }
    return output;
});

export async function retrieveFact(input: FactRetrievalInput): Promise<FactRetrievalOutput> {
    const validation = FactRetrievalInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for retrieveFact: ${validation.error.message}`);
    }
    return factRetrievalFlow(validation.data);
}

