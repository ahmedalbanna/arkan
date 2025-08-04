// src/ai/flows/analyzeAndReport.ts
import { ai} from '@/ai/genkit';
import * as z from 'zod';
import { gemini15Pro } from '@genkit-ai/googleai'; // Assuming you're using Vertex AI

import { generateSectionTool as reportSectionGeneratorTool } from '../tools/generateReportSection'; // Your existing tool

export const analyzeAndReportFlow = ai.defineFlow(
  {
    name: 'analyzeAndReportFlow',
    inputSchema: z.string(), // User's initial request
    outputSchema: z.string(), // Generated report section
  },
  async (request: any) => {
    // Step 1: Analyze the user request
    const analysisResult = await ai.run('initial-analysis', async () => {
        return (await ai.generate({
            prompt: `Analyze the following user request and identify the key topics and requirements: ${request}`,
        })).text;
    });

    // Step 2: Generate a report section based on the analysis
    const reportSection = await ai.run('generate-report', async () => {
 return (await reportSectionGeneratorTool.call({
        })).text;
    });

    return reportSection;
  }
);
