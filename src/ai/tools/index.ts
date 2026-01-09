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

import type { Genkit } from 'genkit';

// Export all tool schemas
export * from './schemas';

// Import factory functions
import { createGrammarAndStyleTools } from './grammar-and-style';
import { createDocumentStructureTools } from './document-structure';
import { createCitationsAndReferencesTools } from './citations-and-references';
import { createComprehensiveAnalysisTools } from './comprehensive-analysis';
import { createProjectAnalysisTools } from './project-analysis';
import { createDocumentationGenerationTools } from './documentation-generation';
import { createReportingAndMetricsTools } from './reporting-and-metrics';
import { createPromptArchitectTools } from './prompt-architect';
import { createGoogleSearchTools } from './google-search';

// Re-export individual tools and tool groups
export {
  createGrammarAndStyleTools,
  createDocumentStructureTools,
  createCitationsAndReferencesTools,
  createComprehensiveAnalysisTools,
  createProjectAnalysisTools,
  createDocumentationGenerationTools,
  createReportingAndMetricsTools,
  createPromptArchitectTools,
  createGoogleSearchTools,
};

// Export tools from individual modules (will be initialized)
export {
  analyzeToneTool, checkGrammarTool, checkReadabilityTool, grammarAndStyleTools, improveWordChoiceTool
} from './grammar-and-style';

export {
  analyzeArgumentStructureTool, analyzeDocumentStructureTool,
  checkLogicalFlowTool, documentStructureTools
} from './document-structure';

export {
  checkReferencesTool, citationsAndReferencesTools, matchCitationsToReferencesTool, validateCitationsTool
} from './citations-and-references';

export {
  analyzeDocumentQualityTool,
  comprehensiveAnalysisTools
} from './comprehensive-analysis';

export {
  analyzeCodeComplexityTool, analyzeProjectStructureTool,
  extractDependenciesTool, projectAnalysisTools
} from './project-analysis';

export {
  createUserGuideTool, documentationGenerationTools, formatCodeExamplesTool, generateAPIReferenceTool, generateTableOfContentsTool
} from './documentation-generation';

export {
  analyzeGitHistoryTool, calculateProjectMetricsTool, createProgressTimelineTool,
  generateArchitectureDiagramTool, generateStatusReportTool, reportingAndMetricsTools
} from './reporting-and-metrics';

export {
  advancedPromptArchitectTool,
  generatePrompt,
  promptArchitectTools
} from './prompt-architect';

export {
  googleSearchTool,
  googleSearchTools,
  searchWeb,
  searchImages,
  searchMaps,
  searchShopping,
  searchNews
} from './google-search';

// Import tool groups for aggregation
import * as grammarTools from './grammar-and-style';
import * as documentTools from './document-structure';
import * as citationTools from './citations-and-references';
import * as comprehensiveTools from './comprehensive-analysis';
import * as projectTools from './project-analysis';
import * as documentationTools from './documentation-generation';
import * as reportingTools from './reporting-and-metrics';
import * as promptTools from './prompt-architect';
import * as searchTools from './google-search';

/**
 * Initialize all tools with the given AI instance
 * This function must be called after creating the Genkit instance
 */
export function initializeAllTools(ai: Genkit) {
  // Create all tools using factory functions
  const grammar = createGrammarAndStyleTools(ai);
  const document = createDocumentStructureTools(ai);
  const citation = createCitationsAndReferencesTools(ai);
  const comprehensive = createComprehensiveAnalysisTools(ai);
  const project = createProjectAnalysisTools(ai);
  const documentation = createDocumentationGenerationTools(ai);
  const reporting = createReportingAndMetricsTools(ai);
  const prompt = createPromptArchitectTools(ai);
  const search = createGoogleSearchTools(ai);

  // Assign to exported variables
  Object.assign(grammarTools, grammar);
  Object.assign(documentTools, document);
  Object.assign(citationTools, citation);
  Object.assign(comprehensiveTools, comprehensive);
  Object.assign(projectTools, project);
  Object.assign(documentationTools, documentation);
  Object.assign(reportingTools, reporting);
  Object.assign(promptTools, prompt);
  Object.assign(searchTools, search);

  // Update aggregated tool objects
  Object.assign(professionalWritingTools, {
    ...grammar,
    ...document,
    ...citation,
    ...comprehensive,
  });

  Object.assign(projectDocumentationTools, {
    ...project,
    ...documentation,
    ...reporting,
    ...prompt,
  });

  Object.assign(searchAndResearchTools, {
    ...search,
  });

  Object.assign(allTools, {
    ...professionalWritingTools,
    ...projectDocumentationTools,
    ...searchAndResearchTools,
  });
}

/**
 * All professional writing tools organized by category
 */
export const professionalWritingTools: Record<string, any> = {};

/**
 * All project documentation tools
 */
export const projectDocumentationTools: Record<string, any> = {};

/**
 * Search and research tools
 */
export const searchAndResearchTools: Record<string, any> = {};

/**
 * All tools combined
 */
export const allTools: Record<string, any> = {};

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
