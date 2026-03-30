
'use server';

/**
 * @fileOverview An AI agent for creating practical, interactive session plans.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import {
  GenerateSessionPlanInputSchema,
  GenerateSessionPlanOutputSchema,
  type GenerateSessionPlanInput,
  type GenerateSessionPlanOutput,
} from '@/modules/ai/domain/schemas/lecture-generator';
import { withRetry } from '@/modules/ai/domain/utils/ai-utils';

const generateSessionPlanPrompt = ai.definePrompt({
  name: 'generateSessionPlanPrompt',
  input: { schema: GenerateSessionPlanInputSchema },
  output: { schema: GenerateSessionPlanOutputSchema },

  prompt: `You are an expert instructional designer specializing in **transforming theoretical lecture material into engaging, practical training sessions.** Your primary goal is to bridge the gap between knowing and doing. You will create a hands-on session plan that allows participants to apply the concepts from the provided theoretical lecture.

**Your Process:**
1.  **Deconstruct the Lecture:** Read the provided theoretical lecture content to identify the core theories, models, concepts, and key terminology.
2.  **Define Practical Learning Objectives:**
    - Formulate 2-3 high-level **sessionGoals** that reflect the overall purpose of the practical session.
    - Formulate 2-4 specific, measurable **learningObjectives** focused on *application*. What should participants be able to *do* with this knowledge by the end of the session?
3.  **Design Interactive Activities (Translate Theory to Practice):**
    - Create exactly {{{numActivities}}} distinct, interactive activities.
    - **Prioritize activity types like 'problem-solving-scenario', 'simulation', 'case-study', and 'hands-on-exercise'.**
    - For each activity, you must provide all of the following fields as defined in the schema:
        - A clear **objective** for that specific activity.
        - Detailed **instructions** formatted in Markdown. This MUST include a realistic '### Scenario' that sets a practical context relevant to the target audience, and a clear '### Task' that requires participants to apply a theoretical concept.
        - A list of 3-4 insightful **discussion** questions to debrief the activity and explicitly connect the practical exercise back to the lecture's theory.
        - A concrete **exampleLookFor** to show what a correct or high-quality response looks like.
        - If an activity requires complex data (like a sample spreadsheet or a detailed case study), create a **Handout** for it. Reference the handout in the activity's **materials** list (e.g., "Handout 1") and put the full Markdown content of the handout in the main **appendix** section of the final JSON output.
    - The activities should be varied and designed to reinforce the learning objectives.
    - Distribute the total session duration of {{{sessionDuration}}} minutes logically among the activities, including time for discussion.
4.  **Structure the Plan:** Assemble the complete plan, including a compelling session title, the session goals, the learning objectives, the detailed activities, an appendix for any handouts, and a closing summary.
5.  **Write a Closing Summary:** The summary should recap the key practical applications of the theory and briefly preview what will be covered in the next session.
6.  **Format Output:** Your entire response must be a valid JSON object that adheres to the 'GenerateSessionPlanOutputSchema'.

**Theoretical Lecture Content:**
---
{{{chapterContent}}}
---

**Session Details:**
- **Total Duration:** {{{sessionDuration}}} minutes
- **Target Audience:** {{#if targetAudience}}{{{targetAudience}}}{{else}}General learners with an interest in the topic.{{/if}}
- **Desired Number of Activities:** {{{numActivities}}}
`,
  config: {
    temperature: 0.7,
  }
});

const generateSessionPlanFlow = ai.defineFlow(
  {
    name: 'generateSessionPlanFlow',
    inputSchema: GenerateSessionPlanInputSchema,
    outputSchema: GenerateSessionPlanOutputSchema
  }, async (input: any) => {
    const result = await withRetry(() => generateSessionPlanPrompt(input)) as any;
    const output = result.output;
    if (!output) {
      throw new Error("Session plan generation failed.");
    }
    return output;
  }
);

export async function generateSessionPlan(input: GenerateSessionPlanInput): Promise<GenerateSessionPlanOutput> {
  const validation = GenerateSessionPlanInputSchema.safeParse(input);
  if (!validation.success) {
    // Using .format() provides more detailed, structured validation errors which are easier to debug.
    throw new Error(`Invalid input for generateSessionPlan: ${JSON.stringify(validation.error.format())}`);
  }
  return generateSessionPlanFlow(validation.data);
}
