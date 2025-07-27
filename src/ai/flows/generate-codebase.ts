
'use server';

/**
 * @fileOverview An AI agent for scaffolding a complete Next.js codebase.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectProposalSchema } from '@/ai/schemas';

const GeneratedFileSchema = z.object({
  path: z.string().describe('The full path of the file, including directories and the file name (e.g., "src/app/page.tsx").'),
  content: z.string().describe('The complete source code or content for the file.'),
});

const CodebaseSchema = z.object({
  files: z.array(GeneratedFileSchema).describe('An array of all the files that make up the codebase.'),
});
export type Codebase = z.infer<typeof CodebaseSchema>;


const GenerateCodebaseInputSchema = z.object({
  proposal: ProjectProposalSchema.describe('The project proposal to base the codebase on.'),
});

export async function generateCodebase(input: z.infer<typeof GenerateCodebaseInputSchema>): Promise<Codebase> {
  const { proposal } = input;
  const stringifiedProposal = JSON.stringify(proposal, null, 2);

  const codebasePrompt = ai.definePrompt({
    name: 'generateCodebasePrompt',
    input: { schema: GenerateCodebaseInputSchema },
    output: { schema: CodebaseSchema },
    prompt: `You are an expert Next.js developer and software architect. Your task is to generate a complete boilerplate codebase for a new project based on the provided project proposal.

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
${stringifiedProposal}
\`\`\`
---
`,
  });

  const { output } = await codebasePrompt({ proposal });
  return output!;
}
