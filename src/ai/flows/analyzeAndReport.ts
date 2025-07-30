// src/ai/flows/analyzeAndReport.ts
import { defineFlow} from '@genkit-ai/core';
import  runInference  from '@genkit-ai/core';
import use from '@genkit-ai/core';
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
    const analysisResult = await runInference({
      model: gemini15Pro, // Your chosen AI model
      prompt: `Analyze the following user request and identify the key topics and requirements: ${request}`,
    });

    const analysisText = await analysisResult.text();

    // Step 2: Generate a report section based on the analysis
    const reportSection = await use(reportSectionGeneratorTool).execute({
      analysis: analysisText, // Pass the analysis result as input to the tool
      originalRequest: request,
    });

    return reportSection.text();
  }
);
