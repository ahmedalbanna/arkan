'use server';

/**
 * @fileOverview RAG-Enhanced Report Section Generation
 * 
 * This is an enhanced version of generate-report-section.ts that uses
 * Retrieval-Augmented Generation (RAG) to retrieve relevant context
 * from the vector store before generating content.
 */

import { ai } from '@/ai/genkit';
import { GenerateSectionInputSchema, GenerateSectionOutputSchema, type GenerateSectionInput, type GenerateSectionOutput } from '@/ai/schemas';
import { retrieveContext } from '@/lib/rag/retrieval';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

export interface GenerateSectionWithRAGInput extends GenerateSectionInput {
  projectId?: string;
  userId?: string;
  enableRAG?: boolean;
  ragTopK?: number;
}

export async function generateReportSectionWithRAG(input: GenerateSectionWithRAGInput): Promise<GenerateSectionOutput> {
  
  // 1. RAG: Retrieve relevant context if enabled
  let ragContext = '';
  if (input.enableRAG !== false && (input.projectId || input.userId)) {
    try {
      console.log(`[RAG] Retrieving context for section: ${input.sectionToGenerate}`);
      
      // Create a query from section name and instructions
      const query = `${input.sectionToGenerate}\n${input.instructionText || ''}`;
      
      const retrieval = await retrieveContext(query, {
        projectId: input.projectId,
        userId: input.userId,
        topK: input.ragTopK || 5,
        minScore: 0.5,
        includeTypes: ['reference', 'context', 'user_upload'],
      });
      
      ragContext = retrieval.context;
      console.log(`[RAG] Retrieved ${retrieval.sources.length} relevant chunks`);
    } catch (error) {
      console.error('[RAG] Error retrieving context:', error);
      // Continue without RAG context on error
    }
  }

  // 2. Prepare system prompt
  const systemPrompt = `${input.prompt}

You are also an expert analyst. Before you begin writing, you must first review all the provided context sections (proposal, project plan, other report sections, diagrams, etc.). From this context, intelligently identify and synthesize only the most relevant information needed to create the requested report section. Do not simply list information; integrate it into a well-written, coherent narrative.

${ragContext ? 'IMPORTANT: You have access to RAG-retrieved context which contains the most relevant information from the knowledge base. Use this information to enhance your response.' : ''}`;

  // 3. Define the prompt with RAG context
  const reportSectionPrompt = ai.definePrompt({
    name: 'generateReportSectionPromptRAG',
    input: { schema: GenerateSectionInputSchema },
    output: { schema: GenerateSectionOutputSchema },
    model: 'ollama/gemma:2b',
    config: {
      responseSchema: GenerateSectionOutputSchema,
      temperature: RECOMMENDED_TEMPERATURES.BALANCED,
    },

    system: systemPrompt,
    prompt: `
${getJsonPromptInstructions(`{
  "sectionName": "{{sectionToGenerate}}",
  "content": "Complete section content in markdown format"
}`)}

CRITICAL: Your final output must be a JSON object where the 'sectionName' field exactly matches the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

{{#if guidelines}}
--- Guidelines ---\n
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if instructionText}}
--- Additional Instructions ---\n
{{{instructionText}}}
{{/if}}

${ragContext ? `
--- RAG RETRIEVED CONTEXT (Most Relevant Information from Knowledge Base) ---\n
${ragContext}
---\n
` : ''}

--- AVAILABLE CONTEXT FROM PROJECT ---\n
You have access to the following documents. Review them and use the most relevant information to generate the requested section.

{{#if otherSections}}
--- Other Report Sections & Context ---\n
{{#each otherSections}}
--- Context Item: {{@key}} ---\n
{{{this}}}
---
{{/each}}
{{/if}}

{{#if otherDiagrams}}
--- Other Generated Diagrams (PlantUML) ---\n
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---\n
{{{this}}}
---
{{/each}}
{{/if}}

{{#if externalContext}}
--- Additional Context Files ---\n
{{#each externalContext}}
--- File: {{this.fileName}} (Type: {{this.type}}) ---\n
{{{this.content}}}
---
{{/each}}
{{/if}}

Now, generate the section content based on all the context provided above. Synthesize the information from RAG context, project sections, diagrams, and external context to create a comprehensive, well-written section.

**JSON Output:**`,
  });

  // 4. Generate content with RAG context
  try {
    const { output } = await reportSectionPrompt(input);

    if (!output) {
      throw new Error('No output received from the model.');
    }

    const validation = validateJsonOutput({
      schema: GenerateSectionOutputSchema,
      output,
      flowName: 'generateReportSectionRAG',
      attemptRecovery: true,
      enableLogging: true,
      fallbackFn: (rawOutput) => {
        if (typeof rawOutput === 'string') {
          return {
            sectionName: input.sectionToGenerate,
            content: rawOutput,
          };
        }
        return null;
      },
    });

    if (!validation.success) {
      throw new Error(validation.error || 'Failed to validate output');
    }

    return validation.data!;
  } catch (error) {
    console.error(`AI failed to generate content for section: ${input.sectionToGenerate}`, error);
    throw new Error(`The AI failed to generate a response for the '${input.sectionToGenerate}' section: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
