'use server';

/**
 * @fileOverview Project plan generation prompt definitions
 */


import { GenerateProjectPlanInputSchema, ProjectPlanSchema } from '@/ai/schemas';


import { z } from 'zod';
// Mock function for testing environment
const createMockPrompt = (config: any) => {
    return async (input: any) => {
        // Mock implementation for testing
        return { output: {} };
    };
};

// Use mock in test environment, real implementation in production
const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
    ? { definePrompt: createMockPrompt }
    : require('@/ai/genkit').ai;

export const generateProjectPlanPrompt = ai.definePrompt({
    name: 'generateProjectPlanPrompt',
    input: { schema: GenerateProjectPlanInputSchema.extend({ phaseRangeText: z.string() }) },
    output: { schema: ProjectPlanSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert project manager and scrum master. Your task is to take a project description and list of deliverables and break them down into a detailed, actionable project plan.

**Analyze the Input:**
- You have been provided with a project description and a list of key deliverables. Use this as the primary source of truth.

**Your Task:**
Based on the analysis, create a structured project plan consisting of logical phases. Each phase should contain a set of specific, well-defined tasks or user stories.

**Guidelines for Tasks:**
-   **Task Title:** Make it a clear, concise action statement (e.g., "Develop User Login Endpoint," "Design Onboarding UI").
-   **Task Description:** Provide a more detailed explanation of what the task involves.
-   **Acceptance Criteria:** Write a list of 2-4 specific, testable conditions that must be met for the task to be considered complete.

**CRITICAL INSTRUCTIONS:**
-   Your output must strictly adhere to the provided JSON schema for the project plan.
-   The number of phases and tasks should be reasonable for the project's scope. A project might have {{{phaseRangeText}}} phases.
-   Ensure the tasks within each phase are logically grouped.

--- PROJECT INPUT ---

**Project Description:**
{{{projectDescription}}}

**Key Deliverables:**
{{{keyDeliverables}}}

---
`,
    config: {
        temperature: 0.6,
        maxOutputTokens: 8192,
    }
});
