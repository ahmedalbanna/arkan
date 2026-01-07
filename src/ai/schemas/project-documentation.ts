/**
 * @fileOverview Project Documentation System Schemas
 * 
 * Comprehensive type definitions for automated project documentation,
 * reporting, and presentation generation system.
 */

import { z } from 'genkit';

// ==================== ENUMS & TYPES ====================

/**
 * Formality level for generated content
 */
export const FormalityLevelSchema = z.enum([
  'Informal',
  'Balanced',
  'Very Formal'
]);
export type FormalityLevel = z.infer<typeof FormalityLevelSchema>;

/**
 * Output format types for documentation
 */
export const OutputFormatTypeSchema = z.enum([
  'heading',
  'paragraph',
  'list',
  'table',
  'code',
  'diagram',
  'math',
  'citation'
]);
export type OutputFormatType = z.infer<typeof OutputFormatTypeSchema>;

/**
 * Reasoning frameworks for AI generation
 */
export const ReasoningFrameworkSchema = z.enum([
  'Standard',
  'Chain of Thought',
  'Step-by-Step',
  'First Principles',
  'Socratic'
]);
export type ReasoningFramework = z.infer<typeof ReasoningFrameworkSchema>;

/**
 * Target audience expertise levels
 */
export const AudienceLevelSchema = z.enum([
  'Beginner',
  'Student',
  'Professional',
  'Expert/Researcher',
  'Executive'
]);
export type AudienceLevel = z.infer<typeof AudienceLevelSchema>;

/**
 * Developer/author seniority levels
 */
export const SeniorityLevelSchema = z.enum([
  'Junior',
  'Mid-Level',
  'Senior',
  'Principal/Expert',
  'Strategic Lead'
]);
export type SeniorityLevel = z.infer<typeof SeniorityLevelSchema>;

/**
 * Analysis depth levels
 */
export const AnalysisDepthSchema = z.enum([
  'Surface',
  'Comprehensive',
  'Deep-Dive',
  'Atomic/Extremely Detailed'
]);
export type AnalysisDepth = z.infer<typeof AnalysisDepthSchema>;

/**
 * Communication styles
 */
export const CommunicationStyleSchema = z.enum([
  'Direct',
  'Narrative',
  'Technical',
  'Persuasive'
]);
export type CommunicationStyle = z.infer<typeof CommunicationStyleSchema>;

/**
 * Knowledge handling modes
 */
export const KnowledgeHandlingSchema = z.enum([
  'Standard',
  'Strict (No Hallucination)',
  'Creative Synthesis'
]);
export type KnowledgeHandling = z.infer<typeof KnowledgeHandlingSchema>;

/**
 * Documentation template types
 */
export const DocumentTemplateTypeSchema = z.enum([
  'technical',
  'business',
  'academic',
  'minimal',
  'comprehensive'
]);
export type DocumentTemplateType = z.infer<typeof DocumentTemplateTypeSchema>;

/**
 * Project types
 */
export const ProjectTypeSchema = z.enum([
  'web_application',
  'mobile_app',
  'library',
  'api',
  'cli_tool',
  'desktop_app',
  'microservice',
  'monorepo',
  'other'
]);
export type ProjectType = z.infer<typeof ProjectTypeSchema>;

/**
 * Diagram types for architecture visualization
 */
export const DiagramTypeSchema = z.enum([
  'flowchart',
  'sequence',
  'class',
  'er',
  'state',
  'gantt',
  'architecture',
  'component'
]);
export type DiagramType = z.infer<typeof DiagramTypeSchema>;

/**
 * Citation styles
 */
export const CitationStyleSchema = z.enum([
  'APA',
  'MLA',
  'Chicago',
  'Harvard',
  'IEEE'
]);
export type CitationStyle = z.infer<typeof CitationStyleSchema>;

/**
 * Report period types
 */
export const ReportPeriodSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'custom'
]);
export type ReportPeriod = z.infer<typeof ReportPeriodSchema>;

/**
 * Presentation types
 */
export const PresentationTypeSchema = z.enum([
  'demo',
  'pitch',
  'technical_review',
  'status_update',
  'training',
  'conference'
]);
export type PresentationType = z.infer<typeof PresentationTypeSchema>;

// ==================== PROJECT DATA SCHEMA ====================

/**
 * Comprehensive project data for prompt generation
 */
