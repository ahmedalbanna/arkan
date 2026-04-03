

/**
 * @fileOverview Comprehensive Document Quality Analysis Tool
 *
 * This tool combines all other tools to provide a complete quality assessment
 * of a document, including grammar, structure, citations, and readability.
 */

import { ai, OLLAMA_MODELS } from '../services/Genkit';
import {
  AnalyzeDocumentQualityToolInputSchema,
  AnalyzeDocumentQualityToolOutputSchema,
  type AnalyzeDocumentQualityToolInput,
  type AnalyzeDocumentQualityToolOutput,
} from './schemas';

/**
 * Comprehensive Document Quality Analyzer Tool
 * Provides a complete quality assessment combining grammar, structure, citations, and readability analysis.
 */
export const analyzeDocumentQualityTool = ai.defineTool(
  {
    name: 'analyzeDocumentQuality',
    description: 'Provides comprehensive document quality analysis including grammar, structure, readability, and optionally citations. Returns an overall quality score with detailed breakdowns.',
    inputSchema: AnalyzeDocumentQualityToolInputSchema,
    outputSchema: AnalyzeDocumentQualityToolOutputSchema,
  },
  async (input: AnalyzeDocumentQualityToolInput): Promise<AnalyzeDocumentQualityToolOutput> => {
    const analysisPrompt = `You are an expert document quality analyst. Provide a comprehensive quality assessment of the following document.

Document to analyze:
{{text}}

Document Type: {{documentType}}

Analysis Requirements:
${input.checkGrammar ? '✓ Grammar and Style Analysis' : '✗ Skip Grammar Analysis'}
${input.checkStructure ? '✓ Structure and Coherence Analysis' : '✗ Skip Structure Analysis'}
${input.checkCitations ? `✓ Citation Analysis (${input.citationStyle || 'APA'} style)` : '✗ Skip Citation Analysis'}
✓ Readability Analysis (Always included)

Provide:

1. **Overall Quality Score** (0-100):
   Calculate based on weighted average of enabled checks

2. **Individual Scores** (0-100 each, only for enabled checks):
   ${input.checkGrammar ? '- Grammar Score: Based on error density and severity' : ''}
   ${input.checkStructure ? '- Structure Score: Based on organization, coherence, logical flow' : ''}
   ${input.checkCitations ? '- Citation Score: Based on citation accuracy and completeness' : ''}
   - Readability Score: Based on readability metrics and clarity

3. **Summary**:
   - Strengths: List 3-5 key strengths of the document
   - Weaknesses: List 3-5 main areas needing improvement
   - Priority Improvements: Top 3 most impactful improvements to make

4. **Detailed Analysis** (for each enabled check):
   ${input.checkGrammar ? `
   - Grammar Analysis:
     * Total issues found (categorized by type)
     * Most critical grammar issues
     * Style improvement suggestions
   ` : ''}
   ${input.checkStructure ? `
   - Structure Analysis:
     * Document organization assessment
     * Coherence and flow evaluation
     * Transition quality
     * Recommendations for restructuring
   ` : ''}
   ${input.checkCitations ? `
   - Citation Analysis:
     * Citation formatting issues
     * Missing or incomplete citations
     * Reference list problems
     * Citation-reference mismatches
   ` : ''}
   - Readability Analysis:
     * Readability metrics (Flesch scores, grade level)
     * Sentence and word complexity
     * Suggestions for improving clarity

Provide actionable, specific feedback that will help the writer improve the document.`;

    const prompt = ai.definePrompt({
      name: 'documentQualityAnalyzerPrompt',
      input: { schema: AnalyzeDocumentQualityToolInputSchema },
      output: { schema: AnalyzeDocumentQualityToolOutputSchema },
      model: OLLAMA_MODELS.GEMMA_2B,
      prompt: analysisPrompt,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to analyze document quality');
    }

    return output;
  }
);

// Export the tool
export const comprehensiveAnalysisTools = {
  analyzeDocumentQuality: analyzeDocumentQualityTool,
};
