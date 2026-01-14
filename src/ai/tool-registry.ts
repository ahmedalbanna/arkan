/**
 * Tool Registry Integration Layer
 * 
 * Provides a unified interface for registering and accessing tools
 * across the dynamic flow system. Integrates built-in tools from
 * src/ai/tools with the database-backed tool registry service.
 */

import { toolRegistryService, registerBuiltinTool } from '@/services/tool-registry-service';
import { BuiltinToolMetadata } from '@/lib/models/tool-config';
import * as tools from '@/ai/tools';

/**
 * Initialize the tool registry with all built-in tools
 */
export async function initializeToolRegistry(): Promise<void> {
  console.log('Initializing tool registry...');

  // Register all built-in tools
  await registerBuiltinTools();

  console.log('Tool registry initialization complete');
}

/**
 * Register all built-in tools from src/ai/tools
 */
async function registerBuiltinTools(): Promise<void> {
  const registeredTools: string[] = [];

  // Grammar & Style Tools
  registerGrammarAndStyleTools(registeredTools);

  // Document Structure Tools
  registerDocumentStructureTools(registeredTools);

  // Citations & References Tools
  registerCitationsAndReferencesTools(registeredTools);

  // Comprehensive Analysis Tools
  registerComprehensiveAnalysisTools(registeredTools);

  // Project Analysis Tools
  registerProjectAnalysisTools(registeredTools);

  // Documentation Generation Tools
  registerDocumentationGenerationTools(registeredTools);

  // Reporting & Metrics Tools
  registerReportingAndMetricsTools(registeredTools);

  // Prompt Architect Tools
  registerPromptArchitectTools(registeredTools);

  // Search & Research Tools
  registerSearchAndResearchTools(registeredTools);

  console.log(`Registered ${registeredTools.length} built-in tools:`, registeredTools);
}

/**
 * Register Grammar & Style Tools
 */
function registerGrammarAndStyleTools(registered: string[]): void {
  // Check Grammar Tool
  if (tools.checkGrammarTool) {
    registerBuiltinTool({
      name: 'checkGrammar',
      displayName: 'Grammar Checker',
      description: 'Analyzes text for grammatical errors, spelling mistakes, and punctuation issues',
      category: 'grammar-style',
      handler: async (params: any) => tools.checkGrammarTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to check for grammar errors' },
        },
        required: ['text'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          errors: { type: 'array', items: { type: 'object' } },
          score: { type: 'number' },
          suggestions: { type: 'array', items: { type: 'string' } },
        },
      },
      examples: [
        {
          id: 'grammar-example-1',
          name: 'Check basic grammar',
          input: { text: 'She go to the store yesterday.' },
          expectedOutput: {
            errors: [{ message: 'Subject-verb agreement error', position: 4 }],
            score: 0.7,
            suggestions: ['She went to the store yesterday.'],
          },
        },
      ],
    });
    registered.push('checkGrammar');
  }

  // Analyze Tone Tool
  if (tools.analyzeToneTool) {
    registerBuiltinTool({
      name: 'analyzeTone',
      displayName: 'Tone Analyzer',
      description: 'Analyzes the tone and sentiment of text',
      category: 'grammar-style',
      handler: async (params: any) => tools.analyzeToneTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to analyze' },
        },
        required: ['text'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          tone: { type: 'string' },
          sentiment: { type: 'string' },
          confidence: { type: 'number' },
        },
      },
    });
    registered.push('analyzeTone');
  }

  // Check Readability Tool
  if (tools.checkReadabilityTool) {
    registerBuiltinTool({
      name: 'checkReadability',
      displayName: 'Readability Checker',
      description: 'Analyzes text readability and complexity',
      category: 'grammar-style',
      handler: async (params: any) => tools.checkReadabilityTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to analyze' },
        },
        required: ['text'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          grade: { type: 'string' },
          suggestions: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    registered.push('checkReadability');
  }

  // Improve Word Choice Tool
  if (tools.improveWordChoiceTool) {
    registerBuiltinTool({
      name: 'improveWordChoice',
      displayName: 'Word Choice Improver',
      description: 'Suggests better word choices for improved clarity and impact',
      category: 'grammar-style',
      handler: async (params: any) => tools.improveWordChoiceTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to improve' },
        },
        required: ['text'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          suggestions: { type: 'array', items: { type: 'object' } },
        },
      },
    });
    registered.push('improveWordChoice');
  }
}

