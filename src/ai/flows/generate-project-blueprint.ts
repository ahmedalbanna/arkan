'use server';

/**
 * @fileOverview An AI agent for generating comprehensive project blueprints for applications and websites.
 */

import { ai } from '@/ai/genkit';
import { GenerateProjectBlueprintInputSchema, GenerateProjectBlueprintOutputSchema, type GenerateProjectBlueprintInput, type GenerateProjectBlueprintOutput } from '@/lib/schemas';

const generateProjectBlueprintFlow = ai.defineFlow({
    name: 'generateProjectBlueprintFlow',
    inputSchema: GenerateProjectBlueprintInputSchema,
    outputSchema: GenerateProjectBlueprintOutputSchema
}, async (input) => {
    const { projectName, projectType, description, targetAudience, complexity, features, techStack, budget, timeline } = input;

    const blueprintPrompt = ai.definePrompt({
        name: 'projectBlueprintPrompt',
        input: { schema: GenerateProjectBlueprintInputSchema },
        output: { schema: GenerateProjectBlueprintOutputSchema },
        model: 'googleai/gemini-2.5-flash-lite',
        system: `You are a senior software architect and project manager with 15+ years of experience. Your task is to create a comprehensive project blueprint for web or mobile application development based on the provided project details. The blueprint should outline the project overview, core features, technology stack recommendations, development phases, and best practices.`,
        prompt: `Generate a comprehensive project blueprint for the following project:

**Project Details:**
- Name: {{{projectName}}}
- Type: {{{projectType}}}
- Description: {{{description}}}
- Target Audience: {{{targetAudience}}}
- Complexity: {{{complexity}}}
- Requested Features: {{{features}}}
- Technology Stack Preference: {{{techStack}}}

Provide detailed, actionable recommendations based on industry best practices and the specific requirements provided.`,
        config: {
            temperature: 0.7,
            maxOutputTokens: 6000,
        }
    });

    const { output } = await blueprintPrompt({
        flow: "generate-project-blueprint",
        projectName,
        projectType,
        description,
        targetAudience,
        complexity,
        features,
        techStack,
        budget,
        timeline
    });

    if (!output) {
        throw new Error("Failed to generate project blueprint.");
    }

    return output;
});

export async function generateProjectBlueprint(input: GenerateProjectBlueprintInput): Promise<GenerateProjectBlueprintOutput> {
    const validation = GenerateProjectBlueprintInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateProjectBlueprint: ${validation.error.message}`);
    }
    return generateProjectBlueprintFlow(validation.data);
}
