'use server';

/**
 * @fileOverview Codebase generation prompt definitions
 */

import { ai } from '@/ai/genkit';
import { CodebaseSchema, GenerateCodebaseInputSchema } from '@/ai/schemas';

export const generateCodebasePrompt = ai.definePrompt({
    name: 'generateCodebasePrompt',
    input: { schema: GenerateCodebaseInputSchema },
    output: { schema: CodebaseSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: async (input) => {
        const jsonStringifiedProposal = JSON.stringify(input.proposal, null, 2);
        return `You are an expert Next.js developer and software architect. Your task is to generate a complete boilerplate codebase for a new project based on the provided project proposal.

        **Analysis:**
        1.  **Project Title & Objective**: Use the title and objective for page titles and placeholder content.
        2.  **Features**: Infer the basic features from the 'expected_outcome' and 'success_criteria' to create placeholder pages or components.

        **Codebase Requirements:**
        -   **Framework**: Next.js with the App Router.
        -   **Language**: TypeScript.
        -   **Styling**: Tailwind CSS with shadcn/ui components.
        -   **Structure**: Create a standard Next.js project structure.

        **Files to Generate (Minimum):**
        1.  \`package.json\`: Include dependencies for Next.js, React, Tailwind CSS, clsx, and lucide-react.
        2.  \`tailwind.config.ts\`: A standard Tailwind config file.
        3.  \`src/app/globals.css\`: The basic Tailwind directives.
        4.  \`src/app/layout.tsx\`: The root layout with basic HTML structure and font setup.
        5.  \`src/app/page.tsx\`: A simple landing page component that reflects the project's title and objective. Use basic shadcn/ui components like Card and Button.
        6.  \`src/lib/utils.ts\`: The standard \`cn\` utility function for Tailwind classes.
        7.  **(Optional)** Based on the proposal, create one or two placeholder component files in \`src/components/\` for key features.

        **CRITICAL INSTRUCTIONS:**
        -   Your output MUST be a valid JSON object adhering to the CodebaseSchema.
        -   The 'path' for each file must be a complete, relative path from the project root.
        -   The 'content' for each file must be the complete, raw source code. Do not use markdown code fences.

        --- PROJECT PROPOSAL ---
        \`\`\`json
        ${jsonStringifiedProposal}
        \`\`\`
        ---
        `;
    },
});
