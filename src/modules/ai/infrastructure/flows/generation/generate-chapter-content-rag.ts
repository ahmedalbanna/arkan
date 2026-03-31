'use server';

/**
 * @fileOverview RAG-Enhanced Chapter Content Generation
 * 
 * This is an enhanced version of generate-chapter-content.ts that uses
 * Retrieval-Augmented Generation (RAG) to retrieve relevant context
 * from the vector store before generating chapter content.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { GenerateChapterInputSchema, GenerateChapterOutputSchema, type GenerateChapterInput, type GenerateChapterOutput } from '@/modules/ai/domain/schemas';
import { container } from '@/infrastructure/di/container';
import { IAiServiceToken } from '@/modules/ai/domain/services/IAiService';
import { TokenManager, MODEL_CONTEXT_LIMITS } from '@/modules/ai/domain/utils/TokenManager';

export interface GenerateChapterWithRAGInput extends GenerateChapterInput {
  projectId?: string;
  userId?: string;
  enableRAG?: boolean;
  ragTopK?: number;
}

/**
 * Generate chapter content with RAG enhancement
 */
export async function generateChapterContentWithRAG(input: GenerateChapterWithRAGInput): Promise<GenerateChapterOutput> {
  
  // 1. RAG: Retrieve relevant context for the chapter
  let ragContext = '';
  if (input.enableRAG !== false && (input.projectId || input.userId)) {
    try {
      console.log(`[RAG] Retrieving context for chapter: ${input.chapterTitle}`);
      
      // Create comprehensive query from chapter title and all section titles
      const sectionTitles = input.sectionInstructions?.map(s => s.title).join(', ') || '';
      const query = `${input.chapterTitle}\nSections: ${sectionTitles}`;
      
      const aiService = container.resolve<any>(IAiServiceToken);
      const retrieval = await aiService.retrieveContext(query, {
        projectId: input.projectId,
        userId: input.userId,
        topK: input.ragTopK || 8, // More context for chapters
        minScore: 0.5,
        includeTypes: ['reference', 'context', 'user_upload'],
      });
      
      // 1a. Truncate context based on model context limits to avoid crashes
      const modelLimit = MODEL_CONTEXT_LIMITS.PHI3_MINI; // Default model limit
      const maxContextTokens = Math.floor(modelLimit * 0.6); // Reserve 40% for prompt + completion
      
      ragContext = TokenManager.truncateRagContext(retrieval.context, maxContextTokens);
      const truncated = ragContext.length < retrieval.context.length;

      console.log(`[RAG] Retrieved ${retrieval.sources.length} chunks. ${truncated ? 'Truncated context for safety.' : 'Context within limits.'}`);
    } catch (error) {
      console.error('[RAG] Error retrieving context for chapter:', error);
      // Continue without RAG context on error
    }
  }

  // 2. Define the chapter prompt with RAG context
  const chapterPrompt = ai.definePrompt({
    name: 'generateChapterContentPromptRAG',
    input: { schema: GenerateChapterInputSchema },
    output: { schema: GenerateChapterOutputSchema },
    model: 'ollama/phi3:mini-4k',

    prompt: `You are an expert author and technical writer. Your task is to write the complete content for a chapter titled "{{chapterTitle}}".

You will be given a list of sections to write for this chapter. For each section, you must follow its specific instructions, which include a base prompt, guidelines, and contextual information.

${ragContext ? `
--- RAG RETRIEVED CONTEXT (Most Relevant Information from Knowledge Base) ---
IMPORTANT: Use this retrieved context to enhance your writing. This information has been specifically retrieved as relevant to this chapter and its sections.

${ragContext}
---
` : ''}

Your final output must be a single markdown string. Each section must start with a level 2 markdown heading (e.g., '## Section Title'). Follow the order of the sections as provided in the instructions.

**Chapter Title:**
# {{chapterTitle}}

**Sections to Generate:**
{{#each sectionInstructions}}
---
### Instructions for Section: "{{this.title}}"

**Base Prompt:**
{{this.prompt}}

**Guidelines:**
{{#if this.guidelines}}
{{#each this.guidelines}}
- {{{this}}}
{{/each}}
{{else}}
- No specific guidelines provided.
{{/if}}

**Additional Instructions:**
{{this.instructionText}}

**Context:**
{{{this.context}}}
---
{{/each}}

Now, write the complete chapter content. Synthesize information from:
1. The RAG-retrieved context (if available)
2. The specific instructions for each section
3. The context provided for each section

Create a cohesive, well-structured chapter that flows naturally from section to section.
`,
    config: {
      temperature: 0.5,
      maxOutputTokens: 8192,
    }
  });

  // 3. Generate chapter content
  const generateChapterFlow = ai.defineFlow({
    name: 'generateChapterContentFlowRAG',
    inputSchema: GenerateChapterInputSchema,
    outputSchema: GenerateChapterOutputSchema,
  }, async (input: GenerateChapterInput) => {
    const { output } = await chapterPrompt(input);

    if (!output) {
      throw new Error(`The AI failed to generate a response for the chapter "${input.chapterTitle}". Please try again.`);
    }

    return output;
  });

  // 4. Validate and execute
  const validation = GenerateChapterInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateChapterContentWithRAG: ${validation.error.message}`);
  }
  
  return generateChapterFlow(validation.data);
}
