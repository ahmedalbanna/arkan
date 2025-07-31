// src/ai/flows/analyzeAndReport.ts
import { defineFlow} from 'genkit';
import { run, use } from 'genkit/experimental/flow';
import * as z from 'zod';
import { gemini15Pro } from '@genkit-ai/googleai'; // Assuming you're using Vertex AI

import { generateSectionTool as reportSectionGeneratorTool } from '../tools/generateReportSection'; // Your existing tool

export const analyzeAndReportFlow = defineFlow(
  {
    name: 'analyzeAndReportFlow',
    inputSchema: z.string(), // User's initial request
    outputSchema: z.string(), // Generated report section
  },
  async (request: any) => {
    // Step 1: Analyze the user request
    const analysisResult = await run('initial-analysis', async () => {
        return (await gemini15Pro.generate({
            prompt: `Analyze the following user request and identify the key topics and requirements: ${request}`,
        })).text();
    });

    // Step 2: Generate a report section based on the analysis
    const reportSection = await run('generate-report', async () => {
        return (await use(reportSectionGeneratorTool).invoke({
            analysis: analysisResult, // Pass the analysis result as input to the tool
            originalRequest: request,
        })).text();
    });

    return reportSection;
  }
);