/**
 * Register Document Structure Tools
 */
function registerDocumentStructureTools(registered: string[]): void {
  if (tools.analyzeDocumentStructureTool) {
    registerBuiltinTool({
      name: 'analyzeDocumentStructure',
      displayName: 'Document Structure Analyzer',
      description: 'Analyzes the structure and organization of a document',
      category: 'document-structure',
      handler: async (params: any) => tools.analyzeDocumentStructureTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          document: { type: 'string', description: 'Document content to analyze' },
        },
        required: ['document'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          structure: { type: 'object' },
          issues: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    registered.push('analyzeDocumentStructure');
  }

  if (tools.checkLogicalFlowTool) {
    registerBuiltinTool({
      name: 'checkLogicalFlow',
      displayName: 'Logical Flow Checker',
      description: 'Checks the logical flow and coherence of arguments',
      category: 'document-structure',
      handler: async (params: any) => tools.checkLogicalFlowTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to analyze' },
        },
        required: ['text'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          issues: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    registered.push('checkLogicalFlow');
  }

  if (tools.analyzeArgumentStructureTool) {
    registerBuiltinTool({
      name: 'analyzeArgumentStructure',
      displayName: 'Argument Structure Analyzer',
      description: 'Analyzes the structure and validity of arguments',
      category: 'document-structure',
      handler: async (params: any) => tools.analyzeArgumentStructureTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Argument text to analyze' },
        },
        required: ['text'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          claims: { type: 'array', items: { type: 'string' } },
          evidence: { type: 'array', items: { type: 'string' } },
          strength: { type: 'number' },
        },
      },
    });
    registered.push('analyzeArgumentStructure');
  }
}

/**
 * Register Citations & References Tools
 */
function registerCitationsAndReferencesTools(registered: string[]): void {
  if (tools.validateCitationsTool) {
    registerBuiltinTool({
      name: 'validateCitations',
      displayName: 'Citation Validator',
      description: 'Validates citations for format and completeness',
      category: 'citations-references',
      handler: async (params: any) => tools.validateCitationsTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          citations: { type: 'array', items: { type: 'string' } },
          style: { type: 'string', enum: ['APA', 'MLA', 'Chicago', 'Harvard'] },
        },
        required: ['citations'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          valid: { type: 'boolean' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
    });
    registered.push('validateCitations');
  }

  if (tools.checkReferencesTool) {
    registerBuiltinTool({
      name: 'checkReferences',
      displayName: 'Reference Checker',
      description: 'Checks references for completeness and accuracy',
      category: 'citations-references',
      handler: async (params: any) => tools.checkReferencesTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          references: { type: 'array', items: { type: 'string' } },
        },
        required: ['references'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          valid: { type: 'boolean' },
          issues: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    registered.push('checkReferences');
  }

  if (tools.matchCitationsToReferencesTool) {
    registerBuiltinTool({
      name: 'matchCitationsToReferences',
      displayName: 'Citation-Reference Matcher',
      description: 'Matches in-text citations to reference list entries',
      category: 'citations-references',
      handler: async (params: any) => tools.matchCitationsToReferencesTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          citations: { type: 'array', items: { type: 'string' } },
          references: { type: 'array', items: { type: 'string' } },
        },
        required: ['citations', 'references'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          matched: { type: 'array', items: { type: 'object' } },
          unmatched: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    registered.push('matchCitationsToReferences');
  }
}

/**
 * Register Comprehensive Analysis Tools
 */
function registerComprehensiveAnalysisTools(registered: string[]): void {
  if (tools.analyzeDocumentQualityTool) {
    registerBuiltinTool({
      name: 'analyzeDocumentQuality',
      displayName: 'Document Quality Analyzer',
      description: 'Performs comprehensive quality analysis of a document',
      category: 'analysis',
      handler: async (params: any) => tools.analyzeDocumentQualityTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          document: { type: 'string', description: 'Document to analyze' },
          criteria: { type: 'array', items: { type: 'string' } },
        },
        required: ['document'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          overallScore: { type: 'number' },
          scores: { type: 'object' },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    registered.push('analyzeDocumentQuality');
  }
}

/**
 * Register Project Analysis Tools
 */
function registerProjectAnalysisTools(registered: string[]): void {
  if (tools.analyzeProjectStructureTool) {
    registerBuiltinTool({
      name: 'analyzeProjectStructure',
      displayName: 'Project Structure Analyzer',
      description: 'Analyzes the structure and organization of a project',
      category: 'project-analysis',
      handler: async (params: any) => tools.analyzeProjectStructureTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: { type: 'string', description: 'Path to project' },
        },
        required: ['projectPath'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          structure: { type: 'object' },
          metrics: { type: 'object' },
        },
      },
    });
    registered.push('analyzeProjectStructure');
  }

  if (tools.analyzeCodeComplexityTool) {
    registerBuiltinTool({
      name: 'analyzeCodeComplexity',
      displayName: 'Code Complexity Analyzer',
      description: 'Analyzes code complexity metrics',
      category: 'project-analysis',
      handler: async (params: any) => tools.analyzeCodeComplexityTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Code to analyze' },
          language: { type: 'string', description: 'Programming language' },
        },
        required: ['code'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          complexity: { type: 'number' },
          metrics: { type: 'object' },
        },
      },
    });
    registered.push('analyzeCodeComplexity');
  }

  if (tools.extractDependenciesTool) {
    registerBuiltinTool({
      name: 'extractDependencies',
      displayName: 'Dependency Extractor',
      description: 'Extracts and analyzes project dependencies',
      category: 'project-analysis',
      handler: async (params: any) => tools.extractDependenciesTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: { type: 'string', description: 'Path to project' },
        },
        required: ['projectPath'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          dependencies: { type: 'array', items: { type: 'string' } },
          graph: { type: 'object' },
        },
      },
    });
    registered.push('extractDependencies');
  }
}

/**
 * Register Documentation Generation Tools
 */
function registerDocumentationGenerationTools(registered: string[]): void {
  if (tools.generateAPIReferenceTool) {
    registerBuiltinTool({
      name: 'generateAPIReference',
      displayName: 'API Reference Generator',
      description: 'Generates API reference documentation',
      category: 'documentation',
      handler: async (params: any) => tools.generateAPIReferenceTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Code to document' },
          format: { type: 'string', enum: ['markdown', 'html', 'json'] },
        },
        required: ['code'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          documentation: { type: 'string' },
          format: { type: 'string' },
        },
      },
    });
    registered.push('generateAPIReference');
  }

  if (tools.createUserGuideTool) {
    registerBuiltinTool({
      name: 'createUserGuide',
      displayName: 'User Guide Creator',
      description: 'Creates user guides and tutorials',
      category: 'documentation',
      handler: async (params: any) => tools.createUserGuideTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Topic for the guide' },
          audience: { type: 'string', description: 'Target audience' },
        },
        required: ['topic'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          guide: { type: 'string' },
        },
      },
    });
    registered.push('createUserGuide');
  }

  if (tools.formatCodeExamplesTool) {
    registerBuiltinTool({
      name: 'formatCodeExamples',
      displayName: 'Code Example Formatter',
      description: 'Formats code examples for documentation',
      category: 'documentation',
      handler: async (params: any) => tools.formatCodeExamplesTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Code to format' },
          language: { type: 'string', description: 'Programming language' },
        },
        required: ['code'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          formatted: { type: 'string' },
        },
      },
    });
    registered.push('formatCodeExamples');
  }

  if (tools.generateTableOfContentsTool) {
    registerBuiltinTool({
      name: 'generateTableOfContents',
      displayName: 'Table of Contents Generator',
      description: 'Generates table of contents from document',
      category: 'documentation',
      handler: async (params: any) => tools.generateTableOfContentsTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          document: { type: 'string', description: 'Document content' },
          maxDepth: { type: 'number', description: 'Maximum heading depth' },
        },
        required: ['document'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          toc: { type: 'string' },
          entries: { type: 'array', items: { type: 'object' } },
        },
      },
    });
    registered.push('generateTableOfContents');
  }
}

