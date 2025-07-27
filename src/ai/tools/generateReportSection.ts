
'use server';

import { ai } from '@/ai/genkit';
import { generateReportSection } from '@/ai/flows/generate-report-section';
import { SectionNameSchema } from '@/ai/schemas';
import { z } from 'zod';

export const generateSectionTool = ai.defineTool(
  {
    name: 'generateReportSection',
    description: 'Generates a specific section of the project report (e.g., introduction, conclusion) based on the project proposal and other available context. Use this when the user explicitly asks to "write", "create", or "generate" a report section.',
    inputSchema: z.object({
      section: SectionNameSchema,
    }),
    outputSchema: z.any(),
  },
  async (input) => generateReportSection({
    sectionToGenerate: input.section,
    // Note: The full project state context will be provided by the calling flow/API route
  })
);
