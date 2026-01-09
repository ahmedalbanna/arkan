

/**
 * @fileOverview Document Structure Tools for Professional Writing
 *
 * These tools analyze document structure, coherence, logical flow,
 * and argument quality to help writers create well-organized content.
 */

import { getModel } from '@/ai/genkit';
import type { Genkit } from 'genkit';
import {
  AnalyzeArgumentStructureToolInputSchema,
  AnalyzeArgumentStructureToolOutputSchema,
  AnalyzeDocumentStructureToolInputSchema,
  AnalyzeDocumentStructureToolOutputSchema,
  CheckLogicalFlowToolInputSchema,
  CheckLogicalFlowToolOutputSchema,
  type AnalyzeArgumentStructureToolInput,
  type AnalyzeArgumentStructureToolOutput,
  type AnalyzeDocumentStructureToolInput,
  type AnalyzeDocumentStructureToolOutput,
  type CheckLogicalFlowToolInput,
  type CheckLogicalFlowToolOutput,
} from './schemas';
import { z } from 'zod';

/**
 * Factory function to create document structure tools
 * @param ai - The Genkit AI instance
 * @returns Object containing all document structure tools
 */
export function createDocumentStructureTools(ai: Genkit) {
  /**
   * Document Structure Analyzer Tool
   * Analyzes the overall structure, coherence, and organization of a document.
   */
  const analyzeDocumentStructureTool = ai.defineTool(
  {
    name: 'analyzeDocumentStructure',
    description: 'Analyzes document structure including headings, paragraphs, sections, coherence, and transitions. Provides recommendations for improvement.',
    inputSchema: AnalyzeDocumentStructureToolInputSchema,
    outputSchema: AnalyzeDocumentStructureToolOutputSchema,
  },
  async (input: AnalyzeDocumentStructureToolInput): Promise<AnalyzeDocumentStructureToolOutput> => {
    const documentTypeInstructions = {
      academic: 'Expect clear introduction, body with well-organized sections, and conclusion. Look for thesis statement, topic sentences, and academic transitions.',
      business: 'Expect executive summary, clear sections, actionable recommendations. Look for professional tone and clear structure.',
      technical: 'Expect logical flow, clear technical explanations, appropriate use of headings and subheadings. Look for clarity and precision.',
      creative: 'Expect narrative flow, engaging structure, varied paragraph lengths. Look for coherence in storytelling.',
      general: 'Analyze basic structure, coherence, and organization regardless of specific type.',
    };

    const prompt = ai.definePrompt({
      name: 'documentStructureAnalyzerPrompt',
      input: { schema: AnalyzeDocumentStructureToolInputSchema },
      output: { schema: AnalyzeDocumentStructureToolOutputSchema },
      model: await getModel('balanced'),
      prompt: `You are an expert in document structure analysis. Analyze the structure and organization of the following document.

Document to analyze:
{{text}}

Document Type: {{documentType}}
Instructions: ${documentTypeInstructions[input.documentType]}

Provide a comprehensive analysis including:

1. **Structure Analysis**:
   - List all headings with their levels and positions
   - Count of paragraphs and sections

2. **Coherence Analysis**:
   - Overall coherence score (0.0 to 1.0)
   - Specific coherence issues (e.g., "Abrupt topic shift between paragraphs 3 and 4")
   - Coherence strengths (e.g., "Clear topic sentences in each paragraph")

3. **Transition Analysis**:
   - Count of transition words/phrases used
   - Quality rating (excellent/good/fair/poor)
   - Suggestions for adding or improving transitions

4. **Recommendations**:
   - Specific, actionable recommendations to improve document structure
   - Focus on the most impactful improvements`,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to analyze document structure');
    }

    return output;
  }
);

  /**
   * Logical Flow Checker Tool
   * Checks the logical flow and connections between ideas.
   */
  const checkLogicalFlowTool = ai.defineTool(
  {
    name: 'checkLogicalFlow',
    description: 'Analyzes the logical flow of ideas, identifies weak connections, missing transitions, topic shifts, and repetition.',
    inputSchema: CheckLogicalFlowToolInputSchema,
    outputSchema: CheckLogicalFlowToolOutputSchema,
  },
  async (input: CheckLogicalFlowToolInput): Promise<CheckLogicalFlowToolOutput> => {
    const prompt = ai.definePrompt({
      name: 'logicalFlowCheckerPrompt',
      input: { schema: CheckLogicalFlowToolInputSchema },
      output: { schema: CheckLogicalFlowToolOutputSchema },
      model: await getModel('balanced'),
      prompt: `You are an expert in analyzing logical flow and coherence in writing. Analyze the logical flow of the following text.

Text to analyze:
{{text}}

Analyze:
1. **Flow Score**: Overall logical flow quality (0.0 to 1.0)
2. **Issues**: Identify specific problems:
   - Missing transitions between paragraphs or sections
   - Weak connections between ideas
   - Abrupt topic shifts
   - Unnecessary repetition of ideas

For each issue, provide:
- Issue type (missing_transition, weak_connection, topic_shift, repetition)
- Location in the text (e.g., "Between paragraph 2 and 3", "In the introduction")
- Specific suggestion for improvement

3. **Recommendations**: Provide actionable recommendations to improve logical flow`,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to check logical flow');
    }

    return output;
  }
);

  /**
   * Argument Structure Analyzer Tool
   * Analyzes the structure and strength of arguments in persuasive/academic writing.
   */
  const analyzeArgumentStructureTool = ai.defineTool(
  {
    name: 'analyzeArgumentStructure',
    description: 'Analyzes argument structure in persuasive or academic writing. Identifies thesis, claims, evidence, counterarguments, and evaluates argument strength.',
    inputSchema: AnalyzeArgumentStructureToolInputSchema,
    outputSchema: AnalyzeArgumentStructureToolOutputSchema,
  },
  async (input: AnalyzeArgumentStructureToolInput): Promise<AnalyzeArgumentStructureToolOutput> => {
    const prompt = ai.definePrompt({
      name: 'argumentStructureAnalyzerPrompt',
      input: { schema: AnalyzeArgumentStructureToolInputSchema },
      output: { schema: AnalyzeArgumentStructureToolOutputSchema },
      model: await getModel('balanced'),
      prompt: `You are an expert in analyzing argumentative writing. Analyze the argument structure of the following text.

Text to analyze:
{{text}}

Provide a comprehensive analysis including:

1. **Thesis Identification**:
   - Does the text have a clear thesis statement?
   - What is the thesis? (extract it)

2. **Arguments/Claims**:
   For each main argument/claim, identify:
   - The claim being made
   - Evidence supporting the claim (list all evidence found)
   - Strength of the argument (strong/moderate/weak)

3. **Counterarguments**:
   - List any counterarguments or opposing viewpoints addressed
   - Evaluate how well they are addressed

4. **Conclusion**:
   - Identify the conclusion (if present)
   - Does it effectively summarize and reinforce the thesis?

5. **Overall Strength**:
   - Rate the overall argument strength (strong/moderate/weak)
   - Provide specific suggestions for strengthening the argument`,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to analyze argument structure');
    }

    return output;
  }
);

  // Return all tools
  return {
    analyzeDocumentStructure: analyzeDocumentStructureTool,
    checkLogicalFlow: checkLogicalFlowTool,
    analyzeArgumentStructure: analyzeArgumentStructureTool,
  };
}

// Export individual tools for backward compatibility
export let analyzeDocumentStructureTool: ReturnType<typeof createDocumentStructureTools>['analyzeDocumentStructure'];
export let checkLogicalFlowTool: ReturnType<typeof createDocumentStructureTools>['checkLogicalFlow'];
export let analyzeArgumentStructureTool: ReturnType<typeof createDocumentStructureTools>['analyzeArgumentStructure'];
export let documentStructureTools: ReturnType<typeof createDocumentStructureTools>;
