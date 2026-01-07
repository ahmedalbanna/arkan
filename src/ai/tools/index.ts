/**
 * @fileOverview Professional Writing Tools for Genkit
 * 
 * This module exports all professional writing tools that can be used
 * standalone or integrated with AI flows.
 * 
 * Tool Categories:
 * 1. Grammar & Style: Grammar checking, tone analysis, readability, word choice
 * 2. Document Structure: Structure analysis, logical flow, argument analysis
 * 3. Citations & References: Citation validation, reference checking, matching
 * 4. Comprehensive Analysis: Complete document quality assessment
 */

// Export all tool schemas
export * from './schemas';

// Export grammar and style tools
export {
  checkGrammarTool,
  analyzeToneTool,
  checkReadabilityTool,
  improveWordChoiceTool,
  grammarAndStyleTools,
} from './grammar-and-style';

// Export document structure tools
export {
  analyzeDocumentStructureTool,
  checkLogicalFlowTool,
  analyzeArgumentStructureTool,
  documentStructureTools,
} from './document-structure';

// Export citation and reference tools
export {
  validateCitationsTool,
  checkReferencesTool,
  matchCitationsToReferencesTool,
  citationsAndReferencesTools,
} from './citations-and-references';

// Export comprehensive analysis tool
export {
  analyzeDocumentQualityTool,
  comprehensiveAnalysisTools,
} from './comprehensive-analysis';

// Aggregate all tools for easy registration
import { grammarAndStyleTools } from './grammar-and-style';
import { documentStructureTools } from './document-structure';
import { citationsAndReferencesTools } from './citations-and-references';
import { comprehensiveAnalysisTools } from './comprehensive-analysis';

/**
 * All professional writing tools organized by category
 */
export const professionalWritingTools = {
  // Grammar & Style (4 tools)
  ...grammarAndStyleTools,
  
  // Document Structure (3 tools)
  ...documentStructureTools,
  
  // Citations & References (3 tools)
  ...citationsAndReferencesTools,
  
  // Comprehensive Analysis (1 tool)
  ...comprehensiveAnalysisTools,
};

/**
 * Get a list of all available tool names
 */
export function getAvailableToolNames(): string[] {
  return Object.keys(professionalWritingTools);
}

/**
 * Get a specific tool by name
 */
export function getToolByName(name: string) {
  return (professionalWritingTools as any)[name as keyof typeof professionalWritingTools];
}

// Default export for convenience
export default professionalWritingTools;