/**
 * Register Reporting & Metrics Tools
 */
function registerReportingAndMetricsTools(registered: string[]): void {
  if (tools.calculateProjectMetricsTool) {
    registerBuiltinTool({
      name: 'calculateProjectMetrics',
      displayName: 'Project Metrics Calculator',
      description: 'Calculates project metrics and statistics',
      category: 'reporting',
      handler: async (params: any) => tools.calculateProjectMetricsTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: { type: 'string', description: 'Path to project' },
        },
        required: ['projectPath'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          metrics: { type: 'object' },
        },
      },
    });
    registered.push('calculateProjectMetrics');
  }

  if (tools.generateStatusReportTool) {
    registerBuiltinTool({
      name: 'generateStatusReport',
      displayName: 'Status Report Generator',
      description: 'Generates project status reports',
      category: 'reporting',
      handler: async (params: any) => tools.generateStatusReportTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          data: { type: 'object', description: 'Project data' },
          format: { type: 'string', enum: ['markdown', 'html', 'pdf'] },
        },
        required: ['data'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          report: { type: 'string' },
        },
      },
    });
    registered.push('generateStatusReport');
  }

  if (tools.createProgressTimelineTool) {
    registerBuiltinTool({
      name: 'createProgressTimeline',
      displayName: 'Progress Timeline Creator',
      description: 'Creates visual progress timelines',
      category: 'reporting',
      handler: async (params: any) => tools.createProgressTimelineTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          events: { type: 'array', items: { type: 'object' } },
        },
        required: ['events'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          timeline: { type: 'string' },
        },
      },
    });
    registered.push('createProgressTimeline');
  }

  if (tools.generateArchitectureDiagramTool) {
    registerBuiltinTool({
      name: 'generateArchitectureDiagram',
      displayName: 'Architecture Diagram Generator',
      description: 'Generates architecture diagrams from project structure',
      category: 'reporting',
      handler: async (params: any) => tools.generateArchitectureDiagramTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          structure: { type: 'object', description: 'Project structure data' },
          format: { type: 'string', enum: ['plantuml', 'mermaid', 'graphviz'] },
        },
        required: ['structure'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          diagram: { type: 'string' },
        },
      },
    });
    registered.push('generateArchitectureDiagram');
  }
}