export const ProjectDataSchema = z.object({
  // Basic Information
  projectName: z.string().describe('Name of the project'),
  projectDescription: z.string().describe('Detailed description of the project'),
  projectUrl: z.string().url().optional().describe('Project repository or website URL'),
  projectPath: z.string().optional().describe('Local file system path to the project'),
  projectType: ProjectTypeSchema.optional().describe('Type of project'),
  
  // Documentation Settings
  documentType: z.string().describe('Type of document to generate'),
  specialization: z.string().optional().describe('Technical specialization or domain'),
  educationalLevel: z.string().optional().describe('Educational context if applicable'),
  university: z.string().optional().describe('University affiliation if applicable'),
  citationStyle: CitationStyleSchema.optional().describe('Citation format to use'),
  language: z.string().default('en').describe('Output language (ISO code)'),
  
  // Quality & Complexity
  complexity: z.number().min(0).max(100).default(50).describe('Complexity level (0-100)'),
  behaviors: z.array(z.string()).default([]).describe('AI behavioral guidelines'),
  mandatoryRules: z.array(z.string()).default([]).describe('Required rules to follow'),
  constraints: z.array(z.string()).default([]).describe('Things to avoid'),
  
  // Style & Tone
  formality: FormalityLevelSchema.default('Balanced').describe('Formality level'),
  tone: z.string().default('professional').describe('Overall tone of content'),
  communicationStyle: CommunicationStyleSchema.default('Technical').describe('Communication approach'),
  
  // Output Configuration
  outputFormats: z.array(OutputFormatTypeSchema).default(['heading', 'paragraph']).describe('Desired output formats'),
  includedTopics: z.string().optional().describe('Topics that must be covered'),
  tableCaption: z.string().optional().describe('Caption for tables'),
  programmingLanguage: z.string().optional().describe('Programming language for code examples'),
  diagramType: DiagramTypeSchema.optional().describe('Type of diagrams to include'),
  wordCount: z.string().optional().describe('Target word count or length'),
  
  // Advanced Settings
  customGuidelines: z.string().optional().describe('Additional custom instructions'),
  audienceLevel: AudienceLevelSchema.default('Professional').describe('Target audience expertise'),
  reasoningFramework: ReasoningFrameworkSchema.default('Standard').describe('AI reasoning approach'),
  outputVerification: z.boolean().default(true).describe('Enable output quality verification'),
  successCriteria: z.string().optional().describe('Criteria for successful output'),
  knowledgeHandling: KnowledgeHandlingSchema.default('Standard').describe('Knowledge synthesis approach'),
  seniorityLevel: SeniorityLevelSchema.default('Senior').describe('Expertise level to emulate'),
  analysisDepth: AnalysisDepthSchema.default('Comprehensive').describe('Depth of analysis'),
  logicalFallacyCheck: z.boolean().default(false).describe('Check for logical fallacies'),
  toolLibraryGuidance: z.string().optional().describe('Specific tool/library instructions'),
  
  // Template
  template: DocumentTemplateTypeSchema.optional().describe('Documentation template to use'),
});
export type ProjectData = z.infer<typeof ProjectDataSchema>;

/**
 * Generated prompt output
 */
export const GeneratedPromptSchema = z.object({
  systemInstructions: z.string().describe('System-level instructions for the AI'),
  userPrompt: z.string().describe('User-facing prompt'),
  metadata: z.object({
    generatedAt: z.string().describe('ISO timestamp'),
    version: z.string().describe('Prompt version'),
    estimatedTokens: z.number().optional().describe('Estimated token count'),
  }).optional(),
});
export type GeneratedPrompt = z.infer<typeof GeneratedPromptSchema>;

// ==================== PROJECT ANALYSIS SCHEMAS ====================

/**
 * Project structure analysis result
 */
export const ProjectStructureSchema = z.object({
  rootPath: z.string(),
  totalFiles: z.number(),
  totalDirectories: z.number(),
  filesByExtension: z.record(z.number()),
  mainDirectories: z.array(z.object({
    name: z.string(),
    path: z.string(),
    fileCount: z.number(),
    purpose: z.string().optional(),
  })),
  entryPoints: z.array(z.string()),
  configFiles: z.array(z.string()),
  projectType: ProjectTypeSchema,
});
export type ProjectStructure = z.infer<typeof ProjectStructureSchema>;

