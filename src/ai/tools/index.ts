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
 * 5. Project Analysis: Structure, dependencies, complexity, git history
 * 6. Documentation Generation: API docs, user guides, code examples, TOC
 * 7. Reporting & Metrics: Metrics calculation, status reports, timelines, diagrams
 * 8. Prompt Architect: Advanced prompt generation for LLMs
 */

// Export all tool schemas
export * from './schemas';

// Export grammar and style tools
export {
  analyzeToneTool, checkGrammarTool, checkReadabilityTool, grammarAndStyleTools, improveWordChoiceTool
} from './grammar-and-style';

// Export document structure tools
export {
  analyzeArgumentStructureTool, analyzeDocumentStructureTool,
  checkLogicalFlowTool, documentStructureTools
} from './document-structure';

// Export citation and reference tools
export {
  checkReferencesTool, citationsAndReferencesTools, matchCitationsToReferencesTool, validateCitationsTool
} from './citations-and-references';

// Export comprehensive analysis tool
export {
  analyzeDocumentQualityTool,
  comprehensiveAnalysisTools
} from './comprehensive-analysis';

// Export project analysis tools
export {
  analyzeCodeComplexityTool, analyzeProjectStructureTool,
  extractDependenciesTool, projectAnalysisTools
} from './project-analysis';

// Export documentation generation tools
export {
  createUserGuideTool, documentationGenerationTools, formatCodeExamplesTool, generateAPIReferenceTool, generateTableOfContentsTool
} from './documentation-generation';

// Export reporting and metrics tools
export {
  analyzeGitHistoryTool, calculateProjectMetricsTool, createProgressTimelineTool,
  generateArchitectureDiagramTool, generateStatusReportTool, reportingAndMetricsTools
} from './reporting-and-metrics';

// Export prompt architect tools
export {
  advancedPromptArchitectTool,
  generatePrompt,
  promptArchitectTools
} from './prompt-architect';

// Export Google search tools
export {
  googleSearchTool,
  googleSearchTools,
  searchWeb,
  searchImages,
  searchMaps,
  searchShopping,
  searchNews
} from './google-search';

// Aggregate all tools for easy registration
import { citationsAndReferencesTools } from './citations-and-references';
import { comprehensiveAnalysisTools } from './comprehensive-analysis';
import { documentStructureTools } from './document-structure';
import { documentationGenerationTools } from './documentation-generation';
import { grammarAndStyleTools } from './grammar-and-style';
import { projectAnalysisTools } from './project-analysis';
import { promptArchitectTools } from './prompt-architect';
import { reportingAndMetricsTools } from './reporting-and-metrics';
import { googleSearchTools } from './google-search';

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
 * All project documentation tools
 */
export const projectDocumentationTools = {
  // Project Analysis (4 tools)
  ...projectAnalysisTools,

  // Documentation Generation (4 tools)
  ...documentationGenerationTools,

  // Reporting & Metrics (4 tools)
  ...reportingAndMetricsTools,

  // Prompt Architect (1 tool)
  ...promptArchitectTools,
};

/**
 * Search and research tools
 */
export const searchAndResearchTools = {
  // Google Search (1 tool)
  ...googleSearchTools,
};

/**
 * All tools combined
 */
export const allTools = {
  ...professionalWritingTools,
  ...projectDocumentationTools,
  ...searchAndResearchTools,
};

/**
 * Get a list of all available tool names
 */
export function getAvailableToolNames(): string[] {
  return Object.keys(allTools);
}

/**
 * Get a specific tool by name
 */
export function getToolByName(name: string) {
  return (allTools as any)[name as keyof typeof allTools];
}

// Default export for convenience
export default allTools;