/**
 * Register Prompt Architect Tools
 */
function registerPromptArchitectTools(registered: string[]): void {
  if (tools.advancedPromptArchitectTool) {
    registerBuiltinTool({
      name: 'advancedPromptArchitect',
      displayName: 'Advanced Prompt Architect',
      description: 'Generates advanced prompts for LLM interactions',
      category: 'prompt-engineering',
      handler: async (params: any) => tools.advancedPromptArchitectTool.call(params),
      inputSchema: {
        type: 'object',
        properties: {
          task: { type: 'string', description: 'Task description' },
          context: { type: 'string', description: 'Additional context' },
          style: { type: 'string', description: 'Desired output style' },
        },
        required: ['task'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    });
    registered.push('advancedPromptArchitect');
  }
}

/**
 * Register Search & Research Tools
 */
function registerSearchAndResearchTools(registered: string[]): void {
  // Google search tool is not yet implemented
  // Will be added when googleSearchTool is exported from @/ai/tools
  console.log('Search tools registration - googleSearchTool not yet available');
}

/**
 * Get list of all registered tool names
 */
export function getRegisteredToolNames(): string[] {
  return tools.getAvailableToolNames();
}

/**
 * Get a tool by name (convenience wrapper)
 */
export async function getTool(toolName: string) {
  return toolRegistryService.getToolByName(toolName);
}

/**
 * Export the service for direct access
 */
export { toolRegistryService };
export default toolRegistryService;