/**
 * Dependency analysis result
 */
export const DependencyAnalysisSchema = z.object({
  packageManager: z.enum(['npm', 'yarn', 'pnpm', 'bun', 'unknown']),
  dependencies: z.record(z.string()),
  devDependencies: z.record(z.string()),
  peerDependencies: z.record(z.string()).optional(),
  totalDependencies: z.number(),
  outdatedDependencies: z.array(z.object({
    name: z.string(),
    current: z.string(),
    latest: z.string(),
  })).optional(),
  categories: z.object({
    ui: z.array(z.string()),
    testing: z.array(z.string()),
    build: z.array(z.string()),
    database: z.array(z.string()),
    api: z.array(z.string()),
    other: z.array(z.string()),
  }),
});
export type DependencyAnalysis = z.infer<typeof DependencyAnalysisSchema>;

/**
 * Code complexity metrics
 */
export const CodeComplexitySchema = z.object({
  linesOfCode: z.number(),
  codeLines: z.number(),
  commentLines: z.number(),
  blankLines: z.number(),
  fileCount: z.number(),
  averageLinesPerFile: z.number(),
  complexity: z.object({
    cyclomatic: z.number().optional(),
    cognitive: z.number().optional(),
    halstead: z.object({
      volume: z.number(),
      difficulty: z.number(),
      effort: z.number(),
    }).optional(),
  }),
  fileComplexity: z.array(z.object({
    file: z.string(),
    lines: z.number(),
    complexity: z.number(),
  })),
  maintainabilityIndex: z.number().optional(),
});
export type CodeComplexity = z.infer<typeof CodeComplexitySchema>;

/**
 * Git history analysis
 */
export const GitHistorySchema = z.object({
  totalCommits: z.number(),
  contributors: z.array(z.object({
    name: z.string(),
    email: z.string(),
    commits: z.number(),
    linesAdded: z.number(),
    linesDeleted: z.number(),
  })),
  commitFrequency: z.object({
    daily: z.number(),
    weekly: z.number(),
    monthly: z.number(),
  }),
  recentCommits: z.array(z.object({
    hash: z.string(),
    author: z.string(),
    date: z.string(),
    message: z.string(),
    filesChanged: z.number(),
  })),
  branches: z.array(z.string()),
  tags: z.array(z.string()),
  firstCommit: z.string().optional(),
  lastCommit: z.string().optional(),
});
export type GitHistory = z.infer<typeof GitHistorySchema>;

/**
 * Project metrics summary
 */
export const ProjectMetricsSchema = z.object({
  general: z.object({
    projectAge: z.string(),
    lastUpdated: z.string(),
    activeContributors: z.number(),
    totalCommits: z.number(),
  }),
  code: z.object({
    linesOfCode: z.number(),
    fileCount: z.number(),
    testCoverage: z.number().optional(),
    documentationCoverage: z.number().optional(),
  }),
  quality: z.object({
    maintainabilityIndex: z.number().optional(),
    technicalDebt: z.string().optional(),
    codeSmells: z.number().optional(),
    securityIssues: z.number().optional(),
  }),
  activity: z.object({
    commitsLastWeek: z.number(),
    commitsLastMonth: z.number(),
    averageCommitSize: z.number(),
    mergeRequestsOpen: z.number().optional(),
  }),
});
export type ProjectMetrics = z.infer<typeof ProjectMetricsSchema>;

// ==================== DOCUMENTATION OUTPUT SCHEMAS ====================

/**
 * README generation output
 */
export const ReadmeOutputSchema = z.object({
  title: z.string(),
  badges: z.array(z.string()),
  description: z.string(),
  features: z.array(z.string()),
  installation: z.string(),
  usage: z.string(),
  apiReference: z.string().optional(),
  examples: z.string().optional(),
  contributing: z.string().optional(),
  license: z.string().optional(),
  acknowledgments: z.array(z.string()).optional(),
  fullContent: z.string().describe('Complete README.md content'),
});
export type ReadmeOutput = z.infer<typeof ReadmeOutputSchema>;

/**
 * API documentation output
 */
export const ApiDocumentationSchema = z.object({
  title: z.string(),
  version: z.string(),
  baseUrl: z.string().optional(),
  authentication: z.string().optional(),
  endpoints: z.array(z.object({
    method: z.string(),
    path: z.string(),
    description: z.string(),
    parameters: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string(),
    })),
    responses: z.array(z.object({
      status: z.number(),
      description: z.string(),
      example: z.string().optional(),
    })),
    example: z.string().optional(),
  })),
  fullContent: z.string(),
});
export type ApiDocumentation = z.infer<typeof ApiDocumentationSchema>;

