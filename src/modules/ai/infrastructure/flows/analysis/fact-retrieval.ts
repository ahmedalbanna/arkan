
'use server';

/**
 * @fileOverview An AI agent for retrieving specific facts and information.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { FactRetrievalInputSchema, FactRetrievalOutputSchema, type FactRetrievalInput, type FactRetrievalOutput } from '@/modules/ai/domain/schemas';

const factRetrievalPrompt = ai.definePrompt({
    name: 'factRetrievalPrompt',
    input: { schema: FactRetrievalInputSchema },
    // No output schema - model returns plain JSON text

    prompt: `You are an expert fact-checker and information retrieval specialist. Your task is to retrieve accurate, verifiable facts based on the user's query.

Output ONLY valid JSON in this format:
{
  "fact": "the retrieved fact",
  "source": "https://...",
  "sourceTitle": "source title",
  "lastVerified": "verification date",
  "confidence": "high" | "medium" | "low",
  "relatedFacts": ["related fact 1", "related fact 2"]
}

Do NOT include any explanations or additional text outside the JSON.

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
    name: 'factRetrieval',
    inputSchema: FactRetrievalInputSchema,
    outputSchema: FactRetrievalOutputSchema,
}, async (input: FactRetrievalInput) => {
    try {
        const result = await factRetrievalPrompt(input);
        if (!result) {
            throw new Error('Fact Retrieval failed to produce an output.');
        }

        // Parse the JSON response
        let output: FactRetrievalOutput;
        try {
            const jsonText = result.text || result.output || '';
            output = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('Failed to parse Fact Retrieval JSON:', parseError);
            throw new Error('Fact Retrieval returned invalid JSON');
        }

        // Validate the parsed output
        const validation = FactRetrievalOutputSchema.safeParse(output);
        if (!validation.success) {
            console.error('Fact Retrieval output validation failed:', validation.error);
            throw new Error('Fact Retrieval output does not match expected structure');
        }

        return validation.data;
    } catch (error) {
        console.error('Error in factRetrievalFlow:', error);
        throw new Error(`Fact Retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});

export async function retrieveFact(input: FactRetrievalInput): Promise<FactRetrievalOutput> {
    const validation = FactRetrievalInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for retrieveFact: ${validation.error.message}`);
    }
    return factRetrievalFlow(validation.data);
}

