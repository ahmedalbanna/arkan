
'use server';

/**
 * @fileOverview An AI agent for creating comprehensive theoretical lectures.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateTheoreticalLectureInputSchema,
  GenerateTheoreticalLectureOutputSchema,
  type GenerateTheoreticalLectureInput,
  type GenerateTheoreticalLectureOutput,
} from '@/ai/schemas/lecture-generator';
import { withRetry } from '@/lib/utils/ai-utils';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

// Define the AI Prompt
const generateTheoreticalLecturePrompt = ai.definePrompt({
  name: 'generateTheoreticalLecturePrompt',
  input: { schema: GenerateTheoreticalLectureInputSchema },
  output: { schema: GenerateTheoreticalLectureOutputSchema },
  model: 'ollama/gemma:2b',
  
  prompt: `You are an esteemed university professor and a leading expert in your field. Your task is to write a comprehensive, clear, and engaging theoretical lecture for the specified target audience.

${getJsonPromptInstructions(`{
  "lectureContent": "Complete lecture content in Markdown format with headings, examples, and explanations"
}`)}

**Your Process:**
1.  **Analyze the Request:** Carefully review the provided 'lectureTopic', the list of 'subTopics' to cover, the 'targetAudience', and any 'professorNotes'.
2.  **Synthesize Knowledge:**
    - **If 'professorNotes' are provided:** Use them as the primary source of information. Your role is to structure, elaborate, and refine these notes into a coherent, well-written lecture. Fill in any gaps using your expert knowledge.
    - **If 'professorNotes' are NOT provided:** Use your expert knowledge and reasoning capabilities to research and compose the lecture from scratch. You must cover all the specified 'subTopics' in a logical and thorough manner.
3.  **Structure the Lecture:**
    - Organize the content logically, following the order of the 'subTopics'.
    - Use Markdown for formatting. Use headings (#), subheadings (##, ###), bold text, italics, and lists to create a clear and readable structure.
    - Start with a brief introduction that outlines the lecture's objectives.
    - For each sub-topic, provide detailed explanations.
4.  **Enhance for Clarity:**
    - Define all key terminology and concepts.
    - Use relevant examples, analogies, or case studies to illustrate complex ideas.
    - Maintain an academic, authoritative, yet accessible tone suitable for the 'targetAudience'.
5.  **Conclude the Lecture:** End with a concise summary that recaps the main points and provides a bridge to the next topic or a related practical session.
6.  **Format Output:** Your entire response must be a valid JSON object that adheres to the 'GenerateTheoreticalLectureOutputSchema', containing the complete lecture in the 'lectureContent' field.

**Lecture Details:**
---
- **Lecture Topic:** {{{lectureTopic}}}
- **Sub-topics to Cover:**
{{#each subTopics}}
- {{{this}}}
{{/each}}
- **Target Audience:** {{{targetAudience}}}
{{#if professorNotes}}
- **Professor's Notes (to be expanded and structured):**
---
{{{professorNotes}}}
---
{{/if}}
`,
  config: {
    responseSchema: GenerateTheoreticalLectureOutputSchema,
    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
  }
});

// Define the AI Flow
const generateTheoreticalLectureFlow = ai.defineFlow({
  name: 'generateTheoreticalLectureFlow',
  inputSchema: GenerateTheoreticalLectureInputSchema,
  outputSchema: GenerateTheoreticalLectureOutputSchema
}, async (input) => {
  try {
    const { output } = await withRetry(() => generateTheoreticalLecturePrompt(input));
    
    if (!output) {
      throw new Error("Theoretical lecture generation failed to produce an output.");
    }

    // التحقق والتنظيف باستخدام الدالة المساعدة
    const validationResult = validateJsonOutput({
      schema: GenerateTheoreticalLectureOutputSchema,
      output,
      flowName: 'generateTheoreticalLectureFlow',
      attemptRecovery: true,
      enableLogging: true,
      // Fallback: إذا كان النص مباشرة بدون JSON
      fallbackFn: (rawOutput) => {
        if (typeof rawOutput === 'string') {
          return { lectureContent: rawOutput };
        }
        return null;
      },
    });

    if (!validationResult.success) {
      throw new Error(validationResult.error || 'Failed to validate lecture output');
    }

    return validationResult.data!;
  } catch (error) {
    console.error('Error in generateTheoreticalLectureFlow:', error);
    throw new Error(`Theoretical lecture generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Define the server action
export async function generateTheoreticalLecture(input: GenerateTheoreticalLectureInput): Promise<GenerateTheoreticalLectureOutput> {
  const validation = GenerateTheoreticalLectureInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateTheoreticalLecture: ${JSON.stringify(validation.error.format())}`);
  }
  return generateTheoreticalLectureFlow(validation.data);
}