/**
 * Technical specification output
 */
export const TechnicalSpecificationSchema = z.object({
  title: z.string(),
  overview: z.string(),
  architecture: z.object({
    description: z.string(),
    diagram: z.string().optional(),
    components: z.array(z.object({
      name: z.string(),
      description: z.string(),
      responsibilities: z.array(z.string()),
    })),
  }),
  technicalStack: z.object({
    frontend: z.array(z.string()).optional(),
    backend: z.array(z.string()).optional(),
    database: z.array(z.string()).optional(),
    infrastructure: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
  }),
  dataModels: z.array(z.object({
    name: z.string(),
    description: z.string(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      description: z.string(),
    })),
  })),
  apiDesign: z.string().optional(),
  securityConsiderations: z.array(z.string()),
  performanceRequirements: z.array(z.string()),
  scalabilityStrategy: z.string().optional(),
  fullContent: z.string(),
});
export type TechnicalSpecification = z.infer<typeof TechnicalSpecificationSchema>;

/**
 * Project report output
 */
export const ProjectReportSchema = z.object({
  reportTitle: z.string(),
  reportPeriod: z.string(),
  executiveSummary: z.string(),
  metrics: ProjectMetricsSchema,
  achievements: z.array(z.string()),
  challenges: z.array(z.string()),
  roadmap: z.array(z.object({
    milestone: z.string(),
    status: z.enum(['completed', 'in_progress', 'planned', 'delayed']),
    dueDate: z.string().optional(),
    description: z.string(),
  })),
  teamActivity: z.object({
    activeMembers: z.number(),
    contributions: z.array(z.object({
      member: z.string(),
      commits: z.number(),
      linesChanged: z.number(),
    })),
  }),
  recommendations: z.array(z.string()),
  fullContent: z.string(),
});
export type ProjectReport = z.infer<typeof ProjectReportSchema>;

/**
 * Presentation content output
 */
export const PresentationContentSchema = z.object({
  title: z.string(),
  presentationType: PresentationTypeSchema,
  duration: z.number().describe('Duration in minutes'),
  slides: z.array(z.object({
    slideNumber: z.number(),
    title: z.string(),
    content: z.string(),
    speakerNotes: z.string().optional(),
    visualSuggestion: z.string().optional(),
  })),
  keyTakeaways: z.array(z.string()),
  fullContent: z.string(),
});
export type PresentationContent = z.infer<typeof PresentationContentSchema>;

/**
 * Changelog output
 */
export const ChangelogSchema = z.object({
  version: z.string(),
  sections: z.array(z.object({
    version: z.string(),
    date: z.string(),
    changes: z.object({
      added: z.array(z.string()),
      changed: z.array(z.string()),
      deprecated: z.array(z.string()),
      removed: z.array(z.string()),
      fixed: z.array(z.string()),
      security: z.array(z.string()),
    }),
  })),
  fullContent: z.string(),
});
export type Changelog = z.infer<typeof ChangelogSchema>;

// Export all schemas for barrel import
export const projectDocumentationSchemas = {
  // Enums
  FormalityLevelSchema,
  OutputFormatTypeSchema,
  ReasoningFrameworkSchema,
  AudienceLevelSchema,
  SeniorityLevelSchema,
  AnalysisDepthSchema,
  CommunicationStyleSchema,
  KnowledgeHandlingSchema,
  DocumentTemplateTypeSchema,
  ProjectTypeSchema,
  DiagramTypeSchema,
  CitationStyleSchema,
  ReportPeriodSchema,
  PresentationTypeSchema,
  
  // Input Schemas
  ProjectDataSchema,
  
  // Analysis Schemas
  ProjectStructureSchema,
  DependencyAnalysisSchema,
  CodeComplexitySchema,
  GitHistorySchema,
  ProjectMetricsSchema,
  
  // Output Schemas
  GeneratedPromptSchema,
  ReadmeOutputSchema,
  ApiDocumentationSchema,
  TechnicalSpecificationSchema,
  ProjectReportSchema,
  PresentationContentSchema,
  ChangelogSchema,
};
