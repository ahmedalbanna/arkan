
'use server';

import { ai } from '@/ai/genkit';
import { generateDiagram } from '@/ai/flows/generate-diagrams';
import { DiagramTypeSchema } from '@/ai/schemas';
import { z } from 'zod';

// This tool allows the AI to generate a diagram based on the current project context.
// Note: The full project context (proposal, sections, etc.) will be supplied by
// the calling flow, which has access to the full application state.
export const generateDiagramTool = ai.defineTool(
  {
    name: 'generateDiagram',
    description: 'Generates a system diagram (e.g., useCase, class, sequence) based on the project proposal and other available context. Use this when the user asks to "create", "draw", or "generate" a diagram.',
    inputSchema: z.object({
      diagramType: DiagramTypeSchema.describe("The specific type of diagram to generate (e.g., 'class', 'sequence')."),
    }),
    outputSchema: z.any(),
  },
  async (input) => generateDiagram({
    diagramToGenerate: input.diagramType,
    // The full project state context will be provided by the calling flow/API route
  })
);
